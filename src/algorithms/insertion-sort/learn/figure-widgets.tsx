import type { ReactNode } from "react"
import { FigureCard } from "@/algorithms/shared/learn/FigureCard"
import {
  INSERTION_INTRO,
  INSERTION_BEST,
  INSERTION_WORST,
  INSERTION_CONSPECT,
} from "@/lib/exampleInsertionSort"
import {
  ArrayFigure,
  CodeWalkthroughFigure,
  EvolutionFigure,
  GrowthFigure,
  ResultFigure,
  SortAnimationFigure,
  StabilityFigure,
  StepFigure,
} from "@/algorithms/insertion-sort/learn/learn-widgets"

/**
 * Замінює статичні фігури README (`docs/images/…`, у EN — `docs/images/en/…`)
 * живими віджетами на еталонних масивах. Мапить за іменем файлу без розширення
 * (.png/.gif/.mp4 одного концепту → той самий віджет). Невідоме ім'я → запасна
 * картка з підписом. Інжектиться у спільний LearnView пропсом `figureForSrc`.
 *
 * Кадри трасування головного прикладу `[5,2,4,6,1,3]` (лінійна версія) у журналі
 * подій збігаються кадр-у-кадр зі знімками README: 0 — init; далі по ітераціях
 * (take → compare* → insert). Тож walkthrough/step_NN ↔ кадр NN; а step_intro_N
 * (ітерація i=5 «під мікроскопом») ↔ кадр 17+N.
 */
export function figureForSrc(
  src: string | undefined,
  alt: string | undefined,
): ReactNode {
  const base = (src ?? "").split("/").pop() ?? ""
  const stem = base.replace(/\.(png|gif|mp4)$/i, "")
  const caption = alt ?? ""

  // Кадри ітерації i=5 з розділу-прикладу: step_intro_N → кадр 17+N.
  const intro = /^step_intro_(\d+)$/.exec(stem)
  if (intro) {
    return <StepFigure values={INSERTION_INTRO} eventIndex={17 + Number(intro[1])} caption={caption} />
  }
  // Повне покрокове трасування: walkthrough/step_NN → кадр NN.
  const walk = /^step_(\d+)$/.exec(stem)
  if (walk) {
    return <StepFigure values={INSERTION_INTRO} eventIndex={Number(walk[1])} caption={caption} />
  }

  switch (stem) {
    case "array_intro":
      return <ArrayFigure values={INSERTION_INTRO} caption={caption} />
    case "insertion_idea":
      // Інтуїція: один акт вставки — взяли key=2, зсунули більший 5 праворуч (кадр 2).
      return <StepFigure values={INSERTION_INTRO} eventIndex={2} caption={caption} />
    case "result_intro":
      return <ResultFigure values={INSERTION_INTRO} caption={caption} />
    case "evolution_intro":
      return <EvolutionFigure values={INSERTION_INTRO} caption={caption} />
    case "evolution_sorted":
      return <EvolutionFigure values={INSERTION_BEST} caption={caption} />
    case "evolution_reversed":
      return <EvolutionFigure values={INSERTION_WORST} caption={caption} />
    case "sort_intro":
      return <SortAnimationFigure values={INSERTION_INTRO} caption={caption} />
    case "sort_sorted":
      return <SortAnimationFigure values={INSERTION_BEST} caption={caption} />
    case "sort_reversed":
      return <SortAnimationFigure values={INSERTION_WORST} caption={caption} />
    case "code_steps_conspect":
    case "code_walk_conspect":
      return <CodeWalkthroughFigure values={INSERTION_CONSPECT} caption={caption} />
    case "array_duplicates":
      return <StabilityFigure phase="before" caption={caption} />
    case "result_duplicates":
      return <StabilityFigure phase="after" caption={caption} />
    case "growth":
      return <GrowthFigure caption={caption} />
    default:
      return <FigureCard caption={caption} />
  }
}
