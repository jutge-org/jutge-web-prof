'use client'

import { useConfirmDialog } from '@/jutge-components/dialogs/ConfirmDialog'
import { JForm, JFormFields } from '@/jutge-components/formatters/JForm'
import Page from '@/jutge-components/layouts/court/Page'
import SimpleSpinner from '@/jutge-components/spinners/SimpleSpinner'
import jutge from '@/lib/jutge'
import { InstructorList } from '@/lib/jutge_api_client'
import { showError } from '@/lib/utils'
import dayjs from 'dayjs'
import { SaveIcon, TrashIcon } from 'lucide-react'
import { redirect, useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { z } from 'zod'

export default function ListPropertiesPage() {
    const [key, setKey] = useState(Math.random())
    const { list_nm } = useParams<{ list_nm: string }>()

    return (
        <Page
            pageContext={{
                title: `List ${list_nm}`,
                menu: 'user',
                current: 'lists',
                subTitle: `Lists ❯ ${list_nm}`,
                subMenu: 'lists',
                subCurrent: 'properties',
            }}
        >
            <ListPropertiesView key={key} setKey={setKey} />
        </Page>
    )
}

function ListPropertiesView({ setKey }: { setKey: (key: number) => void }) {
    const { list_nm } = useParams<{ list_nm: string }>()
    const [list, setList] = useState<InstructorList | null>(null)
    const [archived, setArchived] = useState(false)

    useEffect(() => {
        async function fetchList() {
            const list = await jutge.instructor.lists.get(list_nm)
            setList(list)
            const archived = (await jutge.instructor.lists.getArchived()).includes(list_nm)
            setArchived(archived)
        }

        fetchList()
    }, [list_nm])

    useEffect(() => {
        // launch this in the background to cache the problems
        jutge.problems.getAllAbstractProblems()
    }, [list_nm])

    if (list === null) return <SimpleSpinner />

    return (
        <EditListForm list={list} archived={archived} setArchived={setArchived} setKey={setKey} />
    )
}

interface ListFormProps {
    list: InstructorList
    archived: boolean
    setArchived: (archived: boolean) => void
    setKey: (key: number) => void
}

function EditListForm(props: ListFormProps) {
    //

    const [runConfirmDialog, ConfirmDialogComponent] = useConfirmDialog({
        title: 'Delete list',
        acceptIcon: <TrashIcon />,
        acceptLabel: 'Yes, delete',
        cancelLabel: 'No',
    })

    const [list_nm, setList_nm] = useState(props.list.list_nm)
    const [title, setTitle] = useState(props.list.title)
    const [description, setDescription] = useState(props.list.description)
    const [annotation, setAnnotation] = useState(props.list.annotation)
    const [created_at, setCreated_at] = useState(
        dayjs(props.list.created_at).format('YYYY-MM-DD HH:mm:ss'),
    )
    const [updated_at, setUpdated_at] = useState(
        dayjs(props.list.updated_at).format('YYYY-MM-DD HH:mm:ss'),
    )

    const fields: JFormFields = {
        /*
        list_nm: {
            type: 'input',
            label: 'Name',
            value: list_nm,
            setValue: setList_nm,
            validator: z
                .string()
                .min(5)
                .regex(/^[a-zA-Z0-9_-]*$/, 'Only alphanumeric characters are allowed'),
            placeHolder: 'ListName',
            disabled: true,
        },
        */
        title: {
            type: 'input',
            label: 'Title',
            value: title,
            setValue: setTitle,
            validator: z.string().min(5),
            placeHolder: 'List Title',
        },
        created_at: {
            type: 'datetime',
            label: 'Created at',
            value: created_at,
            disabled: true,
        },
        updated_at: {
            type: 'datetime',
            label: 'Updated at',
            value: updated_at,
            disabled: true,
        },
        description: {
            type: 'markdown',
            label: 'Description',
            value: description,
            setValue: setDescription,
            placeHolder: 'List description',
        },
        annotation: {
            type: 'input',
            label: 'Annotation',
            value: annotation,
            setValue: setAnnotation,
            validator: z.string(),
            placeHolder: 'List annotation (instructor only)',
        },
        archived: {
            type: 'switch',
            label: 'Archived',
            value: props.archived,
            setValue: props.setArchived,
        },
        sep: { type: 'separator' },
        update: {
            type: 'button',
            text: 'Save changes',
            icon: <SaveIcon />,
            action: updateAction,
        },
        delete: {
            type: 'button',
            text: 'Delete list',
            icon: <TrashIcon />,
            action: deleteAction,
            ignoreValidation: true,
        },
    }

    async function updateAction() {
        const oldCurse = await jutge.instructor.lists.get(list_nm)
        const newList = {
            ...oldCurse,
            title,
            description,
            annotation,
        }

        try {
            await jutge.instructor.lists.update(newList)

            if (props.archived) await jutge.instructor.lists.archive(list_nm)
            else await jutge.instructor.lists.unarchive(list_nm)
        } catch (error) {
            return showError(error)
        }
        toast.success(`List '${props.list.list_nm}' updated`)
        props.setKey(Math.random()) // force render to refresh the data
    }

    async function deleteAction() {
        const message = `Are you sure you want to delete list '${props.list.list_nm}'?`
        if (!(await runConfirmDialog(message))) return

        try {
            await jutge.instructor.lists.remove(props.list.list_nm)
        } catch (error) {
            return showError(error)
        }
        toast.success(`List '${props.list.list_nm}' deleted.`)
        redirect('/lists')
    }

    return (
        <>
            <JForm fields={fields} />
            <ConfirmDialogComponent />
        </>
    )
}
