'use client'

import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { SendIcon } from 'lucide-react'
import { JSX, useState } from 'react'

export type TextareaDialogConfig = {
    title: string
    description: string
    buttonIcon: any
    buttonLabel: string
}

export type TextareaDialogResult = string | null

export const useTextareaDialog = (
    config: TextareaDialogConfig,
): [(defaultValue: string) => Promise<TextareaDialogResult>, () => JSX.Element] => {
    //

    const [promise, setPromise] = useState<{
        resolve: (result: TextareaDialogResult) => void
    } | null>(null)
    const [open, setOpen] = useState(false)
    const [initialValue, setInitialValue] = useState('')

    function runTextareaDialog(defaultValue: string): Promise<TextareaDialogResult> {
        setInitialValue(defaultValue)
        setOpen(true)
        return new Promise((resolve, reject) => {
            setPromise({ resolve })
        })
    }

    function TextareaDialogComponent() {
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
                        <Textarea
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                            className="h-32"
                        />
                        <Button onClick={acceptAction}>
                            {config.buttonIcon} {config.buttonLabel}
                        </Button>
                    </DialogContent>
                </Dialog>
            </>
        )
    }

    return [runTextareaDialog, TextareaDialogComponent]
}

export function TextareaDialogDemo() {
    //

    const [runTextareaDialog, TextareaDialogComponent] = useTextareaDialog({
        title: 'Title',
        description: 'Description',
        buttonIcon: <SendIcon />,
        buttonLabel: 'Label',
    })

    async function click() {
        const answer = await runTextareaDialog('foo')
        console.log('Answer:', answer)
    }

    return (
        <>
            <Button onClick={() => click()}>Click me!</Button>
            <TextareaDialogComponent />
        </>
    )
}
