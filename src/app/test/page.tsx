'use client'

import Page from '@/components/Page'
import { useAuth } from '@/providers/Auth'

export default function TestPage() {
    const auth = useAuth()

    return (
        <>
            <Page
                public={true}
                pageContext={{
                    menu: auth.user ? 'user' : 'public',
                    current: 'about',
                    title: 'About',
                }}
            >
                Hi
            </Page>
        </>
    )
}
