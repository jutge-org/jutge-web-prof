'use client'

import { useDynamic } from '@/hooks/use-dynamic'
import { useConfirmDialog } from '@/jutge-components/dialogs/ConfirmDialog'
import { JForm, JFormFields } from '@/jutge-components/formatters/JForm'
import Page from '@/jutge-components/layouts/court/Page'
import SimpleSpinner from '@/jutge-components/spinners/SimpleSpinner'
import jutge from '@/lib/jutge'
import {
    Compiler,
    Document,
    InstructorBriefCourse,
    InstructorExam,
    InstructorExamUpdate,
} from '@/lib/jutge_api_client'
import { Dict, mapmap, showError } from '@/lib/utils'
import dayjs from 'dayjs'
import { CalendarPlusIcon, SaveIcon, TrashIcon } from 'lucide-react'
import { redirect, useParams } from 'next/navigation'
import { all, capitalize } from 'radash'
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { z } from 'zod'

export default function ExamPropertiesPage() {
    const { exam_nm } = useParams<{ exam_nm: string }>()
    return (
        <Page
            pageContext={{
                title: `Exam ${exam_nm}`,
                menu: 'user',
                current: 'exams',
                subTitle: `Exams ❯ ${exam_nm}`,
                subMenu: 'exams',
                subCurrent: 'properties',
            }}
        >
            <ExamPropertiesView />
        </Page>
    )
}

function ExamPropertiesView() {
    const { exam_nm } = useParams<{ exam_nm: string }>()
    const [exam, setExam] = useState<InstructorExam | null>(null)
    const [compilers, setCompilers] = useState<Dict<Compiler> | null>(null)
    const [documents, setDocuments] = useState<Dict<Document> | null>(null)
    const [avatarPacks, setAvatarPacks] = useState<string[]>([])
    const [archived, setArchived] = useState(false)

    const [courses, setCourses] = useState<Dict<InstructorBriefCourse>>({})

    const fetchData = useCallback(async () => {
        const data = await all({
            courses: jutge.instructor.courses.index(),
            exam: jutge.instructor.exams.get(exam_nm),
            archived: jutge.instructor.exams.getArchived(),
            compilers: jutge.tables.getCompilers(),
            documents: jutge.instructor.documents.index(),
            avatarPacks: jutge.misc.getAvatarPacks(),
        })
        setCourses(data.courses)
        setExam(data.exam)
        setArchived(data.archived.includes(exam_nm))
        setCompilers(data.compilers)
        setDocuments(data.documents)
        setAvatarPacks(data.avatarPacks)

        if (data.exam.course.course_nm === 'All') {
            toast.error(
                `Warning: Exam ${exam_nm} is not associated with a course. You may not start it!`,
            )
        }
    }, [exam_nm])

    useEffect(() => {
        fetchData()
    }, [exam_nm, fetchData])

    if (!exam || !compilers || !documents) return <SimpleSpinner />

    // xapuça perquè el All problems és especial
    if (exam.course.course_nm === 'All' && exam.course.title === 'All problems') {
        exam.course.course_nm = ''
        exam.course.title = ''
    }

    return (
        <EditExamForm
            fetchData={fetchData}
            exam={exam}
            courses={courses}
            archived={archived}
            setArchived={setArchived}
            allCompilers={compilers}
            allDocuments={documents}
            allAvatarPacks={avatarPacks}
        />
    )
}

interface ExamFormProps {
    fetchData: () => Promise<void>
    exam: InstructorExam
    courses: Dict<InstructorBriefCourse>
    archived: boolean
    setArchived: (archived: boolean) => void

    allCompilers: Dict<Compiler>
    allDocuments: Dict<Document>
    allAvatarPacks: string[]
}

function EditExamForm(props: ExamFormProps) {
    //

    const [runConfirmDialog, ConfirmDialogComponent] = useConfirmDialog({
        title: 'Delete exam',
        acceptIcon: <TrashIcon />,
        acceptLabel: 'Yes, delete',
        cancelLabel: 'No',
    })

    const [exam_nm, setExam_nm] = useDynamic(props.exam.exam_nm, [props])
    const [course_nm, setCourse_nm] = useDynamic(props.exam.course.course_nm || '', [props])
    const [code, setCode] = useDynamic(props.exam.code || '', [props])
    const [title, setTitle] = useDynamic(props.exam.title, [props])
    const [place, setPlace] = useDynamic(props.exam.place, [props])
    const [expectedStart, setExpectedStart] = useDynamic(props.exam.exp_time_start as string, [
        props,
    ])
    const [runningTime, setRunningTime] = useDynamic(props.exam.running_time, [props])
    const [description, setDescription] = useDynamic(props.exam.description, [props])
    const [instructions, setInstructions] = useDynamic(props.exam.instructions, [props])
    const [contest, setContest] = useDynamic(props.exam.contest != 0, [props])
    const [anonymous, setAnonymous] = useDynamic(props.exam.anonymous != 0, [props])
    const [visibleSubmissions, setVisibleSubmissions] = useDynamic(
        props.exam.visible_submissions != 0,
        [props],
    )
    const [avatarPack, setAvatarPack] = useDynamic(props.exam.avatars || '', [props])
    const [documents, setDocuments] = useDynamic(
        props.exam.documents.map((d) => d.document_nm),
        [props],
    )
    const [compilers, setCompilers] = useDynamic(
        props.exam.compilers.map((c) => c.compiler_id),
        [props],
    )
    const [created_at, setCreated_at] = useDynamic(
        dayjs(props.exam.created_at).format('YYYY-MM-DD HH:mm:ss'),
        [props],
    )
    const [updated_at, setUpdated_at] = useDynamic(
        dayjs(props.exam.updated_at).format('YYYY-MM-DD HH:mm:ss'),
        [props],
    )

    function optionCompare(
        a: { label: string; value: string },
        b: { label: string; value: string },
    ) {
        return a.label.localeCompare(b.label)
    }

    const fields: JFormFields = {
        title: {
            type: 'input',
            label: 'Title',
            value: title,
            setValue: setTitle,
            validator: z.string().min(8),
            placeHolder: 'Exam Title',
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
        course: {
            type: 'select',
            label: 'Course',
            value: course_nm,
            setValue: setCourse_nm,
            options: [{ value: '', label: '—' }].concat(
                mapmap(props.courses, (course_nm, course) => ({
                    value: course_nm,
                    label: course.title,
                })).sort(),
            ),
        },
        place: {
            type: 'input',
            label: 'Place',
            value: place || '',
            setValue: setPlace,
            validator: z.string(),
            placeHolder: 'Where the exam will take place',
        },
        description: {
            type: 'markdown',
            label: 'Description',
            value: description || '',
            setValue: setDescription,
            placeHolder: 'Exam description (available to students)',
        },
        instructions: {
            type: 'markdown',
            label: 'Instructions',
            value: instructions || '',
            setValue: setInstructions,
            placeHolder: 'Exam instructions (available to students once they log in the exam)',
        },
        expectedStart: {
            type: 'datetime',
            label: 'Expected start time',
            value: expectedStart,
            setValue: setExpectedStart,
            placeHolder: 'When the exam is expected to start',
        },
        runningTime: {
            type: 'number',
            label: 'Running time (minutes)',
            value: runningTime,
            setValue: setRunningTime,
            placeHolder: 'How long the exam is expected to last',
            validator: z.number().min(1),
        },
        code: {
            type: 'input',
            label: 'Exam password',
            value: code,
            setValue: setCode,
            placeHolder: 'No password',
        },
        contest: {
            type: 'switch',
            label: 'Contest',
            value: contest,
            setValue: setContest,
        },
        anonymous: {
            type: 'switch',
            label: 'Anonymous',
            value: anonymous,
            setValue: setAnonymous,
        },
        avatarPack: {
            type: 'select',
            label: 'Avatar pack',
            value: avatarPack,
            setValue: setAvatarPack,
            options: [{ value: '', label: '—' }].concat(
                props.allAvatarPacks
                    .map((pack) => ({ value: pack, label: capitalize(pack) }))
                    .sort(),
            ),
        },
        compilers: {
            type: 'multiSelect',
            label: 'Compilers',
            value: compilers,
            setValue: setCompilers,
            options: mapmap(props.allCompilers, (compiler_id, compiler) => ({
                value: compiler_id,
                label: compiler.name,
            })).sort(optionCompare),
        },
        documents: {
            type: 'multiSelect',
            label: 'Documents',
            value: documents,
            setValue: setDocuments,
            options: mapmap(props.allDocuments, (document_id, document) => ({
                value: document_id,
                label: document.title,
            })).sort(optionCompare),
        },
        visibleSubmissions: {
            type: 'switch',
            label: 'Visible submissions',
            value: visibleSubmissions,
            setValue: setVisibleSubmissions,
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
        addToCal: {
            type: 'button',
            text: 'Add to calendar',
            icon: <CalendarPlusIcon />,
            action: addToCalendar,
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
        try {
            const newExam: InstructorExamUpdate = {
                exam_nm,
                course_nm: course_nm || '',
                title,
                code,
                place: place || '',
                exp_time_start: expectedStart,
                running_time: runningTime,
                description: description || '',
                instructions: instructions || '',
                contest: contest ? 1 : 0,
                anonymous: anonymous ? 1 : 0,
                visible_submissions: visibleSubmissions ? 1 : 0,
                avatars: avatarPack || '',

                // read only properties
                time_start: props.exam.time_start,
                started_by: props.exam.started_by,
            }

            await jutge.instructor.exams.update(newExam)
            await jutge.instructor.exams.updateDocuments({ exam_nm, document_nms: documents })
            await jutge.instructor.exams.updateCompilers({ exam_nm, compiler_ids: compilers })

            if (props.archived) await jutge.instructor.exams.archive(exam_nm)
            else await jutge.instructor.exams.unarchive(exam_nm)
        } catch (error) {
            return showError(error)
        }
        await props.fetchData()
        toast.success(`Exam '${exam_nm}' saved.`)
    }

    async function addToCalendar() {
        window.open(examToCalendarLink(props.exam))
    }

    async function remove() {
        const message = `Are you sure you want to delete exam '${props.exam.exam_nm}'?`
        if (!(await runConfirmDialog(message))) return

        try {
            await jutge.instructor.exams.remove(props.exam.exam_nm)
        } catch (error) {
            return showError(error)
        }
        toast.success(`Exam '${props.exam.exam_nm}' deleted.`)
        redirect('/exams')
    }

    return (
        <>
            <JForm fields={fields} />
            <ConfirmDialogComponent />
        </>
    )
}

function examToCalendarLink(exam: InstructorExam): string {
    const formatDate = (date: Date): string => {
        const isoString = date.toISOString().replace(/[-:]/g, '')
        return isoString.slice(0, 13) + isoString.slice(15, -1)
    }

    const startDate = new Date(exam.exp_time_start)
    const endDate = new Date(startDate.getTime() + exam.running_time * 60000)

    const dateS = formatDate(startDate)
    const dateE = formatDate(endDate)

    const text = encodeURIComponent(exam.title)
    const dates = `${dateS}/${dateE}`
    const location = encodeURIComponent(exam.place || 'unkwnown')

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&dates=${dates}&location=${location}`
}
