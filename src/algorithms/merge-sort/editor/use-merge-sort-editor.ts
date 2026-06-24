// Контролер редактора сортування злиттям: пресети, імпорт/експорт/шаринг.
// Як редактор швидкого/прямого вибору — БЕЗ React Flow (немає полотна):
// редагований об'єкт це масив чисел прямо у Zustand-сторі. Тут лише файлові
// операції та одноразове завантаження спільного інстансу з URL-хеша (?g=...).

import { type ChangeEvent } from "react"
import { useDocEditorActions } from "@/algorithms/shared/editor/use-doc-editor-actions"
import { mergeSortCodec } from "@/algorithms/merge-sort/editor/merge-sort-doc"
import { useMergeSortStore } from "@/store/merge-sort-store"

export interface MergeSortEditorController {
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

export function useMergeSortEditor(): MergeSortEditorController {
  const addValue = useMergeSortStore((s) => s.addValue)
  const clear = useMergeSortStore((s) => s.clear)
  const loadIntro = useMergeSortStore((s) => s.loadIntro)
  const loadSorted = useMergeSortStore((s) => s.loadSorted)
  const loadReversed = useMergeSortStore((s) => s.loadReversed)
  const loadDuplicates = useMergeSortStore((s) => s.loadDuplicates)
  const loadRandom = useMergeSortStore((s) => s.loadRandom)
  const loadDoc = useMergeSortStore((s) => s.loadDoc)
  const toDoc = useMergeSortStore((s) => s.toDoc)

  const { onLoadRandom, onExport, onImportFile, onShare } = useDocEditorActions({
    codec: mergeSortCodec,
    toDoc,
    loadDoc,
    loadRandom,
    filename: "merge-sort.json",
    routePath: "merge-sort/editor",
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
