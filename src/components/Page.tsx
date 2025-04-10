'use client'

import LoginForm from '@/components/LoginForm'
import { useAuth } from '@/providers/Auth'
import CommandKProvider, { useCommandK } from '@/providers/CommandK'
import { ConfirmDialogProvider } from '@omit/react-confirm-dialog'
import { JSX, ReactNode } from 'react'
import { CommandKDialog } from './CommandKDialog'
import NavBar from './NavBar'

export type PageContext = {
    menu: string
    current?: string
    subMenu?: string
    subCurrent?: string
    subPrefix?: string
    title?: string
    subTitle?: JSX.Element | string
}

export interface PageProps {
    children: ReactNode[] | ReactNode
    public?: boolean
    pageContext: PageContext
}

export default function Page(props: PageProps) {
    const auth = useAuth()
    const cmdK = useCommandK()

    if (props.public || auth.user) {
        return (
            <>
                <CommandKProvider>
                    <ConfirmDialogProvider
                        defaultOptions={{
                            confirmText: 'Yes',
                            cancelText: 'No',
                            confirmButton: {
                                className: 'w-24',
                            },
                            cancelButton: {
                                className: 'w-24',
                            },
                            alertDialogDescription: {
                                className: 'text-primary pb-6',
                            },
                        }}
                    >
                        <NavBar pageContext={props.pageContext} />
                        <div className="mt-2 mb-16 sm:mt-8 px-2 container mx-auto max-w-[1000px]">
                            {props.children}
                        </div>
                        <CommandKDialog open={cmdK.open} setOpen={cmdK.setOpen} />
                    </ConfirmDialogProvider>
                </CommandKProvider>
            </>
        )
    } else {
        return (
            <>
                <NavBar pageContext={{ menu: 'public', current: 'home' }} />
                <LoginForm />
            </>
        )
    }
}
