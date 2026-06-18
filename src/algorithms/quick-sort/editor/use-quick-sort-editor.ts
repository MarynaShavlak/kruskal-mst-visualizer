// Контролер редактора швидкого сортування: пресети, імпорт/експорт/шаринг.
// Як редактор вибору/вставок — БЕЗ React Flow (немає полотна): редагований
// об'єкт це масив чисел прямо у Zustand-сторі. Тут лише файлові операції та
// одноразове завантаження спільного інстансу з URL-хеша (?g=...).

import { useCallback, useEffect, type ChangeEvent } from "react"
import { readGraphParam } from "@/algorithms/shared/editor/use-graph-editor"
import { quickSortCodec } from "@/algorithms/quick-sort/editor/quick-sort-doc"
import { setHash } from "@/hooks/use-route"
import { tr } from "@/i18n/use-t"
import { toast } from "@/store/toast-store"
import { useQuickSortStore } from "@/store/quick-sort-store"

const EXPORT_FILENAME = "quick-sort.json"
const ROUTE_PATH = "quick-sort/editor"

// Спільний інстанс із URL-хеша вантажимо лише раз за сесію сторінки.
const loadedRoutes = new Set<string>()

export interface QuickSortEditorController {
  readonly onLoadIntro: () => void
  readonly onLoadSorted: () => void
  readonly onLoadDuplicates: () => void
  readonly onLoadRandom: () => void
  readonly onAddValue: () => void
  readonly onClear: () => void
  readonly onExport: () => void
  readonly onImportFile: (event: ChangeEvent<HTMLInputElement>) => void
  readonly onShare: () => void
}

export function useQuickSortEditor(): QuickSortEditorController {
  const addValue = useQuickSortStore((s) => s.addValue)
  const clear = useQuickSortStore((s) => s.clear)
  const loadIntro = useQuickSortStore((s) => s.loadIntro)
  const loadSorted = useQuickSortStore((s) => s.loadSorted)
  const loadDuplicates = useQuickSortStore((s) => s.loadDuplicates)
  const loadRandom = useQuickSortStore((s) => s.loadRandom)
  const loadDoc = useQuickSortStore((s) => s.loadDoc)
  const toDoc = useQuickSortStore((s) => s.toDoc)

  // Одноразове завантаження спільного інстансу з URL-хеша (?g=...).
  useEffect(() => {
    if (loadedRoutes.has(ROUTE_PATH)) return
    loadedRoutes.add(ROUTE_PATH)
    const param = readGraphParam(window.location.hash)
    if (!param) return
    const doc = quickSortCodec.decodeHash(param)
    if (doc) loadDoc(doc)
  }, [loadDoc])

  const onExport = useCallback(() => {
    const blob = new Blob([quickSortCodec.toJSON(toDoc())], {
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
        .then((text) => loadDoc(quickSortCodec.fromJSON(text)))
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
    const hash = quickSortCodec.encodeHash(toDoc())
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
    onLoadSorted: loadSorted,
    onLoadDuplicates: loadDuplicates,
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
