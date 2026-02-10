'use client'

export interface MenuItem {
    name: string
    href: string
    icon?: React.ReactElement
    icon2xl?: React.ReactElement
    shortcut?: string
}

export type Menu = Record<string, MenuItem>
