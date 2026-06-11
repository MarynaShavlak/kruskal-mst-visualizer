// Навчальний контент Краскала: сирий markdown із кореневих README проєкту.
import uaRaw from "../../../../README.ua.md?raw"
import enRaw from "../../../../README.en.md?raw"
import { makeLearnContent } from "@/algorithms/shared/learn/learn-content"

/**
 * Прибирає GitHub-«хром» із кореневого README для навчальної вкладки:
 *  1) ручний блок «Зміст»/«Contents» — його заміняє бічний TOC (parseToc), тож у
 *     тілі статті він лише дублюється;
 *  2) блок-цитату з посиланням на PROJECT.md — того файлу в репозиторії немає,
 *     тож у SPA це битий відносний лінк.
 * README лишається повним для GitHub — чистимо тільки копію, що йде в LearnView.
 * (Без `\b` після назви: у JS він ASCII-only й не спрацював би після кирилиці.)
 */
function stripReadmeChrome(md: string): string {
  return md
    .replace(/^##\s+(?:Зміст|Contents)[^\n]*\n[\s\S]*?\n---\n/m, "")
    .replace(/^>[^\n]*PROJECT\.md[^\n]*\r?\n/m, "")
}

export const LEARN_CONTENT = makeLearnContent(
  stripReadmeChrome(uaRaw),
  stripReadmeChrome(enRaw),
)
export {
  parseToc,
  type Lang,
  type TocEntry,
} from "@/algorithms/shared/learn/learn-content"
