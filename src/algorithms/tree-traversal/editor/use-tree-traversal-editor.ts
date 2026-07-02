// Контролер редактора обходу дерева: пресети (приклад / BST / ланцюг / повне /
// випадковий) + очищення + спільні дії документа (import/export/share/embed через
// useDocEditorActions). Форма use-hash-table-editor: стор дає пресети й мутатори,
// шаринг/серіалізацію делегуємо спільному хуку з кодеком treeTraversalCodec.

import type { ChangeEvent } from "react"
import { useDocEditorActions } from "@/algorithms/shared/editor/use-doc-editor-actions"
import { treeTraversalCodec } from "@/algorithms/tree-traversal/editor/tree-traversal-doc"
import { useTreeTraversalStore } from "@/store/tree-traversal-store"

export interface TreeTraversalEditorController {
  readonly onLoadIntro: () => void
  readonly onLoadBst: () => void
  readonly onLoadChain: () => void
  readonly onLoadFull: () => void
  readonly onLoadRandom: () => void
  readonly onClear: () => void
  readonly onExport: () => void
  readonly onImportFile: (event: ChangeEvent<HTMLInputElement>) => void
  readonly onShare: () => void
  readonly onCopyEmbed: () => void
}

export function useTreeTraversalEditor(): TreeTraversalEditorController {
  const clear = useTreeTraversalStore((s) => s.clear)
  const loadIntro = useTreeTraversalStore((s) => s.loadIntro)
  const loadBst = useTreeTraversalStore((s) => s.loadBst)
  const loadChain = useTreeTraversalStore((s) => s.loadChain)
  const loadFull = useTreeTraversalStore((s) => s.loadFull)
  const loadRandom = useTreeTraversalStore((s) => s.loadRandom)
  const loadDoc = useTreeTraversalStore((s) => s.loadDoc)
  const toDoc = useTreeTraversalStore((s) => s.toDoc)

  const { onLoadRandom, onExport, onImportFile, onShare, onCopyEmbed } =
    useDocEditorActions({
      codec: treeTraversalCodec,
      toDoc,
      loadDoc,
      loadRandom,
      filename: "tree-traversal.json",
      routePath: "tree-traversal/editor",
    })

  return {
    onLoadIntro: loadIntro,
    onLoadBst: loadBst,
    onLoadChain: loadChain,
    onLoadFull: loadFull,
    onLoadRandom,
    onClear: clear,
    onExport,
    onImportFile,
    onShare,
    onCopyEmbed,
  }
}
