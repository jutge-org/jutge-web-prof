'use client'

import { useParams } from 'next/navigation'
import { redirect } from 'next/navigation'

export default function ProblemPage() {
    const { problem_nm } = useParams<{ problem_nm: string }>()
    redirect(`/problems/${problem_nm}/properties`)
}
