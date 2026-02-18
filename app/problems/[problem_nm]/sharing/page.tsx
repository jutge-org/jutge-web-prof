'use client'

import { JForm, JFormFields } from '@/components/formatters/JForm'
import Page from '@/components/layout/Page'
import SimpleSpinner from '@/components/SimpleSpinner'
import jutge from '@/lib/jutge'
import { SaveIcon } from 'lucide-react'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { z } from 'zod'

const passcodeRegex = /^[a-zA-Z0-9]{8,}$/
const passcodeSchema = z.string().refine((v) => v.trim() === '' || passcodeRegex.test(v.trim()), {
    message: 'Passcode must be at least 8 characters long and contain only letters and digits.',
})

export default function ProblemSharingPage() {
    const { problem_nm } = useParams<{ problem_nm: string }>()
    return (
        <Page
            pageContext={{
                title: `Problem ${problem_nm}`,
                menu: 'user',
                current: 'problems',
                subTitle: `Problems ❯ ${problem_nm}`,
                subMenu: 'problems',
                subCurrent: 'sharing',
            }}
        >
            <ProblemSharingView />
        </Page>
    )
}

function ProblemSharingView() {
    const { problem_nm } = useParams<{ problem_nm: string }>()
    const [loading, setLoading] = useState(true)
    const [passcode, setPasscode] = useState<string | null>(null)
    const [sharedTestcases, setSharedTestcases] = useState(false)
    const [sharedSolutions, setSharedSolutions] = useState(false)
    const [passcodeInput, setPasscodeInput] = useState('')

    useEffect(() => {
        async function fetchSharing() {
            const settings = await jutge.instructor.problems.getSharingSettings(problem_nm)
            setPasscode(settings.passcode)
            setSharedTestcases(settings.shared_testcases)
            setSharedSolutions(settings.shared_solutions)
            setPasscodeInput(settings.passcode || '')
            setLoading(false)
        }
        fetchSharing()
    }, [problem_nm])

    if (loading) return <SimpleSpinner />

    async function saveSharing() {
        const trimmed = passcodeInput.trim()
        const newPasscode = trimmed === '' ? null : trimmed
        if (newPasscode !== null) {
            const result = passcodeSchema.safeParse(passcodeInput)
            if (!result.success) {
                toast.error(result.error.errors[0]?.message || 'Invalid passcode.')
                return
            }
        }
        try {
            await jutge.instructor.problems.setSharingSettings({
                problem_nm,
                passcode: newPasscode,
                shared_testcases: sharedTestcases,
                shared_solutions: sharedSolutions,
            })
            setPasscode(newPasscode)
            toast.success('Sharing settings saved.')
        } catch (e) {
            toast.error(String(e))
        }
    }

    const fields: JFormFields = {
        title: {
            type: 'free',
            label: '',
            content: (
                <div className="text-sm space-y-2 border rounded-lg p-4 mb-8">
                    <p>Set the sharing settings of problem {problem_nm} with the form below.</p>
                </div>
            ),
        },
        passcodeSection: {
            type: 'input',
            label: 'Passcode',
            value: passcodeInput,
            setValue: setPasscodeInput,
            placeHolder: 'No passcode',
            validator: passcodeSchema,
            help: 'Leave empty for no passcode (problem visible to all). With a passcode, the problem is only visible to users with the correct passcode.',
        },
        sharedTestcases: {
            type: 'switch',
            label: 'Shared testcases',
            value: sharedTestcases,
            setValue: setSharedTestcases,
            help: 'Share testcases with other instructors.',
        },
        sharedSolutions: {
            type: 'switch',
            label: 'Shared solutions',
            value: sharedSolutions,
            setValue: setSharedSolutions,
            help: 'Share solutions with other instructors.',
        },
        sep: { type: 'separator' },
        save: {
            type: 'button',
            text: 'Save',
            icon: <SaveIcon />,
            action: saveSharing,
        },
    }

    return (
        <div className="flex flex-col gap-4">
            <JForm fields={fields} />
        </div>
    )
}
