// Пресети-приклади для алгоритмів обходу/пошуку шляху на графі (BFS, DFS, Дейкстра).
// Чисто (без React); координати — екранні пікселі. Еталони відповідають PDF-розборам:
//  - обхід (BFS/DFS): 6 вершин A–F, ваги ребер не важливі (=1);
//  - Дейкстра: 5 вершин A–E зі зваженими ребрами.

import { buildGraph } from "@/lib/graph"
import type { Vertex } from "@/lib/graph"
import type { GraphStoreDoc, XY } from "@/store/create-graph-store"
import type { Graph } from "@/lib/graph"

/** Еталонний граф обходу: A-B, A-C, B-D, B-E, C-F, E-F (BFS→A B C D E F; DFS→A B D E F C). */
const TRAVERSAL_GRAPH: Graph = buildGraph([
  ["A", "B", 1],
  ["A", "C", 1],
  ["B", "D", 1],
  ["B", "E", 1],
  ["C", "F", 1],
  ["E", "F", 1],
])

const TRAVERSAL_POSITIONS: Record<Vertex, XY> = {
  A: { x: 150, y: 360 },
  B: { x: 400, y: 320 },
  C: { x: 110, y: 170 },
  D: { x: 540, y: 430 },
  E: { x: 350, y: 130 },
  F: { x: 170, y: 30 },
}

export function traversalExamplePreset(): GraphStoreDoc<Graph> {
  return { graph: TRAVERSAL_GRAPH, positions: { ...TRAVERSAL_POSITIONS } }
}

/** Еталонний зважений граф Дейкстри: A-B5, A-C10, B-D3, C-D2, D-E4 (від A: A0 B5 C10 D8 E12). */
const DIJKSTRA_GRAPH: Graph = buildGraph([
  ["A", "B", 5],
  ["A", "C", 10],
  ["B", "D", 3],
  ["C", "D", 2],
  ["D", "E", 4],
])

const DIJKSTRA_POSITIONS: Record<Vertex, XY> = {
  E: { x: 360, y: 20 },
  D: { x: 380, y: 210 },
  C: { x: 110, y: 350 },
  A: { x: 360, y: 450 },
  B: { x: 620, y: 320 },
}

export function dijkstraExamplePreset(): GraphStoreDoc<Graph> {
  return { graph: DIJKSTRA_GRAPH, positions: { ...DIJKSTRA_POSITIONS } }
}
