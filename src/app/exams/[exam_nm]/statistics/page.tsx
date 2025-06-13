'use client'

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
import { useAuth } from '@/jutge-components/layouts/court/lib/Auth'
import Page from '@/jutge-components/layouts/court/Page'
import SimpleSpinner from '@/jutge-components/spinners/SimpleSpinner'
import { Warning } from '@/jutge-components/ui/Warning'
import jutge, { getProblemTitle } from '@/lib/jutge'
import {
    AbstractProblem,
    ColorMapping,
    Distribution,
    ExamStatistics,
    InstructorExam,
    InstructorExamProblem,
    Profile,
} from '@/lib/jutge_api_client'
import { Dict } from '@/lib/utils'
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

    const [colors, setColors] = useState<ColorMapping | null>(null)

    useEffect(() => {
        async function fetchData() {
            const exam = await jutge.instructor.exams.get(exam_nm)
            const statistics = await jutge.instructor.exams.getStatistics(exam_nm)
            const problem_nms = exam.problems.map((problem) => problem.problem_nm).join(',')
            const allAbstractProblems = await jutge.problems.getAbstractProblems(problem_nms)
            const colors = await jutge.misc.getHexColors()

            setExam(exam)
            setStatistics(statistics)
            setAbstractProblems(allAbstractProblems)
            setColors(colors)
        }
        fetchData()
    }, [exam_nm])

    if (
        auth === null ||
        auth.user === null ||
        exam === null ||
        statistics === null ||
        abstractProblems === null ||
        colors === null
    ) {
        return <SimpleSpinner />
    }

    if (!exam.time_start) {
        return <Warning>Exam has not started yet.</Warning>
    }

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
                        <MyPieChart
                            data={statistics.submissions[problem.problem_nm]}
                            cathegory="verdicts"
                            colors={colors}
                        />
                    </MyCard>
                </div>
            ))}
            <div className="sm:col-span-2">
                <MyCard title="Summary">
                    <MySummaryChart
                        data={statistics.submissions}
                        cathegory="verdicts"
                        colors={colors}
                        exam={exam}
                    />
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
                        <MyPieChart
                            data={statistics.statuses[problem.problem_nm]}
                            cathegory="statuses"
                            colors={colors}
                        />
                    </MyCard>
                </div>
            ))}
            <div className="sm:col-span-2">
                <MyCard title="Summary">
                    <MySummaryChart
                        data={statistics.statuses}
                        cathegory="statuses"
                        colors={colors}
                        exam={exam}
                    />
                </MyCard>
            </div>
        </div>
    )

    const timeline = (
        <MyCard title={<></>}>
            <MyTimelineChart data={statistics.timeline} colors={colors} />
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
                        <MyPieChart
                            data={statistics.compilers[problem.problem_nm]}
                            cathegory="compilers"
                            colors={colors}
                        />
                    </MyCard>
                </div>
            ))}
            <div className="sm:col-span-2">
                <MyCard title="Summary">
                    <MySummaryChart
                        data={statistics.compilers}
                        cathegory="compilers"
                        colors={colors}
                        exam={exam}
                    />
                </MyCard>
            </div>
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
                        <MyPieChart
                            data={statistics.proglangs[problem.problem_nm]}
                            cathegory="proglangs"
                            colors={colors}
                        />
                    </MyCard>
                </div>
            ))}
            <div className="sm:col-span-2">
                <MyCard title="Summary">
                    <MySummaryChart
                        data={statistics.proglangs}
                        cathegory="proglangs"
                        colors={colors}
                        exam={exam}
                    />
                </MyCard>
            </div>
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

type MySummaryChartProps = {
    data: Dict<Distribution>
    cathegory: string
    colors: ColorMapping
    exam: InstructorExam
}

function MySummaryChart(props: MySummaryChartProps) {
    //

    const captions: Dict<string> = {}
    for (const problem of props.exam.problems) {
        captions[problem.problem_nm] = problem.caption || problem.problem_nm
    }

    const chartData: Dict<string | number>[] = []
    const chartConfig: Dict<any> = {}

    for (const [problem_nm, distribution] of Object.entries(props.data)) {
        const item: Dict<string | number> = { problem_nm: captions[problem_nm] }
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
        <ChartContainer config={chartConfig} className="h-[372px] w-full">
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
                        fill={color(key, props.cathegory, props.colors)}
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

type Bucket = {
    minute: number | string
    ok: number
    ko: number
}

type MyTimelineChartProps = {
    data: Bucket[]
    colors: ColorMapping
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
            color: color('OK', 'statuses', props.colors),
        },
        ko: {
            label: 'KO',
            color: color('KO', 'statuses', props.colors),
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

type MyPieChartProps = {
    data: Distribution
    cathegory: string
    colors: ColorMapping
}

function MyPieChart(props: MyPieChartProps) {
    //

    // data is fully modified, so we need to clone it
    const data = structuredClone(props.data)

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
                color: color(key, props.cathegory, props.colors),
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
                                <TableCell className="text-end">{props.data[key]}</TableCell>
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

type MyCardProps = {
    title: string | JSX.Element
    subtitle?: string | JSX.Element
    children: React.ReactNode
}

function MyCard(props: MyCardProps) {
    return (
        <Card>
            <CardHeader className="p-4">
                <CardTitle>{props.title}</CardTitle>
                <CardDescription>{props.subtitle}</CardDescription>
            </CardHeader>
            <CardContent className="px-2 py-0">{props.children}</CardContent>
        </Card>
    )
}

type SectionProps = {
    children: React.ReactNode
    className?: string
}

function Section(props: SectionProps) {
    return (
        <div className={`mt-8 mb-4 text-xl font-bold ${props.className}`}>
            <div className="flex items-center gap-2">
                <div className="flex-grow">{props.children}</div>
            </div>
        </div>
    )
}

type ProblemTitleProps = {
    user: Profile
    problem: InstructorExamProblem
    abstractProblems: Dict<AbstractProblem>
}

function ProblemTitle(props: ProblemTitleProps) {
    return (
        <div className="flex flex-row gap-2">
            {props.problem.icon && (
                <Image
                    src={`https://jutge.org/img/examicons/${props.problem.icon}.svg`}
                    alt={props.problem.icon}
                    width={32}
                    height={32}
                    className="h-9 w-9"
                />
            )}
            <div className="flex flex-col gap-1">
                <div className="flex flex-row">
                    {props.problem.caption && (
                        <div className="">{props.problem.caption}&nbsp;·&nbsp;</div>
                    )}
                    {props.problem.problem_nm}
                </div>
                <div className="font-normal text-sm text-gray-500 line-clamp-1">
                    {getProblemTitle(props.user, props.problem.problem_nm, props.abstractProblems)}
                </div>
            </div>
        </div>
    )
}

function color(key: string, cathegory: string, colors: ColorMapping) {
    if (!(cathegory in colors) || !(key in colors[cathegory])) {
        return 'blue'
    }
    return colors[cathegory][key]
}
