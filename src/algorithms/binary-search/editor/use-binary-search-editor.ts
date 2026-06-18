// Контролер редактора двійкового пошуку: пресети, сортування (передумова),
// імпорт/експорт/шаринг. Як редактори сортувань — БЕЗ React Flow: масив цілих +
// ціль прямо у Zustand-сторі.

import { useCallback, useEffect, type ChangeEvent } from "react"
import { readGraphParam } from "@/algorithms/shared/editor/use-graph-editor"
import { binarySearchCodec } from "@/algorithms/binary-search/editor/binary-search-doc"
import { setHash } from "@/hooks/use-route"
import { tr } from "@/i18n/use-t"
import { toast } from "@/store/toast-store"
import { useBinarySearchStore } from "@/store/binary-search-store"

const EXPORT_FILENAME = "binary-search.json"
const ROUTE_PATH = "binary-search/editor"

const loadedRoutes = new Set<string>()

export interface BinarySearchEditorController {
  readonly onLoadIntro: () => void
  readonly onLoadDuplicates: () => void
  readonly onLoadAbsent: () => void
  readonly onLoadRandom: () => void
  readonly onAddValue: () => void
  readonly onSort: () => void
  readonly onClear: () => void
  readonly onExport: () => void
  readonly onImportFile: (event: ChangeEvent<HTMLInputElement>) => void
  readonly onShare: () => void
}

export function useBinarySearchEditor(): BinarySearchEditorController {
  const addValue = useBinarySearchStore((s) => s.addValue)
  const sortValues = useBinarySearchStore((s) => s.sortValues)
  const clear = useBinarySearchStore((s) => s.clear)
  const loadIntro = useBinarySearchStore((s) => s.loadIntro)
  const loadDuplicates = useBinarySearchStore((s) => s.loadDuplicates)
  const loadAbsent = useBinarySearchStore((s) => s.loadAbsent)
  const loadRandom = useBinarySearchStore((s) => s.loadRandom)
  const loadDoc = useBinarySearchStore((s) => s.loadDoc)
  const toDoc = useBinarySearchStore((s) => s.toDoc)

  useEffect(() => {
    if (loadedRoutes.has(ROUTE_PATH)) return
    loadedRoutes.add(ROUTE_PATH)
    const param = readGraphParam(window.location.hash)
    if (!param) return
    const doc = binarySearchCodec.decodeHash(param)
    if (doc) loadDoc(doc)
  }, [loadDoc])

  const onExport = useCallback(() => {
    const blob = new Blob([binarySearchCodec.toJSON(toDoc())], {
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
        .then((text) => loadDoc(binarySearchCodec.fromJSON(text)))
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
    const hash = binarySearchCodec.encodeHash(toDoc())
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
    onLoadDuplicates: loadDuplicates,
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
