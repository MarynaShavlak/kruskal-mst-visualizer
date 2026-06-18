import { ArrowRight } from "lucide-react"
import { Panel } from "@/algorithms/shared/playback/Panel"
import { ArrayChips } from "@/algorithms/quick-sort/playback/QuickTreePanel"
import type { QsPhase, QsTreeNode } from "@/lib/quickSortTrace"
import { useT } from "@/i18n/use-t"
import { cn } from "@/lib/utils"

/**
 * Розбиття поточного вузла «під мікроскопом»: підмасив → опорний → три частини
 * (left `<` | middle `==` | right `>`). У базовому випадку — повернення як є; на
 * фінальному кадрі — конкатенована відповідь кореня.
 */
export function QuickPartitionPanel({
  node,
  phase,
  sorted,
  className,
}: {
  node: QsTreeNode
  phase: QsPhase
  sorted: readonly number[]
  className?: string
}) {
  const t = useT()

  return (
    <Panel
      title={t("play.qsPartitionTitle")}
      className={className}
      bodyClassName="flex flex-col gap-3 p-3"
    >
      {phase === "done" ? (
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="text-muted-foreground">{t("play.qsConcat")}</span>
          <ArrayChips array={sorted} mode="sorted" />
        </div>
      ) : phase === "base" ? (
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <ArrayChips array={node.array} mode="sorted" />
          <span className="text-muted-foreground">{t("play.qsBaseNote")}</span>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="text-muted-foreground">{t("play.qsPivotLabel")}</span>
            <span className="rounded bg-violet-500/85 px-1.5 py-0.5 text-[12px] font-semibold text-white tabular-nums">
              {node.pivot}
            </span>
            <ArrayChips array={node.array} pivot={node.pivot} pivotIndex={node.pivotIndex} />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <ArrowRight className="size-4 text-muted-foreground" />
            <Part label="left (<)" array={node.left ?? []} tone="less" />
            <Part label="middle (==)" array={node.middle ?? []} tone="equal" />
            <Part label="right (>)" array={node.right ?? []} tone="greater" />
          </div>
        </div>
      )}
    </Panel>
  )
}

const TONE: Record<string, string> = {
  less: "border-sky-500/40 bg-sky-500/10",
  equal: "border-fuchsia-400/40 bg-fuchsia-400/10",
  greater: "border-orange-400/40 bg-orange-400/10",
}

function Part({
  label,
  array,
  tone,
}: {
  label: string
  array: readonly number[]
  tone: "less" | "equal" | "greater"
}) {
  return (
    <div className={cn("flex flex-col gap-1 rounded-md border px-2 py-1.5", TONE[tone])}>
      <span className="font-mono text-[10px] text-muted-foreground">{label}</span>
      <span className="font-mono text-[12px] tabular-nums">
        [{array.join(", ")}]
      </span>
    </div>
  )
}
