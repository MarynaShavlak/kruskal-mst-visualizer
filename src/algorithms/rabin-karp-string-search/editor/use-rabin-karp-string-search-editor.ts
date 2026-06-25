// Контролер редактора пошуку Рабіна-Карпа: пресети, імпорт/експорт/шаринг.
// Як інші редактори пошуку — БЕЗ React Flow: текст + шаблон прямо у Zustand-сторі.

import { type ChangeEvent } from "react"
import { useDocEditorActions } from "@/algorithms/shared/editor/use-doc-editor-actions"
import { rabinKarpStringSearchCodec } from "@/algorithms/rabin-karp-string-search/editor/rabin-karp-string-search-doc"
import { useRabinKarpStringSearchStore } from "@/store/rabin-karp-string-search-store"

export interface RabinKarpStringSearchEditorController {
  readonly onLoadMain: () => void
  readonly onLoadCollision: () => void
  readonly onLoadMulti: () => void
  readonly onLoadNotFound: () => void
  readonly onLoadRandom: () => void
  readonly onClear: () => void
  readonly onExport: () => void
  readonly onImportFile: (event: ChangeEvent<HTMLInputElement>) => void
  readonly onShare: () => void
  readonly onCopyEmbed: () => void
}

export function useRabinKarpStringSearchEditor(): RabinKarpStringSearchEditorController {
  const clear = useRabinKarpStringSearchStore((s) => s.clear)
  const loadMain = useRabinKarpStringSearchStore((s) => s.loadMain)
  const loadCollision = useRabinKarpStringSearchStore((s) => s.loadCollision)
  const loadMulti = useRabinKarpStringSearchStore((s) => s.loadMulti)
  const loadNotFound = useRabinKarpStringSearchStore((s) => s.loadNotFound)
  const loadRandom = useRabinKarpStringSearchStore((s) => s.loadRandom)
  const loadDoc = useRabinKarpStringSearchStore((s) => s.loadDoc)
  const toDoc = useRabinKarpStringSearchStore((s) => s.toDoc)

  const { onLoadRandom, onExport, onImportFile, onShare, onCopyEmbed } =
    useDocEditorActions({
    codec: rabinKarpStringSearchCodec,
    toDoc,
    loadDoc,
    loadRandom,
    filename: "rabin-karp-string-search.json",
    routePath: "rabin-karp-string-search/editor",
  })

  return {
    onLoadMain: loadMain,
    onLoadCollision: loadCollision,
    onLoadMulti: loadMulti,
    onLoadNotFound: loadNotFound,
    onLoadRandom,
    onClear: clear,
    onExport,
    onImportFile,
    onShare,
    onCopyEmbed,
  }
}
