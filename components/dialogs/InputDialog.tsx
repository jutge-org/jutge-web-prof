'use client'

import { SendIcon } from 'lucide-react'
import { JSX, useState } from 'react'
import { Button } from '../ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog'
import { Input } from '../ui/input'

export type InputDialogConfig = {
    title: string
    description: string
    buttonIcon: any
    buttonLabel: string
}

export type InputDialogResult = string | null

export const useInputDialog = (
    config: InputDialogConfig,
): [(defaultValue: string) => Promise<InputDialogResult>, () => JSX.Element] => {
    //

    const [promise, setPromise] = useState<{ resolve: (result: InputDialogResult) => void } | null>(
        null,
    )
    const [open, setOpen] = useState(false)
    const [initialValue, setInitialValue] = useState('')

    function runInputDialog(defaultValue: string): Promise<InputDialogResult> {
        setInitialValue(defaultValue)
        setOpen(true)
        return new Promise((resolve, reject) => {
            setPromise({ resolve })
        })
    }

    function InputDialogComponent() {
        const [value, setValue] = useState(initialValue)

        function close() {
            setPromise(null)
            setOpen(false)
        }

        function acceptAction() {
            promise?.resolve(value)
            close()
        }

        function cancelAction() {
            promise?.resolve(null)
            close()
        }

        return (
            <>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogContent onCloseAutoFocus={cancelAction}>
                        <DialogHeader>
                            <DialogTitle>{config.title}</DialogTitle>
                            <DialogDescription>{config.description}</DialogDescription>
                        </DialogHeader>
                        <Input value={value} onChange={(e) => setValue(e.target.value)} />
                        <Button onClick={acceptAction}>
                            {config.buttonIcon} {config.buttonLabel}
                        </Button>
                    </DialogContent>
                </Dialog>
            </>
        )
    }

    return [runInputDialog, InputDialogComponent]
}

export function InputDialogDemo() {
    //

    const [runInputDialog, InputDialogComponent] = useInputDialog({
        title: 'Title',
        description: 'Description',
        buttonIcon: <SendIcon />,
        buttonLabel: 'Label',
    })

    async function click() {
        const answer = await runInputDialog('foo')
        console.log('Answer:', answer)
    }

    return (
        <>
            <Button onClick={() => click()}>Click me!</Button>
            <InputDialogComponent />
        </>
    )
}
