'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import Page from '@/jutge-components/layouts/court/Page'
import Markdown from '@/jutge-components/wrappers/Markdown'
import jutge from '@/lib/jutge'
import { AbstractProblem, AbstractProblemSuppl, SearchResults } from '@/lib/jutge_api_client'
import { offerDownloadFile } from '@/lib/utils'
import {
    BookmarkIcon,
    BotIcon,
    CircleMinusIcon,
    CirclePlusIcon,
    CogIcon,
    FileCodeIcon,
    FileTerminalIcon,
    FileTextIcon,
    FileTypeIcon,
    MedalIcon,
    Mic,
    MicOff,
    ScrollIcon,
    ScrollTextIcon,
    SearchIcon,
    SignatureIcon,
    SkullIcon,
    SquareArrowOutUpRightIcon,
    TagsIcon,
    XIcon,
} from 'lucide-react'
import { JSX, useEffect, useRef, useState } from 'react'

export default function SearchPage() {
    const [allAbstractProblems, setAllAbstractProblems] = useState<Record<
        string,
        AbstractProblem
    > | null>(null)

    useState(async () => {
        const allAbstractProblems = await jutge.problems.getAllAbstractProblems()
        setAllAbstractProblems(allAbstractProblems)
    })

    return (
        <Page
            pageContext={{
                menu: 'user',
                current: 'search',
                title: 'Search',
                subTitle: `Search problems`,
                subMenu: 'main',
            }}
        >
            <SearchView allAbstractProblems={allAbstractProblems} />
        </Page>
    )
}

type SearchViewProps = {
    allAbstractProblems: Record<string, AbstractProblem> | null
}

const samples = [
    'Shorted paths',
    'Coin change',
    'Canvi de monedes',
    'Japó',
    'Grafos dirigidos',
    'Queues',
]

function SearchView(props: SearchViewProps) {
    const [searching, setSearching] = useState(false)
    const [results, setResults] = useState<SearchResults | undefined>(undefined)

    const [semanticQuery, setSemanticQuery] = useState('')
    const [fullTextQuery, setFullTextQuery] = useState('')

    async function semanticSearch() {
        if (searching) return
        setSearching(true)
        setResults(undefined)
        const results = await jutge.problems.semanticSearch({ query: semanticQuery, limit: 50 })
        setResults(results)
        setSearching(false)
    }

    async function fullTextSearch() {
        if (searching) return
        setSearching(true)
        setResults(undefined)
        const results = await jutge.problems.fullTextSearch({ query: fullTextQuery, limit: 50 })
        setResults(results)
        setSearching(false)
    }

    return (
        <div>
            <SearchTabsComponent
                semanticQuery={semanticQuery}
                setSemanticQuery={setSemanticQuery}
                fullTextQuery={fullTextQuery}
                setFullTextQuery={setFullTextQuery}
                handleSemanticSearch={semanticSearch}
                handleFullTextSearch={fullTextSearch}
            />

            {searching && <Searching />}

            {results && results.length === 0 && (
                <div className="border rounded-lg p-8 mb-4 flex flex-col justify-center items-center">
                    <div className="text-sm">No results found</div>
                </div>
            )}

            {results && props.allAbstractProblems && (
                <div className="flex flex-col gap-4">
                    {results
                        .filter((result) => result.problem_nm in props.allAbstractProblems!)
                        .map((result) => (
                            <Result
                                key={result.problem_nm}
                                result={result}
                                allAbstractProblems={props.allAbstractProblems!}
                            />
                        ))}
                </div>
            )}
        </div>
    )
}

type ResultProps = {
    result: {
        problem_nm: string
        score: number
    }
    allAbstractProblems: Record<string, AbstractProblem>
}

function Result(props: ResultProps) {
    const [statement, setStatement] = useState<JSX.Element | null>(null)
    const [isStatementDialogOpen, setIsStatementDialogOpen] = useState(false)

    const [abspbm, setAbspbm] = useState(props.allAbstractProblems[props.result.problem_nm])
    const [pbm, setPbm] = useState(
        Object.values(abspbm.problems).find((p) => p.original_language_id === p.language_id)!,
    )
    const [abspbmSuppl, setAbspbmSuppl] = useState<AbstractProblemSuppl | null>(null)
    const [detailsOpen, setDetailsOpen] = useState(false)

    useEffect(() => {
        async function fetchSuppl() {
            const suppl = await jutge.problems.getAbstractProblemSuppl(abspbm.problem_nm)
            setAbspbmSuppl(suppl)
        }
        fetchSuppl()
    }, [abspbm])

    function click(language_id: string) {
        setPbm((old) => Object.values(abspbm.problems).find((p) => p.language_id === language_id)!)
    }

    async function pdfFile() {
        const download = await jutge.problems.getPdfStatement(pbm.problem_id)
        offerDownloadFile(download)
    }

    async function htmlFile() {
        const htmlStatement = await jutge.problems.getHtmlStatement(pbm.problem_id)
        setStatement(
            <div
                className="border rounded-lg p-4 w-full h-96 scroll-auto"
                dangerouslySetInnerHTML={{ __html: htmlStatement }}
            />,
        )
        setIsStatementDialogOpen(true)
    }

    async function textFile() {
        const textStatement = await jutge.problems.getTextStatement(pbm.problem_id)
        setStatement(<Textarea className="text-sm w-full h-96" value={textStatement} />)
        setIsStatementDialogOpen(true)
    }

    async function markdownFile() {
        const markdownStatement = await jutge.problems.getMarkdownStatement(pbm.problem_id)
        setStatement(
            <div className="text-sm border rounded-lg p-4 w-full h-96 scroll-auto">
                <Markdown markdown={markdownStatement} className="prose-sm" />
            </div>,
        )
        setIsStatementDialogOpen(true)
    }

    return (
        <div className="border rounded-lg px-4 py-3 flex flex-col">
            <div className="mb-1 flex flex-row gap-2">
                <a
                    href={`https://jutge.org/problems/${props.result.problem_nm}`}
                    target="_blank"
                    rel="noreferrer"
                    className="font-bold text-primary hover:underline"
                >
                    {props.result.problem_nm}
                    <SquareArrowOutUpRightIcon className="inline-block ml-1 mb-1" size={16} />
                </a>
                <div />
                {Object.values(abspbm.problems)
                    .sort((a, b) => a.language_id.localeCompare(b.language_id))
                    .map((p) => (
                        <Badge
                            key={p.language_id}
                            onClick={() => click(p.language_id)}
                            variant={pbm.language_id == p.language_id ? 'default' : 'outline'}
                            className="w-8 flex items-center justify-center cursor-pointer"
                        >
                            {p.language_id}
                        </Badge>
                    ))}
                <div />
                <div className="flex-grow" />
            </div>
            <div className="space-y-1" />
            <div className="flex flex-row">
                {detailsOpen ? (
                    <CircleMinusIcon
                        className="inline-block mr-2 mt-1 text-primary"
                        size={16}
                        onClick={() => setDetailsOpen(false)}
                    />
                ) : (
                    <CirclePlusIcon
                        className="inline-block mr-2 mt-1 text-primary"
                        size={16}
                        onClick={() => setDetailsOpen(true)}
                    />
                )}
                <div className="font-bold">{pbm.title}</div>
            </div>

            <div className="mt-1 ml-6 text-sm flex flex-col gap-1">
                <div className="w-full flex flex-row">
                    <div className="w-8">
                        <SignatureIcon className="inline-block mr-1 mb-1" size={16} />
                    </div>
                    <div className="w-full">
                        {abspbm.author}
                        {pbm.translator && pbm.translator != abspbm.author && (
                            <span> (translated by {pbm.translator})</span>
                        )}
                    </div>
                </div>
                {pbm.summary && (
                    <div className="w-full flex flex-row">
                        <div className="w-8">
                            <TagsIcon className="inline-block mr-1 mb-1" size={16} />
                        </div>
                        <div className="w-full">{pbm.summary.keywords.replaceAll(',', ', ')}</div>
                    </div>
                )}
                {pbm.summary && (
                    <div className="w-full flex flex-row ">
                        <div className="w-8">
                            <ScrollIcon className="inline-block mr-1 mb-1" size={16} />
                        </div>
                        <div className="w-full">{pbm.summary.summary_1s}</div>
                    </div>
                )}
                {detailsOpen && pbm.summary && (
                    <div className="w-full flex flex-row ">
                        <div className="w-8">
                            <ScrollTextIcon className="inline-block mr-1 mb-1" size={16} />
                        </div>
                        <div className="w-full">{pbm.summary.summary_1p}</div>
                    </div>
                )}
                {detailsOpen && abspbm.solution_tags && (
                    <div className="w-full flex flex-row">
                        <div className="w-8">
                            <BookmarkIcon className="inline-block mr-1 mb-1" size={16} />
                        </div>
                        <div className="w-full">
                            {abspbm.solution_tags.tags.replaceAll(',', ', ')}
                        </div>
                    </div>
                )}
                {detailsOpen && (
                    <div className="w-full flex flex-row">
                        <div className="w-8">
                            <CogIcon className="inline-block mr-1 mb-1" size={16} />
                        </div>
                        <div className="w-full flex flex-row gap-2">
                            <Badge className="px-2 rounded-full" variant="secondary">
                                {abspbm.type}
                            </Badge>
                            <Badge className="px-2 rounded-full" variant="secondary">
                                {abspbm.driver_id}
                            </Badge>
                            {abspbm.compilers && (
                                <Badge className="px-2 rounded-full" variant="secondary">
                                    {abspbm.compilers}
                                </Badge>
                            )}
                        </div>
                    </div>
                )}
                {detailsOpen && abspbmSuppl && (
                    <div className="w-full flex flex-row">
                        <div className="w-8">
                            <MedalIcon className="inline-block mr-1 mb-1" size={16} />
                        </div>
                        <div className="whitespace-nowrap overflow-auto text-ellipsis w-full flex flex-row gap-2">
                            {abspbmSuppl.proglangs_with_ac.map((lang) => (
                                <Badge
                                    key={lang}
                                    className="px1.52 rounded-full"
                                    variant="secondary"
                                >
                                    {lang}
                                </Badge>
                            ))}
                        </div>
                    </div>
                )}
                {abspbm.deprecation && (
                    <div className="w-full flex flex-row">
                        <div className="w-8">
                            <SkullIcon className="inline-block mr-1 mb-1 text-red-500" size={16} />
                        </div>
                        <div className="w-full">Deprecated! {abspbm.deprecation}</div>
                    </div>
                )}
                {detailsOpen && (
                    <div className="mt-1 w-full flex flex-row">
                        <div className="w-8"></div>
                        <div className="w-full flex flex-row gap-2">
                            <FileTextIcon
                                className="inline-block cursor-pointer"
                                size={48}
                                strokeWidth={0.6}
                                onClick={pdfFile}
                            />
                            <FileCodeIcon
                                className="inline-block cursor-pointer"
                                size={48}
                                strokeWidth={0.6}
                                onClick={htmlFile}
                            />
                            <FileTerminalIcon
                                className="inline-block cursor-pointer"
                                size={48}
                                strokeWidth={0.6}
                                onClick={markdownFile}
                            />
                            <FileTypeIcon
                                className="inline-block cursor-pointer"
                                size={48}
                                strokeWidth={0.6}
                                onClick={textFile}
                            />
                        </div>
                    </div>
                )}
            </div>
            <StatementDialog
                problem_id={pbm.problem_id}
                content={statement}
                isOpen={isStatementDialogOpen}
                setIsOpen={setIsStatementDialogOpen}
            />
        </div>
    )
}

function StatementDialog({
    isOpen,
    setIsOpen,
    problem_id,
    content,
}: {
    isOpen: boolean
    setIsOpen: (open: boolean) => void
    problem_id: string
    content: JSX.Element | string | null
}) {
    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent>
                <DialogDescription className="hidden">Statement for {problem_id}</DialogDescription>
                <DialogHeader>
                    <DialogTitle>Statement for {problem_id}</DialogTitle>
                    <DialogDescription className="flex flex-col gap-4">
                        {content}
                        <Button onClick={() => setIsOpen(false)}>
                            <XIcon />
                            Close
                        </Button>
                    </DialogDescription>
                </DialogHeader>
            </DialogContent>
        </Dialog>
    )
}

function Searching() {
    return (
        <div className="border rounded-lg p-8 mb-4 flex flex-col justify-center items-center">
            <CogIcon size={48} className="animate-spin" strokeWidth={1} />
            <div className="animate-pulse text-sm">Searching</div>
        </div>
    )
}

type SearchTabsComponentProps = {
    semanticQuery: string
    setSemanticQuery: (query: string) => void
    fullTextQuery: string
    setFullTextQuery: (query: string) => void
    handleSemanticSearch: () => void
    handleFullTextSearch: () => void
}

function SearchTabsComponent(props: SearchTabsComponentProps) {
    return (
        <div className="w-full border rounded-lg p-6 mb-4">
            <div className="w-full sm:w-3/4 mx-auto">
                <Tabs defaultValue="semantic" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="semantic">
                            <BotIcon className="mr-2 -mt-1" size={16} />
                            Semantic search
                        </TabsTrigger>
                        <TabsTrigger value="fulltext">
                            <SearchIcon className="mr-2 -mt-1" size={16} />
                            Text search
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="semantic" className="space-y-4 mt-4">
                        <div className="flex gap-2">
                            <VoiceInput
                                type="text"
                                placeholder="Your query"
                                value={props.semanticQuery}
                                onChange={(e) => props.setSemanticQuery(e.target.value)}
                                onKeyPress={(e) =>
                                    e.key === 'Enter' && props.handleSemanticSearch()
                                }
                                className="flex-1"
                            />
                            <Button
                                onClick={props.handleSemanticSearch}
                                size="icon"
                                className="shrink-0"
                            >
                                <BotIcon className="h-4 w-4" />
                            </Button>
                        </div>
                        <p className="text-sm text-muted-foreground text-justify">
                            Semantic search understands the meaning, language and context of your
                            query to find relevant results about problems. Problems are reindexed
                            each night.
                        </p>
                    </TabsContent>

                    <TabsContent value="fulltext" className="space-y-4 mt-4">
                        <div className="flex gap-2">
                            <VoiceInput
                                type="text"
                                placeholder="Your query"
                                value={props.fullTextQuery}
                                onChange={(e) => props.setFullTextQuery(e.target.value)}
                                onKeyPress={(e) =>
                                    e.key === 'Enter' && props.handleFullTextSearch()
                                }
                                className="flex-1"
                            />
                            <Button
                                onClick={props.handleFullTextSearch}
                                size="icon"
                                className="shrink-0"
                            >
                                <SearchIcon className="h-4 w-4" />
                            </Button>
                        </div>
                        <p className="text-sm text-muted-foreground text-justify">
                            Full-text search looks for exact keyword matches in the title,
                            statement, keywords and summaries of problems. Use boolean operators
                            (AND, OR, NOT) and parentheses for more precise results. Use quotes for
                            exact phrases. Problems are reindexed each night.
                        </p>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}

interface VoiceInputProps {
    value: string
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
    type?: string
    placeholder?: string
    onKeyPress?: (e: React.KeyboardEvent<HTMLInputElement>) => void
    className?: string
}

function VoiceInput({
    value,
    onChange,
    type,
    placeholder,
    onKeyPress,
    className,
}: VoiceInputProps) {
    const [isListening, setIsListening] = useState(false)
    const recognitionRef = useRef<any>(null)

    const startListening = () => {
        const SpeechRecognition =
            (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition

        if (!SpeechRecognition) {
            alert('Speech recognition is not supported in your browser')
            return
        }

        recognitionRef.current = new SpeechRecognition()
        recognitionRef.current.continuous = true
        recognitionRef.current.interimResults = true

        recognitionRef.current.onresult = (event: any) => {
            const transcript = Array.from(event.results)
                .map((result: any) => result[0].transcript)
                .join('')

            // Create a synthetic event to match Input's onChange signature
            const syntheticEvent = {
                target: { value: transcript },
                currentTarget: { value: transcript },
            } as React.ChangeEvent<HTMLInputElement>

            onChange(syntheticEvent)
        }

        recognitionRef.current.start()
        setIsListening(true)
    }

    const stopListening = () => {
        if (recognitionRef.current) {
            recognitionRef.current.stop()
            setIsListening(false)
        }
    }

    const handleBlur = () => {
        if (isListening) {
            stopListening()
        }
    }

    return (
        <div className="w-full relative" onBlur={handleBlur}>
            <Input
                value={value}
                onChange={onChange}
                type={type}
                placeholder={placeholder}
                onKeyPress={onKeyPress}
                className={`pr-10 ${className || ''}`}
            />
            <Button
                type="button"
                variant="ghost"
                size="icon"
                className={`absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 ${isListening ? 'text-red-500' : ''}`}
                onClick={isListening ? stopListening : startListening}
                title={isListening ? 'Stop listening' : 'Start voice input'}
            >
                {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </Button>
        </div>
    )
}
