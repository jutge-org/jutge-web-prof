'use client'

import Page from '@/components/Page'
import jutge from '@/lib/jutge'
import {
    ColorMapping,
    InstructorBriefExam,
    InstructorExamProblem,
    Ranking,
    RankingResult,
} from '@/lib/jutge_api_client'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function ExamRankingPage() {
    const { exam_nm } = useParams<{ exam_nm: string }>()
    return (
        <Page
            pageContext={{
                title: `Exam ${exam_nm}`,
                menu: 'user',
                current: 'exams',
                subTitle: `Exams ❯ ${exam_nm}`,
                subMenu: 'exams',
                subCurrent: 'ranking',
            }}
        >
            <ExamRankingView />
        </Page>
    )
}

function ExamRankingView() {
    const { exam_nm } = useParams<{ exam_nm: string }>()

    const [exam, setExam] = useState<InstructorBriefExam | null>(null)
    const [examProblems, setExamProblems] = useState<InstructorExamProblem[]>([])
    const [ranking, setRanking] = useState<Ranking | null>(null)
    const [colors, setColors] = useState<ColorMapping | null>(null)

    useEffect(() => {
        async function fetchData() {
            const exam = await jutge.instructor.exams.get(exam_nm)
            const examProblems = await jutge.instructor.exams.getProblems(exam_nm)
            const ranking = await jutge.instructor.exams.getRanking(exam_nm)
            const colors = await jutge.misc.getHexColors()

            setExam(exam)
            setExamProblems(examProblems)
            setRanking(ranking)
            setColors(colors)
        }

        fetchData()
    }, [exam_nm])

    if (exam === null || examProblems === null || ranking === null || colors === null) return null

    return (
        <div className="text-sm">
            <p>Under development</p>
            <table>
                <tbody>
                    {examProblems.length > 0 && examProblems[0].icon && (
                        <tr>
                            <td></td>
                            <td></td>
                            <td></td>
                            {exam.avatars && <td></td>}
                            {examProblems.map((problem, index) => (
                                <td key={index} className="h-12 w-12">
                                    <div className="flex flex-col justify-center items-center">
                                        <Image
                                            src={`https://jutge.org/img/examicons/${problem.icon}.svg`}
                                            alt={problem.icon || 'icon'}
                                            width={32}
                                            height={32}
                                        />
                                    </div>
                                </td>
                            ))}
                            <td></td>
                        </tr>
                    )}
                    <tr>
                        <td></td>
                        <td></td>
                        {exam.avatars && <td></td>}
                        <td className="bg-neutral-100 border-2 border-white rounded-lg px-4 text-center font-bold">
                            Score
                        </td>
                        {examProblems.map((problem, index) => (
                            <td
                                key={index}
                                className="bg-neutral-100 border-2 border-white rounded-lg w-40 px-4 text-center "
                            >
                                <a
                                    href={`https://jutge.org/problems/${problem.problem_nm}`}
                                    target="_blank"
                                    title={problem.problem_nm}
                                    className="font-bold text-primary"
                                >
                                    {problem.caption || `P${index + 1}`}
                                </a>
                                {problem.weight !== null && (
                                    <>
                                        <br />
                                        {problem.weight}
                                    </>
                                )}
                            </td>
                        ))}
                        <td className="bg-neutral-100 border-2 border-white rounded-lg px-4 text-center font-bold">
                            Score
                        </td>
                    </tr>

                    {ranking.map((row, index) => (
                        <tr key={index}>
                            <td className="bg-neutral-100 border-2 border-white rounded-lg px-2 text-right">
                                {row.position}
                            </td>
                            <td className="bg-neutral-100 border-2 border-white rounded-lg px-2 truncate">
                                {row.name}
                            </td>
                            {exam.avatars && (
                                <td className="bg-neutral-100 border-2 border-white rounded-lg px-2 h-12 w-12">
                                    <Image
                                        src={`https://jutge.org/avatars/${exam.avatars!}/${row.avatar}`}
                                        alt={row.avatar || 'Avatar'}
                                        width={32}
                                        height={32}
                                    />
                                </td>
                            )}

                            <td className="bg-neutral-100 border-2 border-white rounded-lg px-4">
                                <div className="flex flex-col gap-0 items-center">
                                    <div className="font-bold">{row.totalScore}</div>
                                    <div className="text-xs">{Math.floor(row.totalTime)}</div>
                                </div>
                            </td>

                            {row.rankingResults.map((result, index) => (
                                <td
                                    key={index}
                                    className="bg-neutral-100 border-2 border-white rounded-lg w-40 px-2 text-center"
                                >
                                    <Score result={result} colors={colors} />
                                </td>
                            ))}

                            <td className="bg-neutral-100 border-2 border-white rounded-lg px-4">
                                <div className="flex flex-col gap-0 items-center">
                                    <div className="font-bold">{row.totalScore}</div>
                                    <div className="text-xs">{Math.floor(row.totalTime)}</div>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

function Score({ result, colors }: { result: RankingResult; colors: ColorMapping }) {
    if (result.score === 1)
        return (
            <div className="" style={{ color: colors.verdicts.AC }}>
                {Math.floor(result.firstACTime!)}
                {result.firstACSubmission !== 1 && (
                    <span className="text-xs">&nbsp;({result.firstACSubmission! - 1})</span>
                )}
            </div>
        )

    if (result.lastSubmissionVerdict === 'SC') {
        return (
            <div className="" style={{ color: colors.verdicts.SC }}>
                {Math.floor(result.lastSubmissionTime!)}
                {result.firstACSubmission !== 1 && (
                    <span className="text-xs">&nbsp;({result.firstACSubmission! - 1})</span>
                )}
                <br />
                <span className="">
                    {result.lastSubmissionVerdict} {result.score}
                </span>
            </div>
        )
    }

    if (result.lastSubmissionVerdict !== null) {
        return (
            <div className="" style={{ color: colors.verdicts.WA }}>
                {Math.floor(result.lastSubmissionTime!)}
                {result.firstACSubmission !== 1 && (
                    <span className="text-xs">&nbsp;({result.firstACSubmission! - 1})</span>
                )}
                <br />
                <span className="">{result.lastSubmissionVerdict}</span>
            </div>
        )
    }

    return null
}
