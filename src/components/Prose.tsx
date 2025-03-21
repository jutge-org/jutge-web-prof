import { ReactNode } from 'react'

export type ProseProps = {
    className?: string
    children?: ReactNode[] | ReactNode
}

export function Prose(props: ProseProps) {
    return <div className={`myprose ${props.className}`}>{props.children}</div>
}
