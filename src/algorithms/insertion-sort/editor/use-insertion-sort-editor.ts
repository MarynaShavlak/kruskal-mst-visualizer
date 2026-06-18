// Контролер редактора сортування вставками: пресети, імпорт/експорт/шаринг.
// Як редактор бульбашки/рюкзака — БЕЗ React Flow (немає полотна): редагований
// об'єкт це масив чисел прямо у Zustand-сторі. Тут лише файлові операції та
// одноразове завантаження спільного інстансу з URL-хеша (?g=...).

import { useCallback, useEffect, type ChangeEvent } from "react"
import { readGraphParam } from "@/algorithms/shared/editor/use-graph-editor"
import { insertionSortCodec } from "@/algorithms/insertion-sort/editor/insertion-sort-doc"
import { setHash } from "@/hooks/use-route"
import { tr } from "@/i18n/use-t"
import { toast } from "@/store/toast-store"
import { useInsertionSortStore } from "@/store/insertion-sort-store"

const EXPORT_FILENAME = "insertion-sort.json"
const ROUTE_PATH = "insertion-sort/editor"

// Спільний інстанс із URL-хеша вантажимо лише раз за сесію сторінки.
const loadedRoutes = new Set<string>()

export interface InsertionSortEditorController {
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

export function useInsertionSortEditor(): InsertionSortEditorController {
  const addValue = useInsertionSortStore((s) => s.addValue)
  const clear = useInsertionSortStore((s) => s.clear)
  const loadIntro = useInsertionSortStore((s) => s.loadIntro)
  const loadBest = useInsertionSortStore((s) => s.loadBest)
  const loadWorst = useInsertionSortStore((s) => s.loadWorst)
  const loadRandom = useInsertionSortStore((s) => s.loadRandom)
  const loadDoc = useInsertionSortStore((s) => s.loadDoc)
  const toDoc = useInsertionSortStore((s) => s.toDoc)

  // Одноразове завантаження спільного інстансу з URL-хеша (?g=...).
  useEffect(() => {
    if (loadedRoutes.has(ROUTE_PATH)) return
    loadedRoutes.add(ROUTE_PATH)
    const param = readGraphParam(window.location.hash)
    if (!param) return
    const doc = insertionSortCodec.decodeHash(param)
    if (doc) loadDoc(doc)
  }, [loadDoc])

  const onExport = useCallback(() => {
    const blob = new Blob([insertionSortCodec.toJSON(toDoc())], {
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
        .then((text) => loadDoc(insertionSortCodec.fromJSON(text)))
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
    const hash = insertionSortCodec.encodeHash(toDoc())
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
