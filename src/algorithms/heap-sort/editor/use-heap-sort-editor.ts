// Контролер редактора пірамідального сортування: пресети, імпорт/експорт/шаринг.
// Як редактор Шелла/злиттям — БЕЗ React Flow: масив чисел прямо у Zustand-сторі.

import { type ChangeEvent } from "react"
import { useDocEditorActions } from "@/algorithms/shared/editor/use-doc-editor-actions"
import { heapSortCodec } from "@/algorithms/heap-sort/editor/heap-sort-doc"
import { useHeapSortStore } from "@/store/heap-sort-store"

export interface HeapSortEditorController {
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

export function useHeapSortEditor(): HeapSortEditorController {
  const addValue = useHeapSortStore((s) => s.addValue)
  const clear = useHeapSortStore((s) => s.clear)
  const loadIntro = useHeapSortStore((s) => s.loadIntro)
  const loadSorted = useHeapSortStore((s) => s.loadSorted)
  const loadReversed = useHeapSortStore((s) => s.loadReversed)
  const loadDuplicates = useHeapSortStore((s) => s.loadDuplicates)
  const loadRandom = useHeapSortStore((s) => s.loadRandom)
  const loadDoc = useHeapSortStore((s) => s.loadDoc)
  const toDoc = useHeapSortStore((s) => s.toDoc)

  const { onLoadRandom, onExport, onImportFile, onShare } = useDocEditorActions({
    codec: heapSortCodec,
    toDoc,
    loadDoc,
    loadRandom,
    filename: "heap-sort.json",
    routePath: "heap-sort/editor",
  })

  return {
    onLoadIntro: loadIntro,
    onLoadSorted: loadSorted,
    onLoadReversed: loadReversed,
    onLoadDuplicates: loadDuplicates,
    onLoadRandom,
    onAddValue: addValue,
    onClear: clear,
    onExport,
    onImportFile,
    onShare,
  }
}
