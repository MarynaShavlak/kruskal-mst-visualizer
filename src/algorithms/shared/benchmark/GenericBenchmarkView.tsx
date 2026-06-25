import { Play, RotateCcw } from "lucide-react"
import { useMemo, useState } from "react"
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ModeSwitch } from "@/algorithms/shared/playback/ModeSwitch"
import { useGenericBenchmark } from "@/algorithms/shared/benchmark/use-benchmark"
import type { Benchmarkable, SeriesPoint } from "@/lib/benchmark-descriptor"
import { theoreticalAt } from "@/lib/complexityBounds"
import { useT } from "@/i18n/use-t"
import { useLangStore } from "@/store/lang-store"
import { useThemeStore } from "@/store/theme-store"

type Metric = "ms" | "ops"

// Узагальнений екран бенчмарку: читає серії/осі/підписи з дескриптора
// `Benchmarkable`, малює лінії за `series`, перемикає метрику час⇄операції й
// (за наявності) накладає anchor-scaled теоретичну криву-орієнтир. Тайм рахує
// спільний воркер; форма/підписи специфічні лише через дескриптор.
export function GenericBenchmarkView({ descriptor }: { descriptor: Benchmarkable }) {
  const { points, running, run } = useGenericBenchmark(descriptor.id)
  const isDark = useThemeStore((s) => s.isDark)
  const lang = useLangStore((s) => s.lang)
  const t = useT()
  const [metric, setMetric] = useState<Metric>("ms")

  const axisColor = isDark ? "#94a3b8" : "#475569"
  const gridColor = isDark ? "#334155" : "#e2e8f0"
  const started = points.length > 0 || running

  const hasOps = descriptor.series.some((s) => s.hasOps)
  const suffix = metric === "ms" ? "Ms" : "Ops"

  // Накладаємо теоретичні криві-орієнтири (anchor — остання виміряна точка серії).
  const chartData = useMemo(() => {
    if (points.length === 0) return points as SeriesPoint[]
    const last = points[points.length - 1] as SeriesPoint
    const anchorN = last.size
    const theo = descriptor.series
      .filter((s) => s.theoretical)
      .map((s) => ({
        id: s.id,
        kind: s.theoretical!,
        anchorValue: last[`${s.id}${suffix}`] ?? 0,
      }))
    return points.map((p) => {
      const row: Record<string, number> = { ...p }
      for (const s of theo) {
        row[`${s.id}Theo`] = theoreticalAt(s.kind, p.size, anchorN, s.anchorValue)
      }
      return row as SeriesPoint
    })
  }, [points, descriptor.series, suffix])

  const metricOptions = [
    { key: "ms" as const, label: t("bench.metricMs") },
    { key: "ops" as const, label: t("bench.metricOps") },
  ]

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle>{descriptor.title[lang]}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <p className="text-muted-foreground">
            {descriptor.intro[lang]}
            <b>Web Worker</b>
            {t("bench.introPost")}
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <Button onClick={() => run()} disabled={running}>
              {started ? <RotateCcw /> : <Play />}
              {running
                ? t("bench.running")
                : started
                  ? t("bench.restart")
                  : t("bench.run")}
            </Button>
            {hasOps && (
              <ModeSwitch<Metric>
                label={t("bench.metricLabel")}
                value={metric}
                onChange={setMetric}
                options={metricOptions}
              />
            )}
          </div>

          <div className="h-[360px] w-full">
            {started ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={chartData}
                  margin={{ top: 12, right: 24, bottom: 18, left: 4 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                  <XAxis
                    dataKey="size"
                    tick={{ fontSize: 12, fill: axisColor }}
                    stroke={axisColor}
                    label={{
                      value: descriptor.xLabel[lang],
                      position: "insideBottom",
                      offset: -10,
                      fill: axisColor,
                    }}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: axisColor }}
                    stroke={axisColor}
                    label={{
                      value: metric === "ms" ? t("bench.axisMs") : t("bench.axisOps"),
                      angle: -90,
                      position: "insideLeft",
                      fill: axisColor,
                    }}
                  />
                  <Tooltip
                    contentStyle={
                      isDark
                        ? {
                            background: "#1e293b",
                            border: "1px solid #334155",
                            color: "#e2e8f0",
                          }
                        : undefined
                    }
                    labelStyle={isDark ? { color: "#e2e8f0" } : undefined}
                  />
                  <Legend
                    formatter={(value) => (
                      <span style={{ color: axisColor }}>{value}</span>
                    )}
                  />
                  {descriptor.series.map((s) => (
                    <Line
                      key={s.id}
                      type="monotone"
                      dataKey={`${s.id}${suffix}`}
                      name={s.name[lang]}
                      stroke={s.color}
                      strokeWidth={2}
                      dot={false}
                      isAnimationActive={false}
                    />
                  ))}
                  {descriptor.series
                    .filter((s) => s.theoretical)
                    .map((s) => (
                      <Line
                        key={`${s.id}Theo`}
                        type="monotone"
                        dataKey={`${s.id}Theo`}
                        name={`${s.name[lang]} · ${t("bench.theoretical")}`}
                        stroke={s.color}
                        strokeWidth={1}
                        strokeDasharray="4 4"
                        dot={false}
                        isAnimationActive={false}
                        legendType="line"
                      />
                    ))}
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center rounded-lg border border-dashed text-muted-foreground">
                {t("bench.empty")}
              </div>
            )}
          </div>

          {points.length > 0 && (
            <div className="overflow-auto">
              <table className="w-full text-sm">
                <thead className="text-xs text-muted-foreground">
                  <tr>
                    <th className="px-2 py-1 text-left font-medium">
                      {descriptor.xLabel[lang]}
                    </th>
                    {descriptor.series.map((s) => (
                      <th
                        key={s.id}
                        className="px-2 py-1 text-right font-medium"
                      >
                        {s.name[lang]}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {points.map((p) => (
                    <tr key={p.size} className="border-t">
                      <td className="px-2 py-1">{p.size}</td>
                      {descriptor.series.map((s) => {
                        const v = p[`${s.id}${suffix}`]
                        return (
                          <td
                            key={s.id}
                            className="px-2 py-1 text-right tabular-nums"
                          >
                            {v === undefined
                              ? "—"
                              : metric === "ms"
                                ? v.toFixed(2)
                                : v.toLocaleString()}
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
