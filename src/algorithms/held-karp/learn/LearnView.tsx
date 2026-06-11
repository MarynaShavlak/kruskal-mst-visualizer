import { LearnView as SharedLearnView } from "@/algorithms/shared/learn/LearnView"
import { LEARN_CONTENT } from "@/algorithms/held-karp/learn/learn-content"
import { figureForSrc } from "@/algorithms/held-karp/learn/figure-widgets"

/** Навчальна вкладка Хелда–Карпа: спільний LearnView + живі фігури розділу. */
export function LearnView() {
  return <SharedLearnView content={LEARN_CONTENT} figureForSrc={figureForSrc} />
}
