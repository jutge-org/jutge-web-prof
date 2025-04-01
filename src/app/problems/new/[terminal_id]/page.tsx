'use client'

import Page from '@/components/Page'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useXTerm } from 'react-xtermjs'

export default function ProblemsNewTerminalPage() {
    return (
        <Page
            pageContext={{
                title: 'Add problem',
                menu: 'user',
                current: 'problems',
                subTitle: 'Add problem',
            }}
        >
            <ProblemsNewTerminalView />
        </Page>
    )
}

function ProblemsNewTerminalView() {
    //

    const { terminal_id } = useParams<{ terminal_id: string }>()
    const { instance, ref } = useXTerm()
    const [loading, setLoading] = useState(true)
    const [problemName, setProblemName] = useState<string | null>(null)

    useEffect(() => {
        const fetchData = async () => {
            if (!instance || !ref || !ref.current) return
            const response = await fetch(`https://new.jutge.org/terminals/${terminal_id}`)
            if (response.body === null) return
            const reader = response.body.getReader()
            while (true) {
                const { done, value } = await reader.read()
                if (done) break
                const text = new TextDecoder().decode(value)
                instance.write(text.replaceAll(/\n/g, '\r\n'))

                const match = text.match(/Problem ([A-Z]\d{5}) created./)
                if (match) setProblemName(match[1])
            }
            setLoading(false)
        }

        fetchData()
    }, [instance, ref, terminal_id])

    return (
        <div className="mb-8">
            <div className="w-full h-[400px] border-8 border-black rounded-lg mb-8">
                <div ref={ref} style={{ width: '100%', height: '100%' }} />
            </div>
            {loading && (
                <div className="border rounded-lg p-4 mb-8 text-sm text-center animate-pulse">
                    Please wait while the problem is being created.
                </div>
            )}
            {!loading && problemName && (
                <Link href={`/problems/${problemName}`}>
                    <Button className="w-full text-center">
                        <ArrowRight />
                        Go to problem {problemName}
                    </Button>
                </Link>
            )}
        </div>
    )
}
