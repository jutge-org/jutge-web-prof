import { Toaster } from '@/components/ui/sonner'
import AuthProvider from '@/providers/Auth'
import { ThemeProvider } from '@/providers/Theme'
import type { Metadata } from 'next'
import { ReactNode } from 'react'
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
                <ThemeProvider>
                    <AuthProvider>
                        {props.children}
                        <Toaster richColors expand={true} />
                    </AuthProvider>
                </ThemeProvider>
            </body>
        </html>
    )
}
