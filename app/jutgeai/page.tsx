'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Page from '@/components/layout/Page'

export default function JutgeAIPage() {
    const router = useRouter()

    useEffect(() => {
        router.replace('/jutgeai/chat')
    }, [router])

    return (
        <Page
            pageContext={{
                title: 'JutgeAI',
                menu: 'user',
                current: 'jutgeai',
                subTitle: 'JutgeAI',
                subMenu: 'jutgeai',
                subCurrent: 'chat',
            }}
        >
            <div className="flex items-center justify-center py-12">
                <p className="text-muted-foreground">Redirecting to Chat…</p>
            </div>
        </Page>
    )
}
