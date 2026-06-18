import type { ReactNode } from "react"
import { FigureCard } from "@/algorithms/shared/learn/FigureCard"
import {
  SELECTION_INTRO,
  SELECTION_BEST,
  SELECTION_WORST,
  SELECTION_CONSPECT,
} from "@/lib/exampleSelectionSort"
import {
  ArrayFigure,
  CodeWalkthroughFigure,
  EvolutionFigure,
  GrowthFigure,
  ResultFigure,
  SortAnimationFigure,
  StabilityFigure,
  StepFigure,
} from "@/algorithms/selection-sort/learn/learn-widgets"

/**
 * Замінює статичні фігури README (`docs/images/…`, у EN — `docs/images/en/…`)
 * живими віджетами на еталонних масивах. Мапить за іменем файлу без розширення
 * (.png/.gif/.mp4 одного концепту → той самий віджет). Невідоме ім'я → запасна
 * картка з підписом. Інжектиться у спільний LearnView пропсом `figureForSrc`.
 *
 * Кадри трасування головного прикладу `[5,3,8,4,2,7]` (стандартна версія) у журналі
 * подій збігаються кадр-у-кадр зі знімками README: 0 — init; далі по проходах
 * (passStart → compare* → swap). Тож walkthrough/step_NN ↔ кадр NN; а step_intro_N
 * (прохід 0 «під мікроскопом») ↔ кадр 1+N.
 */
export function figureForSrc(
  src: string | undefined,
  alt: string | undefined,
): ReactNode {
  const base = (src ?? "").split("/").pop() ?? ""
  const stem = base.replace(/\.(png|gif|mp4)$/i, "")
  const caption = alt ?? ""

  // Прохід 0 «під мікроскопом»: step_intro_N → кадр 1+N (1 — початок проходу).
  const intro = /^step_intro_(\d+)$/.exec(stem)
  if (intro) {
    return <StepFigure values={SELECTION_INTRO} eventIndex={1 + Number(intro[1])} caption={caption} />
  }
  // Повне покрокове трасування: walkthrough/step_NN → кадр NN.
  const walk = /^step_(\d+)$/.exec(stem)
  if (walk) {
    return <StepFigure values={SELECTION_INTRO} eventIndex={Number(walk[1])} caption={caption} />
  }

  switch (stem) {
    case "array_intro":
      return <ArrayFigure values={SELECTION_INTRO} caption={caption} />
    case "selection_idea":
      // Ідея: один прохід — знайшли мінімум і обміном поставили на початок (кадр 7).
      return <StepFigure values={SELECTION_INTRO} eventIndex={7} caption={caption} />
    case "result_intro":
      return <ResultFigure values={SELECTION_INTRO} caption={caption} />
    case "evolution_intro":
      return <EvolutionFigure values={SELECTION_INTRO} caption={caption} />
    case "evolution_sorted":
      return <EvolutionFigure values={SELECTION_BEST} caption={caption} />
    case "evolution_reversed":
      return <EvolutionFigure values={SELECTION_WORST} caption={caption} />
    case "evolution_duplicates":
      // Еволюція стандартної версії на дублікатах — видно, як обмін ламає порядок.
      return <StabilityFigure phase="evolution" caption={caption} />
    case "sort_intro":
      return <SortAnimationFigure values={SELECTION_INTRO} caption={caption} />
    case "sort_sorted":
      return <SortAnimationFigure values={SELECTION_BEST} caption={caption} />
    case "sort_reversed":
      return <SortAnimationFigure values={SELECTION_WORST} caption={caption} />
    case "code_steps_conspect":
    case "code_walk_conspect":
      return <CodeWalkthroughFigure values={SELECTION_CONSPECT} caption={caption} />
    case "array_duplicates":
      return <StabilityFigure phase="input" caption={caption} />
    case "stability_compare":
      return <StabilityFigure phase="compare" caption={caption} />
    case "growth":
      return <GrowthFigure caption={caption} />
    default:
      return <FigureCard caption={caption} />
  }
}
