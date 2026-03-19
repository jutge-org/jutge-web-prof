'use client'

import Page from '@/components/layout/Page'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { AgTableFull } from '@/components/wrappers/AgTable'
import jutge from '@/lib/jutge'
import { AbstractProblem } from '@/lib/jutge_api_client'
import { mapmap } from '@/lib/utils'
import { ICellRendererParams } from 'ag-grid-community'
import {
    BotIcon,
    BotMessageSquareIcon,
    CodeXmlIcon,
    FileCodeIcon,
    ListTodoIcon,
    PenToolIcon,
    SearchIcon,
    SwordsIcon,
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

type FinderProblemRow = {
    problem_nm: string
    title: string
    author: string | null
    driver_id: string | null
    type: string | null
    compilers: string | null
    deprecated: boolean
    languages: string[]
    abstractProblems: Record<string, AbstractProblem>
}

export default function FinderListPage() {
    return (
        <Page
            pageContext={{
                title: 'Finder',
                menu: 'user',
                current: 'finder',
                subTitle: 'Finder',
                subMenu: 'main',
            }}
        >
            <FinderListView />
        </Page>
    )
}

function FinderListView() {
    const [rows, setRows] = useState<FinderProblemRow[]>([])
    const [loading, setLoading] = useState(true)
    const [query, setQuery] = useState('')
    const router = useRouter()

    const colDefs = [
        {
            field: 'problem_nm',
            headerName: 'Id',
            cellRenderer: (p: ICellRendererParams<FinderProblemRow>) => (
                <Link href={`/finder/${p.data!.problem_nm}`}>
                    {p.data!.problem_nm}
                    {p.data!.deprecated ? ' 💀' : ''}
                </Link>
            ),
            width: 100,
            filter: true,
            valueGetter: (p: ICellRendererParams<FinderProblemRow>) => p.data!.problem_nm,
        },
        { field: 'title', flex: 2, filter: true },
        {
            field: 'author',
            headerName: 'Author',
            flex: 1,
            filter: true,
            valueGetter: (p: ICellRendererParams<FinderProblemRow>) => p.data!.author ?? '—',
        },
        /*
        {
            field: 'driver_id',
            headerName: 'Driver',
            width: 120,
            filter: true,
            valueGetter: (p: ICellRendererParams<FinderProblemRow>) => p.data!.driver_id ?? '—',
        },
        */
        {
            field: 'type',
            headerName: 'Type',
            width: 150,
            filter: true,
            cellStyle: { display: 'flex', alignItems: 'center' },
            cellRenderer: (p: ICellRendererParams<FinderProblemRow>) => {
                const type = p.data!.type ?? '—'
                const compilers = p.data!.compilers?.trim()
                const normalizedType = type.toLowerCase()
                const Icon =
                    normalizedType === 'graphic'
                        ? PenToolIcon
                        : normalizedType === 'game'
                          ? SwordsIcon
                          : normalizedType === 'classic' || normalizedType === 'std'
                            ? FileCodeIcon
                            : normalizedType === 'quiz'
                              ? ListTodoIcon
                              : CodeXmlIcon

                return (
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="flex w-full items-center gap-1">
                                    <span title={type} aria-label={type}>
                                        <Icon size={16} />
                                    </span>
                                    {compilers ? (
                                        <Badge
                                            variant="secondary"
                                            className="max-w-24 truncate px-1"
                                            title={compilers}
                                        >
                                            {compilers}
                                        </Badge>
                                    ) : null}
                                </div>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>{type}</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                )
            },
            valueGetter: (p: ICellRendererParams<FinderProblemRow>) => p.data!.type ?? '—',
        },
        {
            field: 'languages',
            width: 150,
            filter: true,
            cellStyle: { display: 'flex', justifyContent: 'flex-start', alignItems: 'center' },
            cellRenderer: (p: ICellRendererParams<FinderProblemRow>) => {
                const abstractProblem = p.data!.abstractProblems[p.data!.problem_nm]
                return (
                    <div className="flex flex-wrap justify-start gap-1">
                        {p.data!.languages.map((language: string) => {
                            const briefProblem = Object.values(
                                abstractProblem?.problems ?? {},
                            ).find((problem) => problem.language_id === language)
                            return briefProblem?.summary ? (
                                <TooltipProvider key={language}>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Badge variant="secondary" className="px-1">
                                                {language}
                                            </Badge>
                                        </TooltipTrigger>
                                        <TooltipContent className="flex flex-col w-64 gap-2">
                                            <p className="font-semibold">
                                                {briefProblem.summary.summary_1s}
                                            </p>
                                            <p>{briefProblem.summary.summary_1p}</p>
                                            <p>
                                                {briefProblem.summary.keywords.replaceAll(
                                                    ',',
                                                    ', ',
                                                )}
                                            </p>
                                            <p className="flex gap-1">
                                                <BotIcon size={14} className="" />
                                                {briefProblem.summary.model}
                                            </p>
                                            <hr />
                                            <p>
                                                {abstractProblem?.solution_tags?.tags.replaceAll(
                                                    ',',
                                                    ', ',
                                                )}
                                            </p>
                                            <p className="flex gap-1">
                                                <BotIcon size={14} className="" />
                                                {abstractProblem?.solution_tags?.model}
                                            </p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            ) : (
                                <Badge key={language} variant="secondary" className="px-2">
                                    {language}
                                </Badge>
                            )
                        })}
                    </div>
                )
            },
            valueGetter: (p: ICellRendererParams<FinderProblemRow>) => p.data!.languages.join(', '),
        },
    ]

    useEffect(() => {
        async function load() {
            setLoading(true)
            try {
                const allAbstract = await jutge.problems.getAllAbstractProblems()

                function buildTitle(problem_nm: string, ap: AbstractProblem) {
                    const problems = Object.values(ap.problems)
                    return problems.map((problem) => problem.title).join(' / ')
                }

                const list = Object.values(allAbstract).map((ap) => {
                    return {
                        problem_nm: ap.problem_nm,
                        title: buildTitle(ap.problem_nm, ap),
                        author: ap.author,
                        driver_id: ap.driver_id,
                        type: ap.type,
                        compilers: ap.compilers,
                        deprecated: ap.deprecation !== null,
                        languages: mapmap(ap.problems, (_id, problem) => problem.language_id),
                        abstractProblems: allAbstract,
                    } satisfies FinderProblemRow
                })
                list.sort((a, b) => a.problem_nm.localeCompare(b.problem_nm))
                setRows(list)
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [])

    function goToSearch(mode: 'semantic' | 'text') {
        const trimmedQuery = query.trim()
        const params = new URLSearchParams({ mode })
        if (trimmedQuery.length > 0) params.set('q', trimmedQuery)
        router.push(`/finder/search?${params.toString()}`)
    }

    return (
        <>
            <AgTableFull rowData={rows} columnDefs={colDefs as any} loading={loading} />
            <div className="mt-4 flex flex-row gap-2 items-center">
                <div className="flex-grow" />
                <div className="text-xs text-gray-500">{rows.length} available problems</div>
                <div className="flex-grow" />
                <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="What do you want to find?"
                    className="w-72"
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') goToSearch('text')
                    }}
                />
                <Button
                    className="w-12 justify-start"
                    title="Text search in finder"
                    onClick={() => goToSearch('text')}
                >
                    <SearchIcon />
                </Button>
                <Button
                    className="w-12 justify-start"
                    title="Semantic search in finder"
                    onClick={() => goToSearch('semantic')}
                >
                    <BotIcon />
                </Button>
            </div>
        </>
    )
}
