'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import Page from '@/components/layout/Page'
import { AgTableFull } from '@/components/wrappers/AgTable'
import jutge from '@/lib/jutge'
import { Verdict } from '@/lib/jutge_api_client'
import { Dict } from '@/lib/utils'

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
            width: 100,
            filter: true,
        },
        { field: 'name', flex: 1, filter: true },
        {
            field: 'icon',
            width: 100,
            filter: false,
            cellRenderer: (p: any) => (
                <Image
                    className="mt-1"
                    src={`https://jutge.org/ico/verdicts/${p.data.verdict_id}.png`}
                    alt={p.data.verdict_id}
                    height={32}
                    width={32}
                />
            ),
        },
        {
            field: 'emoji',
            width: 100,
            filter: false,
        },
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
