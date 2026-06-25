// Серіалізація документа редактора KMP (текст + шаблон): JSON для імпорту/експорту +
// компактний base64url для шарингу через URL-хеш (?g=...). Окремий wire-формат
// (version 1; два рядки). Валідація — у createTextPatternCodec.

import type { KmpStringSearchDoc } from "@/store/kmp-string-search-store"
import { createTextPatternCodec } from "@/algorithms/shared/editor/doc-codec"

export const kmpStringSearchCodec = createTextPatternCodec<KmpStringSearchDoc>({
  badTextKey: "editor.kmpErrBadText",
  badPatternKey: "editor.kmpErrBadPattern",
})
