// Панель плеєра з SVG-деревом: вузли розфарбовані за станом обходу (ще не дійшли /
// на стеку рекурсії / відвідуємо зараз / у виводі), активний ланцюг рекурсії
// підсвічено ребрами. Легенда — спільним LegendRow із тими самими класами кольору.

import { Panel } from "@/algorithms/shared/playback/Panel"
import { LegendRow } from "@/algorithms/shared/playback/LegendRow"
import { TreeSvg } from "@/algorithms/tree-traversal/TreeSvg"
import { TREE_ROLE_SWATCH } from "@/algorithms/tree-traversal/tree-roles"
import type { BinaryTree } from "@/lib/treeTraversal"
import type { BtFrame } from "@/lib/treeTraversalTrace"
import { useT } from "@/i18n/use-t"

export function TreeView({
  tree,
  frame,
  className,
}: {
  tree: BinaryTree
  frame: BtFrame
  className?: string
}) {
  const t = useT()
  return (
    <Panel title={t("play.btTreeTitle")} className={className}>
      <div className="flex h-full flex-col gap-3">
        <div className="flex flex-1 items-center justify-center overflow-auto">
          <TreeSvg
            tree={tree}
            stack={frame.stack}
            visited={frame.visited}
            current={frame.justVisited}
          />
        </div>
        <LegendRow
          entries={[
            { label: t("play.btLegendPending"), cls: TREE_ROLE_SWATCH.pending },
            { label: t("play.btLegendStack"), cls: TREE_ROLE_SWATCH.stack },
            { label: t("play.btLegendCurrent"), cls: TREE_ROLE_SWATCH.current },
            { label: t("play.btLegendDone"), cls: TREE_ROLE_SWATCH.done },
          ]}
        />
      </div>
    </Panel>
  )
}
