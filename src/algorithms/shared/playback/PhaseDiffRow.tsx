import { ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { useT } from "@/i18n/use-t"
import type { PhaseDiff } from "@/algorithms/shared/playback/use-phase-markers"

/**
 * Компактний рядок-діф «фаза→фаза»: рендериться ЛИШЕ на кадрах-межах (вхід у нову
 * фазу), показуючи «{попередня} → {поточна}». На немежових кадрах нічого не малює —
 * рядок не блимає на кожному кроці, лише на семантичних переходах.
 */
export function PhaseDiffRow({ diff }: { diff: PhaseDiff | null }) {
  const t = useT()
  if (!diff || !diff.atBoundary || diff.previousLabel == null) return null

  return (
    <div className="flex items-center gap-2 rounded-md border border-primary/30 bg-primary/5 px-3 py-1.5 text-xs">
      <span className="font-medium text-muted-foreground">{t("play.diffPhaseChange")}</span>
      <span className="inline-flex items-center gap-1.5 font-medium">
        <span className={cn("text-muted-foreground")}>{diff.previousLabel}</span>
        <ArrowRight className="size-3.5 text-primary" />
        <span className="text-foreground">{diff.currentLabel}</span>
      </span>
    </div>
  )
}
