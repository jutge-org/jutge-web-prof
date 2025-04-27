'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Prose } from '@/jutge-components/wrappers/Prose'
import { Avatar, AvatarFallback, AvatarImage } from '@radix-ui/react-avatar'
import { GithubIcon, GripIcon } from 'lucide-react'

import Page from '@/jutge-components/layouts/court/Page'
import { useAuth } from '@/jutge-components/layouts/court/lib/Auth'

export default function AboutPage() {
    const auth = useAuth()
    return (
        <Page
            public={true}
            pageContext={{ menu: auth.user ? 'user' : 'public', current: 'about', title: 'About' }}
        >
            <p className="text-2xl font-bold pb-4">About</p>
            <p>This is the instructors web page of Jutge.org.</p>
            <p className="text-2xl font-bold pt-8 pb-4">Credits</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ProfileCard
                    name="Pau Fernández"
                    university="Universitat Politècnica de Catalunya"
                    githubUrl="https://github.com/pauek/"
                    imageUrl="/pauek.png"
                    fallback="PF"
                />
                <ProfileCard
                    name="Jordi Petit"
                    university="Universitat Politècnica de Catalunya"
                    githubUrl="https://github.com/jordi-petit/"
                    imageUrl="/jpetit.png"
                    fallback="JP"
                />
            </div>
            <p className="pt-8 text-2xl font-bold pb-4">Tech</p>
            <Prose>Made with Next.js, React and the Jutge API.</Prose>
            <p className="pt-8 text-2xl font-bold pb-4">Icons</p>
            <Prose>
                <ul>
                    <li>
                        <a href="https://www.flaticon.com/free-icons/teacher" title="teacher icons">
                            Teacher icons created by Prosymbols Premium - Flaticon
                        </a>
                    </li>
                </ul>
            </Prose>
        </Page>
    )
}

interface ProfileCardProps {
    name: string
    university: string
    githubUrl: string
    imageUrl: string
    fallback: string
}

function ProfileCard({ name, university, githubUrl, imageUrl, fallback }: ProfileCardProps) {
    return (
        <Card className="w-full">
            <CardContent className="px-4 pt-4 flex flex-row space-x-4">
                <Avatar className="AvatarRoot">
                    <AvatarImage src={imageUrl} className="AvatarImage" />
                    <AvatarFallback>{fallback}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                    <p className="font-bold pb-2 hover:text-chart-1">{name}</p>
                    <p>
                        <a href="https://upc.edu" className="flex flex-row items-center gap-2">
                            <GripIcon size={16} /> {university}
                        </a>
                    </p>
                    <p>
                        <a href={githubUrl} className="flex flex-row items-center gap-2">
                            <GithubIcon size={16} /> GitHub
                        </a>
                    </p>
                </div>
            </CardContent>
        </Card>
    )
}
