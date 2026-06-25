// Серіалізація документа редактора сортування Шелла (масив чисел): JSON для
// імпорту/експорту + компактний base64url для шарингу через URL-хеш (?g=...).
// Окремий wire-формат (version 1; масив цілих ≥0). Валідація — у createValuesCodec.

import type { ShellSortDoc } from "@/store/shell-sort-store"
import { createValuesCodec } from "@/algorithms/shared/editor/doc-codec"

export const shellSortCodec = createValuesCodec<ShellSortDoc>({
  badValuesKey: "editor.shErrBadValues",
})
