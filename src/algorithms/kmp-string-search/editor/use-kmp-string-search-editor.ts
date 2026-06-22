// Контролер редактора KMP: пресети, імпорт/експорт/шаринг. Як інші редактори пошуку —
// БЕЗ React Flow: текст + шаблон прямо у Zustand-сторі.

import { useCallback, useEffect, type ChangeEvent } from "react"
import { readGraphParam } from "@/algorithms/shared/editor/use-graph-editor"
import { kmpStringSearchCodec } from "@/algorithms/kmp-string-search/editor/kmp-string-search-doc"
import { setHash } from "@/hooks/use-route"
import { tr } from "@/i18n/use-t"
import { toast } from "@/store/toast-store"
import { useKmpStringSearchStore } from "@/store/kmp-string-search-store"

const EXPORT_FILENAME = "kmp-string-search.json"
const ROUTE_PATH = "kmp-string-search/editor"

const loadedRoutes = new Set<string>()

export interface KmpStringSearchEditorController {
  readonly onLoadMain: () => void
  readonly onLoadKonspect: () => void
  readonly onLoadWorst: () => void
  readonly onLoadNotFound: () => void
  readonly onLoadRandom: () => void
  readonly onClear: () => void
  readonly onExport: () => void
  readonly onImportFile: (event: ChangeEvent<HTMLInputElement>) => void
  readonly onShare: () => void
}

export function useKmpStringSearchEditor(): KmpStringSearchEditorController {
  const clear = useKmpStringSearchStore((s) => s.clear)
  const loadMain = useKmpStringSearchStore((s) => s.loadMain)
  const loadKonspect = useKmpStringSearchStore((s) => s.loadKonspect)
  const loadWorst = useKmpStringSearchStore((s) => s.loadWorst)
  const loadNotFound = useKmpStringSearchStore((s) => s.loadNotFound)
  const loadRandom = useKmpStringSearchStore((s) => s.loadRandom)
  const loadDoc = useKmpStringSearchStore((s) => s.loadDoc)
  const toDoc = useKmpStringSearchStore((s) => s.toDoc)

  useEffect(() => {
    if (loadedRoutes.has(ROUTE_PATH)) return
    loadedRoutes.add(ROUTE_PATH)
    const param = readGraphParam(window.location.hash)
    if (!param) return
    const doc = kmpStringSearchCodec.decodeHash(param)
    if (doc) loadDoc(doc)
  }, [loadDoc])

  const onExport = useCallback(() => {
    const blob = new Blob([kmpStringSearchCodec.toJSON(toDoc())], {
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
        .then((text) => loadDoc(kmpStringSearchCodec.fromJSON(text)))
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
    const hash = kmpStringSearchCodec.encodeHash(toDoc())
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
    onLoadKonspect: loadKonspect,
    onLoadWorst: loadWorst,
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
