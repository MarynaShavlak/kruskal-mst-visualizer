import { Fragment, type ReactNode } from "react"
import { Check } from "lucide-react"
import {
  closingCandidates,
  fmt,
  subsetMembers,
} from "@/algorithms/held-karp/playback/highlight"
import { buildHeldKarpTrace, type HkCell } from "@/lib/heldKarpTrace"
import { tspDemoInstance, TSP_DEMO_CITIES } from "@/lib/exampleTsp"
import { cn } from "@/lib/utils"

// Усі віджети працюють на канонічному демо-інстансі A–E (той самий, що в редакторі
// й плеєрі) — trace проганяється ОДИН раз на завантаження вкладки.
const RUN = buildHeldKarpTrace(tspDemoInstance())
const RESULT = RUN.result
const CITIES = TSP_DEMO_CITIES
const N = RESULT.names.length
const START = RESULT.start

// Палітра — спільна з картою плеєра (TourMapPanel), щоб кольори читались однаково.
const C_START = "#7c3aed"
const C_NODE = "#475569"
const C_DIM = "#cbd5e1"
const C_PATH = "#10b981"

const label = (i: number): string => RESULT.names[i] ?? String(i)
const setLabel = (mask: number): string =>
  `{${subsetMembers(mask, N).map(label).join(", ")}}`
const cellOf = (subset: number, end: number): HkCell | undefined =>
  RESULT.cells.find((c) => c.subset === subset && c.end === end)

/** Обгортка-картка фігури (span-only, валідна всередині markdown-абзацу). */
function FigureBox({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <span className={cn("not-prose my-4 block rounded-lg border bg-card p-3", className)}>
      {children}
    </span>
  )
}

// ── 01. Матриця відстаней ─────────────────────────────────────────────────────

/**
 * Синя теплова шкала (як matplotlib «Blues»): світло-синій = близько, темно-синій
 * = далеко. Фон — суцільний синій (не змішаний з темою), тож текст контрастний і в
 * світлій, і в темній темі: на світлих клітинках — темно-синій, на темних — білий.
 */
function heatBlue(t: number): { bg: string; fg: string } {
  const L = 0.95 - t * 0.5 // 0.95 (мала відстань) → 0.45 (велика)
  return {
    bg: `oklch(${L.toFixed(3)} 0.13 255)`,
    fg: L < 0.66 ? "#ffffff" : "oklch(0.40 0.12 255)",
  }
}

/** Жива теплова карта матриці відстаней демо-міст (евклідова, симетрична). */
export function HkDistanceMatrix() {
  const dist = RESULT.dist
  let max = 0
  for (let r = 0; r < N; r++)
    for (let c = 0; c < N; c++) if (dist[r][c] > max) max = dist[r][c]
  const headCls = "bg-muted/60 px-2 py-1 font-semibold text-muted-foreground"

  return (
    <FigureBox>
      <span className="mb-2 block text-xs text-muted-foreground">
        Відстань між кожною парою міст за теоремою Піфагора. Симетрична, з нулями
        на діагоналі — рахуємо <b>раз</b>, далі алгоритм бере готові значення.
      </span>
      <span className="block overflow-auto">
        <span
          className="grid w-max gap-px text-center tabular-nums"
          style={{ gridTemplateColumns: `auto repeat(${N}, minmax(2.8rem, 1fr))` }}
        >
          <span className={cn(headCls, "text-xs")}>·</span>
          {RESULT.names.map((nm, c) => (
            <span
              key={`c-${nm}`}
              className={cn(headCls, c === START && "text-primary")}
            >
              {nm}
            </span>
          ))}
          {RESULT.names.map((nm, r) => (
            <Fragment key={`r-${nm}`}>
              <span className={cn(headCls, r === START && "text-primary")}>
                {nm}
              </span>
              {dist[r].map((v, c) => {
                if (r === c) {
                  return (
                    <span
                      key={c}
                      className="border border-border/40 px-2 py-1 text-muted-foreground"
                    >
                      0
                    </span>
                  )
                }
                const { bg, fg } = heatBlue(max > 0 ? v / max : 0)
                return (
                  <span
                    key={c}
                    className="border border-white/50 px-2 py-1 font-medium dark:border-black/20"
                    style={{ backgroundColor: bg, color: fg }}
                  >
                    {fmt(v)}
                  </span>
                )
              })}
            </Fragment>
          ))}
        </span>
      </span>
    </FigureBox>
  )
}

// ── 02 / 10. Карта міст (з туром або без) ─────────────────────────────────────

const VB = 320
const PAD = 30
const NR = 13

/**
 * Карта демо-міст. Без `tour` — усі попарні відстані (як «граф міст»); із `tour`
 * — підсвічений замкнений маршрут (оптимальний). Пропорції збережено (масштаб по
 * осях однаковий), бо це геометрична задача.
 */
export function HkCitiesMap({ tour }: { tour?: readonly number[] }) {
  const xs = CITIES.map((c) => c.x)
  const ys = CITIES.map((c) => c.y)
  const minX = Math.min(...xs)
  const maxX = Math.max(...xs)
  const minY = Math.min(...ys)
  const maxY = Math.max(...ys)
  const span = Math.max(maxX - minX, maxY - minY, 1)
  const scale = (VB - 2 * PAD) / span
  const offX = (VB - 2 * PAD - (maxX - minX) * scale) / 2
  const offY = (VB - 2 * PAD - (maxY - minY) * scale) / 2
  const px = (i: number): number => PAD + offX + (CITIES[i].x - minX) * scale
  const py = (i: number): number => PAD + offY + (CITIES[i].y - minY) * scale

  const tourEdges = new Set<string>()
  if (tour) {
    for (let i = 0; i + 1 < tour.length; i++) {
      const a = tour[i]
      const b = tour[i + 1]
      tourEdges.add(a < b ? `${a}|${b}` : `${b}|${a}`)
    }
  }

  // Усі попарні ребра; коли є тур — поза-турові тьмяні.
  const pairs: Array<[number, number]> = []
  for (let i = 0; i < N; i++)
    for (let j = i + 1; j < N; j++) pairs.push([i, j])

  let tourLen = 0
  if (tour)
    for (let i = 0; i + 1 < tour.length; i++)
      tourLen += RESULT.dist[tour[i]][tour[i + 1]]

  return (
    <FigureBox className="p-2">
      <svg
        viewBox={`0 0 ${VB} ${VB}`}
        className={cn(
          "mx-auto block aspect-square w-full",
          // Граф «усі попарні відстані» — удвічі більший: 10 ребер із підписами
          // тісняться, тож йому потрібен простір; маршрут-тур лишаємо компактним.
          tour ? "max-w-[360px]" : "max-w-[600px]",
        )}
        preserveAspectRatio="xMidYMid meet"
      >
        {pairs.map(([i, j]) => {
          const onTour = tourEdges.has(`${i}|${j}`)
          if (tour && !onTour) {
            return (
              <line
                key={`${i}-${j}`}
                x1={px(i)}
                y1={py(i)}
                x2={px(j)}
                y2={py(j)}
                stroke={C_DIM}
                strokeWidth={1}
                opacity={0.4}
              />
            )
          }
          const mx = (px(i) + px(j)) / 2
          const my = (py(i) + py(j)) / 2
          return (
            <g key={`${i}-${j}`}>
              <line
                x1={px(i)}
                y1={py(i)}
                x2={px(j)}
                y2={py(j)}
                stroke={onTour ? C_PATH : "#94a3b8"}
                strokeWidth={onTour ? 3 : 1.4}
                strokeLinecap="round"
                opacity={onTour ? 1 : 0.7}
              />
              <rect
                x={mx - 13}
                y={my - 8}
                width={26}
                height={15}
                rx={4}
                opacity={0.92}
                style={{ fill: "var(--card)" }}
              />
              <text
                x={mx}
                y={my}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={10}
                fontWeight={600}
                style={{ fill: "var(--foreground)" }}
              >
                {fmt(RESULT.dist[i][j])}
              </text>
            </g>
          )
        })}

        {CITIES.map((c, i) => {
          const isStart = i === START
          return (
            <g key={c.name}>
              <circle
                cx={px(i)}
                cy={py(i)}
                r={NR}
                fill={isStart ? C_START : C_NODE}
                stroke="#ffffff"
                strokeWidth={2}
              />
              <text
                x={px(i)}
                y={py(i)}
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
      <span className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
        <Swatch color={C_START}>старт ({label(START)})</Swatch>
        {tour ? (
          <>
            <Swatch color={C_PATH}>оптимальний тур</Swatch>
            <span className="ml-auto tabular-nums">
              довжина: <b className="text-foreground">{fmt(tourLen)}</b>
            </span>
          </>
        ) : (
          <span className="ml-auto">Підписи на ребрах — евклідові відстані.</span>
        )}
      </span>
    </FigureBox>
  )
}

// ── 03–06. Таблиці підзадач за рівнями ────────────────────────────────────────

interface LevelCand {
  readonly k: number
  readonly blockCost: number
  readonly blockPath: readonly number[]
  readonly edge: number
  readonly total: number
  readonly chosen: boolean
}

/** Кандидати комірки dp (перебір передостаннього міста k у min()) — похідне від result. */
function cellCandidates(cell: HkCell): LevelCand[] {
  if (cell.level === 2) {
    return [
      {
        k: START,
        blockCost: 0,
        blockPath: [START],
        edge: cell.cost,
        total: cell.cost,
        chosen: true,
      },
    ]
  }
  const prev = cell.subset ^ (1 << cell.end)
  const preds = subsetMembers(cell.subset, N).filter(
    (k) => k !== START && k !== cell.end,
  )
  return preds.map((k) => {
    const block = cellOf(prev, k)
    const blockCost = block ? block.cost : 0
    const blockPath = block ? block.path : [START]
    const edge = RESULT.dist[k][cell.end]
    return {
      k,
      blockCost,
      blockPath,
      edge,
      total: blockCost + edge,
      chosen: k === cell.bestK,
    }
  })
}

function CandRow({ c }: { c: LevelCand }) {
  // Кольори рядка — точно як у README: обраний WIN_G, відкинутий LOSE_R.
  return (
    <span
      className="flex items-center gap-1.5 text-[11px] tabular-nums"
      style={{ color: c.chosen ? WIN_G : LOSE_R }}
    >
      <span className="font-semibold">{label(c.k)}</span>
      <span>
        {fmt(c.blockCost)} + {fmt(c.edge)} =
      </span>
      <span className="font-semibold">{fmt(c.total)}</span>
      {c.chosen && <Check className="size-3" />}
    </span>
  )
}

// ── Міні-карта підзадачі (стиль matplotlib-фігур README) ──────────────────────

// Точна палітра з генератора фігур `src/tsp_held_karp/visualization.py`:
// кольори вузлів-міст, фонів панелей і ребер беремо 1-в-1.
const CITY_FILL: Record<string, string> = {
  A: "#5F5E5A",
  B: "#854F0B",
  C: "#0C447C",
  D: "#3B6D11",
  E: "#A32D2D",
}
const CITY_OFF = "#D3D1C7" // бліде неактивне місто
const CITY_OFF_LABEL = "#888780"
const ADDED = "#D85A30" // коралове ребро — крок, що додається (фінальне ребро блока)
const WIN_G = "#1C7A30" // обраний кандидат min()
const LOSE_R = "#B3261E" // відкинутий кандидат
const BASE_TXT = "#2E2E2B"

// Фон/акцент панелі: за кінцевим містом (рівень 2), за підмножиною з 3 міст
// (рівні 3–4) або за підмножиною-джерелом із 4 міст (рівень 5 і замикання).
const CITY_BG: Record<string, string> = {
  B: "#EADCC5",
  C: "#C8D9F0",
  D: "#D2E5C2",
  E: "#F2CECE",
}
const SUB3_BG: Record<string, string> = {
  ABC: "#B9D4F2",
  ABD: "#B7E3AC",
  ABE: "#F1E994",
  ACD: "#F8C089",
  ACE: "#F4B6C9",
  ADE: "#D2BCEE",
}
const SUB3_FG: Record<string, string> = {
  ABC: "#245CA6",
  ABD: "#2C8638",
  ABE: "#8A7212",
  ACD: "#C0651A",
  ACE: "#B83258",
  ADE: "#6A40A0",
}
const SUB4_BG: Record<string, string> = {
  ABCD: "#A9D6CE",
  ABCE: "#E2CFA6",
  ABDE: "#BAC6D4",
  ACDE: "#D9BAC8",
}
const SUB4_FG: Record<string, string> = {
  ABCD: "#1F8377",
  ABCE: "#8A6A2E",
  ABDE: "#455C70",
  ACDE: "#8A4A68",
}

/** Канонічний ключ підмножини за відсортованими літерами міст ("ABC"). */
function subsetKey(mask: number): string {
  return subsetMembers(mask, N).map(label).join("")
}

/** Фон і акцент панелі підзадачі — точно за схемою кольорів README. */
function levelPanelColors(
  level: number,
  cell: HkCell,
): { bg: string; accent: string } {
  if (level === 2) {
    const e = label(cell.end)
    return { bg: CITY_BG[e], accent: CITY_FILL[e] }
  }
  if (level === 3) {
    const k = subsetKey(cell.subset)
    return { bg: SUB3_BG[k], accent: SUB3_FG[k] }
  }
  const k = subsetKey(cell.subset ^ (1 << cell.end)) // підмножина-джерело
  return level === 4
    ? { bg: SUB3_BG[k], accent: SUB3_FG[k] }
    : { bg: SUB4_BG[k], accent: SUB4_FG[k] }
}

/** Прямий маршрут одним кольором (рівні 2–3): колір = кінцеве місто. */
function solidEdges(route: readonly number[], color: string): MapEdge[] {
  const out: MapEdge[] = []
  for (let i = 0; i + 1 < route.length; i++)
    out.push({
      from: route[i],
      to: route[i + 1],
      color,
      label: fmt(RESULT.dist[route[i]][route[i + 1]]),
    })
  return out
}

/** Блок-маршрут (рівні 4–5, замикання): блок у кольорі передостаннього міста +
 *  коралове фінальне ребро (крок, що додається). */
function blockEdges(route: readonly number[]): MapEdge[] {
  const blockColor = CITY_FILL[label(route[route.length - 2])]
  const out: MapEdge[] = []
  for (let i = 0; i + 1 < route.length; i++) {
    const final = i + 2 === route.length
    out.push({
      from: route[i],
      to: route[i + 1],
      color: final ? ADDED : blockColor,
      curved: true,
      label: final ? fmt(RESULT.dist[route[i]][route[i + 1]]) : undefined,
    })
  }
  return out
}

// Координатна сітка міні-карти (демо-координати міст лежать у [0..5]).
const M_L = 13
const M_R = 122
const M_T = 9
const M_B = 112
const M_VB = 128
const NODE_R = 6
const AX = [0, 1, 2, 3, 4, 5] as const
const fx = (x: number): number => M_L + (x / 5) * (M_R - M_L)
const fy = (y: number): number => M_B - (y / 5) * (M_B - M_T)

/** Трикутник-стрілка в кінці сегмента (зупиняється трохи перед вузлом). */
function arrowTip(x1: number, y1: number, x2: number, y2: number): string {
  const dx = x2 - x1
  const dy = y2 - y1
  const d = Math.hypot(dx, dy) || 1
  const ux = dx / d
  const uy = dy / d
  const tx = x2 - ux * NODE_R
  const ty = y2 - uy * NODE_R
  const bx = tx - ux * 6
  const by = ty - uy * 6
  const px = -uy * 3.4
  const py = ux * 3.4
  return `${tx},${ty} ${bx + px},${by + py} ${bx - px},${by - py}`
}

interface MapEdge {
  readonly from: number
  readonly to: number
  readonly color: string
  readonly label?: string
  readonly curved?: boolean
}

/** Міні-карта демо-міст: міста у фіксованих кольорах CITY_FILL + напрямлені ребра. */
function MiniMap({
  active,
  edges,
}: {
  active: readonly number[]
  edges: readonly MapEdge[]
}) {
  return (
    <svg viewBox={`0 0 ${M_VB} ${M_VB}`} className="block w-full">
      {/* Нейтральна сітка (як matplotlib grid alpha 0.25). */}
      {AX.map((tk) => (
        <Fragment key={`g-${tk}`}>
          <line x1={fx(tk)} y1={M_T} x2={fx(tk)} y2={M_B} stroke="#9ca3af" strokeWidth={0.4} opacity={0.35} />
          <line x1={M_L} y1={fy(tk)} x2={M_R} y2={fy(tk)} stroke="#9ca3af" strokeWidth={0.4} opacity={0.35} />
          <text x={fx(tk)} y={M_B + 7} textAnchor="middle" fontSize={5} fill="#6b7280">
            {tk}
          </text>
          <text x={M_L - 3} y={fy(tk)} textAnchor="end" dominantBaseline="central" fontSize={5} fill="#6b7280">
            {tk}
          </text>
        </Fragment>
      ))}
      {edges.map((e, i) => {
        const a = CITIES[e.from]
        const b = CITIES[e.to]
        const x1 = fx(a.x)
        const y1 = fy(a.y)
        const x2 = fx(b.x)
        const y2 = fy(b.y)
        const mx = (x1 + x2) / 2
        const my = (y1 + y2) / 2
        const dx = x2 - x1
        const dy = y2 - y1
        const len = Math.hypot(dx, dy) || 1
        const nx = -dy / len
        const ny = dx / len
        let d: string
        let fromX = x1
        let fromY = y1
        let lx = mx + nx * 6
        let ly = my + ny * 6
        if (e.curved) {
          const off = 0.18 * len
          const cx = mx + nx * off
          const cy = my + ny * off
          d = `M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`
          fromX = cx
          fromY = cy
          lx = (mx + cx) / 2
          ly = (my + cy) / 2
        } else {
          d = `M ${x1} ${y1} L ${x2} ${y2}`
        }
        return (
          <Fragment key={`e-${i}`}>
            <path d={d} fill="none" stroke={e.color} strokeWidth={2} strokeLinecap="round" />
            <polygon points={arrowTip(fromX, fromY, x2, y2)} fill={e.color} />
            {e.label && (
              <g>
                <rect x={lx - 9} y={ly - 5} width={18} height={9} rx={2} opacity={0.92} style={{ fill: "#ffffff" }} />
                <text x={lx} y={ly} textAnchor="middle" dominantBaseline="central" fontSize={6} fontWeight={700} fill={e.color}>
                  {e.label}
                </text>
              </g>
            )}
          </Fragment>
        )
      })}
      {CITIES.map((c, i) => {
        const on = active.includes(i)
        return (
          <g key={c.name}>
            <circle
              cx={fx(c.x)}
              cy={fy(c.y)}
              r={on ? NODE_R : 3.4}
              fill={on ? CITY_FILL[c.name] : CITY_OFF}
              stroke="#ffffff"
              strokeWidth={on ? 1.4 : 1}
            />
            <text
              x={fx(c.x)}
              y={fy(c.y)}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={on ? 6.5 : 5}
              fontWeight={700}
              fill={on ? "#ffffff" : CITY_OFF_LABEL}
            >
              {c.name}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

/** Панель однієї підзадачі: фон/акцент панелі + заголовок, формула, міні-карта. */
function SubproblemPanel({
  bg,
  accent,
  badge,
  title,
  subtitle,
  active,
  edges,
  chosen,
  children,
}: {
  bg: string
  accent: string
  badge?: string
  title: ReactNode
  subtitle?: ReactNode
  active: readonly number[]
  edges: readonly MapEdge[]
  chosen?: boolean
  children?: ReactNode
}) {
  return (
    <span
      className={cn(
        "relative block overflow-hidden rounded-lg border p-2",
        chosen && "ring-2 ring-emerald-700/70",
      )}
      style={{
        backgroundColor: bg,
        borderColor: `color-mix(in oklch, ${accent} 40%, transparent)`,
      }}
    >
      {badge && (
        <span
          className="absolute left-1.5 top-1.5 z-10 rounded px-1 py-px text-[9px] font-bold leading-none text-white"
          style={{ backgroundColor: accent }}
        >
          {badge}
        </span>
      )}
      <span
        className="mb-0.5 block text-center font-mono text-[11px] font-semibold"
        style={{ color: accent }}
      >
        {title}
      </span>
      {subtitle && (
        <span
          className="mb-1 block text-center text-[10px] tabular-nums"
          style={{ color: BASE_TXT }}
        >
          {subtitle}
        </span>
      )}
      <MiniMap active={active} edges={edges} />
      {children}
    </span>
  )
}

/** Усі комірки dp заданого рівня r як міні-графіки (2 — база, 3..n — нарощування). */
export function HkLevelTable({ level }: { level: number }) {
  const cells = RESULT.cells.filter((c) => c.level === level)
  const intro: Record<number, string> = {
    2: "База: найкоротший шлях через дві вершини — пряме ребро зі старту. Колір панелі та ребра = кінцеве місто.",
    3: "Рівень 3: для кожної трійки міст і кінця беремо єдиний передостанній блок рівня 2. Колір панелі = підмножина, колір маршруту = кінцеве місто.",
    4: "Рівень 4: блок успадковує колір передостаннього міста, коралове ребро — крок, що додається. Зелене = обраний кандидат min(), червоне — відкинутий. Колір панелі = підмножина-джерело.",
    5: "Рівень 5 (усі міста): аналогічно рівню 4, але підмножина-джерело має 4 міста. Зелене — обраний кандидат, червоне — відкинуті.",
  }
  const cols = level === 5 ? "sm:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-4"
  return (
    <FigureBox>
      <span className="mb-2 block text-xs text-muted-foreground">
        {intro[level] ?? `Рівень ${level}.`} Усього {cells.length} підзадач.
      </span>
      <span className={cn("grid gap-2", cols)}>
        {cells.map((cell, i) => {
          const { bg, accent } = levelPanelColors(level, cell)
          const cands = cellCandidates(cell)
          // Рівні 2–3 — прямий маршрут у кольорі кінцевого міста; рівні 4–5 —
          // блок-маршрут (колір передостаннього міста) + коралове фінальне ребро.
          const edges =
            level <= 3
              ? solidEdges(cell.path, CITY_FILL[label(cell.end)])
              : blockEdges(cell.path)
          return (
            <SubproblemPanel
              key={`${cell.subset}-${cell.end}`}
              bg={bg}
              accent={accent}
              badge={String(i + 1)}
              title={
                <>
                  {setLabel(cell.subset)} → {label(cell.end)}
                </>
              }
              subtitle={
                level === 2 ? (
                  <>
                    {label(START)} → {label(cell.end)} = {fmt(cell.cost)}
                  </>
                ) : (
                  <>min = {fmt(cell.cost)}</>
                )
              }
              active={subsetMembers(cell.subset, N)}
              edges={edges}
            >
              {level >= 3 && (
                <span className="mt-1 flex flex-col gap-0.5">
                  {cands.map((cd) => (
                    <CandRow key={cd.k} c={cd} />
                  ))}
                </span>
              )}
            </SubproblemPanel>
          )
        })}
      </span>
    </FigureBox>
  )
}

// ── 07. Замикання ─────────────────────────────────────────────────────────────

/** Замикання як міні-графіки: повний шлях рівня 5 + ребро назад у старт; ✓ — оптимум. */
export function HkClosingTable() {
  const cands = closingCandidates(RESULT)
  const full = (1 << N) - 1
  return (
    <FigureBox>
      <span className="mb-2 block text-xs text-muted-foreground">
        Замикання: до кожного шляху через <b>усі</b> міста додаємо ребро назад у
        старт ({label(START)}) і беремо найкоротший цикл. ✓ — оптимальний тур.
      </span>
      <span className="grid gap-2 sm:grid-cols-2">
        {cands.map((c) => {
          const cell = cellOf(full, c.j)
          const chosen = Math.abs(c.total - RESULT.cost) < 1e-9
          const tour = cell ? [...cell.path, START] : [c.j, START]
          const k = subsetKey(full ^ (1 << c.j)) // підмножина-джерело з 4 міст
          return (
            <SubproblemPanel
              key={c.j}
              bg={SUB4_BG[k]}
              accent={SUB4_FG[k]}
              badge={chosen ? "✓" : undefined}
              chosen={chosen}
              title={<>повний тур через {label(c.j)}</>}
              subtitle={
                <>
                  {fmt(c.blockCost)} + {fmt(c.edge)} ={" "}
                  <b style={{ color: chosen ? WIN_G : BASE_TXT }}>
                    {fmt(c.total)}
                  </b>
                </>
              }
              active={subsetMembers(full, N)}
              edges={blockEdges(tour)}
            />
          )
        })}
      </span>
    </FigureBox>
  )
}

// ── 08. Перебір vs ДП ─────────────────────────────────────────────────────────

/** Концептуальне порівняння: перебір рахує спільний початок знову; ДП — раз. */
export function HkBruteVsDp() {
  const acC = cellOf((1 << START) | (1 << 2), 2) // блок {A, C} → C
  const routes = factorial(N - 1) // повних маршрутів зі старту
  return (
    <FigureBox>
      <span className="grid gap-3 sm:grid-cols-2">
        <span className="block rounded-md border border-rose-500/40 bg-rose-500/5 p-3">
          <span className="mb-1 block text-xs font-semibold text-rose-700 dark:text-rose-300">
            Перебір: спільний початок рахується знову
          </span>
          <span className="block text-[11px] text-muted-foreground">
            Усі <b>{routes}</b> маршрути зі старту мають спільні початки (напр.{" "}
            <span className="font-mono">{label(START)} → C</span>), і кожен такий
            сегмент сумується <b>наново</b> в кожному маршруті — зайва робота.
          </span>
        </span>
        <span className="block rounded-md border border-emerald-500/40 bg-emerald-500/5 p-3">
          <span className="mb-1 block text-xs font-semibold text-emerald-700 dark:text-emerald-300">
            ДП: блок рахується раз → багато підстановок
          </span>
          <span className="block text-[11px] text-muted-foreground">
            Блок{" "}
            <span className="font-mono">
              {setLabel((1 << START) | (1 << 2))} → C
            </span>{" "}
            {acC && <>= {fmt(acC.cost)} </>}обчислюється <b>раз</b>, а далі
            підставляється у три комірки рівня 3 ({setLabel((1 << START) | (1 << 1) | (1 << 2))}→B,{" "}
            {setLabel((1 << START) | (1 << 2) | (1 << 3))}→D,{" "}
            {setLabel((1 << START) | (1 << 2) | (1 << 4))}→E).
          </span>
        </span>
      </span>
    </FigureBox>
  )
}

// ── 09. Перевикористання блоків ───────────────────────────────────────────────

interface LevelReuse {
  readonly level: number
  readonly blocks: number
  readonly reuse: number
  readonly dest: string
}

function blockReuse(): {
  perLevel: LevelReuse[]
  reads: number
  subproblems: number
} {
  const full = (1 << N) - 1
  const uses = new Map<number, number>()
  const bump = (subset: number, end: number): void => {
    const k = subset * N + end
    uses.set(k, (uses.get(k) ?? 0) + 1)
  }
  for (const cell of RESULT.cells) {
    if (cell.level < 3) continue
    const prev = cell.subset ^ (1 << cell.end)
    for (const k of subsetMembers(prev, N)) if (k !== START) bump(prev, k)
  }
  for (const j of subsetMembers(full, N)) if (j !== START) bump(full, j)

  const perLevel: LevelReuse[] = []
  for (let r = 2; r <= N; r++) {
    const blocks = RESULT.cells.filter((c) => c.level === r)
    if (blocks.length === 0) continue
    const counts = blocks.map((b) => uses.get(b.subset * N + b.end) ?? 0)
    perLevel.push({
      level: r,
      blocks: blocks.length,
      reuse: Math.min(...counts),
      dest: r === N ? "замикання" : `рівень ${r + 1}`,
    })
  }
  let reads = 0
  for (const v of uses.values()) reads += v
  return { perLevel, reads, subproblems: RESULT.cells.length }
}

/** Скільки разів використовується кожен готовий блок — за рівнями. */
export function HkBlockReuse() {
  const { perLevel, reads, subproblems } = blockReuse()
  const maxReuse = Math.max(...perLevel.map((l) => l.reuse), 1)
  const colors = ["#245CA6", "#2C8638", "#C0651A", "#8A4A68"]
  return (
    <FigureBox>
      <span className="mb-2 block text-xs text-muted-foreground">
        Кожна підзадача рахується <b>раз</b>, а нижні рівні (фундамент)
        використовуються найчастіше — звідси й економія проти перебору.
      </span>
      <span className="flex flex-col gap-1.5">
        {perLevel.map((l, i) => (
          <span key={l.level} className="flex items-center gap-2 text-xs">
            <span className="w-16 shrink-0 text-muted-foreground">
              Рівень {l.level}
            </span>
            <span className="flex h-5 flex-1 items-center">
              <span
                className="flex h-full items-center justify-end rounded-sm px-1.5 font-semibold text-white tabular-nums"
                style={{
                  width: `${(l.reuse / maxReuse) * 100}%`,
                  minWidth: "2.2rem",
                  backgroundColor: colors[i % colors.length],
                }}
              >
                {l.reuse}×
              </span>
            </span>
            <span className="w-32 shrink-0 text-right text-[11px] text-muted-foreground">
              {l.blocks} бл. → {l.dest}
            </span>
          </span>
        ))}
      </span>
      <span className="mt-2 block border-t pt-2 text-[11px] text-muted-foreground">
        Підсумок (n = {N}): <b>{subproblems}</b> підзадач, кожна порахована раз;{" "}
        <b>{reads}</b> звернень до готових блоків. Перебір натомість пройшов би{" "}
        <b>{factorial(N - 1)}</b> повних маршрутів, рахуючи спільні початки наново.
      </span>
    </FigureBox>
  )
}

// ── 11. Зростання складності ──────────────────────────────────────────────────

function factorial(k: number): number {
  let f = 1
  for (let i = 2; i <= k; i++) f *= i
  return f
}

const EXP = (x: number): string => {
  if (x < 1000) return String(Math.round(x))
  const e = x.toExponential(1)
  const [m, p] = e.split("e")
  return `${m}·10${supDigits(Number(p))}`
}
const SUP = "⁰¹²³⁴⁵⁶⁷⁸⁹"
const supDigits = (p: number): string =>
  String(p)
    .split("")
    .map((d) => (d === "-" ? "⁻" : SUP[Number(d)]))
    .join("")

/** Порівняння зростання: перебір O(n!) проти Хелда–Карпа O(n²·2ⁿ). */
export function HkComplexityGrowth() {
  const ns = [5, 8, 10, 15, 20]
  const rows = ns.map((n) => ({
    n,
    brute: factorial(n),
    dp: n * n * 2 ** n,
  }))
  const headCls = "px-2 py-1 text-left font-semibold text-muted-foreground"
  return (
    <FigureBox>
      <span className="mb-2 block text-xs text-muted-foreground">
        Обидва методи точні, але обсяг роботи росте кардинально по-різному:
        перебір — як <span className="font-mono">n!</span>, Хелда–Карпа — як{" "}
        <span className="font-mono">n²·2ⁿ</span>.
      </span>
      <span className="block overflow-auto">
        <span
          className="grid w-max gap-px text-sm tabular-nums"
          style={{ gridTemplateColumns: "auto auto auto auto" }}
        >
          <span className={headCls}>n</span>
          <span className={cn(headCls, "text-rose-600 dark:text-rose-400")}>
            перебір ≈ n!
          </span>
          <span className={cn(headCls, "text-emerald-700 dark:text-emerald-300")}>
            Хелда–Карпа ≈ n²·2ⁿ
          </span>
          <span className={headCls}>виграш</span>
          {rows.map((r) => (
            <Fragment key={r.n}>
              <span className="border-t px-2 py-1 font-semibold">{r.n}</span>
              <span className="border-t px-2 py-1 text-rose-600 dark:text-rose-400">
                {EXP(r.brute)}
              </span>
              <span className="border-t px-2 py-1 text-emerald-700 dark:text-emerald-300">
                {EXP(r.dp)}
              </span>
              <span className="border-t px-2 py-1 text-muted-foreground">
                {r.brute < r.dp ? "—" : `×${EXP(r.brute / r.dp)}`}
              </span>
            </Fragment>
          ))}
        </span>
      </span>
    </FigureBox>
  )
}

// ── Спільне ───────────────────────────────────────────────────────────────────

function Swatch({ color, children }: { color: string; children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1">
      <span
        className="inline-block size-2.5 rounded-full"
        style={{ background: color }}
      />
      {children}
    </span>
  )
}
