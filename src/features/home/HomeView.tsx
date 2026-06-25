import { useState } from "react"
import { ArrowRight, Table2 } from "lucide-react"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FilterChip } from "@/components/filter-chip"
import { COMPLEXITY_CLASSES, algorithmsByFamily } from "@/algorithms/registry"
import { navigateTo, navigateToPage } from "@/hooks/use-route"
import { useT } from "@/i18n/use-t"
import { useLangStore } from "@/store/lang-store"
import type { Lang } from "@/store/lang-store"
import type {
  Algorithm,
  AlgorithmFamily,
  ComplexityClass,
} from "@/algorithms/types"

/** Активні фасети каталогу: родина та клас складності (або «всі»). */
type FamilyFilter = AlgorithmFamily | "all"
type ClassFilter = ComplexityClass | "all"

/** Картка одного алгоритму в сітці каталогу. */
function AlgoCard({ algo, lang }: { algo: Algorithm; lang: Lang }) {
  const t = useT()
  const ready = algo.status === "ready"
  const open = () => navigateTo(algo.id, ready ? algo.defaultTab : null)
  return (
    <Card
      role="button"
      tabIndex={0}
      onClick={open}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          open()
        }
      }}
      className="group/card cursor-pointer transition outline-none hover:ring-2 hover:ring-foreground/20 focus-visible:ring-2 focus-visible:ring-ring"
    >
      <CardHeader>
        <span className="mb-2 flex size-10 items-center justify-center rounded-lg bg-muted text-foreground/80">
          <algo.icon className="size-5" />
        </span>
        <CardTitle className="flex items-center gap-1.5">
          {algo.shortName[lang]}
          {ready && (
            <ArrowRight className="size-4 -translate-x-1 opacity-0 transition-all group-hover/card:translate-x-0 group-hover/card:opacity-100" />
          )}
        </CardTitle>
        <CardDescription>{algo.tagline[lang]}</CardDescription>
        <p className="mt-1 text-xs text-muted-foreground/80">
          {algo.category[lang]}
        </p>
        <div
          className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 border-t pt-3 text-xs"
          role="group"
          aria-label={t("home.complexityHint")}
        >
          <span className="inline-flex items-baseline gap-1.5">
            <span className="text-muted-foreground">
              {t("home.complexityTypical")}
            </span>
            <span className="font-mono text-foreground/90">
              {algo.complexity.typical}
            </span>
          </span>
          <span className="inline-flex items-baseline gap-1.5">
            <span className="text-muted-foreground">
              {t("home.complexityWorst")}
            </span>
            <span className="font-mono text-foreground/90">
              {algo.complexity.worst}
            </span>
          </span>
        </div>
      </CardHeader>
    </Card>
  )
}

/** Каталог: картки за родиною + дві фасети-фільтри (родина / клас складності). */
export function HomeView() {
  const t = useT()
  const lang = useLangStore((s) => s.lang)
  const [family, setFamily] = useState<FamilyFilter>("all")
  const [cls, setCls] = useState<ClassFilter>("all")

  const groups = algorithmsByFamily()
  const all = groups.flatMap((g) => g.items)

  const matchesClass = (a: Algorithm) => cls === "all" || a.complexityClass === cls
  const matchesFamily = (a: Algorithm) => family === "all" || a.family === family

  // Секції — родини, що проходять фільтр родини; всередині лишаємо лише той клас.
  const visible = groups
    .filter((g) => family === "all" || g.family.id === family)
    .map((g) => ({ family: g.family, items: g.items.filter(matchesClass) }))
    .filter((g) => g.items.length > 0)

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold">{t("home.heading")}</h2>
          <p className="text-sm text-muted-foreground">{t("home.intro")}</p>
        </div>
        <button
          type="button"
          onClick={() => navigateToPage("compare")}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm font-medium text-foreground transition outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Table2 className="size-4" />
          {t("compare.title")}
        </button>
      </div>

      {/* Липка панель фасет: родина (зверху) + клас складності (знизу). */}
      <div className="sticky top-0 z-20 -mx-4 space-y-2 border-b bg-background/85 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/70">
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
            count={all.filter(matchesClass).length}
            onClick={() => setFamily("all")}
          />
          {groups.map((g) => {
            const count = g.items.filter(matchesClass).length
            return (
              <FilterChip
                key={g.family.id}
                active={family === g.family.id}
                label={g.family.label[lang]}
                count={count}
                disabled={count === 0}
                onClick={() => setFamily(g.family.id)}
              />
            )
          })}
        </div>

        <div
          className="flex flex-wrap items-center gap-2"
          role="group"
          aria-label={t("home.filterComplexityAria")}
        >
          <span className="mr-1 shrink-0 text-xs font-medium text-muted-foreground">
            {t("home.filterComplexity")}
          </span>
          <FilterChip
            active={cls === "all"}
            label={t("home.filterAll")}
            count={all.filter(matchesFamily).length}
            onClick={() => setCls("all")}
          />
          {COMPLEXITY_CLASSES.map((c) => {
            const count = all.filter(
              (a) => a.complexityClass === c.id && matchesFamily(a),
            ).length
            return (
              <FilterChip
                key={c.id}
                active={cls === c.id}
                label={c.label[lang]}
                formula={c.formula}
                count={count}
                disabled={count === 0}
                onClick={() => setCls(c.id)}
              />
            )
          })}
        </div>
      </div>

      <div className="space-y-10">
        {visible.map((g) => (
          <section
            key={g.family.id}
            className="space-y-4"
            aria-labelledby={`family-${g.family.id}`}
          >
            <div className="space-y-1">
              <div className="flex items-baseline gap-2">
                <h3
                  id={`family-${g.family.id}`}
                  className="text-base font-semibold"
                >
                  {g.family.label[lang]}
                </h3>
                <span className="text-sm tabular-nums text-muted-foreground">
                  {g.items.length}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                {g.family.blurb[lang]}
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {g.items.map((algo) => (
                <AlgoCard key={algo.id} algo={algo} lang={lang} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
