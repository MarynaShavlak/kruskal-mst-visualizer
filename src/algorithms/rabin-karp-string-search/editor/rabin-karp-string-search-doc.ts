// Серіалізація документа редактора пошуку Рабіна-Карпа (текст + шаблон): JSON для
// імпорту/експорту + компактний base64url для шарингу через URL-хеш (?g=...).
// Окремий wire-формат (version 1; два рядки). Валідація — у createTextPatternCodec.

import type { RabinKarpStringSearchDoc } from "@/store/rabin-karp-string-search-store"
import { createTextPatternCodec } from "@/algorithms/shared/editor/doc-codec"

export const rabinKarpStringSearchCodec = createTextPatternCodec<RabinKarpStringSearchDoc>({
  badTextKey: "editor.rkErrBadText",
  badPatternKey: "editor.rkErrBadPattern",
})
