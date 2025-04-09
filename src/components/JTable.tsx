'use client'

import { cn } from '@/lib/utils'
import 'highlight.js/styles/default.css'
import { JSX } from 'react'

export type JTableRow = {
    label: string
    value: string | JSX.Element | null
}

export type JTableRows = JTableRow[]

export type JTableProps = {
    infos: JTableRows
}

export function JTable({ infos }: JTableProps) {
    console.log('JTable', infos)
    return (
        <div className={cn('w-full border rounded-lg p-4')}>
            <div className={cn('w-full flex flex-row justify-center')}>
                <div className="w-full md:w-5/6 space-y-1">
                    {infos.map((info, index) => (
                        <div
                            key={index}
                            className="w-full flex flex-col sm:flex-row gap-2 sm:gap-4"
                        >
                            <div className="font-bold sm:w-[30ex] sm:text-right">{info.label}</div>
                            <div className="w-full">{info.value}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
