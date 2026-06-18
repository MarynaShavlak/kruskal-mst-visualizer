import { LearnView as SharedLearnView } from "@/algorithms/shared/learn/LearnView"
import { LEARN_CONTENT } from "@/algorithms/radix-sort/learn/learn-content"
import { figureForSrc } from "@/algorithms/radix-sort/learn/figure-widgets"

/** Навчальна вкладка порозрядного сортування: спільний LearnView + живі фігури. */
export function LearnView() {
  return <SharedLearnView content={LEARN_CONTENT} figureForSrc={figureForSrc} />
}
