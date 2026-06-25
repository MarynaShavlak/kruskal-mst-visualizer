// Серіалізація документа редактора бульбашкового сортування (масив чисел):
//  - JSON для імпорту/експорту;
//  - компактний base64url для шарингу через URL-хеш (?g=...).
// Окремий wire-формат (version 1; масив цілих ≥0) — не graph-doc, бо сортування без
// ребер. Уся валідація/санітизація — у спільній фабриці createValuesCodec.

import type { BubbleSortDoc } from "@/store/bubble-sort-store"
import { createValuesCodec } from "@/algorithms/shared/editor/doc-codec"

export const bubbleSortCodec = createValuesCodec<BubbleSortDoc>({
  badValuesKey: "editor.bsErrBadValues",
})
