'use client'

import { AbstractProblem, SharingSettings } from '@/lib/jutge_api_client'
import { ICellRendererParams } from 'ag-grid-community'
import {
    BotIcon,
    BotMessageSquareIcon,
    FileBoxIcon,
    FileCodeIcon,
    LockIcon,
    SearchIcon,
    UnlockIcon,
} from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import Page from '@/components/layout/Page'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip'
import { AgTableFull } from '@/components/wrappers/AgTable'
import jutge from '@/lib/jutge'
import { mapmap } from '@/lib/utils'

type StoreProblemRow = {
    problem_nm: string
    title: string
    author: string | null
    deprecated: boolean
    languages: string[]
    passcode: boolean | null
    shared_testcases: boolean | null
    shared_solutions: boolean | null
    abstractProblems: Record<string, AbstractProblem>
}

export default function StoreListPage() {
    return (
        <Page
            pageContext={{
                title: 'Store',
                menu: 'user',
                current: 'store',
                subTitle: 'Store',
                subMenu: 'main',
            }}
        >
            <StoreListView />
        </Page>
    )
}

function StoreListView() {
    const [rows, setRows] = useState<StoreProblemRow[]>([])
    const [loading, setLoading] = useState(true)

    const colDefs = [
        {
            field: 'problem_nm',
            headerName: 'Id',
            cellRenderer: (p: ICellRendererParams<StoreProblemRow>) => (
                <Link href={`/store/${p.data!.problem_nm}`}>{p.data!.problem_nm}</Link>
            ),
            width: 100,
            filter: true,
            valueGetter: (p: ICellRendererParams<StoreProblemRow>) => p.data!.problem_nm,
        },
        { field: 'title', flex: 2, filter: true },
        {
            field: 'author',
            headerName: 'Author',
            flex: 2,
            filter: true,
            valueGetter: (p: ICellRendererParams<StoreProblemRow>) => p.data!.author ?? '—',
        },
        {
            field: 'sharing',
            headerName: 'Sharing',
            width: 120,
            filter: false,
            sort: false,
            cellRenderer: (p: ICellRendererParams<StoreProblemRow>) => (
                <StoreSharingCell row={p.data!} />
            ),
        },
        {
            field: 'languages',
            width: 150,
            filter: true,
            cellRenderer: (p: ICellRendererParams<StoreProblemRow>) =>
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
            valueGetter: (p: ICellRendererParams<StoreProblemRow>) => p.data!.languages.join(', '),
        },
    ]

    useEffect(() => {
        async function load() {
            setLoading(true)
            try {
                const [allAbstract, sharingList] = await Promise.all([
                    jutge.problems.getAllAbstractProblems(),
                    jutge.instructor.problems.getAllSharingSettings(),
                ])
                const sharingByNm: Record<string, SharingSettings> = Object.fromEntries(
                    sharingList.map((s) => [s.problem_nm, s]),
                )

                function buildTitle(problem_nm: string, ap: AbstractProblem) {
                    const problems = Object.values(ap.problems)
                    return problems.map((problem) => problem.title).join(' / ')
                }

                const list = Object.values(allAbstract)
                    .filter((ap) => ap.deprecation === null)
                    .map((ap) => {
                        const sharing = sharingByNm[ap.problem_nm]
                        return {
                            problem_nm: ap.problem_nm,
                            title: buildTitle(ap.problem_nm, ap),
                            author: ap.author,
                            deprecated: ap.deprecation !== null,
                            languages: mapmap(ap.problems, (_id, problem) => problem.language_id),
                            passcode:
                                sharing !== undefined ? sharing.passcode !== null : null,
                            shared_testcases:
                                sharing !== undefined ? sharing.shared_testcases : null,
                            shared_solutions:
                                sharing !== undefined ? sharing.shared_solutions : null,
                            abstractProblems: allAbstract,
                        } satisfies StoreProblemRow
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
                <Link href="/store/search">
                    <Button className="w-36 justify-start" title="Search problems in the store">
                        <SearchIcon />
                        Search
                    </Button>
                </Link>
            </div>
        </>
    )
}

function StoreSharingCell({ row }: { row: StoreProblemRow }) {
    if (row.passcode === null) {
        return (
            <div className="mt-3 text-xs text-muted-foreground" title="Sharing details are only shown for your own problems">
                —
            </div>
        )
    }

    return (
        <div className="flex flex-row gap-2 mt-3">
            {!row.passcode ? (
                <span title="Protected by passcode">
                    <LockIcon size={14} className="text-red-800" />
                </span>
            ) : (
                <span title="Visible to all">
                    <UnlockIcon size={14} className="text-green-800" />
                </span>
            )}
            {row.shared_testcases ? (
                <span title="Test cases shared with instructors">
                    <FileBoxIcon size={14} className="text-green-800" />
                </span>
            ) : (
                <span title="Test cases not shared with instructors">
                    <FileBoxIcon size={14} className="text-gray-200" />
                </span>
            )}
            {row.shared_solutions ? (
                <span title="Solutions shared with instructors">
                    <FileCodeIcon size={14} className="text-green-800" />
                </span>
            ) : (
                <span title="Solutions not shared with instructors">
                    <FileCodeIcon size={14} className="text-gray-200" />
                </span>
            )}
        </div>
    )
}
