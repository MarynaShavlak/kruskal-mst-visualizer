import { LearnView as SharedLearnView } from "@/algorithms/shared/learn/LearnView"
import { LEARN_CONTENT } from "@/algorithms/floyd-warshall/learn/learn-content"
import { figureForSrc } from "@/algorithms/floyd-warshall/learn/figure-widgets"

/** Навчальна вкладка Флойда–Воршала: спільний LearnView + живі фігури розділу. */
export function LearnView() {
  return <SharedLearnView content={LEARN_CONTENT} figureForSrc={figureForSrc} />
}
