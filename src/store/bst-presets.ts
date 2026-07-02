// Пресети редактора двійкового дерева пошуку: канонічний скрипт із конспекту
// (вставки 5,3,2,4,7,6,8 + пошук 4 + видалення 7), вироджений (відсортований вхід →
// ланцюг), збалансований (той самий набір «від середини») і демо трьох випадків
// видалення + випадковий. Клонуємо операції, щоб стор не тримав посилань на константи
// еталона. Чисто, без React.

import {
  BST_INTRO_OPS,
  BST_DEGENERATE_OPS,
  BST_BALANCED_OPS,
  BST_DELETE_CASES_OPS,
} from "@/lib/exampleBinarySearchTree"
import { randomBst } from "@/lib/randomBst"
import type { BstOp } from "@/lib/binarySearchTree"
import type { BstDoc } from "@/store/bst-store"

const cloneOps = (ops: readonly BstOp[]): BstOp[] => ops.map((op) => ({ ...op }))

/** Класичний еталон із конспекту: збалансоване дерево + пошук + видалення вузла з двома дітьми. */
export function bstIntroPreset(): BstDoc {
  return { ops: cloneOps(BST_INTRO_OPS) }
}

/** Вироджений: відсортований вхід 1,2,3,4,5 → «ланцюг» (наочне O(n)). */
export function bstDegeneratePreset(): BstDoc {
  return { ops: cloneOps(BST_DEGENERATE_OPS) }
}

/** Збалансований: той самий набір «від середини» → висота 2 (контраст із виродженим). */
export function bstBalancedPreset(): BstDoc {
  return { ops: cloneOps(BST_BALANCED_OPS) }
}

/** Демонстрація трьох випадків видалення (лист / один нащадок / два нащадки). */
export function bstDeleteCasesPreset(): BstDoc {
  return { ops: cloneOps(BST_DELETE_CASES_OPS) }
}

/** Випадковий скрипт (детермінований за seed): вставки + пошук + видалення. */
export function bstRandomPreset(seed: number, count?: number): BstDoc {
  return { ops: randomBst({ seed, count }) }
}
