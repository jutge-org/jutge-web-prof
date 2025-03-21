'use client'

'use client'

import Page from '@/components/Page'
import { useAuth } from '@/providers/Auth'

export default function TestPage() {
    //

    console.log('hop')

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
                test
            </Page>
        </>
    )
}
