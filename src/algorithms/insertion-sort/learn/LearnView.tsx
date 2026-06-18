import { LearnView as SharedLearnView } from "@/algorithms/shared/learn/LearnView"
import { LEARN_CONTENT } from "@/algorithms/insertion-sort/learn/learn-content"
import { figureForSrc } from "@/algorithms/insertion-sort/learn/figure-widgets"

/** Навчальна вкладка сортування вставками: спільний LearnView + живі фігури. */
export function LearnView() {
  return <SharedLearnView content={LEARN_CONTENT} figureForSrc={figureForSrc} />
}
