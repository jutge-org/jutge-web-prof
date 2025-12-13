'use client'

import 'highlight.js/styles/default.css'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { JTable, JTableItems } from '../../../../components/formatters/JTable'
import Page from '../../../../components/layouts/court/Page'
import SimpleSpinner from '../../../../components/SimpleSpinner'
import { Code } from '../../../../components/wrappers/Code'
import { DevIcon } from '../../../../components/wrappers/DevIcon'
import jutge from '../../../../lib/jutge'
import { Compiler } from '../../../../lib/jutge_api_client'
import { Dict } from '../../../../lib/utils'

export default function CompilerPage() {
    const { compiler_id: encoded_compiler_id } = useParams<{ compiler_id: string }>()
    const compiler_id = decodeURIComponent(encoded_compiler_id)

    return (
        <Page
            pageContext={{
                title: `Compiler ${compiler_id}`,
                menu: 'user',
                current: 'docs',
                subTitle: `Compilers ❯ ${compiler_id}`,
                subMenu: 'up',
            }}
        >
            <CompilerView />
        </Page>
    )
}

function CompilerView() {
    const { compiler_id: encoded_compiler_id } = useParams<{ compiler_id: string }>()
    const compiler_id = decodeURIComponent(encoded_compiler_id)

    const [compiler, setCompiler] = useState<Compiler | null>(null)
    const [demos, setDemos] = useState<Dict<string>>({})

    useEffect(() => {
        async function fetchData() {
            const compilers = await jutge.tables.getCompilers()
            const compiler = compilers[compiler_id]
            const demos = await jutge.misc.getDemosForCompiler(compiler_id)

            setCompiler(compiler)
            setDemos(demos)
        }

        fetchData()
    }, [compiler_id])

    if (compiler === null) return <SimpleSpinner />

    const table: JTableItems = [
        { label: 'Compiler', value: compiler.compiler_id },
        { label: 'Name', value: compiler.name },
        { label: 'Language', value: compiler.language },
        { label: 'Language Icon', value: <DevIcon proglang={compiler.language} size={24} /> },
        { label: 'Program and version', value: compiler.version },
        { label: 'Description', value: compiler.description },
        { label: 'Type', value: compiler.type },
        { label: 'Flags1', value: <code>{compiler.flags1}</code> },
        { label: 'Flags2', value: <code>{compiler.flags2}</code> },
        {
            label: 'Extension',
            value: (
                <code>
                    {'.'}
                    {compiler.extension}
                </code>
            ),
        },
        { label: 'Status', value: compiler.status === null ? '🟢 Ok' : '🔴 ' + compiler.status },
    ]

    for (const [problem_nm, codeB64] of Object.entries(demos)) {
        table.push({
            label: problem_nm,
            value: <Code code={atob(codeB64)} language={compiler.language} />,
        })
    }

    return <JTable items={table} />
}
