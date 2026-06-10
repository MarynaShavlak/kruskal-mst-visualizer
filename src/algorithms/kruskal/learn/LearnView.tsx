import { LearnView as SharedLearnView } from "@/algorithms/shared/learn/LearnView"
import { LEARN_CONTENT } from "@/algorithms/kruskal/learn/learn-content"
import { figureForSrc } from "@/algorithms/kruskal/learn/figure-widgets"

/** Навчальна вкладка Краскала: спільний LearnView + живі фігури цього розділу. */
export function LearnView() {
  return <SharedLearnView content={LEARN_CONTENT} figureForSrc={figureForSrc} />
}
