'use client'

import {
    AllCommunityModule,
    colorSchemeDark,
    colorSchemeLight,
    ModuleRegistry,
    themeQuartz,
} from 'ag-grid-community'
import { AgGridReact } from 'ag-grid-react'
import { useTheme } from '../layout/lib/Theme'

ModuleRegistry.registerModules([AllCommunityModule])

const myThemeLight = themeQuartz.withPart(colorSchemeLight).withParams({
    fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
    accentColor: 'gray',
})

const myThemeDark = themeQuartz.withPart(colorSchemeDark).withParams({
    fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
    accentColor: 'gray',
    backgroundColor: '#0b0a0b',
})

export function AgTableFull(props: any) {
    const { mode } = useTheme()

    return (
        <div className="h-[calc(100vh-200px)] w-full">
            <AgGridReact
                {...props}
                theme={mode === 'dark' ? myThemeDark : myThemeLight}
                animateRows={false}
                suppressColumnMoveAnimation={true}
            />
        </div>
    )
}

export function AgTable(props: any) {
    const { mode } = useTheme()

    return (
        <AgGridReact
            {...props}
            theme={mode === 'dark' ? myThemeDark : myThemeLight}
            animateRows={false}
            suppressColumnMoveAnimation={true}
        />
    )
}

export function AgTableAutoHeight(props: any) {
    const { mode } = useTheme()

    return (
        <div className="w-full">
            <AgGridReact
                {...props}
                theme={mode === 'dark' ? myThemeDark : myThemeLight}
                domLayout="autoHeight"
                animateRows={false}
                suppressColumnMoveAnimation={true}
            />
        </div>
    )
}
