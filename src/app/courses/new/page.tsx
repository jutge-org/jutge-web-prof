'use client'

import { JForm, JFormFields } from '@/jutge-components/formatters/JForm'
import Page from '@/jutge-components/layouts/court/Page'
import jutge from '@/lib/jutge'
import { InstructorCourse } from '@/lib/jutge_api_client'
import { showError } from '@/lib/utils'
import { PlusCircleIcon } from 'lucide-react'
import { redirect } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'
import { z } from 'zod'

export default function CoursesNewPage() {
    return (
        <Page
            pageContext={{
                title: 'Add course',
                menu: 'user',
                current: 'courses',
                subTitle: 'Add course',
            }}
        >
            <CoursesNewView />
        </Page>
    )
}

function CoursesNewView() {
    const [course_nm, setCourse_nm] = useState('')
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [annotation, setAnnotation] = useState('')

    const fields: JFormFields = {
        course_nm: {
            type: 'input',
            label: 'Id',
            value: course_nm,
            setValue: setCourse_nm,
            validator: z
                .string()
                .min(5)
                .regex(/^[a-zA-Z0-9_-]*$/, 'Only alphanumeric characters are allowed'),
            placeHolder: 'CourseId',
        },
        title: {
            type: 'input',
            label: 'Title',
            value: title,
            setValue: setTitle,
            validator: z.string().min(5),
            placeHolder: 'Course Title',
        },
        description: {
            type: 'markdown',
            label: 'Description',
            value: description,
            setValue: setDescription,
            placeHolder: 'Course description',
        },
        annotation: {
            type: 'input',
            label: 'Annotation',
            value: annotation,
            setValue: setAnnotation,
            validator: z.string(),
            placeHolder: 'Course Annotation',
        },
        sep: { type: 'separator' },
        add: {
            type: 'button',
            text: 'Add course',
            icon: <PlusCircleIcon />,
            action: addAction,
        },
    }

    async function addAction() {
        const newCourse: InstructorCourse = {
            course_nm,
            title,
            description,
            annotation,
            official: 0,
            public: 0,
            students: {
                invited: [],
                enrolled: [],
                pending: [],
            },
            tutors: {
                invited: [],
                enrolled: [],
                pending: [],
            },
            lists: [],
        }
        try {
            await jutge.instructor.courses.create(newCourse)
        } catch (error) {
            return showError(error)
        }
        toast.success(`Course '${course_nm}' created`)
        redirect('/courses')
    }
    return <JForm fields={fields} />
}
