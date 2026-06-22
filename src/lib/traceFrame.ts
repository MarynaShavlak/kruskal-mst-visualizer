// Базові інтерфейси кадрів trace — спільні поля РОДИН (нарація + знімок входу +
// результат). НЕ уніфікують увесь Frame: поля кожного алгоритму принципово різні
// (вікно/курсор/лічильники/дерево…). Тут лише каркас, який конкретний `XxFrame`
// розширює через `extends`, лишаючи специфіку собі. Суто типи — без runtime
// (інтерфейси стираються; жодних змін у побудові кадрів чи тестах).

/** Спільне для БУДЬ-ЯКОГО кадру: підсвітка коду + нарація. */
export interface FrameNarration {
  /** Підсвічені рядки коду (1-based). */
  readonly lines: readonly number[]
  /** Додатково підсвічені (контекстні) рядки коду. */
  readonly contextLines: readonly number[]
  /** Нарація кадру. */
  readonly caption: string
}

/** Базовий кадр пошуку в МАСИВІ (linear/binary/interpolation/indexed). */
export interface ArraySearchFrameBase extends FrameNarration {
  /** Індекс кадру в trace (0-based). */
  readonly i: number
  /** Знімок масиву (незмінний — пошук лише читає). */
  readonly array: readonly number[]
  readonly target: number
  /** Знайдений індекс або -1. */
  readonly result: number
}

/** Базовий кадр пошуку в РЯДКУ (naive/kmp/boyer-moore/rabin-karp). Без `i`: KMP
 *  нумерує кадри полем `index`, тож кожен рядковий кадр оголошує свій `i`/`index`. */
export interface StringSearchFrameBase extends FrameNarration {
  readonly text: string
  readonly pattern: string
  /** Знайдений індекс або -1. */
  readonly result: number
}

/** Базовий кадр СОРТУВАННЯ (індекс кадру + нарація). Знімок масиву не в усіх
 *  (швидке/злиттям — деревні кадри без `array`), тож він лишається в конкретних. */
export interface SortFrameBase extends FrameNarration {
  /** Індекс кадру в trace (0-based). */
  readonly i: number
}
