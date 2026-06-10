// Пресети редактора Хелда–Карпа: еталонний приклад A–E з README + випадковий
// інстанс. Чисто (без React). ВАЖЛИВО: координати — у математичному просторі
// оригіналу (демо A–E лежить у [0..5]), щоб матриця відстаней збігалася з еталоном
// (оптимум 16.7466). Перевід у пікселі полотна — турбота редактора, не стору.

import { TSP_DEMO_CITIES } from "@/lib/exampleTsp"
import { randomTspCities } from "@/lib/randomTsp"
import type { TspDoc } from "@/store/tsp-store"

/** Еталон A–E (старт A): міста в математичних координатах оригіналу. */
export function tspExamplePreset(): TspDoc {
  return { cities: TSP_DEMO_CITIES.map((c) => ({ ...c })), start: 0 }
}

/** Випадковий інстанс: `count` міст у цілочисловій сітці, старт A (0). */
export function tspRandomPreset(seed: number, count = 6): TspDoc {
  return { cities: randomTspCities({ count, seed, span: 20 }), start: 0 }
}
