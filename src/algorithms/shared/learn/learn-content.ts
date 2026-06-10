// Спільні утиліти навчального контенту: тип мови, зміст (TOC) і фабрика
// LEARN_CONTENT. Сирий markdown кожен алгоритм підставляє свій (кореневі README
// або локальні content.*.md) — тут лише фреймворк-незалежний розбір.

export type Lang = "ua" | "en"

export interface TocEntry {
  id: string
  title: string
}

/** Збирає LEARN_CONTENT із двох raw-рядків markdown (UA та EN). */
export function makeLearnContent(
  uaRaw: string,
  enRaw: string,
): Record<Lang, string> {
  return { ua: uaRaw, en: enRaw }
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
