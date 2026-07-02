import { LearnView as SharedLearnView } from "@/algorithms/shared/learn/LearnView"
import { LEARN_CONTENT } from "@/algorithms/hash-table/learn/learn-content"
import { figureForSrc } from "@/algorithms/hash-table/learn/figure-widgets"

/** Навчальна вкладка хеш-таблиці: спільний LearnView + (поки текстовий) контент. */
export function LearnView() {
  return <SharedLearnView content={LEARN_CONTENT} figureForSrc={figureForSrc} />
}
