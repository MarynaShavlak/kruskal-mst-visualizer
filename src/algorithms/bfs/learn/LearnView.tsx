import { LearnView as SharedLearnView } from "@/algorithms/shared/learn/LearnView"
import { LEARN_CONTENT } from "@/algorithms/bfs/learn/learn-content"

/** Навчальна вкладка BFS: спільний LearnView (без живих фігур-зображень). */
export function LearnView() {
  return <SharedLearnView content={LEARN_CONTENT} figureForSrc={() => null} />
}
