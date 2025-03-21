'use client'

import { AgTableFull } from '@/components/AgTable'
import Page from '@/components/Page'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { useIsMobile } from '@/hooks/use-mobile'
import jutge from '@/lib/jutge'
import { mapmap } from '@/lib/utils'
import dayjs from 'dayjs'
import { SquarePlusIcon, WrenchIcon } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'

type ProblemRow = {
    problem_nm: string
    title: string
    created_at: any // TODO
    deprecated: boolean
    languages: string[]
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
                    deprecated: abstractProblem.deprecation !== null,
                    languages: mapmap(
                        abstractProblem.problems,
                        (problem_id, problem) => problem.language_id,
                    ),
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
        },
        {
            field: 'created_at',
            headerName: 'Creation',
            width: 125,
            filter: true,
            cellRenderer: (p: any) => dayjs(p.data.created_at).format('YYYY-MM-DD'),
        },
        { field: 'title', flex: 2, filter: true },
        {
            field: 'languages',
            width: 125,
            filter: true,
            cellRenderer: (p: any) =>
                p.data.languages.map((language: string) => (
                    <Badge key={language} variant="secondary" className="mr-1 px-2">
                        {language}
                    </Badge>
                )),
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
                    <Button className="w-36 justify-start">
                        <WrenchIcon />
                        Toolkit
                    </Button>
                </a>
                <Link href="/problems/new">
                    <Button className="w-36 justify-start">
                        <SquarePlusIcon /> New problem
                    </Button>
                </Link>
            </div>
        </>
    )
}
