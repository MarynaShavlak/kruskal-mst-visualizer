import type { ReactNode } from "react"
import { FigureCard } from "@/algorithms/shared/learn/FigureCard"
import { HEAP_INTRO } from "@/lib/exampleHeapSort"
import {
  BuildHeapFigure,
  GrowthFigure,
  HeapArrayFigure,
  HeapStepFigure,
  HeapWalkthrough,
  IndexMapFigure,
  MaxHeapQuizFigure,
  NonAdaptiveFigure,
  OrderCompareFigure,
} from "@/algorithms/heap-sort/learn/learn-widgets"

/**
 * Замінює статичні фігури README живими віджетами на еталонному масиві
 * `[12, 11, 13, 5, 6, 7]`. Мапить за іменем файлу без розширення. Невідоме ім'я →
 * запасна картка. Покрокові фігури `step_NN` ↔ кадр NN trace INTRO (max-купа).
 */
export function figureForSrc(
  src: string | undefined,
  alt: string | undefined,
): ReactNode {
  const base = (src ?? "").split("/").pop() ?? ""
  const stem = base.replace(/\.(png|gif|mp4|svg)$/i, "")
  const caption = alt ?? ""

  const step = /^step_(\d+)$/.exec(stem)
  if (step) {
    return <HeapStepFigure values={HEAP_INTRO} eventIndex={Number(step[1])} caption={caption} />
  }

  switch (stem) {
    case "heap_array_intro":
      return <HeapArrayFigure values={HEAP_INTRO} caption={caption} />
    case "heap_index_map":
      return <IndexMapFigure values={HEAP_INTRO} caption={caption} />
    case "heap_build":
      return <BuildHeapFigure values={HEAP_INTRO} order="asc" caption={caption} />
    case "heap_walk":
      return <HeapWalkthrough values={HEAP_INTRO} order="asc" caption={caption} />
    case "heap_walk_desc":
      return <HeapWalkthrough values={HEAP_INTRO} order="desc" caption={caption} />
    case "order_compare":
      return <OrderCompareFigure values={HEAP_INTRO} caption={caption} />
    case "non_adaptive":
      return <NonAdaptiveFigure caption={caption} />
    case "growth":
      return <GrowthFigure caption={caption} />
    case "max_heap_quiz":
      return <MaxHeapQuizFigure caption={caption} />
    default:
      return <FigureCard caption={caption} />
  }
}
