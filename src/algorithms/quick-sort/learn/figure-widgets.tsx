import type { ReactNode } from "react"
import { FigureCard } from "@/algorithms/shared/learn/FigureCard"
import {
  QUICK_INTRO,
  QUICK_SORTED,
  QUICK_CONSPECT,
  QUICK_DUPLICATES,
} from "@/lib/exampleQuickSort"
import {
  ArrayFigure,
  CodeWalkthroughFigure,
  GrowthFigure,
  LevelsFigure,
  PartitionAnimationFigure,
  PartitionFigure,
  ResultFigure,
  StabilityFigure,
  StepFigure,
  TreeAnimationFigure,
  TreeFigure,
} from "@/algorithms/quick-sort/learn/learn-widgets"

/**
 * Замінює статичні фігури README (`docs/images/…`, у EN — `docs/images/en/…`)
 * живими віджетами на еталонних масивах. Мапить за іменем файлу без розширення.
 * Головний образ — дерево рекурсії. Невідоме ім'я → запасна картка з підписом.
 *
 * Повне покрокове трасування INTRO `[3,5,2,4,6,1,7]` (опорний-середина): 7 викликів
 * у pre-order збігаються кадр-у-кадр зі знімками README. Тож walkthrough/step_NN ↔
 * вузол NN дерева рекурсії.
 */
export function figureForSrc(
  src: string | undefined,
  alt: string | undefined,
): ReactNode {
  const base = (src ?? "").split("/").pop() ?? ""
  const stem = base.replace(/\.(png|gif|mp4)$/i, "")
  const caption = alt ?? ""

  // Повне покрокове трасування: walkthrough/step_NN → вузол NN дерева.
  const walk = /^step_(\d+)$/.exec(stem)
  if (walk) {
    return <StepFigure values={QUICK_INTRO} eventIndex={Number(walk[1])} caption={caption} />
  }

  switch (stem) {
    case "array_intro":
      return <ArrayFigure values={QUICK_INTRO} caption={caption} />
    case "partition_idea":
    case "partition_intro":
      // Один акт розбиття — корінь головного прикладу (опорний 4).
      return <PartitionFigure values={QUICK_INTRO} eventIndex={0} caption={caption} />
    case "partitions_intro":
      return <PartitionAnimationFigure values={QUICK_INTRO} caption={caption} />
    case "tree_intro":
      return <TreeFigure values={QUICK_INTRO} caption={caption} />
    case "tree_grow_intro":
      return <TreeAnimationFigure values={QUICK_INTRO} caption={caption} />
    case "levels_intro":
      return <LevelsFigure values={QUICK_INTRO} caption={caption} />
    case "result_intro":
      return <ResultFigure values={QUICK_INTRO} caption={caption} />
    case "tree_balanced":
      // Збалансоване дерево: опорний-середина на відсортованому вході (медіана).
      return <TreeFigure values={QUICK_SORTED} strategy="middle" caption={caption} />
    case "tree_degenerate":
      // Вироджене дерево: опорний-перший на відсортованому вході (ланцюг).
      return <TreeFigure values={QUICK_SORTED} strategy="first" caption={caption} />
    case "growth":
      return <GrowthFigure caption={caption} />
    case "array_duplicates":
      return <ArrayFigure values={QUICK_DUPLICATES} caption={caption} />
    case "tree_duplicates":
      return <TreeFigure values={QUICK_DUPLICATES} caption={caption} />
    case "result_duplicates":
      return <ResultFigure values={QUICK_DUPLICATES} caption={caption} />
    case "stability_duplicates":
      return <StabilityFigure caption={caption} />
    case "code_steps_conspect":
    case "code_walk_conspect":
      return <CodeWalkthroughFigure values={QUICK_CONSPECT} caption={caption} />
    default:
      return <FigureCard caption={caption} />
  }
}
