'use client'

import Page from '@/components/Page'
import { useXTerm } from '@/components/XTerm'
import { useEffect, useState } from 'react'

export default function TestPage() {
    return (
        <Page
            pageContext={{
                title: `Test`,
                menu: 'user',
            }}
        >
            <TestView />
        </Page>
    )
}

function TestView() {
    //

    const { instance, ref } = useXTerm()
    const [loading, setLoading] = useState(true)
    const [success, setSuccess] = useState(false)

    useEffect(() => {
        const fetchData = async () => {
            if (!instance || !ref || !ref.current) return
            const response = await fetch(`https://new.jutge.org/terminals/clock`)
            if (response.body === null) return
            const reader = response.body.getReader()
            while (true) {
                const { done, value } = await reader.read()
                if (done) break
                const text = new TextDecoder().decode(value)
                instance.write(text.replaceAll(/\n/g, '\r\n'))
            }
            setLoading(false)
        }

        fetchData()
    }, [instance, ref])

    return (
        <div className="mb-8">
            <div className="w-full h-[400px] border-8 border-black rounded-lg mb-8">
                <div ref={ref} style={{ width: '100%', height: '100%' }} />
            </div>
        </div>
    )
}
