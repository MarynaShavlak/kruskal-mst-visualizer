// Контролер редактора індексно-послідовного пошуку: пресети, сортування (передумова),
// імпорт/експорт/шаринг. Як редактори пошуку — БЕЗ React Flow: масив цілих + ціль +
// крок індексу прямо у Zustand-сторі.

import { type ChangeEvent } from "react"
import { useDocEditorActions } from "@/algorithms/shared/editor/use-doc-editor-actions"
import { indexedSequentialSearchCodec } from "@/algorithms/indexed-sequential-search/editor/indexed-sequential-search-doc"
import { useIndexedSequentialSearchStore } from "@/store/indexed-sequential-search-store"

export interface IndexedSequentialSearchEditorController {
  readonly onLoadIntro: () => void
  readonly onLoadInIndex: () => void
  readonly onLoadAbsent: () => void
  readonly onLoadRandom: () => void
  readonly onAddValue: () => void
  readonly onSort: () => void
  readonly onClear: () => void
  readonly onExport: () => void
  readonly onImportFile: (event: ChangeEvent<HTMLInputElement>) => void
  readonly onShare: () => void
}

export function useIndexedSequentialSearchEditor(): IndexedSequentialSearchEditorController {
  const addValue = useIndexedSequentialSearchStore((s) => s.addValue)
  const sortValues = useIndexedSequentialSearchStore((s) => s.sortValues)
  const clear = useIndexedSequentialSearchStore((s) => s.clear)
  const loadIntro = useIndexedSequentialSearchStore((s) => s.loadIntro)
  const loadInIndex = useIndexedSequentialSearchStore((s) => s.loadInIndex)
  const loadAbsent = useIndexedSequentialSearchStore((s) => s.loadAbsent)
  const loadRandom = useIndexedSequentialSearchStore((s) => s.loadRandom)
  const loadDoc = useIndexedSequentialSearchStore((s) => s.loadDoc)
  const toDoc = useIndexedSequentialSearchStore((s) => s.toDoc)

  const { onLoadRandom, onExport, onImportFile, onShare } = useDocEditorActions({
    codec: indexedSequentialSearchCodec,
    toDoc,
    loadDoc,
    loadRandom,
    filename: "indexed-sequential-search.json",
    routePath: "indexed-sequential-search/editor",
  })

  return {
    onLoadIntro: loadIntro,
    onLoadInIndex: loadInIndex,
    onLoadAbsent: loadAbsent,
    onLoadRandom,
    onAddValue: addValue,
    onSort: sortValues,
    onClear: clear,
    onExport,
    onImportFile,
    onShare,
  }
}
