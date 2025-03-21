'use client'

import { AgTableFull } from '@/components/AgTable'
import Page from '@/components/Page'
import { Button } from '@/components/ui/button'
import { useIsMobile } from '@/hooks/use-mobile'
import jutge from '@/lib/jutge'
import { Document } from '@/lib/jutge_api_client'
import { offerDownloadFile } from '@/lib/utils'
import { FileIcon, SquarePlusIcon } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function DocumentsListPage() {
    return (
        <Page
            pageContext={{
                title: 'Documents',
                menu: 'user',
                current: 'documents',
                subTitle: 'List of documents',
                subMenu: 'main',
            }}
        >
            <DocumentsListView />
        </Page>
    )
}

function DocumentsListView() {
    //

    const isMobile = useIsMobile()

    const [documents, setDocuments] = useState<Document[]>([])

    const [colDefs, setColDefs] = useState([
        {
            field: 'document_nm',
            headerName: 'Id',
            cellRenderer: (p: any) => (
                <Link href={`documents/${p.data.document_nm}`}>{p.data.document_nm}</Link>
            ),
            flex: 2,
            filter: true,
        },
        { field: 'title', flex: 2, filter: true },
        { field: 'annotation', flex: 2, filter: true },
        {
            field: 'pdf',
            flex: 1,
            filter: false,
            cellRenderer: (p: any) => (
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                        downloadPdf(p.data.document_nm)
                        p.api.deselectAll() // no funciona
                    }}
                >
                    <FileIcon />
                </Button>
            ),
        },
    ])

    useEffect(() => {
        if (isMobile)
            setColDefs((colDefs) =>
                colDefs.filter((c) => c.field !== 'annotation' && c.field !== 'pdf'),
            )
    }, [isMobile])

    useEffect(() => {
        async function fetchDocuments() {
            const dict = await jutge.instructor.documents.index()
            const array = Object.values(dict).sort((a: Document, b: Document) =>
                a.document_nm.localeCompare(b.document_nm),
            )
            setDocuments(array)
        }

        fetchDocuments()
    }, [])

    async function downloadPdf(document_nm: string) {
        const download = await jutge.instructor.documents.getPdf(document_nm)
        offerDownloadFile(download, `${document_nm}.pdf`)
    }

    return (
        <>
            <AgTableFull rowData={documents} columnDefs={colDefs} />
            <div className="mt-4 flex flex-row-reverse gap-2">
                <Link href="/documents/new">
                    <Button>
                        <SquarePlusIcon /> New document
                    </Button>
                </Link>
            </div>
        </>
    )
}
