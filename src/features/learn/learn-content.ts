// Навчальний контент (markdown) імпортується з кореня проєкту як raw-рядок.
import uaRaw from "../../../README.ua.md?raw"
import enRaw from "../../../README.en.md?raw"

export type Lang = "ua" | "en"

export const LEARN_CONTENT: Record<Lang, string> = { ua: uaRaw, en: enRaw }

export interface TocEntry {
  id: string
  title: string
}

/** Зміст із пар `<a id="secN"></a>` + наступного `## Заголовок`. */
export function parseToc(md: string): TocEntry[] {
  const re = /<a id="(sec\d+)">\s*<\/a>\s*\n+##\s+(.+)/g
  const out: TocEntry[] = []
  let m: RegExpExecArray | null
  while ((m = re.exec(md)) !== null) {
    out.push({ id: m[1], title: m[2].trim() })
  }
  return out
}
