// Серіалізація документа редактора порозрядного сортування (масив чисел): JSON для
// імпорту/експорту + компактний base64url для шарингу через URL-хеш (?g=...).
// Окремий wire-формат (version 1; масив НЕВІД'ЄМНИХ цілих). Валідація — у createValuesCodec.

import type { RadixSortDoc } from "@/store/radix-sort-store"
import { createValuesCodec } from "@/algorithms/shared/editor/doc-codec"

export const radixSortCodec = createValuesCodec<RadixSortDoc>({
  badValuesKey: "editor.rxErrBadValues",
})
