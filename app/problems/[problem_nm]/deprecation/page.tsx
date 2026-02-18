'use client'

import { SaveIcon } from 'lucide-react'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { JForm, JFormFields } from '@/components/formatters/JForm'
import Page from '@/components/layout/Page'
import SimpleSpinner from '@/components/SimpleSpinner'
import jutge from '@/lib/jutge'
import { AbstractProblem } from '@/lib/jutge_api_client'

export default function ProblemDeprecationPage() {
    const { problem_nm } = useParams<{ problem_nm: string }>()
    return (
        <Page
            pageContext={{
                title: `Problem ${problem_nm}`,
                menu: 'user',
                current: 'problems',
                subTitle: `Problems ❯ ${problem_nm}`,
                subMenu: 'problems',
                subCurrent: 'deprecation',
            }}
        >
            <ProblemDeprecationView />
        </Page>
    )
}

function ProblemDeprecationView() {
    const { problem_nm } = useParams<{ problem_nm: string }>()
    const [abstractProblem, setAbstractProblem] = useState<AbstractProblem | null>(null)
    const [reason, setReason] = useState('')

    useEffect(() => {
        async function fetchProblem() {
            const abstractProblem = await jutge.problems.getAbstractProblem(problem_nm)
            setAbstractProblem(abstractProblem)
            setReason(abstractProblem.deprecation || '')
        }
        fetchProblem()
    }, [problem_nm])

    if (abstractProblem === null) return <SimpleSpinner />

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

    const fields: JFormFields = {
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

    return (
        <div className="flex flex-col gap-4">
            <JForm fields={fields} />
        </div>
    )
}
