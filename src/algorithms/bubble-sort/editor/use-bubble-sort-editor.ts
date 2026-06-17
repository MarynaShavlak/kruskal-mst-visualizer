// Контролер редактора бульбашкового сортування: пресети, імпорт/експорт/шаринг.
// Як редактор рюкзака — БЕЗ React Flow (немає полотна): редагований об'єкт це
// масив чисел прямо у Zustand-сторі. Тут лише файлові операції та одноразове
// завантаження спільного інстансу з URL-хеша (?g=...).

import { useCallback, useEffect, type ChangeEvent } from "react"
import { readGraphParam } from "@/algorithms/shared/editor/use-graph-editor"
import { bubbleSortCodec } from "@/algorithms/bubble-sort/editor/bubble-sort-doc"
import { setHash } from "@/hooks/use-route"
import { tr } from "@/i18n/use-t"
import { toast } from "@/store/toast-store"
import { useBubbleSortStore } from "@/store/bubble-sort-store"

const EXPORT_FILENAME = "bubble-sort.json"
const ROUTE_PATH = "bubble-sort/editor"

// Спільний інстанс із URL-хеша вантажимо лише раз за сесію сторінки.
const loadedRoutes = new Set<string>()

export interface BubbleSortEditorController {
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

export function useBubbleSortEditor(): BubbleSortEditorController {
  const addValue = useBubbleSortStore((s) => s.addValue)
  const clear = useBubbleSortStore((s) => s.clear)
  const loadIntro = useBubbleSortStore((s) => s.loadIntro)
  const loadBest = useBubbleSortStore((s) => s.loadBest)
  const loadWorst = useBubbleSortStore((s) => s.loadWorst)
  const loadRandom = useBubbleSortStore((s) => s.loadRandom)
  const loadDoc = useBubbleSortStore((s) => s.loadDoc)
  const toDoc = useBubbleSortStore((s) => s.toDoc)

  // Одноразове завантаження спільного інстансу з URL-хеша (?g=...).
  useEffect(() => {
    if (loadedRoutes.has(ROUTE_PATH)) return
    loadedRoutes.add(ROUTE_PATH)
    const param = readGraphParam(window.location.hash)
    if (!param) return
    const doc = bubbleSortCodec.decodeHash(param)
    if (doc) loadDoc(doc)
  }, [loadDoc])

  const onExport = useCallback(() => {
    const blob = new Blob([bubbleSortCodec.toJSON(toDoc())], {
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
        .then((text) => loadDoc(bubbleSortCodec.fromJSON(text)))
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
    const hash = bubbleSortCodec.encodeHash(toDoc())
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
