'use client'

import { PlusCircleIcon } from 'lucide-react'
import { redirect } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'
import { z } from 'zod'
import { JForm, JFormFields } from '@/components/formatters/JForm'
import Page from '@/components/layout/Page'
import jutge from '@/lib/jutge'

export default function ProblemsNewPage() {
    return (
        <Page
            pageContext={{
                title: 'Add problem',
                menu: 'user',
                current: 'problems',
                subTitle: 'Add problem',
            }}
        >
            <ProblemsNewView />
        </Page>
    )
}

function ProblemsNewView() {
    //

    const [file, setFile] = useState<File | null>(null)
    const [passcode, setPasscode] = useState<string>(Math.random().toString(36).substring(2, 12))

    const fields: JFormFields = {
        title: {
            type: 'free',
            label: '',
            content: (
                <div className="text-sm space-y-2 border rounded-lg p-4 mb-8">
                    <p>
                        Create a new problem by uploading a ZIP archive with its content. Please
                        read the documentation in the{' '}
                        <a href="https://github.com/jutge-org/jutge-toolkit" target="_blank">
                            Jutge Toolkit
                        </a>{' '}
                        for more information about the format of the ZIP archive.
                    </p>
                    <p>Passcode is mandatory to create a new problem, you can remove it latter.</p>
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
        passcode: {
            type: 'password',
            label: 'Passcode',
            value: passcode,
            setValue: setPasscode,
            validator: z
                .string()
                .min(8)
                .max(100)
                .refine(
                    (value) => /^[a-zA-Z0-9]+$/.test(value),
                    'String should contain only alphanumeric characters',
                ),
        },
        sep: { type: 'separator' },
        add: {
            type: 'button',
            text: 'Add problem',
            icon: <PlusCircleIcon />,
            action: addAction,
        },
    }

    async function addAction() {
        if (!file) {
            toast.error('Please select a ZIP archive.')
            return
        }

        const { id } = await jutge.instructor.problems.create(passcode, file)
        redirect(`/problems/new/${id}`)
    }

    return <JForm fields={fields} />
}
