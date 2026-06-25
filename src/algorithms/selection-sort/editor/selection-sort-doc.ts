// Серіалізація документа редактора сортування прямим вибором (масив чисел): JSON для
// імпорту/експорту + компактний base64url для шарингу через URL-хеш (?g=...).
// Окремий wire-формат (version 1; масив цілих ≥0). Валідація — у createValuesCodec.

import type { SelectionSortDoc } from "@/store/selection-sort-store"
import { createValuesCodec } from "@/algorithms/shared/editor/doc-codec"

export const selectionSortCodec = createValuesCodec<SelectionSortDoc>({
  badValuesKey: "editor.ssErrBadValues",
})
