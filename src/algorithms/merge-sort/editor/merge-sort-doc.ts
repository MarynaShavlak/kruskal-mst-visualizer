// Серіалізація документа редактора сортування злиттям (масив чисел): JSON для
// імпорту/експорту + компактний base64url для шарингу через URL-хеш (?g=...).
// Окремий wire-формат (version 1; масив цілих ≥0). Валідація — у createValuesCodec.

import type { MergeSortDoc } from "@/store/merge-sort-store"
import { createValuesCodec } from "@/algorithms/shared/editor/doc-codec"

export const mergeSortCodec = createValuesCodec<MergeSortDoc>({
  badValuesKey: "editor.msErrBadValues",
})
