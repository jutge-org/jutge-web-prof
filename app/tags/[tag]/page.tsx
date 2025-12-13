'use client'

import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import Page from '../../../components/layouts/court/Page'
import { AgTableFull } from '../../../components/wrappers/AgTable'
import jutge from '../../../lib/jutge'

type Row = {
    problem_nm: string
    title: string
}

export default function TagsItemPage() {
    const { tag } = useParams<{ tag: string }>()

    return (
        <Page
            pageContext={{
                menu: 'user',
                current: 'tags',
                title: 'Tags',
                subTitle: `Tags ❯ ${tag}`,
                subMenu: 'tags',
            }}
        >
            <TagsItemView />
        </Page>
    )
}

function TagsItemView() {
    const { tag } = useParams<{ tag: string }>()

    const [rows, setRows] = useState<Row[]>([])

    const [colDefs, setColDefs] = useState([
        {
            field: 'problem_nm',
            headerName: 'Problem',
            width: 125,
            filter: true,
            cellRenderer: (p: any) => (
                <a href={`https://jutge.org/problems/${p.data.problem_nm}`} target="_blank">
                    {p.data.problem_nm}↗
                </a>
            ),
        },
        {
            field: 'title',
            flex: 1,
            filter: true,
        },
    ])

    //    useEffect(() => menu.setSubTitle(`Tag '${tag}'`))

    useEffect(() => {
        async function fetchData() {
            const problem_nms = await jutge.instructor.tags.get(tag)
            const abstractProblems = await jutge.problems.getAbstractProblems(problem_nms.join(','))

            function buildTitle(problem_nm: string) {
                const problems = Object.values(abstractProblems[problem_nm].problems)
                return problems.map((problem) => problem.title).join(' / ')
            }

            setRows(
                problem_nms.map((problem_nm) => ({ problem_nm, title: buildTitle(problem_nm) })),
            )
        }

        fetchData()
    }, [tag])

    return <AgTableFull rowData={rows} columnDefs={colDefs} />
}
