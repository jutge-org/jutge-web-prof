'use client'

import { AgTable, AgTableFull } from '@/components/AgTable'
import Page from '@/components/Page'
import Spinner from '@/components/Spinner'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import jutge from '@/lib/jutge'
import { InstructorBriefList, InstructorCourse } from '@/lib/jutge_api_client'
import { RowSelectionOptions } from 'ag-grid-community'
import { AgGridReact } from 'ag-grid-react'
import { CircleMinusIcon, PlusCircleIcon, SaveIcon } from 'lucide-react'
import { useParams } from 'next/navigation'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'

type Item = { title: string; list_nm: string }

export default function CourseListPage() {
    const { course_nm } = useParams<{ course_nm: string }>()
    return (
        <Page
            pageContext={{
                title: `Course ${course_nm}`,
                menu: 'user',
                current: 'courses',
                subTitle: `Courses ❯ ${course_nm}`,
                subMenu: 'courses',
                subCurrent: 'lists',
            }}
        >
            <CourseListView />
        </Page>
    )
}

function CourseListView() {
    const { course_nm } = useParams<{ course_nm: string }>()
    const [course, setCourse] = useState<InstructorCourse | null>(null)
    const [lists, setLists] = useState<Record<string, InstructorBriefList>>({})
    const [items, setItems] = useState<Item[]>([])
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
    const gridRef = useRef<AgGridReact<Item>>(null)

    const [colDefs, setColDefs] = useState([
        {
            rowDrag: true,
            field: 'title',
            headerName: 'Lists',
            flex: 2,
            sortable: false,
            //filter: true,
        },
    ])

    useEffect(() => {
        async function fetchCourse() {
            const lists = await jutge.instructor.lists.index()
            const course = await jutge.instructor.courses.get(course_nm)
            const items = course.lists.map((list_nm) => ({ title: lists[list_nm].title, list_nm }))
            setLists(lists)
            setCourse(course)
            setItems(items)
        }

        fetchCourse()
    }, [course_nm])

    const rowSelection = useMemo<RowSelectionOptions | 'single' | 'multiple'>(() => {
        return { mode: 'multiRow', headerCheckbox: false }
    }, [])

    async function saveAction() {
        console.log('saveAction')
        const lists: string[] = []
        gridRef.current!.api.forEachNode((rowNode, index) => {
            if (rowNode.data?.list_nm) lists.push(rowNode.data?.list_nm)
        })
        const course = await jutge.instructor.courses.get(course_nm)
        const newCourse = { ...course, lists }
        await jutge.instructor.courses.update(newCourse)
        toast.success(`Lists saved.`)
    }

    async function addCallback(listsToAdd: string[]) {
        const grid = gridRef.current!.api
        const itemsToAdd = listsToAdd.map((list_nm) => ({ list_nm, title: lists[list_nm].title }))
        const selectedRows = grid.getSelectedNodes().map((node) => node.rowIndex) as number[]
        const index = selectedRows.length > 0 ? Math.max(...selectedRows) : items.length
        const newItems = [...items.slice(0, index + 1), ...itemsToAdd, ...items.slice(index + 1)]
        setItems(newItems)
        setTimeout(() => grid.ensureIndexVisible(index, 'middle'), 100) // wait for the new row to be rendered
    }

    async function deleteAction() {
        const grid = gridRef.current!.api
        const selectedRows = grid.getSelectedNodes().map((node) => node.rowIndex) as number[]
        if (selectedRows.length === 0) {
            toast.info('Select rows to delete.')
            return
        }
        const newItems = items.filter((_, index) => !selectedRows.includes(index))
        setItems(newItems)
    }

    if (course === null) return <Spinner />

    return (
        <>
            <div className="h-[calc(100vh-200px)] w-full">
                <AgTableFull
                    rowData={items}
                    columnDefs={colDefs}
                    rowDragManaged={true}
                    rowDragMultiRow={true}
                    rowSelection={rowSelection}
                    ref={gridRef}
                />
            </div>
            <div className="mt-4 flex flex-row-reverse gap-2">
                <Button className="w-28 justify-start" onClick={saveAction}>
                    <SaveIcon /> Save
                </Button>
                <Button className="w-28 justify-start" onClick={deleteAction}>
                    <CircleMinusIcon /> Remove
                </Button>
                <Button className="w-28 justify-start" onClick={() => setIsAddDialogOpen(true)}>
                    <PlusCircleIcon /> Add
                </Button>
            </div>
            <DialogToAddLists
                isOpen={isAddDialogOpen}
                setIsOpen={setIsAddDialogOpen}
                onAccept={addCallback}
                availableLists={lists}
            />
        </>
    )
}

function DialogToAddLists({
    isOpen,
    setIsOpen,
    onAccept,
    availableLists,
}: {
    isOpen: boolean
    setIsOpen: (open: boolean) => void
    onAccept: (selectedLists: string[]) => Promise<void>
    availableLists: Record<string, InstructorBriefList>
}) {
    const [rows, setRows] = useState<Item[]>(
        Object.entries(availableLists)
            .map(([list_nm, list]) => ({
                title: list.title,
                list_nm,
            }))
            .sort((a, b) => a.title.localeCompare(b.title)),
    )
    const [colDefs, setColDefs] = useState([{ field: 'title', flex: 1, filter: true }])
    const gridRef = useRef<AgGridReact<Item>>(null)

    const onGridReady = useCallback(() => {
        gridRef.current!.api.setGridOption('headerHeight', 32)
    }, [])

    const rowSelection = useMemo<RowSelectionOptions | 'single' | 'multiple'>(() => {
        return { mode: 'multiRow', headerCheckbox: false }
    }, [])

    async function addCallback() {
        const grid = gridRef.current!.api
        const selectedLists = grid.getSelectedNodes().map((node) => node.data?.list_nm) as string[]
        setIsOpen(false)
        onAccept(selectedLists)
    }

    useEffect(() => {}, [isOpen])

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add lists to course</DialogTitle>
                    <DialogDescription>
                        Select the lists you want to add to the course:
                    </DialogDescription>
                    <div className="h-96 w-full pb-4">
                        <AgTable
                            rowData={rows}
                            columnDefs={colDefs}
                            rowDragManaged={true}
                            rowDragMultiRow={true}
                            rowSelection={rowSelection}
                            ref={gridRef}
                            rowHeight={32}
                            onGridReady={onGridReady}
                        />
                    </div>
                    <DialogFooter>
                        <Button onClick={addCallback} className="w-full">
                            <PlusCircleIcon />
                            Add lists
                        </Button>
                    </DialogFooter>
                </DialogHeader>
            </DialogContent>
        </Dialog>
    )
}
