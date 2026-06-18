import { LearnView as SharedLearnView } from "@/algorithms/shared/learn/LearnView"
import { LEARN_CONTENT } from "@/algorithms/shell-sort/learn/learn-content"
import { figureForSrc } from "@/algorithms/shell-sort/learn/figure-widgets"

/** Навчальна вкладка сортування Шелла: спільний LearnView + живі фігури. */
export function LearnView() {
  return <SharedLearnView content={LEARN_CONTENT} figureForSrc={figureForSrc} />
}
