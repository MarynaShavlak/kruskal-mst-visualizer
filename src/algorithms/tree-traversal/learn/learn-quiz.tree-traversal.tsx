// MCQ-чекпойнт навчальної вкладки обходу дерева: на дереві-прикладі (корінь 1)
// упізнати, який обхід дає задану послідовність. Data-driven QuizSpec для спільного
// QuizFigure. Правильна відповідь — центровий (inorder) обхід: 4, 2, 5, 1, 3.

import type { QuizSpec } from "@/algorithms/shared/learn/quiz-types"

/** Який обхід дерева-прикладу дає 4, 2, 5, 1, 3? → центровий (inorder). */
export const TT_ORDER_QUIZ: QuizSpec = {
  prompt: {
    ua: "Дерево-приклад (корінь 1, діти 2 і 3, у 2 діти 4 і 5). Який обхід дає послідовність 4, 2, 5, 1, 3?",
    en: "The example tree (root 1, children 2 and 3, and 2 has children 4 and 5). Which traversal yields 4, 2, 5, 1, 3?",
  },
  options: [
    {
      id: "preorder",
      label: { ua: "Прямий (preorder)", en: "Pre-order" },
      correct: false,
      explain: {
        ua: "Прямий обхід відвідує корінь ПЕРШИМ, тож починав би з 1: результат 1, 2, 4, 5, 3.",
        en: "Pre-order visits the root FIRST, so it would start with 1: the result is 1, 2, 4, 5, 3.",
      },
    },
    {
      id: "inorder",
      label: { ua: "Центровий (inorder)", en: "In-order" },
      correct: true,
      explain: {
        ua: "Так! Центровий обхід: ліве піддерево → корінь → праве. Для 2 це 4, 2, 5, потім корінь 1, потім праве 3 → 4, 2, 5, 1, 3.",
        en: "Correct! In-order goes left subtree → root → right. For 2 that is 4, 2, 5, then root 1, then right 3 → 4, 2, 5, 1, 3.",
      },
    },
    {
      id: "postorder",
      label: { ua: "Зворотний (postorder)", en: "Post-order" },
      correct: false,
      explain: {
        ua: "Зворотний обхід відвідує корінь ОСТАННІМ, тож 1 стояв би в кінці: результат 4, 5, 2, 3, 1.",
        en: "Post-order visits the root LAST, so 1 would be at the end: the result is 4, 5, 2, 3, 1.",
      },
    },
  ],
}
