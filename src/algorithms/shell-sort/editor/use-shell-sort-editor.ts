// Контролер редактора сортування Шелла: пресети, імпорт/експорт/шаринг. Як
// редактор злиттям/швидкого — БЕЗ React Flow: масив чисел прямо у Zustand-сторі.

import { type ChangeEvent } from "react"
import { useDocEditorActions } from "@/algorithms/shared/editor/use-doc-editor-actions"
import { shellSortCodec } from "@/algorithms/shell-sort/editor/shell-sort-doc"
import { useShellSortStore } from "@/store/shell-sort-store"

export interface ShellSortEditorController {
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
  readonly onCopyEmbed: () => void
}

export function useShellSortEditor(): ShellSortEditorController {
  const addValue = useShellSortStore((s) => s.addValue)
  const clear = useShellSortStore((s) => s.clear)
  const loadIntro = useShellSortStore((s) => s.loadIntro)
  const loadSorted = useShellSortStore((s) => s.loadSorted)
  const loadReversed = useShellSortStore((s) => s.loadReversed)
  const loadDuplicates = useShellSortStore((s) => s.loadDuplicates)
  const loadRandom = useShellSortStore((s) => s.loadRandom)
  const loadDoc = useShellSortStore((s) => s.loadDoc)
  const toDoc = useShellSortStore((s) => s.toDoc)

  const { onLoadRandom, onExport, onImportFile, onShare, onCopyEmbed } =
    useDocEditorActions({
    codec: shellSortCodec,
    toDoc,
    loadDoc,
    loadRandom,
    filename: "shell-sort.json",
    routePath: "shell-sort/editor",
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
    onCopyEmbed,
  }
}
