import { useMemo, type ReactNode } from "react"
import { Hash, Search } from "lucide-react"
import {
  buildRabinKarpStringSearchTrace,
  type RkFrame,
} from "@/lib/rabinKarpStringSearchTrace"
import {
  polynomialHash,
  countHashCharOps,
  type Collision,
} from "@/lib/rabinKarpStringSearch"
import { RK_COLLISION_CASES } from "@/lib/exampleRabinKarpStringSearch"
import { StripView, HashBadges } from "@/algorithms/rabin-karp-string-search/playback/RkStripPanel"
import { HashBuildView } from "@/algorithms/rabin-karp-string-search/playback/HashBuildPanel"
import { CodePanel } from "@/algorithms/shared/playback/CodePanel"
import { MiniPlayerShell } from "@/algorithms/shared/learn/MiniPlayerShell"
import { usePlayer } from "@/algorithms/shared/playback/use-player"
import { useT } from "@/i18n/use-t"
import type { MessageKey } from "@/i18n/messages"
import type { Translate } from "@/lib/translate"
import { useLangStore } from "@/store/lang-store"

// Живі навчальні віджети пошуку Рабіна-Карпа на еталонних прикладах. Дві фази: ФАЗА 1 —
// Horner-побудова хешу шаблону (число!), ФАЗА 2 — ковзне вікно як стрічка «текст/шаблон»
// з бейджами хешів. Унікальна перлина — КОЛІЗІЯ (рівні хеші, різні рядки).

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

function PatternBadge({ pattern }: { pattern: string }) {
  const t = useT()
  return (
    <span className="mb-2 inline-flex items-center gap-1.5 rounded-md border border-rose-400/50 bg-rose-500/10 px-2.5 py-1 text-sm font-medium text-rose-700 dark:text-rose-300">
      <Search className="size-3.5" />
      {t("play.rkTargetBadge", { pattern: pattern || "∅" })}
    </span>
  )
}

function useTrace(text: string, pattern: string, rolling: boolean) {
  const t = useT()
  const lang = useLangStore((s) => s.lang)
  const tr: Translate = (k, v) => t(k as MessageKey, v)
  return useMemo(
    () => buildRabinKarpStringSearchTrace(text, pattern, rolling, tr),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [text, pattern, rolling, lang],
  )
}

/** Поля кадру → StripView. */
function stripView(f: RkFrame) {
  return {
    text: f.text,
    pattern: f.pattern,
    offset: f.offset,
    verdict: f.verdict,
    matched: f.matched,
    mismatchJ: f.mismatchJ,
  }
}

/** Поля кадру → HashBuildView. */
function hashView(f: RkFrame) {
  return {
    pattern: f.pattern,
    base: f.base,
    modulus: f.modulus,
    termIndex: f.hashTermIndex,
    char: f.hashChar,
    code: f.hashCode,
    power: f.hashPower,
    contribution: f.hashContribution,
    hashValue: f.hashValue,
    done: f.phase === "hashDone",
  }
}

/** Статична фігура фази 1: Horner-крок на конкретному кадрі (walkthrough/hash_NN). */
export function HashStepFigure({
  pattern,
  hashFrameIndex,
  caption,
}: {
  pattern: string
  hashFrameIndex: number
  caption?: string
}) {
  const trace = useTrace("Being a developer is not easy", pattern, true)
  const hashFrames = trace.frames.filter((f) => f.panel === "hash")
  const idx = Math.max(0, Math.min(hashFrameIndex, hashFrames.length - 1))
  const frame = hashFrames[idx]
  return (
    <Figure caption={caption}>
      <span className="block">
        <HashBuildView {...hashView(frame)} />
      </span>
      <span className="mt-2 block text-xs text-muted-foreground">{frame.caption}</span>
    </Figure>
  )
}

/** Статична фігура фази 2: вікно на конкретному кадрі (walkthrough/search_NN). */
export function SearchStepFigure({
  text,
  pattern,
  searchFrameIndex,
  caption,
}: {
  text: string
  pattern: string
  searchFrameIndex: number
  caption?: string
}) {
  const trace = useTrace(text, pattern, true)
  const searchFrames = trace.frames.filter((f) => f.panel === "search")
  const idx = Math.max(0, Math.min(searchFrameIndex, searchFrames.length - 1))
  const frame = searchFrames[idx]
  return (
    <Figure caption={caption}>
      <span className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <PatternBadge pattern={pattern} />
        <HashBadges windowHash={frame.windowHash} patternHash={frame.patternHash} offset={frame.offset} />
      </span>
      <span className="block">
        <StripView {...stripView(frame)} size="sm" />
      </span>
      <span className="mt-2 block text-xs text-muted-foreground">{frame.caption}</span>
    </Figure>
  )
}

/** Міні-плеєр повного трасування (обидві фази) пари (текст, шаблон). */
export function AnimationFigure({
  text,
  pattern,
  rolling = true,
  caption,
}: {
  text: string
  pattern: string
  rolling?: boolean
  caption?: string
}) {
  const trace = useTrace(text, pattern, rolling)
  const player = usePlayer(trace.frames.length, `${text}|${pattern}|${rolling}`)
  const frame = trace.frames[Math.min(player.index, trace.frames.length - 1)]
  return (
    <Figure caption={caption}>
      <MiniPlayerShell player={player} frameCount={trace.frames.length} caption={frame.caption}>
        {frame.panel === "hash" ? (
          <span className="block">
            <HashBuildView {...hashView(frame)} />
          </span>
        ) : (
          <span className="block">
            <span className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <PatternBadge pattern={pattern} />
              <HashBadges windowHash={frame.windowHash} patternHash={frame.patternHash} offset={frame.offset} />
            </span>
            <StripView {...stripView(frame)} size="sm" />
          </span>
        )}
      </MiniPlayerShell>
    </Figure>
  )
}

/** Код ↔ дані: міні-плеєр із панеллю коду поряд (код фази визначає сам кадр). */
export function CodeWalkthroughFigure({
  text,
  pattern,
  caption,
}: {
  text: string
  pattern: string
  caption?: string
}) {
  const trace = useTrace(text, pattern, true)
  const player = usePlayer(trace.frames.length, `cw|${text}|${pattern}`)
  const frame = trace.frames[Math.min(player.index, trace.frames.length - 1)]
  const code = frame.panel === "hash" ? trace.hashCode : trace.searchCode
  return (
    <Figure caption={caption}>
      <MiniPlayerShell player={player} frameCount={trace.frames.length} caption={frame.caption}>
        <span className="grid gap-2 lg:grid-cols-2">
          <span className="block min-w-0">
            <CodePanel code={code} activeLines={frame.lines} contextLines={frame.contextLines} />
          </span>
          <span className="block min-w-0">
            {frame.panel === "hash" ? (
              <HashBuildView {...hashView(frame)} />
            ) : (
              <>
                <span className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <PatternBadge pattern={pattern} />
                  <HashBadges windowHash={frame.windowHash} patternHash={frame.patternHash} offset={frame.offset} />
                </span>
                <StripView {...stripView(frame)} size="sm" />
              </>
            )}
          </span>
        </span>
      </MiniPlayerShell>
    </Figure>
  )
}

/** Інтуїція хешу: пара рядків → числа (хеш «розрізняє» рядки одним порівнянням). */
export function HashIntuitionFigure({ caption }: { caption?: string }) {
  const t = useT()
  const words = ["abc", "developer", "general", "for", "jar"]
  return (
    <Figure caption={caption}>
      <span className="flex flex-col gap-1.5">
        {words.map((w) => (
          <span key={w} className="flex items-center gap-2 text-sm">
            <span className="inline-flex items-center rounded border bg-muted/30 px-2 py-1 font-mono">
              {w.split("").map((c) => (c === " " ? "␣" : c)).join("")}
            </span>
            <span className="text-muted-foreground">→</span>
            <span className="inline-flex items-center gap-1 rounded-md border border-violet-500/60 bg-violet-500/10 px-2 py-1 font-mono tabular-nums text-violet-700 dark:text-violet-300">
              <Hash className="size-3.5" />
              {polynomialHash(w)}
            </span>
          </span>
        ))}
      </span>
      <span className="mt-2 block text-xs text-muted-foreground">{t("learn.rkHashIntuitionNote")}</span>
    </Figure>
  )
}

/** Колізії: пари різних рядків однакового хешу (для розділу про колізії). */
export function CollisionFigure({ caption }: { caption?: string }) {
  const t = useT()
  const cases: readonly Collision[] = RK_COLLISION_CASES
  return (
    <Figure caption={caption}>
      <span className="flex flex-col gap-2">
        {cases.map((c) => (
          <span key={`${c.s1}-${c.s2}`} className="flex items-center gap-2 text-sm">
            <span className="inline-flex items-center rounded border bg-muted/30 px-2 py-1 font-mono">{c.s1}</span>
            <span className="text-muted-foreground">≠</span>
            <span className="inline-flex items-center rounded border bg-muted/30 px-2 py-1 font-mono">{c.s2}</span>
            <span className="text-muted-foreground">{t("learn.rkCollisionSameHash")}</span>
            <span className="inline-flex items-center gap-1 rounded-md border border-amber-500/60 bg-amber-500/15 px-2 py-1 font-mono tabular-nums text-amber-700 dark:text-amber-300">
              <Hash className="size-3.5" />
              {c.hash}
            </span>
          </span>
        ))}
      </span>
      <span className="mt-2 block text-xs text-muted-foreground">{t("learn.rkCollisionNote")}</span>
    </Figure>
  )
}

/** Складність / ціна хешування: rolling (лінійно) проти перерахунку (n·m) на розмірах. */
export function ComplexityFigure({ caption }: { caption?: string }) {
  const t = useT()
  const samples = [
    { text: "x".repeat(16), pattern: "xxxx" },
    { text: "x".repeat(32), pattern: "xxxx" },
    { text: "x".repeat(64), pattern: "xxxx" },
  ]
  const data = samples.map((s) => ({
    n: s.text.length,
    m: s.pattern.length,
    rolling: countHashCharOps(s.text, s.pattern, true),
    recompute: countHashCharOps(s.text, s.pattern, false),
  }))
  const max = Math.max(...data.map((d) => d.recompute), 1)
  return (
    <Figure caption={caption}>
      <span className="flex flex-col gap-2">
        {data.map((d) => (
          <span key={d.n} className="block text-xs">
            <span className="mb-0.5 block tabular-nums text-muted-foreground">
              n={d.n}, m={d.m}
            </span>
            <span className="flex items-center gap-2">
              <span
                className="inline-flex h-3 items-center rounded bg-emerald-500/60"
                style={{ width: `${(d.rolling / max) * 100}%` }}
              />
              <span className="tabular-nums text-emerald-700 dark:text-emerald-400">
                {t("learn.rkCostRolling", { v: d.rolling })}
              </span>
            </span>
            <span className="mt-0.5 flex items-center gap-2">
              <span
                className="inline-flex h-3 items-center rounded bg-rose-500/60"
                style={{ width: `${(d.recompute / max) * 100}%` }}
              />
              <span className="tabular-nums text-rose-700 dark:text-rose-400">
                {t("learn.rkCostRecompute", { v: d.recompute })}
              </span>
            </span>
          </span>
        ))}
      </span>
      <span className="mt-2 block text-xs text-muted-foreground">{t("learn.rkComplexityNote")}</span>
    </Figure>
  )
}

/** Rolling-оновлення: вікно ковзає на 1, хеш перераховується за O(1) (вийшов/зайшов символ). */
export function RollingFigure({ caption }: { caption?: string }) {
  const t = useT()
  const trace = useTrace("Being a developer is not easy", "developer", true)
  const rollFrame = trace.frames.find((f) => f.panel === "search" && f.roll != null)
  if (!rollFrame || !rollFrame.roll) return <Figure caption={caption}><span className="text-xs text-muted-foreground">—</span></Figure>
  const r = rollFrame.roll
  return (
    <Figure caption={caption}>
      <span className="block">
        <StripView {...stripView(rollFrame)} size="sm" />
      </span>
      <span className="mt-2 inline-flex flex-wrap items-center gap-2 text-xs">
        <span className="font-medium text-sky-700 dark:text-sky-300">{t("play.rkRollLabel")}</span>
        <span className="font-mono tabular-nums">{t("play.rkRollOut", { out: r.outChar === " " ? "␣" : r.outChar })}</span>
        <span className="font-mono tabular-nums">{t("play.rkRollIn", { in: r.inChar === " " ? "␣" : r.inChar })}</span>
        <span className="font-mono tabular-nums">
          {r.before} → {r.after}
        </span>
      </span>
    </Figure>
  )
}
