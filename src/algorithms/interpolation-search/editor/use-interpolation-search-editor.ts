// Контролер редактора інтерполяційного пошуку: пресети, сортування (передумова),
// імпорт/експорт/шаринг. Як редактори інших алгоритмів пошуку — БЕЗ React Flow:
// масив цілих + ціль прямо у Zustand-сторі.

import { type ChangeEvent } from "react"
import { useDocEditorActions } from "@/algorithms/shared/editor/use-doc-editor-actions"
import { interpolationSearchCodec } from "@/algorithms/interpolation-search/editor/interpolation-search-doc"
import { useInterpolationSearchStore } from "@/store/interpolation-search-store"

export interface InterpolationSearchEditorController {
  readonly onLoadDemo1: () => void
  readonly onLoadDemo2: () => void
  readonly onLoadClustered: () => void
  readonly onLoadRandom: () => void
  readonly onAddValue: () => void
  readonly onSort: () => void
  readonly onClear: () => void
  readonly onExport: () => void
  readonly onImportFile: (event: ChangeEvent<HTMLInputElement>) => void
  readonly onShare: () => void
  readonly onCopyEmbed: () => void
}

export function useInterpolationSearchEditor(): InterpolationSearchEditorController {
  const addValue = useInterpolationSearchStore((s) => s.addValue)
  const sortValues = useInterpolationSearchStore((s) => s.sortValues)
  const clear = useInterpolationSearchStore((s) => s.clear)
  const loadDemo1 = useInterpolationSearchStore((s) => s.loadDemo1)
  const loadDemo2 = useInterpolationSearchStore((s) => s.loadDemo2)
  const loadClustered = useInterpolationSearchStore((s) => s.loadClustered)
  const loadRandom = useInterpolationSearchStore((s) => s.loadRandom)
  const loadDoc = useInterpolationSearchStore((s) => s.loadDoc)
  const toDoc = useInterpolationSearchStore((s) => s.toDoc)

  const { onLoadRandom, onExport, onImportFile, onShare, onCopyEmbed } =
    useDocEditorActions({
    codec: interpolationSearchCodec,
    toDoc,
    loadDoc,
    loadRandom,
    filename: "interpolation-search.json",
    routePath: "interpolation-search/editor",
  })

  return {
    onLoadDemo1: loadDemo1,
    onLoadDemo2: loadDemo2,
    onLoadClustered: loadClustered,
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
