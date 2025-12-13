'use client'

import { JForm, JFormFields } from '@/components/formatters/JForm'
import Page from '@/components/layouts/court/Page'
import jutge from '@/lib/jutge'
import { CloudUploadIcon } from 'lucide-react'
import { redirect, useParams } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'

export default function ProblemUpdatePage() {
    const { problem_nm } = useParams<{ problem_nm: string }>()

    return (
        <Page
            pageContext={{
                title: `Problem ${problem_nm}`,
                menu: 'user',
                current: 'problems',
                subTitle: `Problems ❯ ${problem_nm} ❯ Update`,
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
                    <p>Update a problem by uploading a ZIP archive with its content.</p>
                </div>
            ),
        },
        id: {
            type: 'input',
            label: 'Problem',
            value: problem_nm,
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

        const { id } = await jutge.instructor.problems.legacyUpdateWithTerminal(problem_nm, file)
        redirect(`/problems/${problem_nm}/update/${id}`)
    }

    return <JForm fields={fields} />
}
