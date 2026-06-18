import { LearnView as SharedLearnView } from "@/algorithms/shared/learn/LearnView"
import { LEARN_CONTENT } from "@/algorithms/indexed-sequential-search/learn/learn-content"
import { figureForSrc } from "@/algorithms/indexed-sequential-search/learn/figure-widgets"

/** Навчальна вкладка індексно-послідовного пошуку: спільний LearnView + живі фігури. */
export function LearnView() {
  return <SharedLearnView content={LEARN_CONTENT} figureForSrc={figureForSrc} />
}
