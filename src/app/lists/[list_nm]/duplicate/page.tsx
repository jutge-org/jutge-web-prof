'use client'

import { JForm, JFormFields } from '@/jutge-components/formatters/JForm'
import Page from '@/jutge-components/layouts/court/Page'
import SimpleSpinner from '@/jutge-components/spinners/SimpleSpinner'
import jutge from '@/lib/jutge'
import { InstructorList } from '@/lib/jutge_api_client'
import { showError } from '@/lib/utils'
import { CopyPlusIcon } from 'lucide-react'
import { redirect, useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { z } from 'zod'

export default function ListDuplicatePage() {
    const { list_nm } = useParams<{ list_nm: string }>()
    return (
        <Page
            pageContext={{
                title: `List ${list_nm}`,
                menu: 'user',
                current: 'lists',
                subTitle: `Lists ❯ ${list_nm}`,
                subMenu: 'lists',
                subCurrent: 'duplicate',
            }}
        >
            <ListDuplicateView />
        </Page>
    )
}

function ListDuplicateView() {
    const { list_nm } = useParams<{ list_nm: string }>()
    const [list, setList] = useState<InstructorList | null>(null)

    useEffect(() => {
        async function fetchList() {
            const list = await jutge.instructor.lists.get(list_nm)
            setList(list)
        }

        fetchList()
    }, [list_nm])

    if (list === null) return <SimpleSpinner />

    return <ListDuplicateForm list={list} />
}

function ListDuplicateForm({ list }: { list: InstructorList }) {
    //
    const [newNm, setNewNm] = useState(list.list_nm + '_copy')
    const [newTitle, setNewTitle] = useState('Copy of ' + list.title)

    const fields: JFormFields = {
        intro: {
            type: 'free',
            label: '',
            content: (
                <div className="text-sm mb-4">
                    <p>
                        In order to duplicate this list into a new list, please provide a new list
                        identifier and a new title.
                    </p>
                </div>
            ),
        },
        newNm: {
            type: 'input',
            label: 'Id',
            value: newNm,
            setValue: setNewNm,
            validator: z
                .string()
                .min(5)
                .regex(/^[a-zA-Z0-9_-]*$/, 'Only alphanumeric characters are allowed'),
            placeHolder: 'NewListName',
        },
        title: {
            type: 'input',
            label: 'Title',
            value: newTitle,
            setValue: setNewTitle,
            validator: z.string().min(5),
            placeHolder: 'New List Title',
        },
        sep: { type: 'separator' },
        update: {
            type: 'button',
            text: 'Duplicate list',
            icon: <CopyPlusIcon />,
            action: duplicateAction,
        },
    }

    async function duplicateAction() {
        const oldCurse: InstructorList = await jutge.instructor.lists.get(list.list_nm)
        const newList = {
            ...oldCurse,
            list_nm: newNm,
            title: newTitle,
        }

        try {
            await jutge.instructor.lists.create(newList)
        } catch (error) {
            return showError(error)
        }
        toast.success(`List '${list.list_nm}' duplicated as '${newNm}'.`)
        redirect(`/lists/${newNm}/properties`)
    }

    return <JForm fields={fields} />
}
