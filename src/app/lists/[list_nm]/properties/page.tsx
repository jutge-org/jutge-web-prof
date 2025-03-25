'use client'

import { JForm, JFormFields } from '@/components/JForm'
import Page from '@/components/Page'
import Spinner from '@/components/Spinner'
import jutge from '@/lib/jutge'
import { InstructorList } from '@/lib/jutge_api_client'
import { showError } from '@/lib/utils'
import { useConfirm } from '@omit/react-confirm-dialog'
import { SaveIcon, TrashIcon } from 'lucide-react'
import { redirect, useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
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

    if (list === null) return <Spinner />

    return <EditListForm list={list} archived={archived} setArchived={setArchived} />
}

interface ListFormProps {
    list: InstructorList
    archived: boolean
    setArchived: (archived: boolean) => void
}

function EditListForm(props: ListFormProps) {
    const confirm = useConfirm()

    const [list_nm, setList_nm] = useState(props.list.list_nm)
    const [title, setTitle] = useState(props.list.title)
    const [description, setDescription] = useState(props.list.description)
    const [annotation, setAnnotation] = useState(props.list.annotation)

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
    }

    async function deleteAction() {
        if (
            !(await confirm({
                title: 'Delete list',
                description: `Are you sure you want to delete list '${props.list.list_nm}'?`,
            }))
        ) {
            return
        }
        try {
            await jutge.instructor.lists.remove(props.list.list_nm)
        } catch (error) {
            return showError(error)
        }
        toast.success(`List '${props.list.list_nm}' deleted.`)
        redirect('/lists')
    }

    return <JForm fields={fields} />
}
