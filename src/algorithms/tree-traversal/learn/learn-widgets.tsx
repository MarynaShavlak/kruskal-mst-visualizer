// Живі навчальні віджети обходу дерева на канонічних прикладах. Усе будується з
// реального trace / прогону, тож «картинки» завжди узгоджені з кодом плеєра: анатомія
// дерева, покроковий міні-плеєр кожного з трьох обходів, і «нагорода» BST (центровий
// обхід = відсортовано). Плюс MCQ-чекпойнт.

import { useMemo, type ReactNode } from "react"
import {
  buildTree,
  traverse,
  type TraversalOrder,
} from "@/lib/treeTraversal"
import { buildTreeTraversalTrace } from "@/lib/treeTraversalTrace"
import {
  BT_BST_LEVELS,
  BT_INTRO_LEVELS,
} from "@/lib/exampleTreeTraversal"
import { TreeSvg } from "@/algorithms/tree-traversal/TreeSvg"
import { MiniPlayerShell } from "@/algorithms/shared/learn/MiniPlayerShell"
import { QuizFigure } from "@/algorithms/shared/learn/QuizFigure"
import { TT_ORDER_QUIZ } from "@/algorithms/tree-traversal/learn/learn-quiz.tree-traversal"
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

/** Trace дерева-прикладу під обраним порядком (перебудова на зміну мови). */
function useTrace(levels: readonly (number | null)[], order: TraversalOrder) {
  const t = useT()
  const lang = useLangStore((s) => s.lang)
  const tr: Translate = (k, v) => t(k as MessageKey, v)
  return useMemo(
    () => buildTreeTraversalTrace(levels, order, tr),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [levels, order, lang],
  )
}

// — Анатомія дерева: приклад із конспекту -------------------------------------

export function TtAnatomyFigure({ caption }: { caption?: string }) {
  const tree = useMemo(() => buildTree(BT_INTRO_LEVELS), [])
  return (
    <Figure caption={caption}>
      <span className="flex justify-center">
        <TreeSvg tree={tree} scale={1.4} />
      </span>
    </Figure>
  )
}

// — Покроковий міні-плеєр одного обходу ---------------------------------------

function TraversalWalkthrough({
  order,
  caption,
}: {
  order: TraversalOrder
  caption?: string
}) {
  const L = useL()
  const tree = useMemo(() => buildTree(BT_INTRO_LEVELS), [])
  const trace = useTrace(BT_INTRO_LEVELS, order)
  const player = usePlayer(trace.frames.length, order)
  const frame = trace.frames[Math.min(player.index, trace.frames.length - 1)]

  return (
    <MiniPlayerShell player={player} frameCount={trace.frames.length} caption={frame.caption}>
      <span className="flex flex-col items-center gap-3">
        <TreeSvg
          tree={tree}
          stack={frame.stack}
          visited={frame.visited}
          current={frame.justVisited}
          scale={1.25}
        />
        <span className="flex flex-wrap items-center justify-center gap-1.5">
          <span className="text-xs text-muted-foreground">{L("Вивід:", "Output:")}</span>
          {frame.output.length === 0 ? (
            <span className="text-xs text-muted-foreground">—</span>
          ) : (
            frame.output.map((v, i) => (
              <span
                key={i}
                className="inline-flex min-w-7 items-center justify-center rounded border border-emerald-500/60 bg-emerald-500/10 px-1.5 py-0.5 font-mono text-xs font-semibold text-emerald-700 tabular-nums dark:text-emerald-300"
              >
                {v}
              </span>
            ))
          )}
        </span>
        {caption && (
          <span className="block text-center text-xs text-muted-foreground">{caption}</span>
        )}
      </span>
    </MiniPlayerShell>
  )
}

export function TtPreorderFigure({ caption }: { caption?: string }) {
  return <TraversalWalkthrough order="preorder" caption={caption} />
}

export function TtInorderFigure({ caption }: { caption?: string }) {
  return <TraversalWalkthrough order="inorder" caption={caption} />
}

export function TtPostorderFigure({ caption }: { caption?: string }) {
  return <TraversalWalkthrough order="postorder" caption={caption} />
}

// — «Нагорода»: центровий обхід BST = відсортовано ----------------------------

export function TtBstFigure({ caption }: { caption?: string }) {
  const L = useL()
  const tree = useMemo(() => buildTree(BT_BST_LEVELS), [])
  const sorted = useMemo(() => traverse(tree, "inorder"), [tree])
  return (
    <Figure caption={caption}>
      <span className="flex flex-col items-center gap-3">
        <TreeSvg tree={tree} scale={1.25} />
        <span className="text-xs text-muted-foreground">
          {L("Центровий обхід:", "In-order traversal:")}
        </span>
        <span className="flex flex-wrap items-center justify-center gap-1">
          {sorted.map((v, i) => (
            <span key={i} className="inline-flex items-center gap-1">
              <span className="inline-flex min-w-7 items-center justify-center rounded border border-emerald-500/60 bg-emerald-500/10 px-1.5 py-0.5 font-mono text-sm font-semibold text-emerald-700 tabular-nums dark:text-emerald-300">
                {v}
              </span>
              {i < sorted.length - 1 && (
                <span className="text-muted-foreground">≤</span>
              )}
            </span>
          ))}
        </span>
        <span className="text-center text-xs font-medium text-emerald-600 dark:text-emerald-400">
          {L(
            "Відсортовано! Це «нагорода» дерева пошуку — місток до двійкового пошуку.",
            "Sorted! This is the search tree's “reward” — the bridge to binary search.",
          )}
        </span>
      </span>
    </Figure>
  )
}

// — MCQ-чекпойнт --------------------------------------------------------------

export function TtOrderQuizFigure({ caption }: { caption?: string }) {
  return <QuizFigure spec={TT_ORDER_QUIZ} caption={caption} />
}
