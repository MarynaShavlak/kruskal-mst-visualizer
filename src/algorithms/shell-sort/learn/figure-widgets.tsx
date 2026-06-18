import type { ReactNode } from "react"
import { FigureCard } from "@/algorithms/shared/learn/FigureCard"
import {
  SHELL_INTRO,
  SHELL_CONSPECT,
  SHELL_DUPLICATES,
  SHELL_BIG,
} from "@/lib/exampleShellSort"
import {
  AnimationFigure,
  ArrayFigure,
  CodeWalkthroughFigure,
  EvolutionFigure,
  GapComparisonFigure,
  GapGroupsFigure,
  GrowthFigure,
  ResultFigure,
  StabilityFigure,
  StepFigure,
} from "@/algorithms/shell-sort/learn/learn-widgets"

/**
 * Замінює статичні фігури README (`docs/images/…`, у EN — `docs/images/en/…`)
 * живими віджетами на еталонних масивах. Мапить за іменем файлу без розширення.
 * Головні образи — стовпчики масиву й підпослідовності з кроком gap. Невідоме
 * ім'я → запасна картка.
 *
 * Повне покрокове трасування INTRO `[8,5,3,7,6,1,4,2]` (послідовність Шелла): 76
 * подій = 76 кроків (step_NN ↔ кадр NN trace). Малі прев'ю step_intro_NN — так само.
 */
export function figureForSrc(
  src: string | undefined,
  alt: string | undefined,
): ReactNode {
  const base = (src ?? "").split("/").pop() ?? ""
  const stem = base.replace(/\.(png|gif|mp4)$/i, "")
  const caption = alt ?? ""

  // Повне трасування + малі прев'ю: step_NN / step_intro_NN → кадр NN trace INTRO.
  const walk = /^step_(\d+)$/.exec(stem)
  if (walk) {
    return <StepFigure values={SHELL_INTRO} eventIndex={Number(walk[1])} caption={caption} />
  }
  const stepIntro = /^step_intro_(\d+)$/.exec(stem)
  if (stepIntro) {
    return <StepFigure values={SHELL_INTRO} eventIndex={Number(stepIntro[1])} caption={caption} />
  }

  switch (stem) {
    case "array_intro":
      return <ArrayFigure values={SHELL_INTRO} caption={caption} />
    case "shell_idea":
    case "gap_groups_intro":
      return <GapGroupsFigure values={SHELL_INTRO} gap={4} caption={caption} />
    case "gap_groups_g2":
      return <GapGroupsFigure values={SHELL_INTRO} gap={2} caption={caption} />
    case "gap_groups_g1":
      return <GapGroupsFigure values={SHELL_INTRO} gap={1} caption={caption} />
    case "gap_groups_dup":
      return <GapGroupsFigure values={SHELL_DUPLICATES} gap={3} caption={caption} />
    case "evolution_intro":
      return <EvolutionFigure values={SHELL_INTRO} caption={caption} />
    case "sort_intro":
      return <AnimationFigure values={SHELL_INTRO} caption={caption} />
    case "result_intro":
      return <ResultFigure values={SHELL_INTRO} caption={caption} />
    case "gap_comparison":
      return <GapComparisonFigure values={SHELL_BIG} caption={caption} />
    case "growth":
      return <GrowthFigure caption={caption} />
    case "result_duplicates":
      return <StabilityFigure caption={caption} />
    case "code_steps_conspect":
    case "code_walk_conspect":
      return <CodeWalkthroughFigure values={SHELL_CONSPECT} caption={caption} />
    default:
      return <FigureCard caption={caption} />
  }
}
