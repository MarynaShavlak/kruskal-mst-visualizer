import { LearnView as SharedLearnView } from "@/algorithms/shared/learn/LearnView"
import { LEARN_CONTENT } from "@/algorithms/heap-sort/learn/learn-content"
import { figureForSrc } from "@/algorithms/heap-sort/learn/figure-widgets"

/** Навчальна вкладка пірамідального сортування: спільний LearnView + живі фігури. */
export function LearnView() {
  return <SharedLearnView content={LEARN_CONTENT} figureForSrc={figureForSrc} />
}
