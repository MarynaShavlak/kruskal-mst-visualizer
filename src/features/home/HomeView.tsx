import { useState } from "react"
import { ArrowRight, Gauge } from "lucide-react"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { algorithmsByFamily } from "@/algorithms/registry"
import { navigateTo } from "@/hooks/use-route"
import { useT } from "@/i18n/use-t"
import { cn } from "@/lib/utils"
import { useLangStore } from "@/store/lang-store"
import type { Lang } from "@/store/lang-store"
import type { Algorithm, AlgorithmFamily } from "@/algorithms/types"

/** Активний фільтр каталогу: конкретна родина або «всі». */
type Filter = AlgorithmFamily | "all"

/** Чип-перемикач родини у липкій панелі фільтрів. */
function FilterChip({
  active,
  label,
  count,
  onClick,
}: {
  active: boolean
  label: string
  count: number
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-medium transition outline-none focus-visible:ring-2 focus-visible:ring-ring",
        active
          ? "border-foreground bg-foreground text-background"
          : "border-border bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground",
      )}
    >
      {label}
      <span
        className={cn(
          "text-xs tabular-nums",
          active ? "text-background/70" : "text-muted-foreground/70",
        )}
      >
        {count}
      </span>
    </button>
  )
}

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
        <div className="mb-2 flex items-center justify-between">
          <span className="flex size-10 items-center justify-center rounded-lg bg-muted text-foreground/80">
            <algo.icon className="size-5" />
          </span>
          <span
            className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 font-mono text-xs text-muted-foreground"
            title={t("home.complexityHint")}
            aria-label={`${t("home.complexityHint")}: ${algo.complexity}`}
          >
            <Gauge className="size-3" aria-hidden="true" />
            {algo.complexity}
          </span>
        </div>
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
      </CardHeader>
    </Card>
  )
}

/** Каталог: картки алгоритмів, згруповані за родиною, з фільтром-чипами. */
export function HomeView() {
  const t = useT()
  const lang = useLangStore((s) => s.lang)
  const [filter, setFilter] = useState<Filter>("all")

  const groups = algorithmsByFamily()
  const total = groups.reduce((n, g) => n + g.items.length, 0)
  const visible =
    filter === "all" ? groups : groups.filter((g) => g.family.id === filter)

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold">{t("home.heading")}</h2>
        <p className="text-sm text-muted-foreground">{t("home.intro")}</p>
      </div>

      {/* Липка панель фільтрів за родиною. */}
      <div className="sticky top-0 z-20 -mx-4 border-b bg-background/85 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/70">
        <div
          className="flex flex-wrap gap-2"
          role="group"
          aria-label={t("home.filterAria")}
        >
          <FilterChip
            active={filter === "all"}
            label={t("home.filterAll")}
            count={total}
            onClick={() => setFilter("all")}
          />
          {groups.map((g) => (
            <FilterChip
              key={g.family.id}
              active={filter === g.family.id}
              label={g.family.label[lang]}
              count={g.items.length}
              onClick={() => setFilter(g.family.id)}
            />
          ))}
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
