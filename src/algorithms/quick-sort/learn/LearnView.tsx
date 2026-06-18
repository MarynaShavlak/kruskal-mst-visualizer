import { LearnView as SharedLearnView } from "@/algorithms/shared/learn/LearnView"
import { LEARN_CONTENT } from "@/algorithms/quick-sort/learn/learn-content"
import { figureForSrc } from "@/algorithms/quick-sort/learn/figure-widgets"

/** Навчальна вкладка швидкого сортування: спільний LearnView + живі фігури. */
export function LearnView() {
  return <SharedLearnView content={LEARN_CONTENT} figureForSrc={figureForSrc} />
}
