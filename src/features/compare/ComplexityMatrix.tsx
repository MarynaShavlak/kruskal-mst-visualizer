import { useMemo, useState } from "react"
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, ArrowUpDown, TrendingUp } from "lucide-react"
import {
  ALGORITHMS,
  COMPLEXITY_CLASSES,
  FAMILIES,
} from "@/algorithms/registry"
import { FilterChip } from "@/components/filter-chip"
import { navigateTo } from "@/hooks/use-route"
import { useT } from "@/i18n/use-t"
import { cn } from "@/lib/utils"
import { useLangStore } from "@/store/lang-store"
import type { Lang } from "@/store/lang-store"
import type {
  Algorithm,
  AlgorithmFamily,
  ComplexityClass,
} from "@/algorithms/types"

/** Стовпці, за якими можна сортувати таблицю. */
type SortCol = "algo" | "family" | "typical" | "worst" | "class"
type SortDir = "asc" | "desc"
type FamilyFilter = AlgorithmFamily | "all"

/**
 * Драбина зростання: усі Big-O рядки, що трапляються в реєстрі, від найшвидшого
 * до найповільнішого. Дає НАСКРІЗНИЙ порядок для сортування стовпців «типова» й
 * «найгірша» (самі рядки — мовно-нейтральні, тож не `Localized`). Невідомий рядок
 * падає в кінець. Якщо додається алгоритм із новою формулою — допиши її сюди.
 */
const GROWTH_ORDER: readonly string[] = [
  "O(log log n)",
  "O(log n)",
  "O(√n)",
  "O(n/m)",
  "O(n)",
  "O(d·(n+k))",
  "O(n+m)",
  "O(E log V)",
  "O(E log E)",
  "O(n log n)",
  "O(n√n)",
  "O(n·m)",
  "O(n²)",
  "O(V³)",
  "O(n·W)",
  "O(n²·2ⁿ)",
]

function growthRank(bigO: string): number {
  const i = GROWTH_ORDER.indexOf(bigO)
  return i === -1 ? GROWTH_ORDER.length : i
}

function familyRank(family: AlgorithmFamily): number {
  return FAMILIES.findIndex((f) => f.id === family)
}

function classRank(cls: ComplexityClass): number {
  return COMPLEXITY_CLASSES.findIndex((c) => c.id === cls)
}

/**
 * Кольоровий тон класу складності — холодний (швидко) → теплий (повільно). Повні
 * літеральні Tailwind-класи (інакше JIT їх не побачить), із dark-варіантами.
 * Порядок збігається з `COMPLEXITY_CLASSES`.
 */
const CLASS_TONE: Record<ComplexityClass, string> = {
  logarithmic:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  sublinear: "bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300",
  linear: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300",
  linearithmic:
    "bg-lime-100 text-lime-700 dark:bg-lime-950 dark:text-lime-300",
  subquadratic:
    "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300",
  quadratic:
    "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300",
  cubic: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
  "pseudo-polynomial":
    "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300",
  exponential:
    "bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-950 dark:text-fuchsia-300",
}

/** Ключ сортування для одного стовпця: число (ранг) або рядок (назва алгоритму). */
function sortKey(col: SortCol, a: Algorithm, lang: Lang): number | string {
  switch (col) {
    case "algo":
      return a.shortName[lang]
    case "family":
      return familyRank(a.family)
    case "typical":
      return growthRank(a.complexity.typical)
    case "worst":
      return growthRank(a.complexity.worst)
    case "class":
      return classRank(a.complexityClass)
  }
}

/** Заголовок-кнопка стовпця з індикатором напрямку сортування. */
function HeadCell({
  col,
  label,
  sort,
  onSort,
  className,
}: {
  col: SortCol
  label: string
  sort: { col: SortCol; dir: SortDir } | null
  onSort: (col: SortCol) => void
  className?: string
}) {
  const t = useT()
  const active = sort?.col === col
  return (
    <th
      scope="col"
      aria-sort={
        active ? (sort.dir === "asc" ? "ascending" : "descending") : "none"
      }
      className={cn(
        "px-3 py-2 text-left text-xs font-semibold text-muted-foreground",
        className,
      )}
    >
      <button
        type="button"
        onClick={() => onSort(col)}
        aria-label={t("compare.sortBy", { col: label })}
        className="inline-flex items-center gap-1 rounded outline-none transition hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
      >
        {label}
        {active ? (
          sort.dir === "asc" ? (
            <ArrowUp className="size-3" />
          ) : (
            <ArrowDown className="size-3" />
          )
        ) : (
          <ArrowUpDown className="size-3 opacity-30" />
        )}
      </button>
    </th>
  )
}

/** Чип класу складності з кольоровим тоном + представницькою формулою. */
function ClassBadge({ cls, lang }: { cls: ComplexityClass; lang: Lang }) {
  const info = COMPLEXITY_CLASSES.find((c) => c.id === cls)
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className={cn(
          "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
          CLASS_TONE[cls],
        )}
      >
        {info?.label[lang] ?? cls}
      </span>
      <span className="font-mono text-[11px] text-muted-foreground">
        {info?.formula}
      </span>
    </span>
  )
}

/**
 * Матриця складності: усі алгоритми платформи в одній сортовній таблиці
 * (родина / типова / найгірша складність / клас зростання). Read-only представлення
 * над `registry` — єдиним джерелом правди; клік по рядку відкриває розбір.
 */
export function ComplexityMatrix() {
  const t = useT()
  const lang = useLangStore((s) => s.lang)
  const [family, setFamily] = useState<FamilyFilter>("all")
  const [sort, setSort] = useState<{ col: SortCol; dir: SortDir } | null>(null)

  const rows = useMemo(() => {
    const filtered = ALGORITHMS.filter(
      (a) => family === "all" || a.family === family,
    )
    if (!sort) return filtered
    const dir = sort.dir === "asc" ? 1 : -1
    // Стабільне сортування з тай-брейком на порядок реєстру (навчальна послідовність).
    return filtered
      .map((a, i) => ({ a, i }))
      .sort((x, y) => {
        const kx = sortKey(sort.col, x.a, lang)
        const ky = sortKey(sort.col, y.a, lang)
        const cmp =
          typeof kx === "string" && typeof ky === "string"
            ? kx.localeCompare(ky, lang === "ua" ? "uk" : "en")
            : Number(kx) - Number(ky)
        return cmp !== 0 ? cmp * dir : x.i - y.i
      })
      .map((k) => k.a)
  }, [family, sort, lang])

  const toggleSort = (col: SortCol) =>
    setSort((prev) => {
      if (!prev || prev.col !== col) return { col, dir: "asc" }
      if (prev.dir === "asc") return { col, dir: "desc" }
      return null // третій клік → назад до порядку реєстру
    })

  const open = (a: Algorithm) =>
    navigateTo(a.id, a.status === "ready" ? a.defaultTab : null)

  return (
    <div className="space-y-6">
      <button
        type="button"
        onClick={() => navigateTo(null)}
        className="inline-flex items-center gap-1.5 rounded text-sm text-muted-foreground outline-none transition hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
      >
        <ArrowLeft className="size-4" />
        {t("compare.back")}
      </button>

      <div className="space-y-1">
        <h2 className="text-lg font-semibold">{t("compare.title")}</h2>
        <p className="text-sm text-muted-foreground">{t("compare.intro")}</p>
      </div>

      {/* Фільтр за родиною (ті самі чипи, що в каталозі). */}
      <div
        className="flex flex-wrap items-center gap-2"
        role="group"
        aria-label={t("home.filterAria")}
      >
        <span className="mr-1 shrink-0 text-xs font-medium text-muted-foreground">
          {t("home.filterFamily")}
        </span>
        <FilterChip
          active={family === "all"}
          label={t("home.filterAll")}
          count={ALGORITHMS.length}
          onClick={() => setFamily("all")}
        />
        {FAMILIES.map((f) => {
          const count = ALGORITHMS.filter((a) => a.family === f.id).length
          if (count === 0) return null
          return (
            <FilterChip
              key={f.id}
              active={family === f.id}
              label={f.label[lang]}
              count={count}
              onClick={() => setFamily(f.id)}
            />
          )
        })}
      </div>

      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full min-w-[660px] border-collapse text-sm">
          <thead>
            <tr className="border-b bg-muted/40">
              <HeadCell
                col="algo"
                label={t("compare.colAlgo")}
                sort={sort}
                onSort={toggleSort}
              />
              <HeadCell
                col="family"
                label={t("home.filterFamily")}
                sort={sort}
                onSort={toggleSort}
              />
              <HeadCell
                col="typical"
                label={t("compare.colTypical")}
                sort={sort}
                onSort={toggleSort}
              />
              <HeadCell
                col="worst"
                label={t("compare.colWorst")}
                sort={sort}
                onSort={toggleSort}
              />
              <HeadCell
                col="class"
                label={t("compare.colClass")}
                sort={sort}
                onSort={toggleSort}
              />
            </tr>
          </thead>
          <tbody>
            {rows.map((a) => {
              const degrades = a.complexity.worst !== a.complexity.typical
              return (
                <tr
                  key={a.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => open(a)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault()
                      open(a)
                    }
                  }}
                  className="group/row cursor-pointer border-b last:border-0 outline-none transition hover:bg-muted/50 focus-visible:bg-muted/50"
                >
                  <td className="px-3 py-2">
                    <span className="flex items-center gap-2">
                      <a.icon className="size-4 shrink-0 text-muted-foreground" />
                      <span className="font-medium">{a.shortName[lang]}</span>
                      <ArrowRight className="size-3.5 -translate-x-1 opacity-0 transition-all group-hover/row:translate-x-0 group-hover/row:opacity-100" />
                    </span>
                  </td>
                  <td className="px-3 py-2 text-muted-foreground">
                    {FAMILIES.find((f) => f.id === a.family)?.label[lang]}
                  </td>
                  <td className="px-3 py-2 font-mono text-xs text-foreground/90">
                    {a.complexity.typical}
                  </td>
                  <td className="px-3 py-2 font-mono text-xs">
                    <span
                      className={cn(
                        "inline-flex items-center gap-0.5",
                        degrades
                          ? "font-medium text-amber-700 dark:text-amber-400"
                          : "text-muted-foreground",
                      )}
                      title={
                        degrades
                          ? t("compare.degradesTitle", {
                              typical: a.complexity.typical,
                              worst: a.complexity.worst,
                            })
                          : undefined
                      }
                    >
                      {a.complexity.worst}
                      {degrades && <TrendingUp className="size-3" />}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <ClassBadge cls={a.complexityClass} lang={lang} />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Легенда: градієнт класу + позначка деградації. */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-2">
          <span>{t("compare.legendClass")}</span>
          <span className="flex items-center gap-1">
            {COMPLEXITY_CLASSES.map((c) => (
              <span
                key={c.id}
                title={`${c.label[lang]} ${c.formula}`}
                className={cn("size-3 rounded-sm", CLASS_TONE[c.id])}
              />
            ))}
          </span>
        </span>
        <span className="inline-flex items-center gap-1.5">
          <TrendingUp className="size-3 text-amber-700 dark:text-amber-400" />
          {t("compare.legendDegrades")}
        </span>
      </div>
    </div>
  )
}
