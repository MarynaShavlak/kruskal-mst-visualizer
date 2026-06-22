import type { ReactNode } from "react"
import { FigureCard } from "@/algorithms/shared/learn/FigureCard"
import {
  NSS_MAIN,
  NSS_WORST,
  NSS_NOT_FOUND,
  NSS_OVERLAP,
  NSS_INTUITION,
} from "@/lib/exampleNaiveStringSearch"
import {
  AnimationFigure,
  CodeWalkthroughFigure,
  ComplexityFigure,
  EvolutionFigure,
  GridFigure,
  IntuitionFigure,
  StepFigure,
  WastedWorkFigure,
} from "@/algorithms/naive-string-search/learn/learn-widgets"

/**
 * Замінює статичні фігури README (`docs/images/…`, у EN — `docs/images/en/…`) живими
 * віджетами на еталонних прикладах. Мапить за іменем файлу без розширення. Головний образ
 * — стрічка «текст / шаблон». Невідоме ім'я → запасна картка.
 *
 * Повне трасування канонічного `("ABABDABACDABABCABAB", "ABABCABAB")` (перший збіг):
 * init + 11 вирівнювань + done = 13 кадрів = step_00…step_12 (walkthrough/step_NN ↔ кадр NN).
 */
export function figureForSrc(
  src: string | undefined,
  alt: string | undefined,
): ReactNode {
  const path = src ?? ""
  const base = path.split("/").pop() ?? ""
  const stem = base.replace(/\.(png|gif|mp4)$/i, "")
  const caption = alt ?? ""

  // Повне трасування: walkthrough/step_NN → кадр NN trace канонічного прикладу.
  const walk = /(?:^|\/)step_(\d+)$/.exec(path.replace(/\.(png|gif|mp4)$/i, ""))
  if (walk) {
    return (
      <StepFigure
        text={NSS_MAIN.text}
        pattern={NSS_MAIN.pattern}
        frameIndex={Number(walk[1])}
        caption={caption}
      />
    )
  }

  switch (stem) {
    case "intuition_setup":
      return <StepFigure text={NSS_INTUITION.text} pattern={NSS_INTUITION.pattern} frameIndex={1} caption={caption} />
    case "intuition_slide":
      return <IntuitionFigure caption={caption} />
    case "intro_align_i0":
      return <StepFigure text={NSS_MAIN.text} pattern={NSS_MAIN.pattern} frameIndex={1} caption={caption} />
    case "intro_mismatch_i0":
      return <StepFigure text={NSS_MAIN.text} pattern={NSS_MAIN.pattern} frameIndex={1} caption={caption} />
    case "intro_match":
      return <StepFigure text={NSS_MAIN.text} pattern={NSS_MAIN.pattern} frameIndex={11} caption={caption} />
    case "intro_evolution":
      return <EvolutionFigure text={NSS_MAIN.text} pattern={NSS_MAIN.pattern} caption={caption} />
    case "intro_grid":
      return <GridFigure text={NSS_MAIN.text} pattern={NSS_MAIN.pattern} caption={caption} />
    case "wasted_work":
      return <WastedWorkFigure caption={caption} />
    case "not_found_grid":
      return <GridFigure text={NSS_NOT_FOUND.text} pattern={NSS_NOT_FOUND.pattern} caption={caption} />
    case "worst_case":
      return <StepFigure text={NSS_WORST.text} pattern={NSS_WORST.pattern} frameIndex={1} caption={caption} />
    case "complexity":
      return <ComplexityFigure caption={caption} />
    case "all_matches":
      return <AnimationFigure text={NSS_OVERLAP.text} pattern={NSS_OVERLAP.pattern} findAll caption={caption} />
    case "code_grid":
    case "code_walk":
      return <CodeWalkthroughFigure text={NSS_MAIN.text} pattern={NSS_MAIN.pattern} caption={caption} />
    case "search_canonical":
      return <AnimationFigure text={NSS_MAIN.text} pattern={NSS_MAIN.pattern} caption={caption} />
    case "search_worst":
      return <AnimationFigure text={NSS_WORST.text} pattern={NSS_WORST.pattern} caption={caption} />
    case "search_not_found":
      return <AnimationFigure text={NSS_NOT_FOUND.text} pattern={NSS_NOT_FOUND.pattern} caption={caption} />
    default:
      return <FigureCard caption={caption} />
  }
}
