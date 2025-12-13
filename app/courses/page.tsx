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
import { InstructorBriefCourse } from '../../lib/jutge_api_client'

export default function CoursesListPage() {
    return (
        <Page
            pageContext={{
                title: 'Courses',
                menu: 'user',
                current: 'courses',
                subTitle: 'Courses',
                subMenu: 'main',
            }}
        >
            <CoursesListView />
        </Page>
    )
}

function CoursesListView() {
    //

    const isMobile = useIsMobile()

    const [courses, setCourses] = useState<InstructorBriefCourse[]>([])
    const [rows, setRows] = useState<InstructorBriefCourse[]>([])
    const [archived, setArchived] = useState<string[]>([])
    const [showArchived, setShowArchived] = useState(false)

    const [colDefs, setColDefs] = useState([
        {
            field: 'course_nm',
            headerName: 'Id',
            cellRenderer: (p: any) => (
                <Link href={`/courses/${p.data.course_nm}/properties`}>{p.data.course_nm}</Link>
            ),
            flex: 1,
            filter: true,
        },
        { field: 'title', flex: 2, filter: true },
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
        //    { field: 'annotation', flex: 2, filter: true },
    ])

    useEffect(() => {
        if (isMobile) setColDefs((colDefs) => colDefs.filter((c) => c.field !== 'annotation'))
    }, [isMobile])

    useEffect(() => {
        async function fetchCourses() {
            const archived = await jutge.instructor.courses.getArchived()
            const dict = await jutge.instructor.courses.index()
            const array = Object.values(dict).sort((a, b) => a.course_nm.localeCompare(b.course_nm))
            setRows(array.filter((course) => !archived.includes(course.course_nm)))
            setCourses(array)
            setArchived(archived)
        }

        fetchCourses()
    }, [])

    function showArchivedChange(checked: boolean) {
        setShowArchived(checked)
        if (checked) {
            setRows(courses.filter((course) => archived.includes(course.course_nm)))
        } else {
            setRows(courses.filter((course) => !archived.includes(course.course_nm)))
        }
    }

    return (
        <>
            <AgTableFull rowData={rows} columnDefs={colDefs as any} />
            <div className="mt-4 flex flex-row gap-2">
                <Switch checked={showArchived} onCheckedChange={showArchivedChange} />
                <div className="text-sm">Archived courses</div>
                <div className="flex-grow" />
                <Link href="/courses/new">
                    <Button>
                        <SquarePlusIcon /> New course
                    </Button>
                </Link>
            </div>
        </>
    )
}
