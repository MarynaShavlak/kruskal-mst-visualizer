import { LearnView as SharedLearnView } from "@/algorithms/shared/learn/LearnView"
import { LEARN_CONTENT } from "@/algorithms/interpolation-search/learn/learn-content"
import { figureForSrc } from "@/algorithms/interpolation-search/learn/figure-widgets"

/** Навчальна вкладка інтерполяційного пошуку: спільний LearnView + живі фігури. */
export function LearnView() {
  return <SharedLearnView content={LEARN_CONTENT} figureForSrc={figureForSrc} />
}
