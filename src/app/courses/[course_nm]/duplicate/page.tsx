'use client'

import Page from '@/components/Page'
import { JForm, JFormFields } from '@/jutge-components/formatters/JForm'
import SimpleSpinner from '@/jutge-components/spinners/SimpleSpinner'
import jutge from '@/lib/jutge'
import { InstructorCourse } from '@/lib/jutge_api_client'
import { showError } from '@/lib/utils'
import { CopyPlusIcon } from 'lucide-react'
import { redirect, useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { z } from 'zod'

export default function CoursesDuplicatePage() {
    const { course_nm } = useParams<{ course_nm: string }>()
    return (
        <Page
            pageContext={{
                title: `Course ${course_nm}`,
                menu: 'user',
                current: 'courses',
                subTitle: `Courses ❯ ${course_nm}`,
                subMenu: 'courses',
                subCurrent: 'duplicate',
            }}
        >
            <CoursesDuplicateView />
        </Page>
    )
}

function CoursesDuplicateView() {
    const { course_nm } = useParams<{ course_nm: string }>()
    const [course, setCourse] = useState<InstructorCourse | null>(null)

    useEffect(() => {
        async function fetchCourse() {
            const course = await jutge.instructor.courses.get(course_nm)
            setCourse(course)
        }

        fetchCourse()
    }, [course_nm])

    if (course === null) return <SimpleSpinner />

    return <CoursesDuplicateForm course={course} />
}

function CoursesDuplicateForm({ course }: { course: InstructorCourse }) {
    //
    const [newNm, setNewNm] = useState(course.course_nm + '_copy')
    const [newTitle, setNewTitle] = useState('Copy of ' + course.title)

    const fields: JFormFields = {
        intro: {
            type: 'free',
            label: '',
            content: (
                <div className="text-sm mb-4">
                    <p>
                        In order to duplicate this course into a new course, please provide a new
                        course identifier and a new title.
                    </p>
                </div>
            ),
        },
        newNm: {
            type: 'input',
            label: 'Id',
            value: newNm,
            setValue: setNewNm,
            validator: z
                .string()
                .min(5)
                .regex(/^[a-zA-Z0-9_-]*$/, 'Only alphanumeric characters are allowed'),
            placeHolder: 'NewCourseName',
        },
        title: {
            type: 'input',
            label: 'Title',
            value: newTitle,
            setValue: setNewTitle,
            validator: z.string().min(5),
            placeHolder: 'New Course Title',
        },
        sep: { type: 'separator' },
        update: {
            type: 'button',
            text: 'Duplicate course',
            icon: <CopyPlusIcon />,
            action: duplicateAction,
        },
    }

    async function duplicateAction() {
        const oldCurse: InstructorCourse = await jutge.instructor.courses.get(course.course_nm)
        const newCourse = {
            ...oldCurse,
            course_nm: newNm,
            title: newTitle,
            students: { invited: [], enrolled: [], pending: [] },
        }

        try {
            await jutge.instructor.courses.create(newCourse)
        } catch (error) {
            return showError(error)
        }
        toast.success(`Course '${course.course_nm}' duplicated as '${newNm}'.`)
        redirect('/courses')
    }

    return <JForm fields={fields} />
}
