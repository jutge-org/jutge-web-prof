'use client'

import { JForm, JFormFields } from '@/components/JForm'
import Page from '@/components/Page'
import Spinner from '@/components/Spinner'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import jutge from '@/lib/jutge'
import { InstructorExam } from '@/lib/jutge_api_client'
import { CloudDownloadIcon, DownloadCloudIcon, LoaderIcon } from 'lucide-react'
import { redirect, useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

export default function ExamSubmissionsPage() {
    const { exam_nm } = useParams<{ exam_nm: string }>()
    return (
        <Page
            pageContext={{
                title: `Exam ${exam_nm}`,
                menu: 'user',
                current: 'exams',
                subTitle: `Exams ❯ ${exam_nm}`,
                subMenu: 'exams',
                subCurrent: 'submissions',
            }}
        >
            <ExamSubmissionsView />
        </Page>
    )
}

function ExamSubmissionsView() {
    const { exam_nm } = useParams<{ exam_nm: string }>()
    const [exam, setExam] = useState<InstructorExam | null>(null)
    const [archived, setArchived] = useState(false)

    useEffect(() => {
        async function fetchExam() {
            const exam = await jutge.instructor.exams.get(exam_nm)
            setExam(exam)
            const archived = (await jutge.instructor.exams.getArchived()).includes(exam_nm)
            setArchived(archived)
        }

        fetchExam()
    }, [exam_nm])

    if (exam === null) return <Spinner />

    return <EditExamForm exam={exam} />
}

interface ExamFormProps {
    exam: InstructorExam
}

function EditExamForm(props: ExamFormProps) {
    const [isWaitDialogOpen, setIsWaitDialogOpen] = useState(false)
    const [href, setHref] = useState('')
    const [ready, setReady] = useState(false)

    const problems = props.exam.problems.map((p) => ({ label: p.problem_nm, value: p.problem_nm }))

    const [selectedProblems, setSelectedProblems] = useState(
        props.exam.problems.map((p) => p.problem_nm),
    )
    const [includeSource, setIncludeSource] = useState(true)
    const [includePDF, setIncludePDF] = useState(false)
    const [includeMetadata, setIncludeMetadata] = useState(false)
    const [onlyLast, setOnlyLast] = useState('1')

    useEffect(() => {
        if (!isWaitDialogOpen) return

        const interval = setInterval(async () => {
            if (href.length > 0) {
                console.log('checking if download is ready')
                const response = await fetch(href)
                if (response.ok) {
                    setReady(true)
                    clearInterval(interval)
                }
            }
        }, 1000)

        return () => clearInterval(interval)
    }, [href, isWaitDialogOpen])

    const fields: JFormFields = {
        id: {
            type: 'input',
            label: 'Id',
            value: props.exam.exam_nm,
        },
        title: {
            type: 'input',
            label: 'Title',
            value: props.exam.title,
        },
        selectedProblems: {
            type: 'multiSelect',
            label: 'Problems',
            value: selectedProblems,
            setValue: setSelectedProblems,
            options: problems,
        },
        includeSource: {
            type: 'switch',
            label: 'Source code',
            value: includeSource,
            setValue: setIncludeSource,
        },
        includePDF: {
            type: 'switch',
            label: 'PDF',
            value: includePDF,
            setValue: setIncludePDF,
        },
        includeMetadata: {
            type: 'switch',
            label: 'Metadata',
            value: includeMetadata,
            setValue: setIncludeMetadata,
        },
        onlyLast: {
            type: 'radio',
            label: 'Submissions',
            value: '1',
            options: [
                { label: 'Only last submission of each problem', value: '1' },
                { label: 'All', value: '2' },
            ],
            setValue: setOnlyLast,
        },

        sep: { type: 'separator' },

        update: {
            type: 'button',
            text: 'Download',
            icon: <CloudDownloadIcon />,
            action: downloadAction,
        },
    }

    async function downloadAction() {
        const options = {
            include_source: includeSource,
            include_pdf: includePDF,
            include_metadata: includeMetadata,
            only_last: onlyLast === '1',
            problems: selectedProblems.join(','),
        }
        const webstream = await jutge.instructor.exams.getSubmissions({
            exam_nm: props.exam.exam_nm,
            options: options,
        })
        redirect(`/exams/${props.exam.exam_nm}/submissions/${webstream.id}`)
    }
    return (
        <>
            <JForm fields={fields} />
            <WaitDialog
                isOpen={isWaitDialogOpen}
                setIsOpen={setIsWaitDialogOpen}
                href={href}
                setHref={setHref}
                ready={ready}
                setReady={setReady}
            />
        </>
    )
}

function WaitDialog({
    isOpen,
    setIsOpen,
    href,
    setHref,
    ready,
    setReady,
}: {
    isOpen: boolean
    setIsOpen: (b: boolean) => void
    href: string
    setHref: (s: string) => void
    ready: boolean
    setReady: (b: boolean) => void
}) {
    const { exam_nm } = useParams<{ exam_nm: string }>()

    function download() {
        window.open(href)
        toast.success('Download started')
        redirect(`/exams/${exam_nm}/properties`)
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent
                className="[&>button]:hidden"
                onInteractOutside={(e) => {
                    // disable closing the dialog by clicking outside
                    e.preventDefault()
                }}
            >
                <DialogHeader>
                    <DialogTitle>
                        {ready ? 'Submissions ready' : 'Preparing submissions...'}
                    </DialogTitle>
                </DialogHeader>
                <div className="h-72 w-full flex flex-col justify-end gap-8">
                    {ready ? (
                        <>
                            <p>Your download with the exam submissions is ready.</p>

                            <div className="flex flex-row justify-center mb-4">
                                <Button
                                    variant="outline"
                                    className="h-16 w-16 [&_svg]:size-12"
                                    onClick={() => download()}
                                >
                                    <DownloadCloudIcon strokeWidth={0.6} />
                                </Button>
                            </div>

                            <Button className="w-full" onClick={() => download()}>
                                <DownloadCloudIcon />
                                Download submissions
                            </Button>
                        </>
                    ) : (
                        <>
                            <p>
                                Please wait until the download with the exam submissions are ready,
                                it takes some time.
                            </p>
                            <div className="flex flex-row justify-center mb-4">
                                <LoaderIcon className="animate-spin" size={96} />
                            </div>
                            <p className="flex flex-row justify-center mb-4 border rounded-lg p-4">
                                Do not close this window.
                            </p>
                        </>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
