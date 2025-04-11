'use client'

import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { availableModes, useTheme } from '@/providers/Theme'
import { CheckIcon, Moon, Sun } from 'lucide-react'
import { capitalize } from 'radash'

export default function ModeToggle() {
    const { mode, setMode } = useTheme()

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" title="Toggle theme">
                    <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                    <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                    <span className="sr-only">Toggle theme</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                {availableModes.map((m) => (
                    <DropdownMenuItem key={m} onClick={() => setMode(m)}>
                        {mode === m ? (
                            <CheckIcon className="mr-2 h-4 w-4" />
                        ) : (
                            <div className="mr-2 h-4 w-4" />
                        )}
                        {capitalize(m)}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
