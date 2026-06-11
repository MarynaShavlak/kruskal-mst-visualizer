import type { ReactNode } from "react"
import { FigureCard } from "@/algorithms/shared/learn/FigureCard"
import {
  FwGraphWidget,
  FwMatrixDerivation,
  FwMatrixSnapshot,
  FwMatrixWidget,
  FwSweepWidget,
  NegCycleWeightWidget,
  VideoLink,
} from "@/algorithms/floyd-warshall/learn/learn-widgets"

const ABCDEF_K: Record<string, number> = { A: 0, B: 1, C: 2, D: 3, E: 4, F: 5 }
const PQRS_K: Record<string, number> = { P: 0, Q: 1, R: 2, S: 3 }

const RAW =
  "https://raw.githubusercontent.com/MarynaShavlak/algo-floyd-warshall/main/docs/images"

/**
 * GIF-анімації README → посилання на відео-версію з оригінального проєкту.
 * Поруч у документації стоїть png-двійник, що рендериться інтерактивним
 * віджетом, тож GIF тут дає «те саме як відео з контролерами».
 */
const VIDEO: Record<string, string> = {
  "airport_progressive.gif":
    "https://github.com/user-attachments/assets/68dc5943-0f3a-4960-b050-8e9d15a4466f",
  "sweep_abcdef_k_C.gif":
    "https://github.com/user-attachments/assets/8aa46426-46ec-4919-8887-ba0b8585f6c4",
  "evolution_abcdef.gif":
    "https://github.com/user-attachments/assets/0148905d-189c-46ac-9cef-e11a17ebb798",
  "path_abcdef_A_to_D.gif":
    "https://github.com/user-attachments/assets/691a1293-1526-4bb5-8939-3b9bbff6ce2c",
  "negcycle_walk_xyz.gif":
    "https://github.com/user-attachments/assets/c419c9c0-83ff-457c-9e0b-1a26200881ed",
  "negcycle_weight_divergence.gif":
    "https://github.com/user-attachments/assets/adfa62a0-f91e-408d-96c0-c97b270e948a",
  "evolution_pqrs.gif":
    "https://github.com/user-attachments/assets/5bc2bc30-b7a0-4bf9-a904-72c169eaa2cd",
  "path_pqrs_P_to_S.gif":
    "https://github.com/user-attachments/assets/83d62c97-a0f1-4971-af76-685997155d0e",
  // У код↔матриця оригінал мав лише MP4-файли (без user-attachments).
  "code_walk_abcdef_k_C.gif": `${RAW}/code_walk_abcdef_k_C.mp4`,
  "code_walk_pqrs_k_R.gif": `${RAW}/code_walk_pqrs_k_R.mp4`,
  "code_walk_xyz_k_Z.gif": `${RAW}/code_walk_xyz_k_Z.mp4`,
}

/** Справжня ілюстрація з оригінального репозиторію (raw-URL). */
function realImage(name: string, alt: string): ReactNode {
  return (
    <span className="not-prose my-4 block">
      <img
        src={`${RAW}/${name}`}
        alt={alt}
        loading="lazy"
        className="mx-auto block max-w-full rounded-lg border bg-card"
      />
    </span>
  )
}

/** Замінює статичну фігуру README живим віджетом або посиланням на відео. */
export function figureForSrc(src: string | undefined, alt: string | undefined): ReactNode {
  const name = (src ?? "").split("/").pop() ?? ""
  const caption = alt ?? ""

  // 1) GIF-анімації → посилання на відео-версію з оригіналу.
  const video = VIDEO[name]
  if (video) {
    // sweep → інтерактивний прохід двох внутрішніх циклів (k = C) + посилання.
    if (name === "sweep_abcdef_k_C.gif") {
      return (
        <>
          <FwSweepWidget preset="abcdef" k={ABCDEF_K.C} />
          <VideoLink url={video} />
        </>
      )
    }
    // Анімована ілюстрація аеропортів — показуємо сам GIF + посилання на відео.
    if (name === "airport_progressive.gif") {
      return (
        <>
          {realImage(name, caption)}
          <VideoLink url={video} />
        </>
      )
    }
    return <VideoLink url={video} />
  }

  // 2) Аеропортна аналогія (§1) — справжні ілюстрації + жива «карта» графа.
  if (name === "airport_map_abcdef.png") return <FwGraphWidget preset="abcdef" />
  if (name === "airport_relaxation.png") return realImage(name, caption)
  if (name === "airport_progressive.png") return realImage(name, caption)

  // 3) Орієнтовані графи прикладів.
  if (name === "graph_abcdef.png") return <FwGraphWidget preset="abcdef" />
  if (name === "graph_pqrs.png") return <FwGraphWidget preset="pqrs" />
  if (name === "negcycle_graph_xyz.png") return <FwGraphWidget preset="xyz" />

  // 4) Розбіжність ваги на від'ємному циклі — інтерактив.
  if (name === "negcycle_weight_divergence.png") return <NegCycleWeightWidget />

  // 5) Графи з підсвіченим найкоротшим шляхом.
  if (name.startsWith("path_abcdef_A_to_D")) {
    return <FwGraphWidget preset="abcdef" path={["A", "D"]} />
  }
  if (name.startsWith("path_pqrs_P_to_S")) {
    return <FwGraphWidget preset="pqrs" path={["P", "S"]} />
  }

  // 6) Початкова / фінальна матриці.
  if (name === "matrix_initial_abcdef.png") return <FwMatrixSnapshot preset="abcdef" at="initial" />
  if (name === "matrix_initial_pqrs.png") return <FwMatrixSnapshot preset="pqrs" at="initial" />
  if (name === "matrix_final_pqrs.png") return <FwMatrixSnapshot preset="pqrs" at="final" />

  // 7) Крок «після вершини k» → велика матриця з ПОКЛІТИННИМИ формулами.
  let m = /^step_abcdef_k_([A-F])\.png$/.exec(name)
  if (m) return <FwMatrixDerivation preset="abcdef" k={ABCDEF_K[m[1]]} />
  m = /^step_pqrs_k_([PQRS])\.png$/.exec(name)
  if (m) return <FwMatrixDerivation preset="pqrs" k={PQRS_K[m[1]]} />

  // 8) Еволюція матриці → інтерактивний міні-плеєр.
  if (name.startsWith("evolution_abcdef")) return <FwMatrixWidget preset="abcdef" />
  if (name.startsWith("evolution_pqrs")) return <FwMatrixWidget preset="pqrs" />

  // 9) Код ↔ матриця (огляд / покрокові) → інтерактивна матриця прикладу.
  if (name.startsWith("code_steps_abcdef") || name.startsWith("code_walk_abcdef")) {
    return <FwMatrixWidget preset="abcdef" />
  }
  if (name.startsWith("code_steps_pqrs") || name.startsWith("code_walk_pqrs")) {
    return <FwMatrixWidget preset="pqrs" />
  }
  if (name.startsWith("code_steps_xyz") || name.startsWith("code_walk_xyz")) {
    return <FwMatrixWidget preset="xyz" />
  }

  return <FigureCard caption={caption} />
}
