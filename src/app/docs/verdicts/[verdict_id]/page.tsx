'use client'

import Page from '@/components/Page'
import Spinner from '@/components/Spinner'
import jutge from '@/lib/jutge'
import { Verdict } from '@/lib/jutge_api_client'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function VerdictPage() {
    const { verdict_id } = useParams<{ verdict_id: string }>()
    return (
        <Page
            pageContext={{
                title: `Verdict ${verdict_id}`,
                menu: 'user',
                current: 'Verdicts',
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

    if (verdict === null) return <Spinner />

    return (
        <>
            TODO
            {verdict.name}
            {verdict.description}
        </>
    )
}
