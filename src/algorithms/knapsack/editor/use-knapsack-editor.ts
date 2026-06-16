// Контролер редактора рюкзака: пресети, імпорт/експорт/шаринг. На відміну від
// графових редакторів — БЕЗ React Flow (немає полотна): редагований об'єкт це
// таблиця предметів + місткість, прямо у Zustand-сторі. Тут лише файлові операції
// та одноразове завантаження спільного інстансу з URL-хеша (?g=...).

import { useCallback, useEffect, type ChangeEvent } from "react"
import { readGraphParam } from "@/algorithms/shared/editor/use-graph-editor"
import { knapsackCodec } from "@/algorithms/knapsack/editor/knapsack-doc"
import { setHash } from "@/hooks/use-route"
import { tr } from "@/i18n/use-t"
import { toast } from "@/store/toast-store"
import { useKnapsackStore } from "@/store/knapsack-store"

const EXPORT_FILENAME = "knapsack.json"
const ROUTE_PATH = "knapsack/editor"

// Спільний інстанс із URL-хеша вантажимо лише раз за сесію сторінки.
const loadedRoutes = new Set<string>()

export interface KnapsackEditorController {
  readonly onLoadClassic: () => void
  readonly onLoadSmall: () => void
  readonly onLoadRandom: () => void
  readonly onAddItem: () => void
  readonly onClear: () => void
  readonly onExport: () => void
  readonly onImportFile: (event: ChangeEvent<HTMLInputElement>) => void
  readonly onShare: () => void
}

export function useKnapsackEditor(): KnapsackEditorController {
  const addItem = useKnapsackStore((s) => s.addItem)
  const clear = useKnapsackStore((s) => s.clear)
  const loadClassic = useKnapsackStore((s) => s.loadClassic)
  const loadSmall = useKnapsackStore((s) => s.loadSmall)
  const loadRandom = useKnapsackStore((s) => s.loadRandom)
  const loadDoc = useKnapsackStore((s) => s.loadDoc)
  const toDoc = useKnapsackStore((s) => s.toDoc)

  // Одноразове завантаження спільного інстансу з URL-хеша (?g=...).
  useEffect(() => {
    if (loadedRoutes.has(ROUTE_PATH)) return
    loadedRoutes.add(ROUTE_PATH)
    const param = readGraphParam(window.location.hash)
    if (!param) return
    const doc = knapsackCodec.decodeHash(param)
    if (doc) loadDoc(doc)
  }, [loadDoc])

  const onExport = useCallback(() => {
    const blob = new Blob([knapsackCodec.toJSON(toDoc())], {
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
        .then((text) => loadDoc(knapsackCodec.fromJSON(text)))
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
    const hash = knapsackCodec.encodeHash(toDoc())
    const route = `${ROUTE_PATH}?g=${hash}`
    const url = `${window.location.origin}${window.location.pathname}#${route}`
    setHash(route)
    void navigator.clipboard?.writeText(url).then(
      () => toast({ description: tr("editor.linkCopied") }),
      () => undefined,
    )
  }, [toDoc])

  return {
    onLoadClassic: loadClassic,
    onLoadSmall: loadSmall,
    onLoadRandom: useCallback(
      () => loadRandom(Math.floor(Math.random() * 1e9)),
      [loadRandom],
    ),
    onAddItem: addItem,
    onClear: clear,
    onExport,
    onImportFile,
    onShare,
  }
}
