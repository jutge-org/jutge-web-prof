'use client'

import { Button } from '@/components/ui/button'
import { InfoIcon } from 'lucide-react'
import Link from 'next/link'

export default function AboutButton() {
    return (
        <Link href="/about">
            <Button variant="ghost" size="icon">
                <InfoIcon className="h-4 w-4" />
            </Button>
        </Link>
    )
}
