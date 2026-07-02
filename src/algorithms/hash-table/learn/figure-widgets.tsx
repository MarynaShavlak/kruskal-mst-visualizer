// Мапа «фігура README → живий віджет» для навчальної вкладки хеш-таблиці. Мапить за
// іменем файлу без розширення (UA docs/images/, EN docs/images/en/ — той самий стем).
// Невідоме ім'я → запасна картка FigureCard.

import type { ReactNode } from "react"
import { FigureCard } from "@/algorithms/shared/learn/FigureCard"
import {
  HtPipelineFigure,
  HtWalkthrough,
  HtChainVsProbeFigure,
  HtOpQuizFigure,
  HtSlotQuizFigure,
} from "@/algorithms/hash-table/learn/learn-widgets"

export function figureForSrc(
  src: string | undefined,
  alt: string | undefined,
): ReactNode {
  const base = (src ?? "").split("/").pop() ?? ""
  const stem = base.replace(/\.(png|gif|mp4|svg)$/i, "")
  const caption = alt ?? ""

  switch (stem) {
    case "ht_pipeline":
      return <HtPipelineFigure caption={caption} />
    case "ht_walk":
      return <HtWalkthrough caption={caption} />
    case "ht_compare":
      return <HtChainVsProbeFigure caption={caption} />
    case "ht_slot_quiz":
      return <HtSlotQuizFigure caption={caption} />
    case "ht_quiz":
      return <HtOpQuizFigure caption={caption} />
    default:
      return <FigureCard caption={caption} />
  }
}
