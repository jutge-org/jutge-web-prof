'use client'

import { Badge } from '@/components/ui/badge'
import { JForm, JFormFields } from '@/jutge-components/formatters/JForm'
import Page from '@/jutge-components/layouts/court/Page'
import jutge from '@/lib/jutge'
import { AbstractProblem, SemanticSearchResults } from '@/lib/jutge_api_client'
import {
    BotIcon,
    CircleGaugeIcon,
    CircleMinusIcon,
    CirclePlusIcon,
    SearchIcon,
    SignatureIcon,
    TagsIcon,
} from 'lucide-react'
import { useState } from 'react'

export default function SearchPage() {
    const [allAbstractProblems, setAllAbstractProblems] = useState<Record<
        string,
        AbstractProblem
    > | null>(null)

    useState(async () => {
        const allAbstractProblems = await jutge.problems.getAllAbstractProblems()
        setAllAbstractProblems(allAbstractProblems)
        console.log('Loaded all abstract problems:', allAbstractProblems['P68688'].solution_tags)
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

function SearchView(props: SearchViewProps) {
    const [query, setQuery] = useState('Coin change')
    const [searching, setSearching] = useState(false)
    const [results, setResults] = useState<SemanticSearchResults | undefined>(undefined)

    async function search() {
        if (searching) return
        setSearching(true)
        console.log('Searching for', query)
        const results = await jutge.problems.semanticSearch({ query, limit: 100 })
        console.log('Results:', results)
        setResults(results)
        setSearching(false)
    }

    const fields: JFormFields = {
        exam_nm: {
            type: 'input',
            label: 'Query',
            value: query,
            setValue: setQuery,
            placeHolder: 'Coin change',
        },
        button: {
            type: 'button',
            text: 'Search problems',
            icon: <SearchIcon />,
            action: search,
        },
    }

    return (
        <div>
            <JForm fields={fields} />

            {searching && <div>Searching...</div>}

            {results && props.allAbstractProblems && (
                <div className="border rounded-lg p-4 flex flex-col gap-6">
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
    const [abspbm, setAbspbm] = useState(props.allAbstractProblems[props.result.problem_nm])
    const [pbm, setPbm] = useState(
        Object.values(abspbm.problems).find((p) => p.original_language_id === p.language_id)!,
    )
    const [detailsOpen, setDetailsOpen] = useState(false)

    function click(language_id: string) {
        setPbm(Object.values(abspbm.problems).find((p) => p.language_id === language_id)!)
    }

    return (
        <div className="flex flex-col">
            <div className="flex flex-row gap-2">
                <a
                    href={`https://jutge.org/problems/${props.result.problem_nm}`}
                    target="_blank"
                    rel="noreferrer"
                    className="font-bold"
                >
                    {props.result.problem_nm}
                </a>
                <div />
                {Object.values(abspbm.problems)
                    .sort((a, b) => a.language_id.localeCompare(b.language_id))
                    .map((p) => (
                        <Badge
                            key={p.language_id}
                            onClick={() => click(p.language_id)}
                            variant={pbm.language_id == p.language_id ? 'default' : 'outline'}
                            className="px-2"
                        >
                            {p.language_id}
                            {p.language_id == p.original_language_id &&
                                Object.values(abspbm.problems).length > 1 &&
                                '*'}
                        </Badge>
                    ))}
                <div />
                <div className="text-gray-400 text-xs mt-1.5">
                    <CircleGaugeIcon className="inline-block mr-1 mb-1" size={16} />
                    {props.result.similarity.toFixed(2)}
                </div>
            </div>
            <div className="space-y-1" />
            <div className="font-bold">{pbm.title}</div>
            <div className="mt-1 ml-4 text-sm flex flex-col">
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
                <div className="w-full flex flex-row ">
                    <div className="w-8">
                        <BotIcon className="inline-block mr-1 mb-1" size={16} />
                    </div>
                    <div className="w-full">{pbm.summary?.summary_1s}</div>
                </div>
                <div className="w-full flex flex-row">
                    <div className="w-8">
                        <TagsIcon className="inline-block mr-1 mb-1" size={16} />
                    </div>
                    <div className="w-full">{pbm.summary?.keywords.replaceAll(',', ', ')}</div>
                </div>
                {detailsOpen && (
                    <div className="w-full flex flex-row ">
                        <div className="w-8">
                            <CircleMinusIcon
                                className="inline-block mr-1 mb-1 text-primary"
                                size={16}
                                onClick={() => setDetailsOpen(false)}
                            />
                        </div>
                        <div className="w-full">
                            <p>{pbm.summary?.summary_1p}</p>
                            <p className="text-gray-400">
                                {abspbm.solution_tags?.tags.replaceAll(',', ', ')}
                            </p>
                        </div>
                    </div>
                )}
                {!detailsOpen && (
                    <div className="w-full flex flex-row " onClick={() => setDetailsOpen(true)}>
                        <div className="w-8">
                            <CirclePlusIcon
                                className="inline-block mr-1 mb-1 text-primary"
                                size={16}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
