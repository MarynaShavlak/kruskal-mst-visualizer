import type { ReactNode } from "react"
import { FigureCard } from "@/algorithms/shared/learn/FigureCard"
import {
  CablePlansFigure,
  CutPropertyFigure,
  PrimEvolutionStrip,
  PrimGraphFigure,
  PrimMsfFigure,
  PrimMstFigure,
  PrimStepFigure,
  PrimWalkthrough,
} from "@/algorithms/prim/learn/learn-widgets"

/**
 * Замінює статичні фігури README (`docs/images/*.png`) живими віджетами на
 * демо-графах A–F / A–G / островах. Невідоме ім'я → запасна картка з підписом.
 * Інжектиться у спільний LearnView пропсом `figureForSrc`.
 */
export function figureForSrc(
  src: string | undefined,
  alt: string | undefined,
): ReactNode {
  const name = (src ?? "").split("/").pop() ?? ""
  const caption = alt ?? ""

  const af = /^step_abcdef_(\d)\.png$/.exec(name)
  if (af) return <PrimStepFigure which="AF" step={Number(af[1])} />
  const ag = /^step_abcdefg_(\d)\.png$/.exec(name)
  if (ag) return <PrimStepFigure which="AG" step={Number(ag[1])} />

  switch (name) {
    case "cable_map_abcdef.png":
    case "graph_abcdef.png":
      return <PrimGraphFigure which="AF" />
    case "graph_abcdefg.png":
      return <PrimGraphFigure which="AG" />
    case "graph_islands.png":
      return <PrimGraphFigure which="ISLANDS" />
    case "cable_plans_abcdef.png":
      return <CablePlansFigure />
    case "cut_property_abcdef.png":
      return <CutPropertyFigure />
    case "mst_abcdef.png":
      return <PrimMstFigure which="AF" />
    case "mst_abcdefg.png":
      return <PrimMstFigure which="AG" />
    case "evolution_abcdef.png":
      return <PrimEvolutionStrip which="AF" />
    case "evolution_abcdefg.png":
      return <PrimEvolutionStrip which="AG" />
    case "msf_islands.png":
      return <PrimMsfFigure />
    case "code_steps_abcdef.png":
      return <PrimWalkthrough which="AF" />
    case "code_steps_abcdefg.png":
      return <PrimWalkthrough which="AG" />
    default:
      return <FigureCard caption={caption} />
  }
}
