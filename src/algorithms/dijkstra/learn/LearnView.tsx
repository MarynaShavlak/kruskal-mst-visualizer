import { LearnView as SharedLearnView } from "@/algorithms/shared/learn/LearnView"
import { LEARN_CONTENT } from "@/algorithms/dijkstra/learn/learn-content"
import { figureForSrc } from "@/algorithms/dijkstra/learn/figure-widgets"

/** Навчальна вкладка Дейкстри: спільний LearnView + живі покрокові фігури. */
export function LearnView() {
  return <SharedLearnView content={LEARN_CONTENT} figureForSrc={figureForSrc} />
}
