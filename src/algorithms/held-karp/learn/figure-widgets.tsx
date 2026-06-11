import type { ReactNode } from "react"
import {
  FigureCard,
  HkBlockReuse,
  HkBruteVsDp,
  HkCitiesMap,
  HkClosingTable,
  HkComplexityGrowth,
  HkDistanceMatrix,
  HkLevelTable,
} from "@/algorithms/held-karp/learn/learn-widgets"
import { TSP_DEMO_OPTIMAL_TOUR } from "@/lib/exampleTsp"

/**
 * Замінює статичні фігури README (`images/NN_*.png`) живими віджетами на
 * демо-інстансі A–E. Невідоме ім'я → запасна картка з підписом. Інжектиться у
 * спільний LearnView пропсом `figureForSrc`.
 */
export function figureForSrc(
  src: string | undefined,
  alt: string | undefined,
): ReactNode {
  const name = (src ?? "").split("/").pop() ?? ""
  const caption = alt ?? ""

  if (name === "01_distance_matrix.png") return <HkDistanceMatrix />
  if (name === "02_cities_graph.png") return <HkCitiesMap />
  if (name === "03_level2_base.png") return <HkLevelTable level={2} />
  if (name === "04_level3.png") return <HkLevelTable level={3} />
  if (name === "05_level4.png") return <HkLevelTable level={4} />
  if (name === "06_level5.png") return <HkLevelTable level={5} />
  if (name === "07_closing.png") return <HkClosingTable />
  if (name === "08_brute_vs_dp.png") return <HkBruteVsDp />
  if (name === "09_block_reuse.png") return <HkBlockReuse />
  if (name === "10_optimal_route.png")
    return <HkCitiesMap tour={TSP_DEMO_OPTIMAL_TOUR} />
  if (name === "11_complexity_growth.png") return <HkComplexityGrowth />

  return <FigureCard caption={caption} />
}
