// Контролер редактора KMP: пресети, імпорт/експорт/шаринг. Як інші редактори пошуку —
// БЕЗ React Flow: текст + шаблон прямо у Zustand-сторі.

import { type ChangeEvent } from "react"
import { useDocEditorActions } from "@/algorithms/shared/editor/use-doc-editor-actions"
import { kmpStringSearchCodec } from "@/algorithms/kmp-string-search/editor/kmp-string-search-doc"
import { useKmpStringSearchStore } from "@/store/kmp-string-search-store"

export interface KmpStringSearchEditorController {
  readonly onLoadMain: () => void
  readonly onLoadKonspect: () => void
  readonly onLoadWorst: () => void
  readonly onLoadNotFound: () => void
  readonly onLoadRandom: () => void
  readonly onClear: () => void
  readonly onExport: () => void
  readonly onImportFile: (event: ChangeEvent<HTMLInputElement>) => void
  readonly onShare: () => void
}

export function useKmpStringSearchEditor(): KmpStringSearchEditorController {
  const clear = useKmpStringSearchStore((s) => s.clear)
  const loadMain = useKmpStringSearchStore((s) => s.loadMain)
  const loadKonspect = useKmpStringSearchStore((s) => s.loadKonspect)
  const loadWorst = useKmpStringSearchStore((s) => s.loadWorst)
  const loadNotFound = useKmpStringSearchStore((s) => s.loadNotFound)
  const loadRandom = useKmpStringSearchStore((s) => s.loadRandom)
  const loadDoc = useKmpStringSearchStore((s) => s.loadDoc)
  const toDoc = useKmpStringSearchStore((s) => s.toDoc)

  const { onLoadRandom, onExport, onImportFile, onShare } = useDocEditorActions({
    codec: kmpStringSearchCodec,
    toDoc,
    loadDoc,
    loadRandom,
    filename: "kmp-string-search.json",
    routePath: "kmp-string-search/editor",
  })

  return {
    onLoadMain: loadMain,
    onLoadKonspect: loadKonspect,
    onLoadWorst: loadWorst,
    onLoadNotFound: loadNotFound,
    onLoadRandom,
    onClear: clear,
    onExport,
    onImportFile,
    onShare,
  }
}
