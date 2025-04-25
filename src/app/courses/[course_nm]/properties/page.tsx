'use client'

import { JForm, JFormFields } from '@/components/JForm'
import Page from '@/components/Page'
import SimpleSpinner from '@/jutge-components/spinners/SimpleSpinner'
import jutge from '@/lib/jutge'
import { InstructorCourse } from '@/lib/jutge_api_client'
import { showError } from '@/lib/utils'
import { useConfirm } from '@omit/react-confirm-dialog'
import { SaveIcon, TrashIcon } from 'lucide-react'
import { redirect, useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { z } from 'zod'

export default function CoursePropertiesPage() {
    const { course_nm } = useParams<{ course_nm: string }>()
    return (
        <Page
            pageContext={{
                title: `Course ${course_nm}`,
                menu: 'user',
                current: 'courses',
                subTitle: `Courses ❯ ${course_nm}`,
                subMenu: 'courses',
                subCurrent: 'properties',
            }}
        >
            <CoursePropertiesView />
        </Page>
    )
}

function CoursePropertiesView() {
    const { course_nm } = useParams<{ course_nm: string }>()
    const [course, setCourse] = useState<InstructorCourse | null>(null)
    const [archived, setArchived] = useState(false)

    useEffect(() => {
        async function fetchCourse() {
            const course = await jutge.instructor.courses.get(course_nm)
            setCourse(course)
            const archived = (await jutge.instructor.courses.getArchived()).includes(course_nm)
            setArchived(archived)
        }

        fetchCourse()
    }, [course_nm])

    if (course === null) return <SimpleSpinner />

    return <EditCourseForm course={course} archived={archived} setArchived={setArchived} />
}

interface CourseFormProps {
    course: InstructorCourse
    archived: boolean
    setArchived: (archived: boolean) => void
}

function EditCourseForm(props: CourseFormProps) {
    const confirm = useConfirm()

    const [course_nm, setCourse_nm] = useState(props.course.course_nm)
    const [title, setTitle] = useState(props.course.title)
    const [description, setDescription] = useState(props.course.description)
    const [annotation, setAnnotation] = useState(props.course.annotation)

    const fields: JFormFields = {
        /*
        course_nm: {
            type: 'input',
            label: 'Name',
            value: course_nm,
            setValue: setCourse_nm,
            validator: z
                .string()
                .min(5)
                .regex(/^[a-zA-Z0-9_-]*$/, 'Only alphanumeric characters are allowed'),
            placeHolder: 'CourseName',
            disabled: true,
        },
        */
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
            placeHolder: 'Course annotation (instructor only)',
        },
        archived: {
            type: 'switch',
            label: 'Archived',
            value: props.archived,
            setValue: props.setArchived,
        },
        sep: { type: 'separator' },
        update: {
            type: 'button',
            text: 'Save changes',
            icon: <SaveIcon />,
            action: updateAction,
        },
        delete: {
            type: 'button',
            text: 'Delete course',
            icon: <TrashIcon />,
            action: deleteAction,
            ignoreValidation: true,
        },
    }

    async function updateAction() {
        const oldCurse = await jutge.instructor.courses.get(course_nm)
        const newCourse = {
            ...oldCurse,
            title,
            description,
            annotation,
        }

        try {
            await jutge.instructor.courses.update(newCourse)

            if (props.archived) await jutge.instructor.courses.archive(course_nm)
            else await jutge.instructor.courses.unarchive(course_nm)
        } catch (error) {
            return showError(error)
        }
        toast.success(`Course '${props.course.course_nm}' updated`)
        redirect('/courses')
    }

    async function deleteAction() {
        if (
            !(await confirm({
                title: 'Delete course',
                description: `Are you sure you want to delete course '${props.course.course_nm}'?`,
            }))
        ) {
            return
        }
        try {
            await jutge.instructor.courses.remove(props.course.course_nm)
        } catch (error) {
            return showError(error)
        }
        toast.success(`Course '${props.course.course_nm}' deleted`)
        redirect('/courses')
    }

    return <JForm fields={fields} />
}
