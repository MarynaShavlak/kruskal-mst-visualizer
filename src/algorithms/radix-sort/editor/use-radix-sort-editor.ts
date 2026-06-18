// Контролер редактора порозрядного сортування: пресети, імпорт/експорт/шаринг. Як
// редактор Шелла/злиттям — БЕЗ React Flow: масив чисел прямо у Zustand-сторі.

import { useCallback, useEffect, type ChangeEvent } from "react"
import { readGraphParam } from "@/algorithms/shared/editor/use-graph-editor"
import { radixSortCodec } from "@/algorithms/radix-sort/editor/radix-sort-doc"
import { setHash } from "@/hooks/use-route"
import { tr } from "@/i18n/use-t"
import { toast } from "@/store/toast-store"
import { useRadixSortStore } from "@/store/radix-sort-store"

const EXPORT_FILENAME = "radix-sort.json"
const ROUTE_PATH = "radix-sort/editor"

const loadedRoutes = new Set<string>()

export interface RadixSortEditorController {
  readonly onLoadIntro: () => void
  readonly onLoadEqual: () => void
  readonly onLoadDuplicates: () => void
  readonly onLoadBig: () => void
  readonly onLoadRandom: () => void
  readonly onAddValue: () => void
  readonly onClear: () => void
  readonly onExport: () => void
  readonly onImportFile: (event: ChangeEvent<HTMLInputElement>) => void
  readonly onShare: () => void
}

export function useRadixSortEditor(): RadixSortEditorController {
  const addValue = useRadixSortStore((s) => s.addValue)
  const clear = useRadixSortStore((s) => s.clear)
  const loadIntro = useRadixSortStore((s) => s.loadIntro)
  const loadEqual = useRadixSortStore((s) => s.loadEqual)
  const loadDuplicates = useRadixSortStore((s) => s.loadDuplicates)
  const loadBig = useRadixSortStore((s) => s.loadBig)
  const loadRandom = useRadixSortStore((s) => s.loadRandom)
  const loadDoc = useRadixSortStore((s) => s.loadDoc)
  const toDoc = useRadixSortStore((s) => s.toDoc)

  useEffect(() => {
    if (loadedRoutes.has(ROUTE_PATH)) return
    loadedRoutes.add(ROUTE_PATH)
    const param = readGraphParam(window.location.hash)
    if (!param) return
    const doc = radixSortCodec.decodeHash(param)
    if (doc) loadDoc(doc)
  }, [loadDoc])

  const onExport = useCallback(() => {
    const blob = new Blob([radixSortCodec.toJSON(toDoc())], {
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
        .then((text) => loadDoc(radixSortCodec.fromJSON(text)))
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
    const hash = radixSortCodec.encodeHash(toDoc())
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
    onLoadEqual: loadEqual,
    onLoadDuplicates: loadDuplicates,
    onLoadBig: loadBig,
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
