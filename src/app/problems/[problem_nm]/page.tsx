'use client'

import { JForm, JFormFields } from '@/components/JForm'
import Page from '@/components/Page'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import SimpleSpinner from '@/jutge-components/spinners/SimpleSpinner'
import jutge from '@/lib/jutge'
import { AbstractProblem } from '@/lib/jutge_api_client'
import { mapmap, offerDownloadFile } from '@/lib/utils'
import dayjs from 'dayjs'
import LocalizedFormat from 'dayjs/plugin/localizedFormat'
import {
    CloudDownloadIcon,
    CloudUploadIcon,
    LockIcon,
    SaveIcon,
    Share2Icon,
    SkullIcon,
} from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import validator from 'validator'

dayjs.extend(LocalizedFormat)

export default function ProblemPropertiesPage() {
    const { problem_nm } = useParams<{ problem_nm: string }>()
    return (
        <Page
            pageContext={{
                title: `Problem ${problem_nm}`,
                menu: 'user',
                current: 'problems',
                subTitle: `Problems ❯ ${problem_nm}`,
                subMenu: 'problems',
            }}
        >
            <ProblemPropertiesView />
        </Page>
    )
}

type ProblemInfo = {
    abstractProblem: AbstractProblem
    setAbstractProblem: (problem: AbstractProblem) => void

    passcode: string | null
    setPasscode: (passcode: string) => void
}

function ProblemPropertiesView() {
    const { problem_nm } = useParams<{ problem_nm: string }>()
    const [abstractProblem, setAbstractProblem] = useState<AbstractProblem | null>(null)
    const [passcode, setPasscode] = useState<string | null>(null)

    useEffect(() => {
        async function fetchProblemInfo() {
            const abstractProblem = await jutge.problems.getAbstractProblem(problem_nm)
            setAbstractProblem(abstractProblem)

            const passcode = await jutge.instructor.problems.getPasscode(problem_nm)
            setPasscode(passcode)
        }

        fetchProblemInfo()
    }, [problem_nm])

    if (abstractProblem === null) return <SimpleSpinner />

    return (
        <EditProblemForm
            info={{
                abstractProblem,
                setAbstractProblem,
                passcode,
                setPasscode,
            }}
        />
    )
}

interface ProblemFormProps {
    info: ProblemInfo
}

function EditProblemForm({ info }: ProblemFormProps) {
    //

    const [problem_nm, setProblem_nm] = useState(info.abstractProblem.problem_nm)
    const [isShareDialogOpen, setIsShareDialogOpen] = useState(false)
    const [isDeprecationDialogOpen, setIsDeprecationDialogOpen] = useState(false)
    const [isPasscodeDialogOpen, setIsPasscodeDialogOpen] = useState(false)

    const fields: JFormFields = {
        problem_nm: {
            type: 'input',
            label: 'Id',
            value: info.abstractProblem.problem_nm,
        },
        passcode: {
            type: 'password',
            label: 'Passcode',
            value: info.passcode,
        },
        deprecation: {
            type: 'input',
            label: 'Deprecation reason',
            value: info.abstractProblem.deprecation || '',
        },
        translations: {
            type: 'free',
            label: 'Translations',
            content: (
                <div className="text-sm border rounded-lg">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableCell className="font-bold">Problem</TableCell>
                                <TableCell className="font-bold">Title</TableCell>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {mapmap(info.abstractProblem.problems, (problem_id, problem) => (
                                <TableRow key={problem_id}>
                                    <TableCell>
                                        <Link href={`/problems/${problem_nm}/${problem_id}`}>
                                            {problem_id}
                                        </Link>
                                    </TableCell>
                                    <TableCell>{problem.title}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            ),
        },
        author: {
            type: 'input',
            label: 'Author',
            value: info.abstractProblem.author || '',
        },
        email: {
            type: 'input',
            label: 'Author email',
            value: info.abstractProblem.author_email || '',
        },
        created_at: {
            type: 'input',
            label: 'Creation',
            value: dayjs(info.abstractProblem.created_at).format('YYYY-MM-DD HH:mm:ss'),
        },
        type: {
            type: 'free',
            label: 'Type',
            content: (
                <Badge className="mt-1 py-1 px-2" variant="secondary">
                    {info.abstractProblem.type}
                </Badge>
            ),
        },
        driver: {
            type: 'free',
            label: 'Driver',
            content: (
                <Badge className="mt-2 py-1 px-2" variant="secondary">
                    {info.abstractProblem.driver_id}
                </Badge>
            ),
        },
        oldArchive: {
            type: 'free',
            label: 'Download problem',
            content: (
                <Button
                    variant="outline"
                    className="mt-0 h-16 w-16 [&_svg]:size-12"
                    onClick={downloadAction}
                    title="Download problem archive as a ZIP file"
                >
                    <CloudDownloadIcon strokeWidth={0.8} />
                </Button>
            ),
        },
        sep: {
            type: 'separator',
        },
        actions: {
            type: 'free',
            label: '',
            content: (
                <div className="mt-2 flex flex-col gap-2">
                    <Button
                        className="w-40 justify-start"
                        onClick={() => setIsDeprecationDialogOpen(true)}
                    >
                        <SkullIcon />
                        Set deprecation
                    </Button>
                    <Button
                        className="w-40 justify-start"
                        onClick={() => setIsPasscodeDialogOpen(true)}
                    >
                        <LockIcon /> Set passcode
                    </Button>
                    {info.passcode && (
                        <Button
                            className="w-40 justify-start"
                            onClick={() => setIsShareDialogOpen(true)}
                        >
                            <Share2Icon /> Share passcode
                        </Button>
                    )}
                    <Link href={`/problems/${problem_nm}/update`}>
                        <Button className="w-40 justify-start">
                            <CloudUploadIcon /> Update problem
                        </Button>
                    </Link>
                </div>
            ),
        },
    }

    // TODO: caldria tenir un visible als forms

    if (!info.abstractProblem.deprecation) delete fields.deprecation
    if (!info.passcode) delete fields.passcode
    if (!info.abstractProblem.author) delete fields.author
    if (!info.abstractProblem.author_email) delete fields.email

    async function downloadAction() {
        const download = await jutge.instructor.problems.download(problem_nm)
        offerDownloadFile(download, download.name)
    }

    async function updateAction() {
        toast.info('Nothing done.')
    }

    async function deprecateCallback(reason: string) {
        if (reason === '') {
            if (!info.abstractProblem.deprecation) return
            await jutge.instructor.problems.undeprecate(problem_nm)
            toast.success('Problem undeprecated.')
        } else {
            await jutge.instructor.problems.deprecate({ problem_nm, reason })
            if (!info.abstractProblem.deprecation) toast.success('Problem deprecated.')
            else toast.success('Deprecation reason updated.')
        }
        info.setAbstractProblem(await jutge.problems.getAbstractProblem(problem_nm))
    }

    async function passcodeCallback(newPasscode: string) {
        if (newPasscode === '') {
            if (!info.passcode) return
            await jutge.instructor.problems.removePasscode(problem_nm)
            toast.success('Passcode removed.')
        } else {
            await jutge.instructor.problems.setPasscode({ problem_nm, passcode: newPasscode })
            if (!info.passcode) toast.success('Passcode set.')
            else toast.success('Passcode updated.')
        }
        info.setPasscode(newPasscode)
    }

    async function shareCallback(emails: string[], wrongEmails: string[]) {
        if (wrongEmails.length > 0) {
            toast.warning(`Ignoring ${wrongEmails.length} invalid emails.`)
        }
        if (emails.length == 0) {
            toast.error('No valid emails to share the passcode with.')
            return
        }
        await jutge.instructor.problems.sharePasscode({ problem_nm, emails })
        toast.success('Passcode shared.')
    }

    return (
        <div className="flex flex-col gap-4">
            <JForm fields={fields} />

            <DialogToShareProblem
                isOpen={isShareDialogOpen}
                setIsOpen={setIsShareDialogOpen}
                onAccept={shareCallback}
            />
            <DeprecationDialog
                isOpen={isDeprecationDialogOpen}
                setIsOpen={setIsDeprecationDialogOpen}
                problem_nm={problem_nm}
                deprecation={info.abstractProblem.deprecation || ''}
                onAccept={deprecateCallback}
            />
            <PasscodeDialog
                isOpen={isPasscodeDialogOpen}
                setIsOpen={setIsPasscodeDialogOpen}
                problem_nm={problem_nm}
                passcode={info.passcode || ''}
                onAccept={passcodeCallback}
            />
        </div>
    )
}

function DeprecationDialog({
    isOpen,
    setIsOpen,
    problem_nm,
    deprecation,
    onAccept,
}: {
    isOpen: boolean
    setIsOpen: (open: boolean) => void
    problem_nm: string
    deprecation: string
    onAccept: (value: string) => Promise<void>
}) {
    const [content, setContent] = useState<string>(deprecation)
    const [isDeprecated, setIsDeprecated] = useState(false)

    useEffect(() => {
        setContent(deprecation)
        setIsDeprecated(deprecation !== '')
    }, [isOpen, deprecation])

    async function acceptAction() {
        if (isDeprecated && content === '') {
            toast.error('You must provide a deprecation reason.')
            return
        }
        setIsOpen(false)
        onAccept(isDeprecated ? content : '')
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Set deprecation for problem {problem_nm}</DialogTitle>
                    <DialogDescription className="flex flex-col gap-4">
                        <div className="flex gap-2 items-center">
                            <Switch checked={isDeprecated} onCheckedChange={setIsDeprecated} />
                            <Label>Problem {isDeprecated ? '' : 'not'} deprecated</Label>
                        </div>
                        <Input
                            className="w-full mb-2"
                            placeholder="Deprecation reason"
                            value={content}
                            onChange={(e: any) => setContent(e.target.value.trim())}
                            disabled={!isDeprecated}
                        />
                        <Button onClick={acceptAction}>
                            <SaveIcon />
                            Set deprecation
                        </Button>
                    </DialogDescription>
                </DialogHeader>
            </DialogContent>
        </Dialog>
    )
}

function PasscodeDialog({
    isOpen,
    setIsOpen,
    problem_nm,
    passcode,
    onAccept,
}: {
    isOpen: boolean
    setIsOpen: (open: boolean) => void
    problem_nm: string
    passcode: string
    onAccept: (value: string) => Promise<void>
}) {
    const [content, setContent] = useState<string>(passcode)
    const [hasPasscode, setHasPasscode] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        setContent(passcode)
        setHasPasscode(passcode !== '')
    }, [isOpen, passcode])

    async function acceptAction() {
        if (hasPasscode && content === '') {
            toast.error('You must provide a passcode.')
            return
        }
        if (hasPasscode && error) {
            toast.error(error)
            return
        }
        setIsOpen(false)
        onAccept(hasPasscode ? content : '')
    }

    function onChangePasscode(newPasscode: string) {
        const passcodeRegex = /^[a-zA-Z0-9]{8,}$/
        if (!passcodeRegex.test(newPasscode)) {
            setError(
                'Passcode must be at least 8 characters long and contain only letters and digits.',
            )
        } else {
            setError(null)
        }
        setContent(newPasscode)
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Set passcode for problem {problem_nm}</DialogTitle>
                    <DialogDescription className="flex flex-col gap-0">
                        <div className="flex gap-2 items-center">
                            <Switch checked={hasPasscode} onCheckedChange={setHasPasscode} />
                            <Label>Problem has {hasPasscode ? '' : 'no'} passcode</Label>
                        </div>
                        <Input
                            className="w-full mt-4"
                            placeholder="Passcode"
                            value={content}
                            onChange={(e: any) => onChangePasscode(e.target.value.trim())}
                            disabled={!hasPasscode}
                        />
                        {error && hasPasscode ? (
                            <div className="text-red-500 text-xs mt-2">{error}</div>
                        ) : (
                            <div className="text-red-500 text-xs mt-2">&nbsp;</div>
                        )}
                        <Button onClick={acceptAction} className="mt-4">
                            <SaveIcon />
                            {hasPasscode ? 'Update passcode' : 'Remove passcode'}
                        </Button>
                    </DialogDescription>
                </DialogHeader>
            </DialogContent>
        </Dialog>
    )
}

function DialogToShareProblem({
    isOpen,
    setIsOpen,
    onAccept,
}: {
    isOpen: boolean
    setIsOpen: (open: boolean) => void
    onAccept: (emails: string[], wrongEmails: string[]) => Promise<void>
}) {
    const [content, setContent] = useState<string>('')

    useEffect(() => {
        setContent('')
    }, [isOpen])

    async function addCallback() {
        const lines = content
            .split('\n')
            .map((line) => line.trim())
            .filter((line) => line !== '')
        const emails = Array.from(new Set(lines.filter((line) => validator.isEmail(line))))
        const wrongsEmails = Array.from(new Set(lines.filter((line) => !validator.isEmail(line))))
        setIsOpen(false)
        onAccept(emails, wrongsEmails)
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Share problem passcode</DialogTitle>
                    <DialogDescription className="flex flex-col gap-4">
                        <p>
                            You can directly share the passcode of this problem with other users by
                            adding their emails here (one per line). No emails will be sent, just
                            the passcode will be shared. Emails not registered in the system will be
                            ignored.
                        </p>
                        <Textarea
                            className="w-full h-48"
                            placeholder={`Enter each email on a line`}
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                        />
                        <Button onClick={addCallback}>
                            <Share2Icon />
                            Share passcode
                        </Button>
                    </DialogDescription>
                </DialogHeader>
            </DialogContent>
        </Dialog>
    )
}

function badgyify(list: string[]) {
    if (list.length == 0) return '—'
    return (
        <div className="flex flex-row flex-wrap gap-2">
            {list.map((item, index) => (
                <Badge key={index} className="font-normal py-1 px-2" variant="secondary">
                    {item}
                </Badge>
            ))}
        </div>
    )
}
