import { LearnView as SharedLearnView } from "@/algorithms/shared/learn/LearnView"
import { LEARN_CONTENT } from "@/algorithms/binary-search/learn/learn-content"
import { figureForSrc } from "@/algorithms/binary-search/learn/figure-widgets"

/** Навчальна вкладка двійкового пошуку: спільний LearnView + живі фігури. */
export function LearnView() {
  return <SharedLearnView content={LEARN_CONTENT} figureForSrc={figureForSrc} />
}
