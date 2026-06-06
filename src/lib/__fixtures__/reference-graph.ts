import { buildGraph, type Graph, type Vertex } from "@/lib/graph"

/** Еталон коректності з CLAUDE.md: 7 вершин A–G, 11 ребер. */
export const REFERENCE_EDGES: ReadonlyArray<readonly [Vertex, Vertex, number]> = [
  ["A", "B", 7],
  ["A", "D", 5],
  ["B", "C", 8],
  ["B", "D", 9],
  ["B", "E", 7],
  ["C", "E", 5],
  ["D", "E", 15],
  ["D", "F", 6],
  ["E", "F", 8],
  ["E", "G", 9],
  ["F", "G", 11],
]

export function referenceGraph(): Graph {
  return buildGraph(REFERENCE_EDGES)
}

/** Правильна вага МОД. */
export const REFERENCE_MST_WEIGHT = 39

/** Ребра правильної МОД (нормалізовані id, відсортовані). */
export const REFERENCE_MST_EDGE_IDS: readonly string[] = [
  "A|B",
  "A|D",
  "B|E",
  "C|E",
  "D|F",
  "E|G",
]
