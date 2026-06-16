import { LearnView as SharedLearnView } from "@/algorithms/shared/learn/LearnView"
import { LEARN_CONTENT } from "@/algorithms/knapsack/learn/learn-content"
import { figureForSrc } from "@/algorithms/knapsack/learn/figure-widgets"

/** Навчальна вкладка рюкзака: спільний LearnView + живі фігури розділу. */
export function LearnView() {
  return <SharedLearnView content={LEARN_CONTENT} figureForSrc={figureForSrc} />
}
