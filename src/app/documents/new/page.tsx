'use client'

import Page from '@/components/Page'
import { JForm, JFormFields } from '@/jutge-components/formatters/JForm'
import jutge from '@/lib/jutge'
import { showError } from '@/lib/utils'
import { PlusCircleIcon } from 'lucide-react'
import { redirect } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'
import { z } from 'zod'

export default function DocumentsNewPage() {
    return (
        <Page
            pageContext={{
                title: 'Documents',
                subTitle: `Add document`,
                menu: 'user',
                current: 'documents',
            }}
        >
            <DocumentsNewView />
        </Page>
    )
}

function DocumentsNewView() {
    const [document_nm, setDocument_nm] = useState('')
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [file, setFile] = useState<File | null>(null)

    const fields: JFormFields = {
        document_nm: {
            type: 'input',
            label: 'Id',
            value: document_nm,
            setValue: setDocument_nm,
            validator: z
                .string()
                .min(5)
                .regex(/^[a-zA-Z0-9_-]*$/, 'Only alphanumeric characters are allowed'),
            placeHolder: 'DocumentId',
        },
        title: {
            type: 'input',
            label: 'Title',
            value: title,
            setValue: setTitle,
            validator: z.string().min(5),
            placeHolder: 'Document Title',
        },
        description: {
            type: 'markdown',
            label: 'Description',
            value: description,
            setValue: setDescription,
            placeHolder: 'Document description',
        },
        file: {
            type: 'file',
            label: 'PDF',
            value: file,
            setValue: setFile,
            accept: ['application/pdf'],
            //validator: z.number().min(1).max(1),
        },
        sep: { type: 'separator' },
        add: {
            type: 'button',
            text: 'Add document',
            icon: <PlusCircleIcon />,
            action: addAction,
        },
    }

    async function addAction() {
        const newDocument = {
            document_nm: document_nm,
            title: title,
            description: description,
        }
        try {
            await jutge.instructor.documents.create(newDocument, file!)
        } catch (error) {
            return showError(error)
        }
        toast.success(`Document '${document_nm}' created`)
        redirect('/documents')
    }

    return <JForm fields={fields} />
}
