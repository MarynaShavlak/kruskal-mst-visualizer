// Контролер редактора пошуку Рабіна-Карпа: пресети, імпорт/експорт/шаринг.
// Як інші редактори пошуку — БЕЗ React Flow: текст + шаблон прямо у Zustand-сторі.

import { useCallback, useEffect, type ChangeEvent } from "react"
import { readGraphParam } from "@/algorithms/shared/editor/use-graph-editor"
import { rabinKarpStringSearchCodec } from "@/algorithms/rabin-karp-string-search/editor/rabin-karp-string-search-doc"
import { setHash } from "@/hooks/use-route"
import { tr } from "@/i18n/use-t"
import { toast } from "@/store/toast-store"
import { useRabinKarpStringSearchStore } from "@/store/rabin-karp-string-search-store"

const EXPORT_FILENAME = "rabin-karp-string-search.json"
const ROUTE_PATH = "rabin-karp-string-search/editor"

const loadedRoutes = new Set<string>()

export interface RabinKarpStringSearchEditorController {
  readonly onLoadMain: () => void
  readonly onLoadCollision: () => void
  readonly onLoadMulti: () => void
  readonly onLoadNotFound: () => void
  readonly onLoadRandom: () => void
  readonly onClear: () => void
  readonly onExport: () => void
  readonly onImportFile: (event: ChangeEvent<HTMLInputElement>) => void
  readonly onShare: () => void
}

export function useRabinKarpStringSearchEditor(): RabinKarpStringSearchEditorController {
  const clear = useRabinKarpStringSearchStore((s) => s.clear)
  const loadMain = useRabinKarpStringSearchStore((s) => s.loadMain)
  const loadCollision = useRabinKarpStringSearchStore((s) => s.loadCollision)
  const loadMulti = useRabinKarpStringSearchStore((s) => s.loadMulti)
  const loadNotFound = useRabinKarpStringSearchStore((s) => s.loadNotFound)
  const loadRandom = useRabinKarpStringSearchStore((s) => s.loadRandom)
  const loadDoc = useRabinKarpStringSearchStore((s) => s.loadDoc)
  const toDoc = useRabinKarpStringSearchStore((s) => s.toDoc)

  useEffect(() => {
    if (loadedRoutes.has(ROUTE_PATH)) return
    loadedRoutes.add(ROUTE_PATH)
    const param = readGraphParam(window.location.hash)
    if (!param) return
    const doc = rabinKarpStringSearchCodec.decodeHash(param)
    if (doc) loadDoc(doc)
  }, [loadDoc])

  const onExport = useCallback(() => {
    const blob = new Blob([rabinKarpStringSearchCodec.toJSON(toDoc())], {
      type: "application/json",
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = EXPORT_FILENAME
    a.click()
    URL.revokeObjectURL(url)
  }, [toDoc])

  const onImportFile = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      e.target.value = ""
      if (!file) return
      file
        .text()
        .then((text) => loadDoc(rabinKarpStringSearchCodec.fromJSON(text)))
        .catch((err: unknown) => {
          toast({
            title: tr("editor.importFailed"),
            description: err instanceof Error ? err.message : String(err),
            variant: "destructive",
          })
        })
    },
    [loadDoc],
  )

  const onShare = useCallback(() => {
    const hash = rabinKarpStringSearchCodec.encodeHash(toDoc())
    const route = `${ROUTE_PATH}?g=${hash}`
    const url = `${window.location.origin}${window.location.pathname}#${route}`
    setHash(route)
    void navigator.clipboard?.writeText(url).then(
      () => toast({ description: tr("editor.linkCopied") }),
      () => undefined,
    )
  }, [toDoc])

  return {
    onLoadMain: loadMain,
    onLoadCollision: loadCollision,
    onLoadMulti: loadMulti,
    onLoadNotFound: loadNotFound,
    onLoadRandom: useCallback(
      () => loadRandom(Math.floor(Math.random() * 1e9)),
      [loadRandom],
    ),
    onClear: clear,
    onExport,
    onImportFile,
    onShare,
  }
}
