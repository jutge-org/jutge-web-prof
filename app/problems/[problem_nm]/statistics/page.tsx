'use client'

import { Heatmap } from '@/components/Heatmap'
import { ChartPieIcon, TableIcon } from 'lucide-react'
import dayjs from 'dayjs'
import { useParams } from 'next/navigation'
import { JSX, useEffect, useState } from 'react'
import { LabelList, Pie, PieChart } from 'recharts'
import Page from '@/components/layout/Page'
import SimpleSpinner from '@/components/SimpleSpinner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import jutge from '@/lib/jutge'
import {
    ColorMapping,
    Distribution,
    HeatmapCalendar,
    ProblemStatistics,
} from '@/lib/jutge_api_client'

function color(key: string, category: string, colors: ColorMapping) {
    if (!(category in colors) || !(key in colors[category])) {
        return 'hsl(var(--chart-1))'
    }
    return colors[category][key]
}

type MyPieChartProps = {
    data: Distribution
    category: string
    colors: ColorMapping
}

function MyPieChart(props: MyPieChartProps) {
    const data = structuredClone(props.data)
    const [chartVisible, setChartVisible] = useState(true)

    let total = 0
    for (const key of Object.keys(data)) {
        total += data[key]
    }
    if (total === 0) {
        total = 1
    }
    for (const key of Object.keys(data)) {
        data[key] = Math.round((data[key] / total) * 1000) / 10
    }

    const minimum = 5
    const chartConfig: Record<string, { label: string; color: string }> = {
        value: { label: 'Percentage', color: 'transparent' },
    }

    let single = ''
    let differents = 0
    let others = 0
    for (const key of Object.keys(data)) {
        if (data[key] < minimum) {
            others += data[key]
            differents += 1
            single = key
        } else {
            chartConfig[key] = {
                label: key,
                color: color(key, props.category, props.colors),
            }
        }
    }

    const chartData = Object.entries(data)
        .filter(([key, value]) => value > minimum)
        .map(([key, value]) => ({
            label: key,
            value,
            fill: chartConfig[key]?.color ?? 'hsl(var(--chart-5))',
        }))
    if (others > 0) {
        const label = differents === 1 ? single : 'Others'
        chartData.push({
            label,
            value: others,
            fill: 'hsl(var(--chart-5))',
        })
        chartConfig[label] = { label, color: 'hsl(var(--chart-5))' }
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
                        formatter={(value: string) => chartConfig[value]?.label}
                    />
                </Pie>
            </PieChart>
        </ChartContainer>
    )

    const table = (
        <ScrollArea className="h-[305px] w-full">
            <Table>
                <TableBody>
                    {Object.entries(props.data)
                        .sort((a, b) => b[1] - a[1])
                        .map(([key, value]) => (
                            <TableRow key={key}>
                                <TableCell>{key}</TableCell>
                                <TableCell className="text-end">{value}</TableCell>
                                <TableCell className="text-end">
                                    {total > 0
                                        ? (
                                              (value /
                                                  Object.values(props.data).reduce(
                                                      (s, n) => s + n,
                                                      0,
                                                  )) *
                                              100
                                          ).toFixed(1)
                                        : 0}
                                    %
                                </TableCell>
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
                <ToggleGroupItem value="pie" aria-label="Pie chart">
                    <ChartPieIcon className="h-4 w-4" />
                </ToggleGroupItem>
                <ToggleGroupItem value="table" aria-label="Table">
                    <TableIcon className="h-4 w-4" />
                </ToggleGroupItem>
            </ToggleGroup>
        </>
    )
}

type MyCardProps = {
    title: string
    children: React.ReactNode
}

function MyCard(props: MyCardProps) {
    return (
        <Card>
            <CardHeader className="p-4">
                <CardTitle>{props.title}</CardTitle>
            </CardHeader>
            <CardContent className="px-2 py-0">{props.children}</CardContent>
        </Card>
    )
}

export default function ProblemStatisticsPage() {
    const { problem_nm } = useParams<{ problem_nm: string }>()
    return (
        <Page
            pageContext={{
                title: `Problem ${problem_nm} – Statistics`,
                menu: 'user',
                current: 'problems',
                subTitle: `Problems ❯ ${problem_nm}`,
                subMenu: 'problems',
                subCurrent: 'statistics',
            }}
        >
            <ProblemStatisticsView />
        </Page>
    )
}

function ProblemStatisticsView() {
    const { problem_nm } = useParams<{ problem_nm: string }>()
    const [statistics, setStatistics] = useState<ProblemStatistics | null>(null)
    const [colors, setColors] = useState<ColorMapping | null>(null)

    useEffect(() => {
        async function fetchData() {
            const [stats, colorMap] = await Promise.all([
                jutge.instructor.problems.getStatistics(problem_nm),
                jutge.misc.getHexColors(),
            ])
            setStatistics(stats)
            setColors(colorMap)
        }
        fetchData()
    }, [problem_nm])

    if (statistics === null || colors === null) {
        return <SimpleSpinner />
    }

    const usersOkKo: Distribution = {
        OK: statistics.users.ok,
        KO: statistics.users.ko,
    }

    const acCount = statistics.verdicts['AC'] ?? 0
    const submissionsTotal = Object.values(statistics.verdicts).reduce((a, b) => a + b, 0)
    const submissionsOkKo: Distribution = {
        OK: acCount,
        KO: submissionsTotal - acCount,
    }

    const heatmapData: HeatmapCalendar = (() => {
        const byDay: Record<string, number> = {}
        for (const s of statistics.submissions) {
            const key = dayjs(s.time).format('YYYY-MM-DD')
            byDay[key] = (byDay[key] ?? 0) + 1
        }
        return Object.entries(byDay).map(([key, value]) => ({
            date: dayjs(key).startOf('day').unix(),
            value,
        }))
    })()

    let maxValue = 0
    for (const item of heatmapData) {
        if (item.value > maxValue) {
            maxValue = item.value
        }
    }

    const heatmapEnd = dayjs().add(1, 'day').startOf('day')
    const heatmapStart =
        statistics.submissions.length > 0
            ? dayjs(statistics.submissions[0].time).startOf('day')
            : dayjs().startOf('day')

    return (
        <div className="flex w-full flex-col gap-4">
            <Card className="w-full">
                <CardHeader className="p-4">
                    <CardTitle>Submissions by day</CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4">
                    <Heatmap
                        data={heatmapData}
                        start={heatmapStart}
                        end={heatmapEnd}
                        maxValue={maxValue}
                    />
                </CardContent>
            </Card>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <MyCard title="User statuses">
                    <MyPieChart data={usersOkKo} category="statuses" colors={colors} />
                </MyCard>
                <MyCard title="Submission statuses">
                    <MyPieChart data={submissionsOkKo} category="statuses" colors={colors} />
                </MyCard>
                <MyCard title="Submissions by verdict">
                    <MyPieChart data={statistics.verdicts} category="verdicts" colors={colors} />
                </MyCard>
            </div>
        </div>
    )
}
