'use client'

import Page from '@/components/Page'
import { useAuth } from '@/providers/Auth'
import { redirect } from 'next/navigation'

export default function HomePage() {
    const auth = useAuth()
    if (auth.user) redirect('/home')

    return (
        <Page pageContext={{ menu: 'public', current: 'home', title: 'Home' }}>
            <h1>Home</h1>
        </Page>
    )
}
