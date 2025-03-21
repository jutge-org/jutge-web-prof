'use client'

import {
    FileIcon,
    FilePenIcon,
    FolderUpIcon,
    HomeIcon,
    HouseIcon,
    InfoIcon,
    ListIcon,
    PuzzleIcon,
    TableIcon,
    TagsIcon,
} from 'lucide-react'

export interface MenuItem {
    name: string
    href: string
    icon?: React.ReactElement
    icon2xl?: React.ReactElement
}

export type Menu = Record<string, MenuItem>

export const menus: Record<string, Menu> = {
    public: {
        home: {
            href: '/',
            name: 'Home',
            icon: <HouseIcon />,
            icon2xl: <HouseIcon size={52} strokeWidth={0.8} />,
        },
        about: {
            href: '/about',
            name: 'About',
            icon: <InfoIcon />,
            icon2xl: <InfoIcon size={52} strokeWidth={0.8} />,
        },
    },

    user: {
        home: {
            href: '/home',
            name: 'Home',
            icon: <HouseIcon />,
            icon2xl: <HouseIcon size={52} strokeWidth={0.8} />,
        },
        courses: {
            href: '/courses',
            name: 'Courses',
            icon: <TableIcon />,
            icon2xl: <TableIcon size={52} strokeWidth={0.8} />,
        },
        lists: {
            href: '/lists',
            name: 'Lists',
            icon: <ListIcon />,
            icon2xl: <ListIcon size={52} strokeWidth={0.8} />,
        },
        exams: {
            href: '/exams',
            name: 'Exams',
            icon: <FilePenIcon />,
            icon2xl: <FilePenIcon size={52} strokeWidth={0.8} />,
        },
        documents: {
            href: '/documents',
            name: 'Documents',
            icon: <FileIcon />,
            icon2xl: <FileIcon size={52} strokeWidth={0.8} />,
        },
        problems: {
            href: '/problems',
            name: 'Problems',
            icon: <PuzzleIcon />,
            icon2xl: <PuzzleIcon size={52} strokeWidth={0.8} />,
        },
        tags: {
            href: '/tags',
            name: 'Tags',
            icon: <TagsIcon />,
            icon2xl: <TagsIcon size={52} strokeWidth={0.8} />,
        },
        about: {
            href: '/about',
            name: 'About',
            icon: <InfoIcon />,
            icon2xl: <InfoIcon size={52} strokeWidth={0.8} />,
        },
    },

    courses: {
        properties: {
            href: 'properties',
            name: 'Properties',
        },
        students: {
            href: 'students',
            name: 'Students',
        },
        tutors: {
            href: 'tutors',
            name: 'Tutors',
        },
        lists: {
            href: 'lists',
            name: 'Lists',
        },
        duplicate: {
            href: 'duplicate',
            name: 'Duplicate',
        },
        up: {
            href: '..',
            name: 'Up',
            icon: <FolderUpIcon strokeWidth={1.5} size="1.5em" />,
        },
    },

    lists: {
        properties: {
            href: 'properties',
            name: 'Properties',
        },
        items: {
            href: 'items',
            name: 'Items',
        },
        duplicate: {
            href: 'duplicate',
            name: 'Duplicate',
        },
        up: {
            href: '..',
            name: 'Up',
            icon: <FolderUpIcon strokeWidth={1.5} size="1.5em" />,
        },
    },

    exams: {
        properties: {
            href: 'properties',
            name: 'Properties',
        },
        problems: {
            href: 'problems',
            name: 'Problems',
        },
        students: {
            href: 'students',
            name: 'Students',
        },
        submissions: {
            href: 'submissions',
            name: 'Submissions',
        },
        ranking: {
            href: 'ranking',
            name: 'Ranking',
        },
        statistics: {
            href: 'statistics',
            name: 'Statistics',
        },
        up: {
            href: '..',
            name: 'Up',
            icon: <FolderUpIcon strokeWidth={1.5} size="1.5em" />,
        },
    },

    problems: {
        up: {
            href: '.',
            name: 'Up',
            icon: <FolderUpIcon strokeWidth={1.5} size="1.5em" />,
        },
    },

    documents: {
        up: {
            href: '.',
            name: 'Up',
            icon: <FolderUpIcon strokeWidth={1.5} size="1.5em" />,
        },
    },

    tags: {
        up: {
            href: '.',
            name: 'Up',
            icon: <FolderUpIcon strokeWidth={1.5} size="1.5em" />,
        },
    },

    main: {
        home: {
            href: '/home',
            name: 'Home',
            icon: <HomeIcon strokeWidth={1.5} size="1.5em" />,
        },
    },
}
