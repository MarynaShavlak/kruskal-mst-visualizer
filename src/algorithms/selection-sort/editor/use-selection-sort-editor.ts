// Контролер редактора сортування прямим вибором: пресети, імпорт/експорт/шаринг.
// Як редактор вставок/бульбашки — БЕЗ React Flow (немає полотна): редагований
// об'єкт це масив чисел прямо у Zustand-сторі. Тут лише файлові операції та
// одноразове завантаження спільного інстансу з URL-хеша (?g=...).

import { useCallback, useEffect, type ChangeEvent } from "react"
import { readGraphParam } from "@/algorithms/shared/editor/use-graph-editor"
import { selectionSortCodec } from "@/algorithms/selection-sort/editor/selection-sort-doc"
import { setHash } from "@/hooks/use-route"
import { tr } from "@/i18n/use-t"
import { toast } from "@/store/toast-store"
import { useSelectionSortStore } from "@/store/selection-sort-store"

const EXPORT_FILENAME = "selection-sort.json"
const ROUTE_PATH = "selection-sort/editor"

// Спільний інстанс із URL-хеша вантажимо лише раз за сесію сторінки.
const loadedRoutes = new Set<string>()

export interface SelectionSortEditorController {
  readonly onLoadIntro: () => void
  readonly onLoadBest: () => void
  readonly onLoadWorst: () => void
  readonly onLoadRandom: () => void
  readonly onAddValue: () => void
  readonly onClear: () => void
  readonly onExport: () => void
  readonly onImportFile: (event: ChangeEvent<HTMLInputElement>) => void
  readonly onShare: () => void
}

export function useSelectionSortEditor(): SelectionSortEditorController {
  const addValue = useSelectionSortStore((s) => s.addValue)
  const clear = useSelectionSortStore((s) => s.clear)
  const loadIntro = useSelectionSortStore((s) => s.loadIntro)
  const loadBest = useSelectionSortStore((s) => s.loadBest)
  const loadWorst = useSelectionSortStore((s) => s.loadWorst)
  const loadRandom = useSelectionSortStore((s) => s.loadRandom)
  const loadDoc = useSelectionSortStore((s) => s.loadDoc)
  const toDoc = useSelectionSortStore((s) => s.toDoc)

  // Одноразове завантаження спільного інстансу з URL-хеша (?g=...).
  useEffect(() => {
    if (loadedRoutes.has(ROUTE_PATH)) return
    loadedRoutes.add(ROUTE_PATH)
    const param = readGraphParam(window.location.hash)
    if (!param) return
    const doc = selectionSortCodec.decodeHash(param)
    if (doc) loadDoc(doc)
  }, [loadDoc])

  const onExport = useCallback(() => {
    const blob = new Blob([selectionSortCodec.toJSON(toDoc())], {
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
        .then((text) => loadDoc(selectionSortCodec.fromJSON(text)))
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
    const hash = selectionSortCodec.encodeHash(toDoc())
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
    onLoadBest: loadBest,
    onLoadWorst: loadWorst,
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
