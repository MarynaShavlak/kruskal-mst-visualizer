// Контролер редактора лінійного пошуку: пресети, імпорт/експорт/шаринг. Як
// редактори сортувань — БЕЗ React Flow: масив чисел + ціль прямо у Zustand-сторі.

import { useCallback, useEffect, type ChangeEvent } from "react"
import { readGraphParam } from "@/algorithms/shared/editor/use-graph-editor"
import { linearSearchCodec } from "@/algorithms/linear-search/editor/linear-search-doc"
import { setHash } from "@/hooks/use-route"
import { tr } from "@/i18n/use-t"
import { toast } from "@/store/toast-store"
import { useLinearSearchStore } from "@/store/linear-search-store"

const EXPORT_FILENAME = "linear-search.json"
const ROUTE_PATH = "linear-search/editor"

const loadedRoutes = new Set<string>()

export interface LinearSearchEditorController {
  readonly onLoadMain: () => void
  readonly onLoadDuplicates: () => void
  readonly onLoadSorted: () => void
  readonly onLoadRandom: () => void
  readonly onAddValue: () => void
  readonly onClear: () => void
  readonly onExport: () => void
  readonly onImportFile: (event: ChangeEvent<HTMLInputElement>) => void
  readonly onShare: () => void
}

export function useLinearSearchEditor(): LinearSearchEditorController {
  const addValue = useLinearSearchStore((s) => s.addValue)
  const clear = useLinearSearchStore((s) => s.clear)
  const loadMain = useLinearSearchStore((s) => s.loadMain)
  const loadDuplicates = useLinearSearchStore((s) => s.loadDuplicates)
  const loadSorted = useLinearSearchStore((s) => s.loadSorted)
  const loadRandom = useLinearSearchStore((s) => s.loadRandom)
  const loadDoc = useLinearSearchStore((s) => s.loadDoc)
  const toDoc = useLinearSearchStore((s) => s.toDoc)

  useEffect(() => {
    if (loadedRoutes.has(ROUTE_PATH)) return
    loadedRoutes.add(ROUTE_PATH)
    const param = readGraphParam(window.location.hash)
    if (!param) return
    const doc = linearSearchCodec.decodeHash(param)
    if (doc) loadDoc(doc)
  }, [loadDoc])

  const onExport = useCallback(() => {
    const blob = new Blob([linearSearchCodec.toJSON(toDoc())], {
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
        .then((text) => loadDoc(linearSearchCodec.fromJSON(text)))
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
    const hash = linearSearchCodec.encodeHash(toDoc())
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
    onLoadDuplicates: loadDuplicates,
    onLoadSorted: loadSorted,
    onLoadRandom: useCallback(
      () => loadRandom(Math.floor(Math.random() * 1e9)),
      [loadRandom],
    ),
    onAddValue: addValue,
    onClear: clear,
    onExport,
    onImportFile,
    onShare,
  }
}
