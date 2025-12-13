'use client'

import { cn } from '@/lib/utils'
import { JSX } from 'react'

export type JTableItem = {
    label: string
    value: string | number | JSX.Element | null
}

export type JTableItems = JTableItem[]

export type JTableProps = {
    items: JTableItems
}

export function JTable({ items }: JTableProps) {
    return (
        <div className={cn('w-full sm:border sm:rounded-lg sm:p-4')}>
            <div className={cn('w-full flex flex-row justify-center')}>
                <div className="w-full md:w-5/6 space-y-1">
                    {items.map((item, index) => (
                        <div
                            key={index}
                            className="w-full flex flex-col sm:flex-row gap-2 sm:gap-4"
                        >
                            <div className="font-bold sm:w-[30ex] sm:text-right">{item.label}</div>
                            <div className="w-full">{item.value}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
