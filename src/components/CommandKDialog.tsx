// això està trencat

'use client'

import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from '@/components/ui/command'
import jutge from '@/lib/jutge'
import {
    AbstractProblem,
    Document,
    InstructorBriefCourse,
    InstructorBriefExam,
    InstructorBriefList,
} from '@/lib/jutge_api_client'
import { mapmap, showError } from '@/lib/utils'
import { useCommandK } from '@/providers/CommandK'
import { menus } from '@/providers/Menu'
import { Description, DialogTitle } from '@radix-ui/react-dialog'
import { FileIcon, FilePenIcon, ListIcon, PuzzleIcon, TableIcon } from 'lucide-react'
import { redirect } from 'next/navigation'
import { all } from 'radash'
import { useEffect, useState } from 'react'

export function CommandKDialog() {
    //

    const commandK = useCommandK()
    const menu = menus.user
    const [courses, setCourses] = useState<Record<string, InstructorBriefCourse>>({})
    const [lists, setLists] = useState<Record<string, InstructorBriefList>>({})
    const [exams, setExams] = useState<Record<string, InstructorBriefExam>>({})
    const [documents, setDocuments] = useState<Record<string, Document>>({})
    const [problems, setProblems] = useState<Record<string, AbstractProblem>>({})

    const [archivedCourses, setArchivedCourses] = useState<string[]>([])
    const [archivedLists, setArchivedLists] = useState<string[]>([])
    const [archivedExams, setArchivedExams] = useState<string[]>([])

    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                commandK.setOpen(!commandK.open)
            }
        }
        document.addEventListener('keydown', down)
        return () => document.removeEventListener('keydown', down)
    })

    useEffect(() => {
        async function getExams() {
            try {
                const data = await all({
                    courses: jutge.instructor.courses.index(),
                    lists: jutge.instructor.lists.index(),
                    exams: jutge.instructor.exams.index(),
                    documents: jutge.instructor.documents.index(),
                    ownProblems: jutge.instructor.problems.getOwnProblems(),

                    archivedCourses: jutge.instructor.courses.getArchived(),
                    archivedLists: jutge.instructor.lists.getArchived(),
                    archivedExams: jutge.instructor.exams.getArchived(),
                })

                const problems = await jutge.problems.getAbstractProblems(
                    data.ownProblems.join(','),
                )

                setCourses(data.courses)
                setLists(data.lists)
                setExams(data.exams)
                setDocuments(data.documents)
                setProblems(problems)
                setArchivedCourses(data.archivedCourses)
                setArchivedLists(data.archivedLists)
                setArchivedExams(data.archivedExams)
                console.log('archivedCourses', data.archivedCourses)
            } catch (error) {
                showError(error)
            }
        }

        getExams()
    })

    function buildTitle(problem_nm: string) {
        const pbms = Object.values(problems[problem_nm].problems)
        return pbms.map((pbm) => pbm.title).join(' / ')
    }

    function select(href: string) {
        commandK.setOpen(false)
        redirect(href)
    }

    return (
        <CommandDialog open={commandK.open} onOpenChange={commandK.setOpen}>
            <DialogTitle className="sr-only">Command K</DialogTitle>
            <Description className="sr-only">Command K</Description>
            <CommandInput placeholder="Type a command or search your item..." />
            <CommandList className="h-96">
                <CommandEmpty>No results found.</CommandEmpty>

                <CommandGroup heading="Sections">
                    {mapmap(menu, (key, item) => (
                        <CommandItem key={key} onSelect={() => select(item.href)}>
                            <div className="opacity-40">{item.icon}</div>
                            {item.name}
                        </CommandItem>
                    ))}
                </CommandGroup>

                <CommandSeparator className="mb-2" />
                <CommandGroup heading="Courses">
                    {mapmap(courses, (key, course) =>
                        archivedCourses.includes(key) ? null : (
                            <CommandItem
                                key={key}
                                onSelect={() => select(`/courses/${key}/properties`)}
                            >
                                <div className="w-full flex flex-row">
                                    <div className="opacity-40 mr-2 scale-75">
                                        <TableIcon />
                                    </div>
                                    <div className="">{course.title}</div>
                                    <div className="flex-grow" />
                                    <div className="text-xs opacity-40">{key}</div>
                                </div>
                            </CommandItem>
                        ),
                    )}
                </CommandGroup>

                <CommandSeparator className="mb-2" />
                <CommandGroup heading="Lists">
                    {mapmap(lists, (key, list) =>
                        archivedLists.includes(key) ? null : (
                            <CommandItem
                                key={key}
                                onSelect={() => select(`/lists/${key}/properties`)}
                            >
                                <div className="w-full flex flex-row">
                                    <div className="opacity-40 mr-2 scale-75">
                                        <ListIcon />
                                    </div>
                                    <div className="">{list.title}</div>
                                    <div className="flex-grow" />
                                    <div className="text-xs opacity-40">{key}</div>
                                </div>
                            </CommandItem>
                        ),
                    )}
                </CommandGroup>

                <CommandSeparator className="mb-2" />
                <CommandGroup heading="Exams">
                    {mapmap(exams, (key, exam) =>
                        archivedExams.includes(key) ? null : (
                            <CommandItem
                                key={key}
                                onSelect={() => select(`/exams/${key}/properties`)}
                            >
                                <div className="w-full flex flex-row">
                                    <div className="opacity-40 mr-2 scale-75">
                                        <FilePenIcon />
                                    </div>
                                    <div className="">{exam.title}</div>
                                    <div className="flex-grow" />
                                    <div className="text-xs opacity-40">{key}</div>
                                </div>
                            </CommandItem>
                        ),
                    )}
                </CommandGroup>

                <CommandSeparator className="mb-2" />
                <CommandGroup heading="Documents">
                    {mapmap(documents, (key, document) => (
                        <CommandItem key={key} onSelect={() => select(`/documents/${key}`)}>
                            <div className="w-full flex flex-row">
                                <div className="opacity-40 mr-2 scale-75">
                                    <FileIcon />
                                </div>
                                <div className="">{document.title}</div>
                                <div className="flex-grow" />
                                <div className="text-xs opacity-40">{key}</div>
                            </div>
                        </CommandItem>
                    ))}
                </CommandGroup>

                <CommandSeparator className="mb-2" />
                <CommandGroup heading="Problems">
                    {mapmap(problems, (key, problem) => (
                        <CommandItem key={key} onSelect={() => select(`/problems/${key}`)}>
                            <div className="w-full flex flex-row">
                                <div className="opacity-40 mr-2 scale-75">
                                    <PuzzleIcon />
                                </div>
                                <div className="">{buildTitle(key)}</div>
                                <div className="flex-grow" />
                                <div className="text-xs opacity-40">{key}</div>
                            </div>
                        </CommandItem>
                    ))}
                </CommandGroup>
            </CommandList>
        </CommandDialog>
    )
}
