'use client'

/**
 * Problem statistics page: pie charts (users, submissions, verdicts, compilers, languages),
 * submission heatmap by day, and stacked OK/KO bar charts by year, month, weekday, and hour.
 */

import { Heatmap } from '@/components/Heatmap'
import { ChartPieIcon, TableIcon } from 'lucide-react'
import dayjs from 'dayjs'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Bar, BarChart, CartesianGrid, LabelList, Pie, PieChart, XAxis, YAxis } from 'recharts'
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

// -----------------------------------------------------------------------------
// Constants
// -----------------------------------------------------------------------------

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const
const MONTHS = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
] as const
/** Pie chart: slices below this percentage are grouped into "Others". */
const MIN_PERCENT_FOR_PIE_LABEL = 5

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

function getCategoryColor(key: string, category: string, colors: ColorMapping): string {
    if (!(category in colors) || !(key in colors[category])) {
        return 'hsl(var(--chart-1))'
    }
    return colors[category][key]
}

type OkKoPoint = { label: string; ok: number; ko: number }

function deriveChartData(statistics: ProblemStatistics) {
    const isOk = (verdict: string) => verdict === 'AC'

    const byDay: Record<string, number> = {}
    for (const s of statistics.submissions) {
        const key = dayjs(s.time).format('YYYY-MM-DD')
        byDay[key] = (byDay[key] ?? 0) + 1
    }
    const heatmapData: HeatmapCalendar = Object.entries(byDay).map(([key, value]) => ({
        date: dayjs(key).startOf('day').unix(),
        value,
    }))
    const maxValue = heatmapData.length ? Math.max(...heatmapData.map((d) => d.value)) : 0
    const heatmapEnd = dayjs().add(1, 'day').startOf('day')
    const heatmapStart =
        statistics.submissions.length > 0
            ? dayjs(statistics.submissions[0].time).startOf('day')
            : dayjs().startOf('day')

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

    const byYear: Record<string, { ok: number; ko: number }> = {}
    for (const s of statistics.submissions) {
        const y = dayjs(s.time).year().toString()
        if (!byYear[y]) byYear[y] = { ok: 0, ko: 0 }
        if (isOk(s.verdict)) byYear[y].ok += 1
        else byYear[y].ko += 1
    }
    const submissionsByYear: OkKoPoint[] = Object.entries(byYear)
        .sort(([a], [b]) => Number(a) - Number(b))
        .map(([label, counts]) => ({ label, ok: counts.ok, ko: counts.ko }))

    const byDow: Record<number, { ok: number; ko: number }> = {}
    for (let i = 0; i < 7; i++) byDow[i] = { ok: 0, ko: 0 }
    for (const s of statistics.submissions) {
        const d = dayjs(s.time).day()
        const idx = (d + 6) % 7 // Sunday=0 → index 6 (last); Monday=0 (first)
        if (isOk(s.verdict)) byDow[idx].ok += 1
        else byDow[idx].ko += 1
    }
    const submissionsByWeekday: OkKoPoint[] = WEEKDAYS.map((label, i) => ({
        label,
        ok: byDow[i].ok,
        ko: byDow[i].ko,
    }))

    const byHour: Record<number, { ok: number; ko: number }> = {}
    for (let h = 0; h < 24; h++) byHour[h] = { ok: 0, ko: 0 }
    for (const s of statistics.submissions) {
        const h = dayjs(s.time).hour()
        if (isOk(s.verdict)) byHour[h].ok += 1
        else byHour[h].ko += 1
    }
    const submissionsByHour: OkKoPoint[] = Array.from({ length: 24 }, (_, h) => ({
        label: h.toString(),
        ok: byHour[h].ok,
        ko: byHour[h].ko,
    }))

    const byMonth: Record<number, { ok: number; ko: number }> = {}
    for (let m = 0; m < 12; m++) byMonth[m] = { ok: 0, ko: 0 }
    for (const s of statistics.submissions) {
        const m = dayjs(s.time).month()
        if (isOk(s.verdict)) byMonth[m].ok += 1
        else byMonth[m].ko += 1
    }
    const submissionsByMonth: OkKoPoint[] = MONTHS.map((label, i) => ({
        label,
        ok: byMonth[i].ok,
        ko: byMonth[i].ko,
    }))

    return {
        heatmapData,
        heatmapStart,
        heatmapEnd,
        maxValue,
        usersOkKo,
        submissionsOkKo,
        submissionsByYear,
        submissionsByWeekday,
        submissionsByHour,
        submissionsByMonth,
    }
}

// -----------------------------------------------------------------------------
// Chart components
// -----------------------------------------------------------------------------

type MyPieChartProps = {
    data: Distribution
    category: string
    colors: ColorMapping
}

/** Pie/table toggle; small slices (< MIN_PERCENT_FOR_PIE_LABEL) are grouped as "Others". */
function MyPieChart({ data, category, colors }: MyPieChartProps) {
    const [chartVisible, setChartVisible] = useState(true)
    const dataClone = structuredClone(data)
    const total = Math.max(
        1,
        Object.values(dataClone).reduce((a, b) => a + b, 0),
    )
    for (const key of Object.keys(dataClone)) {
        dataClone[key] = Math.round((dataClone[key] / total) * 1000) / 10
    }

    const chartConfig: Record<string, { label: string; color: string }> = {
        value: { label: 'Percentage', color: 'transparent' },
    }
    let othersSum = 0
    let othersCount = 0
    let singleKey = ''
    for (const key of Object.keys(dataClone)) {
        if (dataClone[key] < MIN_PERCENT_FOR_PIE_LABEL) {
            othersSum += dataClone[key]
            othersCount += 1
            singleKey = key
        } else {
            chartConfig[key] = {
                label: key,
                color: getCategoryColor(key, category, colors),
            }
        }
    }

    const chartData = Object.entries(dataClone)
        .filter(([, value]) => value >= MIN_PERCENT_FOR_PIE_LABEL)
        .map(([key, value]) => ({
            label: key,
            value,
            fill: chartConfig[key]?.color ?? 'hsl(var(--chart-5))',
        }))
    if (othersSum > 0) {
        const label = othersCount === 1 ? singleKey : 'Others'
        chartData.push({
            label,
            value: othersSum,
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

    const tableTotal = Object.values(data).reduce((s, n) => s + n, 0)
    const table = (
        <ScrollArea className="h-[305px] w-full">
            <Table>
                <TableBody>
                    {Object.entries(data)
                        .sort((a, b) => b[1] - a[1])
                        .map(([key, value]) => (
                            <TableRow key={key}>
                                <TableCell>{key}</TableCell>
                                <TableCell className="text-end">{value}</TableCell>
                                <TableCell className="text-end">
                                    {tableTotal > 0
                                        ? ((value / tableTotal) * 100).toFixed(1)
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

function StatCard({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <Card>
            <CardHeader className="p-4">
                <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent className="px-2 py-0">{children}</CardContent>
        </Card>
    )
}

type StackedOkKoBarChartProps = {
    data: OkKoPoint[]
    colors: ColorMapping
}

function StackedOkKoBarChart({ data, colors }: StackedOkKoBarChartProps) {
    const chartConfig = {
        ok: { label: 'OK', color: getCategoryColor('OK', 'statuses', colors) },
        ko: { label: 'KO', color: getCategoryColor('KO', 'statuses', colors) },
    }
    return (
        <ChartContainer config={chartConfig} className="h-[260px] w-full">
            <BarChart data={data} margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="label" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="ko" fill="var(--color-ko)" radius={[0, 0, 4, 4]} stackId="a" />
                <Bar dataKey="ok" fill="var(--color-ok)" radius={[4, 4, 0, 0]} stackId="a" />
            </BarChart>
        </ChartContainer>
    )
}

// -----------------------------------------------------------------------------
// Page
// -----------------------------------------------------------------------------

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

    const derived = deriveChartData(statistics)

    return (
        <div className="flex w-full flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
                <StatCard title="User statuses">
                    <MyPieChart data={derived.usersOkKo} category="statuses" colors={colors} />
                </StatCard>
                <StatCard title="Submission statuses">
                    <MyPieChart data={derived.submissionsOkKo} category="statuses" colors={colors} />
                </StatCard>
                <StatCard title="Submissions by verdict">
                    <MyPieChart data={statistics.verdicts} category="verdicts" colors={colors} />
                </StatCard>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
                <StatCard title="Compilers">
                    <MyPieChart data={statistics.compilers} category="compilers" colors={colors} />
                </StatCard>
                <StatCard title="Programming languages">
                    <MyPieChart data={statistics.proglangs} category="proglangs" colors={colors} />
                </StatCard>
            </div>
            <Card className="w-full">
                <CardHeader className="p-4">
                    <CardTitle>Submissions by day</CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4">
                    <Heatmap
                        data={derived.heatmapData}
                        start={derived.heatmapStart}
                        end={derived.heatmapEnd}
                        maxValue={derived.maxValue}
                    />
                </CardContent>
            </Card>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <StatCard title="Submissions by year">
                    <StackedOkKoBarChart data={derived.submissionsByYear} colors={colors} />
                </StatCard>
                <StatCard title="Submissions by month of year">
                    <StackedOkKoBarChart data={derived.submissionsByMonth} colors={colors} />
                </StatCard>
                <StatCard title="Submissions by day of week">
                    <StackedOkKoBarChart data={derived.submissionsByWeekday} colors={colors} />
                </StatCard>
                <StatCard title="Submissions by hour of day">
                    <StackedOkKoBarChart data={derived.submissionsByHour} colors={colors} />
                </StatCard>
            </div>
        </div>
    )
}
