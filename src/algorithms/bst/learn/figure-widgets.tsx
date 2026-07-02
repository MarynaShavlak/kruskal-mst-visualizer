// Мапа «фігура README → живий віджет» для навчальної вкладки ДДП. Мапить за іменем
// файлу без розширення (UA docs/images/, EN docs/images/en/ — той самий стем).
// Невідоме ім'я → запасна картка FigureCard.

import type { ReactNode } from "react"
import { FigureCard } from "@/algorithms/shared/learn/FigureCard"
import {
  BstAnatomyFigure,
  BstWalkthroughFigure,
  BstShapeFigure,
  BstInorderFigure,
  BstDeleteQuizFigure,
} from "@/algorithms/bst/learn/learn-widgets"

export function figureForSrc(
  src: string | undefined,
  alt: string | undefined,
): ReactNode {
  const base = (src ?? "").split("/").pop() ?? ""
  const stem = base.replace(/\.(png|gif|mp4|svg)$/i, "")
  const caption = alt ?? ""

  switch (stem) {
    case "bst_anatomy":
      return <BstAnatomyFigure caption={caption} />
    case "bst_walk":
      return <BstWalkthroughFigure caption={caption} />
    case "bst_shape":
      return <BstShapeFigure caption={caption} />
    case "bst_inorder":
      return <BstInorderFigure caption={caption} />
    case "bst_quiz":
      return <BstDeleteQuizFigure caption={caption} />
    default:
      return <FigureCard caption={caption} />
  }
}
