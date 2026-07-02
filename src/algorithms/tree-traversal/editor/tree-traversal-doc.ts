// Серіалізація документа редактора обходу дерева (рівневий список + порядок обходу):
//  - JSON для імпорту/експорту;
//  - компактний base64url для шарингу через URL-хеш (?g=...).
// Окремий wire-формат (version 1) — не graph/values-doc, бо тут рівнева серіалізація
// дерева з дірками (null), а не масив чисел. Значення санітизуються при завантаженні.
// Чисто, без React.

import { tr } from "@/i18n/use-t"
import type { TraversalOrder } from "@/lib/treeTraversal"
import type { TreeTraversalDoc } from "@/store/tree-traversal-store"
import { createDocCodec } from "@/algorithms/shared/editor/doc-codec"

interface TreeTraversalWire {
  readonly version: 1
  /** Рівневий список: ціле або null (порожня дитина). */
  readonly levels: readonly (number | null)[]
  readonly order: TraversalOrder
}

const ORDERS = ["preorder", "inorder", "postorder"] as const

function isLevel(v: unknown): v is number | null {
  return v === null || typeof v === "number"
}

function parseWire(raw: unknown): TreeTraversalWire {
  if (typeof raw !== "object" || raw === null) {
    throw new Error(tr("editor.errNotObject"))
  }
  const o = raw as Record<string, unknown>
  if (o.version !== 1) throw new Error(tr("editor.errBadVersion"))
  if (!Array.isArray(o.levels) || !o.levels.every(isLevel)) {
    throw new Error(tr("editor.errBadTree"))
  }
  if (!(ORDERS as readonly unknown[]).includes(o.order)) {
    throw new Error(tr("editor.errBadOrder"))
  }
  return o as unknown as TreeTraversalWire
}

const docToWire = (doc: TreeTraversalDoc): TreeTraversalWire => ({
  version: 1,
  levels: doc.levels.map((v) => (v === null ? null : Math.round(v))),
  order: doc.order,
})

const wireToDoc = (wire: TreeTraversalWire): TreeTraversalDoc => ({
  levels: wire.levels.map((v) => (v === null ? null : Math.trunc(v))),
  order: (ORDERS as readonly string[]).includes(wire.order) ? wire.order : "preorder",
})

export const treeTraversalCodec = createDocCodec({ docToWire, parseWire, wireToDoc })
