'use client'

import Page from '@/components/Page'
import { useAuth } from '@/providers/Auth'
import { menus } from '@/providers/Menu'
import Link from 'next/link'
import { useState } from 'react'

export default function HomePage() {
    const auth = useAuth()

    if (!auth.user) {
        return (
            <Page pageContext={{ menu: 'public', current: 'home', title: 'Home' }}>
                <h1>Home</h1>
            </Page>
        )
    } else {
        const menu = menus.user

        return (
            <Page pageContext={{ menu: 'user', current: 'home', title: 'Home' }}>
                <div className="w-full pt-8 sm:pt-32 flex flex-row justify-center">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-8">
                        {Object.entries(menu)
                            .filter(([key, item]) => key != 'home')
                            .map(([key, item]) => (
                                <Option
                                    key={key}
                                    icon={item.icon2xl}
                                    title={item.name}
                                    href={item.href}
                                />
                            ))}
                    </div>
                </div>
                <div className="hidden sm:block">
                    <div className="text-center text-xs opacity-50">
                        Use <span className="border rounded-md p-1 mx-1">⌘K</span> to navigate and
                        search
                    </div>
                </div>
            </Page>
        )
    }
}

function Option(props: { icon: any; title: string; href: string }) {
    const [hover, setHover] = useState(false)

    return (
        <Link className="border-1 border-black rounded-xl hover:no-underline" href={props.href}>
            <div
                role="button"
                onMouseOver={() => setHover(true)}
                onMouseOut={() => setHover(false)}
                className="bg-primary text-background w-32 h-32 border-4 border-background hover:border-primary rounded-lg pt-6 flex flex-col gap-2 items-center"
            >
                <span className={hover ? 'animate-bounce' : ''}>{props.icon}</span>
                {props.title}
            </div>
        </Link>
    )
}
