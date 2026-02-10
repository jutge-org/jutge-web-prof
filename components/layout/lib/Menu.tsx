'use client'

export interface MenuItem {
    name: string | React.ReactElement
    href: string
    icon?: React.ReactElement
    icon2xl?: React.ReactElement
    shortcut?: string
}

export type Menu = Record<string, MenuItem>
