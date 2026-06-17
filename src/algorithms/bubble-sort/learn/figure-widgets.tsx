import type { ReactNode } from "react"
import { FigureCard } from "@/algorithms/shared/learn/FigureCard"
import {
  BUBBLE_INTRO,
  BUBBLE_BEST,
  BUBBLE_WORST,
  BUBBLE_CONSPECT,
} from "@/lib/exampleBubbleSort"
import {
  ArrayFigure,
  CodeWalkthroughFigure,
  EvolutionFigure,
  GrowthFigure,
  ResultFigure,
  SortAnimationFigure,
  StabilityFigure,
  StepFigure,
} from "@/algorithms/bubble-sort/learn/learn-widgets"

/**
 * Замінює статичні фігури README (`docs/images/…`, у EN — `docs/images/en/…`)
 * живими віджетами на еталонних масивах. Мапить за іменем файлу без розширення
 * (.png/.gif/.mp4 одного концепту → той самий віджет). Невідоме ім'я → запасна
 * картка з підписом. Інжектиться у спільний LearnView пропсом `figureForSrc`.
 *
 * Кадри трасування головного прикладу `[5,1,4,2,8,3]` (наївна версія) у журналі
 * подій: 0 — init; 1..5 — порівняння проходу 0 (j=0..4); 6 — кінець проходу 0;
 * далі по проходах. Тож walkthrough/step_NN ↔ подія NN, а step_intro_N ↔ подія N+1.
 */
export function figureForSrc(
  src: string | undefined,
  alt: string | undefined,
): ReactNode {
  const base = (src ?? "").split("/").pop() ?? ""
  const stem = base.replace(/\.(png|gif|mp4)$/i, "")
  const caption = alt ?? ""

  // Кадри проходу 0 з розділу-прикладу: step_intro_N → подія N+1.
  const intro = /^step_intro_(\d+)$/.exec(stem)
  if (intro) {
    return <StepFigure values={BUBBLE_INTRO} eventIndex={Number(intro[1]) + 1} caption={caption} />
  }
  // Повне покрокове трасування: walkthrough/step_NN → подія NN.
  const walk = /^step_(\d+)$/.exec(stem)
  if (walk) {
    return <StepFigure values={BUBBLE_INTRO} eventIndex={Number(walk[1])} caption={caption} />
  }

  switch (stem) {
    case "array_intro":
      return <ArrayFigure values={BUBBLE_INTRO} caption={caption} />
    case "bubble_idea":
      // Інтуїція: після одного проходу найбільший «сплив» у кінець (кінець проходу 0).
      return <StepFigure values={BUBBLE_INTRO} eventIndex={6} caption={caption} />
    case "result_intro":
      return <ResultFigure values={BUBBLE_INTRO} caption={caption} />
    case "evolution_intro":
      return <EvolutionFigure values={BUBBLE_INTRO} caption={caption} />
    case "evolution_sorted":
      return <EvolutionFigure values={BUBBLE_BEST} optimized caption={caption} />
    case "evolution_reversed":
      return <EvolutionFigure values={BUBBLE_WORST} caption={caption} />
    case "sort_intro":
      return <SortAnimationFigure values={BUBBLE_INTRO} caption={caption} />
    case "sort_sorted":
      return <SortAnimationFigure values={BUBBLE_BEST} optimized caption={caption} />
    case "sort_reversed":
      return <SortAnimationFigure values={BUBBLE_WORST} caption={caption} />
    case "code_steps_conspect":
    case "code_walk_conspect":
      return <CodeWalkthroughFigure values={BUBBLE_CONSPECT} caption={caption} />
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
