'use client'

import { JForm, JFormFields } from '@/jutge-components/formatters/JForm'
import Page from '@/jutge-components/layouts/court/Page'
import SimpleSpinner from '@/jutge-components/spinners/SimpleSpinner'
import { Warning } from '@/jutge-components/ui/Warning'
import jutge from '@/lib/jutge'
import { InstructorExam, InstructorExamSubmissionsOptions } from '@/lib/jutge_api_client'
import {
    CloudDownloadIcon,
    Columns2Icon,
    RectangleHorizontalIcon,
    RectangleVerticalIcon,
} from 'lucide-react'
import { redirect, useParams } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function ExamSubmissionsPage() {
    const { exam_nm } = useParams<{ exam_nm: string }>()
    return (
        <Page
            pageContext={{
                title: `Exam ${exam_nm}`,
                menu: 'user',
                current: 'exams',
                subTitle: `Exams ❯ ${exam_nm}`,
                subMenu: 'exams',
                subCurrent: 'submissions',
            }}
        >
            <ExamSubmissionsView />
        </Page>
    )
}

function ExamSubmissionsView() {
    const { exam_nm } = useParams<{ exam_nm: string }>()
    const [exam, setExam] = useState<InstructorExam | null>(null)

    useEffect(() => {
        async function fetchData() {
            const exam = await jutge.instructor.exams.get(exam_nm)
            setExam(exam)
        }

        fetchData()
    }, [exam_nm])

    if (exam === null) return <SimpleSpinner />

    if (!exam.time_start) {
        return <Warning>Exam has not started yet.</Warning>
    }

    return <EditExamForm exam={exam} />
}

interface ExamFormProps {
    exam: InstructorExam
}

function EditExamForm(props: ExamFormProps) {
    //

    const [selectedProblems, setSelectedProblems] = useState(
        props.exam.problems.map((p) => p.problem_nm),
    )
    const [includeSource, setIncludeSource] = useState(true)
    const [includePDF, setIncludePDF] = useState(true)
    const [includeMetadata, setIncludeMetadata] = useState(true)
    const [onlyLast, setOnlyLast] = useState('1')
    const [layout, setLayout] = useState('vertical')
    const [fontSize, setFontSize] = useState('10')

    const fields: JFormFields = {
        id: {
            type: 'input',
            label: 'Id',
            value: props.exam.exam_nm,
        },
        title: {
            type: 'input',
            label: 'Title',
            value: props.exam.title,
        },
        selectedProblems: {
            type: 'multiSelect',
            label: 'Problems',
            value: selectedProblems,
            setValue: setSelectedProblems,
            options: props.exam.problems.map((p) => ({ label: p.problem_nm, value: p.problem_nm })),
        },
        onlyLast: {
            type: 'radio',
            label: 'Submissions',
            value: '1',
            options: [
                { label: 'Only last submission of each problem', value: '1' },
                { label: 'All submissions', value: '2' },
            ],
            setValue: setOnlyLast,
        },
        includeSource: {
            type: 'switch',
            label: 'Source code',
            value: includeSource,
            setValue: setIncludeSource,
        },
        includeMetadata: {
            type: 'switch',
            label: 'Embed metadata in code',
            value: includeMetadata,
            setValue: setIncludeMetadata,
        },
        includePDF: {
            type: 'switch',
            label: 'PDF',
            value: includePDF,
            setValue: setIncludePDF,
        },
        layout: {
            type: 'radio',
            label: 'Layout',
            value: 'vertical',
            options: [
                {
                    label: (
                        <div className="flex flex-row gap-2 items-center">
                            <RectangleVerticalIcon /> vertical
                        </div>
                    ),
                    value: 'vertical',
                },
                {
                    label: (
                        <div className="flex flex-row gap-2 items-center">
                            <RectangleHorizontalIcon /> horizontal
                        </div>
                    ),
                    value: 'horizontal',
                },
                {
                    label: (
                        <div className="flex flex-row gap-2 items-center">
                            <Columns2Icon /> double
                        </div>
                    ),
                    value: 'double',
                },
            ],
            setValue: setLayout,
        },
        fontSize: {
            type: 'radio',
            label: 'Font size',
            value: '10',
            options: [
                { label: '8', value: '8' },
                { label: '9', value: '9' },
                { label: '10', value: '10' },
                { label: '11', value: '11' },
                { label: '12', value: '12' },
            ],
            setValue: setFontSize,
        },

        sep: { type: 'separator' },

        update: {
            type: 'button',
            text: 'Download',
            icon: <CloudDownloadIcon />,
            action: downloadAction,
        },
    }

    async function downloadAction() {
        const options: InstructorExamSubmissionsOptions = {
            include_source: includeSource,
            include_pdf: includePDF,
            include_metadata: includeMetadata,
            only_last: onlyLast === '1',
            problems: selectedProblems.join(','),
            font_size: parseInt(fontSize, 10),
            layout: layout,
        }
        const webstream = await jutge.instructor.exams.getSubmissions({
            exam_nm: props.exam.exam_nm,
            options: options,
        })
        redirect(`/exams/${props.exam.exam_nm}/submissions/${webstream.id}`)
    }

    return <JForm fields={fields} />
}
