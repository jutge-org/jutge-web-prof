'use client'

import { AgTableFull } from '@/components/AgTable'
import Page from '@/components/Page'
import { Switch } from '@/components/ui/switch'
import jutge from '@/lib/jutge'
import { Compiler } from '@/lib/jutge_api_client'
import { Dict } from '@/lib/utils'
import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function DocsCompilersPage() {
    return (
        <Page
            pageContext={{
                title: 'Docs',
                menu: 'user',
                current: 'docs',
                subTitle: 'Compilers',
                subMenu: 'up',
            }}
        >
            <DocsCompilersView />
        </Page>
    )
}

function DocsCompilersView() {
    //

    const [compilers, setCompilers] = useState<Dict<Compiler>>({})
    const [rows, setRows] = useState<Compiler[]>([])
    const [showDefuncts, setShowDefuncts] = useState(false)

    const [colDefs, setColDefs] = useState([
        {
            field: 'compiler_id',
            headerName: 'Id',
            cellRenderer: (p: any) => (
                <Link href={`compilers/${p.data.compiler_id}`}>{p.data.compiler_id}</Link>
            ),
            width: 150,
            filter: true,
        },
        { field: 'name', flex: 1, filter: true },
        { field: 'language', width: 150, filter: true },
    ])

    useEffect(() => {
        async function fetchData() {
            const compilers = await jutge.tables.getCompilers()
            const array = Object.values(compilers).sort((a, b) =>
                a.compiler_id.localeCompare(b.compiler_id),
            )
            setRows(array.filter((compiler) => compiler.status === null))
            setCompilers(compilers)
        }

        fetchData()
    }, [])

    function showDefunctsChange(checked: boolean) {
        setShowDefuncts(checked)
        const array = Object.values(compilers).sort((a, b) =>
            a.compiler_id.localeCompare(b.compiler_id),
        )
        if (checked) {
            setRows(array.filter((compiler) => compiler.status !== null))
        } else {
            setRows(array.filter((compiler) => compiler.status === null))
        }
    }

    return (
        <>
            <AgTableFull rowData={rows} columnDefs={colDefs as any} />
            <div className="mt-4 flex flex-row gap-2">
                <Switch checked={showDefuncts} onCheckedChange={showDefunctsChange} />
                <div className="text-sm">Defunct compilers</div>
                <div className="flex-grow" />
            </div>
        </>
    )
}
