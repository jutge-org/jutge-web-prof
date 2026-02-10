'use client'

import Link from 'next/link'
import { useState } from 'react'
import Page from '../../components/layout/Page'
import { menus } from '../../lib/menus'

export default function DocsPage() {
    const menu = menus.docs
    return (
        <Page pageContext={{ menu: 'user', current: 'docs', title: 'Docs' }}>
            <div className="w-full pt-8 sm:pt-32 flex flex-row justify-center">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-8">
                    {Object.entries(menu).map(([key, item]: [string, (typeof menu)[string]]) => (
                        <Option
                            key={key}
                            icon={item.icon2xl}
                            title={item.name as string}
                            href={item.href}
                        />
                    ))}
                </div>
            </div>
        </Page>
    )
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
