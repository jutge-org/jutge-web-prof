'use client'

import { AgTableFull } from '@/components/AgTable'
import Page from '@/components/Page'
import jutge from '@/lib/jutge'
import { Verdict } from '@/lib/jutge_api_client'
import { Dict } from '@/lib/utils'
import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function DocsVerdictsPage() {
    return (
        <Page
            pageContext={{
                title: 'Docs',
                menu: 'user',
                current: 'docs',
                subTitle: 'Verdicts',
                subMenu: 'up',
            }}
        >
            <DocsVerdictsView />
        </Page>
    )
}

function DocsVerdictsView() {
    //

    const [verdicts, setVerdicts] = useState<Dict<Verdict>>({})
    const [rows, setRows] = useState<Verdict[]>([])

    const [colDefs, setColDefs] = useState([
        {
            field: 'verdict_id',
            headerName: 'Id',
            cellRenderer: (p: any) => (
                <Link href={`verdicts/${p.data.verdict_id}`}>{p.data.verdict_id}</Link>
            ),
            width: 150,
            filter: true,
        },
        { field: 'name', flex: 1, filter: true },
    ])

    useEffect(() => {
        async function fetchData() {
            const verdicts = await jutge.tables.getVerdicts()
            const array = Object.values(verdicts).sort((a, b) =>
                a.verdict_id.localeCompare(b.verdict_id),
            )
            setRows(array)
            setVerdicts(verdicts)
        }

        fetchData()
    }, [])

    return <AgTableFull rowData={rows} columnDefs={colDefs as any} />
}
