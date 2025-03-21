'use client'

import { AgTable, AgTableFull } from '@/components/AgTable'
import Page from '@/components/Page'
import Spinner from '@/components/Spinner'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import jutge from '@/lib/jutge'
import {
    AbstractProblem,
    InstructorList,
    InstructorListItem,
    Profile,
} from '@/lib/jutge_api_client'
import { Dict } from '@/lib/utils'
import { useAuth } from '@/providers/Auth'
import { RowSelectionOptions } from 'ag-grid-community'
import { AgGridReact } from 'ag-grid-react'
import { CircleMinusIcon, PlusCircleIcon, SaveIcon } from 'lucide-react'
import { useParams } from 'next/navigation'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'

function getTitle(user: Profile, problem_nm: string, abstractProblems: Dict<AbstractProblem>) {
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

type Item = { description: string | null; problem_nm: string | null; title: string | null }
type ProblemItem = { problem_nm: string; title: string }

export default function ListProblemPage() {
    const { list_nm } = useParams<{ list_nm: string }>()
    return (
        <Page
            pageContext={{
                title: `List ${list_nm}`,
                menu: 'user',
                current: 'lists',
                subTitle: `Lists ❯ ${list_nm}`,
                subMenu: 'lists',
                subCurrent: 'items',
            }}
        >
            <ListProblemView />
        </Page>
    )
}

function ListProblemView() {
    const { list_nm } = useParams<{ list_nm: string }>()
    const auth = useAuth()
    const [list, setList] = useState<InstructorList | null>(null)
    const [problems, setProblems] = useState<Record<string, AbstractProblem>>({})
    const [items, setItems] = useState<Item[]>([])
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
    const gridRef = useRef<AgGridReact<Item>>(null)

    const [colDefs, setColDefs] = useState([
        {
            rowDrag: true,
            field: 'problem',
            headerName: 'Items',
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
                        {p.data.title}
                    </div>
                ) : (
                    <div className="italic">{p.data.description}</div>
                ),
            flex: 1,
            sortable: false,
        },
    ])

    useEffect(() => {
        async function fetchData() {
            const list = await jutge.instructor.lists.get(list_nm)
            const problems = await jutge.problems.getAllAbstractProblems()
            const items = list.items.map((item) => ({
                problem_nm: item.problem_nm,
                description: item.description,
                title: item.problem_nm ? getTitle(auth.user!, item.problem_nm, problems) : null,
            }))
            setProblems(problems)
            setList(list)
            setItems(items)
        }

        fetchData()
    }, [list_nm, auth])

    const rowSelection = useMemo<RowSelectionOptions | 'single' | 'multiple'>(() => {
        return { mode: 'multiRow', headerCheckbox: false }
    }, [])

    const onGridReady = useCallback(() => {}, [])

    async function updateAction() {
        const items: InstructorListItem[] = []
        gridRef.current!.api.forEachNode((rowNode, index) => {
            if (rowNode.data?.problem_nm) {
                items.push({
                    problem_nm: rowNode.data?.problem_nm,
                    description: null,
                })
            } else {
                items.push({
                    problem_nm: null,
                    description: rowNode.data?.description || 'Separator',
                })
            }
        })
        const list = await jutge.instructor.lists.get(list_nm)
        const newList = { ...list, items }
        await jutge.instructor.lists.update(newList)
        toast.success(`Problems updated.`)
    }

    async function addProblemsCallback(problemsToAdd: string[]) {
        const grid = gridRef.current!.api
        const itemsToAdd: Item[] = problemsToAdd.map((problem_nm) => ({
            problem_nm,
            title: getTitle(auth.user!, problem_nm, problems),
            description: null,
        }))
        const selectedRows = grid.getSelectedNodes().map((node) => node.rowIndex) as number[]
        const index = selectedRows.length > 0 ? Math.max(...selectedRows) : items.length
        const newItems = [...items.slice(0, index + 1), ...itemsToAdd, ...items.slice(index + 1)]
        setItems(newItems)
        setTimeout(() => grid.ensureIndexVisible(index, 'middle'), 100) // wait for the new row to be rendered
    }

    async function addSeparatorCallback(separator: string) {
        const grid = gridRef.current!.api
        const itemToAdd: Item = {
            problem_nm: null,
            title: null,
            description: separator,
        }
        const selectedRows = grid.getSelectedNodes().map((node) => node.rowIndex) as number[]
        const index = selectedRows.length > 0 ? Math.max(...selectedRows) : items.length
        const newItems = [...items.slice(0, index + 1), itemToAdd, ...items.slice(index + 1)]
        setItems(newItems)
        setTimeout(() => grid.ensureIndexVisible(index, 'middle'), 100) // wait for the new row to be rendered
    }

    async function deleteAction() {
        const grid = gridRef.current!.api
        const selectedRows = grid.getSelectedNodes().map((node) => node.rowIndex) as number[]
        if (selectedRows.length === 0) {
            toast.warning('Select the items to delete.')
            return
        }
        const newItems = items.filter((_, index) => !selectedRows.includes(index))
        setItems(newItems)
    }

    if (list === null) return <Spinner />

    return (
        <>
            <div className="h-[calc(100vh-200px)] w-full">
                <AgTableFull
                    rowData={items}
                    columnDefs={colDefs}
                    rowDragManaged={true}
                    rowDragMultiRow={true}
                    rowSelection={rowSelection}
                    onGridReady={onGridReady}
                    ref={gridRef}
                />
            </div>
            <div className="mt-4 flex flex-row-reverse gap-2">
                <Button className="w-28 justify-start" onClick={updateAction}>
                    <SaveIcon /> Save
                </Button>
                <Button className="w-28 justify-start" onClick={deleteAction}>
                    <CircleMinusIcon /> Remove
                </Button>
                <Button className="w-28 justify-start" onClick={() => setIsAddDialogOpen(true)}>
                    <PlusCircleIcon /> Add
                </Button>
            </div>
            <DialogToAddProblems
                isOpen={isAddDialogOpen}
                setIsOpen={setIsAddDialogOpen}
                onProblemsAccept={addProblemsCallback}
                onSeparatorAccept={addSeparatorCallback}
                problems={problems}
            />
        </>
    )
}

function DialogToAddProblems({
    problems,
    isOpen,
    setIsOpen,
    onProblemsAccept,
    onSeparatorAccept,
}: {
    problems: Record<string, AbstractProblem>
    isOpen: boolean
    setIsOpen: (open: boolean) => void
    onProblemsAccept: (selectedProblems: string[]) => Promise<void>
    onSeparatorAccept: (separator: string) => Promise<void>
}) {
    const auth = useAuth()
    const [separator, setSeparator] = useState('')
    const [rows, setRows] = useState<ProblemItem[]>(
        Object.entries(problems)
            .map(([problem_nm, problem]) => ({
                problem_nm,
                title: getTitle(auth.user!, problem_nm, problems),
            }))
            .sort((a, b) => a.problem_nm.localeCompare(b.problem_nm)),
    )
    const [colDefs, setColDefs] = useState([
        {
            field: 'problem_nm',
            headerName: 'Problem',
            width: 120,
            cellRenderer: (p: any) => (
                <a target="_blank" href={`https://jutge.org/problems/${p.data.problem_nm}`}>
                    {p.data.problem_nm}↗
                </a>
            ),
        },
        { field: 'title', flex: 1, filter: true },
    ])
    const gridRef = useRef<AgGridReact<Item>>(null)

    const onGridReady = useCallback(() => {
        gridRef.current!.api.setGridOption('headerHeight', 32)
    }, [])

    const rowSelection = useMemo<RowSelectionOptions | 'single' | 'multiple'>(() => {
        return { mode: 'multiRow', headerCheckbox: false }
    }, [])

    async function addProblemsCallback() {
        const grid = gridRef.current!.api
        const selectedProblems = grid
            .getSelectedNodes()
            .map((node) => node.data?.problem_nm) as string[]
        setIsOpen(false)
        onProblemsAccept(selectedProblems)
    }

    async function addSeparatorCallback() {
        setIsOpen(false)
        onSeparatorAccept(separator)
    }

    useEffect(() => {}, [isOpen])

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add items to list</DialogTitle>
                    <Tabs defaultValue="account">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="problems">Problems</TabsTrigger>
                            <TabsTrigger value="separator">Separator</TabsTrigger>
                        </TabsList>

                        <TabsContent value="problems">
                            <div className="h-96 w-full pt-4 pb-4">
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
                            <Button onClick={addProblemsCallback} className="w-full mt-2">
                                <PlusCircleIcon />
                                Add problems
                            </Button>
                        </TabsContent>

                        <TabsContent value="separator">
                            <div className="h-96 w-full pt-4 pb-4">
                                <div className="mt-32 flex flex-col gap-2">
                                    <p className="text-sm font-bold">Separator:</p>
                                    <Input
                                        className="w-full"
                                        placeholder="My separator"
                                        value={separator}
                                        onChange={(e) => setSeparator(e.target.value)}
                                    />
                                </div>
                            </div>
                            <Button onClick={addSeparatorCallback} className="w-full mt-2">
                                <PlusCircleIcon />
                                Add separator
                            </Button>
                        </TabsContent>
                    </Tabs>
                </DialogHeader>
            </DialogContent>
        </Dialog>
    )
}
