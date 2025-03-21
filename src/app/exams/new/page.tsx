'use client'

import { JForm, JFormFields } from '@/components/JForm'
import Page from '@/components/Page'
import jutge from '@/lib/jutge'
import { InstructorExamCreation } from '@/lib/jutge_api_client'
import { showError } from '@/lib/utils'
import { CirclePlusIcon } from 'lucide-react'
import { redirect } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'
import { z } from 'zod'

export default function ExamPropertiesPage() {
    return (
        <Page
            pageContext={{
                title: `Add exam`,
                menu: 'user',
                current: 'exams',
                subTitle: `Add exam`,
            }}
        >
            <ExamPropertiesView />
        </Page>
    )
}

function ExamPropertiesView() {
    const [exam_nm, setExam_nm] = useState('')
    const [title, setTitle] = useState('')
    const [place, setPlace] = useState('')
    const [description, setDescription] = useState('')
    const [expectedStart, setExpectedStart] = useState(new Date().toISOString())

    const fields: JFormFields = {
        exam_nm: {
            type: 'input',
            label: 'Id',
            value: exam_nm,
            setValue: setExam_nm,
            validator: z
                .string()
                .min(8)
                .regex(/^[a-zA-Z0-9_-]*$/, 'Only alphanumeric characters are allowed'),
            placeHolder: 'Id of the exam',
        },
        title: {
            type: 'input',
            label: 'Title',
            value: title,
            setValue: setTitle,
            validator: z.string().min(8),
            placeHolder: 'Title of the exam',
        },
        place: {
            type: 'input',
            label: 'Place',
            value: place,
            setValue: setPlace,
            validator: z.string().min(8),
            placeHolder: 'Where the exam takes place',
        },
        description: {
            type: 'markdown',
            label: 'Description',
            value: description || '',
            setValue: setDescription,
            placeHolder: 'Exam description (available to students)',
        },
        expectedStart: {
            type: 'datetime',
            label: 'Expected start time',
            value: expectedStart,
            setValue: setExpectedStart,
            placeHolder: 'When the exam is expected to start',
        },
        foo: {
            type: 'free',
            label: '',
            content: (
                <div className="text-sm mt-4">
                    More properties will be available after creating the exam.
                </div>
            ),
        },

        sep: { type: 'separator' },

        update: {
            type: 'button',
            text: 'Add exam',
            icon: <CirclePlusIcon />,
            action: addAction,
        },
    }

    async function addAction() {
        const exam: InstructorExamCreation = {
            exam_nm,
            title,
            place,
            description,
            exp_time_start: expectedStart,
        }

        try {
            await jutge.instructor.exams.create(exam)
        } catch (error) {
            return showError(error)
        }
        toast.success(`Exam '${exam_nm}' created.`)
        redirect(`/exams/${exam_nm}/properties`)
    }

    return <JForm fields={fields} />
}
