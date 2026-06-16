import { LearnView as SharedLearnView } from "@/algorithms/shared/learn/LearnView"
import { LEARN_CONTENT } from "@/algorithms/prim/learn/learn-content"
import { figureForSrc } from "@/algorithms/prim/learn/figure-widgets"

/** Навчальна вкладка Прима: спільний LearnView + живі фігури розділу. */
export function LearnView() {
  return <SharedLearnView content={LEARN_CONTENT} figureForSrc={figureForSrc} />
}
