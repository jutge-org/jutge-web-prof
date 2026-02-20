'use client'

import { BotIcon, ClipboardCopyIcon, EditIcon, SendIcon, UserIcon } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import Page from '@/components/layout/Page'
import { Button } from '@/components/ui/button'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Textarea } from '@/components/ui/textarea'
import Markdown from '@/components/wrappers/Markdown'
import jutge from '@/lib/jutge'
import type { ChatMessage } from '@/lib/jutge_api_client'

const USAGE_JSON_START = '---USAGE_JSON_START---'
const USAGE_JSON_END = '---USAGE_JSON_END---'

type UiMessage = { role: 'user' | 'assistant' | 'system'; content: string }

export default function JutgeAIChatPage() {
    return (
        <Page
            pageContext={{
                title: 'JutgeAI Chat',
                menu: 'user',
                current: 'jutgeai',
                subTitle: 'JutgeAI',
                subMenu: 'jutgeai',
                subCurrent: 'chat',
            }}
        >
            <JutgeAIChatView />
        </Page>
    )
}

function JutgeAIChatView() {
    const [models, setModels] = useState<string[]>([])
    const [selectedModel, setSelectedModel] = useState<string>('openai/gpt-4.1-mini')
    const [messages, setMessages] = useState<UiMessage[]>([])
    const [input, setInput] = useState('')
    const [loading, setLoading] = useState(false)
    const scrollRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        async function loadModels() {
            const list = await jutge.instructor.jutgeai.supportedModels()
            setModels(list)
            const preferred = 'openai/gpt-4.1-mini'
            if (list.length > 0 && !list.includes(selectedModel)) {
                setSelectedModel(list.includes(preferred) ? preferred : list[0])
            }
        }
        loadModels()
    }, [])

    const scrollToBottom = useCallback(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [])

    useEffect(() => {
        scrollToBottom()
    }, [messages, scrollToBottom])

    async function handleSend() {
        const text = input.trim()
        if (!text || !selectedModel || loading) return

        setInput('')
        const userMessage: UiMessage = { role: 'user', content: text }
        setMessages((prev) => [...prev, userMessage])
        setLoading(true)

        const conversation: UiMessage[] = [...messages, userMessage]
        const apiMessages: ChatMessage[] = conversation.map((m) => ({
            role: m.role,
            content: m.content,
        }))

        const assistantPlaceholder: UiMessage = { role: 'assistant', content: '' }
        setMessages((prev) => [...prev, assistantPlaceholder])

        try {
            const stream = await jutge.instructor.jutgeai.chat({
                model: selectedModel,
                label: 'chat',
                messages: apiMessages,
                addUsage: true,
            })

            const response = await fetch(`${jutge.JUTGE_API_URL}/webstreams/${stream.id}`)
            if (!response.body) {
                setMessages((prev) => {
                    const next = [...prev]
                    const last = next[next.length - 1]
                    if (last.role === 'assistant') last.content = 'No response body.'
                    return next
                })
                return
            }

            const reader = response.body.getReader()
            const decoder = new TextDecoder()
            let fullText = ''

            while (true) {
                const { done, value } = await reader.read()
                if (done) break
                fullText += decoder.decode(value, { stream: true })
                setMessages((prev) => {
                    const next = [...prev]
                    const last = next[next.length - 1]
                    if (last.role === 'assistant') {
                        last.content = stripUsageBlock(fullText)
                    }
                    return next
                })
            }
            setMessages((prev) => {
                const next = [...prev]
                const last = next[next.length - 1]
                if (last.role === 'assistant') {
                    last.content = stripUsageBlock(fullText).trim()
                }
                return next
            })
        } catch (e) {
            const err = e instanceof Error ? e.message : String(e)
            setMessages((prev) => {
                const next = [...prev]
                const last = next[next.length - 1]
                if (last.role === 'assistant') last.content = `Error: ${err}`
                return next
            })
        } finally {
            setLoading(false)
        }
    }

    function handleCopy(content: string) {
        navigator.clipboard.writeText(content).then(
            () => toast.success('Copied to clipboard'),
            () => toast.error('Failed to copy'),
        )
    }

    function handleEdit(index: number) {
        const msg = messages[index]
        if (msg.role !== 'user') return
        setInput(msg.content)
        setMessages((prev) => prev.slice(0, index))
    }

    return (
        <div className="flex flex-col gap-4 h-[calc(100vh-12rem)]">
            <ScrollArea className="flex-1 border rounded-lg p-4 min-h-0">
                <div className="flex flex-col gap-4 pr-4">
                    {messages.length === 0 && (
                        <div className="text-muted-foreground text-sm py-8 text-center">
                            Send a message to start the conversation.
                        </div>
                    )}
                    {messages.map((msg, i) => (
                        <MessageBubble
                            key={i}
                            message={msg}
                            onCopy={() => handleCopy(msg.content)}
                            onEdit={msg.role === 'user' ? () => handleEdit(i) : undefined}
                        />
                    ))}
                    <div ref={scrollRef} />
                </div>
            </ScrollArea>

            <div className="flex flex-col gap-2 flex-shrink-0">
                <Textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type your message…"
                    className="min-h-[80px] resize-none"
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault()
                            handleSend()
                        }
                    }}
                />
                <div className="flex flex-row gap-2 justify-end items-center">
                    <Select
                        value={selectedModel}
                        onValueChange={setSelectedModel}
                        disabled={loading}
                    >
                        <SelectTrigger className="w-[220px]">
                            <SelectValue placeholder="Select model" />
                        </SelectTrigger>
                        <SelectContent>
                            {models.map((m) => (
                                <SelectItem key={m} value={m}>
                                    {m}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Button
                        onClick={handleSend}
                        disabled={loading || !input.trim() || !selectedModel}
                        className="w-36"
                    >
                        <SendIcon className="size-8" />
                        Send
                    </Button>
                </div>
            </div>
        </div>
    )
}

function stripUsageBlock(text: string): string {
    const start = text.indexOf(USAGE_JSON_START)
    if (start === -1) return text
    const end = text.indexOf(USAGE_JSON_END, start)
    if (end === -1) return text
    return (text.slice(0, start) + text.slice(end + USAGE_JSON_END.length)).trim()
}

function MessageBubble({
    message,
    onCopy,
    onEdit,
}: {
    message: UiMessage
    onCopy: () => void
    onEdit?: () => void
}) {
    const isUser = message.role === 'user'
    const isAssistant = message.role === 'assistant'

    return (
        <div className={`flex flex-col gap-1 ${isUser ? 'items-end' : 'items-start'}`}>
            <div className={`flex flex-row gap-1 items-center ${isUser ? 'flex-row-reverse' : ''}`}>
                <span className="text-muted-foreground flex items-center gap-1">
                    {isUser ? <UserIcon className="size-4" /> : <BotIcon className="size-4" />}
                    <span className="text-xs font-medium">
                        {message.role === 'system' ? (
                            'System'
                        ) : message.role === 'user' ? (
                            'You'
                        ) : (
                            <span>
                                Jutge<sup>AI</sup>
                            </span>
                        )}
                    </span>
                </span>
                <div className="flex flex-row gap-1">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={onCopy}
                        title="Copy"
                    >
                        <ClipboardCopyIcon className="size-4" />
                    </Button>
                    {onEdit && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={onEdit}
                            title="Edit and resend"
                        >
                            <EditIcon className="size-4" />
                        </Button>
                    )}
                </div>
            </div>
            <div
                className={`rounded-lg border px-3 py-2 max-w-[85%] text-sm ${
                    isUser ? 'bg-primary/10 border-primary/20' : 'bg-muted/50 border-muted'
                }`}
            >
                {isAssistant && message.content ? (
                    <Markdown markdown={message.content} className="prose-sm max-w-none" />
                ) : message.content ? (
                    <pre className="whitespace-pre-wrap font-sans text-sm m-0">
                        {message.content}
                    </pre>
                ) : (
                    <span className="text-muted-foreground italic">Thinking…</span>
                )}
            </div>
        </div>
    )
}
