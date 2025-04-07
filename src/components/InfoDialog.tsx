'use client'

import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { JSX, useState } from 'react'
import validator from 'validator'
import { Textarea } from './ui/textarea'

type EmailsDialogConfig = {
    title: string
    description: string
    buttonIcon: any
    buttonLabel: string
}

type InfoDialogResult = null | {
    validEmails: string[]
    wrongEmails: string[]
}

export const useInfoDialog = (
    config: EmailsDialogConfig,
): [(defaultEmails: string[]) => Promise<InfoDialogResult>, () => JSX.Element] => {
    //

    const [promise, setPromise] = useState<{
        resolve: (result: InfoDialogResult) => void
    } | null>(null)
    const [open, setOpen] = useState(false)
    const [initialValue, setInitialValue] = useState<string[]>([])

    function runEmailsDialog(defaultEmails: string[]): Promise<InfoDialogResult> {
        setInitialValue(defaultEmails)
        setOpen(true)
        return new Promise((resolve, reject) => {
            setPromise({ resolve })
        })
    }

    function EmailsDialogComponent() {
        //

        const [value, setValue] = useState(initialValue.join('\n'))

        function close() {
            setPromise(null)
            setOpen(false)
            setValue('')
        }

        function acceptAction() {
            const lines = value
                .trim()
                .split('\n')
                .map((line) => line.trim())
                .filter((line) => line.length > 0)
            const validEmails = Array.from(
                new Set(lines.filter((line) => validator.isEmail(line))),
            ).sort()
            const wrongEmails = Array.from(
                new Set(lines.filter((line) => !validator.isEmail(line))),
            ).sort()
            const result = {
                validEmails,
                wrongEmails,
            }

            promise?.resolve(result)
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
                            className="w-full h-48"
                            placeholder={`Enter each email on a line`}
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                        />
                        <Button onClick={acceptAction}>
                            {config.buttonIcon} {config.buttonLabel}
                        </Button>
                    </DialogContent>
                </Dialog>
            </>
        )
    }

    return [runEmailsDialog, EmailsDialogComponent]
}
