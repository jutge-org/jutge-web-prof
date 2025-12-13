import { DependencyList, useEffect, useState } from 'react'

export function useDynamic(init: any, deps: DependencyList) {
    const [value, setValue] = useState(init)

    useEffect(
        () => {
            setValue(init)
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        deps,
    )

    return [value, setValue]
}
