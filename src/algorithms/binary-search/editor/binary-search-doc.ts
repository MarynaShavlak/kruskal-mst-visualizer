// Серіалізація документа редактора двійкового пошуку (масив чисел + ціль): JSON для
// імпорту/експорту + компактний base64url для шарингу через URL-хеш (?g=...).
// Окремий wire-формат (version 1; масив цілих + ціль). Валідація — у createSearchCodec.

import type { BinarySearchDoc } from "@/store/binary-search-store"
import { createSearchCodec } from "@/algorithms/shared/editor/doc-codec"

export const binarySearchCodec = createSearchCodec<BinarySearchDoc>({
  badValuesKey: "editor.binErrBadValues",
  badTargetKey: "editor.binErrBadTarget",
})
