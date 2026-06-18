import type { ReactNode } from "react"
import { FigureCard } from "@/algorithms/shared/learn/FigureCard"
import { BS_INTRO, BS_BEST, BS_ABSENT } from "@/lib/exampleBinarySearch"
import {
  AnimationFigure,
  ArrayFigure,
  CasesFigure,
  CodeWalkthroughFigure,
  ComparisonFigure,
  DuplicatesFigure,
  EvolutionFigure,
  GuessFigure,
  LogFigure,
  ResultFigure,
  StepFigure,
  WindowStepFigure,
} from "@/algorithms/binary-search/learn/learn-widgets"

/**
 * Замінює статичні фігури README (`docs/images/…`, у EN — `docs/images/en/…`)
 * живими віджетами на еталонних масивах. Мапить за іменем файлу без розширення.
 * Головний образ — ВІКНО [low..high], що звужується вдвічі. Невідоме ім'я →
 * запасна картка.
 *
 * Повне трасування головного прикладу `[1,3,5,8,10,12,15,18,20,22,24]` (шукаємо 15):
 * init + по 2 кадри на крок + done = 8 кадрів = step_00…step_07 (кадр NN ↔
 * walkthrough/step_NN). Покрокові step_intro_K ↔ кадр 2K+2 (розв'язок кроку K).
 */
export function figureForSrc(
  src: string | undefined,
  alt: string | undefined,
): ReactNode {
  const base = (src ?? "").split("/").pop() ?? ""
  const stem = base.replace(/\.(png|gif|mp4)$/i, "")
  const caption = alt ?? ""
  const { values, target } = BS_INTRO

  // Повне трасування: walkthrough/step_NN → кадр NN trace головного прикладу.
  const walk = /^step_(\d+)$/.exec(stem)
  if (walk) {
    return <StepFigure values={values} target={target} frameIndex={Number(walk[1])} caption={caption} />
  }

  // Покрокові step_intro_0/1/2 → кадр-розв'язок 2K+2.
  const introStep = /^step_intro_(\d+)$/.exec(stem)
  if (introStep) {
    return (
      <StepFigure values={values} target={target} frameIndex={2 * Number(introStep[1]) + 2} caption={caption} />
    )
  }

  switch (stem) {
    case "intuition_guess":
      return <GuessFigure caption={caption} />
    case "intuition_window":
      return <WindowStepFigure values={values} target={target} caption={caption} />
    case "array_intro":
      return <ArrayFigure values={values} target={target} caption={caption} />
    case "evolution_intro":
      return <EvolutionFigure values={values} target={target} caption={caption} />
    case "result_intro":
      return <ResultFigure values={values} target={target} caption={caption} />
    case "search_intro":
      return <AnimationFigure values={values} target={target} caption={caption} />
    case "search_best":
      return <AnimationFigure values={BS_BEST.values} target={BS_BEST.target} caption={caption} />
    case "search_absent":
      return <AnimationFigure values={BS_ABSENT.values} target={BS_ABSENT.target} caption={caption} />
    case "log_explainer":
      return <LogFigure caption={caption} />
    case "linear_vs_binary":
      return <ComparisonFigure caption={caption} />
    case "cases":
      return <CasesFigure caption={caption} />
    case "variants_duplicates":
      return <DuplicatesFigure caption={caption} />
    case "code_steps_intro":
    case "code_walk_intro":
      return <CodeWalkthroughFigure values={values} target={target} caption={caption} />
    default:
      return <FigureCard caption={caption} />
  }
}
