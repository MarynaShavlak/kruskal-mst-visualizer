// Контролер редактора хеш-таблиці: пресети + додавання/очищення операцій + спільні
// дії документа (import/export/share/embed через useDocEditorActions). Форма
// use-knapsack-editor: стор дає пресети й мутатори, шаринг/серіалізацію делегуємо
// спільному хуку з кодеком hashTableCodec.

import type { ChangeEvent } from "react"
import type { HtOp } from "@/lib/hashTable"
import { useDocEditorActions } from "@/algorithms/shared/editor/use-doc-editor-actions"
import { hashTableCodec } from "@/algorithms/hash-table/editor/hash-table-doc"
import { useHashTableStore } from "@/store/hash-table-store"

export interface HashTableEditorController {
  readonly onLoadClassic: () => void
  readonly onLoadAnagrams: () => void
  readonly onLoadRandom: () => void
  readonly onAddOp: (kind?: HtOp["kind"]) => void
  readonly onClear: () => void
  readonly onExport: () => void
  readonly onImportFile: (event: ChangeEvent<HTMLInputElement>) => void
  readonly onShare: () => void
  readonly onCopyEmbed: () => void
}

export function useHashTableEditor(): HashTableEditorController {
  const addOp = useHashTableStore((s) => s.addOp)
  const clear = useHashTableStore((s) => s.clear)
  const loadClassic = useHashTableStore((s) => s.loadClassic)
  const loadAnagrams = useHashTableStore((s) => s.loadAnagrams)
  const loadRandom = useHashTableStore((s) => s.loadRandom)
  const loadDoc = useHashTableStore((s) => s.loadDoc)
  const toDoc = useHashTableStore((s) => s.toDoc)

  const { onLoadRandom, onExport, onImportFile, onShare, onCopyEmbed } =
    useDocEditorActions({
      codec: hashTableCodec,
      toDoc,
      loadDoc,
      loadRandom,
      filename: "hash-table.json",
      routePath: "hash-table/editor",
    })

  return {
    onLoadClassic: loadClassic,
    onLoadAnagrams: loadAnagrams,
    onLoadRandom,
    onAddOp: addOp,
    onClear: clear,
    onExport,
    onImportFile,
    onShare,
    onCopyEmbed,
  }
}
