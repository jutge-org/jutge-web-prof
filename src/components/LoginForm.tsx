'use client'

import { useAuth } from '@/components/layouts/court/lib/Auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { JutgeApiClient } from '@/lib/jutge_api_client'
import { Loader2Icon, LogInIcon, SquareXIcon } from 'lucide-react'
import Image from 'next/image'
import { FormEvent, useState } from 'react'
import { toast } from 'sonner'

export default function LoginForm() {
    //

    const auth = useAuth()
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    async function signin(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()
        const formData = new FormData(event.currentTarget)
        const email = formData.get('email') as string | null
        const password = formData.get('password') as string | null
        if (email === null || password === null) return
        setLoading(true)

        {
            // check connectivity to Jutge.org
            const jutge = new JutgeApiClient()
            const url = jutge.JUTGE_API_URL
            try {
                const response = await fetch(url, {
                    method: 'HEAD', // HEAD is lighter than GET
                    signal: AbortSignal.timeout(5000), // 5 second timeout
                })
            } catch (err: unknown) {
                setLoading(false)
                setError(`Could not connect to ${url}`)
                toast.error(`Could not connect to ${url}`)
                return
            }
        }

        await new Promise((resolve) => setTimeout(resolve, 500)) // just to see the spinning icon
        const ok = await auth.login({ email, password })
        setLoading(false)
        if (!ok) setError('Invalid credentials')
    }

    async function clearError() {
        setError(null)
    }

    return (
        <>
            <div className="flex flex-col items-center justify-center min-h-[calc(100vh-20rem)]">
                <Image
                    src="/online-education.png"
                    className="w-42 h-42 mt-8 mb-8"
                    width={128}
                    height={128}
                    alt="Teacher"
                    priority={true}
                />
                <Card className="w-72">
                    <CardHeader>
                        <CardTitle className="text-2xl">Sign in</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={signin}>
                            <div className="flex flex-col gap-6">
                                <div className="grid gap-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        name="email"
                                        required
                                        autoComplete="email"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <div className="flex items-center">
                                        <Label htmlFor="password">Password</Label>
                                    </div>
                                    <Input
                                        id="password"
                                        type="password"
                                        name="password"
                                        required
                                        autoComplete="current-password"
                                    />
                                </div>
                                <Button type="submit" className="w-full">
                                    {loading ? (
                                        <Loader2Icon className="animate-spin" />
                                    ) : (
                                        <LogInIcon />
                                    )}
                                    Sign in
                                </Button>
                                {error && (
                                    <div className="w-full flex flex-row text-chart-1">
                                        <div className="flex-grow" />
                                        {error}
                                        <SquareXIcon
                                            onClick={clearError}
                                            size={24}
                                            className="pl-2 cursor-pointer"
                                        />
                                    </div>
                                )}
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </>
    )
}
