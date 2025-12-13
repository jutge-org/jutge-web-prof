'use client'

import dayjs from 'dayjs'
import { SaveIcon, TrashIcon } from 'lucide-react'
import { redirect, useParams } from 'next/navigation'
import { all } from 'radash'
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { z } from 'zod'
import { useConfirmDialog } from '@/components/dialogs/ConfirmDialog'
import { JForm, JFormFields } from '@/components/formatters/JForm'
import Page from '@/components/layout/Page'
import SimpleSpinner from '@/components/SimpleSpinner'
import { useDynamic } from '@/hooks/use-dynamic'
import jutge from '@/lib/jutge'
import { InstructorCourse } from '@/lib/jutge_api_client'
import { showError } from '@/lib/utils'

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

    const fetchData = useCallback(async () => {
        const data = await all({
            course: jutge.instructor.courses.get(course_nm),
            archived: jutge.instructor.courses.getArchived(),
        })
        setCourse(data.course)
        setArchived(data.archived.includes(course_nm))
    }, [course_nm])

    useEffect(() => {
        fetchData()
    }, [course_nm, fetchData])

    if (course === null) return <SimpleSpinner />

    return (
        <EditCourseForm
            fetchData={fetchData}
            course={course}
            archived={archived}
            setArchived={setArchived}
        />
    )
}

interface CourseFormProps {
    course: InstructorCourse
    archived: boolean
    setArchived: (archived: boolean) => void
    fetchData: () => Promise<void>
}

function EditCourseForm(props: CourseFormProps) {
    //

    const [runConfirmDialog, ConfirmDialogComponent] = useConfirmDialog({
        title: 'Delete course',
        acceptIcon: <TrashIcon />,
        acceptLabel: 'Yes, delete',
        cancelLabel: 'No',
    })

    const [course_nm, setCourse_nm] = useDynamic(props.course.course_nm, [props.course])
    const [title, setTitle] = useDynamic(props.course.title, [props.course])
    const [description, setDescription] = useDynamic(props.course.description, [props.course])
    const [annotation, setAnnotation] = useDynamic(props.course.annotation, [props.course])
    const [created_at, setCreated_at] = useDynamic(
        dayjs(props.course.created_at).format('YYYY-MM-DD HH:mm:ss'),
        [props.course],
    )
    const [updated_at, setUpdated_at] = useDynamic(
        dayjs(props.course.updated_at).format('YYYY-MM-DD HH:mm:ss'),
        [props.course],
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

    async function save() {
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
        await props.fetchData()
        toast.success(`Course '${props.course.course_nm}' saved.`)
    }

    async function remove() {
        const message = `Are you sure you want to delete course '${props.course.course_nm}'?`
        if (!(await runConfirmDialog(message))) return

        try {
            await jutge.instructor.courses.remove(props.course.course_nm)
        } catch (error) {
            return showError(error)
        }
        toast.success(`Course '${props.course.course_nm}' deleted.`)
        redirect('/courses')
    }

    return (
        <>
            <JForm fields={fields} />
            <ConfirmDialogComponent />
        </>
    )
}
