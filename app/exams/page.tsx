'use client'

import dayjs from 'dayjs'
import { SquarePlusIcon } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import Page from '../../components/layouts/court/Page'
import { Button } from '../../components/ui/button'
import { Switch } from '../../components/ui/switch'
import { AgTableFull } from '../../components/wrappers/AgTable'
import { useIsMobile } from '../../hooks/use-mobile'
import jutge from '../../lib/jutge'
import { InstructorBriefExam } from '../../lib/jutge_api_client'

export default function ExamsListPage() {
    return (
        <Page
            pageContext={{
                title: 'Exams',
                menu: 'user',
                current: 'exams',
                subTitle: 'Exams',
                subMenu: 'main',
            }}
        >
            <ExamsListView />
        </Page>
    )
}

function ExamsListView() {
    const isMobile = useIsMobile()
    const [exams, setExams] = useState<InstructorBriefExam[]>([])
    const [rows, setRows] = useState<InstructorBriefExam[]>([])
    const [archived, setArchived] = useState<string[]>([])
    const [showArchived, setShowArchived] = useState(false)

    const [colDefs, setColDefs] = useState([
        {
            field: 'exam_nm',
            headerName: 'Id',
            cellRenderer: (p: any) => (
                <Link href={`exams/${p.data.exam_nm}/properties`}>{p.data.exam_nm}</Link>
            ),
            flex: 1,
            filter: true,
        },
        { field: 'title', flex: 2, filter: true },
        {
            field: 'course',
            flex: 1,
            filter: true,
            headerName: 'Course',
            valueGetter: (p: any) => p.data.course.title,
        },
        {
            field: 'created_at',
            headerName: 'Created',
            width: 140,
            filter: true,
            valueGetter: (p: any) => dayjs(p.data.created_at).format('YYYY-MM-DD'),
        },
        {
            field: 'updated_at',
            headerName: 'Updated',
            width: 140,
            filter: true,
            valueGetter: (p: any) => dayjs(p.data.updated_at).format('YYYY-MM-DD'),
            sort: 'desc',
        },
        {
            field: 'exp_time_start',
            width: 200,
            filter: true,
            headerName: 'Expected start',
            cellRenderer: (p: any) => dayjs(p.data.exp_time_start).format('YYYY-MM-DD HH:mm'),
        },
    ])

    useEffect(() => {
        if (isMobile) setColDefs((colDefs) => colDefs.filter((c) => c.field !== 'exp_time_start'))
    }, [isMobile])

    useEffect(() => {
        async function fetchExams() {
            const archived = await jutge.instructor.exams.getArchived()
            const dict = await jutge.instructor.exams.index()
            const array = Object.values(dict).sort((a, b) =>
                dayjs(b.exp_time_start).diff(dayjs(a.exp_time_start)),
            )
            setRows(array.filter((exam) => !archived.includes(exam.exam_nm)))
            setExams(array)
            setArchived(archived)
        }

        fetchExams()
    }, [])

    function showArchivedChange(checked: boolean) {
        setShowArchived(checked)
        if (checked) {
            setRows(exams.filter((exam) => archived.includes(exam.exam_nm)))
        } else {
            setRows(exams.filter((exam) => !archived.includes(exam.exam_nm)))
        }
    }

    return (
        <>
            <AgTableFull rowData={rows} columnDefs={colDefs} />
            <div className="mt-4 flex flex-row gap-2">
                <Switch checked={showArchived} onCheckedChange={showArchivedChange} />
                <div className="text-sm">Archived exams</div>
                <div className="flex-grow" />
                <Link href="/exams/new">
                    <Button>
                        <SquarePlusIcon /> New exam
                    </Button>
                </Link>
            </div>
        </>
    )
}
