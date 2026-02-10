'use client'

import {
    BotIcon,
    BoxesIcon,
    CableIcon,
    FileIcon,
    FilePenIcon,
    FileTextIcon,
    FolderUpIcon,
    GavelIcon,
    HomeIcon,
    HouseIcon,
    InfoIcon,
    ListIcon,
    PuzzleIcon,
    SearchIcon,
    SquareCodeIcon,
    TableIcon,
    WrenchIcon,
} from 'lucide-react'
import { Menu } from '@/components/layout/lib/Menu'

export const shortTitle = 'prof.jutge.org'

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
            shortcut: 'H',
        },
        courses: {
            href: '/courses',
            name: 'Courses',
            icon: <TableIcon />,
            icon2xl: <TableIcon size={52} strokeWidth={0.8} />,
            shortcut: 'C',
        },
        lists: {
            href: '/lists',
            name: 'Lists',
            icon: <ListIcon />,
            icon2xl: <ListIcon size={52} strokeWidth={0.8} />,
            shortcut: 'L',
        },
        exams: {
            href: '/exams',
            name: 'Exams',
            icon: <FilePenIcon />,
            icon2xl: <FilePenIcon size={52} strokeWidth={0.8} />,
            shortcut: 'E',
        },
        documents: {
            href: '/documents',
            name: 'Documents',
            icon: <FileIcon />,
            icon2xl: <FileIcon size={52} strokeWidth={0.8} />,
            shortcut: 'D',
        },
        problems: {
            href: '/problems',
            name: 'Problems',
            icon: <PuzzleIcon />,
            icon2xl: <PuzzleIcon size={52} strokeWidth={0.8} />,
            shortcut: 'P',
        },
        search: {
            href: '/search',
            name: 'Search',
            icon: <SearchIcon />,
            icon2xl: <SearchIcon size={52} strokeWidth={0.8} />,
            shortcut: 'S',
        },
        jutgeai: {
            href: '/jutgeai',
            name: 'JutgeAI',
            icon: <BotIcon />,
            icon2xl: <BotIcon size={52} strokeWidth={0.8} />,
            shortcut: 'J',
        },
        docs: {
            href: '/docs',
            name: 'Docs',
            icon: <FileTextIcon />,
            icon2xl: <FileTextIcon size={52} strokeWidth={0.8} />,
            shortcut: 'T',
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

    search: {
        up: {
            href: '.',
            name: 'Up',
            icon: <FolderUpIcon strokeWidth={1.5} size="1.5em" />,
        },
    },

    up: {
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

    docs: {
        compilers: {
            href: '/docs/compilers',
            name: 'Compilers',
            icon: <SquareCodeIcon />,
            icon2xl: <SquareCodeIcon size={52} strokeWidth={0.8} />,
        },
        verdicts: {
            href: '/docs/verdicts',
            name: 'Verdicts',
            icon: <GavelIcon />,
            icon2xl: <GavelIcon size={52} strokeWidth={0.8} />,
        },
        pylibs: {
            href: '/docs/pylibs',
            name: 'Python Libs',
            icon: <BoxesIcon />,
            icon2xl: <BoxesIcon size={52} strokeWidth={0.8} />,
        },
        api: {
            href: 'https://api.jutge.org',
            name: 'API',
            icon: <CableIcon />,
            icon2xl: <CableIcon size={52} strokeWidth={0.8} />,
        },
        toolkit: {
            href: 'https://github.com/jutge-org/jutge-toolkit',
            name: 'Toolkit',
            icon: <WrenchIcon />,
            icon2xl: <WrenchIcon size={52} strokeWidth={0.8} />,
        },
    },
}
