'use client'

import { JForm, JFormFields } from '@/components/JForm'
import Page from '@/components/Page'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import Markdown from '@/jutge-components/misc/Markdown'
import SimpleSpinner from '@/jutge-components/spinners/SimpleSpinner'
import jutge from '@/lib/jutge'
import { BriefAbstractProblem, Problem, ProblemSuppl } from '@/lib/jutge_api_client'
import { offerDownloadFile } from '@/lib/utils'
import { FileCodeIcon, FileTerminalIcon, FileTextIcon, FileTypeIcon, XIcon } from 'lucide-react'
import { useParams } from 'next/navigation'
import { JSX, useEffect, useState } from 'react'

export default function ProblemPropertiesPage() {
    const { problem_id } = useParams<{ problem_id: string }>()
    return (
        <Page
            pageContext={{
                title: `Problem ${problem_id}`,
                menu: 'user',
                current: 'problems',
                subTitle: `Problems ❯ ${problem_id}`,
                subMenu: 'problems',
            }}
        >
            <ProblemPropertiesView />
        </Page>
    )
}

type ProblemInfo = {
    abstractProblem: BriefAbstractProblem
    problem: Problem
    problemSuppl: ProblemSuppl
}

function ProblemPropertiesView() {
    const { problem_id } = useParams<{ problem_id: string }>()
    const { problem_nm } = useParams<{ problem_nm: string }>()
    const [abstractProblem, setAbstractProblem] = useState<BriefAbstractProblem | null>(null)
    const [problem, setProblem] = useState<Problem | null>(null)
    const [problemSuppl, setProblemSuppl] = useState<ProblemSuppl | null>(null)

    useEffect(() => {
        async function fetchProblemInfo() {
            const abstractProblem = await jutge.problems.getAbstractProblem(problem_nm)
            setAbstractProblem(abstractProblem)

            const problem = await jutge.problems.getProblem(problem_id)
            setProblem(problem)

            const problemSuppl = await jutge.problems.getProblemSuppl(problem_id)
            setProblemSuppl(problemSuppl)
        }

        fetchProblemInfo()
    }, [problem_id, problem_nm])

    if (abstractProblem === null || problem === null || problemSuppl === null)
        return <SimpleSpinner />

    return (
        <EditProblemForm
            info={{
                abstractProblem,
                problem,
                problemSuppl,
            }}
        />
    )
}

interface ProblemFormProps {
    info: ProblemInfo
}

function EditProblemForm({ info }: ProblemFormProps) {
    //

    const [statement, setStatement] = useState<JSX.Element | null>(null)
    const [isStatementDialogOpen, setIsStatementDialogOpen] = useState(false)

    const fields: JFormFields = {
        problem_id: {
            type: 'input',
            label: 'Id',
            value: info.problem.problem_id,
        },
        title: {
            type: 'input',
            label: 'Title',
            value: info.problem.title,
        },
        author: {
            type: 'input',
            label: 'Author',
            value: info.abstractProblem.author || '—',
        },
        author_email: {
            type: 'input',
            label: 'Author email',
            value: info.abstractProblem.author_email || '—',
        },
        translator: {
            type: 'input',
            label: 'Translator',
            value: info.problem.translator || '—',
        },
        translator_email: {
            type: 'input',
            label: 'Translator email',
            value: info.problem.translator_email || '—',
        },
        checks: {
            type: 'free',
            label: 'Checks',
            content: formatChecks(info.problemSuppl.official_solution_checks),
        },
        pdf: {
            type: 'free',
            label: 'Statement',
            content: (
                <div className="flex flex-row gap-2">
                    <Button
                        variant="outline"
                        className="mt-1 mb-1 h-16 w-16 [&_svg]:size-12"
                        title="PDF"
                        onClick={pdfAction}
                    >
                        <FileTextIcon strokeWidth={0.8} />
                    </Button>
                    <Button
                        variant="outline"
                        className="mt-1 mb-1 h-16 w-16 [&_svg]:size-12"
                        title="HTML"
                        onClick={htmlAction}
                    >
                        <FileCodeIcon strokeWidth={0.8} />
                    </Button>
                    <Button
                        variant="outline"
                        className="mt-1 mb-1 h-16 w-16 [&_svg]:size-12"
                        title="Markdown"
                        onClick={markdownAction}
                    >
                        <FileTerminalIcon strokeWidth={0.8} />
                    </Button>
                    <Button
                        variant="outline"
                        className="mt-1 mb-1 h-16 w-16 [&_svg]:size-12"
                        title="Text"
                        onClick={textAction}
                    >
                        <FileTypeIcon strokeWidth={0.8} />
                    </Button>
                </div>
            ),
        },
        view: {
            type: 'free',
            label: 'View',
            content: (
                <div className="text-sm p-2 border rounded-lg">
                    <a
                        href={`https://jutge.org/problems/${info.problem.problem_id}`}
                        target="_blank"
                    >
                        {info.problem.problem_id}
                    </a>
                </div>
            ),
        },
    }

    if (!info.problem.translator) delete fields.translator
    if (!info.problem.translator_email) delete fields.translator_email
    if (!info.abstractProblem.author) delete fields.author
    if (!info.abstractProblem.author_email) delete fields.author_email

    async function pdfAction() {
        const download = await jutge.problems.getPdfStatement(info.problem.problem_id)
        offerDownloadFile(download)
    }

    async function htmlAction() {
        const htmlStatement = await jutge.problems.getHtmlStatement(info.problem.problem_id)
        setStatement(
            <div
                className="border rounded-lg p-4 w-full h-96 scroll-auto"
                dangerouslySetInnerHTML={{ __html: htmlStatement }}
            />,
        )
        setIsStatementDialogOpen(true)
    }

    async function textAction() {
        const textStatement = await jutge.problems.getTextStatement(info.problem.problem_id)
        setStatement(<Textarea className="text-sm w-full h-96" value={textStatement} />)
        setIsStatementDialogOpen(true)
    }

    async function markdownAction() {
        const markdownStatement = await jutge.problems.getMarkdownStatement(info.problem.problem_id)
        setStatement(
            <div className="text-sm border rounded-lg p-4 w-full h-96 scroll-auto">
                <Markdown markdown={markdownStatement} className="prose-sm" />
            </div>,
        )
        setIsStatementDialogOpen(true)
    }

    return (
        <>
            <JForm fields={fields} />
            <StatementDialog
                problem_id={info.problem.problem_id}
                content={statement}
                isOpen={isStatementDialogOpen}
                setIsOpen={setIsStatementDialogOpen}
            />
        </>
    )
}

function StatementDialog({
    isOpen,
    setIsOpen,
    problem_id,
    content,
}: {
    isOpen: boolean
    setIsOpen: (open: boolean) => void
    problem_id: string
    content: JSX.Element | string | null
}) {
    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Statement for {problem_id}</DialogTitle>
                    <DialogDescription className="flex flex-col gap-4">
                        {content}
                        <Button onClick={() => setIsOpen(false)}>
                            <XIcon />
                            Close
                        </Button>
                    </DialogDescription>
                </DialogHeader>
            </DialogContent>
        </Dialog>
    )
}

function badgyify(list: string[]) {
    if (list.length == 0) return '—'
    return (
        <div className="flex flex-row flex-wrap gap-2">
            {list.map((item, index) => (
                <Badge key={index} className="font-normal py-1 px-2" variant="secondary">
                    {item}
                </Badge>
            ))}
        </div>
    )
}

function formatChecks(checks: Record<string, boolean>) {
    return (
        <div className="flex flex-row gap-2 mt-1">
            {mapmap(checks, (proglang, ok) => (
                <Badge
                    key={proglang}
                    className={`font-normal py-1 px-2 ${ok ? 'bg-green-800' : 'bg-red-800'}`}
                >
                    {proglang}
                </Badge>
            ))}
        </div>
    )
}

function mapmap<V, R>(obj: Record<string, V>, fn: (key: string, value: V) => R) {
    return Object.entries(obj).map(([key, value]) => fn(key, value))
}
