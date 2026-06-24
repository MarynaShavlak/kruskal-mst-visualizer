// Контролер редактора лінійного пошуку: пресети, імпорт/експорт/шаринг. Як
// редактори сортувань — БЕЗ React Flow: масив чисел + ціль прямо у Zustand-сторі.

import { type ChangeEvent } from "react"
import { useDocEditorActions } from "@/algorithms/shared/editor/use-doc-editor-actions"
import { linearSearchCodec } from "@/algorithms/linear-search/editor/linear-search-doc"
import { useLinearSearchStore } from "@/store/linear-search-store"

export interface LinearSearchEditorController {
  readonly onLoadMain: () => void
  readonly onLoadDuplicates: () => void
  readonly onLoadSorted: () => void
  readonly onLoadRandom: () => void
  readonly onAddValue: () => void
  readonly onClear: () => void
  readonly onExport: () => void
  readonly onImportFile: (event: ChangeEvent<HTMLInputElement>) => void
  readonly onShare: () => void
}

export function useLinearSearchEditor(): LinearSearchEditorController {
  const addValue = useLinearSearchStore((s) => s.addValue)
  const clear = useLinearSearchStore((s) => s.clear)
  const loadMain = useLinearSearchStore((s) => s.loadMain)
  const loadDuplicates = useLinearSearchStore((s) => s.loadDuplicates)
  const loadSorted = useLinearSearchStore((s) => s.loadSorted)
  const loadRandom = useLinearSearchStore((s) => s.loadRandom)
  const loadDoc = useLinearSearchStore((s) => s.loadDoc)
  const toDoc = useLinearSearchStore((s) => s.toDoc)

  const { onLoadRandom, onExport, onImportFile, onShare } = useDocEditorActions({
    codec: linearSearchCodec,
    toDoc,
    loadDoc,
    loadRandom,
    filename: "linear-search.json",
    routePath: "linear-search/editor",
  })

  return {
    onLoadMain: loadMain,
    onLoadDuplicates: loadDuplicates,
    onLoadSorted: loadSorted,
    onLoadRandom,
    onAddValue: addValue,
    onClear: clear,
    onExport,
    onImportFile,
    onShare,
  }
}
