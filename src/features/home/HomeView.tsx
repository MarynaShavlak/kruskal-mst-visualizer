import { useEffect, useMemo, useRef, useState } from "react"
import { ArrowRight, Search, Table2, X } from "lucide-react"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FilterChip } from "@/components/filter-chip"
import { Input } from "@/components/ui/input"
import {
  COMPLEXITY_CLASSES,
  FAMILIES,
  algorithmsByFamily,
  bridgeTo,
} from "@/algorithms/registry"
import {
  navigateTo,
  navigateToCatalog,
  navigateToPage,
  parseCatalogQuery,
} from "@/hooks/use-route"
import {
  applyCatalogFilters,
  countForClass,
  countForFamily,
  type ClassFilter,
  type FamilyFilter,
} from "@/features/home/catalog-filter"
import { useT } from "@/i18n/use-t"
import { useLangStore } from "@/store/lang-store"
import type { Lang } from "@/store/lang-store"
import type { Algorithm } from "@/algorithms/types"

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

/**
 * Rail «Навчальні шляхи»: для кожної родини показує її алгоритми у порядку
 * курсу (з ланцюга `BRIDGES`) як клікабельні чипи, з'єднані стрілками. Дає
 * оглядову мапу рекомендованої послідовності перед зануренням у картки.
 */
function PathsRail({ lang }: { lang: Lang }) {
  const t = useT()
  const groups = algorithmsByFamily()

  return (
    <section
      className="space-y-3 rounded-xl border bg-muted/20 p-4"
      aria-labelledby="paths-rail-heading"
    >
      <div className="space-y-1">
        <h3 id="paths-rail-heading" className="text-base font-semibold">
          {t("home.pathsHeading")}
        </h3>
        <p className="text-sm text-muted-foreground">{t("home.pathsIntro")}</p>
      </div>
      <div className="space-y-3">
        {groups.map((g) => (
          <div key={g.family.id} className="space-y-1.5">
            <span className="text-xs font-medium text-muted-foreground">
              {g.family.label[lang]}
            </span>
            <ol className="flex flex-wrap items-center gap-x-1 gap-y-2">
              {g.items.map((algo, i) => {
                const ready = algo.status === "ready"
                // Стрілка перед елементом, якщо до нього веде місток від
                // попереднього алгоритму ТІЄЇ Ж родини (ланцюг не рветься).
                const prev = i > 0 ? g.items[i - 1] : undefined
                const linked =
                  prev != null && bridgeTo(algo.id)?.from === prev.id
                return (
                  <li key={algo.id} className="flex items-center gap-1">
                    {i > 0 && (
                      <ArrowRight
                        className={
                          linked
                            ? "size-3.5 text-muted-foreground/70"
                            : "size-3.5 text-muted-foreground/30"
                        }
                        aria-hidden
                      />
                    )}
                    <button
                      type="button"
                      onClick={() =>
                        navigateTo(algo.id, ready ? algo.defaultTab : null)
                      }
                      className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2 py-1 text-xs font-medium transition outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <algo.icon className="size-3.5 text-foreground/70" />
                      {algo.shortName[lang]}
                    </button>
                  </li>
                )
              })}
            </ol>
          </div>
        ))}
      </div>
    </section>
  )
}

/** Валідне значення фасети родини з рядка хеша (інакше «усі»). */
function seedFamily(raw: string | null): FamilyFilter {
  if (raw != null && FAMILIES.some((f) => f.id === raw)) {
    return raw as FamilyFilter
  }
  return "all"
}

/** Валідне значення фасети класу складності з рядка хеша (інакше «усі»). */
function seedClass(raw: string | null): ClassFilter {
  if (raw != null && COMPLEXITY_CLASSES.some((c) => c.id === raw)) {
    return raw as ClassFilter
  }
  return "all"
}

/** Каталог: картки за родиною + дві фасети-фільтри + текстовий пошук. */
export function HomeView() {
  const t = useT()
  const lang = useLangStore((s) => s.lang)

  // Сід фасет із хеша на ПЕРШИЙ рендер (deep-link `#?family=…&class=…&q=…`);
  // далі стан — джерело правди, що дзеркалиться назад у хеш (debounced).
  const [family, setFamily] = useState<FamilyFilter>(() =>
    seedFamily(parseCatalogQuery(window.location.hash).family),
  )
  const [cls, setCls] = useState<ClassFilter>(() =>
    seedClass(parseCatalogQuery(window.location.hash).cls),
  )
  const [q, setQ] = useState<string>(
    () => parseCatalogQuery(window.location.hash).q ?? "",
  )

  // Дзеркалимо фасети у хеш через replaceState (без history-спаму). Перший
  // рендер пропускаємо — інакше mount-запис клобернув би сід і дав feedback-loop.
  const isFirstWrite = useRef(true)
  useEffect(() => {
    if (isFirstWrite.current) {
      isFirstWrite.current = false
      return
    }
    const id = window.setTimeout(() => {
      navigateToCatalog({ family, cls, q })
    }, 250)
    return () => window.clearTimeout(id)
  }, [family, cls, q])

  const groups = algorithmsByFamily()

  const { groups: visible, total } = useMemo(
    () => applyCatalogFilters(groups, { family, cls, q, lang }),
    [groups, family, cls, q, lang],
  )

  const resetFilters = () => {
    setFamily("all")
    setCls("all")
    setQ("")
  }

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

      <PathsRail lang={lang} />

      {/* Липка панель: пошук (зверху) + фасета родини + клас складності. */}
      <div className="sticky top-0 z-20 -mx-4 space-y-2 border-b bg-background/85 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/70">
        <div className="relative">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t("home.searchPlaceholder")}
            aria-label={t("home.searchAria")}
            className="pr-9 pl-9"
          />
          {q !== "" && (
            <button
              type="button"
              onClick={() => setQ("")}
              aria-label={t("home.searchClear")}
              className="absolute top-1/2 right-2 inline-flex size-6 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
            >
              <X className="size-4" />
            </button>
          )}
        </div>

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
            count={countForFamily(groups, "all", cls, q, lang)}
            onClick={() => setFamily("all")}
          />
          {groups.map((g) => {
            const count = countForFamily(groups, g.family.id, cls, q, lang)
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
            count={countForClass(groups, "all", family, q, lang)}
            onClick={() => setCls("all")}
          />
          {COMPLEXITY_CLASSES.map((c) => {
            const count = countForClass(groups, c.id, family, q, lang)
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

      {total === 0 && (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed py-12 text-center">
          <p className="text-sm text-muted-foreground">
            {t("home.emptyResults")}
          </p>
          <button
            type="button"
            onClick={resetFilters}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm font-medium transition outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
          >
            {t("home.emptyResultsReset")}
          </button>
        </div>
      )}

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
