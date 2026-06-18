import type { ReactNode } from "react"
import { FigureCard } from "@/algorithms/shared/learn/FigureCard"
import {
  IP_DEMO1,
  IP_DEMO2,
  IP_CLUSTERED,
  IP_UNIFORM_WIN,
  IP_ABSENT_OUT,
} from "@/lib/exampleInterpolationSearch"
import {
  AnimationFigure,
  ArrayFigure,
  CodeWalkthroughFigure,
  ComplexityFigure,
  DegradationFigure,
  EvolutionFigure,
  IntuitionFigure,
  LineModelFigure,
  ResultFigure,
  StepFigure,
  VsBinaryFigure,
} from "@/algorithms/interpolation-search/learn/learn-widgets"

/**
 * Замінює статичні фігури README (`docs/images/…`, у EN — `docs/images/en/…`)
 * живими віджетами на еталонних масивах. Мапить за іменем файлу без розширення.
 * Головний образ — «ПРЯМА-МОДЕЛЬ» (проєкція ключа на пряму). Невідоме ім'я →
 * запасна картка.
 *
 * Повне трасування демо 2 `[1,3,5,7,9,11,14,16,18,20,22,25,28,30]` (шукаємо 25):
 * init + probe + discard + probe + found + done = 6 кадрів = step_00…step_05
 * (walkthrough/step_NN ↔ кадр NN; step_00 = init описано в прозі, без фігури).
 */
export function figureForSrc(
  src: string | undefined,
  alt: string | undefined,
): ReactNode {
  const base = (src ?? "").split("/").pop() ?? ""
  const stem = base.replace(/\.(png|gif|mp4)$/i, "")
  const caption = alt ?? ""

  // Повне трасування: walkthrough/step_NN → кадр NN trace демо 2.
  const walk = /^step_(\d+)$/.exec(stem)
  if (walk) {
    return (
      <StepFigure
        values={IP_DEMO2.values}
        target={IP_DEMO2.target}
        frameIndex={Number(walk[1])}
        caption={caption}
      />
    )
  }

  switch (stem) {
    case "intuition_dictionary":
      return <IntuitionFigure caption={caption} />
    case "array_demo1":
      return <ArrayFigure values={IP_DEMO1.values} target={IP_DEMO1.target} caption={caption} />
    case "line_demo1":
      return <LineModelFigure values={IP_DEMO1.values} target={IP_DEMO1.target} caption={caption} />
    case "evolution_demo2":
      return <EvolutionFigure values={IP_DEMO2.values} target={IP_DEMO2.target} caption={caption} />
    case "complexity":
      return <ComplexityFigure caption={caption} />
    case "degradation":
      return <DegradationFigure caption={caption} />
    case "vs_binary_uniform":
      return <VsBinaryFigure values={IP_UNIFORM_WIN.values} target={IP_UNIFORM_WIN.target} caption={caption} />
    case "vs_binary_clustered":
      return <VsBinaryFigure values={IP_CLUSTERED.values} target={IP_CLUSTERED.target} caption={caption} />
    case "search_demo1":
      return <AnimationFigure values={IP_DEMO1.values} target={IP_DEMO1.target} caption={caption} />
    case "search_adjust":
      return <AnimationFigure values={IP_DEMO2.values} target={IP_DEMO2.target} caption={caption} />
    case "search_degrade":
      return <AnimationFigure values={IP_CLUSTERED.values} target={IP_CLUSTERED.target} caption={caption} />
    case "search_absent":
      return <AnimationFigure values={IP_ABSENT_OUT.values} target={IP_ABSENT_OUT.target} caption={caption} />
    case "code_steps_demo2":
    case "code_walk_demo2":
      return <CodeWalkthroughFigure values={IP_DEMO2.values} target={IP_DEMO2.target} caption={caption} />
    case "result_demo1":
      return <ResultFigure values={IP_DEMO1.values} target={IP_DEMO1.target} caption={caption} />
    default:
      return <FigureCard caption={caption} />
  }
}
