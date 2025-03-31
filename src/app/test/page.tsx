'use client'

import Page from '@/components/Page'
import { useAuth } from '@/providers/Auth'
import { useEffect } from 'react'
import { useXTerm } from 'react-xtermjs'

export default function TestPage() {
    //

    const { instance: term, ref: xtermRef } = useXTerm()

    useEffect(() => {
        const fetchData = async () => {
            const response = await fetch('https://new.jutge.org/stream/clock')
            if (response.body === null) throw new Error('Network response was not ok')

            const reader = response.body.getReader()
            while (true) {
                const { done, value } = await reader.read()
                if (done) return
                term?.write(value)
            }
        }
        fetchData()
    }, [term])

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
                <div className="w-full h-[400px] border-8 border-black rounded-lg">
                    <div ref={xtermRef} />
                </div>
            </Page>
        </>
    )
}
