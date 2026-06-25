// Серіалізація документа редактора лінійного пошуку (масив чисел + ціль): JSON для
// імпорту/експорту + компактний base64url для шарингу через URL-хеш (?g=...).
// Окремий wire-формат (version 1; масив цілих + ціль). Валідація — у createSearchCodec.

import type { LinearSearchDoc } from "@/store/linear-search-store"
import { createSearchCodec } from "@/algorithms/shared/editor/doc-codec"

export const linearSearchCodec = createSearchCodec<LinearSearchDoc>({
  badValuesKey: "editor.lsErrBadValues",
  badTargetKey: "editor.lsErrBadTarget",
})
