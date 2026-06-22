import { LearnView as SharedLearnView } from "@/algorithms/shared/learn/LearnView"
import { LEARN_CONTENT } from "@/algorithms/naive-string-search/learn/learn-content"
import { figureForSrc } from "@/algorithms/naive-string-search/learn/figure-widgets"

/** Навчальна вкладка наївного пошуку в рядках: спільний LearnView + живі фігури. */
export function LearnView() {
  return <SharedLearnView content={LEARN_CONTENT} figureForSrc={figureForSrc} />
}
