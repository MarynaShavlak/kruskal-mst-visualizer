// MCQ-чекпойнт навчальної вкладки ДДП: найважчий випадок видалення — вузол із двома
// дітьми. На дереві-турі (корінь 5) видаляємо вузол 7 (діти 6 і 8). Правильна відповідь —
// НАСТУПНИК: найменший ключ у правому піддереві вузла 7, тобто 8.

import type { QuizSpec } from "@/algorithms/shared/learn/quiz-types"

/** Видаляємо вузол 7 (діти 6 і 8). Яке значення стане на його місце? → наступник 8. */
export const BST_DELETE_QUIZ: QuizSpec = {
  prompt: {
    ua: "У дереві з коренем 5 видаляємо вузол 7, у якого двоє дітей: 6 (ліворуч) і 8 (праворуч). Яке значення стане на місце 7?",
    en: "In a tree rooted at 5 we delete node 7, which has two children: 6 (left) and 8 (right). Which value takes 7's place?",
  },
  options: [
    {
      id: "successor",
      label: { ua: "8 — наступник", en: "8 — the successor" },
      correct: true,
      explain: {
        ua: "Так! Наступник — найменший ключ у ПРАВОМУ піддереві вузла 7. Праворуч лише 8, тож воно й «затикає дірку», не порушивши правила порядку.",
        en: "Correct! The successor is the smallest key in node 7's RIGHT subtree. On the right there is only 8, so it plugs the hole without breaking the ordering rule.",
      },
    },
    {
      id: "leftchild",
      label: { ua: "6 — лівий нащадок", en: "6 — the left child" },
      correct: false,
      explain: {
        ua: "6 — це попередник (найбільший ЛІВОРУЧ). Наша реалізація бере саме наступника (найменший ПРАВОРУЧ) — тобто 8.",
        en: "6 is the predecessor (the largest on the LEFT). Our implementation takes the successor (the smallest on the RIGHT) — that is 8.",
      },
    },
    {
      id: "root",
      label: { ua: "5 — корінь", en: "5 — the root" },
      correct: false,
      explain: {
        ua: "Корінь не рухається: видалення локальне — заміну шукаємо лише в піддереві вузла, що видаляємо.",
        en: "The root does not move: deletion is local — the replacement comes only from the subtree of the node being removed.",
      },
    },
    {
      id: "nine",
      label: { ua: "9 — наступний за 8", en: "9 — the one after 8" },
      correct: false,
      explain: {
        ua: "9 у дереві немає, та й наступник шукається лише серед нащадків вузла 7, а не «наступне ціле число».",
        en: "There is no 9 in the tree, and the successor is sought only among node 7's descendants, not as the “next integer”.",
      },
    },
  ],
}
