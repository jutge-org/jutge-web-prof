'use client'

import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import Page from '../../../../../components/layouts/court/Page'
import { Button } from '../../../../../components/ui/button'
import { useXTerm } from '../../../../../components/wrappers/XTerm'
import jutge from '../../../../../lib/jutge'

export default function ProblemUpdateTerminalPage() {
    const { problem_nm } = useParams<{ problem_nm: string }>()

    return (
        <Page
            pageContext={{
                title: `Problem ${problem_nm}`,
                menu: 'user',
                current: 'problems',
                subTitle: `Problems ❯ ${problem_nm} ❯ Update`,
            }}
        >
            <ProblemUpdateTerminalView />
        </Page>
    )
}

function ProblemUpdateTerminalView() {
    //

    const { problem_nm } = useParams<{ problem_nm: string }>()
    const { webstream_id } = useParams<{ webstream_id: string }>()
    const { instance, ref } = useXTerm()
    const [loading, setLoading] = useState(true)
    const [success, setSuccess] = useState(false)

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

                const match = text.match(`Problem ${problem_nm} updated.`)
                if (match) setSuccess(true)
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
                        Please wait while the problem is being updated.
                    </div>
                </div>
            )}
            {!loading && success && (
                <div className="border-green-800 border text-green-800 rounded-lg p-4 mb-8 text-sm text-center">
                    Problem {problem_nm} updated successfully.
                </div>
            )}
            {!loading && !success && (
                <div className="border border-red-800 text-red-800 rounded-lg p-4 mb-8 text-sm text-center">
                    Problem {problem_nm} could not be updated.
                </div>
            )}
            <div className="w-full h-[400px] border-8 border-black rounded-lg mb-8">
                <div ref={ref} style={{ width: '100%', height: '100%' }} />
            </div>
            {!loading && (
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
