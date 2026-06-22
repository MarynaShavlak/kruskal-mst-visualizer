import { Hash } from "lucide-react"
import { Panel } from "@/algorithms/shared/playback/Panel"
import { useT } from "@/i18n/use-t"
import { cn } from "@/lib/utils"

// СИГНАТУРНА панель ФАЗИ 1 (preprocessing) — Horner-побудова поліноміального хешу шаблону.
// Рядок символів шаблону; активний символ підсвічено, поряд — таблиця Horner-кроку
// (код=ord, степінь base^k mod m, внесок code·power) і великий накопичений хеш. На фінальному
// кадрі — підсумковий хеш шаблону, який ми порівнюватимемо з хешем кожного вікна.

export interface HashBuildProps {
  readonly pattern: string
  readonly base: number
  readonly modulus: number
  /** Позиція активного символу (term) або null (init/final). */
  readonly termIndex: number | null
  readonly char: string | null
  readonly code: number | null
  readonly power: number | null
  readonly contribution: number | null
  /** Накопичений хеш на цей момент. */
  readonly hashValue: number
  /** true на фінальному кадрі (хеш готовий). */
  readonly done: boolean
}

function glyph(ch: string): string {
  return ch === " " ? "␣" : ch
}

export function HashBuildView({
  pattern,
  base,
  modulus,
  termIndex,
  char,
  code,
  power,
  contribution,
  hashValue,
  done,
}: HashBuildProps) {
  const t = useT()
  return (
    <span className="inline-flex w-full flex-col gap-3">
      {/* Рядок символів шаблону з підсвіченим активним. */}
      <span className="inline-flex flex-wrap items-end gap-0.5 overflow-x-auto">
        {Array.from(pattern).map((ch, idx) => {
          const active = termIndex === idx
          const dimmed = termIndex != null && idx > termIndex
          return (
            <span key={idx} className="inline-flex shrink-0 flex-col items-center gap-0.5">
              <span
                className={cn(
                  "inline-flex size-8 items-center justify-center rounded border-2 font-mono text-sm tabular-nums transition-colors",
                  active
                    ? "border-violet-500 bg-violet-500/20 text-violet-700 dark:text-violet-300"
                    : dimmed
                      ? "border-border/60 bg-muted/20 text-muted-foreground/40"
                      : "border-emerald-500/50 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
                )}
              >
                {glyph(ch)}
              </span>
              <span className="text-[8px] tabular-nums text-muted-foreground/50">{idx}</span>
            </span>
          )
        })}
      </span>

      {/* Horner-крок. */}
      {termIndex != null && char != null ? (
        <span className="grid grid-cols-2 gap-x-4 gap-y-1 rounded-md border bg-muted/30 px-3 py-2 text-xs">
          <span className="text-muted-foreground">{t("play.rkTermChar")}</span>
          <span className="text-right font-mono tabular-nums">
            «{glyph(char)}» (ord = {code})
          </span>
          <span className="text-muted-foreground">{t("play.rkTermPower")}</span>
          <span className="text-right font-mono tabular-nums">
            {base}^{(pattern.length - 1 - termIndex)} mod {modulus} = {power}
          </span>
          <span className="text-muted-foreground">{t("play.rkTermContribution")}</span>
          <span className="text-right font-mono tabular-nums">
            {code} · {power} = {contribution}
          </span>
        </span>
      ) : (
        <span className="rounded-md border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
          {done ? t("play.rkHashReady") : t("play.rkHashStart", { modulus })}
        </span>
      )}

      {/* Накопичений / підсумковий хеш. */}
      <span
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-md border-2 px-4 py-3",
          done
            ? "border-violet-500 bg-violet-500/15"
            : "border-violet-400/50 bg-violet-500/5",
        )}
      >
        <Hash className="size-5 text-violet-600 dark:text-violet-400" />
        <span className="text-xs text-muted-foreground">
          {done ? t("play.rkHashFinal") : t("play.rkHashAccum")}
        </span>
        <span className="font-mono text-2xl font-bold tabular-nums text-violet-700 dark:text-violet-300">
          {hashValue}
        </span>
      </span>
    </span>
  )
}

/** Панель плеєра фази 1: «хеш шаблону». */
export function HashBuildPanel({ className, ...view }: HashBuildProps & { className?: string }) {
  const t = useT()
  return (
    <Panel
      title={t("play.rkHashPanelTitle")}
      className={className}
      bodyClassName="flex flex-col gap-3 p-3"
    >
      <div className="flex min-h-0 flex-1 items-center justify-center overflow-auto">
        <HashBuildView {...view} />
      </div>
    </Panel>
  )
}
