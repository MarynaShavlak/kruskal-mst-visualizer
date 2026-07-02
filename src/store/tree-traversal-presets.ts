// Пресети редактора обходу дерева: канонічне дерево з конспекту (корінь 1),
// дерево двійкового ПОШУКУ (BST — де центровий обхід дає відсортовано), вироджений
// «ланцюг» (наочне O(n)), повне збалансоване дерево й випадкове. Клонуємо рівневий
// список, щоб стор не тримав посилань на незмінні константи еталона. Чисто, без React.

import {
  BT_BST_LEVELS,
  BT_CHAIN_LEVELS,
  BT_FULL_LEVELS,
  BT_INTRO_LEVELS,
} from "@/lib/exampleTreeTraversal"
import { randomTree } from "@/lib/randomTree"
import type { TreeTraversalDoc } from "@/store/tree-traversal-store"

const cloneLevels = (levels: readonly (number | null)[]): (number | null)[] => [...levels]

/**
 * Класичний еталон із конспекту: корінь 1, діти 2/3, у 2 діти 4/5. Прямий обхід за
 * замовчуванням (1,2,4,5,3). На ньому тримається навчальна вкладка й тести lib.
 */
export function treeIntroPreset(): TreeTraversalDoc {
  return { levels: cloneLevels(BT_INTRO_LEVELS), order: "preorder" }
}

/**
 * Дерево двійкового ПОШУКУ (BST). За замовчуванням — ЦЕНТРОВИЙ обхід, бо саме він
 * на BST дає ВІДСОРТОВАНУ послідовність (2,4,6,8,10,12,14) — родзинка обходів.
 */
export function treeBstPreset(): TreeTraversalDoc {
  return { levels: cloneLevels(BT_BST_LEVELS), order: "inorder" }
}

/**
 * Вироджене дерево — «ланцюг» лише лівих дітей (1→2→3→4→5). Фактично зв'язаний
 * список: висота n−1, обхід лінійний. Наочно, чому загальне дерево повільніше.
 */
export function treeChainPreset(): TreeTraversalDoc {
  return { levels: cloneLevels(BT_CHAIN_LEVELS), order: "preorder" }
}

/** Повне (збалансоване) дерево з 7 вузлів — симетричне, висота 2. */
export function treeFullPreset(): TreeTraversalDoc {
  return { levels: cloneLevels(BT_FULL_LEVELS), order: "preorder" }
}

/** Випадкове дерево (детерміноване за seed): різноманітна форма, значення 1..n. */
export function treeRandomPreset(seed: number, count?: number): TreeTraversalDoc {
  return { levels: randomTree({ seed, count }), order: "preorder" }
}
