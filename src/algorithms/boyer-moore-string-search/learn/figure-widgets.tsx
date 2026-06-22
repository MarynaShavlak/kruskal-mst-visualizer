import type { ReactNode } from "react"
import { FigureCard } from "@/algorithms/shared/learn/FigureCard"
import {
  BM_MAIN,
  BM_BIG_JUMPS,
  BM_INTUITION,
} from "@/lib/exampleBoyerMooreStringSearch"
import {
  AnimationFigure,
  CodeWalkthroughFigure,
  ContrastFigure,
  SearchStepFigure,
  ShiftTableFigure,
  SkippedFigure,
  TableAnimationFigure,
  TableStepFigure,
} from "@/algorithms/boyer-moore-string-search/learn/learn-widgets"

/**
 * Замінює статичні фігури README (`docs/images/…`, у EN — `docs/images/en/…`) живими
 * віджетами на еталонних прикладах. Мапить за іменем файлу без розширення. Два головні
 * образи — таблиця поганого символу (фаза 1) і стрічка «текст / шаблон» зі скануванням
 * справа наліво (фаза 2). Невідоме ім'я → запасна картка.
 *
 * Повне трасування канонічного `("Being a developer is not easy", "developer")`:
 * фаза таблиці T00–T10 (11 кадрів) + фаза пошуку S00–S12 (13 кадрів) = 24 кадри.
 * walkthrough/table_NN → кадр таблиці NN; walkthrough/search_NN → кадр пошуку NN.
 */
export function figureForSrc(
  src: string | undefined,
  alt: string | undefined,
): ReactNode {
  const path = src ?? ""
  const noExt = path.replace(/\.(png|gif|mp4)$/i, "")
  const base = path.split("/").pop() ?? ""
  const stem = base.replace(/\.(png|gif|mp4)$/i, "")
  const caption = alt ?? ""

  // Повне трасування: walkthrough/table_NN → кадр таблиці NN.
  const tableWalk = /(?:^|\/)table_(\d+)$/.exec(noExt)
  if (tableWalk) {
    return <TableStepFigure pattern={BM_MAIN.pattern} tableStep={Number(tableWalk[1])} caption={caption} />
  }
  // walkthrough/search_NN → кадр пошуку NN.
  const searchWalk = /(?:^|\/)search_(\d+)$/.exec(noExt)
  if (searchWalk) {
    return (
      <SearchStepFigure
        text={BM_MAIN.text}
        pattern={BM_MAIN.pattern}
        searchStep={Number(searchWalk[1])}
        caption={caption}
      />
    )
  }

  switch (stem) {
    // — Фаза 1: таблиця поганого символу —
    case "shift_table_developer":
      return <ShiftTableFigure pattern="developer" caption={caption} />
    case "shift_table_ABC":
      return <ShiftTableFigure pattern="ABC" caption={caption} />
    case "shift_table_CAAAA":
      return <ShiftTableFigure pattern="CAAAA" caption={caption} />
    case "table_build":
    case "code_table_walk":
      return <TableAnimationFigure pattern="developer" caption={caption} />
    case "code_table_grid":
      return <CodeWalkthroughFigure text="" pattern="developer" caption={caption} />
    case "build_developer_04":
      return <TableStepFigure pattern="developer" tableStep={4} caption={caption} />
    case "build_developer_08":
      return <TableStepFigure pattern="developer" tableStep={8} caption={caption} />
    case "build_developer_09":
      return <TableStepFigure pattern="developer" tableStep={9} caption={caption} />

    // — Інтуїція —
    case "intuition":
      return <AnimationFigure text={BM_INTUITION.text} pattern={BM_INTUITION.pattern} caption={caption} />
    case "intro_skipped":
      return <SkippedFigure text={BM_MAIN.text} pattern={BM_MAIN.pattern} caption={caption} />
    case "skipped_big_jumps":
      return <SkippedFigure text={BM_BIG_JUMPS.text} pattern={BM_BIG_JUMPS.pattern} caption={caption} />

    // — Фаза 2: пошук —
    case "search_konspekt":
      return <AnimationFigure text={BM_MAIN.text} pattern={BM_MAIN.pattern} caption={caption} />
    case "search_konspekt_start":
      return <SearchStepFigure text={BM_MAIN.text} pattern={BM_MAIN.pattern} searchStep={1} caption={caption} />
    case "search_konspekt_jump":
      return <SearchStepFigure text={BM_MAIN.text} pattern={BM_MAIN.pattern} searchStep={2} caption={caption} />
    case "search_konspekt_match":
      return <SearchStepFigure text={BM_MAIN.text} pattern={BM_MAIN.pattern} searchStep={12} caption={caption} />
    case "search_big_jumps":
      return <AnimationFigure text={BM_BIG_JUMPS.text} pattern={BM_BIG_JUMPS.pattern} caption={caption} />

    // — Код ↔ дані (фаза пошуку) —
    case "code_search_walk":
    case "code_search_grid":
      return <CodeWalkthroughFigure text={BM_MAIN.text} pattern={BM_MAIN.pattern} caption={caption} />

    // — Контраст і складність —
    case "vs_others":
    case "complexity":
      return <ContrastFigure caption={caption} />

    default:
      return <FigureCard caption={caption} />
  }
}
