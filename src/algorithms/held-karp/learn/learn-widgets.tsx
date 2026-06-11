import { Fragment, type ReactNode } from "react"
import { Check } from "lucide-react"
import {
  closingCandidates,
  fmt,
  subsetMembers,
} from "@/algorithms/held-karp/playback/highlight"
import { buildHeldKarpTrace, type HkCell } from "@/lib/heldKarpTrace"
import { tspDemoInstance, TSP_DEMO_CITIES } from "@/lib/exampleTsp"
import { setHash } from "@/hooks/use-route"
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
const pathLabel = (path: readonly number[]): string => path.map(label).join(" → ")
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
                const pct = max > 0 ? Math.round((v / max) * 70) : 0
                return (
                  <span
                    key={c}
                    className={cn(
                      "border border-border/40 px-2 py-1",
                      r === c && "text-muted-foreground",
                    )}
                    style={
                      r === c
                        ? undefined
                        : {
                            backgroundColor: `color-mix(in oklch, var(--primary) ${pct}%, transparent)`,
                          }
                    }
                  >
                    {r === c ? "0" : fmt(v)}
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
        className="h-[300px] w-full"
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
  return (
    <span
      className={cn(
        "flex items-center gap-1.5 rounded px-1.5 py-0.5 text-[11px] tabular-nums",
        c.chosen
          ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
          : "text-rose-600/90 dark:text-rose-400/80",
      )}
    >
      <span className="font-semibold">{label(c.k)}</span>
      <span className="text-muted-foreground">
        {fmt(c.blockCost)} + {fmt(c.edge)} =
      </span>
      <span className="font-semibold">{fmt(c.total)}</span>
      {c.chosen && <Check className="size-3" />}
    </span>
  )
}

function CellCard({ cell }: { cell: HkCell }) {
  const cands = cellCandidates(cell)
  return (
    <span className="block rounded-md border bg-background p-2">
      <span className="mb-1 flex flex-wrap items-baseline gap-1 text-xs">
        <span className="rounded bg-muted px-1.5 py-0.5 font-mono font-semibold">
          {setLabel(cell.subset)}
        </span>
        <span className="text-muted-foreground">→ {label(cell.end)}</span>
        <span className="ml-auto font-semibold tabular-nums text-emerald-700 dark:text-emerald-300">
          {fmt(cell.cost)}
        </span>
      </span>
      {cell.level === 2 ? (
        <span className="block text-[11px] text-muted-foreground">
          пряме ребро {pathLabel(cell.path)}
        </span>
      ) : (
        <span className="flex flex-col gap-0.5">
          {cands.map((c) => (
            <CandRow key={c.k} c={c} />
          ))}
        </span>
      )}
    </span>
  )
}

/** Усі комірки dp заданого рівня r (2 — база, 3..n — нарощування). */
export function HkLevelTable({ level }: { level: number }) {
  const cells = RESULT.cells.filter((c) => c.level === level)
  const intro: Record<number, string> = {
    2: "База: найкоротший шлях через дві вершини — це пряме ребро зі старту.",
    3: "Рівень 3: для кожної підмножини з 3 міст і кожного кінця обираємо найдешевший передостанній блок рівня 2.",
    4: "Рівень 4: зелене — обраний попередник, рожеве — відкинуті (дорожчі) варіанти min().",
    5: "Рівень 5 (усі міста): по кілька кандидатів на кожен кінець; найдешевший підставляється в замикання.",
  }
  return (
    <FigureBox>
      <span className="mb-2 block text-xs text-muted-foreground">
        {intro[level] ?? `Рівень ${level}.`} Усього {cells.length} підзадач.
      </span>
      <span className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {cells.map((c) => (
          <CellCard key={`${c.subset}-${c.end}`} cell={c} />
        ))}
      </span>
    </FigureBox>
  )
}

// ── 07. Замикання ─────────────────────────────────────────────────────────────

/** Кандидати фази замикання: повний шлях + ребро назад у старт; ✓ — оптимум. */
export function HkClosingTable() {
  const cands = closingCandidates(RESULT)
  return (
    <FigureBox>
      <span className="mb-2 block text-xs text-muted-foreground">
        Замикання: до кожного шляху через <b>усі</b> міста додаємо ребро назад у
        старт ({label(START)}) і беремо найкоротший цикл.
      </span>
      <span className="flex flex-col gap-1.5">
        {cands.map((c) => {
          const full = (1 << N) - 1
          const cell = cellOf(full, c.j)
          const chosen = Math.abs(c.total - RESULT.cost) < 1e-9
          return (
            <span
              key={c.j}
              className={cn(
                "flex flex-wrap items-center gap-x-2 gap-y-0.5 rounded-md border px-2 py-1.5 text-xs tabular-nums",
                chosen
                  ? "border-emerald-500/50 bg-emerald-500/10"
                  : "border-border",
              )}
            >
              <span className="font-mono">
                {cell ? pathLabel(cell.path) : label(c.j)} → {label(START)}
              </span>
              <span className="ml-auto text-muted-foreground">
                {fmt(c.blockCost)} + {fmt(c.edge)} =
              </span>
              <span
                className={cn(
                  "font-semibold",
                  chosen && "text-emerald-700 dark:text-emerald-300",
                )}
              >
                {fmt(c.total)}
              </span>
              {chosen && <Check className="size-3.5 text-emerald-600" />}
            </span>
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

/** Запасна картка для фігур без живого віджета (+ опційний перехід на вкладку). */
export function FigureCard({
  caption,
  cta,
}: {
  caption: string
  cta?: { label: string; route: string }
}) {
  return (
    <span className="not-prose my-4 block rounded-lg border border-dashed bg-muted/30 p-4 text-center">
      <span className="block text-sm text-muted-foreground">{caption}</span>
      {cta && (
        <button
          type="button"
          className="mt-3 rounded-lg border bg-background px-3 py-1.5 text-sm font-medium hover:bg-muted"
          onClick={() => setHash(cta.route)}
        >
          {cta.label} →
        </button>
      )}
    </span>
  )
}
