import { DependencyList, useEffect, useState } from 'react'

export function useDynamic(init: any, deps: DependencyList) {
    const [value, setValue] = useState(init)

    useEffect(() => {
        setValue(init)
    }, deps)

    return [value, setValue]
}
