'use client'

// this module is inspired by https://github.com/ShouryaBatra/shadcn-color-theme-switcher
// but with some modifications

import { createContext, useContext, useEffect, useState } from 'react'

export const availableModes = [
    'system', // as set by the system
    'light', // light
    'dark', // dark
]

export const availablePalettes = [
    'blue',
    'red',
    'rose',
    'orange',
    'green',
    'yellow',
    'violet',
    'zinc',
]

const defaultMode = availableModes[0]

const defaultPalette = availablePalettes[0]

const initialState = {
    mode: defaultMode,
    palette: defaultPalette,
    setMode: (palette: string) => {},
    setPalette: (palette: string) => {},
}

const ThemeProviderContext = createContext(initialState)

interface ThemeProviderProps {
    children: React.ReactNode
}

export function ThemeProvider({ children }: ThemeProviderProps) {
    //

    const [mode, setMode] = useState(defaultMode)

    const [palette, setPalette] = useState(defaultPalette)

    useEffect(() => {
        const storedMode = localStorage.getItem('theme-mode')
        const storedPalette = localStorage.getItem('theme-palette')
        setMode(storedMode || defaultMode)
        setPalette(storedPalette || defaultPalette)
    }, [])

    useEffect(() => {
        const root = window.document.documentElement

        // Set mode classes
        root.classList.remove('light', 'dark')
        if (mode === 'system') {
            const systemMode = window.matchMedia('(prefers-color-scheme: dark)').matches
                ? 'dark'
                : 'light'
            root.classList.add(systemMode)
        } else {
            root.classList.add(mode)
        }
    }, [mode])

    useEffect(() => {
        const root = window.document.documentElement
        root.setAttribute('data-theme', palette)
    }, [palette])

    useEffect(() => {
        localStorage.setItem('theme-mode', mode)
    }, [mode])

    useEffect(() => {
        localStorage.setItem('theme-palette', palette)
    }, [palette])

    const value = {
        mode,
        palette,
        setMode,
        setPalette,
    }

    return <ThemeProviderContext.Provider value={value}>{children}</ThemeProviderContext.Provider>
}

export const useTheme = () => {
    const context = useContext(ThemeProviderContext)

    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider')
    }

    return context
}
