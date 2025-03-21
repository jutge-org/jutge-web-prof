'use client'

import { Button } from '@/components/ui/button'
import { useCommandK } from '@/providers/CommandK'
import { MenuIcon } from 'lucide-react'

export default function CommandKToggle() {
    const commandK = useCommandK()

    return (
        <Button
            title="Menu (⌘K)"
            variant="ghost"
            size="icon"
            onClick={() => commandK.setOpen(true)}
        >
            <MenuIcon />
            <span className="sr-only">Menu</span>
        </Button>
    )
}
