import type { ReactNode } from "react"
import { FigureCard } from "@/algorithms/shared/learn/FigureCard"
import { mergeSort } from "@/lib/mergeSort"
import {
  MERGE_INTRO,
  MERGE_CONSPECT,
  MERGE_DEMO_LEFT,
  MERGE_DEMO_RIGHT,
  MERGE_DUPLICATES,
} from "@/lib/exampleMergeSort"
import {
  CodeWalkthroughFigure,
  GrowthFigure,
  IdeaFigure,
  LevelsFigure,
  MergeAnimationFigure,
  ResultFigure,
  StabilityFigure,
  StepFigure,
  TreeAnimationFigure,
  TreeFigure,
} from "@/algorithms/merge-sort/learn/learn-widgets"

/** Дві відсортовані половини масиву (для фігур окремого злиття на рівні кореня). */
function rootHalves(values: readonly number[]): { left: number[]; right: number[] } {
  const mid = Math.floor(values.length / 2)
  return { left: mergeSort(values.slice(0, mid)), right: mergeSort(values.slice(mid)) }
}

/**
 * Замінює статичні фігури README (`docs/images/…`, у EN — `docs/images/en/…`)
 * живими віджетами на еталонних масивах. Мапить за іменем файлу без розширення.
 * Головні образи — дерево рекурсії й зіркова панель злиття. Невідоме ім'я →
 * запасна картка з підписом.
 *
 * Повне покрокове трасування INTRO `[8,4,6,2,7,1,5,3]`: 24 кадри (старт + 7 поділів
 * + 8 базових + 7 злить + готово) збігаються кадр-у-кадр зі знімками README. Тож
 * walkthrough/step_NN ↔ stepIndices[NN] trace дерева рекурсії.
 */
export function figureForSrc(
  src: string | undefined,
  alt: string | undefined,
): ReactNode {
  const base = (src ?? "").split("/").pop() ?? ""
  const stem = base.replace(/\.(png|gif|mp4)$/i, "")
  const caption = alt ?? ""

  // Повне покрокове трасування: walkthrough/step_NN → крок NN trace.
  const walk = /^step_(\d+)$/.exec(stem)
  if (walk) {
    return <StepFigure values={MERGE_INTRO} eventIndex={Number(walk[1])} caption={caption} />
  }

  const intro = rootHalves(MERGE_INTRO) // [2,4,6,8] + [1,3,5,7]
  const dup = rootHalves(MERGE_DUPLICATES) // [1,3,3] + [1,2,3]

  switch (stem) {
    case "idea_intro":
      return <IdeaFigure values={MERGE_INTRO} caption={caption} />
    case "idea_merge_steps":
    case "merge_step":
    case "merge_step_grid":
      // Окрема операція злиття двох відсортованих половин (приклад [3,5] + [2,4,8]).
      return <MergeAnimationFigure left={MERGE_DEMO_LEFT} right={MERGE_DEMO_RIGHT} caption={caption} />
    case "merge_root_intro":
      // Злиття на рівні кореня головного прикладу.
      return <MergeAnimationFigure left={intro.left} right={intro.right} caption={caption} />
    case "recursion_intro":
      return <TreeAnimationFigure values={MERGE_INTRO} caption={caption} />
    case "tree_intro":
      return <TreeFigure values={MERGE_INTRO} caption={caption} />
    case "levels_intro":
      return <LevelsFigure values={MERGE_INTRO} caption={caption} />
    case "result_intro":
      return <ResultFigure values={MERGE_INTRO} caption={caption} />
    case "growth":
      return <GrowthFigure caption={caption} />
    case "merge_duplicates":
      // Злиття на рівні кореня масиву з дублікатами: рівні ключі — з лівої першими.
      return <MergeAnimationFigure left={dup.left} right={dup.right} caption={caption} />
    case "result_duplicates":
      return <StabilityFigure caption={caption} />
    case "code_walk_conspect":
    case "code_steps_conspect":
      return <CodeWalkthroughFigure values={MERGE_CONSPECT} caption={caption} />
    default:
      return <FigureCard caption={caption} />
  }
}
