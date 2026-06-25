// Кнопка «Скопіювати код вставки» редактора: будує готовий <iframe>-сніпет на
// поточний роут у embed-режимі (?embed=1) і кладе його в буфер обміну + тост.
// Викладач вставляє сніпет у LMS/блог — chrome-less віджет без шапки.

import { useCallback } from "react"
import { buildEmbedUrl } from "@/hooks/use-embed"
import { tr } from "@/i18n/use-t"
import { useLangStore } from "@/store/lang-store"
import { toast } from "@/store/toast-store"

/** Розміри iframe за замовчуванням (пресет «плеєр/редактор у статті»). */
const DEFAULT_WIDTH = 800
const DEFAULT_HEIGHT = 600

export interface EmbedSnippetOptions {
  /** Роут платформи (без '#'), напр. `kruskal/playback`. */
  readonly route: string
  /** Заголовок iframe (для a11y/превʼю в LMS). */
  readonly title: string
  readonly width?: number
  readonly height?: number
}

/** Збирає HTML-сніпет `<iframe>` для embed-вставки поточного роута. */
export function buildEmbedSnippet({
  route,
  title,
  width = DEFAULT_WIDTH,
  height = DEFAULT_HEIGHT,
}: EmbedSnippetOptions): string {
  const lang = useLangStore.getState().lang
  const src = buildEmbedUrl(route, { lang })
  const safeTitle = title.replace(/"/g, "&quot;")
  return (
    `<iframe src="${src}" width="${width}" height="${height}" ` +
    `title="${safeTitle}" loading="lazy" style="border:0"></iframe>`
  )
}

/**
 * Повертає `onCopyEmbed` — копіює `<iframe>`-сніпет у буфер і показує тост.
 * Тост береться з `embed.copied`; clipboard опційний (graceful no-op).
 */
export function useEmbedSnippet(opts: EmbedSnippetOptions): () => void {
  const { route, title, width, height } = opts
  return useCallback(() => {
    const snippet = buildEmbedSnippet({ route, title, width, height })
    void navigator.clipboard?.writeText(snippet).then(
      () => toast({ description: tr("embed.copied") }),
      () => undefined,
    )
  }, [route, title, width, height])
}
