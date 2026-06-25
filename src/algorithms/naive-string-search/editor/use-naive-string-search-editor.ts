// Контролер редактора наївного пошуку в рядках: пресети, імпорт/експорт/шаринг.
// Як інші редактори пошуку — БЕЗ React Flow: текст + шаблон прямо у Zustand-сторі.

import { type ChangeEvent } from "react"
import { useDocEditorActions } from "@/algorithms/shared/editor/use-doc-editor-actions"
import { naiveStringSearchCodec } from "@/algorithms/naive-string-search/editor/naive-string-search-doc"
import { useNaiveStringSearchStore } from "@/store/naive-string-search-store"

export interface NaiveStringSearchEditorController {
  readonly onLoadMain: () => void
  readonly onLoadWorst: () => void
  readonly onLoadNotFound: () => void
  readonly onLoadOverlap: () => void
  readonly onLoadRandom: () => void
  readonly onClear: () => void
  readonly onExport: () => void
  readonly onImportFile: (event: ChangeEvent<HTMLInputElement>) => void
  readonly onShare: () => void
  readonly onCopyEmbed: () => void
}

export function useNaiveStringSearchEditor(): NaiveStringSearchEditorController {
  const clear = useNaiveStringSearchStore((s) => s.clear)
  const loadMain = useNaiveStringSearchStore((s) => s.loadMain)
  const loadWorst = useNaiveStringSearchStore((s) => s.loadWorst)
  const loadNotFound = useNaiveStringSearchStore((s) => s.loadNotFound)
  const loadOverlap = useNaiveStringSearchStore((s) => s.loadOverlap)
  const loadRandom = useNaiveStringSearchStore((s) => s.loadRandom)
  const loadDoc = useNaiveStringSearchStore((s) => s.loadDoc)
  const toDoc = useNaiveStringSearchStore((s) => s.toDoc)

  const { onLoadRandom, onExport, onImportFile, onShare, onCopyEmbed } =
    useDocEditorActions({
    codec: naiveStringSearchCodec,
    toDoc,
    loadDoc,
    loadRandom,
    filename: "naive-string-search.json",
    routePath: "naive-string-search/editor",
  })

  return {
    onLoadMain: loadMain,
    onLoadWorst: loadWorst,
    onLoadNotFound: loadNotFound,
    onLoadOverlap: loadOverlap,
    onLoadRandom,
    onClear: clear,
    onExport,
    onImportFile,
    onShare,
    onCopyEmbed,
  }
}
