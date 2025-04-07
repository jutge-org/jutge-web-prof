'use client'

import { cn } from '@/lib/utils'
import 'highlight.js/styles/stackoverflow-light.css'
import Highlight from 'react-highlight'

type CodeProps = {
    code: string
    language: string
}

export function Code(props: CodeProps) {
    return <Highlight className={cn(props.language, 'text-sm rounded-lg')}>{props.code}</Highlight>
}
