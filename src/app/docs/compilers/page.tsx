'use client'

import { Switch } from '@/components/ui/switch'
import Page from '@/jutge-components/layouts/court/Page'
import { AgTableFull } from '@/jutge-components/wrappers/AgTable'
import { DevIcon } from '@/jutge-components/wrappers/DevIcon'
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
    const [showBrokens, setShowBrokens] = useState(false)

    const colDefs = [
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
        {
            field: 'language',
            width: 180,
            filter: true,
            cellRenderer: (p: any) => (
                <div className="flex flex-row items-center gap-2">
                    {devIcon(p.data.compiler_id, compilers)}
                    {compilers[p.data.compiler_id].language}
                </div>
            ),
        },
    ]

    useEffect(() => {
        async function fetchData() {
            const compilers = await jutge.tables.getCompilers()
            const array = Object.values(compilers).sort((a, b) =>
                a.compiler_id.localeCompare(b.compiler_id),
            )
            setCompilers((old) => compilers)
            setRows((old) => array.filter((compiler) => compiler.status === null))
        }

        fetchData()
    }, [])

    function showBrokensChange(checked: boolean) {
        setShowBrokens(checked)
        const array = Object.values(compilers).sort((a, b) =>
            a.compiler_id.localeCompare(b.compiler_id),
        )
        if (checked) {
            setRows(array.filter((compiler) => compiler.status !== null))
        } else {
            setRows(array.filter((compiler) => compiler.status === null))
        }
    }

    if (Object.keys(compilers).length === 0) {
        return <div className="text-center">Loading...</div>
    }

    console.log('compilers', compilers)

    return (
        <>
            <AgTableFull rowData={rows} columnDefs={colDefs as any} />
            <div className="mt-4 flex flex-row gap-2">
                <Switch checked={showBrokens} onCheckedChange={showBrokensChange} />
                <div className="text-sm">Defunct and broken compilers</div>
                <div className="flex-grow" />
            </div>
        </>
    )
}

function devIcon(compiler_id: string, compilers: Record<string, Compiler>) {
    console.log('devIcon', compiler_id, compilers)
    if (compiler_id in compilers) {
        return <DevIcon proglang={compilers[compiler_id].language} size={14} />
    }
    //return Object.keys(compilers).length.toString()
    return <DevIcon proglang="Unknown" size={14} />
}
