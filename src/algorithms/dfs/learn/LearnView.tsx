import { LearnView as SharedLearnView } from "@/algorithms/shared/learn/LearnView"
import { LEARN_CONTENT } from "@/algorithms/dfs/learn/learn-content"

/** Навчальна вкладка DFS: спільний LearnView (без живих фігур-зображень). */
export function LearnView() {
  return <SharedLearnView content={LEARN_CONTENT} figureForSrc={() => null} />
}
