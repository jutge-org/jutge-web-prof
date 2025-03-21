'use client'

import { JForm, JFormFields } from '@/components/JForm'
import Page from '@/components/Page'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import jutge from '@/lib/jutge'
import { showError } from '@/lib/utils'
import { LoaderIcon, PlusCircleIcon } from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'
import { z } from 'zod'

export default function ProblemsNewPage() {
    return (
        <Page
            pageContext={{
                title: 'Add problem',
                menu: 'user',
                current: 'problems',
                subTitle: 'Add problem',
            }}
        >
            <ProblemsNewView />
        </Page>
    )
}

function ProblemsNewView() {
    //

    const [isWaitDialogOopen, setIsWaitDialogOpen] = useState(false)
    const [problemNm, setProblemNm] = useState('')

    const [file, setFile] = useState<File | null>(null)
    const [passcode, setPasscode] = useState<string>(Math.random().toString(36).substring(2, 12))

    const fields: JFormFields = {
        title: {
            type: 'free',
            label: '',
            content: (
                <div className="text-sm space-y-2 border rounded-lg p-4 mb-8">
                    <p>Create a new problem by uploading a ZIP archive with its content.</p>
                    <p>Passcode is mandatory to create a new problem, you can remove it latter.</p>
                    <p>TODO: add some link to the problemation.</p>
                    <p>TODO: add feedback.</p>
                </div>
            ),
        },
        file: {
            type: 'file',
            label: 'ZIP archive',
            value: file,
            setValue: setFile,
            accept: ['application/zip'],
            //validator: z.number().min(1).max(1),
        },
        passcode: {
            type: 'password',
            label: 'Passcode',
            value: passcode,
            setValue: setPasscode,
            validator: z
                .string()
                .min(8)
                .max(100)
                .refine(
                    (value) => /^[a-zA-Z0-9]+$/.test(value),
                    'String should contain only alphanumeric characters',
                ),
        },
        sep: { type: 'separator' },
        add: {
            type: 'button',
            text: 'Add problem',
            icon: <PlusCircleIcon />,
            action: addAction,
        },
    }

    async function addAction() {
        if (!file) {
            toast.error('Please select a ZIP archive.')
            return
        }

        try {
            setIsWaitDialogOpen(true)
            const problem_nm = await jutge.instructor.problems.legacyCreate(passcode, file)
            toast.success(`Problem '${problem_nm}' added.`)
            console.log(`Problem '${problem_nm}' added.`)
            setProblemNm(problem_nm)
            await new Promise((resolve) => setTimeout(resolve, 100)) // wait for the dialog to close and then redirect
            redirect(`/problems/${problem_nm}`)
        } catch (error) {
            return showError(error)
        }
    }

    return (
        <>
            <JForm fields={fields} />
            <WaitDialog
                isOpen={isWaitDialogOopen}
                setIsOpen={setIsWaitDialogOpen}
                problemNm={problemNm}
                setProblemNm={setProblemNm}
            />
        </>
    )
}

function WaitDialog({
    isOpen,
    setIsOpen,
    problemNm,
    setProblemNm,
}: {
    isOpen: boolean
    setIsOpen: (b: boolean) => void
    problemNm: string
    setProblemNm: (s: string) => void
}) {
    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        {problemNm.length > 0 ? 'Problem added' : 'Adding problem...'}
                    </DialogTitle>
                </DialogHeader>
                <div className="h-64 flex flex-col justify-center items-center gap-8">
                    {problemNm.length > 0 ? (
                        <>
                            <p>Problem added successfully.</p>
                            <Link href={`/problems/${problemNm}`}>
                                <Button className="w-96">{problemNm}</Button>
                            </Link>
                        </>
                    ) : (
                        <>
                            <LoaderIcon className="animate-spin" size={96} />
                            <p>Please wait until the problem is added, it takes some time.</p>
                            <p>Do not close this window.</p>
                        </>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
