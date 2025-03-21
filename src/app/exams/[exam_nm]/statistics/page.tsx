'use client'

import Page from '@/components/Page'
import Spinner from '@/components/Spinner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from '@/components/ui/chart'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import jutge from '@/lib/jutge'
import {
    AbstractProblem,
    Distribution,
    ExamStatistics,
    InstructorExam,
    InstructorExamProblem,
    Profile,
} from '@/lib/jutge_api_client'
import { Dict } from '@/lib/utils'
import { useAuth } from '@/providers/Auth'
import toHex from 'colornames'
import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration'
import { ChartPieIcon, TableIcon } from 'lucide-react'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import { JSX, useEffect, useState } from 'react'
import { Bar, BarChart, CartesianGrid, LabelList, Pie, PieChart, XAxis, YAxis } from 'recharts'

dayjs.extend(duration)

export default function ExamStatisticsPage() {
    const { exam_nm } = useParams<{ exam_nm: string }>()
    return (
        <Page
            pageContext={{
                title: `Exam ${exam_nm}`,
                menu: 'user',
                current: 'exams',
                subTitle: `Exams ❯ ${exam_nm}`,
                subMenu: 'exams',
                subCurrent: 'statistics',
            }}
        >
            <ExamStatisticsView />
        </Page>
    )
}

function ExamStatisticsView() {
    //

    const { exam_nm } = useParams<{ exam_nm: string }>()

    const auth = useAuth()

    const [exam, setExam] = useState<InstructorExam | null>(null)

    const [statistics, setStatistics] = useState<ExamStatistics | null>(null)

    const [abstractProblems, setAbstractProblems] = useState<Dict<AbstractProblem> | null>(null)

    useEffect(() => {
        async function fetchData() {
            const exam = await jutge.instructor.exams.get(exam_nm)
            const statistics = await jutge.instructor.exams.getStatistics(exam_nm)
            const problem_nms = exam.problems.map((problem) => problem.problem_nm).join(',')
            const allAbstractProblems = await jutge.problems.getAbstractProblems(problem_nms)

            setExam(exam)
            setStatistics(statistics)
            setAbstractProblems(allAbstractProblems)
        }
        fetchData()
    }, [exam_nm])

    if (
        auth === null ||
        auth.user === null ||
        exam === null ||
        statistics === null ||
        abstractProblems === null
    )
        return <Spinner />

    const submissions = (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {exam.problems.map((problem) => (
                <div key={problem.problem_nm}>
                    <MyCard
                        title={
                            <ProblemTitle
                                user={auth.user!}
                                problem={problem}
                                abstractProblems={abstractProblems}
                            />
                        }
                    >
                        <MyPieChart data={statistics.submissions[problem.problem_nm]} />
                    </MyCard>
                </div>
            ))}
            <div className="col-span-2">
                <MyCard title="Summary">
                    <MySummaryChart data={statistics.submissions} />
                </MyCard>
            </div>
        </div>
    )

    const statuses = (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {exam.problems.map((problem) => (
                <div key={problem.problem_nm}>
                    <MyCard
                        title={
                            <ProblemTitle
                                user={auth.user!}
                                problem={problem}
                                abstractProblems={abstractProblems}
                            />
                        }
                    >
                        <MyPieChart data={statistics.statuses[problem.problem_nm]} />
                    </MyCard>
                </div>
            ))}
            <div className="col-span-2">
                <MyCard title="Summary">
                    <MySummaryChart data={statistics.statuses} />
                </MyCard>
            </div>
        </div>
    )

    const timeline = (
        <MyCard title={<></>}>
            <MyTimelineChart data={statistics.timeline} />
        </MyCard>
    )

    const compilers = (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {exam.problems.map((problem) => (
                <div key={problem.problem_nm}>
                    <MyCard
                        title={
                            <ProblemTitle
                                user={auth.user!}
                                problem={problem}
                                abstractProblems={abstractProblems}
                            />
                        }
                    >
                        <MyPieChart data={statistics.compilers[problem.problem_nm]} />
                    </MyCard>
                </div>
            ))}
        </div>
    )

    const proglangs = (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {exam.problems.map((problem) => (
                <div key={problem.problem_nm}>
                    <MyCard
                        title={
                            <ProblemTitle
                                user={auth.user!}
                                problem={problem}
                                abstractProblems={abstractProblems}
                            />
                        }
                    >
                        <MyPieChart data={statistics.proglangs[problem.problem_nm]} />
                    </MyCard>
                </div>
            ))}
        </div>
    )

    return (
        <Tabs defaultValue="submissions" className="w-full">
            <TabsList className="grid w-full grid-cols-5 mb-4">
                <TabsTrigger value="submissions">Submissions</TabsTrigger>
                <TabsTrigger value="statuses">Statuses</TabsTrigger>
                <TabsTrigger value="timeline">Timeline</TabsTrigger>
                <TabsTrigger value="compilers">Compilers</TabsTrigger>
                <TabsTrigger value="proglangs">Proglangs</TabsTrigger>
            </TabsList>
            <TabsContent value="submissions">{submissions}</TabsContent>
            <TabsContent value="statuses">{statuses}</TabsContent>
            <TabsContent value="timeline">{timeline}</TabsContent>
            <TabsContent value="compilers">{compilers}</TabsContent>
            <TabsContent value="proglangs">{proglangs}</TabsContent>
        </Tabs>
    )
}

function MySummaryChart({ data }: { data: Dict<Distribution> }) {
    //

    const chartData: Dict<string | number>[] = []
    const chartConfig: Dict<any> = {}

    for (const [problem_nm, distribution] of Object.entries(data)) {
        const item: Dict<string | number> = { problem_nm }
        for (const [key, value] of Object.entries(distribution)) {
            if (!(key in chartData)) item[key] = 0
            item[key] = value
            chartConfig[key] = {
                label: key,
            }
        }
        chartData.push(item)
    }

    return (
        <ChartContainer config={chartConfig} className="h-[150px] w-full">
            <BarChart data={chartData} layout="vertical">
                <CartesianGrid horizontal={false} vertical={false} />
                <YAxis dataKey="problem_nm" type="category" tickLine={false} axisLine={false} />
                <XAxis type="number" hide />
                <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
                {Object.keys(chartConfig).map((key, index) => (
                    <Bar
                        key={index}
                        dataKey={key}
                        layout="vertical"
                        fill={myColor(key)}
                        radius={
                            index == 0
                                ? [4, 0, 0, 4]
                                : index == Object.keys(chartConfig).length - 1
                                  ? [0, 4, 4, 0]
                                  : [0, 0, 0, 0]
                            /* some items at the right do not get rounded corners because items of size exist. */
                        }
                        stackId="a"
                    >
                        <LabelList
                            formatter={() => key}
                            dataKey={key}
                            position="insideLeft"
                            offset={8}
                            className="fill-[hsl(var(--background))]"
                            fontSize={12}
                        />
                    </Bar>
                ))}
            </BarChart>
        </ChartContainer>
    )
}

//

type Bucket = {
    minute: number | string
    ok: number
    ko: number
}

type MyTimelineChartProps = {
    data: Bucket[]
}

function MyTimelineChart(props: MyTimelineChartProps) {
    //

    // after much searching I found that recharts wants the x-axis to be a string
    for (const bucket of props.data) {
        bucket.minute = bucket.minute.toString()
    }

    const chartConfig = {
        ok: {
            label: 'OK',
            color: myColor('OK'),
        },
        ko: {
            label: 'KO',
            color: myColor('KO'),
        },
    } satisfies ChartConfig

    return (
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <BarChart data={props.data}>
                <CartesianGrid vertical={false} />
                <XAxis
                    dataKey="minute"
                    tickLine={false}
                    tickMargin={0}
                    axisLine={false}
                    tickFormatter={(value) =>
                        dayjs.duration(Number(value), 'minutes').format('HH:mm')
                    }
                />
                <YAxis tickLine={false} tickMargin={0} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="ko" fill="var(--color-ko)" radius={[0, 0, 4, 4]} stackId="a" />
                <Bar dataKey="ok" fill="var(--color-ok)" radius={[4, 4, 0, 0]} stackId="a" />
            </BarChart>
        </ChartContainer>
    )
}

function MyPieChart({ data }: { data: Distribution }) {
    //

    // data is fooly modified, so we need to clone it
    const originalData = data
    data = structuredClone(data)

    const [chartVisible, setChartVisible] = useState(true)

    let total = 0
    for (const [index, key] of Object.keys(data).entries()) {
        total += data[key]
    }
    for (const [index, key] of Object.keys(data).entries()) {
        data[key] = Math.round((data[key] / total) * 1000) / 10
    }

    const minimum = 5

    const chartConfig: Record<string, any> = {
        value: {
            label: 'Percentage',
        },
    }

    let single = ''
    let differents = 0
    let others = 0
    for (const [index, key] of Object.keys(data).entries()) {
        if (data[key] < minimum) {
            others += data[key]
            differents += 1
            single = key
        } else {
            chartConfig[key] = {
                label: key,
                color: myColor(key),
            }
        }
    }

    const chartData = Object.entries(data)
        .filter(([key, value]) => value > minimum)
        .map(([key, value]) => ({
            label: key,
            value,
            fill: chartConfig[key].color,
        }))
    if (others > 0) {
        const label = differents === 1 ? single : 'Others'
        chartData.push({
            label: label,
            value: others,
            fill: 'hsl(var(--chart-5))',
        })
        chartConfig[label] = {
            label: label,
            color: 'hsl(var(--chart-5))',
        }
    }

    const chart = (
        <ChartContainer
            config={chartConfig}
            className="mx-auto aspect-square max-h-[400px] [&_.recharts-text]:fill-background"
        >
            <PieChart>
                <ChartTooltip content={<ChartTooltipContent nameKey="label" hideLabel />} />
                <Pie data={chartData} dataKey="value" innerRadius={60}>
                    <LabelList
                        dataKey="label"
                        className="fill-background"
                        stroke="none"
                        fontSize={11}
                        formatter={(value: keyof typeof chartConfig) => chartConfig[value]?.label}
                    />
                </Pie>
            </PieChart>
        </ChartContainer>
    )

    const table = (
        <ScrollArea className="h-[305] w-full">
            <Table>
                <TableBody>
                    {Object.entries(data)
                        .sort((a, b) => b[1] - a[1])
                        .map(([key, value]) => (
                            <TableRow key={key}>
                                <TableCell>{key}</TableCell>
                                <TableCell className="text-end">{originalData[key]}</TableCell>
                                <TableCell className="text-end">{value.toFixed(1)}%</TableCell>
                            </TableRow>
                        ))}
                </TableBody>
            </Table>
        </ScrollArea>
    )

    return (
        <>
            {chartVisible ? chart : table}
            <ToggleGroup
                type="single"
                onValueChange={(value) => setChartVisible(value === 'pie')}
                className="mb-2"
                defaultValue="pie"
            >
                <ToggleGroupItem value={'pie'} aria-label="Toggle bold">
                    <ChartPieIcon className="h-4 w-4" />
                </ToggleGroupItem>
                <ToggleGroupItem value={'table'} aria-label="Toggle italic">
                    <TableIcon className="h-4 w-4" />
                </ToggleGroupItem>
            </ToggleGroup>
        </>
    )
}

function MyCard({
    title,
    subtitle,
    children,
}: {
    title: string | JSX.Element
    subtitle?: string | JSX.Element
    children: React.ReactNode
}) {
    return (
        <Card>
            <CardHeader className="p-4">
                <CardTitle>{title}</CardTitle>
                <CardDescription>{subtitle}</CardDescription>
            </CardHeader>
            <CardContent className="px-2 py-0">{children}</CardContent>
        </Card>
    )
}

function getTitle(user: Profile, problem_nm: string, abstractProblems: Dict<AbstractProblem>) {
    try {
        const abstractProblem = abstractProblems[problem_nm]
        const prefLanguageId = user.language_id
        const problem_id = abstractProblem.problem_nm + '_' + prefLanguageId
        if (problem_id in abstractProblem.problems) {
            return abstractProblem.problems[problem_id].title
        } else {
            for (const problem of Object.values(abstractProblem.problems)) {
                if (problem.translator === null) {
                    return problem.title
                }
            }
            for (const problem of Object.values(abstractProblem.problems)) {
                return problem.title
            }
            return problem_nm
        }
    } catch {
        return problem_nm
    }
}

function Section({ children, className }: { children: React.ReactNode; className?: string }) {
    return (
        <div className={`mt-8 mb-4 text-xl font-bold ${className}`}>
            <div className="flex items-center gap-2">
                <div className="flex-grow">{children}</div>
            </div>
        </div>
    )
}

function ProblemTitle({
    user,
    problem,
    abstractProblems,
}: {
    user: Profile
    problem: InstructorExamProblem
    abstractProblems: Dict<AbstractProblem>
}) {
    return (
        <div className="flex flex-row gap-2">
            {problem.icon && (
                <Image
                    src={`https://jutge.org/img/examicons/${problem.icon}.svg`}
                    alt={problem.icon}
                    width={32}
                    height={32}
                    className=""
                />
            )}
            <div className="flex flex-col gap-1">
                <div className="flex flex-row">
                    {problem.caption && <div className="">{problem.caption}&nbsp;·&nbsp;</div>}
                    {problem.problem_nm}
                </div>
                <div className="font-normal text-sm text-gray-500">
                    {getTitle(user!, problem.problem_nm, abstractProblems)}
                </div>
            </div>
        </div>
    )
}

function myColor(key: string) {
    // see https://github.com/timoxley/colornames

    // statuses
    if (key === 'OK') return toHex('cobaltgreen')
    if (key === 'KO') return toHex('tomato 3')
    if (key === 'NT') return toHex('gray')

    // submissions
    if (key === 'AC') return toHex('cobaltgreen')
    if (key === 'WA') return toHex('tomato 3')
    if (key === 'PE') return toHex('darkorange 1')
    if (key === 'SC') return toHex('darkorange 1')
    if (key === 'IC') return toHex('darkorange')
    if (key === 'CE') return toHex('purple')
    if (key === 'EE') return toHex('darkgray')
    if (key === 'IE') return toHex('red')
    if (key === 'SE') return toHex('red')

    console.log('Unknown key to get color', key)
    return 'blue'
}
