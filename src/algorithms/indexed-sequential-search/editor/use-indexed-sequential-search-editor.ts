// Контролер редактора індексно-послідовного пошуку: пресети, сортування (передумова),
// імпорт/експорт/шаринг. Як редактори пошуку — БЕЗ React Flow: масив цілих + ціль +
// крок індексу прямо у Zustand-сторі.

import { useCallback, useEffect, type ChangeEvent } from "react"
import { readGraphParam } from "@/algorithms/shared/editor/use-graph-editor"
import { indexedSequentialSearchCodec } from "@/algorithms/indexed-sequential-search/editor/indexed-sequential-search-doc"
import { setHash } from "@/hooks/use-route"
import { tr } from "@/i18n/use-t"
import { toast } from "@/store/toast-store"
import { useIndexedSequentialSearchStore } from "@/store/indexed-sequential-search-store"

const EXPORT_FILENAME = "indexed-sequential-search.json"
const ROUTE_PATH = "indexed-sequential-search/editor"

const loadedRoutes = new Set<string>()

export interface IndexedSequentialSearchEditorController {
  readonly onLoadIntro: () => void
  readonly onLoadInIndex: () => void
  readonly onLoadAbsent: () => void
  readonly onLoadRandom: () => void
  readonly onAddValue: () => void
  readonly onSort: () => void
  readonly onClear: () => void
  readonly onExport: () => void
  readonly onImportFile: (event: ChangeEvent<HTMLInputElement>) => void
  readonly onShare: () => void
}

export function useIndexedSequentialSearchEditor(): IndexedSequentialSearchEditorController {
  const addValue = useIndexedSequentialSearchStore((s) => s.addValue)
  const sortValues = useIndexedSequentialSearchStore((s) => s.sortValues)
  const clear = useIndexedSequentialSearchStore((s) => s.clear)
  const loadIntro = useIndexedSequentialSearchStore((s) => s.loadIntro)
  const loadInIndex = useIndexedSequentialSearchStore((s) => s.loadInIndex)
  const loadAbsent = useIndexedSequentialSearchStore((s) => s.loadAbsent)
  const loadRandom = useIndexedSequentialSearchStore((s) => s.loadRandom)
  const loadDoc = useIndexedSequentialSearchStore((s) => s.loadDoc)
  const toDoc = useIndexedSequentialSearchStore((s) => s.toDoc)

  useEffect(() => {
    if (loadedRoutes.has(ROUTE_PATH)) return
    loadedRoutes.add(ROUTE_PATH)
    const param = readGraphParam(window.location.hash)
    if (!param) return
    const doc = indexedSequentialSearchCodec.decodeHash(param)
    if (doc) loadDoc(doc)
  }, [loadDoc])

  const onExport = useCallback(() => {
    const blob = new Blob([indexedSequentialSearchCodec.toJSON(toDoc())], {
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
        .then((text) => loadDoc(indexedSequentialSearchCodec.fromJSON(text)))
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
    const hash = indexedSequentialSearchCodec.encodeHash(toDoc())
    const route = `${ROUTE_PATH}?g=${hash}`
    const url = `${window.location.origin}${window.location.pathname}#${route}`
    setHash(route)
    void navigator.clipboard?.writeText(url).then(
      () => toast({ description: tr("editor.linkCopied") }),
      () => undefined,
    )
  }, [toDoc])

  return {
    onLoadIntro: loadIntro,
    onLoadInIndex: loadInIndex,
    onLoadAbsent: loadAbsent,
    onLoadRandom: useCallback(
      () => loadRandom(Math.floor(Math.random() * 1e9)),
      [loadRandom],
    ),
    onAddValue: addValue,
    onSort: sortValues,
    onClear: clear,
    onExport,
    onImportFile,
    onShare,
  }
}
