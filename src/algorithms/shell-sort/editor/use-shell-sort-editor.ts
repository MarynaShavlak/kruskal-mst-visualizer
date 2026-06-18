// Контролер редактора сортування Шелла: пресети, імпорт/експорт/шаринг. Як
// редактор злиттям/швидкого — БЕЗ React Flow: масив чисел прямо у Zustand-сторі.

import { useCallback, useEffect, type ChangeEvent } from "react"
import { readGraphParam } from "@/algorithms/shared/editor/use-graph-editor"
import { shellSortCodec } from "@/algorithms/shell-sort/editor/shell-sort-doc"
import { setHash } from "@/hooks/use-route"
import { tr } from "@/i18n/use-t"
import { toast } from "@/store/toast-store"
import { useShellSortStore } from "@/store/shell-sort-store"

const EXPORT_FILENAME = "shell-sort.json"
const ROUTE_PATH = "shell-sort/editor"

const loadedRoutes = new Set<string>()

export interface ShellSortEditorController {
  readonly onLoadIntro: () => void
  readonly onLoadSorted: () => void
  readonly onLoadReversed: () => void
  readonly onLoadDuplicates: () => void
  readonly onLoadRandom: () => void
  readonly onAddValue: () => void
  readonly onClear: () => void
  readonly onExport: () => void
  readonly onImportFile: (event: ChangeEvent<HTMLInputElement>) => void
  readonly onShare: () => void
}

export function useShellSortEditor(): ShellSortEditorController {
  const addValue = useShellSortStore((s) => s.addValue)
  const clear = useShellSortStore((s) => s.clear)
  const loadIntro = useShellSortStore((s) => s.loadIntro)
  const loadSorted = useShellSortStore((s) => s.loadSorted)
  const loadReversed = useShellSortStore((s) => s.loadReversed)
  const loadDuplicates = useShellSortStore((s) => s.loadDuplicates)
  const loadRandom = useShellSortStore((s) => s.loadRandom)
  const loadDoc = useShellSortStore((s) => s.loadDoc)
  const toDoc = useShellSortStore((s) => s.toDoc)

  useEffect(() => {
    if (loadedRoutes.has(ROUTE_PATH)) return
    loadedRoutes.add(ROUTE_PATH)
    const param = readGraphParam(window.location.hash)
    if (!param) return
    const doc = shellSortCodec.decodeHash(param)
    if (doc) loadDoc(doc)
  }, [loadDoc])

  const onExport = useCallback(() => {
    const blob = new Blob([shellSortCodec.toJSON(toDoc())], {
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
        .then((text) => loadDoc(shellSortCodec.fromJSON(text)))
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
    const hash = shellSortCodec.encodeHash(toDoc())
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
    onLoadReversed: loadReversed,
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
