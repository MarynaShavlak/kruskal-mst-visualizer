// Мапа «фігура README → живий віджет» для навчальної вкладки обходу дерева. Мапить за
// іменем файлу без розширення (UA docs/images/, EN docs/images/en/ — той самий стем).
// Невідоме ім'я → запасна картка FigureCard.

import type { ReactNode } from "react"
import { FigureCard } from "@/algorithms/shared/learn/FigureCard"
import {
  TtAnatomyFigure,
  TtPreorderFigure,
  TtInorderFigure,
  TtPostorderFigure,
  TtBstFigure,
  TtOrderQuizFigure,
} from "@/algorithms/tree-traversal/learn/learn-widgets"

export function figureForSrc(
  src: string | undefined,
  alt: string | undefined,
): ReactNode {
  const base = (src ?? "").split("/").pop() ?? ""
  const stem = base.replace(/\.(png|gif|mp4|svg)$/i, "")
  const caption = alt ?? ""

  switch (stem) {
    case "tt_anatomy":
      return <TtAnatomyFigure caption={caption} />
    case "tt_preorder":
      return <TtPreorderFigure caption={caption} />
    case "tt_inorder":
      return <TtInorderFigure caption={caption} />
    case "tt_postorder":
      return <TtPostorderFigure caption={caption} />
    case "tt_bst":
      return <TtBstFigure caption={caption} />
    case "tt_quiz":
      return <TtOrderQuizFigure caption={caption} />
    default:
      return <FigureCard caption={caption} />
  }
}
