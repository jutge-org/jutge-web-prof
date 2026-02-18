'use client'

import { CloudUploadIcon } from 'lucide-react'
import { redirect, useParams } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'
import { JForm, JFormFields } from '@/components/formatters/JForm'
import Page from '@/components/layout/Page'
import jutge from '@/lib/jutge'

export default function ProblemUpdatePage() {
    const { problem_nm } = useParams<{ problem_nm: string }>()

    return (
        <Page
            pageContext={{
                title: `Problem ${problem_nm}`,
                menu: 'user',
                current: 'problems',
                subTitle: `Problems ❯ ${problem_nm}`,
                subMenu: 'problems',
                subCurrent: 'update',
            }}
        >
            <ProblemUpdateView />
        </Page>
    )
}

function ProblemUpdateView() {
    //

    const { problem_nm } = useParams<{ problem_nm: string }>()
    const [file, setFile] = useState<File | null>(null)

    const fields: JFormFields = {
        title: {
            type: 'free',
            label: '',
            content: (
                <div className="text-sm space-y-2 border rounded-lg p-4 mb-8">
                    <p>Update problem {problem_nm} by uploading a ZIP archive with its content.</p>
                </div>
            ),
        },
        file: {
            type: 'file',
            label: 'ZIP archive',
            value: file,
            setValue: setFile,
            accept: ['application/zip'],
            //validator: z.number().min(1).max(1),
        },
        sep: { type: 'separator' },
        add: {
            type: 'button',
            text: 'Update problem',
            icon: <CloudUploadIcon />,
            action: updateAction,
        },
    }

    async function updateAction() {
        if (!file) {
            toast.error('Please select a ZIP archive.')
            return
        }

        const { id } = await jutge.instructor.problems.update(problem_nm, file)
        redirect(`/problems/${problem_nm}/update/${id}`)
    }

    return <JForm fields={fields} />
}
