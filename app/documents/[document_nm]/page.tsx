'use client'

import dayjs from 'dayjs'
import { FileIcon, SaveIcon, TrashIcon } from 'lucide-react'
import { redirect, useParams } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { z } from 'zod'
import { useConfirmDialog } from '@/components/dialogs/ConfirmDialog'
import { JForm, JFormFields } from '@/components/formatters/JForm'
import Page from '@/components/layout/Page'
import SimpleSpinner from '@/components/SimpleSpinner'
import { Button } from '@/components/ui/button'
import { useDynamic } from '@/hooks/use-dynamic'
import jutge from '@/lib/jutge'
import { Document } from '@/lib/jutge_api_client'
import { offerDownloadFile, showError } from '@/lib/utils'

export default function DocumentPropertiesPage() {
    const { document_nm } = useParams<{ document_nm: string }>()

    return (
        <Page
            pageContext={{
                title: 'Documents',
                subTitle: `Document ${document_nm}`,
                menu: 'user',
                current: 'documents',
                subMenu: 'documents',
            }}
        >
            <DocumentPropertiesView />
        </Page>
    )
}

function DocumentPropertiesView() {
    const { document_nm } = useParams<{ document_nm: string }>()
    const [document, setDocument] = useState<Document | null>(null)

    const fetchData = useCallback(async () => {
        const document = await jutge.instructor.documents.get(document_nm)
        setDocument(document)
    }, [document_nm])

    useEffect(() => {
        fetchData()
    }, [document_nm, fetchData])

    if (!document) return <SimpleSpinner />

    return <EditDocumentForm fetchData={fetchData} document={document} />
}

interface DocumentFormProps {
    fetchData: () => Promise<void>
    document: Document
}

function EditDocumentForm(props: DocumentFormProps) {
    //

    const [runConfirmDialog, ConfirmDialogComponent] = useConfirmDialog({
        title: 'Delete document',
        acceptIcon: <TrashIcon />,
        acceptLabel: 'Yes, delete',
        cancelLabel: 'No',
    })

    const [document_nm, setDocument_nm] = useDynamic(props.document.document_nm, [props.document])
    const [title, setTitle] = useDynamic(props.document.title, [props.document])
    const [created_at, setCreated_at] = useDynamic(
        dayjs(props.document.created_at).format('YYYY-MM-DD HH:mm:ss'),
        [props.document],
    )
    const [updated_at, setUpdated_at] = useDynamic(
        dayjs(props.document.updated_at).format('YYYY-MM-DD HH:mm:ss'),
        [props.document],
    )
    const [description, setDescription] = useDynamic(props.document.description, [props.document])
    const [file, setFile] = useDynamic(null as File | null, [props.document])

    const fields: JFormFields = {
        title: {
            type: 'input',
            label: 'Title',
            value: title,
            setValue: setTitle,
            validator: z.string().min(5),
            placeHolder: 'Document Title',
        },
        created_at: {
            type: 'datetime',
            label: 'Created at',
            value: created_at,
            disabled: true,
        },
        updated_at: {
            type: 'datetime',
            label: 'Updated at',
            value: updated_at,
            disabled: true,
        },
        description: {
            type: 'markdown',
            label: 'Description',
            value: description,
            setValue: setDescription,
            placeHolder: 'Document description',
        },
        oldPdf: {
            type: 'free',
            label: 'Current PDF',
            content: (
                <Button variant="outline" className="h-16 w-16 [&_svg]:size-12" onClick={download}>
                    <FileIcon strokeWidth={0.6} />
                </Button>
            ),
        },
        file: {
            type: 'file',
            label: 'New PDF',
            value: file,
            setValue: setFile,
            accept: ['application/pdf'],
            //validator: z.number().min(1).max(1),
        },
        sep: { type: 'separator' },
        update: {
            type: 'button',
            text: 'Save',
            icon: <SaveIcon />,
            action: save,
        },
        delete: {
            type: 'button',
            text: 'Delete',
            icon: <TrashIcon />,
            action: remove,
            ignoreValidation: true,
        },
    }

    async function download() {
        try {
            const download = await jutge.instructor.documents.getPdf(props.document.document_nm)
            offerDownloadFile(download, props.document.document_nm + '.pdf')
        } catch (error) {
            return showError(error)
        }
    }

    async function save() {
        try {
            const download = await jutge.instructor.documents.getPdf(props.document.document_nm)
            const newDocument = {
                document_nm: document_nm,
                title: title,
                description: description,
            }
            const newFile = file ? file : new File([new Uint8Array(download.data)], download.name)

            await jutge.instructor.documents.update(newDocument, newFile)
        } catch (error) {
            return showError(error)
        }
        await props.fetchData()
        toast.success(`Document '${props.document.document_nm}' saved.`)
    }

    async function remove() {
        const message = `Are you sure you want to delete document '${props.document.document_nm}'?`
        if (!(await runConfirmDialog(message))) return

        try {
            await jutge.instructor.documents.remove(props.document.document_nm)
        } catch (error) {
            return showError(error)
        }
        toast.success(`Document '${props.document.document_nm}' deleted.`)
        redirect('/documents')
    }

    return (
        <>
            <JForm fields={fields} />
            <ConfirmDialogComponent />
        </>
    )
}
