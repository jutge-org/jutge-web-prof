// això està trencat

'use client'

import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandShortcut,
} from '@/components/ui/command'
import jutge from '@/lib/jutge'
import {
    Document,
    InstructorBriefCourse,
    InstructorBriefExam,
    InstructorBriefList,
} from '@/lib/jutge_api_client'
import { mapmap } from '@/lib/utils'
import { useCommandK } from '@/providers/CommandK'
import { menus } from '@/providers/Menu'
import { Description, DialogTitle } from '@radix-ui/react-dialog'
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
    const [problems, setProblems] = useState<string[]>([])

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
            const data = await all({
                courses: jutge.instructor.courses.index(),
                lists: jutge.instructor.lists.index(),
                exams: jutge.instructor.exams.index(),
                documents: jutge.instructor.documents.index(),
                problems: jutge.instructor.problems.getOwnProblems(),
            })

            setCourses(data.courses)
            setLists(data.lists)
            setExams(data.exams)
            setDocuments(data.documents)
            setProblems(data.problems)
        }

        getExams()
    })

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
                            {item.icon}
                            {item.name}
                            {item.shortcut && <CommandShortcut>{item.shortcut}</CommandShortcut>}
                        </CommandItem>
                    ))}
                </CommandGroup>

                <CommandGroup heading="Courses">
                    {mapmap(courses, (key, course) => (
                        <CommandItem
                            key={key}
                            onSelect={() => select(`/courses/${key}/properties`)}
                        >
                            <div className="w-full flex flex-row">
                                <div className="">{course.title}</div>
                                <div className="flex-grow" />
                                <div className="text-xs text-gray-500">{key}</div>
                            </div>
                        </CommandItem>
                    ))}
                </CommandGroup>

                <CommandGroup heading="Lists">
                    {mapmap(lists, (key, list) => (
                        <CommandItem key={key} onSelect={() => select(`/lists/${key}/properties`)}>
                            <div className="w-full flex flex-row">
                                <div className="">{list.title}</div>
                                <div className="flex-grow" />
                                <div className="text-xs text-gray-500">{key}</div>
                            </div>
                        </CommandItem>
                    ))}
                </CommandGroup>

                <CommandGroup heading="Exams">
                    {mapmap(exams, (key, exam) => (
                        <CommandItem key={key} onSelect={() => select(`/exams/${key}/properties`)}>
                            <div className="w-full flex flex-row">
                                <div className="">{exam.title}</div>
                                <div className="flex-grow" />
                                <div className="text-xs text-gray-500">{key}</div>
                            </div>
                        </CommandItem>
                    ))}
                </CommandGroup>

                <CommandGroup heading="Documents">
                    {mapmap(documents, (key, document) => (
                        <CommandItem key={key} onSelect={() => select(`/documents/${key}`)}>
                            <div className="w-full flex flex-row">
                                <div className="">{document.title}</div>
                                <div className="flex-grow" />
                                <div className="text-xs text-gray-500">{key}</div>
                            </div>
                        </CommandItem>
                    ))}
                </CommandGroup>

                <CommandGroup heading="Problems">
                    {problems.map((key, problem) => (
                        <CommandItem key={key} onSelect={() => select(`/problems/${key}`)}>
                            <div className="w-full flex flex-row">
                                <div className="">TODO:TITLE</div>
                                <div className="flex-grow" />
                                <div className="text-xs text-gray-500">{key}</div>
                            </div>
                        </CommandItem>
                    ))}
                </CommandGroup>
            </CommandList>
        </CommandDialog>
    )
}
