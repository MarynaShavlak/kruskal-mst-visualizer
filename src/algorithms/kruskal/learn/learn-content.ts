// Навчальний контент (markdown) імпортується з кореня проєкту як raw-рядок.
import uaRaw from "../../../../README.ua.md?raw"
import enRaw from "../../../../README.en.md?raw"

export type Lang = "ua" | "en"

export const LEARN_CONTENT: Record<Lang, string> = { ua: uaRaw, en: enRaw }

export interface TocEntry {
  id: string
  title: string
}

/**
 * Зміст із нумерованих секцій `## N. Заголовок`. Id `secN` збігається з тим,
 * що компонент <h2> у LearnView вішає на ці заголовки.
 */
export function parseToc(md: string): TocEntry[] {
  const re = /^##\s+(\d+)\.\s+(.+)$/gm
  const out: TocEntry[] = []
  let m: RegExpExecArray | null
  while ((m = re.exec(md)) !== null) {
    out.push({ id: `sec${m[1]}`, title: `${m[1]}. ${m[2].trim()}` })
  }
  return out
}
