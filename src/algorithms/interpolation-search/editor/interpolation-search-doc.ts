// Серіалізація документа редактора інтерполяційного пошуку (масив чисел + ціль): JSON
// для імпорту/експорту + компактний base64url для шарингу через URL-хеш (?g=...).
// Окремий wire-формат (version 1; масив цілих + ціль). Валідація — у createSearchCodec.

import type { InterpolationSearchDoc } from "@/store/interpolation-search-store"
import { createSearchCodec } from "@/algorithms/shared/editor/doc-codec"

export const interpolationSearchCodec = createSearchCodec<InterpolationSearchDoc>({
  badValuesKey: "editor.ipErrBadValues",
  badTargetKey: "editor.ipErrBadTarget",
})
