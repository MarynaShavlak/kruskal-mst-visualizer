import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useT } from "@/i18n/use-t"
import { countOperations, distanceMatrix } from "@/lib/tsp"
import { countRoutes } from "@/lib/tspBruteForce"
import { cn } from "@/lib/utils"
import { useTspStore } from "@/store/tsp-store"

/** Суфікси компактного запису великих чисел (локалізовані). */
interface NumUnits {
  k: string
  M: string
  B: string
}

/** Компактний запис великого числа: 1.4 тис. / 2.3 млн / 7.1e12. */
function fmt(x: number, u: NumUnits): string {
  if (x < 1000) return String(x)
  if (x < 1e6) return `${(x / 1e3).toFixed(1)}${u.k}`
  if (x < 1e9) return `${(x / 1e6).toFixed(1)}${u.M}`
  if (x < 1e12) return `${(x / 1e9).toFixed(1)}${u.B}`
  return x.toExponential(1)
}

type Level = "empty" | "ok" | "warn" | "danger"

function complexityLevel(n: number): Level {
  if (n < 2) return "empty"
  if (n <= 12) return "ok"
  if (n <= 16) return "warn"
  return "danger"
}

/**
 * Панель похідної матриці відстаней (вхід Хелда–Карпа): рядок i → стовпець j —
 * евклідова відстань між містами (0 на діагоналі, симетрична). Матриця ПОХІДНА
 * від координат і не редагується тут — рухай міста на карті. Унизу — лічильники
 * й застереження про складність O(n²·2ⁿ) при великій кількості міст.
 */
export function DistanceMatrixPanel({ className }: { className?: string }) {
  const cities = useTspStore((s) => s.cities)
  const start = useTspStore((s) => s.start)
  const n = cities.length
  const dist = distanceMatrix(cities)
  const level = complexityLevel(n)
  const t = useT()
  const units: NumUnits = {
    k: t("editor.numK"),
    M: t("editor.numM"),
    B: t("editor.numB"),
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{t("editor.hkDistTitle")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        {n === 0 ? (
          <p className="text-muted-foreground">{t("editor.hkDistEmpty")}</p>
        ) : n === 1 ? (
          <p className="text-muted-foreground">{t("editor.hkNeedTwo")}</p>
        ) : (
          <div className="overflow-auto">
            <div
              className="grid w-max gap-px text-center text-xs tabular-nums"
              style={{ gridTemplateColumns: `auto repeat(${n}, minmax(2.5rem, 1fr))` }}
            >
              <Head>і\j</Head>
              {cities.map((c, j) => (
                <Head key={`col-${c.name}`} highlight={j === start}>
                  {c.name}
                </Head>
              ))}

              {cities.map((ci, i) => (
                <RowCells
                  key={`row-${ci.name}`}
                  label={ci.name}
                  highlight={i === start}
                  values={dist[i]}
                  diag={i}
                />
              ))}
            </div>
          </div>
        )}

        <div className="space-y-1.5">
          <Row label={t("editor.hkCities")} value={String(n)} />
          {n >= 1 && (
            <Row label={t("editor.hkStart")} value={cities[start]?.name ?? "—"} />
          )}
          {n >= 2 && (
            <>
              <Row
                label={t("editor.hkDpSub")}
                value={fmt(countOperations(n), units)}
              />
              <Row
                label={t("editor.hkBruteTours")}
                value={fmt(countRoutes(n), units)}
              />
            </>
          )}
        </div>

        {level === "warn" && <Note tone="warn">{t("editor.hkWarnMany")}</Note>}
        {level === "danger" && (
          <Note tone="danger">{t("editor.hkWarnTooMany")}</Note>
        )}
      </CardContent>
    </Card>
  )
}

function Head({
  children,
  highlight,
}: {
  children: React.ReactNode
  highlight?: boolean
}) {
  return (
    <div
      className={cn(
        "bg-muted/60 px-1 py-1 font-semibold text-muted-foreground",
        highlight && "text-primary",
      )}
    >
      {children}
    </div>
  )
}

function RowCells({
  label,
  values,
  diag,
  highlight,
}: {
  label: string
  values: readonly number[]
  diag: number
  highlight?: boolean
}) {
  return (
    <>
      <Head highlight={highlight}>{label}</Head>
      {values.map((val, j) => {
        const isDiag = j === diag
        return (
          <div
            key={j}
            className={cn(
              "border border-border/50 px-1 py-1",
              isDiag && "bg-muted/40 text-muted-foreground",
            )}
          >
            {isDiag ? 0 : val.toFixed(1)}
          </div>
        )
      })}
    </>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium tabular-nums">{value}</span>
    </div>
  )
}

function Note({
  tone,
  children,
}: {
  tone: "warn" | "danger"
  children: React.ReactNode
}) {
  return (
    <div
      className={cn(
        "rounded-md px-2 py-1.5 text-xs",
        tone === "warn"
          ? "bg-amber-500/10 text-amber-700 dark:text-amber-400"
          : "bg-destructive/10 text-destructive",
      )}
    >
      {children}
    </div>
  )
}
