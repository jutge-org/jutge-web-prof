'use client'

import { JForm, JFormFields } from '@/components/formatters/JForm'
import Page from '@/components/layout/Page'
import SimpleSpinner from '@/components/SimpleSpinner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/components/ui/table'
import jutge from '@/lib/jutge'
import { AbstractProblem } from '@/lib/jutge_api_client'
import { mapmap, offerDownloadFile } from '@/lib/utils'
import dayjs from 'dayjs'
import LocalizedFormat from 'dayjs/plugin/localizedFormat'
import { BotIcon, CloudDownloadIcon } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'

dayjs.extend(LocalizedFormat)

export default function ProblemPropertiesPage() {
    const { problem_nm } = useParams<{ problem_nm: string }>()
    return (
        <Page
            pageContext={{
                title: `Problem ${problem_nm}`,
                menu: 'user',
                current: 'problems',
                subTitle: `Problems ❯ ${problem_nm}`,
                subMenu: 'problems',
                subCurrent: 'properties',
            }}
        >
            <ProblemPropertiesView />
        </Page>
    )
}

function ProblemPropertiesView() {
    const { problem_nm } = useParams<{ problem_nm: string }>()
    const [abstractProblem, setAbstractProblem] = useState<AbstractProblem | null>(null)

    useEffect(() => {
        async function fetchProblem() {
            const abstractProblem = await jutge.problems.getAbstractProblem(problem_nm)
            setAbstractProblem(abstractProblem)
        }
        fetchProblem()
    }, [problem_nm])

    if (abstractProblem === null) return <SimpleSpinner />

    const created_at = dayjs(abstractProblem.created_at).format('YYYY-MM-DD HH:mm:ss')
    const updated_at = dayjs(abstractProblem.updated_at).format('YYYY-MM-DD HH:mm:ss')

    async function downloadAction() {
        const download = await jutge.instructor.problems.download(problem_nm)
        offerDownloadFile(download, download.name)
    }

    const fields: JFormFields = {
        problem_nm: {
            type: 'input',
            label: 'Id',
            value: abstractProblem.problem_nm,
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
        translations: {
            type: 'free',
            label: 'Translations',
            content: (
                <div className="text-sm border rounded-lg">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableCell className="font-bold">Problem</TableCell>
                                <TableCell className="font-bold">Title</TableCell>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {mapmap(abstractProblem.problems, (problem_id, problem) => (
                                <TableRow key={problem_id}>
                                    <TableCell>
                                        <Link href={`/problems/${problem_nm}/${problem_id}`}>
                                            {problem_id}
                                        </Link>
                                    </TableCell>
                                    <TableCell>{problem.title}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            ),
        },
        author: {
            type: 'input',
            label: 'Author',
            value: abstractProblem.author || '',
        },
        email: {
            type: 'input',
            label: 'Author email',
            value: abstractProblem.author_email || '',
        },
        type: {
            type: 'free',
            label: 'Type',
            content: (
                <Badge className="mt-1 py-1 px-2" variant="secondary">
                    {abstractProblem.type}
                </Badge>
            ),
        },
        driver: {
            type: 'free',
            label: 'Driver',
            content: (
                <Badge className="mt-2 py-1 px-2" variant="secondary">
                    {abstractProblem.driver_id}
                </Badge>
            ),
        },
        deprecation: {
            type: 'input',
            label: 'Deprecation reason',
            value: abstractProblem.deprecation || '',
        },
        solution_tags: {
            type: 'input',
            label: (
                <div
                    className="flex justify-end flex-row gap-2  items-center"
                    title={`Solution tags by ${abstractProblem.solution_tags?.model}.`}
                >
                    Solution tags <BotIcon size={16} className="-mt-1" />
                </div>
            ),
            value: abstractProblem.solution_tags?.tags.replaceAll(',', ', ') || '—',
        },
        download: {
            type: 'free',
            label: 'Download problem',
            content: (
                <Button
                    variant="outline"
                    className="mt-0 h-16 w-16 [&_svg]:size-12"
                    onClick={downloadAction}
                    title="Download problem archive as a ZIP file"
                >
                    <CloudDownloadIcon strokeWidth={0.8} />
                </Button>
            ),
        },
    }

    if (!abstractProblem.deprecation) delete fields.deprecation
    if (!abstractProblem.author) delete fields.author
    if (!abstractProblem.author_email) delete fields.email

    return (
        <div className="flex flex-col gap-4">
            <JForm fields={fields} />
        </div>
    )
}
