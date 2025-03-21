'use client'

import Page from '@/components/Page'
import { useParams } from 'next/navigation'

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
    return <>No implementation yet.</>
}
