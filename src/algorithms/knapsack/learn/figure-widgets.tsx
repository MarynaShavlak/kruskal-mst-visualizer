import type { ReactNode } from "react"
import { FigureCard } from "@/algorithms/shared/learn/FigureCard"
import { tr } from "@/i18n/use-t"
import { KNAPSACK_SMALL, KNAPSACK_CLASSIC } from "@/lib/exampleKnapsack"
import {
  BacktrackFigure,
  CellFormulaFigure,
  ComplexityFigure,
  DpTableFigure,
  GreedyFigure,
  ItemsFigure,
  RecursionTreeFigure,
  SubsetsFigure,
} from "@/algorithms/knapsack/learn/learn-widgets"

/**
 * Замінює статичні фігури README (`docs/images/…`, у EN — `docs/images/en/…`)
 * живими віджетами на еталонних інстансах. Мапить за іменем файлу без розширення
 * (.png/.gif/.mp4 одного концепту → той самий віджет). Невідоме ім'я → запасна
 * картка з підписом. Інжектиться у спільний LearnView пропсом `figureForSrc`.
 */
export function figureForSrc(
  src: string | undefined,
  alt: string | undefined,
): ReactNode {
  const base = (src ?? "").split("/").pop() ?? ""
  const stem = base.replace(/\.(png|gif|mp4)$/i, "")
  const caption = alt ?? ""

  // Крупні плани окремих клітинок: dp_cell_small_i{N}_w{M} → жива формула переходу.
  const cell = /^dp_cell_small_i(\d+)_w(\d+)$/.exec(stem)
  if (cell) {
    return (
      <CellFormulaFigure
        instance={KNAPSACK_SMALL}
        i={Number(cell[1])}
        w={Number(cell[2])}
        caption={caption}
      />
    )
  }

  switch (stem) {
    case "items_small":
      return <ItemsFigure instance={KNAPSACK_SMALL} caption={caption} />
    case "items_classic":
      return <ItemsFigure instance={KNAPSACK_CLASSIC} caption={caption} />
    case "subsets_classic":
      return <SubsetsFigure instance={KNAPSACK_CLASSIC} caption={caption} />
    case "growth_2n":
      return <ComplexityFigure caption={caption} />
    case "tree_classic":
      return <RecursionTreeFigure instance={KNAPSACK_CLASSIC} caption={caption} />
    case "dp_initial_small":
      return <DpTableFigure instance={KNAPSACK_SMALL} rows={0} caption={caption} />
    case "dp_row_small_1":
      return <DpTableFigure instance={KNAPSACK_SMALL} rows={1} caption={caption} />
    case "dp_row_small_2":
      return <DpTableFigure instance={KNAPSACK_SMALL} rows={2} caption={caption} />
    case "dp_row_small_3":
      return <DpTableFigure instance={KNAPSACK_SMALL} rows={3} caption={caption} />
    case "dp_table_small":
    case "dp_fill_small":
    case "dp_evolution_small":
      return <DpTableFigure instance={KNAPSACK_SMALL} answer caption={caption} />
    case "dp_table_classic":
      return <DpTableFigure instance={KNAPSACK_CLASSIC} condense={10} answer caption={caption} />
    case "backtrack_small":
      return <BacktrackFigure instance={KNAPSACK_SMALL} caption={caption} />
    case "backtrack_classic":
      return <BacktrackFigure instance={KNAPSACK_CLASSIC} condense={10} caption={caption} />
    case "greedy_fill_classic":
      return <GreedyFigure instance={KNAPSACK_CLASSIC} caption={caption} />
    default:
      // Дерево рекурсії, клітинки-крупні плани й панелі «код↔таблиця» — статичні:
      // для останніх ведемо у живий плеєр (вкладка «Алгоритм»).
      return (
        <FigureCard
          caption={caption}
          cta={
            stem.startsWith("code_")
              ? { label: tr("tab.playback"), route: "knapsack/playback" }
              : undefined
          }
        />
      )
  }
}
