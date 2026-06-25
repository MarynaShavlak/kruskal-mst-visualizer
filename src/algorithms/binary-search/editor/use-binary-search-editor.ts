// Контролер редактора двійкового пошуку: пресети, сортування (передумова),
// імпорт/експорт/шаринг. Як редактори сортувань — БЕЗ React Flow: масив цілих +
// ціль прямо у Zustand-сторі.

import { type ChangeEvent } from "react"
import { useDocEditorActions } from "@/algorithms/shared/editor/use-doc-editor-actions"
import { binarySearchCodec } from "@/algorithms/binary-search/editor/binary-search-doc"
import { useBinarySearchStore } from "@/store/binary-search-store"

export interface BinarySearchEditorController {
  readonly onLoadIntro: () => void
  readonly onLoadDuplicates: () => void
  readonly onLoadAbsent: () => void
  readonly onLoadRandom: () => void
  readonly onAddValue: () => void
  readonly onSort: () => void
  readonly onClear: () => void
  readonly onExport: () => void
  readonly onImportFile: (event: ChangeEvent<HTMLInputElement>) => void
  readonly onShare: () => void
  readonly onCopyEmbed: () => void
}

export function useBinarySearchEditor(): BinarySearchEditorController {
  const addValue = useBinarySearchStore((s) => s.addValue)
  const sortValues = useBinarySearchStore((s) => s.sortValues)
  const clear = useBinarySearchStore((s) => s.clear)
  const loadIntro = useBinarySearchStore((s) => s.loadIntro)
  const loadDuplicates = useBinarySearchStore((s) => s.loadDuplicates)
  const loadAbsent = useBinarySearchStore((s) => s.loadAbsent)
  const loadRandom = useBinarySearchStore((s) => s.loadRandom)
  const loadDoc = useBinarySearchStore((s) => s.loadDoc)
  const toDoc = useBinarySearchStore((s) => s.toDoc)

  const { onLoadRandom, onExport, onImportFile, onShare, onCopyEmbed } =
    useDocEditorActions({
    codec: binarySearchCodec,
    toDoc,
    loadDoc,
    loadRandom,
    filename: "binary-search.json",
    routePath: "binary-search/editor",
  })

  return {
    onLoadIntro: loadIntro,
    onLoadDuplicates: loadDuplicates,
    onLoadAbsent: loadAbsent,
    onLoadRandom,
    onAddValue: addValue,
    onSort: sortValues,
    onClear: clear,
    onExport,
    onImportFile,
    onShare,
    onCopyEmbed,
  }
}
