// Навчальний контент Краскала: сирий markdown із кореневих README проєкту.
import uaRaw from "../../../../README.ua.md?raw"
import enRaw from "../../../../README.en.md?raw"
import { makeLearnContent } from "@/algorithms/shared/learn/learn-content"

export const LEARN_CONTENT = makeLearnContent(uaRaw, enRaw)
export {
  parseToc,
  type Lang,
  type TocEntry,
} from "@/algorithms/shared/learn/learn-content"
