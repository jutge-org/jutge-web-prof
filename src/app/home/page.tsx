'use client'

import Page from '@/components/layouts/court/Page'
import { useAuth } from '@/components/layouts/court/lib/Auth'
import { menus } from '@/lib/menus'
import { BotMessageSquareIcon, RssIcon } from 'lucide-react'
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
                <div className="mt-8 w-full pt-8 flex flex-row justify-center">
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

                <div className="w-full md:w-1/2 mx-auto border-primary border-2 rounded-lg">
                    <div className="p-6 flex flex-col gap-1 text-sm">
                        <div>
                            <BotMessageSquareIcon size={64} strokeWidth={0.8} className="ml-2" />
                        </div>
                        <div>
                            <b>Hello instructor!</b> &nbsp; I&apos;m Jutge<sup>AI</sup>, the bot for
                            Jutge.org.
                        </div>
                        <div>
                            I prepare nice summaries of your problem statements and solutions. These
                            are shown in the Problems section and used in the new Search section.
                        </div>
                        <div>And now I can even also help you generating new problems!</div>
                        <div>
                            Also, remember to click{' '}
                            <span className="border rounded-md p-1 mx-1">⌘K</span> and I will help
                            you navigating and searching this web.
                        </div>
                    </div>
                </div>

                <div className="mt-8 w-full md:w-1/2 mx-auto border-primary border-2 rounded-lg">
                    <div className="p-6 flex flex-col gap-1 text-sm">
                        <div>
                            <RssIcon size={64} strokeWidth={0.8} className="" />
                        </div>
                        <div>
                            <b>News</b>
                        </div>
                        <ul className="ml-4 mt-4 list-disc list-outside space-y-2">
                            <li>
                                2025-11-27: Allow filtering for problem codes on add problem dialog.
                            </li>
                            <li>
                                2025-11-15: First version of automatic problem generation powered
                                with Jutge<sup>AI</sup>.
                            </li>
                            <li>
                                2025-11-14: Exam problems can be copied and pasted through the
                                clipboard.
                            </li>
                            <li>
                                2025-11-13: PDF exams include version with duplex pages for easier
                                printing.
                            </li>
                            <li>
                                2025-11-13: It is possible to change (or remove) the password of an
                                exam.
                            </li>
                            <li>2025-10-26: Full text and semantic search functionality added. </li>
                        </ul>
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
