'use client'

import Page from '@/components/layouts/court/Page'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { AgTableFull } from '@/components/wrappers/AgTable'
import { useIsMobile } from '@/hooks/use-mobile'
import jutge from '@/lib/jutge'
import { mapmap } from '@/lib/utils'
import dayjs from 'dayjs'
import { BotIcon, BotMessageSquareIcon, SquarePlusIcon, WrenchIcon } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'

type ProblemRow = {
    problem_nm: string
    title: string
    created_at: any // TODO
    updated_at: any // TODO
    deprecated: boolean
    languages: string[]
    passcode: boolean
}

export default function ProblemsListPage() {
    return (
        <Page
            pageContext={{
                title: 'Problems',
                menu: 'user',
                current: 'problems',
                subTitle: 'Problems',
                subMenu: 'main',
            }}
        >
            <ProblemsListView />
        </Page>
    )
}

function ProblemsListView() {
    //
    const isMobile = useIsMobile()

    const [problemRows, setProblemRows] = useState<ProblemRow[]>([])
    const [problemRowsAll, setProblemRowsAll] = useState<ProblemRow[]>([])
    const [showDeprecated, setShowDeprecated] = useState(false)

    useEffect(() => {
        if (isMobile)
            setColDefs((colDefs) =>
                colDefs.filter((c) => c.field !== 'annotation' && c.field !== 'created_at'),
            )
    }, [isMobile])

    useEffect(() => {
        async function fetchProblems() {
            const ownProblems = await jutge.instructor.problems.getOwnProblems()
            const ownProblemsWithPasscode =
                await jutge.instructor.problems.getOwnProblemsWithPasscode()
            const abstractProblems = await jutge.problems.getAbstractProblems(ownProblems.join(','))

            function buildTitle(problem_nm: string) {
                const problems = Object.values(abstractProblems[problem_nm].problems)
                return problems.map((problem) => problem.title).join(' / ')
            }

            const rows = ownProblems.map((problem_nm) => {
                const abstractProblem = abstractProblems[problem_nm]
                return {
                    problem_nm,
                    title: buildTitle(abstractProblem.problem_nm),
                    created_at: abstractProblem.created_at,
                    updated_at: abstractProblem.updated_at,
                    deprecated: abstractProblem.deprecation !== null,
                    languages: mapmap(
                        abstractProblem.problems,
                        (problem_id, problem) => problem.language_id,
                    ),
                    passcode: ownProblemsWithPasscode.includes(problem_nm),
                    abstractProblems,
                }
            })

            setProblemRowsAll(rows)
            setProblemRows(rows.filter((row) => !row.deprecated))
        }

        fetchProblems()
    }, [])

    function showDeprecatedChange(checked: boolean) {
        setShowDeprecated(checked)
        if (checked) setProblemRows(problemRowsAll.filter((row) => row.deprecated))
        else setProblemRows(problemRowsAll.filter((row) => !row.deprecated))
    }

    const [colDefs, setColDefs] = useState([
        {
            field: 'problem_nm',
            headerName: 'Id',
            cellRenderer: (p: any) => (
                <Link href={`problems/${p.data.problem_nm}`}>{p.data.problem_nm}</Link>
            ),
            width: 100,
            filter: true,
            valueGetter: (p: any) => p.data.problem_nm,
        },
        { field: 'title', flex: 2, filter: true },
        {
            field: 'created_at',
            headerName: 'Created',
            width: 140,
            filter: true,
            valueGetter: (p: any) => dayjs(p.data.created_at).format('YYYY-MM-DD'),
        },
        {
            field: 'updated_at',
            headerName: 'Updated',
            width: 140,
            filter: true,
            valueGetter: (p: any) => dayjs(p.data.updated_at).format('YYYY-MM-DD'),
            sort: 'desc',
        },
        {
            field: 'passcode',
            headerName: 'Passcode',
            width: 120,
            filter: true,
        },
        {
            field: 'languages',
            width: 150,
            filter: true,
            cellRenderer: (p: any) =>
                p.data.languages.map((language: string) => (
                    <div key={language}>
                        {p.data.abstractProblems[p.data.problem_nm]?.problems[
                            `${p.data.problem_nm}_${language}`
                        ].summary ? (
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
                                                p.data.abstractProblems[p.data.problem_nm].problems[
                                                    `${p.data.problem_nm}_${language}`
                                                ].summary.summary_1s
                                            }
                                        </p>
                                        <p>
                                            {
                                                p.data.abstractProblems[p.data.problem_nm].problems[
                                                    `${p.data.problem_nm}_${language}`
                                                ].summary.summary_1p
                                            }
                                        </p>
                                        <p>
                                            {p.data.abstractProblems[p.data.problem_nm].problems[
                                                `${p.data.problem_nm}_${language}`
                                            ].summary.keywords.replaceAll(',', ', ')}
                                        </p>
                                        <p className="flex gap-1">
                                            <BotIcon size={14} className="" />
                                            {
                                                p.data.abstractProblems[p.data.problem_nm].problems[
                                                    `${p.data.problem_nm}_${language}`
                                                ].summary.model
                                            }
                                        </p>
                                        <hr />
                                        <p>
                                            {p.data.abstractProblems[
                                                p.data.problem_nm
                                            ].solution_tags?.tags.replaceAll(',', ', ')}
                                        </p>
                                        <p className="flex gap-1">
                                            <BotIcon size={14} className="" />
                                            {
                                                p.data.abstractProblems[p.data.problem_nm]
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
            valueGetter: (p: any) => p.data.languages.join(', '),
        },
    ])

    return (
        <>
            <AgTableFull rowData={problemRows} columnDefs={colDefs as any} />
            <div className="mt-4 flex flex-row gap-2">
                <Switch checked={showDeprecated} onCheckedChange={showDeprecatedChange} />
                <div className="text-sm">Deprecated problems</div>
                <div className="flex-grow" />
                <a href="https://github.com/jutge-org/jutge-toolkit" target="_blank">
                    <Button className="w-36 justify-start" title="Open Jutge Toolkit website">
                        <WrenchIcon />
                        Toolkit
                    </Button>
                </a>
                <Link href="/problems/aigen">
                    <Button className="w-36 justify-start" title="Generate problem with JutgeAI">
                        <BotIcon /> Generate
                    </Button>
                </Link>
                <Link href="/problems/new">
                    <Button className="w-36 justify-start" title="Add a new problem">
                        <SquarePlusIcon /> New problem
                    </Button>
                </Link>
            </div>
        </>
    )
}
