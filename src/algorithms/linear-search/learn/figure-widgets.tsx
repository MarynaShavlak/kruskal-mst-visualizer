import type { ReactNode } from "react"
import { FigureCard } from "@/algorithms/shared/learn/FigureCard"
import { LS_MAIN, LS_ABSENT } from "@/lib/exampleLinearSearch"
import {
  AnimationFigure,
  ArrayFigure,
  CasesFigure,
  CodeWalkthroughFigure,
  DuplicatesFigure,
  GrowthFigure,
  IntuitionFigure,
  ResultFigure,
  ScanStaircaseFigure,
  StepFigure,
} from "@/algorithms/linear-search/learn/learn-widgets"

/**
 * Замінює статичні фігури README (`docs/images/…`, у EN — `docs/images/en/…`)
 * живими віджетами на еталонних масивах. Мапить за іменем файлу без розширення.
 * Головний образ — нерухомий ряд комірок із курсором-бігунцем. Невідоме ім'я →
 * запасна картка.
 *
 * Повне трасування головного прикладу `[5,3,8,1,4]` (шукаємо 8): плеєр будує
 * init + по 2 кадри на перевірку + done = 8 кадрів = step_00…step_07 (кадр NN ↔
 * walkthrough/step_NN). Скан-перевірки step_main_K ↔ кадр 2K+2 (розв'язок).
 */
export function figureForSrc(
  src: string | undefined,
  alt: string | undefined,
): ReactNode {
  const base = (src ?? "").split("/").pop() ?? ""
  const stem = base.replace(/\.(png|gif|mp4)$/i, "")
  const caption = alt ?? ""

  // Повне трасування: walkthrough/step_NN → кадр NN trace головного прикладу.
  const walk = /^step_(\d+)$/.exec(stem)
  if (walk) {
    return (
      <StepFigure
        values={LS_MAIN.values}
        target={LS_MAIN.target}
        frameIndex={Number(walk[1])}
        caption={caption}
      />
    )
  }

  // Скан-перевірки step_main_0/1/2 → кадр-розв'язок 2K+2.
  const scanStep = /^step_main_(\d+)$/.exec(stem)
  if (scanStep) {
    return (
      <StepFigure
        values={LS_MAIN.values}
        target={LS_MAIN.target}
        frameIndex={2 * Number(scanStep[1]) + 2}
        caption={caption}
      />
    )
  }

  switch (stem) {
    case "scan_intuition":
      return <IntuitionFigure values={LS_MAIN.values} target={LS_MAIN.target} caption={caption} />
    case "array_main":
      return <ArrayFigure values={LS_MAIN.values} target={LS_MAIN.target} caption={caption} />
    case "scan_main":
      return <ScanStaircaseFigure values={LS_MAIN.values} target={LS_MAIN.target} caption={caption} />
    case "search_main":
      return <AnimationFigure values={LS_MAIN.values} target={LS_MAIN.target} caption={caption} />
    case "result_main":
      return <ResultFigure values={LS_MAIN.values} target={LS_MAIN.target} caption={caption} />
    case "cases":
      return <CasesFigure caption={caption} />
    case "growth":
      return <GrowthFigure caption={caption} />
    case "dup_first":
      return <DuplicatesFigure findAll={false} caption={caption} />
    case "dup_all":
      return <DuplicatesFigure findAll caption={caption} />
    case "search_absent":
      return <AnimationFigure values={LS_ABSENT.values} target={LS_ABSENT.target} caption={caption} />
    case "code_steps_main":
    case "code_walk_main":
      return <CodeWalkthroughFigure values={LS_MAIN.values} target={LS_MAIN.target} caption={caption} />
    default:
      return <FigureCard caption={caption} />
  }
}
