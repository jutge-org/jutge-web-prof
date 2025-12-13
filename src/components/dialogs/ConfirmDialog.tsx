'use client'

import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { BanIcon, CircleCheckBigIcon } from 'lucide-react'
import { JSX, useState } from 'react'

export type ConfirmDialogConfig = {
    title: string
    acceptIcon?: any
    acceptLabel?: string
    cancelIcon?: any
    cancelLabel?: string
}

export type ConfirmDialogResult = boolean

export const useConfirmDialog = (
    config: ConfirmDialogConfig,
): [(message: string) => Promise<ConfirmDialogResult>, () => JSX.Element] => {
    //

    const [promise, setPromise] = useState<{
        resolve: (result: ConfirmDialogResult) => void
    } | null>(null)
    const [open, setOpen] = useState(false)
    const [message, setMessage] = useState('')

    function runConfirmDialog(message: string): Promise<ConfirmDialogResult> {
        setMessage(message)
        setOpen(true)
        return new Promise((resolve, reject) => {
            setPromise({ resolve })
        })
    }

    function ConfirmDialogComponent() {
        function close() {
            promise?.resolve(false)
            setOpen(false)
        }

        function acceptAction() {
            promise?.resolve(true)
            close()
        }

        function cancelAction() {
            promise?.resolve(false)
            close()
        }

        const cancelIcon = config.cancelIcon || <BanIcon />
        const acceptIcon = config.acceptIcon || <CircleCheckBigIcon />

        return (
            <>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogContent onCloseAutoFocus={cancelAction}>
                        <DialogHeader>
                            <DialogTitle>{config.title}</DialogTitle>
                            <DialogDescription>{message}</DialogDescription>
                        </DialogHeader>
                        <div className="w-full flex flex-row gap-2 pt-4">
                            <Button className="w-full" variant="outline" onClick={cancelAction}>
                                {cancelIcon}
                                {config.cancelLabel || 'Cancel'}
                            </Button>
                            <Button className="w-full" onClick={acceptAction}>
                                {acceptIcon}
                                {config.acceptLabel || 'Accept'}
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </>
        )
    }

    return [runConfirmDialog, ConfirmDialogComponent]
}

export function ConfirmDialogDemo() {
    //

    const [runConfirmDialog, ConfirmDialogComponent] = useConfirmDialog({
        title: 'Title',
    })

    async function click() {
        const confirmation = await runConfirmDialog('Message')
        console.log('confirmation:', confirmation)
    }

    return (
        <div className="p-4">
            <Button onClick={() => click()}>Click me!</Button>
            <ConfirmDialogComponent />
        </div>
    )
}
