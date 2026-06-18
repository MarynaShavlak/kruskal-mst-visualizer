import type { ReactNode } from "react"
import { FigureCard } from "@/algorithms/shared/learn/FigureCard"
import { RADIX_INTRO } from "@/lib/exampleRadixSort"
import {
  AnimationFigure,
  ArrayFigure,
  BucketsFigure,
  CodeWalkthroughFigure,
  CountingFigure,
  EvolutionFigure,
  GrowthFigure,
  IdeaFigure,
  ResultFigure,
  StabilityFigure,
  StepFigure,
} from "@/algorithms/radix-sort/learn/learn-widgets"

/**
 * Замінює статичні фігури README (`docs/images/…`, у EN — `docs/images/en/…`)
 * живими віджетами на еталонних масивах. Мапить за іменем файлу без розширення.
 * Головні образи — кошики 0–9 і фішки-числа з підсвіченою цифрою поточного розряду.
 * Невідоме ім'я → запасна картка.
 *
 * Повне покрокове трасування INTRO `[3,89,67,254,9,21,185,4,62]`: 35 подій =
 * 35 кроків (step_NN ↔ кадр NN trace).
 */
export function figureForSrc(
  src: string | undefined,
  alt: string | undefined,
): ReactNode {
  const base = (src ?? "").split("/").pop() ?? ""
  const stem = base.replace(/\.(png|gif|mp4)$/i, "")
  const caption = alt ?? ""

  // Повне трасування: walkthrough/step_NN → кадр NN trace INTRO.
  const walk = /^step_(\d+)$/.exec(stem)
  if (walk) {
    return <StepFigure values={RADIX_INTRO} eventIndex={Number(walk[1])} caption={caption} />
  }

  switch (stem) {
    case "radix_idea":
      return <IdeaFigure values={RADIX_INTRO} caption={caption} />
    case "array_conspect":
      return <ArrayFigure values={RADIX_INTRO} caption={caption} />
    case "buckets_units":
      return <BucketsFigure values={RADIX_INTRO} digitIndex={0} caption={caption} />
    case "buckets_tens":
      return <BucketsFigure values={RADIX_INTRO} digitIndex={1} caption={caption} />
    case "buckets_hundreds":
      return <BucketsFigure values={RADIX_INTRO} digitIndex={2} caption={caption} />
    case "evolution_conspect":
      return <EvolutionFigure values={RADIX_INTRO} caption={caption} />
    case "sort_buckets":
      return <AnimationFigure values={RADIX_INTRO} caption={caption} />
    case "result_conspect":
      return <ResultFigure values={RADIX_INTRO} caption={caption} />
    case "counting_units":
    case "count_steps_units":
      return <CountingFigure values={RADIX_INTRO} position={1} caption={caption} />
    case "array_duplicates":
    case "evolution_duplicates":
    case "result_duplicates":
      return <StabilityFigure caption={caption} />
    case "growth":
      return <GrowthFigure caption={caption} />
    case "code_steps_conspect":
    case "code_walk_conspect":
      return <CodeWalkthroughFigure values={RADIX_INTRO} caption={caption} />
    default:
      return <FigureCard caption={caption} />
  }
}
