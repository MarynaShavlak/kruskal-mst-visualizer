// Контролер редактора порозрядного сортування: пресети, імпорт/експорт/шаринг. Як
// редактор Шелла/злиттям — БЕЗ React Flow: масив чисел прямо у Zustand-сторі.

import { type ChangeEvent } from "react"
import { useDocEditorActions } from "@/algorithms/shared/editor/use-doc-editor-actions"
import { radixSortCodec } from "@/algorithms/radix-sort/editor/radix-sort-doc"
import { useRadixSortStore } from "@/store/radix-sort-store"

export interface RadixSortEditorController {
  readonly onLoadIntro: () => void
  readonly onLoadEqual: () => void
  readonly onLoadDuplicates: () => void
  readonly onLoadBig: () => void
  readonly onLoadRandom: () => void
  readonly onAddValue: () => void
  readonly onClear: () => void
  readonly onExport: () => void
  readonly onImportFile: (event: ChangeEvent<HTMLInputElement>) => void
  readonly onShare: () => void
  readonly onCopyEmbed: () => void
}

export function useRadixSortEditor(): RadixSortEditorController {
  const addValue = useRadixSortStore((s) => s.addValue)
  const clear = useRadixSortStore((s) => s.clear)
  const loadIntro = useRadixSortStore((s) => s.loadIntro)
  const loadEqual = useRadixSortStore((s) => s.loadEqual)
  const loadDuplicates = useRadixSortStore((s) => s.loadDuplicates)
  const loadBig = useRadixSortStore((s) => s.loadBig)
  const loadRandom = useRadixSortStore((s) => s.loadRandom)
  const loadDoc = useRadixSortStore((s) => s.loadDoc)
  const toDoc = useRadixSortStore((s) => s.toDoc)

  const { onLoadRandom, onExport, onImportFile, onShare, onCopyEmbed } =
    useDocEditorActions({
    codec: radixSortCodec,
    toDoc,
    loadDoc,
    loadRandom,
    filename: "radix-sort.json",
    routePath: "radix-sort/editor",
  })

  return {
    onLoadIntro: loadIntro,
    onLoadEqual: loadEqual,
    onLoadDuplicates: loadDuplicates,
    onLoadBig: loadBig,
    onLoadRandom,
    onAddValue: addValue,
    onClear: clear,
    onExport,
    onImportFile,
    onShare,
    onCopyEmbed,
  }
}
