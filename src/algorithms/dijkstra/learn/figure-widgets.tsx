import type { ReactNode } from "react"
import { FigureCard } from "@/algorithms/shared/learn/FigureCard"
import { DijkstraWalkthrough } from "@/algorithms/dijkstra/learn/learn-widgets"

/** Живі фігури навчальної вкладки Дейкстри. */
export function figureForSrc(
  src: string | undefined,
  alt: string | undefined,
): ReactNode {
  const name = (src ?? "").split("/").pop() ?? ""
  switch (name) {
    case "dijkstra-walk.svg":
      return <DijkstraWalkthrough demo="main" variant="full" />
    case "dijkstra-shortcut.svg":
      return <DijkstraWalkthrough demo="shortcut" variant="compact" />
    case "dijkstra-disconnected.svg":
      return <DijkstraWalkthrough demo="disconnected" variant="compact" />
    default:
      return <FigureCard caption={alt ?? ""} />
  }
}
