import { LearnView as SharedLearnView } from "@/algorithms/shared/learn/LearnView"
import { LEARN_CONTENT } from "@/algorithms/dfs/learn/learn-content"
import { figureForSrc } from "@/algorithms/dfs/learn/figure-widgets"

/** Навчальна вкладка DFS: спільний LearnView + живі покрокові фігури. */
export function LearnView() {
  return <SharedLearnView content={LEARN_CONTENT} figureForSrc={figureForSrc} />
}
