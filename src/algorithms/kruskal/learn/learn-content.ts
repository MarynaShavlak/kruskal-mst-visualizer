// Навчальний контент Краскала: сирий markdown із кореневих README проєкту.
import uaRaw from "../../../../README.ua.md?raw"
import enRaw from "../../../../README.en.md?raw"
import { makeLearnContent } from "@/algorithms/shared/learn/learn-content"

/**
 * Прибирає GitHub-«хром» із кореневого README для навчальної вкладки:
 *  1) ручний блок «Зміст»/«Contents» — його заміняє бічний TOC (parseToc), тож у
 *     тілі статті він лише дублюється;
 *  2) блок-цитату з посиланням на PROJECT.md — того файлу в репозиторії немає,
 *     тож у SPA це битий відносний лінк;
 *  3) emoji 🌳 з H1 — у FW/HK заголовки без emoji, тож прибираємо для однаковості;
 *  4) рядок-бейдж перемикача мови (🇺🇦 · 🇬🇧) — його заміняє глобальний перемикач
 *     у шапці, а FW/HK такого рядка не мають.
 * README лишається повним для GitHub — чистимо тільки копію, що йде в LearnView.
 * (Без `\b` після назви: у JS він ASCII-only й не спрацював би після кирилиці.)
 */
function stripReadmeChrome(md: string): string {
  return md
    .replace(/^##\s+(?:Зміст|Contents)[^\n]*\n[\s\S]*?\n---\n/m, "")
    .replace(/^>[^\n]*PROJECT\.md[^\n]*\r?\n/m, "")
    .replace(/^#\s+🌳\s+/m, "# ")
    .replace(/^[^\n]*🇺🇦[^\n]*🇬🇧[^\n]*\r?\n/m, "")
}

/**
 * «Відкладена чорна скринька» для кроку 1 (сортування ребер): у Краскалі ребра
 * обходяться від найлегшого до найважчого, але саме ефективне сортування — це вже
 * родина «Сортування», яку платформа викладає пізніше. Тож у секції 3 додаємо
 * коротку примітку-міст уперед: тут сортування вважаємо даністю, деталі — далі.
 *
 * Вставка — БЛОКОМ-ЦИТАТОЮ перед абзацом «Ключове спостереження»/«Key observation»
 * (унікальний якір у обох README). Не заголовок → TOC (sec1..sec18) не міняється;
 * без стрипнутого «хрому» (🌳/прапорці/PROJECT.md). Якщо якір колись зникне,
 * `.replace` поверне текст без змін — деградуємо тихо, без збою.
 */
const SORT_BLACKBOX = {
  ua: {
    anchor: "**Ключове спостереження.**",
    note:
      "> **Крок 1 — «чорна скринька».** Тут ми просто розкладаємо ребра від " +
      "найлегшого до найважчого й вважаємо це даністю; як саме сортувати " +
      "ефективно — окрема велика тема (родина «Сортування»), до якої ми " +
      "повернемось далі.",
  },
  en: {
    anchor: "**Key observation.**",
    note:
      '> **Step 1 — a "black box".** Here we simply arrange the edges from ' +
      "lightest to heaviest and take that as given; how to sort efficiently is " +
      "a big topic of its own (the Sorting family) that we'll return to later.",
  },
} as const

function injectSortBlackBox(md: string, lang: "ua" | "en"): string {
  const { anchor, note } = SORT_BLACKBOX[lang]
  return md.replace(anchor, `${note}\n\n${anchor}`)
}

export const LEARN_CONTENT = makeLearnContent(
  injectSortBlackBox(stripReadmeChrome(uaRaw), "ua"),
  injectSortBlackBox(stripReadmeChrome(enRaw), "en"),
)
export {
  parseToc,
  type Lang,
  type TocEntry,
} from "@/algorithms/shared/learn/learn-content"
