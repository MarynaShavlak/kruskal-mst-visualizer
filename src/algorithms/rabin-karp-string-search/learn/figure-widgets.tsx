import type { ReactNode } from "react"
import { FigureCard } from "@/algorithms/shared/learn/FigureCard"
import {
  RK_MAIN,
  RK_COLLISION,
  RK_MULTI,
  RK_NOT_FOUND,
} from "@/lib/exampleRabinKarpStringSearch"
import {
  AnimationFigure,
  CodeWalkthroughFigure,
  CollisionFigure,
  ComplexityFigure,
  HashIntuitionFigure,
  HashStepFigure,
  RollingFigure,
  SearchStepFigure,
} from "@/algorithms/rabin-karp-string-search/learn/learn-widgets"

/**
 * Замінює статичні фігури README (`docs/images/…`, у EN — `docs/images/en/…`) живими
 * віджетами на еталонних прикладах. Мапить за іменем файлу без розширення.
 *
 * Повне трасування канонічного `("Being a developer is not easy", "developer")`:
 *   walkthrough/hash_NN → кадр NN фази 1 (Horner-побудова хешу «developer», 11 кадрів);
 *   walkthrough/search_NN → кадр NN фази 2 (ковзне вікно, init + 9 вікон).
 * Невідоме ім'я → запасна картка.
 */
export function figureForSrc(
  src: string | undefined,
  alt: string | undefined,
): ReactNode {
  const path = src ?? ""
  const noExt = path.replace(/\.(png|gif|mp4)$/i, "")
  const base = noExt.split("/").pop() ?? ""
  const caption = alt ?? ""

  // Фаза 1: walkthrough/hash_NN.
  const hashWalk = /(?:^|\/)hash_(\d+)$/.exec(noExt)
  if (hashWalk) {
    return <HashStepFigure pattern={RK_MAIN.pattern} hashFrameIndex={Number(hashWalk[1])} caption={caption} />
  }
  // Фаза 2: walkthrough/search_NN.
  const searchWalk = /(?:^|\/)search_(\d+)$/.exec(noExt)
  if (searchWalk) {
    return (
      <SearchStepFigure
        text={RK_MAIN.text}
        pattern={RK_MAIN.pattern}
        searchFrameIndex={Number(searchWalk[1])}
        caption={caption}
      />
    )
  }

  switch (base) {
    case "intuition_hash":
      return <HashIntuitionFigure caption={caption} />
    case "intuition_window":
      return <SearchStepFigure text={RK_MAIN.text} pattern={RK_MAIN.pattern} searchFrameIndex={1} caption={caption} />
    case "hash_abc":
      return <HashStepFigure pattern="abc" hashFrameIndex={99} caption={caption} />
    case "hash_developer":
      return <HashStepFigure pattern={RK_MAIN.pattern} hashFrameIndex={99} caption={caption} />
    case "hash_build":
      return <AnimationFigure text={RK_MAIN.text} pattern={RK_MAIN.pattern} caption={caption} />
    case "rolling_update":
      return <RollingFigure caption={caption} />
    case "rolling_vs_recompute":
      return <ComplexityFigure caption={caption} />
    case "complexity":
      return <ComplexityFigure caption={caption} />
    case "compare_four":
      return <ComplexityFigure caption={caption} />
    case "collision_for_jar":
      return <CollisionFigure caption={caption} />
    case "search_collision":
      return <AnimationFigure text={RK_COLLISION.text} pattern={RK_COLLISION.pattern} caption={caption} />
    case "search_konspekt":
      return <AnimationFigure text={RK_MAIN.text} pattern={RK_MAIN.pattern} caption={caption} />
    case "search_not_found":
      return <AnimationFigure text={RK_NOT_FOUND.text} pattern={RK_NOT_FOUND.pattern} caption={caption} />
    case "search_multi":
      return <AnimationFigure text={RK_MULTI.text} pattern={RK_MULTI.pattern} caption={caption} />
    case "code_hash_grid":
    case "code_search_grid":
    case "code_hash_walk":
    case "code_search_walk":
      return <CodeWalkthroughFigure text={RK_MAIN.text} pattern={RK_MAIN.pattern} caption={caption} />
    default:
      return <FigureCard caption={caption} />
  }
}
