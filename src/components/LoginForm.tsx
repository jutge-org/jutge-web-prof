'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FileIcon, Loader2Icon, LogInIcon, SquareXIcon } from 'lucide-react'
import Image from 'next/image'
import { FormEvent, useState } from 'react'
import { useAuth } from '../jutge-components/layouts/court/lib/Auth'

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
                <Card className="w-72 mb-6">
                    <CardHeader>
                        <CardTitle className="text-2xl">Nou curs!</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-6">
                        <p>Curs a l&apos;ICE sobre Jutge.org per a professors.</p>
                        <p>
                            <a href="https://formacio.ice.upc.edu/cat/estudis/formacio/curs/722470/curs-galaxia-aprenentatge-incorporar-plataforma-jutgeorg-docencia-eina-millorar-practica-algorismica-programacio/">
                                <Button className="w-full" variant="destructive">
                                    <FileIcon />
                                    Informació i inscripcions
                                </Button>
                            </a>
                        </p>
                    </CardContent>
                </Card>
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
