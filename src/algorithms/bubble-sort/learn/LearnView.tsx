import { LearnView as SharedLearnView } from "@/algorithms/shared/learn/LearnView"
import { LEARN_CONTENT } from "@/algorithms/bubble-sort/learn/learn-content"
import { figureForSrc } from "@/algorithms/bubble-sort/learn/figure-widgets"

/** Навчальна вкладка бульбашкового сортування: спільний LearnView + живі фігури. */
export function LearnView() {
  return <SharedLearnView content={LEARN_CONTENT} figureForSrc={figureForSrc} />
}
