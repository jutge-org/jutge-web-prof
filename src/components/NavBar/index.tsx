'use client'

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { menus } from '@/providers/Menu'
import { EllipsisVerticalIcon, MenuIcon } from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import * as React from 'react'
import { PageContext } from '../Page'
import ModeToggle from './ModeToggle'
import ProfileToggle from './ProfileToggle'
import SignInButton from './SignInButton'

export default function NavBar({ pageContext }: { pageContext: PageContext }) {
    return (
        <nav className="sticky top-0 z-40 w-full bg-background">
            <div className="flex flex-col">
                <div className="border-b bg-neutral-100 dark:bg-neutral-800">
                    <div className="container mx-auto max-w-[1000px] h-12 flex flex-row items-center">
                        <div className="size-2" />
                        <div className="hidden sm:block">
                            <MainMenu pageContext={pageContext} />
                        </div>
                        <div className="block sm:hidden">
                            <HamburgerMenu pageContext={pageContext} />
                        </div>
                        <div className="flex-grow" />
                        {pageContext.menu === 'public' && pageContext.current !== 'home' && (
                            <SignInButton />
                        )}
                        <ModeToggle />
                        <ProfileToggle />
                    </div>
                </div>
                {pageContext.subTitle && (
                    <div className="border-b">
                        <div className="block sm:hidden">
                            <div className="container mx-auto max-w-[1000px] h-12 w-full flex flex-row items-center">
                                <div className="w-full flex flex-row items-center">
                                    <div className="size-4" />
                                    <div className="font-bold">{pageContext.subTitle}</div>
                                    <div className="flex-grow" />
                                    <HamburgerSubMenu pageContext={pageContext} />
                                </div>
                            </div>
                        </div>
                        <div className="hidden sm:block">
                            <div className="container mx-auto max-w-[1000px] h-12 w-full flex flex-row items-center">
                                <div className="w-full flex flex-row items-center">
                                    <div className="size-4" />
                                    <div className="font-bold">{pageContext.subTitle}</div>
                                    <div className="flex-grow" />
                                    <SubMenu pageContext={pageContext} />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    )
}

function MainMenu({ pageContext }: { pageContext: PageContext }) {
    const menu = menus[pageContext.menu]
    const current = pageContext.current

    return (
        <div className="flex flex-row gap-2">
            {Object.entries(menu).map(([key, item]) => (
                <Link
                    key={key}
                    href={item.href}
                    className="text-black dark:text-white hover:no-underline font-medium"
                >
                    <span
                        className={
                            current === key
                                ? 'px-2 pb-3 border-b-4 border-primary text-black dark:text-white'
                                : 'px-2'
                        }
                    >
                        {item.name}
                    </span>
                </Link>
            ))}
        </div>
    )
}

function SubMenu({ pageContext }: { pageContext: PageContext }) {
    if (!pageContext.subMenu) return null
    const menu = menus[pageContext.subMenu]
    const current = pageContext.subCurrent

    return (
        <div className="ml-8 mr-2 flex flex-row gap-4 text-sm">
            {Object.entries(menu).map(([key, item]) => (
                <Link
                    key={key}
                    href={item.href}
                    className="text-black dark:text-white hover:no-underline"
                >
                    <span
                        className={key === current ? 'font-bold' : 'font-medium'}
                        title={item.name}
                    >
                        {item.icon ? item.icon : item.name}
                    </span>
                </Link>
            ))}
        </div>
    )
}

function HamburgerMenu({ pageContext }: { pageContext: PageContext }) {
    const [isOpen, setIsOpen] = React.useState(false)
    const menu = menus[pageContext.menu]
    const current = pageContext.current

    return (
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
                <div className="flex flex-row">
                    <div className="w-2" />
                    <MenuIcon size={24} />
                    <div className="w-2" />
                    <div className="text-primary font-bold">Jutge.org</div>
                </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48 shadow-lg">
                <DropdownMenuGroup>
                    {' '}
                    {Object.entries(menu).map(([key, item]) => (
                        <DropdownMenuItem
                            key={key}
                            onClick={() => {
                                setIsOpen(false)
                                redirect(item.href)
                            }}
                            className="text-base"
                        >
                            {item.icon}
                            <div className="size-1" />
                            <div className={current === key ? 'font-bold' : 'font-medium'}>
                                {item.name}
                            </div>
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

function HamburgerSubMenu({ pageContext }: { pageContext: PageContext }) {
    const [isOpen, setIsOpen] = React.useState(false)
    if (!pageContext.subMenu) return null
    const menu = menus[pageContext.subMenu]
    const current = pageContext.subCurrent

    return (
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
                <div className="flex flex-row">
                    {current && <div className="font-bold">{menu[current].name}</div>}
                    <div className="w-1" />
                    <EllipsisVerticalIcon size={24} />
                    <div className="w-2" />
                </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48 shadow-lg">
                <DropdownMenuGroup>
                    {' '}
                    {Object.entries(menu).map(([key, item]) => (
                        <DropdownMenuItem
                            key={key}
                            onClick={() => {
                                setIsOpen(false)
                                redirect(item.href)
                            }}
                            className="text-base"
                        >
                            <div className="size-1" />
                            <div className={current === key ? 'font-bold' : 'font-medium'}>
                                {item.name}
                            </div>
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
