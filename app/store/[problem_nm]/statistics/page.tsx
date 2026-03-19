'use client'

import Page from '@/components/layout/Page'
import { StoreProblemDetailView } from '@/components/store/StoreProblemDetailView'
import { useParams } from 'next/navigation'

export default function StoreProblemStatisticsPage() {
    const { problem_nm } = useParams<{ problem_nm: string }>()

    return (
        <Page
            pageContext={{
                title: `Finder ❯ ${problem_nm}`,
                menu: 'user',
                current: 'finder',
                subTitle: `Finder ❯ ${problem_nm}`,
                subMenu: 'finderProblem',
                subCurrent: 'statistics',
            }}
        >
            <StoreProblemDetailView problem_nm={problem_nm} section="statistics" />
        </Page>
    )
}
