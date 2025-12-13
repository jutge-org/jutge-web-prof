'use client'

import { redirect } from 'next/navigation'
import Page from '../components/layouts/court/Page'
import { useAuth } from '../components/layouts/court/lib/Auth'

export default function HomePage() {
    const auth = useAuth()
    if (auth.user) redirect('/home')

    return (
        <Page pageContext={{ menu: 'public', current: 'home', title: 'Home' }}>
            <h1>Home</h1>
        </Page>
    )
}
