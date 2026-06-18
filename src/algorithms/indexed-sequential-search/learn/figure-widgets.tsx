import type { ReactNode } from "react"
import { FigureCard } from "@/algorithms/shared/learn/FigureCard"
import { IXS_MAIN } from "@/lib/exampleIndexedSequentialSearch"
import {
  AnimationFigure,
  CodeWalkthroughFigure,
  ComplexityFigure,
  EvolutionFigure,
  IntuitionFigure,
  ResultFigure,
  StepFigure,
  StepTableFigure,
  StepTradeoffFigure,
  TwoLevelFigure,
} from "@/algorithms/indexed-sequential-search/learn/learn-widgets"

/**
 * Замінює статичні фігури README (`docs/images/…`, у EN — `docs/images/en/…`) живими
 * віджетами на еталонному масиві `[1,3,…,25]` (крок 4, ціль 15). Мапить за іменем
 * файлу без розширення. Головний образ — ДВА РІВНІ: 🟪 індекс + ⬜ масив із блоками.
 * Невідоме ім'я → запасна картка.
 *
 * Повне трасування головного прикладу: 15 кадрів = step_00…step_14 (кадр NN ↔
 * walkthrough/step_NN). Покрокові step_main_K ↔ кадр-розв'язок (init/probe/block/seq).
 */
// step_main_0..7 — «одна подія на кадр»: init, розв'язок проби 1, розв'язок проби 2,
// вибір блоку, розв'язок сканів 4,5,6 та збіг → кадри trace 0,2,4,5,7,9,11,13.
const STEP_MAIN_FRAMES = [0, 2, 4, 5, 7, 9, 11, 13] as const

export function figureForSrc(
  src: string | undefined,
  alt: string | undefined,
): ReactNode {
  const base = (src ?? "").split("/").pop() ?? ""
  const stem = base.replace(/\.(png|gif|mp4)$/i, "")
  const caption = alt ?? ""
  const { values, target, step } = IXS_MAIN

  // Повне трасування: walkthrough/step_NN → кадр NN trace головного прикладу.
  const walk = /^step_(\d+)$/.exec(stem)
  if (walk) {
    return <StepFigure values={values} target={target} step={step} frameIndex={Number(walk[1])} caption={caption} />
  }

  // Покрокові step_main_K → кадр-розв'язок STEP_MAIN_FRAMES[K].
  const main = /^step_main_(\d+)$/.exec(stem)
  if (main) {
    const k = Number(main[1])
    const frame = STEP_MAIN_FRAMES[k] ?? 0
    return <StepFigure values={values} target={target} step={step} frameIndex={frame} caption={caption} />
  }

  switch (stem) {
    case "two_level":
      return <TwoLevelFigure values={values} target={target} step={step} caption={caption} />
    case "intuition":
      return <IntuitionFigure caption={caption} />
    case "step_table":
      return <StepTableFigure values={values} target={target} step={step} caption={caption} />
    case "evolution_main":
      return <EvolutionFigure values={values} target={target} step={step} caption={caption} />
    case "search_main":
      return <AnimationFigure values={values} target={target} step={step} caption={caption} />
    case "result_main":
      return <ResultFigure values={values} target={target} step={step} caption={caption} />
    case "complexity":
      return <ComplexityFigure caption={caption} />
    case "step_tradeoff":
      return <StepTradeoffFigure caption={caption} />
    case "code_steps_main":
    case "code_walk_main":
      return <CodeWalkthroughFigure values={values} target={target} step={step} caption={caption} />
    default:
      return <FigureCard caption={caption} />
  }
}
