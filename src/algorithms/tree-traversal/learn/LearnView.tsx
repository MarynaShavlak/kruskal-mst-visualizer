import { LearnView as SharedLearnView } from "@/algorithms/shared/learn/LearnView"
import { LEARN_CONTENT } from "@/algorithms/tree-traversal/learn/learn-content"
import { figureForSrc } from "@/algorithms/tree-traversal/learn/figure-widgets"

/** Навчальна вкладка обходу дерева: спільний LearnView + контент і живі фігури. */
export function LearnView() {
  return <SharedLearnView content={LEARN_CONTENT} figureForSrc={figureForSrc} />
}
