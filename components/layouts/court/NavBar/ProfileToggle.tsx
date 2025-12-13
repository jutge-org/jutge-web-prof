'use client'

import { LogOutIcon, UserIcon } from 'lucide-react'
import Image from 'next/image'
import { download2src } from '../../../../lib/utils'
import { Button } from '../../../ui/button'
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '../../../ui/sheet'
import Markdown from '../../../wrappers/Markdown'
import { useAuth } from '../lib/Auth'

export default function ProfileToggle() {
    const auth = useAuth()

    async function signOut() {
        await auth.logout()
    }

    if (!auth.user) return null

    const avatar = auth.avatar && (
        <Image
            src={download2src(auth.avatar)}
            className="w-32 rounded"
            alt="Avatar"
            height={50}
            width={50}
        />
    )

    const description = auth.user.description && (
        <Markdown className="text-sm" markdown={auth.user.description} />
    )

    const logoutButton = (
        <Button type="submit" className="w-32" onClick={signOut}>
            <LogOutIcon />
            Sign out
        </Button>
    )

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                    <UserIcon className="h-4 w-4" />
                </Button>
            </SheetTrigger>
            <SheetContent side="right">
                <SheetHeader>
                    <SheetTitle>{auth.user.name}</SheetTitle>
                    <SheetDescription>{auth.user.email}</SheetDescription>
                    <div className="flex flex-col space-y-4 mt-4">
                        {avatar}
                        {description}
                        {logoutButton}
                    </div>
                </SheetHeader>
            </SheetContent>
        </Sheet>
    )
}
