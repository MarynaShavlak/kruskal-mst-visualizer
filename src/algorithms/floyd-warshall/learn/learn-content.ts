// Навчальний контент (markdown) згенеровано з READMEs Python-репозиторію
// Флойда–Воршала і збережено поруч як raw-рядки (див. transform-fw-readme).
import uaRaw from "./content.ua.md?raw"
import enRaw from "./content.en.md?raw"

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
