// Контролер редактора рюкзака: пресети, імпорт/експорт/шаринг. На відміну від
// графових редакторів — БЕЗ React Flow (немає полотна): редагований об'єкт це
// таблиця предметів + місткість, прямо у Zustand-сторі. Тут лише файлові операції
// та одноразове завантаження спільного інстансу з URL-хеша (?g=...).

import { type ChangeEvent } from "react"
import { useDocEditorActions } from "@/algorithms/shared/editor/use-doc-editor-actions"
import { knapsackCodec } from "@/algorithms/knapsack/editor/knapsack-doc"
import { useKnapsackStore } from "@/store/knapsack-store"

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

  const { onLoadRandom, onExport, onImportFile, onShare } = useDocEditorActions({
    codec: knapsackCodec,
    toDoc,
    loadDoc,
    loadRandom,
    filename: "knapsack.json",
    routePath: "knapsack/editor",
  })

  return {
    onLoadClassic: loadClassic,
    onLoadSmall: loadSmall,
    onLoadRandom,
    onAddItem: addItem,
    onClear: clear,
    onExport,
    onImportFile,
    onShare,
  }
}
