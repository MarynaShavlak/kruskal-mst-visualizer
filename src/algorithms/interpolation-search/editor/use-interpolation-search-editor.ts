// Контролер редактора інтерполяційного пошуку: пресети, сортування (передумова),
// імпорт/експорт/шаринг. Як редактори інших алгоритмів пошуку — БЕЗ React Flow:
// масив цілих + ціль прямо у Zustand-сторі.

import { useCallback, useEffect, type ChangeEvent } from "react"
import { readGraphParam } from "@/algorithms/shared/editor/use-graph-editor"
import { interpolationSearchCodec } from "@/algorithms/interpolation-search/editor/interpolation-search-doc"
import { setHash } from "@/hooks/use-route"
import { tr } from "@/i18n/use-t"
import { toast } from "@/store/toast-store"
import { useInterpolationSearchStore } from "@/store/interpolation-search-store"

const EXPORT_FILENAME = "interpolation-search.json"
const ROUTE_PATH = "interpolation-search/editor"

const loadedRoutes = new Set<string>()

export interface InterpolationSearchEditorController {
  readonly onLoadDemo1: () => void
  readonly onLoadDemo2: () => void
  readonly onLoadClustered: () => void
  readonly onLoadRandom: () => void
  readonly onAddValue: () => void
  readonly onSort: () => void
  readonly onClear: () => void
  readonly onExport: () => void
  readonly onImportFile: (event: ChangeEvent<HTMLInputElement>) => void
  readonly onShare: () => void
}

export function useInterpolationSearchEditor(): InterpolationSearchEditorController {
  const addValue = useInterpolationSearchStore((s) => s.addValue)
  const sortValues = useInterpolationSearchStore((s) => s.sortValues)
  const clear = useInterpolationSearchStore((s) => s.clear)
  const loadDemo1 = useInterpolationSearchStore((s) => s.loadDemo1)
  const loadDemo2 = useInterpolationSearchStore((s) => s.loadDemo2)
  const loadClustered = useInterpolationSearchStore((s) => s.loadClustered)
  const loadRandom = useInterpolationSearchStore((s) => s.loadRandom)
  const loadDoc = useInterpolationSearchStore((s) => s.loadDoc)
  const toDoc = useInterpolationSearchStore((s) => s.toDoc)

  useEffect(() => {
    if (loadedRoutes.has(ROUTE_PATH)) return
    loadedRoutes.add(ROUTE_PATH)
    const param = readGraphParam(window.location.hash)
    if (!param) return
    const doc = interpolationSearchCodec.decodeHash(param)
    if (doc) loadDoc(doc)
  }, [loadDoc])

  const onExport = useCallback(() => {
    const blob = new Blob([interpolationSearchCodec.toJSON(toDoc())], {
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
        .then((text) => loadDoc(interpolationSearchCodec.fromJSON(text)))
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
    const hash = interpolationSearchCodec.encodeHash(toDoc())
    const route = `${ROUTE_PATH}?g=${hash}`
    const url = `${window.location.origin}${window.location.pathname}#${route}`
    setHash(route)
    void navigator.clipboard?.writeText(url).then(
      () => toast({ description: tr("editor.linkCopied") }),
      () => undefined,
    )
  }, [toDoc])

  return {
    onLoadDemo1: loadDemo1,
    onLoadDemo2: loadDemo2,
    onLoadClustered: loadClustered,
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
