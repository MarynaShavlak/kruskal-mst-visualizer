import { LearnView as SharedLearnView } from "@/algorithms/shared/learn/LearnView"
import { LEARN_CONTENT } from "@/algorithms/linear-search/learn/learn-content"
import { figureForSrc } from "@/algorithms/linear-search/learn/figure-widgets"

/** Навчальна вкладка лінійного пошуку: спільний LearnView + живі фігури. */
export function LearnView() {
  return <SharedLearnView content={LEARN_CONTENT} figureForSrc={figureForSrc} />
}
