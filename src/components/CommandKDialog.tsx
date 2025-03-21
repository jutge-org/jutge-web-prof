// això està trencat

'use client'

import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command'
import { useCommandK } from '@/providers/CommandK'
import { MenuItem, menus } from '@/providers/Menu'
import { Description, DialogTitle } from '@radix-ui/react-dialog'
import { redirect } from 'next/navigation'
import { useEffect } from 'react'

export function CommandKDialog() {
    //

    const commandK = useCommandK()
    const menu = menus.guest

    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                commandK.setOpen(!commandK.open)
            }
        }
        document.addEventListener('keydown', down)
        return () => document.removeEventListener('keydown', down)
    })

    function select(item: MenuItem) {
        commandK.setOpen(false)
        redirect(item.href)
    }

    return (
        <CommandDialog open={commandK.open} onOpenChange={commandK.setOpen}>
            <DialogTitle className="sr-only">Command K</DialogTitle>
            <Description className="sr-only">Command K</Description>
            <CommandInput placeholder="Type a command or search..." />
            <CommandList>
                <CommandEmpty>No results found.</CommandEmpty>
                <CommandGroup heading="Suggestions">
                    {Object.entries(menu.items).map(([key, item]) => (
                        <CommandItem key={key} onSelect={() => select(item)}>
                            {item.name}
                        </CommandItem>
                    ))}
                </CommandGroup>
            </CommandList>
        </CommandDialog>
    )
}
