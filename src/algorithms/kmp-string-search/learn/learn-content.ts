// Навчальний контент KMP: markdown перенесено з README Python-проєкту
// algo-knuth-morris-pratt-search і збережено поруч як raw-рядки content.*.md,
// що ведуться вручну (GitHub-«хром» зрізано, секції нумеровано `## N.` під спільні
// parseToc/LearnView). Фігури README → живі віджети у figure-widgets.
import uaRaw from "./content.ua.md?raw"
import enRaw from "./content.en.md?raw"
import { makeLearnContent } from "@/algorithms/shared/learn/learn-content"

export const LEARN_CONTENT = makeLearnContent(uaRaw, enRaw)
export {
  parseToc,
  type Lang,
  type TocEntry,
} from "@/algorithms/shared/learn/learn-content"
