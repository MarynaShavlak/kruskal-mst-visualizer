import { LearnView as SharedLearnView } from "@/algorithms/shared/learn/LearnView"
import { LEARN_CONTENT } from "@/algorithms/dijkstra/learn/learn-content"

/** Навчальна вкладка Дейкстри: спільний LearnView (без живих фігур-зображень). */
export function LearnView() {
  return <SharedLearnView content={LEARN_CONTENT} figureForSrc={() => null} />
}
