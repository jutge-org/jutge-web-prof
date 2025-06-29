'use client'

import { useDynamic } from '@/hooks/use-dynamic'
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
import { all } from 'radash'
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { z } from 'zod'

export default function ListPropertiesPage() {
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
            <ListPropertiesView />
        </Page>
    )
}

function ListPropertiesView() {
    const { list_nm } = useParams<{ list_nm: string }>()
    const [list, setList] = useState<InstructorList | null>(null)
    const [archived, setArchived] = useState(false)

    const fetchData = useCallback(async () => {
        const data = await all({
            list: jutge.instructor.lists.get(list_nm),
            archived: jutge.instructor.lists.getArchived(),
        })
        setList(data.list)
        setArchived(data.archived.includes(list_nm))
    }, [list_nm])

    useEffect(() => {
        fetchData()
        jutge.problems.getAllAbstractProblems() // launch this in the background to cache the problems
    }, [list_nm, fetchData])

    if (list === null) return <SimpleSpinner size={64} className="pt-24" />

    return (
        <ListPropertiesForm
            fetchData={fetchData}
            list={list}
            archived={archived}
            setArchived={setArchived}
        />
    )
}

type ListPropertiesFormProps = {
    list: InstructorList
    archived: boolean
    setArchived: (archived: boolean) => void
    fetchData: () => Promise<void>
}

function ListPropertiesForm(props: ListPropertiesFormProps) {
    //

    const [runConfirmDialog, ConfirmDialogComponent] = useConfirmDialog({
        title: 'Delete list',
        acceptIcon: <TrashIcon />,
        acceptLabel: 'Yes, delete',
        cancelLabel: 'No',
    })

    const [list_nm, setList_nm] = useDynamic(props.list.list_nm, [props.list])
    const [title, setTitle] = useDynamic(props.list.title, [props.list])
    const [description, setDescription] = useDynamic(props.list.description, [props.list])
    const [annotation, setAnnotation] = useDynamic(props.list.annotation, [props.list])
    const [created_at, setCreated_at] = useDynamic(
        dayjs(props.list.created_at).format('YYYY-MM-DD HH:mm:ss'),
        [props.list],
    )
    const [updated_at, setUpdated_at] = useDynamic(
        dayjs(props.list.updated_at).format('YYYY-MM-DD HH:mm:ss'),
        [props.list],
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
            text: 'Save',
            icon: <SaveIcon />,
            action: save,
        },
        delete: {
            type: 'button',
            text: 'Delete',
            icon: <TrashIcon />,
            action: remove,
            ignoreValidation: true,
        },
    }

    async function save() {
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
        await props.fetchData()
        toast.success(`List '${props.list.list_nm}' saved.`)
    }

    async function remove() {
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
