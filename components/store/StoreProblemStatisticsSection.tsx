'use client'

import { ProblemStatisticsView } from '@/app/problems/[problem_nm]/statistics/page'

export type StoreProblemStatisticsSectionProps = {
    problem_nm: string
    problem_id: string
}

export function StoreProblemStatisticsSection({ problem_nm }: StoreProblemStatisticsSectionProps) {
    // Reuse the exact same statistics widgets as `/problems/[problem_nm]/statistics`
    // (the view itself uses `useParams()` to read `problem_nm` and fetch all needed data).
    return <ProblemStatisticsView key={problem_nm} />
}
