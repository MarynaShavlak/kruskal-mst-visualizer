import { LearnView as SharedLearnView } from "@/algorithms/shared/learn/LearnView"
import { LEARN_CONTENT } from "@/algorithms/boyer-moore-string-search/learn/learn-content"
import { figureForSrc } from "@/algorithms/boyer-moore-string-search/learn/figure-widgets"

/** Навчальна вкладка пошуку Боєра-Мура: спільний LearnView + живі фігури. */
export function LearnView() {
  return <SharedLearnView content={LEARN_CONTENT} figureForSrc={figureForSrc} />
}
