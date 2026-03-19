'use client'

import Page from '@/components/layout/Page'
import { StoreProblemDetailView } from '@/components/store/StoreProblemDetailView'
import { useParams } from 'next/navigation'

export default function StoreProblemSolutionsPage() {
    const { problem_nm } = useParams<{ problem_nm: string }>()

    return (
        <Page
            pageContext={{
                title: `Store ❯ ${problem_nm}`,
                menu: 'user',
                current: 'store',
                subTitle: `Store ❯ ${problem_nm}`,
                subMenu: 'storeProblem',
                subCurrent: 'solutions',
            }}
        >
            <StoreProblemDetailView problem_nm={problem_nm} section="solutions" />
        </Page>
    )
}
