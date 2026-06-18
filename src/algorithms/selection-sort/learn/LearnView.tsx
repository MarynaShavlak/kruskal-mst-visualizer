import { LearnView as SharedLearnView } from "@/algorithms/shared/learn/LearnView"
import { LEARN_CONTENT } from "@/algorithms/selection-sort/learn/learn-content"
import { figureForSrc } from "@/algorithms/selection-sort/learn/figure-widgets"

/** Навчальна вкладка сортування прямим вибором: спільний LearnView + живі фігури. */
export function LearnView() {
  return <SharedLearnView content={LEARN_CONTENT} figureForSrc={figureForSrc} />
}
