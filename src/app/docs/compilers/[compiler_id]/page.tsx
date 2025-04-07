'use client'

import Page from '@/components/Page'
import Spinner from '@/components/Spinner'
import jutge from '@/lib/jutge'
import { Compiler } from '@/lib/jutge_api_client'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function CompilerPage() {
    const { compiler_id } = useParams<{ compiler_id: string }>()
    return (
        <Page
            pageContext={{
                title: `Compiler ${compiler_id}`,
                menu: 'user',
                current: 'Compilers',
                subTitle: `Compilers ❯ ${compiler_id}`,
                subMenu: 'up',
            }}
        >
            <CompilerView />
        </Page>
    )
}

function CompilerView() {
    const { compiler_id } = useParams<{ compiler_id: string }>()
    const [compiler, setCompiler] = useState<Compiler | null>(null)

    useEffect(() => {
        async function fetchData() {
            const compilers = await jutge.tables.getCompilers()
            const compiler = compilers[compiler_id]
            setCompiler(compiler)
        }

        fetchData()
    }, [compiler_id])

    if (compiler === null) return <Spinner />

    return (
        <>
            TODO
            {compiler.name}
            {compiler.language}
            {compiler.compiler_id}
            {compiler.version}
        </>
    )
}
