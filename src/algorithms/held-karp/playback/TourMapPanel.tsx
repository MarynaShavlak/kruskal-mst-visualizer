import type { ReactNode } from "react"
import { Panel } from "@/algorithms/shared/playback/Panel"
import {
  activeEdge,
  fmt,
  framePath,
  subsetMembers,
} from "@/algorithms/held-karp/playback/highlight"
import type { HkFrame, HkResult } from "@/lib/heldKarpTrace"
import { useT } from "@/i18n/use-t"
import type { ReadonlyMatrix, TspCity } from "@/lib/tsp"

const VB = 360 // логічний бік viewBox
const PAD = 34
const R = 13 // радіус вузла-міста

const C_START = "#7c3aed" // старт
const C_END = "#d97706" // активний кінець j
const C_NODE = "#475569" // звичайне місто
const C_DIM = "#cbd5e1" // місто поза активною підмножиною
const C_PATH = "#10b981" // ребро маршруту
const C_EDGE = "#f59e0b" // активне ребро, що додаємо

/**
 * Карта міст і поточний маршрут. Координати міст — математичні (джерело правди);
 * сюди вони лягають із ЗБЕРЕЖЕННЯМ пропорцій (однаковий масштаб по осях), бо це
 * геометрична задача — спотворення спотворило б самі відстані. Малюємо шлях
 * поточного кадру (готовий блок / тур-кандидат / оптимальний тур), активне ребро
 * виділяємо, міста поза активною підмножиною — тьмяні.
 */
export function TourMapPanel({
  cities,
  result,
  frame,
  className,
}: {
  cities: readonly TspCity[]
  result: HkResult
  frame: HkFrame
  className?: string
}) {
  const t = useT()
  const n = cities.length
  const xs = cities.map((c) => c.x)
  const ys = cities.map((c) => c.y)
  const minX = Math.min(...xs)
  const maxX = Math.max(...xs)
  const minY = Math.min(...ys)
  const maxY = Math.max(...ys)
  const span = Math.max(maxX - minX, maxY - minY, 1)
  const scale = (VB - 2 * PAD) / span
  const offX = (VB - 2 * PAD - (maxX - minX) * scale) / 2
  const offY = (VB - 2 * PAD - (maxY - minY) * scale) / 2
  const px = (c: TspCity): number => PAD + offX + (c.x - minX) * scale
  const py = (c: TspCity): number => PAD + offY + (c.y - minY) * scale

  const path = framePath(frame, result)
  const edge = activeEdge(frame, result.start)
  const edgeKey = edge ? edgeId(edge[0], edge[1]) : null
  const inSubset =
    frame.subset !== null ? new Set(subsetMembers(frame.subset, n)) : null
  const activeEnd = frame.end

  const segs = path
    ? path.slice(1).map((to, i) => ({ from: path[i], to }))
    : []
  const pathLen = path ? pathLength(path, result.dist) : null
  const isCycle =
    path != null && path.length > 1 && path[0] === path[path.length - 1]

  return (
    <Panel
      title={t("play.hkMapTitle")}
      className={className}
      bodyClassName="p-0"
    >
      <svg
        viewBox={`0 0 ${VB} ${VB}`}
        className="h-full w-full"
        preserveAspectRatio="xMidYMid meet"
      >
        {segs.map((s, i) => {
          const a = cities[s.from]
          const b = cities[s.to]
          const isActive = edgeKey !== null && edgeId(s.from, s.to) === edgeKey
          return (
            <line
              key={i}
              x1={px(a)}
              y1={py(a)}
              x2={px(b)}
              y2={py(b)}
              stroke={isActive ? C_EDGE : C_PATH}
              strokeWidth={isActive ? 3.5 : 2.5}
              strokeLinecap="round"
              opacity={isActive ? 1 : 0.85}
            />
          )
        })}

        {cities.map((c, i) => {
          const isStart = i === result.start
          const isEnd = i === activeEnd
          const dim = inSubset != null && !inSubset.has(i) && !isStart
          const fill = isStart ? C_START : dim ? C_DIM : C_NODE
          return (
            <g key={c.name} opacity={dim ? 0.75 : 1}>
              {isEnd && (
                <circle
                  cx={px(c)}
                  cy={py(c)}
                  r={R + 5}
                  fill="none"
                  stroke={C_END}
                  strokeWidth={3}
                />
              )}
              <circle
                cx={px(c)}
                cy={py(c)}
                r={R}
                fill={fill}
                stroke="#ffffff"
                strokeWidth={2}
              />
              <text
                x={px(c)}
                y={py(c)}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={12}
                fontWeight={600}
                fill="#ffffff"
              >
                {c.name}
              </text>
            </g>
          )
        })}
      </svg>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-t px-3 py-2 text-[11px] text-muted-foreground">
        <Dot color={C_START}>{t("play.legStart")}</Dot>
        <Dot color={C_END} ring>
          {t("play.legEndJ")}
        </Dot>
        <Dot color={C_PATH}>{t("play.legRoute")}</Dot>
        {pathLen != null && (
          <span className="ml-auto tabular-nums">
            {isCycle ? t("play.cycle") : t("play.path")}:{" "}
            <b className="text-foreground">{fmt(pathLen)}</b>
          </span>
        )}
      </div>
    </Panel>
  )
}

function pathLength(path: readonly number[], dist: ReadonlyMatrix): number {
  let total = 0
  for (let i = 0; i < path.length - 1; i++) total += dist[path[i]][path[i + 1]]
  return total
}

/** Невпорядкований ключ ребра (для звірки з активним). */
function edgeId(a: number, b: number): string {
  return a < b ? `${a}|${b}` : `${b}|${a}`
}

function Dot({
  color,
  ring,
  children,
}: {
  color: string
  ring?: boolean
  children: ReactNode
}) {
  return (
    <span className="inline-flex items-center gap-1">
      <span
        className="inline-block size-2.5 rounded-full"
        style={
          ring
            ? { border: `2px solid ${color}` }
            : { background: color }
        }
      />
      {children}
    </span>
  )
}
