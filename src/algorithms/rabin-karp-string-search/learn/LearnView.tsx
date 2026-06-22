import { LearnView as SharedLearnView } from "@/algorithms/shared/learn/LearnView"
import { LEARN_CONTENT } from "@/algorithms/rabin-karp-string-search/learn/learn-content"
import { figureForSrc } from "@/algorithms/rabin-karp-string-search/learn/figure-widgets"

/** Навчальна вкладка пошуку Рабіна-Карпа: спільний LearnView + живі фігури. */
export function LearnView() {
  return <SharedLearnView content={LEARN_CONTENT} figureForSrc={figureForSrc} />
}
