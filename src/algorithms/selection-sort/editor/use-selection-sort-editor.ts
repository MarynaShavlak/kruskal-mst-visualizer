// Контролер редактора сортування прямим вибором: пресети, імпорт/експорт/шаринг.
// Як редактор вставок/бульбашки — БЕЗ React Flow (немає полотна): редагований
// об'єкт це масив чисел прямо у Zustand-сторі. Тут лише файлові операції та
// одноразове завантаження спільного інстансу з URL-хеша (?g=...).

import { type ChangeEvent } from "react"
import { useDocEditorActions } from "@/algorithms/shared/editor/use-doc-editor-actions"
import { selectionSortCodec } from "@/algorithms/selection-sort/editor/selection-sort-doc"
import { useSelectionSortStore } from "@/store/selection-sort-store"

export interface SelectionSortEditorController {
  readonly onLoadIntro: () => void
  readonly onLoadBest: () => void
  readonly onLoadWorst: () => void
  readonly onLoadRandom: () => void
  readonly onAddValue: () => void
  readonly onClear: () => void
  readonly onExport: () => void
  readonly onImportFile: (event: ChangeEvent<HTMLInputElement>) => void
  readonly onShare: () => void
  readonly onCopyEmbed: () => void
}

export function useSelectionSortEditor(): SelectionSortEditorController {
  const addValue = useSelectionSortStore((s) => s.addValue)
  const clear = useSelectionSortStore((s) => s.clear)
  const loadIntro = useSelectionSortStore((s) => s.loadIntro)
  const loadBest = useSelectionSortStore((s) => s.loadBest)
  const loadWorst = useSelectionSortStore((s) => s.loadWorst)
  const loadRandom = useSelectionSortStore((s) => s.loadRandom)
  const loadDoc = useSelectionSortStore((s) => s.loadDoc)
  const toDoc = useSelectionSortStore((s) => s.toDoc)

  const { onLoadRandom, onExport, onImportFile, onShare, onCopyEmbed } =
    useDocEditorActions({
    codec: selectionSortCodec,
    toDoc,
    loadDoc,
    loadRandom,
    filename: "selection-sort.json",
    routePath: "selection-sort/editor",
  })

  return {
    onLoadIntro: loadIntro,
    onLoadBest: loadBest,
    onLoadWorst: loadWorst,
    onLoadRandom,
    onAddValue: addValue,
    onClear: clear,
    onExport,
    onImportFile,
    onShare,
    onCopyEmbed,
  }
}
