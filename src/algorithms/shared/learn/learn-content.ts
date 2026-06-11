// Спільні утиліти навчального контенту: тип мови, зміст (TOC) і фабрика
// LEARN_CONTENT. Сирий markdown кожен алгоритм підставляє свій (кореневі README
// або локальні content.*.md) — тут лише фреймворк-незалежний розбір.

export type Lang = "ua" | "en"

export interface TocEntry {
  id: string
  title: string
  /**
   * 1-based номер рядка заголовка в markdown. LearnView вішає той самий id на
   * відрендерений <h2>/<h3> за node.position — так id у TOC і в статті збігаються
   * без повторного слугіфікування (важливо для дедуплікованих H3).
   */
  line: number
  /** Підрозділи (H3) для секцій H2; у самих H3 — відсутні. */
  children?: TocEntry[]
}

/** Збирає LEARN_CONTENT із двох raw-рядків markdown (UA та EN). */
export function makeLearnContent(
  uaRaw: string,
  enRaw: string,
): Record<Lang, string> {
  return { ua: uaRaw, en: enRaw }
}

/** Прибирає inline-markdown (код, жирний, курсив, посилання, $-математику). */
function cleanInline(s: string): string {
  return s
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/\$([^$]+)\$/g, "$1")
    .trim()
}

/** Slug із тексту заголовка; Unicode-aware, тож працює і для кирилиці. */
function slugify(s: string): string {
  return cleanInline(s)
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
}

/**
 * Зміст із заголовків markdown: H2 виду `## N. Заголовок` (id `secN`, узгоджено з
 * <h2> у LearnView) з вкладеними H3 `### Заголовок` (slug-id із дедуплікацією).
 * Заголовки всередині блоків коду (``` … ```) ігноруються. Повертає лише
 * H2-секції верхнього рівня (H3 — у `children`).
 */
export function parseToc(md: string): TocEntry[] {
  const lines = md.split("\n")
  const sections: TocEntry[] = []
  const usedIds = new Set<string>()
  let current: TocEntry | null = null
  let inFence = false

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (/^\s*```/.test(line)) {
      inFence = !inFence
      continue
    }
    if (inFence) continue

    const h2 = /^##\s+(\d+)\.\s+(.+?)\s*$/.exec(line)
    if (h2) {
      current = {
        id: `sec${h2[1]}`,
        title: `${h2[1]}. ${cleanInline(h2[2])}`,
        line: i + 1,
        children: [],
      }
      sections.push(current)
      continue
    }

    // H3 враховуємо лише під уже відкритою секцією H2 (інакше — поза змістом,
    // щоб не порушити контракт «верхній рівень = sec1..secN»).
    const h3 = /^###\s+(.+?)\s*$/.exec(line)
    if (h3 && current) {
      const base = slugify(h3[1]) || "section"
      let id = base
      let n = 2
      while (usedIds.has(id)) id = `${base}-${n++}`
      usedIds.add(id)
      current.children!.push({ id, title: cleanInline(h3[1]), line: i + 1 })
    }
  }

  return sections
}
