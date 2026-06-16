// Навчальний контент Прима: markdown перенесено з README Python-проєкту algo-prim
// і збережено поруч як raw-рядки (трансформер scripts/transform-prim-readme.mjs
// прибирає GitHub-«хром»/анімації й нумерує секції під спільні parseToc/LearnView).
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
