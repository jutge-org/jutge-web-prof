'use client'

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
import { JForm, JFormFields } from '@/jutge-components/formatters/JForm'
import Page from '@/jutge-components/layouts/court/Page'
import Markdown from '@/jutge-components/wrappers/Markdown'
import jutge from '@/lib/jutge'
import {
    AbstractProblem,
    AbstractProblemSuppl,
    SemanticSearchResults,
} from '@/lib/jutge_api_client'
import { offerDownloadFile } from '@/lib/utils'
import {
    BookmarkIcon,
    BotIcon,
    CircleGaugeIcon,
    CircleMinusIcon,
    CirclePlusIcon,
    CogIcon,
    FileCodeIcon,
    FileTerminalIcon,
    FileTextIcon,
    FileTypeIcon,
    MedalIcon,
    ScrollIcon,
    ScrollTextIcon,
    SearchIcon,
    SignatureIcon,
    SkullIcon,
    SquareArrowOutUpRightIcon,
    StarIcon,
    TagsIcon,
    XIcon,
} from 'lucide-react'
import { JSX, useEffect, useState } from 'react'

export default function SearchPage() {
    const [allAbstractProblems, setAllAbstractProblems] = useState<Record<
        string,
        AbstractProblem
    > | null>(null)

    useState(async () => {
        const allAbstractProblems = await jutge.problems.getAllAbstractProblems()
        setAllAbstractProblems(allAbstractProblems)
    })

    return (
        <Page
            pageContext={{
                menu: 'user',
                current: 'search',
                title: 'Search',
                subTitle: `Search problems`,
                subMenu: 'main',
            }}
        >
            <SearchView allAbstractProblems={allAbstractProblems} />
        </Page>
    )
}

type SearchViewProps = {
    allAbstractProblems: Record<string, AbstractProblem> | null
}

const samples = [
    'Shorted paths',
    'Coin change',
    'Canvi de monedes',
    'Japó',
    'Grafos dirigidos',
    'Queues',
]

function SearchView(props: SearchViewProps) {
    const [query, setQuery] = useState(samples[Math.floor(Math.random() * samples.length)])
    const [searching, setSearching] = useState(false)
    const [results, setResults] = useState<SemanticSearchResults | undefined>(undefined)

    async function search() {
        if (searching) return
        setSearching(true)
        setResults(undefined)
        const results = await jutge.problems.semanticSearch({ query, limit: 25 })
        setResults(results)
        setSearching(false)
    }

    const fields: JFormFields = {
        query: {
            type: 'input',
            label: 'Query',
            value: query,
            setValue: setQuery,
            placeHolder: 'Type your search query here',
        },
        button: {
            type: 'button',
            text: 'Semantic search',
            icon: <SearchIcon />,
            action: search,
        },
    }

    return (
        <div>
            <div className="border rounded-lg px-4 py-3 mb-4 flex flex-col text-sm">
                <p>
                    This page is still under development, some bugs still exist. You can use it to
                    search for problems semantically using Jutge<sup>AI</sup>.
                </p>
            </div>

            <JForm fields={fields} />

            {searching && <Searching />}

            {results && props.allAbstractProblems && (
                <div className="flex flex-col gap-4">
                    {results.map((result) => (
                        <Result
                            key={result.problem_nm}
                            result={result}
                            allAbstractProblems={props.allAbstractProblems!}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}

type ResultProps = {
    result: {
        problem_nm: string
        similarity: number
    }
    allAbstractProblems: Record<string, AbstractProblem>
}

function Result(props: ResultProps) {
    const [statement, setStatement] = useState<JSX.Element | null>(null)
    const [isStatementDialogOpen, setIsStatementDialogOpen] = useState(false)

    const [abspbm, setAbspbm] = useState(props.allAbstractProblems[props.result.problem_nm])
    const [pbm, setPbm] = useState(
        Object.values(abspbm.problems).find((p) => p.original_language_id === p.language_id)!,
    )
    const [abspbmSuppl, setAbspbmSuppl] = useState<AbstractProblemSuppl | null>(null)
    const [detailsOpen, setDetailsOpen] = useState(false)

    useEffect(() => {
        async function fetchSuppl() {
            const suppl = await jutge.problems.getAbstractProblemSuppl(abspbm.problem_nm)
            setAbspbmSuppl(suppl)
        }
        fetchSuppl()
    }, [abspbm])

    function click(language_id: string) {
        setPbm((old) => Object.values(abspbm.problems).find((p) => p.language_id === language_id)!)
    }

    async function pdfFile() {
        const download = await jutge.problems.getPdfStatement(pbm.problem_id)
        offerDownloadFile(download)
    }

    async function htmlFile() {
        const htmlStatement = await jutge.problems.getHtmlStatement(pbm.problem_id)
        setStatement(
            <div
                className="border rounded-lg p-4 w-full h-96 scroll-auto"
                dangerouslySetInnerHTML={{ __html: htmlStatement }}
            />,
        )
        setIsStatementDialogOpen(true)
    }

    async function textFile() {
        const textStatement = await jutge.problems.getTextStatement(pbm.problem_id)
        setStatement(<Textarea className="text-sm w-full h-96" value={textStatement} />)
        setIsStatementDialogOpen(true)
    }

    async function markdownFile() {
        const markdownStatement = await jutge.problems.getMarkdownStatement(pbm.problem_id)
        setStatement(
            <div className="text-sm border rounded-lg p-4 w-full h-96 scroll-auto">
                <Markdown markdown={markdownStatement} className="prose-sm" />
            </div>,
        )
        setIsStatementDialogOpen(true)
    }

    return (
        <div className="border rounded-lg px-4 py-3 flex flex-col">
            <div className="mb-1 flex flex-row gap-2">
                <a
                    href={`https://jutge.org/problems/${props.result.problem_nm}`}
                    target="_blank"
                    rel="noreferrer"
                    className="font-bold text-primary hover:underline"
                >
                    {props.result.problem_nm}
                    <SquareArrowOutUpRightIcon className="inline-block ml-1 mb-1" size={16} />
                </a>
                <div />
                {Object.values(abspbm.problems)
                    .sort((a, b) => a.language_id.localeCompare(b.language_id))
                    .map((p) => (
                        <Badge
                            key={p.language_id}
                            onClick={() => click(p.language_id)}
                            variant={pbm.language_id == p.language_id ? 'default' : 'outline'}
                            className="w-8 flex items-center justify-center cursor-pointer"
                        >
                            {p.language_id}
                        </Badge>
                    ))}
                <div />
                <div className="flex-grow" />
                {abspbm.official && (
                    <div className="text-gray-400 text-xs mt-1.5">
                        <StarIcon className="inline-block mr-1 mb-1" size={16} />
                    </div>
                )}
                <div className="text-gray-400 text-xs mt-1.5">
                    <CircleGaugeIcon className="inline-block mr-1 mb-1" size={16} />
                    {props.result.similarity.toFixed(2)}
                </div>
            </div>
            <div className="space-y-1" />
            <div className="flex flex-row">
                {detailsOpen ? (
                    <CircleMinusIcon
                        className="inline-block mr-2 mt-1 text-primary"
                        size={16}
                        onClick={() => setDetailsOpen(false)}
                    />
                ) : (
                    <CirclePlusIcon
                        className="inline-block mr-2 mt-1 text-primary"
                        size={16}
                        onClick={() => setDetailsOpen(true)}
                    />
                )}
                <div className="font-bold">{pbm.title}</div>
            </div>

            <div className="mt-1 ml-6 text-sm flex flex-col gap-1">
                <div className="w-full flex flex-row">
                    <div className="w-8">
                        <SignatureIcon className="inline-block mr-1 mb-1" size={16} />
                    </div>
                    <div className="w-full">
                        {abspbm.author}
                        {pbm.translator && pbm.translator != abspbm.author && (
                            <span> (translated by {pbm.translator})</span>
                        )}
                    </div>
                </div>
                {pbm.summary && (
                    <div className="w-full flex flex-row">
                        <div className="w-8">
                            <TagsIcon className="inline-block mr-1 mb-1" size={16} />
                        </div>
                        <div className="w-full">{pbm.summary.keywords.replaceAll(',', ', ')}</div>
                    </div>
                )}
                {pbm.summary && (
                    <div className="w-full flex flex-row ">
                        <div className="w-8">
                            <ScrollIcon className="inline-block mr-1 mb-1" size={16} />
                        </div>
                        <div className="w-full">{pbm.summary.summary_1s}</div>
                    </div>
                )}
                {detailsOpen && pbm.summary && (
                    <div className="w-full flex flex-row ">
                        <div className="w-8">
                            <ScrollTextIcon className="inline-block mr-1 mb-1" size={16} />
                        </div>
                        <div className="w-full">{pbm.summary.summary_1p}</div>
                    </div>
                )}
                {detailsOpen && abspbm.solution_tags && (
                    <div className="w-full flex flex-row">
                        <div className="w-8">
                            <BookmarkIcon className="inline-block mr-1 mb-1" size={16} />
                        </div>
                        <div className="w-full">
                            {abspbm.solution_tags.tags.replaceAll(',', ', ')}
                        </div>
                    </div>
                )}
                {detailsOpen && (
                    <div className="w-full flex flex-row">
                        <div className="w-8">
                            <CogIcon className="inline-block mr-1 mb-1" size={16} />
                        </div>
                        <div className="w-full flex flex-row gap-2">
                            <Badge className="px-2 rounded-full" variant="secondary">
                                {abspbm.type}
                            </Badge>
                            <Badge className="px-2 rounded-full" variant="secondary">
                                {abspbm.driver_id}
                            </Badge>
                            {abspbm.compilers && (
                                <Badge className="px-2 rounded-full" variant="secondary">
                                    {abspbm.compilers}
                                </Badge>
                            )}
                        </div>
                    </div>
                )}
                {detailsOpen && abspbmSuppl && (
                    <div className="w-full flex flex-row">
                        <div className="w-8">
                            <MedalIcon className="inline-block mr-1 mb-1" size={16} />
                        </div>
                        <div className="whitespace-nowrap overflow-auto text-ellipsis w-full flex flex-row gap-2">
                            {abspbmSuppl.proglangs_with_ac.map((lang) => (
                                <Badge
                                    key={lang}
                                    className="px1.52 rounded-full"
                                    variant="secondary"
                                >
                                    {lang}
                                </Badge>
                            ))}
                        </div>
                    </div>
                )}
                {abspbm.deprecation && (
                    <div className="w-full flex flex-row">
                        <div className="w-8">
                            <SkullIcon className="inline-block mr-1 mb-1 text-red-500" size={16} />
                        </div>
                        <div className="w-full">Deprecated! {abspbm.deprecation}</div>
                    </div>
                )}
                {detailsOpen && (
                    <div className="mt-1 w-full flex flex-row">
                        <div className="w-8"></div>
                        <div className="w-full flex flex-row gap-2">
                            <FileTextIcon
                                className="inline-block cursor-pointer"
                                size={48}
                                strokeWidth={0.6}
                                onClick={pdfFile}
                            />
                            <FileCodeIcon
                                className="inline-block cursor-pointer"
                                size={48}
                                strokeWidth={0.6}
                                onClick={htmlFile}
                            />
                            <FileTerminalIcon
                                className="inline-block cursor-pointer"
                                size={48}
                                strokeWidth={0.6}
                                onClick={markdownFile}
                            />
                            <FileTypeIcon
                                className="inline-block cursor-pointer"
                                size={48}
                                strokeWidth={0.6}
                                onClick={textFile}
                            />
                        </div>
                    </div>
                )}
            </div>
            <StatementDialog
                problem_id={pbm.problem_id}
                content={statement}
                isOpen={isStatementDialogOpen}
                setIsOpen={setIsStatementDialogOpen}
            />
        </div>
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
                <DialogDescription className="hidden">Statement for {problem_id}</DialogDescription>
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

function Searching() {
    return (
        <div className="border rounded-lg p-8 mb-4 flex flex-col justify-center items-center">
            <BotIcon size={48} className="animate-bounce" strokeWidth={1} />
            <div className="animate-pulse text-sm">Searching</div>
        </div>
    )
}
