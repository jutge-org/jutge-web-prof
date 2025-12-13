'use client'

import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { CircleCheckBigIcon } from 'lucide-react'
import { JSX, useState } from 'react'

export type OkDialogConfig = {
    title: string
    okIcon?: any
    okLabel?: string
}

export type OkDialogResult = void

export const useOkDialog = (
    config: OkDialogConfig,
): [(message: string) => Promise<OkDialogResult>, () => JSX.Element] => {
    //

    const [promise, setPromise] = useState<{
        resolve: (result: OkDialogResult) => void
    } | null>(null)
    const [open, setOpen] = useState(false)
    const [message, setMessage] = useState('')

    function runOkDialog(message: string): Promise<OkDialogResult> {
        setMessage(message)
        setOpen(true)
        return new Promise((resolve, reject) => {
            setPromise({ resolve })
        })
    }

    function OkDialogComponent() {
        function close() {
            promise?.resolve()
            setOpen(false)
        }

        function acceptAction() {
            close()
        }

        function cancelAction() {
            close()
        }

        const okIcon = config.okIcon || <CircleCheckBigIcon />

        return (
            <>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogContent onCloseAutoFocus={cancelAction}>
                        <DialogHeader>
                            <DialogTitle>{config.title}</DialogTitle>
                            <DialogDescription>{message}</DialogDescription>
                        </DialogHeader>
                        <Button className="w-full" onClick={acceptAction}>
                            {okIcon}
                            {config.okLabel || 'Ok'}
                        </Button>
                    </DialogContent>
                </Dialog>
            </>
        )
    }

    return [runOkDialog, OkDialogComponent]
}

export function OkDialogDemo() {
    //

    const [runOkDialog, OkDialogComponent] = useOkDialog({
        title: 'Title',
    })

    async function click() {
        await runOkDialog('Message')
    }

    return (
        <div className="p-4">
            <Button onClick={() => click()}>Click me!</Button>
            <OkDialogComponent />
        </div>
    )
}
