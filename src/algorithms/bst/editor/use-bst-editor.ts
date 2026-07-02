// Контролер редактора ДДП: пресети (приклад / вироджене / збалансоване / 3 випадки
// видалення / випадковий) + додавання операції + очищення + спільні дії документа
// (import/export/share/embed через useDocEditorActions). Форма use-hash-table-editor.

import type { ChangeEvent } from "react"
import type { BstOpKind } from "@/lib/binarySearchTree"
import { useDocEditorActions } from "@/algorithms/shared/editor/use-doc-editor-actions"
import { bstCodec } from "@/algorithms/bst/editor/bst-doc"
import { useBstStore } from "@/store/bst-store"

export interface BstEditorController {
  readonly onLoadIntro: () => void
  readonly onLoadDegenerate: () => void
  readonly onLoadBalanced: () => void
  readonly onLoadDeleteCases: () => void
  readonly onLoadRandom: () => void
  readonly onAddOp: (kind?: BstOpKind) => void
  readonly onClear: () => void
  readonly onExport: () => void
  readonly onImportFile: (event: ChangeEvent<HTMLInputElement>) => void
  readonly onShare: () => void
  readonly onCopyEmbed: () => void
}

export function useBstEditor(): BstEditorController {
  const addOp = useBstStore((s) => s.addOp)
  const clear = useBstStore((s) => s.clear)
  const loadIntro = useBstStore((s) => s.loadIntro)
  const loadDegenerate = useBstStore((s) => s.loadDegenerate)
  const loadBalanced = useBstStore((s) => s.loadBalanced)
  const loadDeleteCases = useBstStore((s) => s.loadDeleteCases)
  const loadRandom = useBstStore((s) => s.loadRandom)
  const loadDoc = useBstStore((s) => s.loadDoc)
  const toDoc = useBstStore((s) => s.toDoc)

  const { onLoadRandom, onExport, onImportFile, onShare, onCopyEmbed } =
    useDocEditorActions({
      codec: bstCodec,
      toDoc,
      loadDoc,
      loadRandom,
      filename: "bst.json",
      routePath: "bst/editor",
    })

  return {
    onLoadIntro: loadIntro,
    onLoadDegenerate: loadDegenerate,
    onLoadBalanced: loadBalanced,
    onLoadDeleteCases: loadDeleteCases,
    onLoadRandom,
    onAddOp: addOp,
    onClear: clear,
    onExport,
    onImportFile,
    onShare,
    onCopyEmbed,
  }
}
