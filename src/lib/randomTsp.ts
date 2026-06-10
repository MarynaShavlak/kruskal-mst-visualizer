// Детермінований генератор випадкових інстансів задачі комівояжера (для пресета
// редактора Хелда–Карпа). Міста розставляються у ЦІЛОЧИСЛОВІЙ сітці [0..span]² —
// цілі координати тримають евклідову відстань sqrt(dx²+dy²) коректно округленою
// (та сама детермінованість, що й в еталоні). Позиції унікальні: збіг двох міст
// дав би нульову відстань і вироджений інстанс. Чисто, без React.

import { vertexName } from "@/lib/graph"
import { mulberry32 } from "@/lib/randomGraph"
import type { TspCity } from "@/lib/tsp"

export interface RandomTspOptions {
  readonly count: number
  /** Розмір цілочислової сітки [0..span] по кожній осі (за замовч. 20). */
  readonly span?: number
  readonly seed?: number
}

/**
 * `count` міст із канонічними іменами (A, B, …) у випадкових ЦІЛИХ точках сітки
 * [0..span]². Позиції гарантовано різні. Детерміновано за `seed`: однаковий seed —
 * однаковий інстанс. Якщо сітка замала вмістити `count` різних точок, повертає
 * стільки, скільки вдалося розставити (на практиці span ≫ count).
 */
export function randomTspCities(options: RandomTspOptions): TspCity[] {
  const { count, span = 20, seed = 1 } = options
  const rand = mulberry32(seed)
  const taken = new Set<string>()
  const cities: TspCity[] = []
  const coord = (): number => Math.floor(rand() * (span + 1))

  for (let guard = 0; cities.length < count && guard < count * 100; guard++) {
    const x = coord()
    const y = coord()
    const key = `${x},${y}`
    if (taken.has(key)) continue
    taken.add(key)
    cities.push({ name: vertexName(cities.length), x, y })
  }
  return cities
}
