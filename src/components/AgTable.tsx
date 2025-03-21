'use client'

import {
    AllCommunityModule,
    colorSchemeDark,
    colorSchemeLight,
    ModuleRegistry,
    themeQuartz,
} from 'ag-grid-community'
import { AgGridReact } from 'ag-grid-react'
import { useTheme } from 'next-themes'

ModuleRegistry.registerModules([AllCommunityModule])

const myThemeLight = themeQuartz.withPart(colorSchemeLight).withParams({
    accentColor: 'gray',
})

const myThemeDark = themeQuartz.withPart(colorSchemeDark).withParams({
    accentColor: 'gray',
    backgroundColor: '#0b0a0b',
})

export function AgTableFull(props: any) {
    const theme = useTheme()

    return (
        <div className="h-[calc(100vh-200px)] w-full">
            <AgGridReact {...props} theme={theme.theme === 'dark' ? myThemeDark : myThemeLight} />
        </div>
    )
}

export function AgTable(props: any) {
    const theme = useTheme()

    return <AgGridReact {...props} theme={theme.theme === 'dark' ? myThemeDark : myThemeLight} />
}
