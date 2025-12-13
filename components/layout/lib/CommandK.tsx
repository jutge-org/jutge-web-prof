'use client'

import { createContext, ReactNode, useContext, useState } from 'react'

export interface CommandKProps {
    open: boolean
    setOpen: (open: boolean) => void
}

const CommandKContext = createContext<CommandKProps>({
    open: false,
    setOpen: (open: boolean) => {},
})

export default function CommandKProvider({ children }: { children: ReactNode }) {
    const [open, setOpen] = useState(false)

    return (
        <CommandKContext.Provider
            value={{
                open,
                setOpen,
            }}
        >
            {children}
        </CommandKContext.Provider>
    )
}

export const useCommandK = () => {
    return useContext(CommandKContext)
}
