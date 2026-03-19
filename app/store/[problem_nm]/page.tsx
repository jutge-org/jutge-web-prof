'use client'

import { useParams } from 'next/navigation'
import { redirect } from 'next/navigation'

export default function StoreProblemPage() {
    const { problem_nm } = useParams<{ problem_nm: string }>()
    redirect(`/finder/${problem_nm}/properties`)
}
