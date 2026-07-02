// Живі навчальні віджети хеш-таблиці на канонічному скрипті HT_INTRO. Усе будується
// з реального trace / прогону, тож «картинки» завжди узгоджені з кодом плеєра:
// хеш-конвеєр, покроковий розбір (міні-плеєр) і контраст «ланцюжки проти лінійного
// зондування» на тих самих даних. Плюс два MCQ-чекпойнти.

import { useMemo, type ReactNode } from "react"
import { buildHashTableTrace } from "@/lib/hashTableTrace"
import {
  runHashTable,
  sumCodesHash,
  slotOf,
  type CollisionStrategy,
  type HtBuckets,
} from "@/lib/hashTable"
import { HT_INTRO_OPS, HT_INTRO_CAPACITY } from "@/lib/exampleHashTable"
import { HashTablePanel } from "@/algorithms/hash-table/playback/HashTablePanel"
import { CodePanel } from "@/algorithms/shared/playback/CodePanel"
import { MiniPlayerShell } from "@/algorithms/shared/learn/MiniPlayerShell"
import { QuizFigure } from "@/algorithms/shared/learn/QuizFigure"
import { HT_OP_QUIZ, HT_SLOT_QUIZ } from "@/algorithms/hash-table/learn/learn-quiz.hash-table"
import { usePlayer } from "@/algorithms/shared/playback/use-player"
import { useT } from "@/i18n/use-t"
import type { MessageKey } from "@/i18n/messages"
import type { Translate } from "@/lib/translate"
import { useLangStore } from "@/store/lang-store"
import { cn } from "@/lib/utils"

/** Обгортка фігури: рамка-картка + опційний підпис (alt із markdown). */
function Figure({ caption, children }: { caption?: string; children: ReactNode }) {
  return (
    <span className="not-prose my-4 block overflow-x-auto rounded-lg border bg-card p-3">
      {children}
      {caption && (
        <span className="mt-2 block text-center text-xs text-muted-foreground">{caption}</span>
      )}
    </span>
  )
}

/** Двомовний текст без походу в messages (внутрішні підписи віджетів). */
function useL(): (ua: string, en: string) => string {
  const lang = useLangStore((s) => s.lang)
  return (ua, en) => (lang === "ua" ? ua : en)
}

/** Trace канонічного скрипта під обраною стратегією (перебудова на зміну мови). */
function useTrace(strategy: CollisionStrategy) {
  const t = useT()
  const lang = useLangStore((s) => s.lang)
  const tr: Translate = (k, v) => t(k as MessageKey, v)
  return useMemo(
    () => buildHashTableTrace(HT_INTRO_OPS, HT_INTRO_CAPACITY, { strategy }, tr),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [strategy, lang],
  )
}

// — Хеш-конвеєр: ключ → сума кодів → % m → слот -------------------------------

export function HtPipelineFigure({ caption }: { caption?: string }) {
  const L = useL()
  const key = "apple"
  const sum = sumCodesHash(key)
  const slot = slotOf(key, HT_INTRO_CAPACITY)
  return (
    <Figure caption={caption}>
      <span className="flex flex-wrap items-center justify-center gap-2 py-2 text-sm">
        <span className="flex gap-0.5">
          {[...key].map((ch, i) => (
            <span
              key={i}
              className="inline-flex flex-col items-center rounded border border-border bg-muted/40 px-1.5 py-1 font-mono leading-none"
            >
              <span className="text-base">{ch}</span>
              <span className="text-[10px] text-muted-foreground">{ch.charCodeAt(0)}</span>
            </span>
          ))}
        </span>
        <span className="text-muted-foreground">→</span>
        <span className="rounded border border-amber-500/50 bg-amber-500/10 px-2 py-1 font-mono text-amber-700 dark:text-amber-300">
          Σ = {sum}
        </span>
        <span className="text-muted-foreground">→</span>
        <span className="rounded border border-sky-500/50 bg-sky-500/10 px-2 py-1 font-mono text-sky-700 dark:text-sky-300">
          {sum} % {HT_INTRO_CAPACITY}
        </span>
        <span className="text-muted-foreground">→</span>
        <span className="rounded border border-emerald-500/60 bg-emerald-500/10 px-2.5 py-1 font-mono font-bold text-emerald-700 dark:text-emerald-300">
          #{slot}
        </span>
      </span>
      <span className="mt-1 block text-center text-xs text-muted-foreground">
        {L(
          "«сума кодів символів», далі остача за місткістю таблиці",
          "“sum of character codes”, then the remainder by the table capacity",
        )}
      </span>
    </Figure>
  )
}

// — Повний міні-плеєр (конвеєр + комірки + код) --------------------------------

export function HtWalkthrough({ caption }: { caption?: string }) {
  const t = useT()
  const lang = useLangStore((s) => s.lang)
  const trace = useTrace("chaining")
  const player = usePlayer(trace.frames.length, `ht-walk|${lang}`)
  const f = trace.frames[Math.min(player.index, trace.frames.length - 1)]
  return (
    <MiniPlayerShell player={player} frameCount={trace.frames.length} caption={f.caption}>
      <HashTablePanel frame={f} />
      <span className="mt-3 block">
        <CodePanel
          code={trace.code}
          title={t("play.htCodeTitle")}
          activeLines={f.lines}
          contextLines={f.contextLines}
          className="h-[240px]"
        />
      </span>
      {caption && (
        <span className="mt-2 block text-center text-xs text-muted-foreground">{caption}</span>
      )}
    </MiniPlayerShell>
  )
}

// — Контраст: ланцюжки проти лінійного зондування ------------------------------

/** Мінімальний ряд комірок фінального стану (для контрастної фігури). */
function CellsMini({ buckets }: { buckets: HtBuckets }) {
  return (
    <span className="flex flex-wrap justify-center gap-1">
      {buckets.map((chain, i) => (
        <span
          key={i}
          className="inline-flex min-w-[3rem] flex-col items-center gap-0.5 rounded-md border bg-muted/20 px-1 pb-1 pt-0.5"
        >
          <span className="text-[10px] font-bold text-muted-foreground">{i}</span>
          <span className="flex min-h-[1.25rem] flex-col-reverse gap-0.5">
            {chain.map((e, j) => (
              <span
                key={j}
                className="rounded border border-emerald-500/40 bg-emerald-500/10 px-1 py-0.5 font-mono text-[11px] text-emerald-700 dark:text-emerald-300"
              >
                {e.key}
              </span>
            ))}
          </span>
        </span>
      ))}
    </span>
  )
}

export function HtChainVsProbeFigure({ caption }: { caption?: string }) {
  const L = useL()
  const chaining = runHashTable(HT_INTRO_OPS, HT_INTRO_CAPACITY, { strategy: "chaining" })
  const linear = runHashTable(HT_INTRO_OPS, HT_INTRO_CAPACITY, { strategy: "linear" })
  return (
    <Figure caption={caption}>
      <span className="grid gap-3 lg:grid-cols-2">
        {[
          { title: L("Ланцюжки", "Chaining"), run: chaining },
          { title: L("Лінійне зондування", "Linear probing"), run: linear },
        ].map((col) => (
          <span key={col.title} className="block rounded-lg border bg-muted/10 p-2">
            <span className="mb-1.5 block text-center text-xs font-semibold">{col.title}</span>
            <CellsMini buckets={col.run.buckets} />
            <span className="mt-2 block text-center text-xs text-muted-foreground">
              {L("порівнянь", "comparisons")}:{" "}
              <span className={cn("font-mono font-bold", col.run.comparisons > 5 ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400")}>
                {col.run.comparisons}
              </span>
            </span>
          </span>
        ))}
      </span>
      <span className="mt-2 block text-center text-xs text-muted-foreground">
        {L(
          "Ті самі операції: у ланцюжках lemon стає в ланцюг комірки 4; у зондуванні «прогулюється» 4→0→1→2 і кластеризація коштує дорожче.",
          "The same operations: with chaining lemon joins cell 4's chain; with probing it walks 4→0→1→2 and clustering costs more.",
        )}
      </span>
    </Figure>
  )
}

// — MCQ-чекпойнти --------------------------------------------------------------

export function HtOpQuizFigure({ caption }: { caption?: string }) {
  return <QuizFigure spec={HT_OP_QUIZ} caption={caption} />
}

export function HtSlotQuizFigure({ caption }: { caption?: string }) {
  return <QuizFigure spec={HT_SLOT_QUIZ} caption={caption} />
}
