'use client'

import { MenuIcon } from 'lucide-react'
import { Button } from '../../../ui/button'
import { useCommandK } from '../lib/CommandK'

export default function CommandKToggle() {
    const commandK = useCommandK()

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={() => commandK.setOpen(true)}
            title="Command palette (⌘K)"
        >
            <MenuIcon />
            <span className="sr-only">Menu</span>
        </Button>
    )
}
