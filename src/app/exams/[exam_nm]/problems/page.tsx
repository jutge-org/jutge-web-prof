'use client'

import { AgTableFull } from '@/components/AgTable'
import Page from '@/components/Page'
import Spinner from '@/components/Spinner'
import { Button } from '@/components/ui/button'
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command'
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import jutge, { getProblemTitle } from '@/lib/jutge'
import {
    AbstractProblem,
    InstructorExam,
    InstructorExamProblem,
    Profile,
} from '@/lib/jutge_api_client'
import { cn, Dict, mapmap, showError } from '@/lib/utils'
import { useAuth } from '@/providers/Auth'
import { RowSelectionOptions } from 'ag-grid-community'
import { AgGridReact } from 'ag-grid-react'
import {
    Check,
    CircleMinusIcon,
    EditIcon,
    PaintbrushIcon,
    PlusCircleIcon,
    SaveIcon,
    XCircleIcon,
} from 'lucide-react'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import { capitalize } from 'radash'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'

export default function ExamProblemsPage() {
    const { exam_nm } = useParams<{ exam_nm: string }>()
    return (
        <Page
            pageContext={{
                title: `Exam ${exam_nm}`,
                menu: 'user',
                current: 'exams',
                subTitle: `Exams ❯ ${exam_nm}`,
                subMenu: 'exams',
                subCurrent: 'problems',
            }}
        >
            <ExamProblemsView />
        </Page>
    )
}

function ExamProblemsView() {
    //

    const { exam_nm } = useParams<{ exam_nm: string }>()

    const auth = useAuth()

    const [exam, setExam] = useState<InstructorExam | null>(null)

    const [allAbstractProblems, setAllAbstractProblems] = useState<Dict<AbstractProblem> | null>(
        null,
    )

    const [usedAbstractProblems, setUsedAbstractProblems] = useState<Dict<AbstractProblem> | null>(
        null,
    )

    const [rows, setRows] = useState<InstructorExamProblem[]>([])

    const [colDefs, setColDefs] = useState<any>([])

    const [isDialogOpen, setIsDialogOpen] = useState(false)

    const [dialogKey, setDialogKey] = useState<number | null>(null)

    const [problemToEdit, setProblemToEdit] = useState<InstructorExamProblem | null>(null)

    const gridRef = useRef<AgGridReact<InstructorExamProblem>>(null)

    const rowSelection = useMemo<RowSelectionOptions | 'single' | 'multiple'>(() => {
        return { mode: 'multiRow', headerCheckbox: false }
    }, [])

    const fetchData = useCallback(async () => {
        const exam = await jutge.instructor.exams.get(exam_nm)
        const problem_nms = exam.problems.map((p) => p.problem_nm).join(',')
        const usedAbstractProblems = await jutge.problems.getAbstractProblems(problem_nms)

        const defs = [
            {
                field: 'problem_nm',
                headerName: 'Problem',
                width: 125,
                sortable: false,
                rowDrag: true,
                cellRenderer: (p: any) => (
                    <a href={`https://jutge.org/problems/${p.data.problem_nm}`} target="_blank">
                        {p.data.problem_nm}↗
                    </a>
                ),
            },
            {
                field: 'title',
                flex: 1,
                sortable: false,
                cellRenderer: (p: any) =>
                    getProblemTitle(
                        auth.user!,
                        p.data.problem_nm,
                        allAbstractProblems !== null ? allAbstractProblems : usedAbstractProblems,
                    ),
            },
            { field: 'caption', width: 100, sortable: false },
            { field: 'weight', width: 100, sortable: false, editable: false },
            {
                field: 'icon',
                width: 70,
                sortable: false,
                cellRenderer: (p: any) =>
                    p.data.icon ? (
                        <Image
                            src={`https://jutge.org/img/examicons/${p.data.icon}.svg`}
                            alt={p.data.icon}
                            width={20}
                            height={20}
                            className="pt-2"
                        />
                    ) : null,
            },
        ]

        setExam(exam)
        setUsedAbstractProblems(usedAbstractProblems)
        setRows(exam.problems)
        setColDefs(defs)
    }, [exam_nm, auth.user, allAbstractProblems])

    const fetchProblems = useCallback(async () => {
        const allAbstractProblems = await jutge.problems.getAllAbstractProblems()
        setAllAbstractProblems(allAbstractProblems)
    }, [])

    useEffect(() => {
        fetchProblems()
    }, [exam_nm, fetchProblems])

    useEffect(() => {
        fetchData()
    }, [exam_nm, fetchData])

    async function addCallback(problem: InstructorExamProblem) {
        setRows((oldRows) => [...oldRows, problem])
    }

    async function editCallback(problem: InstructorExamProblem) {
        const index = rows.findIndex((p) => p.problem_nm === problem.problem_nm)
        if (index === -1) return
        const newRows = [...rows]
        newRows[index] = problem
        setRows(newRows)
    }

    async function addAction() {
        setIsDialogOpen(true)
        setDialogKey(Math.random())
        setProblemToEdit(null)
    }

    async function removeAction() {
        const grid = gridRef.current!.api
        const selectedRows = grid.getSelectedNodes().map((node) => node.rowIndex) as number[]
        if (selectedRows.length === 0) {
            toast.info('Select problems to remove.')
            return
        }
        const newRows = rows.filter((_, index) => !selectedRows.includes(index))
        setRows(newRows)
    }

    async function editAction() {
        const grid = gridRef.current!.api
        const selectedRows = grid.getSelectedNodes().map((node) => node.rowIndex) as number[]
        if (selectedRows.length !== 1) {
            toast.info('Select exactly one problem to edit.')
            return
        }
        const problem = selectedRows.map((index) => rows[index])[0]
        setProblemToEdit(problem)
        console.log('editAction', problem)
        setIsDialogOpen(true)
        setDialogKey(Math.random())
    }

    async function saveAction() {
        const problems: InstructorExamProblem[] = []
        gridRef.current!.api.forEachNode((rowNode, index) => {
            if (rowNode.data) problems.push(rowNode.data)
        })
        try {
            await jutge.instructor.exams.updateProblems({ exam_nm, problems })
            toast.success(`Problems of the exam saved.`)
            await fetchData()
        } catch (error) {
            showError(error)
        }
    }

    async function decorateAction() {
        const newRows = rows.map((row, index) => ({
            ...row,
            caption: row.caption || `P${index + 1}`,
            icon: row.icon || `numbers/${index + 1}`,
            weight: row.weight || 1,
        }))
        setRows(newRows)
    }

    if (auth.user === null || exam === null || usedAbstractProblems === null) return <Spinner />

    return (
        <>
            <AgTableFull
                rowData={rows}
                columnDefs={colDefs}
                rowDragManaged={true}
                rowDragMultiRow={true}
                ref={gridRef}
                rowSelection={rowSelection}
            />
            <div className="mt-4 flex flex-row gap-2">
                <div className="flex-grow" />
                <Button className="w-28 justify-start" onClick={addAction} title="Add a problem">
                    {' '}
                    <PlusCircleIcon /> Add
                </Button>
                <Button
                    className="w-28 justify-start"
                    onClick={editAction}
                    title="Edit selected problem"
                >
                    <EditIcon /> Edit
                </Button>
                <Button
                    className="w-28 justify-start"
                    onClick={removeAction}
                    title="Remove all selected problems"
                >
                    <CircleMinusIcon /> Remove
                </Button>
                <Button
                    className="w-28 justify-start"
                    onClick={decorateAction}
                    title="Add captions, wieghts and icons to all problems"
                >
                    <PaintbrushIcon /> Decorate
                </Button>
                <Button
                    className="w-28 justify-start"
                    onClick={saveAction}
                    title="Save problems of the exam"
                >
                    <SaveIcon /> Save
                </Button>
            </div>
            <ProblemDialog
                key={dialogKey}
                setKey={setDialogKey}
                isOpen={isDialogOpen}
                setIsOpen={setIsDialogOpen}
                user={auth.user}
                onAddAccept={addCallback}
                onEditAccept={editCallback}
                allAbstractProblems={allAbstractProblems}
                problem={problemToEdit}
            />
        </>
    )
}

type ProblemDialogProps = {
    key: number | null
    setKey: (key: number | null) => void
    isOpen: boolean
    setIsOpen: (isOpen: boolean) => void

    problem: InstructorExamProblem | null
    user: Profile
    allAbstractProblems: Record<string, AbstractProblem> | null

    onAddAccept: (problem: InstructorExamProblem) => void
    onEditAccept: (problem: InstructorExamProblem) => void
}

function ProblemDialog(props: ProblemDialogProps) {
    //

    // form state
    const [problem_nm, setProblemNm] = useState<string | null>(
        props.problem === null ? null : props.problem.problem_nm,
    )
    const [caption, setCaption] = useState<string | null>(
        props.problem === null ? null : props.problem.caption,
    )
    const [weight, setWeight] = useState<number | null>(
        props.problem === null ? null : props.problem.weight,
    )
    const [weightString, setWeightString] = useState<string>(
        props.problem === null || props.problem.weight === null
            ? ''
            : props.problem.weight.toString(),
    )
    const [icon, setIcon] = useState<string | null>(
        props.problem === null ? null : props.problem.icon,
    )

    async function acceptAction() {
        if (problem_nm === null) {
            toast.info('Select a problem.')
            return
        }
        const newProblem = {
            problem_nm,
            caption,
            weight,
            icon,
        }
        props.setKey(null)
        props.setIsOpen(false)
        if (props.problem === null) props.onAddAccept(newProblem)
        else props.onEditAccept(newProblem)
    }

    if (props.allAbstractProblems === null) {
        return (
            <Dialog open={props.isOpen} onOpenChange={props.setIsOpen}>
                <DialogContent className="pb-32">
                    <DialogHeader>
                        <DialogTitle>Loading problems...</DialogTitle>
                    </DialogHeader>
                    <Spinner />
                </DialogContent>
            </Dialog>
        )
    }

    return (
        <Dialog open={props.isOpen} onOpenChange={props.setIsOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        {props.problem ? 'Edit problem of exam' : 'Add problem to exam'}
                    </DialogTitle>

                    <div className="flex flex-row gap-2 pt-2">
                        <div className="font-bold text-sm pt-2 w-20">Problem</div>
                        <ProblemsCombobox
                            value={problem_nm}
                            setValue={setProblemNm}
                            user={props.user}
                            allAbstractProblems={props.allAbstractProblems}
                        />
                    </div>

                    <div className="flex flex-row gap-2 pt-2">
                        <div className="font-bold text-sm pt-2 w-20">Caption</div>
                        <Input
                            value={caption || ''}
                            onChange={(e) => setCaption(e.target.value.trim())}
                        />
                    </div>

                    <div className="flex flex-row gap-2 pt-2">
                        <div className="font-bold text-sm pt-2 w-20">Weigth</div>
                        <Input
                            value={weightString}
                            onChange={(e) => setWeightString(e.target.value.trim())}
                            onBlur={() => {
                                if (weightString === '') setWeight(null)
                                else {
                                    const weight = Number(weightString)
                                    console.log('weight', weight)
                                    if (isNaN(weight)) setWeight(null)
                                    else setWeight(weight)
                                    setWeightString(isNaN(weight) ? '' : weight.toString())
                                }
                            }}
                        />
                    </div>

                    <div className="flex flex-row gap-2 pt-2">
                        <div className="font-bold text-sm pt-2 w-20">Icon</div>
                        <ExamIcons value={icon} setValue={setIcon} />
                    </div>

                    <DialogFooter className="pt-8">
                        <Button onClick={acceptAction} className="w-full">
                            {props.problem ? <EditIcon /> : <PlusCircleIcon />}
                            {props.problem ? 'Edit' : 'Add'} problem
                        </Button>
                    </DialogFooter>
                </DialogHeader>
            </DialogContent>
        </Dialog>
    )
}

type ExamIconsProps = {
    value: string | null
    setValue: (icon: string | null) => void
}

function ExamIcons(props: ExamIconsProps) {
    //

    const [icons, setIcons] = useState<Dict<string[]> | null>(null)
    const [theme, setTheme] = useState<string | null>(null)

    useEffect(() => {
        async function fetchData() {
            const icons = await jutge.misc.getExamIcons()
            setIcons(icons)
            setTheme('basic')
        }
        fetchData()
    }, [])

    return (
        <>
            {icons !== null && theme !== null && (
                <div className="w-full flex flex-col gap-2">
                    <div className="flex flex-row gap-2 items-center">
                        <div className="border rounded-lg w-12 h-12 p-2">
                            {props.value !== null && (
                                <div className="w-full flex flex-row gap-4">
                                    <Image
                                        src={`https://jutge.org/img/examicons/${props.value}.svg`}
                                        alt={props.value}
                                        width={32}
                                        height={32}
                                    />
                                </div>
                            )}
                        </div>
                        <div className="flex-grow" />
                        {props.value !== null && (
                            <Button
                                onClick={() => props.setValue(null)}
                                title="Remove icon"
                                className="text-gray-500"
                                variant={'outline'}
                            >
                                <XCircleIcon size={24} />
                            </Button>
                        )}
                    </div>
                    <div className="w-full border rounded-lg p-2 flex flex-col gap-2">
                        <ScrollArea className="h-28">
                            <div className="grid grid-cols-9 gap-0">
                                {icons[theme].map((svg) => (
                                    <div
                                        key={svg}
                                        className={cn(
                                            svg === props.value ? 'border rounded-lg' : '',
                                            'w-8 h-8 p-1',
                                        )}
                                    >
                                        <Image
                                            src={`https://jutge.org/img/examicons/${svg}.svg`}
                                            alt={svg}
                                            width={24}
                                            height={24}
                                            onClick={() => props.setValue(svg)}
                                        />
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                        <div className="flex flex-row gap-2">
                            <Select onValueChange={setTheme} value={theme}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Theme" />
                                </SelectTrigger>
                                <SelectContent>
                                    {mapmap(icons, (theme, svgs) => (
                                        <SelectItem key={theme} value={theme}>
                                            {capitalize(theme)}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

type ProblemsComboboxProps = {
    value: string | null
    setValue: (problem_nm: string) => void
    user: Profile
    allAbstractProblems: Dict<AbstractProblem>
}

function ProblemsCombobox(props: ProblemsComboboxProps) {
    //
    // the difficulty here is that a too long list of problems is not practical
    // and not well handles by shadcn
    // so we need to filter the list of problems

    type Item = { key: string; value: string; titles: string }

    const [open, setOpen] = useState(false) // is the popover open?
    const [inputValue, setInputValue] = useState(props.value || '') // value of the input
    const [search, setSearch] = useState('') // value of the search input
    const [shownItems, setShownItems] = useState<Item[]>([]) // items to show in the list

    const allItems: Item[] = // all items that can be shown
        mapmap(props.allAbstractProblems, (problem_nm, problem) => ({
            key: problem_nm,
            value:
                problem_nm +
                ' · ' +
                getProblemTitle(props.user, problem_nm, props.allAbstractProblems),
            titles:
                problem_nm.toLowerCase() +
                ' ' +
                mapmap(problem.problems, (problem_id, problem) => problem.title)
                    .join(' ')
                    .toLowerCase(),
        })).sort((a, b) => a.value.localeCompare(b.value))

    function findItems(search: string) {
        if (search.length < 2) return []
        const sLower = search.toLowerCase()
        return allItems.filter(
            (item) => item.value.includes(search) || item.titles.includes(sLower),
        )
    }

    return (
        <div className="w-full">
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Input className="w-full text-left" value={inputValue} />
                </PopoverTrigger>
                <PopoverContent className="w-[400px] p-0 shadow-xl">
                    <Command>
                        <CommandInput
                            placeholder="Search problem..."
                            value={search}
                            onValueChange={(search: string) => {
                                setShownItems(findItems(search))
                                setSearch(search)
                            }}
                        />
                        <CommandList>
                            <ScrollArea className="h-64">
                                <CommandEmpty>
                                    {search.length < 2
                                        ? `Type two characters at least to start searching.`
                                        : 'No matching problems found.'}
                                </CommandEmpty>
                                <CommandGroup>
                                    {shownItems.map((item) => (
                                        <CommandItem
                                            key={item.key}
                                            value={item.titles}
                                            onSelect={(currentValue) => {
                                                setInputValue(item.value)
                                                props.setValue(item.key)
                                                setOpen(false)
                                                setSearch('')
                                            }}
                                        >
                                            <Check
                                                className={cn(
                                                    'mr-2 h-4 w-4',
                                                    inputValue === item.value
                                                        ? 'opacity-100'
                                                        : 'opacity-0',
                                                )}
                                            />
                                            <div className="flex flex-col">
                                                <div className="font-bold">{item.key}</div>
                                                {mapmap(
                                                    props.allAbstractProblems[item.key].problems,
                                                    (problem_id, problem) => (
                                                        <div key={problem_id} className="text-sm">
                                                            {problem.title}
                                                        </div>
                                                    ),
                                                )}
                                            </div>
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            </ScrollArea>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
        </div>
    )
}
