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
import {
    AbstractProblem,
    InstructorBriefList,
    InstructorCourse,
    InstructorListItem,
    Profile,
} from '@/lib/jutge_api_client'
import { Dict } from '@/lib/utils'
import { useAuth } from '@/providers/Auth'
import { RowSelectionOptions } from 'ag-grid-community'
import { AgGridReact } from 'ag-grid-react'
import {
    ArrowUpRightIcon,
    CircleMinusIcon,
    EyeIcon,
    PlusCircleIcon,
    SaveIcon,
    XIcon,
} from 'lucide-react'
import { redirect, useParams } from 'next/navigation'
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
    const [isShowListDialogOpen, setIsShowListDialogOpen] = useState(false)
    const [listToShow, setListToShow] = useState<string | null>(null)
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
        {
            field: 'actions',
            headerName: '',
            width: 100,
            cellRenderer: (p: any) => (
                <span
                    className="text-background my-action-button"
                    onClick={() => showListAction(p.data.list_nm)}
                >
                    <EyeIcon size={18} strokeWidth={1.5} className="mt-[11px]" />
                </span>
            ),
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

    async function showListAction(list_nm: string) {
        setListToShow(list_nm)
        setIsShowListDialogOpen(true)
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
            <DialogToShowList
                isOpen={isShowListDialogOpen}
                setIsOpen={setIsShowListDialogOpen}
                listToShow={listToShow}
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

function DialogToShowList({
    isOpen,
    setIsOpen,
    listToShow,
}: {
    isOpen: boolean
    setIsOpen: (open: boolean) => void
    listToShow: string | null
}) {
    const [allAbstractProblems, setAllAbstractProblems] = useState<Dict<AbstractProblem> | null>(
        null,
    )

    const auth = useAuth()

    const [rows, setRows] = useState<InstructorListItem[]>([])
    const [colDefs, setColDefs] = useState<any>([])
    const gridRef = useRef<AgGridReact<Item>>(null)

    useEffect(() => {
        async function fetchData() {
            if (listToShow === null) return
            const list = await jutge.instructor.lists.get(listToShow)
            const items = list.items
            setRows(items)

            const allAbstractProblems = await jutge.problems.getAllAbstractProblems()
            setAllAbstractProblems(allAbstractProblems)

            const cols = [
                {
                    field: 'Items',
                    flex: 1,
                    sortable: true,
                    cellRenderer: (p: any) =>
                        p.data.problem_nm ? (
                            <div className="flex flex-row">
                                <a
                                    className="w-24"
                                    target="_blank"
                                    href={`https://jutge.org/problems/${p.data.problem_nm}`}
                                >
                                    {p.data.problem_nm}↗
                                </a>
                                {getTitle(auth.user!, p.data.problem_nm, allAbstractProblems)}
                            </div>
                        ) : (
                            <div className="italic">{p.data.description}</div>
                        ),
                },
            ]
            setColDefs(cols)
        }

        fetchData()
    }, [isOpen, listToShow, auth])

    const onGridReady = useCallback(() => {
        gridRef.current!.api.setGridOption('headerHeight', 32)
    }, [])

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>List {listToShow}</DialogTitle>
                    <DialogDescription></DialogDescription>
                    <div className="h-96 w-full pb-4">
                        <AgTable
                            rowData={rows}
                            columnDefs={colDefs}
                            rowDragManaged={true}
                            rowDragMultiRow={true}
                            ref={gridRef}
                            rowHeight={32}
                            onGridReady={onGridReady}
                        />
                    </div>
                    <DialogFooter className="flex flex-row gap-2">
                        <div className="w-full flex flex-col gap-2">
                            <Button
                                onClick={() => redirect(`/lists/${listToShow}/items`)}
                                className="w-full"
                            >
                                <ArrowUpRightIcon />
                                Go to list
                            </Button>
                            <Button onClick={() => setIsOpen(false)} className="w-full">
                                <XIcon />
                                Close
                            </Button>
                        </div>
                    </DialogFooter>
                </DialogHeader>
            </DialogContent>
        </Dialog>
    )
}

function getTitle(
    user: Profile,
    problem_nm: string,
    abstractProblems: Dict<AbstractProblem> | null,
) {
    if (abstractProblems === null) return problem_nm
    try {
        const abstractProblem = abstractProblems[problem_nm]
        const prefLanguageId = user.language_id
        const problem_id = abstractProblem.problem_nm + '_' + prefLanguageId
        if (problem_id in abstractProblem.problems) {
            return abstractProblem.problems[problem_id].title
        } else {
            for (const problem of Object.values(abstractProblem.problems)) {
                if (problem.translator === null) {
                    return problem.title
                }
            }
            for (const problem of Object.values(abstractProblem.problems)) {
                return problem.title
            }
            return problem_nm
        }
    } catch {
        return problem_nm
    }
}
