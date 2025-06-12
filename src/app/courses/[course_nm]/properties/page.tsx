'use client'

import { useConfirmDialog } from '@/jutge-components/dialogs/ConfirmDialog'
import { JForm, JFormFields } from '@/jutge-components/formatters/JForm'
import Page from '@/jutge-components/layouts/court/Page'
import SimpleSpinner from '@/jutge-components/spinners/SimpleSpinner'
import jutge from '@/lib/jutge'
import { InstructorCourse } from '@/lib/jutge_api_client'
import { showError } from '@/lib/utils'
import dayjs from 'dayjs'
import { SaveIcon, TrashIcon } from 'lucide-react'
import { redirect, useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { z } from 'zod'

export default function CoursePropertiesPage() {
    const [key, setKey] = useState(Math.random())
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
            <CoursePropertiesView key={key} setKey={setKey} />
        </Page>
    )
}

function CoursePropertiesView({ setKey }: { setKey: (key: number) => void }) {
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

    return (
        <EditCourseForm
            course={course}
            archived={archived}
            setArchived={setArchived}
            setKey={setKey}
        />
    )
}

interface CourseFormProps {
    course: InstructorCourse
    archived: boolean
    setArchived: (archived: boolean) => void
    setKey: (key: number) => void
}

function EditCourseForm(props: CourseFormProps) {
    //

    const [runConfirmDialog, ConfirmDialogComponent] = useConfirmDialog({
        title: 'Delete course',
        acceptIcon: <TrashIcon />,
        acceptLabel: 'Yes, delete',
        cancelLabel: 'No',
    })

    const [course_nm, setCourse_nm] = useState(props.course.course_nm)
    const [title, setTitle] = useState(props.course.title)
    const [description, setDescription] = useState(props.course.description)
    const [annotation, setAnnotation] = useState(props.course.annotation)
    const [created_at, setCreated_at] = useState(
        dayjs(props.course.created_at).format('YYYY-MM-DD HH:mm:ss'),
    )
    const [updated_at, setUpdated_at] = useState(
        dayjs(props.course.updated_at).format('YYYY-MM-DD HH:mm:ss'),
    )

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
        props.setKey(Math.random()) // force render to refresh the data
    }

    async function deleteAction() {
        if (
            !(await runConfirmDialog(
                `Are you sure you want to delete course '${props.course.course_nm}'?`,
            ))
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

    return (
        <>
            <JForm fields={fields} />
            <ConfirmDialogComponent />
        </>
    )
}
