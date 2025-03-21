// això està trencat

'use client'

import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandShortcut,
} from '@/components/ui/command'
import { mapmap } from '@/lib/utils'
import { useCommandK } from '@/providers/CommandK'
import { MenuItem, menus } from '@/providers/Menu'
import { Description, DialogTitle } from '@radix-ui/react-dialog'
import { redirect } from 'next/navigation'
import { useEffect } from 'react'

export function CommandKDialog() {
    //

    const commandK = useCommandK()
    const menu = menus.user

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
            <CommandInput placeholder="Type a command or search by key..." />
            <CommandList className="h-96">
                <CommandEmpty>No results found.</CommandEmpty>
                <CommandGroup heading="Suggestions">
                    {mapmap(menu, (key, item) => (
                        <CommandItem key={key} onSelect={() => select(item)}>
                            {item.icon}
                            {item.name}
                            {item.shortcut && <CommandShortcut>{item.shortcut}</CommandShortcut>}
                        </CommandItem>
                    ))}
                </CommandGroup>
            </CommandList>
        </CommandDialog>
    )
}
