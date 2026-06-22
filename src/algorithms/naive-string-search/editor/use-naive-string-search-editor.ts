// Контролер редактора наївного пошуку в рядках: пресети, імпорт/експорт/шаринг.
// Як інші редактори пошуку — БЕЗ React Flow: текст + шаблон прямо у Zustand-сторі.

import { useCallback, useEffect, type ChangeEvent } from "react"
import { readGraphParam } from "@/algorithms/shared/editor/use-graph-editor"
import { naiveStringSearchCodec } from "@/algorithms/naive-string-search/editor/naive-string-search-doc"
import { setHash } from "@/hooks/use-route"
import { tr } from "@/i18n/use-t"
import { toast } from "@/store/toast-store"
import { useNaiveStringSearchStore } from "@/store/naive-string-search-store"

const EXPORT_FILENAME = "naive-string-search.json"
const ROUTE_PATH = "naive-string-search/editor"

const loadedRoutes = new Set<string>()

export interface NaiveStringSearchEditorController {
  readonly onLoadMain: () => void
  readonly onLoadWorst: () => void
  readonly onLoadNotFound: () => void
  readonly onLoadOverlap: () => void
  readonly onLoadRandom: () => void
  readonly onClear: () => void
  readonly onExport: () => void
  readonly onImportFile: (event: ChangeEvent<HTMLInputElement>) => void
  readonly onShare: () => void
}

export function useNaiveStringSearchEditor(): NaiveStringSearchEditorController {
  const clear = useNaiveStringSearchStore((s) => s.clear)
  const loadMain = useNaiveStringSearchStore((s) => s.loadMain)
  const loadWorst = useNaiveStringSearchStore((s) => s.loadWorst)
  const loadNotFound = useNaiveStringSearchStore((s) => s.loadNotFound)
  const loadOverlap = useNaiveStringSearchStore((s) => s.loadOverlap)
  const loadRandom = useNaiveStringSearchStore((s) => s.loadRandom)
  const loadDoc = useNaiveStringSearchStore((s) => s.loadDoc)
  const toDoc = useNaiveStringSearchStore((s) => s.toDoc)

  useEffect(() => {
    if (loadedRoutes.has(ROUTE_PATH)) return
    loadedRoutes.add(ROUTE_PATH)
    const param = readGraphParam(window.location.hash)
    if (!param) return
    const doc = naiveStringSearchCodec.decodeHash(param)
    if (doc) loadDoc(doc)
  }, [loadDoc])

  const onExport = useCallback(() => {
    const blob = new Blob([naiveStringSearchCodec.toJSON(toDoc())], {
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
        .then((text) => loadDoc(naiveStringSearchCodec.fromJSON(text)))
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
    const hash = naiveStringSearchCodec.encodeHash(toDoc())
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
    onLoadWorst: loadWorst,
    onLoadNotFound: loadNotFound,
    onLoadOverlap: loadOverlap,
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
