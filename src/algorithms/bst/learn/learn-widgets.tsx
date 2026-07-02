// Живі навчальні віджети ДДП на канонічних прикладах. Усе будується з реального
// runBst / trace, тож «картинки» завжди узгоджені з плеєром: анатомія дерева, покроковий
// міні-плеєр повного туру (побудова → пошук → видалення), контраст форми (збалансоване
// проти виродженого), «нагорода» (центровий обхід = відсортовано) і MCQ-чекпойнт.

import { useMemo, type ReactNode } from "react"
import { runBst, type BstOp } from "@/lib/binarySearchTree"
import { buildBinarySearchTreeTrace } from "@/lib/binarySearchTreeTrace"
import { traverse, treeHeight } from "@/lib/treeTraversal"
import {
  BST_INTRO_OPS,
  BST_BALANCED_OPS,
  BST_DEGENERATE_OPS,
} from "@/lib/exampleBinarySearchTree"
import { TreeCanvas } from "@/algorithms/shared/tree/TreeCanvas"
import { BstTreeView } from "@/algorithms/bst/BstTreeView"
import { BST_ROLE_FILL } from "@/algorithms/bst/bst-roles"
import { MiniPlayerShell } from "@/algorithms/shared/learn/MiniPlayerShell"
import { QuizFigure } from "@/algorithms/shared/learn/QuizFigure"
import { BST_DELETE_QUIZ } from "@/algorithms/bst/learn/learn-quiz.bst"
import { usePlayer } from "@/algorithms/shared/playback/use-player"
import { useT } from "@/i18n/use-t"
import type { MessageKey } from "@/i18n/messages"
import type { Translate } from "@/lib/translate"
import { useLangStore } from "@/store/lang-store"

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

/** Лише вставки зі скрипта — щоб отримати «фінальне» дерево прикладу. */
const insertsOf = (ops: readonly BstOp[]): BstOp[] =>
  ops.filter((o) => o.kind === "insert")

/** Нейтральне (спокійне) SVG-дерево з фінального прогону скрипта вставок. */
function StaticTree({ ops, scale = 1.3 }: { ops: readonly BstOp[]; scale?: number }) {
  const tree = useMemo(() => runBst(ops).tree, [ops])
  return (
    <TreeCanvas tree={tree} scale={scale} fillClass={() => BST_ROLE_FILL.idle} />
  )
}

// — Анатомія: правило порядку -------------------------------------------------

export function BstAnatomyFigure({ caption }: { caption?: string }) {
  return (
    <Figure caption={caption}>
      <span className="flex justify-center">
        <StaticTree ops={insertsOf(BST_INTRO_OPS)} scale={1.4} />
      </span>
    </Figure>
  )
}

// — Покроковий тур: побудова → пошук → видалення ------------------------------

export function BstWalkthroughFigure({ caption }: { caption?: string }) {
  const t = useT()
  const lang = useLangStore((s) => s.lang)
  const tr: Translate = (k, v) => t(k as MessageKey, v)
  const trace = useMemo(
    () => buildBinarySearchTreeTrace(BST_INTRO_OPS, tr),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [lang],
  )
  const player = usePlayer(trace.frames.length, lang)
  const frame = trace.frames[Math.min(player.index, trace.frames.length - 1)]

  return (
    <MiniPlayerShell player={player} frameCount={trace.frames.length} caption={frame.caption}>
      <span className="flex flex-col items-center gap-3">
        <BstTreeView frame={frame} scale={1.35} />
        {caption && (
          <span className="block text-center text-xs text-muted-foreground">{caption}</span>
        )}
      </span>
    </MiniPlayerShell>
  )
}

// — Форма вирішує все: збалансоване проти виродженого -------------------------

export function BstShapeFigure({ caption }: { caption?: string }) {
  const L = useL()
  const balanced = useMemo(() => runBst(insertsOf(BST_BALANCED_OPS)), [])
  const degenerate = useMemo(() => runBst(insertsOf(BST_DEGENERATE_OPS)), [])
  return (
    <Figure caption={caption}>
      <span className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {[
          {
            run: balanced,
            title: L("Збалансоване", "Balanced"),
            note: L("висота", "height"),
            tone: "text-emerald-600 dark:text-emerald-400",
          },
          {
            run: degenerate,
            title: L("Вироджене (ланцюг)", "Degenerate (chain)"),
            note: L("висота", "height"),
            tone: "text-rose-600 dark:text-rose-400",
          },
        ].map((c, i) => (
          <span key={i} className="flex flex-col items-center gap-2">
            <span className={`text-xs font-medium ${c.tone}`}>{c.title}</span>
            <TreeCanvas
              tree={c.run.tree}
              scale={1.05}
              fillClass={() => BST_ROLE_FILL.idle}
            />
            <span className="text-xs text-muted-foreground">
              {c.note}: <span className="font-mono font-semibold tabular-nums">{c.run.height}</span>
              {" · O("}
              {i === 0 ? "log n" : "n"}
              {")"}
            </span>
          </span>
        ))}
      </span>
    </Figure>
  )
}

// — «Нагорода»: центровий обхід = відсортовано --------------------------------

export function BstInorderFigure({ caption }: { caption?: string }) {
  const L = useL()
  const tree = useMemo(() => runBst(insertsOf(BST_INTRO_OPS)).tree, [])
  const sorted = useMemo(() => traverse(tree, "inorder"), [tree])
  const height = treeHeight(tree)
  return (
    <Figure caption={caption}>
      <span className="flex flex-col items-center gap-3">
        <TreeCanvas tree={tree} scale={1.25} fillClass={() => BST_ROLE_FILL.idle} />
        <span className="text-xs text-muted-foreground">
          {L("Центровий обхід:", "In-order traversal:")}
        </span>
        <span className="flex flex-wrap items-center justify-center gap-1">
          {sorted.map((v, i) => (
            <span key={i} className="inline-flex items-center gap-1">
              <span className="inline-flex min-w-7 items-center justify-center rounded border border-emerald-500/60 bg-emerald-500/10 px-1.5 py-0.5 font-mono text-sm font-semibold text-emerald-700 tabular-nums dark:text-emerald-300">
                {v}
              </span>
              {i < sorted.length - 1 && <span className="text-muted-foreground">≤</span>}
            </span>
          ))}
        </span>
        <span className="text-center text-xs font-medium text-emerald-600 dark:text-emerald-400">
          {L(
            `Відсортовано (висота ${height})! Це «нагорода» дерева пошуку — місток до двійкового пошуку.`,
            `Sorted (height ${height})! This is the search tree's “reward” — the bridge to binary search.`,
          )}
        </span>
      </span>
    </Figure>
  )
}

// — MCQ-чекпойнт --------------------------------------------------------------

export function BstDeleteQuizFigure({ caption }: { caption?: string }) {
  return <QuizFigure spec={BST_DELETE_QUIZ} caption={caption} />
}
