'use client'

import Page from '@/components/Page'
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
    const [problemName, setProblemName] = useState<string | null>()

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

                const match = text.match(/Problem ([A-Z]\d{5}) created/)
                if (match) {
                    setProblemName(match[1])
                }
            }
        }

        fetchData()
    }, [instance, ref, terminal_id])

    return (
        <>
            {problemName && (
                <div className="text-sm space-y-2 border rounded-lg p-4 mb-8">
                    <p>Problem name: {problemName}</p> foo
                </div>
            )}
            <h1>Problem creation output</h1>
            <div className="w-full h-[400px] border-8 border-black rounded-lg">
                <div ref={ref} style={{ width: '100%', height: '100%' }} />
            </div>
        </>
    )
}
