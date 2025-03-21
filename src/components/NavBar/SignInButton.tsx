'use client'

import { Button } from '@/components/ui/button'
import { LogInIcon } from 'lucide-react'
import Link from 'next/link'

export default function SignInButton() {
    return (
        <Link href="/home">
            <Button variant="ghost" size="icon" title="Sign In">
                <LogInIcon className="h-4 w-4 text-primary" />
            </Button>
        </Link>
    )
}
