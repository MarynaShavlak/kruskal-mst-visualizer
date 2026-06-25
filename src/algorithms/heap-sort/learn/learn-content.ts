// Навчальний контент пірамідального сортування: markdown ведеться вручну поруч як
// raw-рядки content.*.md (секції нумеровано `## N.` під спільні parseToc/LearnView).
// Фігури README → живі віджети у figure-widgets.
import uaRaw from "./content.ua.md?raw"
import enRaw from "./content.en.md?raw"
import { makeLearnContent } from "@/algorithms/shared/learn/learn-content"

export const LEARN_CONTENT = makeLearnContent(uaRaw, enRaw)
export {
  parseToc,
  type Lang,
  type TocEntry,
} from "@/algorithms/shared/learn/learn-content"
