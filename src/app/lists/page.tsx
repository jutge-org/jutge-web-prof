'use client'

import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { useIsMobile } from '@/hooks/use-mobile'
import Page from '@/jutge-components/layouts/court/Page'
import { AgTableFull } from '@/jutge-components/wrappers/AgTable'
import jutge from '@/lib/jutge'
import { InstructorBriefList } from '@/lib/jutge_api_client'
import { SquarePlusIcon } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function ListsListPage() {
    return (
        <Page
            pageContext={{
                title: 'Lists',
                menu: 'user',
                current: 'lists',
                subTitle: 'Lists',
                subMenu: 'main',
            }}
        >
            <ListsListView />
        </Page>
    )
}

function ListsListView() {
    //

    const isMobile = useIsMobile()

    const [lists, setLists] = useState<InstructorBriefList[]>([])
    const [rows, setRows] = useState<InstructorBriefList[]>([])
    const [archived, setArchived] = useState<string[]>([])
    const [showArchived, setShowArchived] = useState(false)

    const [colDefs, setColDefs] = useState([
        {
            field: 'list_nm',
            headerName: 'Id',
            cellRenderer: (p: any) => (
                <Link href={`lists/${p.data.list_nm}/properties`}>{p.data.list_nm}</Link>
            ),
            flex: 1,
            filter: true,
        },
        { field: 'title', flex: 2, filter: true },
        { field: 'annotation', flex: 2, filter: true },
    ])

    useEffect(() => {
        if (isMobile) setColDefs((colDefs) => colDefs.filter((c) => c.field !== 'annotation'))
    }, [isMobile])

    useEffect(() => {
        async function fetchLists() {
            const archived = await jutge.instructor.lists.getArchived()
            const dict = await jutge.instructor.lists.index()
            const array = Object.values(dict).sort((a, b) => a.list_nm.localeCompare(b.list_nm))
            setRows(array.filter((list) => !archived.includes(list.list_nm)))
            setLists(array)
            setArchived(archived)
        }

        fetchLists()
    }, [])

    function showArchivedChange(checked: boolean) {
        setShowArchived(checked)
        if (checked) {
            setRows(lists.filter((list) => archived.includes(list.list_nm)))
        } else {
            setRows(lists.filter((list) => !archived.includes(list.list_nm)))
        }
    }

    return (
        <>
            <AgTableFull rowData={rows} columnDefs={colDefs as any} />
            <div className="mt-4 flex flex-row gap-2">
                <Switch checked={showArchived} onCheckedChange={showArchivedChange} />
                <div className="text-sm">Archived lists</div>
                <div className="flex-grow" />
                <Link href="/lists/new">
                    <Button>
                        <SquarePlusIcon /> New list
                    </Button>
                </Link>
            </div>
        </>
    )
}
