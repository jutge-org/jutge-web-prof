'use client'

import { AlertTriangleIcon, SaveIcon, TrashIcon } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { z } from 'zod'
import { JForm, JFormFields } from '@/components/formatters/JForm'
import Page from '@/components/layout/Page'
import SimpleSpinner from '@/components/SimpleSpinner'
import jutge from '@/lib/jutge'
import { AbstractProblem, ProblemStatistics } from '@/lib/jutge_api_client'

const REMOVE_MAX_SUBMISSIONS = 6

export default function ProblemDangerZonePage() {
    const { problem_nm } = useParams<{ problem_nm: string }>()
    return (
        <Page
            pageContext={{
                title: `Problem ${problem_nm}`,
                menu: 'user',
                current: 'problems',
                subTitle: `Problems ❯ ${problem_nm}`,
                subMenu: 'problems',
                subCurrent: 'dangerzone',
            }}
        >
            <ProblemDangerZoneView />
        </Page>
    )
}

function ProblemDangerZoneView() {
    const { problem_nm } = useParams<{ problem_nm: string }>()
    const router = useRouter()
    const [abstractProblem, setAbstractProblem] = useState<AbstractProblem | null>(null)
    const [statistics, setStatistics] = useState<ProblemStatistics | null>(null)
    const [reason, setReason] = useState('')
    const [removeConfirmName, setRemoveConfirmName] = useState('')
    const [removeConfirmCheckbox, setRemoveConfirmCheckbox] = useState(false)

    useEffect(() => {
        async function fetchData() {
            const [abstractProblemData, statisticsData] = await Promise.all([
                jutge.problems.getAbstractProblem(problem_nm),
                jutge.instructor.problems.getStatistics(problem_nm),
            ])
            setAbstractProblem(abstractProblemData)
            setStatistics(statisticsData)
            setReason(abstractProblemData.deprecation || '')
        }
        fetchData()
    }, [problem_nm])

    if (abstractProblem === null || statistics === null) return <SimpleSpinner />

    const totalSubmissions = statistics.submissions.length
    const canRemove = totalSubmissions < REMOVE_MAX_SUBMISSIONS

    async function saveDeprecation() {
        const trimmed = reason.trim()
        try {
            if (trimmed === '') {
                await jutge.instructor.problems.setDeprecation({ problem_nm, reason: null })
                toast.success('Problem undeprecated.')
            } else {
                await jutge.instructor.problems.setDeprecation({ problem_nm, reason: trimmed })
                toast.success('Problem deprecated.')
            }
            const updated = await jutge.problems.getAbstractProblem(problem_nm)
            setAbstractProblem(updated)
            setReason(updated.deprecation || '')
        } catch (e) {
            toast.error(String(e))
        }
    }

    async function removeProblem() {
        if (!removeConfirmCheckbox) {
            toast.error('You must confirm the removal with the switch.')
            return
        }
        if (!canRemove) {
            toast.error(
                `This problem has ${totalSubmissions} submissions. Problems can only be removed if they have fewer than ${REMOVE_MAX_SUBMISSIONS} submissions.`,
            )
            return
        }
        try {
            await jutge.instructor.problems.remove(problem_nm)
            toast.success('Problem removed.')
            router.push('/problems')
        } catch (e) {
            toast.error(String(e))
        }
    }

    const removeConfirmValidator = z.string().refine((s) => s.trim() === problem_nm, {
        message: 'The name does not match the problem name',
    })
    const removeCheckboxValidator = z.boolean().refine((v) => v === true, {
        message: 'You must confirm the removal',
    })

    const deprecationFields: JFormFields = {
        title: {
            type: 'free',
            label: '',
            content: (
                <div className="text-sm space-y-2 border rounded-lg p-4 mb-8">
                    <p>Deprecate or undeprecate problem {problem_nm} with the form below.</p>
                </div>
            ),
        },
        deprecationSection: {
            type: 'input',
            label: 'Deprecation reason',
            value: reason,
            setValue: setReason,
            placeHolder: 'Not deprecated',
            help: 'Leave empty for a non-deprecated problem. To deprecate, enter a short reason (e.g. superseded by another problem or no longer relevant).',
        },
        sep: { type: 'separator' },
        save: {
            type: 'button',
            text: 'Save',
            icon: <SaveIcon />,
            action: saveDeprecation,
        },
    }

    const removeFields: JFormFields = {
        removeTitle: {
            type: 'free',
            label: '',
            content: (
                <div className="text-sm space-y-2 border rounded-lg p-4 mb-8">
                    <AlertTriangleIcon />
                    <p>
                        Problems can only be removed if they have fewer than{' '}
                        {REMOVE_MAX_SUBMISSIONS} submissions. This problem has{' '}
                        <strong>{totalSubmissions}</strong> submission
                        {totalSubmissions !== 1 ? 's' : ''}.
                    </p>
                    <p>
                        Removing a problem is irreversible. Problems cannot be restored after
                        removal. The problem will be deleted from the system and all associated data
                        (e.g. submissions, lists, courses, exams, etc.) will be lost forever.
                    </p>
                    {!canRemove ? (
                        <p>
                            Removal not allowed. Consider deprecating the problem instead. If you
                            really want to remove this problem, please contact the administrators.
                        </p>
                    ) : (
                        <p className="text-destructive">
                            Check the checkbox and type the problem name ({problem_nm}) to confirm
                            removal.
                        </p>
                    )}
                </div>
            ),
        },
        removeCheckbox: {
            type: 'switch',
            label: 'I confirm the removal',
            help: 'Check the checkbox to confirm the removal. You understand that this action is irreversible.',
            value: removeConfirmCheckbox,
            setValue: setRemoveConfirmCheckbox,
            validator: removeCheckboxValidator,
        },
        removeConfirm: {
            type: 'input',
            label: <>Problem name</>,
            help: 'Type the problem name to confirm removal. You understand that this action is irreversible.',
            value: removeConfirmName,
            setValue: setRemoveConfirmName,
            placeHolder: '',
            validator: removeConfirmValidator,
        },
        removeSep: { type: 'separator' },
        removeBtn: {
            type: 'button',
            text: 'Remove problem',
            icon: <TrashIcon />,
            action: removeProblem,
        },
    }

    return (
        <div className="flex flex-col gap-8">
            <section>
                <JForm fields={deprecationFields} />
            </section>

            <section>
                <JForm fields={removeFields} />
            </section>
        </div>
    )
}
