// Канонічні приклади скриптів для двійкового дерева пошуку — ЄДИНЕ джерело правди для
// тестів lib/, пресетів редактора й живих навчальних віджетів. Головний приклад — з
// конспекту edu.goit: вставки 5,3,2,4,7,6,8, пошук 4, видалення 7 (вузол із двома
// дітьми → заміна на наступник 8). Без React.

import type { BstOp } from "@/lib/binarySearchTree"

/**
 * Головний навчальний скрипт (з конспекту). Будує збалансоване дерево
 *        5
 *       / \
 *      3   7
 *     / \ / \
 *    2  4 6  8
 * далі шукає 4 (знаходить) і видаляє 7 (два нащадки → наступник 8 стає на його місце,
 * 6 лишається лівим). Фінал: preorder 5,3,2,4,8,6 · inorder 2,3,4,5,6,8.
 */
export const BST_INTRO_OPS: readonly BstOp[] = [
  { kind: "insert", key: 5 },
  { kind: "insert", key: 3 },
  { kind: "insert", key: 2 },
  { kind: "insert", key: 4 },
  { kind: "insert", key: 7 },
  { kind: "insert", key: 6 },
  { kind: "insert", key: 8 },
  { kind: "search", key: 4 },
  { kind: "delete", key: 7 },
]

/** Відомі підсумки головного прикладу (звіряють тести й підписи). */
export const BST_INTRO_STATS = {
  size: 6,
  height: 2,
  comparisons: 15,
  frames: 46,
} as const

/** Фінальні обходи головного прикладу (після видалення 7). */
export const BST_INTRO_ORDERS = {
  preorder: [5, 3, 2, 4, 8, 6],
  inorder: [2, 3, 4, 5, 6, 8],
} as const

/**
 * Вироджений випадок: вставка вже впорядкованих ключів 1,2,3,4,5 → дерево виродилося
 * в «ланцюг» лише правих дітей (фактично зв'язаний список). Висота n−1 = 4, пошук 5
 * коштує 5 порівнянь — наочне O(n) проти O(log n) збалансованого.
 */
export const BST_DEGENERATE_OPS: readonly BstOp[] = [
  { kind: "insert", key: 1 },
  { kind: "insert", key: 2 },
  { kind: "insert", key: 3 },
  { kind: "insert", key: 4 },
  { kind: "insert", key: 5 },
  { kind: "search", key: 5 },
]

/**
 * Збалансований випадок: та сама п'ятірка ключів, але додана «від середини»
 * (3,2,4,1,5) → збалансоване дерево висоти 2. Пошук 5 коштує лише 3 порівняння.
 * Контраст із виродженим на тих самих значеннях.
 */
export const BST_BALANCED_OPS: readonly BstOp[] = [
  { kind: "insert", key: 3 },
  { kind: "insert", key: 2 },
  { kind: "insert", key: 4 },
  { kind: "insert", key: 1 },
  { kind: "insert", key: 5 },
  { kind: "search", key: 5 },
]

/**
 * Демонстрація ТРЬОХ випадків видалення на дереві 5,3,2,4,7,6,8:
 *   delete 2 → ЛИСТ (немає дітей) — просто прибираємо;
 *   delete 3 → ОДИН нащадок (2 вже видалено, лишився тільки 4) — нащадок на місце;
 *   delete 7 → ДВА нащадки (6 і 8) — заміна на наступник (мінімум правого = 8).
 */
export const BST_DELETE_CASES_OPS: readonly BstOp[] = [
  { kind: "insert", key: 5 },
  { kind: "insert", key: 3 },
  { kind: "insert", key: 2 },
  { kind: "insert", key: 4 },
  { kind: "insert", key: 7 },
  { kind: "insert", key: 6 },
  { kind: "insert", key: 8 },
  { kind: "delete", key: 2 }, // лист
  { kind: "delete", key: 3 }, // один нащадок (лишився 4)
  { kind: "delete", key: 7 }, // два нащадки → наступник 8
]
