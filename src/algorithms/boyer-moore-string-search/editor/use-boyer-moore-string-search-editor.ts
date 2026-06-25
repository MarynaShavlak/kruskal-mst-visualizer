// Контролер редактора пошуку Боєра-Мура: пресети, імпорт/експорт/шаринг. Як інші
// редактори пошуку — БЕЗ React Flow: текст + шаблон прямо у Zustand-сторі.

import { type ChangeEvent } from "react"
import { useDocEditorActions } from "@/algorithms/shared/editor/use-doc-editor-actions"
import { boyerMooreStringSearchCodec } from "@/algorithms/boyer-moore-string-search/editor/boyer-moore-string-search-doc"
import { useBoyerMooreStringSearchStore } from "@/store/boyer-moore-string-search-store"

export interface BoyerMooreStringSearchEditorController {
  readonly onLoadMain: () => void
  readonly onLoadBigJumps: () => void
  readonly onLoadWorst: () => void
  readonly onLoadMulti: () => void
  readonly onLoadRandom: () => void
  readonly onClear: () => void
  readonly onExport: () => void
  readonly onImportFile: (event: ChangeEvent<HTMLInputElement>) => void
  readonly onShare: () => void
  readonly onCopyEmbed: () => void
}

export function useBoyerMooreStringSearchEditor(): BoyerMooreStringSearchEditorController {
  const clear = useBoyerMooreStringSearchStore((s) => s.clear)
  const loadMain = useBoyerMooreStringSearchStore((s) => s.loadMain)
  const loadBigJumps = useBoyerMooreStringSearchStore((s) => s.loadBigJumps)
  const loadWorst = useBoyerMooreStringSearchStore((s) => s.loadWorst)
  const loadMulti = useBoyerMooreStringSearchStore((s) => s.loadMulti)
  const loadRandom = useBoyerMooreStringSearchStore((s) => s.loadRandom)
  const loadDoc = useBoyerMooreStringSearchStore((s) => s.loadDoc)
  const toDoc = useBoyerMooreStringSearchStore((s) => s.toDoc)

  const { onLoadRandom, onExport, onImportFile, onShare, onCopyEmbed } =
    useDocEditorActions({
    codec: boyerMooreStringSearchCodec,
    toDoc,
    loadDoc,
    loadRandom,
    filename: "boyer-moore-string-search.json",
    routePath: "boyer-moore-string-search/editor",
  })

  return {
    onLoadMain: loadMain,
    onLoadBigJumps: loadBigJumps,
    onLoadWorst: loadWorst,
    onLoadMulti: loadMulti,
    onLoadRandom,
    onClear: clear,
    onExport,
    onImportFile,
    onShare,
    onCopyEmbed,
  }
}
