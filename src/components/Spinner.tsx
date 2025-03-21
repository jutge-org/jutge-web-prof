import { LoaderIcon } from 'lucide-react'
import { useEffect, useState } from 'react'

type Props = {
    size?: number
}

export default function Spinner({ size = 64 }: Props) {
    const [show, setShow] = useState(false)

    useEffect(() => {
        const timeout = setTimeout(() => setShow(true), 500)
        return () => clearTimeout(timeout)
    }, [])

    if (!show) return null

    return (
        <div className="mt-24 flex flex-row justify-center gap-2">
            <LoaderIcon className="animate-spin" size={size} />
        </div>
    )
}
