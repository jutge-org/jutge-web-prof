'use client'

import { array2csv } from '@/actions/csv'
import { Button } from '@/components/ui/button'
import { usePageChanges } from '@/hooks/use-page-changes'
import { useEmailsDialog } from '@/jutge-components/dialogs/EmailsDialog'
import Page from '@/jutge-components/layouts/court/Page'
import SimpleSpinner from '@/jutge-components/spinners/SimpleSpinner'
import { AgTableFull } from '@/jutge-components/wrappers/AgTable'
import jutge from '@/lib/jutge'
import { InstructorExam, InstructorExamStudent } from '@/lib/jutge_api_client'
import { showError } from '@/lib/utils'
import { RowSelectionOptions } from 'ag-grid-community'
import { AgGridReact } from 'ag-grid-react'
import FileSaver from 'file-saver'
import {
    CircleMinusIcon,
    CopyIcon,
    DownloadCloudIcon,
    PlusCircleIcon,
    SaveIcon,
} from 'lucide-react'
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

    const [changes, setChanges] = usePageChanges()

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
        {
            field: 'invited',
            width: 90,
            cellRenderer: (p: any) => (p.data.invited ? 'Yes' : 'No'),
            hide: true, // Only show if contest is enabled
        },
    ])

    const gridRef = useRef<AgGridReact<Item>>(null)

    const rowSelection = useMemo<RowSelectionOptions | 'single' | 'multiple'>(() => {
        return { mode: 'multiRow', headerCheckbox: true }
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
        gridRef.current!.api.setColumnsVisible(['invited'], exam.contest == 1)
        setChanges(false)
    }, [exam_nm, setChanges])

    useEffect(() => {
        fetchData()
    }, [exam_nm, fetchData])

    async function addHandle() {
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
            code: '', // API already uses the exam code
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
        setChanges(true)
    }

    async function removeHandle() {
        const grid = gridRef.current!.api
        const selectedRows = grid.getSelectedNodes().map((node) => node.rowIndex) as number[]
        const selectedEmails = selectedRows.map((index) => rows[index].email)

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
        setChanges(true)
    }

    async function saveHandle() {
        try {
            await jutge.instructor.exams.updateStudents({
                exam_nm,
                students: rows,
            })
            toast.success('Students of the exam saved.')
            setChanges(false)
            await fetchData()
        } catch (error) {
            showError(error)
        }
    }

    async function exportHandle() {
        const data = rows.map((row) => ({
            email: row.email,
            name: row.name,
            taken_exam: row.taken_exam ? 'Yes' : 'No',
            finished: row.finished ? 'Yes' : 'No',
            banned: row.banned ? 'Yes' : 'No',
            invited: row.invited ? 'Yes' : 'No',
        }))
        const csv = await array2csv(data)
        if (!csv) {
            toast.error('Error preparing CSV data')
            return
        }
        const blob = new Blob([csv], { type: 'text/csv' })
        FileSaver.saveAs(blob, 'students.csv')
    }

    async function copyEmailsHandle() {
        const emails = rows
            .map((row) => row.email)
            .sort()
            .join('\n')
        if (!emails) {
            toast.error('No emails to copy')
            return
        }
        try {
            await navigator.clipboard.writeText(emails)
            toast.success('Emails copied to clipboard')
        } catch (error) {
            toast.error('Error copying emails to clipboard')
            console.error('Error copying emails to clipboard:', error)
        }
    }

    if (!exam) return <SimpleSpinner />

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
            <div className="mt-4 flex flex-row-reverse gap-2 items-center">
                <Button className="w-36 justify-start" onClick={saveHandle} title="Save changes">
                    <SaveIcon /> Save
                </Button>
                <Button
                    className="w-36 justify-start"
                    onClick={removeHandle}
                    title="Remove students"
                >
                    <CircleMinusIcon /> Remove
                </Button>
                <Button className="w-36 justify-start" onClick={addHandle} title="Add students">
                    <PlusCircleIcon /> Add
                </Button>
                <div className="flex-grow" />
                <div className="text-xs text-gray-500">{rows.length} students</div>
                <div className="flex-grow" />
                <Button
                    className="w-36 justify-start"
                    onClick={copyEmailsHandle}
                    title="Copy emails to clipboard"
                    variant={'outline'}
                >
                    <CopyIcon /> Copy emails
                </Button>
                <Button
                    className="w-36 justify-start"
                    onClick={exportHandle}
                    title="Export to CSV"
                    variant={'outline'}
                >
                    <DownloadCloudIcon /> Export to CSV
                </Button>
            </div>
            <AddEmailsDialog />
            <RemoveEmailsDialog />
        </>
    )
}
