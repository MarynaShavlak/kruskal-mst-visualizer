import { LearnView as SharedLearnView } from "@/algorithms/shared/learn/LearnView"
import { LEARN_CONTENT } from "@/algorithms/kmp-string-search/learn/learn-content"
import { figureForSrc } from "@/algorithms/kmp-string-search/learn/figure-widgets"

/** Навчальна вкладка KMP: спільний LearnView + живі фігури (таблиця lps + стрічка пошуку). */
export function LearnView() {
  return <SharedLearnView content={LEARN_CONTENT} figureForSrc={figureForSrc} />
}
