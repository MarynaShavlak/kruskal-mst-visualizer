import { LearnView as SharedLearnView } from "@/algorithms/shared/learn/LearnView"
import { LEARN_CONTENT } from "@/algorithms/bfs/learn/learn-content"
import { figureForSrc } from "@/algorithms/bfs/learn/figure-widgets"

/** Навчальна вкладка BFS: спільний LearnView + живі покрокові фігури. */
export function LearnView() {
  return <SharedLearnView content={LEARN_CONTENT} figureForSrc={figureForSrc} />
}
