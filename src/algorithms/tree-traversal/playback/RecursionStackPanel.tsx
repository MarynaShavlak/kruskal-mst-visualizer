// Панель стеку рекурсії — педагогічне серце розділу: саме порядок укладання й
// зняття кадрів функції traverse() породжує порядок обходу. Показуємо стек від
// поточного (найглибшого) виклику згори до кореня знизу; верхній кадр підсвічено.

import { Panel } from "@/algorithms/shared/playback/Panel"
import type { BinaryTree } from "@/lib/treeTraversal"
import type { BtFrame } from "@/lib/treeTraversalTrace"
import { useT } from "@/i18n/use-t"
import { cn } from "@/lib/utils"

export function RecursionStackPanel({
  tree,
  frame,
  className,
}: {
  tree: BinaryTree
  frame: BtFrame
  className?: string
}) {
  const t = useT()
  // Згори — найглибший (поточний) виклик, знизу — корінь.
  const entries = [...frame.stack].reverse()

  return (
    <Panel title={t("play.btStackTitle")} className={className}>
      {entries.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">
          {t("play.btStackEmpty")}
        </p>
      ) : (
        <ul className="flex flex-col gap-1">
          {entries.map((id, idx) => {
            const node = tree.nodes[id]
            const isTop = idx === 0
            return (
              <li
                key={id}
                className={cn(
                  "flex items-center justify-between rounded-md border px-2.5 py-1.5 font-mono text-sm tabular-nums",
                  isTop
                    ? "border-sky-500 bg-sky-500/10 font-semibold text-sky-700 dark:text-sky-300"
                    : "border-border bg-muted/30 text-muted-foreground",
                )}
                style={{ marginLeft: `${(entries.length - 1 - idx) * 12}px` }}
              >
                <span>traverse({node.value})</span>
                <span className="text-xs opacity-70">d{node.depth}</span>
              </li>
            )
          })}
        </ul>
      )}
    </Panel>
  )
}
