// Навчальний контент Флойда–Воршала: markdown згенеровано з READMEs Python-
// репозиторію і збережено поруч як raw-рядки (див. transform-fw-readme).
import uaRaw from "./content.ua.md?raw"
import enRaw from "./content.en.md?raw"
import { makeLearnContent } from "@/algorithms/shared/learn/learn-content"

export const LEARN_CONTENT = makeLearnContent(uaRaw, enRaw)
export {
  parseToc,
  type Lang,
  type TocEntry,
} from "@/algorithms/shared/learn/learn-content"
