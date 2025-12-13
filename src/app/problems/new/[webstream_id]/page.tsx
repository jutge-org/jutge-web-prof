'use client'

import Page from '@/components/layouts/court/Page'
import { Button } from '@/components/ui/button'
import { useXTerm } from '@/components/wrappers/XTerm'
import jutge from '@/lib/jutge'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'

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

    const { webstream_id } = useParams<{ webstream_id: string }>()
    const { instance, ref } = useXTerm()
    const [loading, setLoading] = useState(true)
    const [problem_nm, setProblem_nm] = useState<string | null>(null)

    useEffect(() => {
        const fetchData = async () => {
            if (!instance || !ref || !ref.current) return
            const response = await fetch(`${jutge.JUTGE_API_URL}/webstreams/${webstream_id}`)
            if (response.body === null) return
            const reader = response.body.getReader()
            while (true) {
                const { done, value } = await reader.read()
                if (done) break
                const text = new TextDecoder().decode(value)
                instance.write(text.replaceAll(/\n/g, '\r\n'))

                const match = text.match(/Problem ([A-Z]\d{5}) created./)
                if (match) setProblem_nm(match[1])
            }
            setLoading(false)
        }

        fetchData()
    }, [instance, ref, webstream_id, problem_nm])

    return (
        <div className="mb-8">
            {loading && (
                <div className="border rounded-lg p-4 mb-8 text-sm text-center">
                    <div className="animate-pulse">
                        Please wait while the problem is being created.
                    </div>
                </div>
            )}
            {!loading && problem_nm && (
                <div className="border-green-800 border text-green-800 rounded-lg p-4 mb-8 text-sm text-center">
                    Problem {problem_nm} created successfully.
                </div>
            )}
            {!loading && !problem_nm && (
                <div className="border border-red-800 text-red-800 rounded-lg p-4 mb-8 text-sm text-center">
                    Problem could not be created. Please check the terminal for more information.
                </div>
            )}
            <div className="w-full h-[400px] border-8 border-black rounded-lg mb-8">
                <div ref={ref} style={{ width: '100%', height: '100%' }} />
            </div>
            {!loading && problem_nm && (
                <Link href={`/problems/${problem_nm}`}>
                    <Button className="w-full text-center">
                        <ArrowRight />
                        Go to problem {problem_nm}
                    </Button>
                </Link>
            )}
        </div>
    )
}
