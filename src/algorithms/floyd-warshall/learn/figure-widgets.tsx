import type { ReactNode } from "react"
import {
  FigureCard,
  FwGraphWidget,
  FwMatrixSnapshot,
  FwMatrixWidget,
} from "@/algorithms/floyd-warshall/learn/learn-widgets"

const ABCDEF_K: Record<string, number> = { A: 0, B: 1, C: 2, D: 3, E: 4, F: 5 }
const PQRS_K: Record<string, number> = { P: 0, Q: 1, R: 2, S: 3 }

/** Замінює статичну фігуру README живим віджетом або інформативною карткою. */
export function figureForSrc(src: string | undefined, alt: string | undefined): ReactNode {
  const name = (src ?? "").split("/").pop() ?? ""
  const caption = alt ?? ""

  // Орієнтовані графи прикладів.
  if (name === "graph_abcdef.png") return <FwGraphWidget preset="abcdef" />
  if (name === "graph_pqrs.png") return <FwGraphWidget preset="pqrs" />
  if (name === "negcycle_graph_xyz.png" || name === "negcycle_walk_xyz.gif") {
    return <FwGraphWidget preset="xyz" />
  }

  // Графи з підсвіченим найкоротшим шляхом.
  if (name.startsWith("path_abcdef_A_to_D")) {
    return <FwGraphWidget preset="abcdef" path={["A", "D"]} />
  }
  if (name.startsWith("path_pqrs_P_to_S")) {
    return <FwGraphWidget preset="pqrs" path={["P", "S"]} />
  }

  // Початкова / фінальна матриці.
  if (name === "matrix_initial_abcdef.png") return <FwMatrixSnapshot preset="abcdef" at="initial" />
  if (name === "matrix_initial_pqrs.png") return <FwMatrixSnapshot preset="pqrs" at="initial" />
  if (name === "matrix_final_pqrs.png") return <FwMatrixSnapshot preset="pqrs" at="final" />

  // Знімок матриці після конкретної проміжної вершини k.
  let m = /^step_abcdef_k_([A-F])\.png$/.exec(name)
  if (m) return <FwMatrixSnapshot preset="abcdef" at={ABCDEF_K[m[1]]} />
  m = /^step_pqrs_k_([PQRS])\.png$/.exec(name)
  if (m) return <FwMatrixSnapshot preset="pqrs" at={PQRS_K[m[1]]} />

  // Еволюція матриці → інтерактивний міні-плеєр.
  if (name.startsWith("evolution_abcdef")) return <FwMatrixWidget preset="abcdef" />
  if (name.startsWith("evolution_pqrs")) return <FwMatrixWidget preset="pqrs" />

  // Панелі «код ↔ матриця» і покадровий скан — це і є вкладка «Алгоритм».
  if (name.startsWith("code_") || name.startsWith("sweep_")) {
    return (
      <FigureCard
        caption={caption}
        cta={{ label: "Відкрити плеєр", route: "floyd-warshall/playback" }}
      />
    )
  }

  return <FigureCard caption={caption} />
}
