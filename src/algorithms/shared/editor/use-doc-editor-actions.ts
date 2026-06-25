// Спільні дії редактора документа (масив / текст-шаблон / предмети — БЕЗ React Flow):
// випадковий пресет, експорт JSON, імпорт файлу, шаринг через URL-хеш (?g=...) +
// одноразове відновлення спільного інстансу з хеша. Алгоритмо-специфічні пресети та
// onAddValue/onAddItem/onSort лишаються в контролері конкретного алгоритму.

import { useCallback, useEffect, type ChangeEvent } from "react"
import type { DocCodec } from "@/algorithms/shared/editor/doc-codec"
import { readGraphParam } from "@/algorithms/shared/editor/use-graph-editor"
import { useEmbedSnippet } from "@/algorithms/shared/editor/use-embed-snippet"
import { setHash } from "@/hooks/use-route"
import { tr } from "@/i18n/use-t"
import { toast } from "@/store/toast-store"

// Спільний інстанс із URL-хеша вантажимо лише раз за сесію сторінки — ключ маршрут.
const loadedRoutes = new Set<string>()

export interface DocEditorActions {
  readonly onLoadRandom: () => void
  readonly onExport: () => void
  readonly onImportFile: (event: ChangeEvent<HTMLInputElement>) => void
  readonly onShare: () => void
  /** Копіює `<iframe>`-сніпет embed-режиму поточного редактора. */
  readonly onCopyEmbed: () => void
}

export interface DocEditorActionsOptions<Doc> {
  readonly codec: DocCodec<Doc>
  readonly toDoc: () => Doc
  readonly loadDoc: (doc: Doc) => void
  readonly loadRandom: (seed: number) => void
  readonly filename: string
  readonly routePath: string
}

export function useDocEditorActions<Doc>({
  codec,
  toDoc,
  loadDoc,
  loadRandom,
  filename,
  routePath,
}: DocEditorActionsOptions<Doc>): DocEditorActions {
  // Одноразове завантаження спільного інстансу з URL-хеша (?g=...).
  useEffect(() => {
    if (loadedRoutes.has(routePath)) return
    loadedRoutes.add(routePath)
    const param = readGraphParam(window.location.hash)
    if (!param) return
    const doc = codec.decodeHash(param)
    if (doc) loadDoc(doc)
  }, [codec, loadDoc, routePath])

  const onLoadRandom = useCallback(
    () => loadRandom(Math.floor(Math.random() * 1e9)),
    [loadRandom],
  )

  const onExport = useCallback(() => {
    const blob = new Blob([codec.toJSON(toDoc())], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }, [codec, toDoc, filename])

  const onImportFile = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      e.target.value = ""
      if (!file) return
      file
        .text()
        .then((text) => loadDoc(codec.fromJSON(text)))
        .catch((err: unknown) => {
          toast({
            title: tr("editor.importFailed"),
            description: err instanceof Error ? err.message : String(err),
            variant: "destructive",
          })
        })
    },
    [codec, loadDoc],
  )

  const onShare = useCallback(() => {
    const hash = codec.encodeHash(toDoc())
    const route = `${routePath}?g=${hash}`
    const url = `${window.location.origin}${window.location.pathname}#${route}`
    setHash(route)
    void navigator.clipboard?.writeText(url).then(
      () => toast({ description: tr("editor.linkCopied") }),
      () => undefined,
    )
  }, [codec, toDoc, routePath])

  const onCopyEmbed = useEmbedSnippet({
    route: routePath,
    title: tr("app.title"),
  })

  return { onLoadRandom, onExport, onImportFile, onShare, onCopyEmbed }
}
