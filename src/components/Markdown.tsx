import DOMPurify from 'dompurify'
import { marked } from 'marked'

export type MarkdownProps = {
    markdown: string
    className?: string
}

export default function Markdown(props: MarkdownProps) {
    const formatted = marked.parse(props.markdown, { async: false, gfm: true })
    const sanitized = DOMPurify.sanitize(formatted)
    return (
        <div
            className={`myprose ${props.className}`}
            dangerouslySetInnerHTML={{ __html: sanitized }}
        />
    )
}
