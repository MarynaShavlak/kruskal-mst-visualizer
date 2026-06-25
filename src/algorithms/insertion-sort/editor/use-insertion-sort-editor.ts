// Контролер редактора сортування вставками: пресети, імпорт/експорт/шаринг.
// Як редактор бульбашки/рюкзака — БЕЗ React Flow (немає полотна): редагований
// об'єкт це масив чисел прямо у Zustand-сторі. Тут лише файлові операції та
// одноразове завантаження спільного інстансу з URL-хеша (?g=...).

import { type ChangeEvent } from "react"
import { useDocEditorActions } from "@/algorithms/shared/editor/use-doc-editor-actions"
import { insertionSortCodec } from "@/algorithms/insertion-sort/editor/insertion-sort-doc"
import { useInsertionSortStore } from "@/store/insertion-sort-store"

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
  readonly onCopyEmbed: () => void
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

  const { onLoadRandom, onExport, onImportFile, onShare, onCopyEmbed } =
    useDocEditorActions({
    codec: insertionSortCodec,
    toDoc,
    loadDoc,
    loadRandom,
    filename: "insertion-sort.json",
    routePath: "insertion-sort/editor",
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
