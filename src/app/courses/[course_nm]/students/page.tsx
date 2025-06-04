'use client'

import { Button } from '@/components/ui/button'
import { useConfirmDialog } from '@/jutge-components/dialogs/ConfirmDialog'
import { useEmailsDialog } from '@/jutge-components/dialogs/EmailsDialog'
import { useAuth } from '@/jutge-components/layouts/court/lib/Auth'
import Page from '@/jutge-components/layouts/court/Page'
import SimpleSpinner from '@/jutge-components/spinners/SimpleSpinner'
import { AgTableFull } from '@/jutge-components/wrappers/AgTable'
import jutge from '@/lib/jutge'
import { CourseMembers, InstructorCourse, Profile, StudentProfile } from '@/lib/jutge_api_client'
import { Dict, showError } from '@/lib/utils'
import { RowSelectionOptions } from 'ag-grid-community'
import { AgGridReact } from 'ag-grid-react'
import { CircleMinusIcon, PlusCircleIcon, SaveIcon, SendHorizonalIcon } from 'lucide-react'
import { useParams } from 'next/navigation'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'

export default function CourseStudentsPage() {
    const { course_nm } = useParams<{ course_nm: string }>()
    return (
        <Page
            pageContext={{
                title: `Course ${course_nm}`,
                menu: 'user',
                current: 'courses',
                subTitle: `Courses ❯ ${course_nm}`,
                subMenu: 'courses',
                subCurrent: 'students',
            }}
        >
            <CourseStudentsView />
        </Page>
    )
}

function CourseStudentsView() {
    const { course_nm } = useParams<{ course_nm: string }>()
    const auth = useAuth()
    const [course, setCourse] = useState<InstructorCourse | null>(null)
    const [profiles, setProfiles] = useState<Dict<StudentProfile> | null>(null)

    useEffect(() => {
        async function fetchData() {
            const course = await jutge.instructor.courses.get(course_nm)
            const profiles = await jutge.instructor.courses.getStudentProfiles(course_nm)
            setCourse(course)
            setProfiles(profiles)
        }

        fetchData()
    }, [course_nm])

    if (auth.user === null || course === null || profiles === null) return <SimpleSpinner />

    return <CourseStudentsForm user={auth.user} course={course} profiles={profiles} />
}

interface CourseStudentProps {
    user: Profile
    course: InstructorCourse
    profiles: Dict<StudentProfile>
}

function CourseStudentsForm(props: CourseStudentProps) {
    //

    type Row = { email: string; name: string; state: string }

    const [runConfirmDialog, ConfirmDialogComponent] = useConfirmDialog({
        title: 'Invite',
        acceptLabel: 'Yes, send',
        acceptIcon: <SendHorizonalIcon />,
        cancelLabel: 'No',
    })

    const { course_nm } = useParams<{ course_nm: string }>()
    const [rows, setRows] = useState<Row[]>(getRows())

    const [runAddEmailsDialog, AddEmailsDialog] = useEmailsDialog({
        title: 'Add students',
        description: 'Add students to the course by email.',
        buttonIcon: <PlusCircleIcon />,
        buttonLabel: 'Add students',
    })

    const [runRemoveEmailsDialog, RemoveEmailsDialog] = useEmailsDialog({
        title: 'Remove students',
        description: 'Remove students from the course by email.',
        buttonIcon: <CircleMinusIcon />,
        buttonLabel: 'Remove students',
    })

    const [colDefs, setColDefs] = useState([
        { field: 'email', flex: 1, filter: true },
        { field: 'name', flex: 1, filter: true },
        { field: 'state', width: 120, filter: true },
    ])

    const gridRef = useRef<AgGridReact<CourseMembers>>(null)

    const onGridReady = useCallback(() => {}, [])

    const rowSelection = useMemo<RowSelectionOptions | 'single' | 'multiple'>(() => {
        return { mode: 'multiRow', headerCheckbox: true }
    }, [])

    function getRows(): Row[] {
        const rows = []
        for (const email of props.course.students.invited) {
            if (props.profiles[email]) {
                rows.push({
                    email: email,
                    name: props.profiles[email].name || '',
                    state: 'enrolled',
                })
            } else {
                rows.push({
                    email: email,
                    name: '',
                    state: 'invited',
                })
            }
        }
        rows.sort((a, b) => a.email.localeCompare(b.email))
        return rows
    }

    async function addAction() {
        const result = await runAddEmailsDialog([])
        if (!result) return
        if (result.wrongEmails.length !== 0) {
            toast.warning(`There are ${result.wrongEmails.length} invalid emails.`)
        }
        if (result.validEmails.length === 0) {
            toast.warning('No emails to add.')
            return
        }

        const newRows: Row[] = []
        for (const email of result.validEmails) {
            if (props.course.students.invited.includes(email)) continue
            if (props.course.students.enrolled.includes(email)) continue
            newRows.push({ email, name: '', state: 'invited' })
        }
        setRows([...rows, ...newRows])
        toast.success(`Added ${newRows.length} students.`)
    }

    async function removeAction() {
        const grid = gridRef.current!.api
        const selectedRows = grid.getSelectedNodes().map((node) => node.rowIndex) as number[]
        const selectedEmails = selectedRows.map((index) => rows[index].email)

        const result = await runRemoveEmailsDialog(selectedEmails)
        if (!result) return
        if (result.wrongEmails.length !== 0) {
            toast.warning(`There are ${result.wrongEmails.length} invalid emails.`)
        }
        if (result.validEmails.length === 0) {
            toast.warning('No emails to remove.')
            return
        }

        const originalLength = rows.length
        const newRows = rows.filter((row) => !result.validEmails.includes(row.email))
        setRows(newRows)
        toast.success(`Removed ${originalLength - newRows.length} students.`)
    }

    async function saveAction() {
        const course = await jutge.instructor.courses.get(course_nm)
        course.students.invited = rows.map((row) => row.email)
        try {
            await jutge.instructor.courses.update(course)
            toast.success(`Students saved.`)
        } catch (error) {
            showError(error)
        }
    }

    async function inviteAction() {
        if (
            !(await runConfirmDialog(
                'Are you sure you want to send an invitation to the pending students? (Please do not abuse this feature.)',
            ))
        ) {
            return
        }

        try {
            await jutge.instructor.courses.sendInviteToStudents(course_nm)
            toast.success(`An email has been sent to the pending students.`)
        } catch (error) {
            showError(error)
        }
    }

    return (
        <>
            <AgTableFull
                rowData={rows}
                columnDefs={colDefs}
                rowDragManaged={true}
                rowDragMultiRow={true}
                rowSelection={rowSelection}
                ref={gridRef}
                rowHeight={32}
                onGridReady={onGridReady}
            />

            <div className="mt-4 flex flex-row-reverse gap-2">
                <Button className="w-28 justify-start" onClick={saveAction} title="Save changes">
                    <SaveIcon /> Save
                </Button>
                <Button
                    className="w-28 justify-start"
                    onClick={inviteAction}
                    title="Send invite to pending students"
                >
                    <SendHorizonalIcon /> Invite
                </Button>
                <Button
                    className="w-28 justify-start"
                    onClick={removeAction}
                    title="Remove students"
                >
                    <CircleMinusIcon /> Remove
                </Button>
                <Button className="w-28 justify-start" onClick={addAction} title="Add students">
                    <PlusCircleIcon /> Add
                </Button>
            </div>

            <AddEmailsDialog />
            <RemoveEmailsDialog />
            <ConfirmDialogComponent />
        </>
    )
}
