// Контролер редактора бульбашкового сортування: алгоритмо-специфічні пресети.
// Спільні дії (випадковий пресет, імпорт/експорт/шаринг, відновлення з URL-хеша)
// інжектить useDocEditorActions. Редагований об'єкт — масив чисел у Zustand-сторі.

import { type ChangeEvent } from "react"
import { useDocEditorActions } from "@/algorithms/shared/editor/use-doc-editor-actions"
import { bubbleSortCodec } from "@/algorithms/bubble-sort/editor/bubble-sort-doc"
import { useBubbleSortStore } from "@/store/bubble-sort-store"

export interface BubbleSortEditorController {
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

export function useBubbleSortEditor(): BubbleSortEditorController {
  const addValue = useBubbleSortStore((s) => s.addValue)
  const clear = useBubbleSortStore((s) => s.clear)
  const loadIntro = useBubbleSortStore((s) => s.loadIntro)
  const loadBest = useBubbleSortStore((s) => s.loadBest)
  const loadWorst = useBubbleSortStore((s) => s.loadWorst)
  const loadRandom = useBubbleSortStore((s) => s.loadRandom)
  const loadDoc = useBubbleSortStore((s) => s.loadDoc)
  const toDoc = useBubbleSortStore((s) => s.toDoc)

  const { onLoadRandom, onExport, onImportFile, onShare, onCopyEmbed } =
    useDocEditorActions({
    codec: bubbleSortCodec,
    toDoc,
    loadDoc,
    loadRandom,
    filename: "bubble-sort.json",
    routePath: "bubble-sort/editor",
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
