'use client'

import { StoreProblemStatisticsSection } from '@/components/store/StoreProblemStatisticsSection'
import SimpleSpinner from '@/components/SimpleSpinner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import jutge from '@/lib/jutge'
import { AbstractProblem, ProblemSuppl, SharingSettings, Testcase } from '@/lib/jutge_api_client'
import { offerDownloadFile } from '@/lib/utils'
import { BotIcon } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

function tryDecodeB64(b64: string): string {
    try {
        const binary = atob(b64)
        const bytes = new Uint8Array(binary.length)
        for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
        return new TextDecoder('utf-8', { fatal: false }).decode(bytes)
    } catch {
        return '—'
    }
}

function formatChecks(checks: Record<string, boolean>) {
    return (
        <div className="flex flex-row flex-wrap gap-2 mt-1">
            {Object.entries(checks).map(([proglang, ok]) => (
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

export type StoreProblemSection =
    | 'properties'
    | 'statement'
    | 'testcases'
    | 'solutions'
    | 'statistics'

export function StoreProblemDetailView({
    problem_nm,
    section,
}: {
    problem_nm: string
    section: StoreProblemSection
}) {
    const [abstract, setAbstract] = useState<AbstractProblem | null>(null)
    const [loadError, setLoadError] = useState<string | null>(null)
    const [langId, setLangId] = useState<string | null>(null)

    const sortedLangs = useMemo(() => {
        if (!abstract) return []
        return Object.values(abstract.problems).sort((a, b) =>
            a.language_id.localeCompare(b.language_id),
        )
    }, [abstract])

    useEffect(() => {
        let cancelled = false
        ;(async () => {
            try {
                const ap = await jutge.problems.getAbstractProblem(problem_nm)
                if (!cancelled) {
                    setAbstract(ap)
                    setLoadError(null)
                }
            } catch {
                if (!cancelled) {
                    setLoadError('This problem is not available or could not be loaded.')
                    setAbstract(null)
                }
            }
        })()
        return () => {
            cancelled = true
        }
    }, [problem_nm])

    useEffect(() => {
        if (sortedLangs.length === 0) return
        if (!langId || !sortedLangs.some((p) => p.language_id === langId)) {
            setLangId(sortedLangs[0].language_id)
        }
    }, [sortedLangs, langId])

    const problem_id = langId ? `${problem_nm}_${langId}` : null
    const brief = problem_id && abstract ? abstract.problems[problem_id] : null

    const [htmlStatement, setHtmlStatement] = useState('')
    const [suppl, setSuppl] = useState<ProblemSuppl | null>(null)
    const [samples, setSamples] = useState<Testcase[]>([])
    const [publicTcs, setPublicTcs] = useState<Testcase[]>([])
    const [detailLoading, setDetailLoading] = useState(false)

    const [sharing, setSharing] = useState<SharingSettings | 'unknown'>('unknown')
    const [solutionTemplates, setSolutionTemplates] = useState<string[]>([])

    useEffect(() => {
        let cancelled = false
        ;(async () => {
            try {
                const s = await jutge.instructor.problems.getSharingSettings(problem_nm)
                if (!cancelled) setSharing(s)
            } catch {
                if (!cancelled) setSharing('unknown')
            }
        })()
        return () => {
            cancelled = true
        }
    }, [problem_nm])

    useEffect(() => {
        if (!problem_id) return
        let cancelled = false
        setDetailLoading(true)
        ;(async () => {
            try {
                const [html, sp, sm, pub] = await Promise.all([
                    jutge.problems.getHtmlStatement(problem_id).catch(() => ''),
                    jutge.problems.getProblemSuppl(problem_id).catch(() => ({
                        compilers_with_ac: [] as string[],
                        proglangs_with_ac: [] as string[],
                        official_solution_checks: {} as Record<string, boolean>,
                        handler: null as unknown,
                    })),
                    jutge.problems.getSampleTestcases(problem_id).catch(() => [] as Testcase[]),
                    jutge.problems.getPublicTestcases(problem_id).catch(() => [] as Testcase[]),
                ])
                if (!cancelled) {
                    setHtmlStatement(html)
                    setSuppl(sp)
                    setSamples(sm)
                    setPublicTcs(pub)
                }
            } finally {
                if (!cancelled) setDetailLoading(false)
            }
        })()
        return () => {
            cancelled = true
        }
    }, [problem_id])

    useEffect(() => {
        if (!problem_id) return
        const shared = sharing !== 'unknown' && sharing.shared_solutions
        if (!shared) {
            setSolutionTemplates([])
            return
        }
        let cancelled = false
        jutge.problems
            .getTemplates(problem_id)
            .then((names) => {
                if (!cancelled) {
                    setSolutionTemplates(names.filter((n) => /solution/i.test(n)))
                }
            })
            .catch(() => {
                if (!cancelled) setSolutionTemplates([])
            })
        return () => {
            cancelled = true
        }
    }, [problem_id, sharing])

    if (loadError) {
        return (
            <div className="text-sm text-muted-foreground border rounded-lg p-6">{loadError}</div>
        )
    }

    if (!abstract || !langId || !brief) return <SimpleSpinner />
    if (section === 'properties' && suppl === null) return <SimpleSpinner />

    const showLangTabs = sortedLangs.length > 1 && section !== 'statistics'

    return (
        <div className="flex flex-col gap-6">
            {showLangTabs && (
                <div className="flex flex-wrap gap-2 border-b pb-3">
                    {sortedLangs.map((p) => (
                        <Button
                            key={p.language_id}
                            type="button"
                            size="sm"
                            variant={langId === p.language_id ? 'default' : 'outline'}
                            onClick={() => setLangId(p.language_id)}
                        >
                            {p.language_id}
                        </Button>
                    ))}
                </div>
            )}

            {section === 'statement' && (
                <Card>
                    <CardHeader className="p-4">
                        <CardTitle>Statement</CardTitle>
                    </CardHeader>
                    <CardContent className="px-4 pb-4">
                        {detailLoading ? (
                            <SimpleSpinner />
                        ) : (
                            <div
                                className="prose prose-sm dark:prose-invert max-w-none border rounded-lg p-4 overflow-x-auto"
                                dangerouslySetInnerHTML={{ __html: htmlStatement }}
                            />
                        )}
                    </CardContent>
                </Card>
            )}

            {section === 'properties' && suppl != null && (
                <Card>
                    <CardHeader className="p-4">
                        <CardTitle>Properties</CardTitle>
                    </CardHeader>
                    <CardContent className="px-4 pb-4 flex flex-col gap-4 text-sm">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <div className="text-muted-foreground text-xs uppercase tracking-wide">
                                    Title
                                </div>
                                <div className="font-medium">{brief.title || '—'}</div>
                            </div>
                            <div>
                                <div className="text-muted-foreground text-xs uppercase tracking-wide">
                                    Problem id
                                </div>
                                <div className="font-mono">{problem_id}</div>
                            </div>
                            {abstract.author && (
                                <div>
                                    <div className="text-muted-foreground text-xs uppercase tracking-wide">
                                        Author
                                    </div>
                                    <div>{abstract.author}</div>
                                </div>
                            )}
                            {abstract.author_email && (
                                <div>
                                    <div className="text-muted-foreground text-xs uppercase tracking-wide">
                                        Author email
                                    </div>
                                    <div>{abstract.author_email}</div>
                                </div>
                            )}
                            {brief.translator && (
                                <div>
                                    <div className="text-muted-foreground text-xs uppercase tracking-wide">
                                        Translator
                                    </div>
                                    <div>{brief.translator}</div>
                                </div>
                            )}
                            <div>
                                <div className="text-muted-foreground text-xs uppercase tracking-wide">
                                    Type
                                </div>
                                <Badge variant="secondary" className="mt-1">
                                    {abstract.type || '—'}
                                </Badge>
                            </div>
                            <div>
                                <div className="text-muted-foreground text-xs uppercase tracking-wide">
                                    Driver
                                </div>
                                <Badge variant="secondary" className="mt-1">
                                    {abstract.driver_id || '—'}
                                </Badge>
                            </div>
                        </div>

                        {abstract.solution_tags && (
                            <div>
                                <div className="text-muted-foreground text-xs uppercase tracking-wide flex items-center gap-1">
                                    Solution tags <BotIcon size={14} />
                                </div>
                                <div>{abstract.solution_tags.tags.replaceAll(',', ', ')}</div>
                                <div className="text-xs text-muted-foreground mt-0.5">
                                    Model: {abstract.solution_tags.model}
                                </div>
                            </div>
                        )}

                        <div>
                            <div className="text-muted-foreground text-xs uppercase tracking-wide mb-1">
                                Official solution checks
                            </div>
                            {formatChecks(suppl.official_solution_checks)}
                        </div>

                        {brief.summary && (
                            <>
                                <div>
                                    <div className="text-muted-foreground text-xs uppercase tracking-wide flex items-center gap-1">
                                        Summary (1 sentence) <BotIcon size={14} />
                                    </div>
                                    <p className="mt-1">{brief.summary.summary_1s}</p>
                                </div>
                                <div>
                                    <div className="text-muted-foreground text-xs uppercase tracking-wide flex items-center gap-1">
                                        Summary (1 paragraph) <BotIcon size={14} />
                                    </div>
                                    <p className="mt-1">{brief.summary.summary_1p}</p>
                                </div>
                                <div>
                                    <div className="text-muted-foreground text-xs uppercase tracking-wide flex items-center gap-1">
                                        Keywords <BotIcon size={14} />
                                    </div>
                                    <p className="mt-1">
                                        {brief.summary.keywords.replaceAll(',', ', ')}
                                    </p>
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>
            )}

            {section === 'statistics' && (
                <Card>
                    <CardHeader className="p-4">
                        <CardTitle>Statistics</CardTitle>
                    </CardHeader>
                    <CardContent className="px-4 pb-4">
                        {problem_id && (
                            <StoreProblemStatisticsSection
                                problem_nm={problem_nm}
                                problem_id={problem_id}
                            />
                        )}
                    </CardContent>
                </Card>
            )}

            {section === 'testcases' && (
                <Card>
                    <CardHeader className="p-4">
                        <CardTitle>Test cases</CardTitle>
                    </CardHeader>
                    <CardContent className="px-4 pb-4 flex flex-col gap-6">
                        {detailLoading ? (
                            <SimpleSpinner />
                        ) : (
                            <>
                                <TestcaseTable title="Sample" rows={samples} />
                                <TestcaseTable title="Public" rows={publicTcs} />
                            </>
                        )}
                    </CardContent>
                </Card>
            )}

            {section === 'solutions' && (
                <Card>
                    <CardHeader className="p-4">
                        <CardTitle>Solutions</CardTitle>
                    </CardHeader>
                    <CardContent className="px-4 pb-4 flex flex-col gap-3 text-sm">
                        {sharing === 'unknown' && (
                            <p className="text-muted-foreground">
                                Sharing settings for this problem are not available. CREC QUE L'API
                                NO OFEREIX AQUESTA INFORMACIÓ ENCARA.
                            </p>
                        )}
                        {sharing !== 'unknown' && !sharing.shared_solutions && (
                            <p className="text-muted-foreground">
                                The author has not shared official solutions with instructors.
                            </p>
                        )}
                        {sharing !== 'unknown' && sharing.shared_solutions && (
                            <>
                                {solutionTemplates.length === 0 ? (
                                    <p className="text-muted-foreground">
                                        No solution template files were returned for this language.
                                    </p>
                                ) : (
                                    <div className="flex flex-col gap-2">
                                        {solutionTemplates.map((name) => (
                                            <Button
                                                key={name}
                                                variant="outline"
                                                className="w-fit justify-start"
                                                onClick={async () => {
                                                    const dl = await jutge.problems.getTemplate({
                                                        problem_id: problem_id!,
                                                        template: name,
                                                    })
                                                    offerDownloadFile(dl, dl.name || name)
                                                }}
                                            >
                                                Download {name}
                                            </Button>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    )
}

function TestcaseTable({ title, rows }: { title: string; rows: Testcase[] }) {
    if (rows.length === 0) {
        return (
            <div>
                <div className="font-semibold mb-2">{title}</div>
                <p className="text-sm text-muted-foreground">None</p>
            </div>
        )
    }
    return (
        <div>
            <div className="font-semibold mb-2">{title}</div>
            <div className="flex flex-col gap-4">
                {rows.map((tc) => (
                    <div key={tc.name} className="border rounded-lg p-3 space-y-2">
                        <div className="font-mono text-xs text-muted-foreground">{tc.name}</div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            <div>
                                <div className="text-xs uppercase text-muted-foreground mb-1">
                                    Input
                                </div>
                                <Textarea
                                    readOnly
                                    className="font-mono text-xs min-h-[100px]"
                                    value={tryDecodeB64(tc.input_b64)}
                                />
                            </div>
                            <div>
                                <div className="text-xs uppercase text-muted-foreground mb-1">
                                    Expected
                                </div>
                                <Textarea
                                    readOnly
                                    className="font-mono text-xs min-h-[100px]"
                                    value={tryDecodeB64(tc.correct_b64)}
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
