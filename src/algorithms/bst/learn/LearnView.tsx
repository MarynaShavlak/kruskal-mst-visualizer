import { LearnView as SharedLearnView } from "@/algorithms/shared/learn/LearnView"
import { LEARN_CONTENT } from "@/algorithms/bst/learn/learn-content"
import { figureForSrc } from "@/algorithms/bst/learn/figure-widgets"

/** Навчальна вкладка ДДП: спільний LearnView + контент і живі фігури. */
export function LearnView() {
  return <SharedLearnView content={LEARN_CONTENT} figureForSrc={figureForSrc} />
}
