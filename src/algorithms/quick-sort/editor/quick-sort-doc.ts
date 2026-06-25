// Серіалізація документа редактора швидкого сортування (масив чисел): JSON для
// імпорту/експорту + компактний base64url для шарингу через URL-хеш (?g=...).
// Окремий wire-формат (version 1; масив цілих ≥0). Валідація — у createValuesCodec.

import type { QuickSortDoc } from "@/store/quick-sort-store"
import { createValuesCodec } from "@/algorithms/shared/editor/doc-codec"

export const quickSortCodec = createValuesCodec<QuickSortDoc>({
  badValuesKey: "editor.qsErrBadValues",
})
