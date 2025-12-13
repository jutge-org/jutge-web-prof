'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import Page from '../../components/layouts/court/Page'
import { AgTableFull } from '../../components/wrappers/AgTable'
import jutge from '../../lib/jutge'

type TagList = {
    tag: string
    count: number
}[]

export default function TagsListPage() {
    return (
        <Page
            pageContext={{
                menu: 'user',
                current: 'tags',
                title: 'Tags',
                subTitle: `Tags`,
                subMenu: 'main',
            }}
        >
            <TagsListView />
        </Page>
    )
}

function TagsListView() {
    //

    const [tags, setTags] = useState<TagList>([])

    const [colDefs, setColDefs] = useState([
        {
            field: 'tag',
            headerName: 'Tag',
            cellRenderer: (p: any) => <Link href={`tags/${p.data.tag}`}>{p.data.tag}</Link>,
            flex: 1,
            filter: true,
        },
        {
            field: 'count',
            width: 125,
            filter: true,
            cellRenderer: (p: any) => <div className="text-right">{p.data.count}</div>,
        },
    ])

    useEffect(() => {
        async function fetchTags() {
            const data = await jutge.instructor.tags.getDict()
            setTags(
                Object.entries(data).map(([tag, problems]) => ({ tag, count: problems.length })),
            )
        }

        fetchTags()
    }, [])

    return (
        <>
            <AgTableFull rowData={tags} columnDefs={colDefs} />
        </>
    )
}
