// Панель-прев'ю редактора: живе SVG дерева + підсумок (вузли / листя / висота) і три
// обходи, пораховані одразу з поточного дерева. Читає стор, будує дерево через
// buildTree. Порожнє дерево → підказка.

import { useMemo } from "react"
import {
  buildTree,
  countLeaves,
  nodeCount,
  traverse,
  treeHeight,
} from "@/lib/treeTraversal"
import { formatArray } from "@/lib/arrayUtils"
import { SummaryCard, SummaryRow } from "@/algorithms/shared/editor/summary"
import { TreeSvg } from "@/algorithms/tree-traversal/TreeSvg"
import { useTreeTraversalStore } from "@/store/tree-traversal-store"
import { useT } from "@/i18n/use-t"
import { cn } from "@/lib/utils"

export function TreePreviewPanel({ className }: { className?: string }) {
  const levels = useTreeTraversalStore((s) => s.levels)
  const t = useT()

  const tree = useMemo(() => buildTree(levels), [levels])
  const empty = tree.root === null

  return (
    <div className={cn("space-y-3", className)}>
      <SummaryCard>
        <div className="mb-2 text-sm font-medium">{t("editor.btPreviewTitle")}</div>
        {empty ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            {t("editor.btEmpty")}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <TreeSvg tree={tree} />
          </div>
        )}
      </SummaryCard>

      {!empty && (
        <SummaryCard>
          <div className="mb-2 text-sm font-medium">{t("editor.btSummaryTitle")}</div>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-1">
            <SummaryRow label={t("editor.btNodes")} value={String(nodeCount(tree))} mono />
            <SummaryRow label={t("editor.btLeaves")} value={String(countLeaves(tree))} mono />
            <SummaryRow label={t("editor.btHeight")} value={String(treeHeight(tree))} mono />
          </dl>
          <dl className="mt-2 grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-1 border-t pt-2">
            <SummaryRow
              label={t("editor.btPreorder")}
              value={formatArray(traverse(tree, "preorder"))}
              mono
            />
            <SummaryRow
              label={t("editor.btInorder")}
              value={formatArray(traverse(tree, "inorder"))}
              mono
            />
            <SummaryRow
              label={t("editor.btPostorder")}
              value={formatArray(traverse(tree, "postorder"))}
              mono
            />
          </dl>
          <p className="mt-3 text-xs text-muted-foreground">{t("editor.btHelpNote")}</p>
        </SummaryCard>
      )}
    </div>
  )
}
