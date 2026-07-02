// Панель-прев'ю редактора ДДП: живе SVG фінального дерева (після прогону всього
// скрипта) + підсумок (вузли / висота) і центровий обхід (відсортований). Читає стор,
// проганяє runBst. Порожнє дерево → підказка.

import { useMemo } from "react"
import { runBst } from "@/lib/binarySearchTree"
import { traverse } from "@/lib/treeTraversal"
import { formatArray } from "@/lib/arrayUtils"
import { SummaryCard, SummaryRow } from "@/algorithms/shared/editor/summary"
import { TreeCanvas } from "@/algorithms/shared/tree/TreeCanvas"
import { BST_ROLE_FILL } from "@/algorithms/bst/bst-roles"
import { useBstStore } from "@/store/bst-store"
import { useT } from "@/i18n/use-t"
import { cn } from "@/lib/utils"

export function BstPreviewPanel({ className }: { className?: string }) {
  const ops = useBstStore((s) => s.ops)
  const t = useT()

  const run = useMemo(() => runBst(ops), [ops])
  const empty = run.tree.root === null

  return (
    <div className={cn("space-y-3", className)}>
      <SummaryCard>
        <div className="mb-2 text-sm font-medium">{t("editor.bstPreviewTitle")}</div>
        {empty ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            {t("editor.bstEmpty")}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <TreeCanvas
              tree={run.tree}
              fillClass={() => BST_ROLE_FILL.idle}
              lightText={() => false}
            />
          </div>
        )}
      </SummaryCard>

      {!empty && (
        <SummaryCard>
          <div className="mb-2 text-sm font-medium">{t("editor.bstSummaryTitle")}</div>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-1">
            <SummaryRow label={t("editor.bstNodes")} value={String(run.size)} mono />
            <SummaryRow label={t("editor.bstHeight")} value={String(run.height)} mono />
          </dl>
          <dl className="mt-2 grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-1 border-t pt-2">
            <SummaryRow
              label={t("editor.bstInorder")}
              value={formatArray(traverse(run.tree, "inorder"))}
              mono
            />
          </dl>
          <p className="mt-3 text-xs text-muted-foreground">{t("editor.bstHelpNote")}</p>
        </SummaryCard>
      )}
    </div>
  )
}
