// Чисті хелпери відмальовки порозрядного сортування (без React). Тестуються окремо.
// Сигнатурний образ — кошики 0–9 і фішки-числа з підсвіченою цифрою ПОТОЧНОГО
// розряду (а не стовпчики). Кольорова мова: 🟠 підсвічена цифра розряду · 🔴 фішка,
// що падає в кошик · 🟢 зібраний/відсортований масив · ⬜ ще не розкладені.

/** Роль фішки в РЯДКУ-ДЖЕРЕЛІ для кольору. */
export type ChipRole = "falling" | "gathered" | "placed" | "idle"

/** Стан кадру, потрібний для класифікації фішки джерела. */
export interface ChipState {
  readonly activeIndex: number | null
  readonly gathered: boolean
}

/**
 * Класифікує фішку рядка-джерела за індексом. Пріоритет: зібраний масив (зелений) →
 * фішка, що падає (червона) → вже розкладені раніше за цей прохід (тьмяні) → решта.
 */
export function chipRole(idx: number, s: ChipState): ChipRole {
  if (s.gathered) return "gathered"
  if (idx === s.activeIndex) return "falling"
  if (s.activeIndex != null && idx < s.activeIndex) return "placed"
  return "idle"
}

/** Одна позиція в розписі цифр фішки (для підсвітки розряду). */
export interface DigitPart {
  readonly char: string
  /** Цифра поточного розряду (підсвічуємо бурштиновим). */
  readonly active: boolean
  /** Провідний нуль доповнення (тьмяний — відсутній старший розряд). */
  readonly pad: boolean
}

/**
 * Розпис цифр числа `value`, доповненого нулями зліва до `width` розрядів, із
 * позначенням активної цифри розряду `activeDigit` (0 — одиниці; null — без
 * підсвітки) та провідних нулів-доповнення. `3` при width=3 → `0 0 3`, де перші
 * два — pad. Це основа фішки з підсвіченою цифрою поточного розряду.
 */
export function digitParts(
  value: number,
  width: number,
  activeDigit: number | null,
): DigitPart[] {
  const raw = String(Math.trunc(value))
  const padded = raw.padStart(width, "0")
  const realStart = padded.length - raw.length
  return padded.split("").map((char, si) => {
    const place = padded.length - 1 - si // 0 = одиниці
    return {
      char,
      active: activeDigit != null && place === activeDigit,
      pad: si < realStart,
    }
  })
}
