'use client'

import Page from '@/components/layout/Page'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { AgTableFull } from '@/components/wrappers/AgTable'
import jutge from '@/lib/jutge'
import { AbstractProblem } from '@/lib/jutge_api_client'
import { mapmap } from '@/lib/utils'
import { ICellRendererParams } from 'ag-grid-community'
import { BotIcon, BotMessageSquareIcon, SearchIcon } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'

type FinderProblemRow = {
    problem_nm: string
    title: string
    author: string | null
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

    const colDefs = [
        {
            field: 'problem_nm',
            headerName: 'Id',
            cellRenderer: (p: ICellRendererParams<FinderProblemRow>) => (
                <Link href={`/finder/${p.data!.problem_nm}`}>{p.data!.problem_nm}</Link>
            ),
            width: 100,
            filter: true,
            valueGetter: (p: ICellRendererParams<FinderProblemRow>) => p.data!.problem_nm,
        },
        { field: 'title', flex: 2, filter: true },
        {
            field: 'author',
            headerName: 'Author',
            flex: 2,
            filter: true,
            valueGetter: (p: ICellRendererParams<FinderProblemRow>) => p.data!.author ?? '—',
        },
        {
            field: 'languages',
            width: 150,
            filter: true,
            cellRenderer: (p: ICellRendererParams<FinderProblemRow>) =>
                p.data!.languages.map((language: string) => (
                    <div key={language}>
                        {p.data!.abstractProblems[p.data!.problem_nm]?.problems[
                            `${p.data!.problem_nm}_${language}`
                        ]?.summary ? (
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Badge variant="secondary" className="mr-1 px-2">
                                            {language}{' '}
                                            <BotMessageSquareIcon size={12} className="ml-1" />
                                        </Badge>
                                    </TooltipTrigger>
                                    <TooltipContent className="flex flex-col w-64 gap-2">
                                        <p className="font-semibold">
                                            {
                                                p.data!.abstractProblems[p.data!.problem_nm]
                                                    .problems[`${p.data!.problem_nm}_${language}`]
                                                    ?.summary?.summary_1s
                                            }
                                        </p>
                                        <p>
                                            {
                                                p.data!.abstractProblems[p.data!.problem_nm]
                                                    .problems[`${p.data!.problem_nm}_${language}`]
                                                    ?.summary?.summary_1p
                                            }
                                        </p>
                                        <p>
                                            {p.data!.abstractProblems[p.data!.problem_nm].problems[
                                                `${p.data!.problem_nm}_${language}`
                                            ]?.summary?.keywords.replaceAll(',', ', ')}
                                        </p>
                                        <p className="flex gap-1">
                                            <BotIcon size={14} className="" />
                                            {
                                                p.data!.abstractProblems[p.data!.problem_nm]
                                                    .problems[`${p.data!.problem_nm}_${language}`]
                                                    ?.summary?.model
                                            }
                                        </p>
                                        <hr />
                                        <p>
                                            {p.data!.abstractProblems[
                                                p.data!.problem_nm
                                            ].solution_tags?.tags.replaceAll(',', ', ')}
                                        </p>
                                        <p className="flex gap-1">
                                            <BotIcon size={14} className="" />
                                            {
                                                p.data!.abstractProblems[p.data!.problem_nm]
                                                    .solution_tags?.model
                                            }
                                        </p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        ) : (
                            <Badge variant="secondary" className="mr-1 px-2">
                                {language}
                            </Badge>
                        )}
                    </div>
                )),
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

                const list = Object.values(allAbstract)
                    .filter((ap) => ap.deprecation === null)
                    .map((ap) => {
                        return {
                            problem_nm: ap.problem_nm,
                            title: buildTitle(ap.problem_nm, ap),
                            author: ap.author,
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

    return (
        <>
            <AgTableFull rowData={rows} columnDefs={colDefs as any} loading={loading} />
            <div className="mt-4 flex flex-row items-center gap-2">
                <div className="flex-grow" />
                <Link href="/finder/search">
                    <Button className="w-36 justify-start" title="Search problems in the finder">
                        <SearchIcon />
                        Search
                    </Button>
                </Link>
            </div>
        </>
    )
}
