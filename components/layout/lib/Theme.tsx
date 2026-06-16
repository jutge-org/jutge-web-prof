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

type ResolvedMode = 'light' | 'dark'

function getSystemDark() {
    return (
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-color-scheme: dark)').matches
    )
}

const initialState = {
    mode: defaultMode,
    resolvedMode: 'light' as ResolvedMode,
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

    const [systemDark, setSystemDark] = useState(getSystemDark)

    const [palette, setPalette] = useState(defaultPalette)

    const resolvedMode: ResolvedMode =
        mode === 'dark' ? 'dark' : mode === 'light' ? 'light' : systemDark ? 'dark' : 'light'

    useEffect(() => {
        const storedMode = localStorage.getItem('theme-mode')
        const storedPalette = localStorage.getItem('theme-palette')
        setMode(storedMode || defaultMode)
        setPalette(storedPalette || defaultPalette)
    }, [])

    useEffect(() => {
        const mq = window.matchMedia('(prefers-color-scheme: dark)')
        const update = () => setSystemDark(mq.matches)
        update()
        mq.addEventListener('change', update)
        return () => mq.removeEventListener('change', update)
    }, [])

    useEffect(() => {
        const root = window.document.documentElement
        root.classList.remove('light', 'dark')
        root.classList.add(resolvedMode)
    }, [resolvedMode])

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
        resolvedMode,
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
