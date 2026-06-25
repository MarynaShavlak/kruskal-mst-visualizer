// Контролер редактора швидкого сортування: пресети, імпорт/експорт/шаринг.
// Як редактор вибору/вставок — БЕЗ React Flow (немає полотна): редагований
// об'єкт це масив чисел прямо у Zustand-сторі. Тут лише файлові операції та
// одноразове завантаження спільного інстансу з URL-хеша (?g=...).

import { type ChangeEvent } from "react"
import { useDocEditorActions } from "@/algorithms/shared/editor/use-doc-editor-actions"
import { quickSortCodec } from "@/algorithms/quick-sort/editor/quick-sort-doc"
import { useQuickSortStore } from "@/store/quick-sort-store"

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
  readonly onCopyEmbed: () => void
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

  const { onLoadRandom, onExport, onImportFile, onShare, onCopyEmbed } =
    useDocEditorActions({
    codec: quickSortCodec,
    toDoc,
    loadDoc,
    loadRandom,
    filename: "quick-sort.json",
    routePath: "quick-sort/editor",
  })

  return {
    onLoadIntro: loadIntro,
    onLoadSorted: loadSorted,
    onLoadDuplicates: loadDuplicates,
    onLoadRandom,
    onAddValue: addValue,
    onClear: clear,
    onExport,
    onImportFile,
    onShare,
    onCopyEmbed,
  }
}
