// Серіалізація документа редактора наївного пошуку (текст + шаблон): JSON для
// імпорту/експорту + компактний base64url для шарингу через URL-хеш (?g=...).
// Окремий wire-формат (version 1; два рядки). Валідація — у createTextPatternCodec.

import type { NaiveStringSearchDoc } from "@/store/naive-string-search-store"
import { createTextPatternCodec } from "@/algorithms/shared/editor/doc-codec"

export const naiveStringSearchCodec = createTextPatternCodec<NaiveStringSearchDoc>({
  badTextKey: "editor.nssErrBadText",
  badPatternKey: "editor.nssErrBadPattern",
})
