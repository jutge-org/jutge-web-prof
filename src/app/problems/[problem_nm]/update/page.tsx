'use client'

import { JForm, JFormFields } from '@/components/JForm'
import Page from '@/components/Page'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import jutge from '@/lib/jutge'
import { showError } from '@/lib/utils'
import { CloudDownloadIcon, LoaderIcon } from 'lucide-react'
import Link from 'next/link'
import { redirect, useParams } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'

export default function ProblemsNewPage() {
    return (
        <Page
            pageContext={{
                title: 'Update problem',
                menu: 'user',
                current: 'problems',
                subTitle: 'Update problem',
            }}
        >
            <ProblemsUpdateView />
        </Page>
    )
}

function ProblemsUpdateView() {
    //

    const { problem_nm: problemNm } = useParams<{ problem_nm: string }>()
    const [isWaitDialogOopen, setIsWaitDialogOpen] = useState(false)
    const [updateFinished, setUpdateFinished] = useState(false)

    const [file, setFile] = useState<File | null>(null)

    const fields: JFormFields = {
        title: {
            type: 'free',
            label: '',
            content: (
                <div className="text-sm space-y-2 border rounded-lg p-4 mb-8">
                    <p>Update a problem by uploading a ZIP archive with its content.</p>
                    <p>TODO: add feedback.</p>
                </div>
            ),
        },
        id: {
            type: 'input',
            label: 'Problem',
            value: problemNm,
        },
        file: {
            type: 'file',
            label: 'ZIP archive',
            value: file,
            setValue: setFile,
            accept: ['application/zip'],
            //validator: z.number().min(1).max(1),
        },
        sep: { type: 'separator' },
        add: {
            type: 'button',
            text: 'Update problem',
            icon: <CloudDownloadIcon />,
            action: updateAction,
        },
    }

    async function updateAction() {
        if (!file) {
            toast.error('Please select a ZIP archive.')
            return
        }

        try {
            setIsWaitDialogOpen(true)
            setUpdateFinished(false)
            await jutge.instructor.problems.legacyUpdate(problemNm, file)
            setUpdateFinished(true)
            toast.success(`Problem '${problemNm}' updated.`)
            console.log(`Problem '${problemNm}' updated.`)
        } catch (error) {
            return showError(error)
        }
        redirect(`/problems/${problemNm}`)
    }

    return (
        <>
            <JForm fields={fields} />
            <WaitDialog
                isOpen={isWaitDialogOopen}
                setIsOpen={setIsWaitDialogOpen}
                problemNm={problemNm}
                updateFinished={updateFinished}
                setUpdateFinished={setUpdateFinished}
            />
        </>
    )
}

function WaitDialog({
    isOpen,
    setIsOpen,
    problemNm,
    updateFinished,
    setUpdateFinished,
}: {
    isOpen: boolean
    setIsOpen: (b: boolean) => void
    problemNm: string
    updateFinished?: boolean
    setUpdateFinished?: (b: boolean) => void
}) {
    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        {updateFinished ? 'Problem updated' : 'Updating problem...'}
                    </DialogTitle>
                </DialogHeader>
                <div className="h-64 flex flex-col justify-center items-center gap-8">
                    {updateFinished ? (
                        <>
                            <p>Problem updated successfully.</p>
                            <Link href={`/problems/${problemNm}`}>
                                <Button className="w-96">{problemNm}</Button>
                            </Link>
                        </>
                    ) : (
                        <>
                            <LoaderIcon className="animate-spin" size={96} />
                            <p>Please wait until the problem is updated, it takes some time.</p>
                            <p>Do not close this window.</p>
                        </>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
