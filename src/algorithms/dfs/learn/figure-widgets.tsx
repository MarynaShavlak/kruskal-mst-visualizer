import type { ReactNode } from "react"
import { FigureCard } from "@/algorithms/shared/learn/FigureCard"
import {
  TraversalCompareWidget,
  TraversalWalkthrough,
} from "@/algorithms/shared/traversal/learn-widgets"

/** Живі фігури навчальної вкладки DFS (стратегія — стек). */
export function figureForSrc(
  src: string | undefined,
  alt: string | undefined,
): ReactNode {
  const name = (src ?? "").split("/").pop() ?? ""
  switch (name) {
    case "dfs-walk.svg":
      return <TraversalWalkthrough demo="main" strategy="dfs" variant="full" />
    case "trav-chain.svg":
      return <TraversalWalkthrough demo="chain" strategy="dfs" variant="compact" />
    case "trav-cyclic.svg":
      return <TraversalWalkthrough demo="cyclic" strategy="dfs" variant="compact" />
    case "trav-disconnected.svg":
      return (
        <TraversalWalkthrough demo="disconnected" strategy="dfs" variant="compact" />
      )
    case "bfs-vs-dfs.svg":
      return <TraversalCompareWidget demo="main" />
    default:
      return <FigureCard caption={alt ?? ""} />
  }
}
