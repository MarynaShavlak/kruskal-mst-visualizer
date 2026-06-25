// Серіалізація документа редактора Боєра-Мура (текст + шаблон): JSON для імпорту/експорту
// + компактний base64url для шарингу через URL-хеш (?g=...). Окремий wire-формат
// (version 1; два рядки). Валідація — у createTextPatternCodec.

import type { BoyerMooreStringSearchDoc } from "@/store/boyer-moore-string-search-store"
import { createTextPatternCodec } from "@/algorithms/shared/editor/doc-codec"

export const boyerMooreStringSearchCodec = createTextPatternCodec<BoyerMooreStringSearchDoc>({
  badTextKey: "editor.bmErrBadText",
  badPatternKey: "editor.bmErrBadPattern",
})
