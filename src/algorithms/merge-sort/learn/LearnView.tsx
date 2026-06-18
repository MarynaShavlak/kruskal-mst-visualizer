import { LearnView as SharedLearnView } from "@/algorithms/shared/learn/LearnView"
import { LEARN_CONTENT } from "@/algorithms/merge-sort/learn/learn-content"
import { figureForSrc } from "@/algorithms/merge-sort/learn/figure-widgets"

/** Навчальна вкладка сортування злиттям: спільний LearnView + живі фігури. */
export function LearnView() {
  return <SharedLearnView content={LEARN_CONTENT} figureForSrc={figureForSrc} />
}
