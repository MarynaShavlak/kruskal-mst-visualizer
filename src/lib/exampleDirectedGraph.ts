// Канонічні приклади Флойда–Воршала (еталони коректності з README).
// Використовуються пресетами редактора й тестами lib/.
//   • A–F  — орієнтований граф лише з додатними вагами;
//   • P–S  — від'ємне ребро Q→R = −2 (пряме P→S=10 програє шляху P→Q→R→S=5);
//   • X–Z  — повністю від'ємний цикл X→Y→Z→X (кожне ребро −1).

import { buildDirectedGraph, type DirectedGraph, type Vertex } from "@/lib/directedGraph"
import { INF, type ReadonlyMatrix } from "@/lib/floydWarshall"

// --- Приклад 1: граф A–F (лише додатні ваги) -------------------------------

export const ABCDEF_EDGES: ReadonlyArray<readonly [Vertex, Vertex, number]> = [
  ["A", "B", 3],
  ["B", "C", 1],
  ["C", "D", 7],
  ["C", "F", 2],
  ["E", "D", 2],
  ["E", "F", 3],
]

export function abcdefGraph(): DirectedGraph {
  return buildDirectedGraph(ABCDEF_EDGES, ["A", "B", "C", "D", "E", "F"])
}

/** Підсумкова матриця найкоротших відстаней A–F (порядок A,B,C,D,E,F). */
export const ABCDEF_REFERENCE_DIST: ReadonlyMatrix = [
  [0, 3, 4, 11, INF, 6],
  [INF, 0, 1, 8, INF, 3],
  [INF, INF, 0, 7, INF, 2],
  [INF, INF, INF, 0, INF, INF],
  [INF, INF, INF, 2, 0, 3],
  [INF, INF, INF, INF, INF, 0],
]

// --- Приклад 2: вузли P, Q, R, S (від'ємне ребро Q→R) ----------------------

export const PQRS_EDGES: ReadonlyArray<readonly [Vertex, Vertex, number]> = [
  ["P", "Q", 4],
  ["Q", "R", -2],
  ["R", "S", 3],
  ["P", "S", 10],
]

export function pqrsGraph(): DirectedGraph {
  return buildDirectedGraph(PQRS_EDGES, ["P", "Q", "R", "S"])
}

/** Підсумкова матриця найкоротших відстаней P–S (порядок P,Q,R,S). */
export const PQRS_REFERENCE_DIST: ReadonlyMatrix = [
  [0, 4, 2, 5],
  [INF, 0, -2, 1],
  [INF, INF, 0, 3],
  [INF, INF, INF, 0],
]

// --- Приклад 3: повністю від'ємний цикл X → Y → Z → X ----------------------

export const XYZ_EDGES: ReadonlyArray<readonly [Vertex, Vertex, number]> = [
  ["X", "Y", -1],
  ["Y", "Z", -1],
  ["Z", "X", -1],
]

export function xyzGraph(): DirectedGraph {
  return buildDirectedGraph(XYZ_EDGES, ["X", "Y", "Z"])
}
