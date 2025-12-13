import AuthProvider from '@/components/layouts/court/lib/Auth'
import { ThemeProvider } from '@/components/layouts/court/lib/Theme'
import { Toaster } from '@/components/ui/sonner'
import type { Metadata } from 'next'
import { NavigationGuardProvider } from 'next-navigation-guard'
import { ReactNode } from 'react'

import '@/components/layouts/court/themes.css'
import './globals.css'

export const metadata: Metadata = {
    title: 'Jutge.org ~ Instructor',
    description: 'Jutge.org Instructor Site',
}

export type RootLayoutProps = Readonly<{
    children: ReactNode
}>

export default function RootLayout(props: RootLayoutProps): ReactNode {
    return (
        <html lang="en" suppressHydrationWarning>
            <head />
            <body>
                <NavigationGuardProvider>
                    <ThemeProvider>
                        <AuthProvider>
                            {props.children}
                            <Toaster richColors expand={true} position="bottom-left" closeButton />
                        </AuthProvider>
                    </ThemeProvider>
                </NavigationGuardProvider>
            </body>
        </html>
    )
}
