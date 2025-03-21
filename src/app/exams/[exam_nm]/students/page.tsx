'use client'

import { AgTableFull } from '@/components/AgTable'
import { useEmailsDialog } from '@/components/EmailsDialog'
import Page from '@/components/Page'
import Spinner from '@/components/Spinner'
import { Button } from '@/components/ui/button'
import jutge from '@/lib/jutge'
import { InstructorExam, InstructorExamStudent } from '@/lib/jutge_api_client'
import { showError } from '@/lib/utils'
import { RowSelectionOptions } from 'ag-grid-community'
import { AgGridReact } from 'ag-grid-react'
import { CircleMinusIcon, PlusCircleIcon, SaveIcon } from 'lucide-react'
import { useParams } from 'next/navigation'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'

export default function ExamStudentsPage() {
    const { exam_nm } = useParams<{ exam_nm: string }>()
    return (
        <Page
            pageContext={{
                title: `Exam ${exam_nm}`,
                menu: 'user',
                current: 'exams',
                subTitle: `Exams ❯ ${exam_nm}`,
                subMenu: 'exams',
                subCurrent: 'students',
            }}
        >
            <ExamStudentsView />
        </Page>
    )
}

type Item = { title: string; list_nm: string }

function ExamStudentsView() {
    //

    const { exam_nm } = useParams<{ exam_nm: string }>()

    const [exam, setExam] = useState<InstructorExam | null>(null)

    const [rows, setRows] = useState<InstructorExamStudent[]>([])

    const [colDefs, setColDefs] = useState([
        {
            field: 'email',
            flex: 4,
            filter: true,
            cellRenderer: (p: any) => {
                const parts = p.data.email.split('@')
                return (
                    <div>
                        {parts[0]}
                        <span className="text-xs text-gray-500">@{parts[1]}</span>
                    </div>
                )
            },
        },
        { field: 'name', flex: 3, filter: true },
        {
            field: 'code',
            width: 90,
            cellRenderer: (p: any) => <code className="text-xs">{p.data.code}</code>,
        },
        {
            field: 'taken_exam',
            headerName: 'Taken',
            width: 90,
            cellRenderer: (p: any) => (p.data.taken_exam ? 'Yes' : 'No'),
        },
        {
            field: 'finished',
            width: 90,
            cellRenderer: (p: any) => (p.data.finished ? 'Yes' : 'No'),
        },
        { field: 'banned', width: 90, cellRenderer: (p: any) => (p.data.banned ? 'Yes' : 'No') },
        { field: 'invited', width: 90, cellRenderer: (p: any) => (p.data.banned ? 'Yes' : 'No') },
    ])

    const gridRef = useRef<AgGridReact<Item>>(null)

    const rowSelection = useMemo<RowSelectionOptions | 'single' | 'multiple'>(() => {
        return { mode: 'multiRow', headerCheckbox: false }
    }, [])

    const [runAddEmailsDialog, AddEmailsDialog] = useEmailsDialog({
        title: 'Add students',
        description: 'Add students to the exam by email.',
        buttonIcon: <PlusCircleIcon />,
        buttonLabel: 'Add students',
    })

    const [runRemoveEmailsDialog, RemoveEmailsDialog] = useEmailsDialog({
        title: 'Remove students',
        description: 'Remove students from the exam by email.',
        buttonIcon: <CircleMinusIcon />,
        buttonLabel: 'Remove students',
    })

    const fetchData = useCallback(async () => {
        const exam = await jutge.instructor.exams.get(exam_nm)
        const rows = exam.students.sort((a, b) => a.email.localeCompare(b.email))
        setExam(exam)
        setRows(rows)
    }, [exam_nm])

    useEffect(() => {
        fetchData()
    }, [exam_nm, fetchData])

    async function addAction() {
        const result = await runAddEmailsDialog([])
        if (!result) return
        if (result.wrongEmails.length !== 0) {
            toast.warning(`${result.wrongEmails.length} invalid emails ignored.`)
        }
        if (result.validEmails.length === 0) {
            toast.warning('No emails to add.')
            return
        }

        const newRows: InstructorExamStudent[] = result.validEmails.map((email) => ({
            email,
            name: '',
            code: '',
            restricted: 0,
            annotation: null,
            result: null,
            finished: 0,
            banned: 0,
            reason_ban: null,
            inc: 0,
            reason_inc: null,
            taken_exam: 0,
            emergency_password: null,
            invited: 0,
        }))
        setRows([...rows, ...newRows])
    }

    async function removeAction() {
        const grid = gridRef.current!.api
        const selectedRows = grid.getSelectedNodes().map((node) => node.rowIndex) as number[]
        const selectedEmails = selectedRows.map((index) => rows[index].email)
        console.log(selectedEmails)

        const result = await runRemoveEmailsDialog(selectedEmails)
        if (!result) return
        if (result.wrongEmails.length !== 0) {
            toast.warning(`${result.wrongEmails.length} invalid emails ignored.`)
        }
        if (result.validEmails.length === 0) {
            toast.warning('No emails to remove.')
            return
        }

        const emailsToRemove = result.validEmails
        setRows((rows) => rows.filter((row) => !emailsToRemove.includes(row.email)))
    }

    async function saveAction() {
        try {
            await jutge.instructor.exams.updateStudents({
                exam_nm,
                students: rows,
            })
            toast.success('Students of the exam saved.')
            await fetchData()
        } catch (error) {
            showError(error)
        }
    }

    if (!exam) return <Spinner />

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
            />
            <div className="mt-4 flex flex-row-reverse gap-2">
                <Button className="w-28 justify-start" onClick={saveAction} title="Save changes">
                    <SaveIcon /> Save
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
        </>
    )
}
