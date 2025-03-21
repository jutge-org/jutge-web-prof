'use client'

import { Button } from '@/components/ui/button'
import { HomeIcon } from 'lucide-react'
import Link from 'next/link'

export default function HomeButton() {
    return (
        <Link href="/home">
            <Button variant="ghost" size="icon" title="Home">
                <HomeIcon className="h-4 w-4 text-primary" />
            </Button>
        </Link>
    )
}
