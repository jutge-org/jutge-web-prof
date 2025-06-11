'use client'

import { useConfirmDialog } from '@/jutge-components/dialogs/ConfirmDialog'
import { JForm, JFormFields } from '@/jutge-components/formatters/JForm'
import Page from '@/jutge-components/layouts/court/Page'
import SimpleSpinner from '@/jutge-components/spinners/SimpleSpinner'
import jutge from '@/lib/jutge'
import { Compiler, Document, InstructorExam, InstructorExamUpdate } from '@/lib/jutge_api_client'
import { Dict, mapmap, showError } from '@/lib/utils'
import { CalendarPlusIcon, SaveIcon, TrashIcon } from 'lucide-react'
import { redirect, useParams } from 'next/navigation'
import { capitalize } from 'radash'
import { useEffect, useState } from 'react'
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

    useEffect(() => {
        async function fetchData() {
            setExam(await jutge.instructor.exams.get(exam_nm))
            setArchived((await jutge.instructor.exams.getArchived()).includes(exam_nm))
            setCompilers(await jutge.tables.getCompilers())
            setDocuments(await jutge.instructor.documents.index())
            setAvatarPacks(await jutge.misc.getAvatarPacks())
        }

        fetchData()
    }, [exam_nm])

    if (!exam || !compilers || !documents) return <SimpleSpinner />

    return (
        <EditExamForm
            exam={exam}
            archived={archived}
            setArchived={setArchived}
            allCompilers={compilers}
            allDocuments={documents}
            allAvatarPacks={avatarPacks}
        />
    )
}

interface ExamFormProps {
    exam: InstructorExam
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

    const [exam_nm, setExam_nm] = useState(props.exam.exam_nm)
    const [code, setCode] = useState(props.exam.code || '')
    const [title, setTitle] = useState(props.exam.title)
    const [place, setPlace] = useState(props.exam.place)
    const [expectedStart, setExpectedStart] = useState(props.exam.exp_time_start as string)
    const [runningTime, setRunningTime] = useState(props.exam.running_time)
    const [description, setDescription] = useState(props.exam.description)
    const [instructions, setInstructions] = useState(props.exam.instructions)
    const [contest, setContest] = useState(props.exam.contest != 0)
    const [anonymous, setAnonymous] = useState(props.exam.anonymous != 0)
    const [visibleSubmissions, setVisibleSubmissions] = useState(
        props.exam.visible_submissions != 0,
    )
    const [avatarPack, setAvatarPack] = useState<string | null>(props.exam.avatars || '')
    const [documents, setDocuments] = useState(props.exam.documents.map((d) => d.document_nm))
    const [compilers, setCompilers] = useState(props.exam.compilers.map((c) => c.compiler_id))

    function optionCompare(
        a: { label: string; value: string },
        b: { label: string; value: string },
    ) {
        return a.label.localeCompare(b.label)
    }

    const fields: JFormFields = {
        exam_nm: {
            type: 'input',
            label: 'Id',
            value: exam_nm,
        },
        title: {
            type: 'input',
            label: 'Title',
            value: title,
            setValue: setTitle,
            validator: z.string().min(8),
            placeHolder: 'Exam Title',
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
            text: 'Save changes',
            icon: <SaveIcon />,
            action: saveAction,
        },
        addToCal: {
            type: 'button',
            text: 'Add to calendar',
            icon: <CalendarPlusIcon />,
            action: addToCalAction,
        },
        delete: {
            type: 'button',
            text: 'Delete exam',
            icon: <TrashIcon />,
            action: deleteAction,
            ignoreValidation: true,
        },
    }

    async function saveAction() {
        try {
            const newExam: InstructorExamUpdate = {
                exam_nm,
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

            toast.success(`Exam '${exam_nm}' saved.`)
        } catch (error) {
            return showError(error)
        }
    }

    async function addToCalAction() {
        window.open(examToCalendarLink(props.exam))
    }

    async function deleteAction() {
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
