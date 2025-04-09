'use client'

import Page from '@/components/Page'
import { Button } from '@/components/ui/button'
import { useXTerm } from '@/components/XTerm'
import jutge from '@/lib/jutge'
import { CloudDownloadIcon } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function ExamSubmissionsWebStreamPage() {
    const { exam_nm } = useParams<{ exam_nm: string }>()
    const { webstream_id } = useParams<{ webstream_id: string }>()
    return (
        <Page
            pageContext={{
                title: `Exam ${exam_nm}`,
                menu: 'user',
                current: 'exams',
                subTitle: `Exams ❯ ${exam_nm}`,
                subMenu: 'exams',
                subCurrent: 'submissions',
            }}
        >
            <ExamSubmissionsWebStreamView />
        </Page>
    )
}

function ExamSubmissionsWebStreamView() {
    //

    const { exam_nm } = useParams<{ exam_nm: string }>()
    const { webstream_id } = useParams<{ webstream_id: string }>()
    const { instance, ref } = useXTerm()
    const [loading, setLoading] = useState(true)
    const [packId, setPackId] = useState<string | null>(null)

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

                const match = text.match(/Download ([-_A-Za-z0-9]+.zip) ready/)
                if (match) setPackId(match[1])
            }
            setLoading(false)
        }

        fetchData()
    }, [instance, ref, webstream_id])

    return (
        <div className="mb-8">
            {loading && (
                <div className="border rounded-lg p-4 mb-8 text-sm text-center">
                    <div className="animate-pulse">
                        Please wait while your download is being prepared.
                    </div>
                </div>
            )}
            {!loading && packId && (
                <div className="border-green-800 border text-green-800 rounded-lg p-4 mb-8 text-sm text-center">
                    Download ready.
                </div>
            )}
            {!loading && !packId && (
                <div className="border border-red-800 text-red-800 rounded-lg p-4 mb-8 text-sm text-center">
                    Download could not be created. Please check the terminal for more information.
                </div>
            )}
            <div className="w-full h-[400px] border-8 border-black rounded-lg mb-8">
                <div ref={ref} style={{ width: '100%', height: '100%' }} />
            </div>
            {!loading && packId && (
                <Link href={`${jutge.JUTGE_API_URL}/packs/${packId}`}>
                    <Button className="w-full text-center">
                        <CloudDownloadIcon />
                        Download
                    </Button>
                </Link>
            )}
        </div>
    )
}
