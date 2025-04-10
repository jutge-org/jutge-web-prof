'use client'

import { JForm, JFormFields } from '@/components/JForm'
import Page from '@/components/Page'
import Spinner from '@/components/Spinner'
import jutge from '@/lib/jutge'
import { InstructorExam, InstructorExamSubmissionsOptions } from '@/lib/jutge_api_client'
import { CloudDownloadIcon } from 'lucide-react'
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

    if (exam === null) return <Spinner />

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
        includeSource: {
            type: 'switch',
            label: 'Source code',
            value: includeSource,
            setValue: setIncludeSource,
        },
        includePDF: {
            type: 'switch',
            label: 'PDF',
            value: includePDF,
            setValue: setIncludePDF,
        },
        includeMetadata: {
            type: 'switch',
            label: 'Add metadata in code',
            value: includeMetadata,
            setValue: setIncludeMetadata,
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
            font_size: Number(fontSize),
        }
        const webstream = await jutge.instructor.exams.getSubmissions({
            exam_nm: props.exam.exam_nm,
            options: options,
        })
        redirect(`/exams/${props.exam.exam_nm}/submissions/${webstream.id}`)
    }

    return <JForm fields={fields} />
}
