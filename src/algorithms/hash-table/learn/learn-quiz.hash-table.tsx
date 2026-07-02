// Декларативні MCQ-чекпойнти навчальної вкладки хеш-таблиці для спільного
// `QuizFigure`. Два квізи: (1) концептуальний із конспекту — «яка операція НЕ
// характерна для хеш-таблиці?» (відповідь — впорядкований обхід, бо хеш не зберігає
// порядок); (2) ручний розрахунок слота (найцінніший чек «з нуля»): порахуй
// hash % m. Коректність — явним прапорцем `correct`; `explain` — адресне пояснення.

import type { QuizSpec } from "@/algorithms/shared/learn/quiz-types"

/** Концептуальний квіз: яка операція НЕ характерна для хеш-таблиці? */
export const HT_OP_QUIZ: QuizSpec = {
  prompt: {
    ua: "Яка з операцій НЕ характерна для хеш-таблиці?",
    en: "Which operation is NOT characteristic of a hash table?",
  },
  options: [
    {
      id: "search",
      label: { ua: "Пошук за ключем", en: "Search by key" },
      correct: false,
      explain: {
        ua: "Пошук за ключем — головна операція хеш-таблиці: у середньому O(1).",
        en: "Search by key is the hash table's main operation: O(1) on average.",
      },
    },
    {
      id: "insert",
      label: { ua: "Вставка пари", en: "Insert a pair" },
      correct: false,
      explain: {
        ua: "Вставка — базова операція: обчислюємо слот і кладемо пару.",
        en: "Insert is a basic operation: compute the slot and place the pair.",
      },
    },
    {
      id: "delete",
      label: { ua: "Видалення за ключем", en: "Delete by key" },
      correct: false,
      explain: {
        ua: "Видалення підтримується (у відкритому адресуванні — через надгробки).",
        en: "Delete is supported (via tombstones in open addressing).",
      },
    },
    {
      id: "sorted",
      label: { ua: "Впорядкований обхід ключів", en: "Ordered traversal of keys" },
      correct: true,
      explain: {
        ua: "Саме так: хеш-таблиця НЕ зберігає порядок — ключі лежать «як хеш поклав». Для впорядкованого обходу чи діапазонних запитів беруть дерева пошуку.",
        en: "Correct: a hash table does NOT preserve order — keys sit wherever the hash put them. For ordered traversal or range queries you use search trees.",
      },
    },
  ],
}

/** Ручний розрахунок: у яку комірку піде «lemon»? (сума кодів 539, m = 5). */
export const HT_SLOT_QUIZ: QuizSpec = {
  prompt: {
    ua: "Сума кодів «lemon» = 539, місткість m = 5. У яку комірку піде ключ?",
    en: "The code sum of “lemon” = 539, capacity m = 5. Which cell does the key go to?",
  },
  options: [
    {
      id: "4",
      label: "4",
      correct: true,
      explain: {
        ua: "539 mod 5 = 4 — саме сюди. А оскільки banana теж дає 4, це КОЛІЗІЯ.",
        en: "539 mod 5 = 4 — right here. And since banana also gives 4, it's a COLLISION.",
      },
    },
    {
      id: "0",
      label: "0",
      correct: false,
      explain: {
        ua: "0 — це 530 mod 5 (apple), а не lemon.",
        en: "0 is 530 mod 5 (apple), not lemon.",
      },
    },
    {
      id: "3",
      label: "3",
      correct: false,
      explain: {
        ua: "Ні: 539 mod 5 = 4, а не 3. Остача від ділення 539 на 5 — це 4.",
        en: "No: 539 mod 5 = 4, not 3. The remainder of 539 by 5 is 4.",
      },
    },
    {
      id: "9",
      label: "9",
      correct: false,
      explain: {
        ua: "Комірок лише 5 (0..4) — індексу 9 не існує. Саме тому беремо остачу % 5.",
        en: "There are only 5 cells (0..4) — index 9 doesn't exist. That's exactly why we take % 5.",
      },
    },
  ],
}
