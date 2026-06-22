import type { ReactNode } from "react"
import { FigureCard } from "@/algorithms/shared/learn/FigureCard"
import { KMP_CANONICAL, KMP_KONSPECT, KMP_WORST } from "@/lib/exampleKmpStringSearch"
import {
  ComplexityFigure,
  FullWalkthroughFigure,
  LpsAnimationFigure,
  LpsStepFigure,
  LpsTableFigure,
  SearchAnimationFigure,
  SearchStepFigure,
  VsNaiveFigure,
} from "@/algorithms/kmp-string-search/learn/learn-widgets"

/**
 * Замінює статичні фігури README (`docs/images/…`, у EN — `docs/images/en/…`) живими
 * віджетами на еталонних прикладах. Мапить за іменем файлу без розширення. Два образи —
 * таблиця lps (фаза 1) і стрічка пошуку зі стрибками + інваріантом «i лише вперед» (фаза 2).
 *
 * Повне трасування конспект-прикладу: фаза 1 (lps шаблону «алг», кадри lps_NN) + фаза 2
 * (пошук «алг» у тексті, кадри search_NN). У моїй моделі lps-кадри «алг»: init + compare +
 * zero + compare + zero + final; search-кадри «алг»: init + (compare/advance)·… + match.
 */
export function figureForSrc(
  src: string | undefined,
  alt: string | undefined,
): ReactNode {
  const path = src ?? ""
  const noExt = path.replace(/\.(png|gif|mp4)$/i, "")
  const base = noExt.split("/").pop() ?? ""
  const caption = alt ?? ""

  // walkthrough/lps_NN → кадр NN lps-фази «алг».
  const lpsWalk = /(?:^|\/)lps_(\d+)$/.exec(noExt)
  if (lpsWalk) {
    return <LpsStepFigure pattern={KMP_KONSPECT.pattern} frameIndex={Number(lpsWalk[1])} caption={caption} />
  }
  // walkthrough/search_NN → кадр NN search-фази «алг» у тексті конспекту.
  const searchWalk = /(?:^|\/)search_(\d+)$/.exec(noExt)
  if (searchWalk) {
    return (
      <SearchStepFigure
        text={KMP_KONSPECT.text}
        pattern={KMP_KONSPECT.pattern}
        frameIndex={Number(searchWalk[1])}
        caption={caption}
      />
    )
  }

  // lps_build_AABAA_NN → крок NN побудови lps шаблону AABAA.
  const lpsBuild = /^lps_build_AABAA_(\d+)$/.exec(base)
  if (lpsBuild) {
    return <LpsStepFigure pattern="AABAA" frameIndex={Number(lpsBuild[1])} caption={caption} />
  }
  // lps_table_<PATTERN> → готова таблиця lps цього шаблону.
  const lpsTable = /^lps_table_(.+)$/.exec(base)
  if (lpsTable) {
    return <LpsTableFigure pattern={lpsTable[1]} caption={caption} />
  }

  switch (base) {
    case "intuition":
      return <FullWalkthroughFigure text={KMP_KONSPECT.text} pattern={KMP_KONSPECT.pattern} caption={caption} />
    case "lps_build":
      return <LpsAnimationFigure pattern="AABAA" caption={caption} />
    case "search_konspekt":
      return <SearchAnimationFigure text={KMP_KONSPECT.text} pattern={KMP_KONSPECT.pattern} caption={caption} />
    case "search_konspekt_match":
      // Повний збіг «алг» на позиції 4 — останній search-кадр.
      return <SearchStepFigure text={KMP_KONSPECT.text} pattern={KMP_KONSPECT.pattern} frameIndex={999} caption={caption} />
    case "i_monotonic":
      return <SearchAnimationFigure text={KMP_CANONICAL.text} pattern={KMP_CANONICAL.pattern} caption={caption} />
    case "vs_naive_worst":
      return <VsNaiveFigure text={KMP_WORST.text} pattern={KMP_WORST.pattern} caption={caption} />
    case "complexity":
      return <ComplexityFigure caption={caption} />
    case "code_lps_grid":
    case "code_search_grid":
      return <FullWalkthroughFigure text={KMP_CANONICAL.text} pattern={KMP_CANONICAL.pattern} caption={caption} />
    default:
      return <FigureCard caption={caption} />
  }
}
