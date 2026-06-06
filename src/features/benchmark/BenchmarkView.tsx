import { Play, RotateCcw } from "lucide-react"
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
import { useBenchmark } from "@/features/benchmark/use-benchmark"
import { useThemeStore } from "@/store/theme-store"

export function BenchmarkView() {
  const { points, running, run } = useBenchmark()
  const isDark = useThemeStore((s) => s.isDark)
  const axisColor = isDark ? "#94a3b8" : "#475569"
  const gridColor = isDark ? "#334155" : "#e2e8f0"
  const started = points.length > 0 || running

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Бенчмарк: DSU проти наївної (has-path)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <p className="text-muted-foreground">
            Обидві реалізації дають однакову МОД, але час росте по-різному: DSU —
            майже лінійно за розміром графа, наївна (BFS у допоміжному лісі) —
            значно швидше. Обчислення виконуються у <b>Web Worker</b>, тож
            інтерфейс не блокується.
          </p>

          <Button onClick={() => run()} disabled={running}>
            {started ? <RotateCcw /> : <Play />}
            {running ? "Рахуємо…" : started ? "Перезапустити" : "Запустити бенчмарк"}
          </Button>

          <div className="h-[360px] w-full">
            {started ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={points}
                  margin={{ top: 12, right: 24, bottom: 18, left: 4 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                  <XAxis
                    dataKey="size"
                    tick={{ fontSize: 12, fill: axisColor }}
                    stroke={axisColor}
                    label={{
                      value: "вершини",
                      position: "insideBottom",
                      offset: -10,
                      fill: axisColor,
                    }}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: axisColor }}
                    stroke={axisColor}
                    label={{
                      value: "мс",
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
                  <Line
                    type="monotone"
                    dataKey="hasPathMs"
                    name="наївна (has-path)"
                    stroke="#dc2626"
                    strokeWidth={2}
                    dot={false}
                    isAnimationActive={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="dsuMs"
                    name="DSU"
                    stroke="#16a34a"
                    strokeWidth={2}
                    dot={false}
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center rounded-lg border border-dashed text-muted-foreground">
                Натисніть «Запустити бенчмарк»
              </div>
            )}
          </div>

          {points.length > 0 && (
            <div className="overflow-auto">
              <table className="w-full text-sm">
                <thead className="text-xs text-muted-foreground">
                  <tr>
                    <th className="px-2 py-1 text-left font-medium">Вершини</th>
                    <th className="px-2 py-1 text-right font-medium">Ребра</th>
                    <th className="px-2 py-1 text-right font-medium">DSU, мс</th>
                    <th className="px-2 py-1 text-right font-medium">has-path, мс</th>
                    <th className="px-2 py-1 text-right font-medium">Прискорення</th>
                  </tr>
                </thead>
                <tbody>
                  {points.map((p) => (
                    <tr key={p.size} className="border-t">
                      <td className="px-2 py-1">{p.size}</td>
                      <td className="px-2 py-1 text-right tabular-nums">{p.edges}</td>
                      <td className="px-2 py-1 text-right tabular-nums">
                        {p.dsuMs.toFixed(2)}
                      </td>
                      <td className="px-2 py-1 text-right tabular-nums">
                        {p.hasPathMs.toFixed(2)}
                      </td>
                      <td className="px-2 py-1 text-right font-medium tabular-nums">
                        {(p.hasPathMs / Math.max(p.dsuMs, 0.001)).toFixed(1)}×
                      </td>
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
