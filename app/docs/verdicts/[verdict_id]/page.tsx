'use client'

import 'highlight.js/styles/default.css'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { JTable, JTableItems } from '@/components/formatters/JTable'
import Page from '@/components/layout/Page'
import SimpleSpinner from '@/components/SimpleSpinner'
import jutge from '@/lib/jutge'
import { Verdict } from '@/lib/jutge_api_client'

export default function VerdictPage() {
    const { verdict_id } = useParams<{ verdict_id: string }>()
    return (
        <Page
            pageContext={{
                title: `Verdict ${verdict_id}`,
                menu: 'user',
                current: 'docs',
                subTitle: `Verdicts ❯ ${verdict_id}`,
                subMenu: 'up',
            }}
        >
            <VerdictView />
        </Page>
    )
}

function VerdictView() {
    const { verdict_id } = useParams<{ verdict_id: string }>()
    const [verdict, setVerdict] = useState<Verdict | null>(null)

    useEffect(() => {
        async function fetchData() {
            const verdicts = await jutge.tables.getVerdicts()
            const verdict = verdicts[verdict_id]

            setVerdict(verdict)
        }

        fetchData()
    }, [verdict_id])

    if (verdict === null) return <SimpleSpinner />

    const table: JTableItems = [
        {
            label: '',
            value: (
                <Image
                    className="mt-1"
                    src={`https://jutge.org/ico/verdicts/${verdict.verdict_id}.png`}
                    alt={verdict.verdict_id}
                    height={80}
                    width={80}
                />
            ),
        },
        { label: 'Verdict', value: verdict.name },
        {
            label: 'Acronym',
            value: (
                <>
                    {verdict.verdict_id} ({verdict.emoji})
                </>
            ),
        },
        { label: 'Description', value: verdict.description },
    ]

    return <JTable items={table} />
}
