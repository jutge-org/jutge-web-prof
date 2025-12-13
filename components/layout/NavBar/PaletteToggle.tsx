'use client'

import { CheckIcon, PaletteIcon } from 'lucide-react'
import { capitalize } from 'radash'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { availablePalettes, useTheme } from '../lib/Theme'

export function PaletteToggle() {
    const { palette, setPalette } = useTheme()

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" title="Toggle palette">
                    <PaletteIcon className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all" />
                    <span className="sr-only">Toggle palette</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                {availablePalettes.map((p) => (
                    <DropdownMenuItem key={p} onClick={() => setPalette(p)}>
                        {palette === p ? (
                            <CheckIcon className="mr-2 h-4 w-4" />
                        ) : (
                            <div className="mr-2 h-4 w-4" />
                        )}
                        <div className={palette === p ? 'font-bold' : ''}>{capitalize(p)}</div>
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
