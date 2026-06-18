// Канонічні приклади інтерполяційного пошуку (еталон коректності з README та
// Python-репозиторію algo-interpolation-search). Кожен інстанс — пара (ВІДСОРТОВАНИЙ
// масив, шукане значення): передумова методу. Ті самі пари розбирає навчальна
// вкладка; їхні відомі підсумки (індекс / кількість ПРОБ + контраст із двійковим)
// звіряють тести. «Ціна» — кількість ПРОБ (обчислень index): на рівномірних даних
// O(log log n), на скупчених деградує до O(n). Без React.

import type { SearchCase } from "@/lib/exampleLinearSearch"

/** range(start, stop, step) у стилі Python — для рівномірних прогресій. */
function range(start: number, stop: number, step: number): number[] {
  const out: number[] = []
  for (let v = start; v < stop; v += step) out.push(v)
  return out
}

/**
 * Демо 1 з конспекту: `[1,3,5,7,9,11,13,15,17,19]`, шукаємо `15` → індекс `7` за
 * ОДНУ пробу («ідеальний здогад»). На ньому README веде розбір формули; повне
 * трасування — 4 кадри.
 */
export const IP_DEMO1: SearchCase = {
  values: [1, 3, 5, 7, 9, 11, 13, 15, 17, 19],
  target: 15,
}

/**
 * Демо 2 з конспекту: `[1,3,5,7,9,11,14,16,18,20,22,25,28,30]`, шукаємо `25` →
 * індекс `11` за ДВІ проби (з коригуванням `low`). Повне трасування — 6 кадрів =
 * step_00…step_05.
 */
export const IP_DEMO2: SearchCase = {
  values: [1, 3, 5, 7, 9, 11, 14, 16, 18, 20, 22, 25, 28, 30],
  target: 25,
}

/**
 * Рівномірні дані `[1,3,5,…,29]` (n=15), шукаємо `21` → індекс `10` за ОДНУ пробу;
 * двійковий — за чотири. Метод ВИГРАЄ: формула вгадує майже точно.
 */
export const IP_UNIFORM_WIN: SearchCase = { values: range(1, 30, 2), target: 21 }

/**
 * Скупчені дані `[1,2,3,4,5,6,7,8,9,1000]` (один величезний «викид»), шукаємо `9` →
 * індекс `8` за ДЕВ'ЯТЬ проб; двійковий — за три. Метод ДЕГРАДУЄ до O(n): формула
 * щоразу вказує майже на початок.
 */
export const IP_CLUSTERED: SearchCase = {
  values: [1, 2, 3, 4, 5, 6, 7, 8, 9, 1000],
  target: 9,
}

/**
 * Велика рівномірна прогресія `[0,5,10,…,995]` (200 елементів), шукаємо `500` →
 * індекс `100` за ОДНУ пробу — майже O(1) незалежно від розміру.
 */
export const IP_BIG_UNIFORM: SearchCase = { values: range(0, 1000, 5), target: 500 }

/**
 * Ключ ПОЗА діапазоном значень: масив демо 2, шукаємо `100` → ранній вихід за
 * охоронцем (`x > arr[high]`) за 0 проб → -1.
 */
export const IP_ABSENT_OUT: SearchCase = { values: IP_DEMO2.values, target: 100 }

/**
 * Ключ УСЕРЕДИНІ діапазону, але відсутній: масив демо 2, шукаємо `26` → 1 проба,
 * далі вихід за охоронцем (`x < arr[low]`) → -1.
 */
export const IP_ABSENT_IN: SearchCase = { values: IP_DEMO2.values, target: 26 }

/**
 * Усі елементи однакові `[7,7,7,7]`, шукаємо `7`: `arr[high] == arr[low]` →
 * ділення на нуль у базовій версії (пастка); безпечна версія повертає `0`.
 */
export const IP_ALL_EQUAL: SearchCase = { values: [7, 7, 7, 7], target: 7 }

/** Відомі підсумки головних прикладів (з README) для тестів і панелей. */
export const IP_DEMO1_STATS = { result: 7, probes: 1, binaryProbes: 2 } as const
export const IP_DEMO2_STATS = { result: 11, probes: 2, binaryProbes: 4 } as const
export const IP_CLUSTERED_STATS = { result: 8, probes: 9, binaryProbes: 3 } as const
export const IP_UNIFORM_WIN_STATS = { result: 10, probes: 1, binaryProbes: 4 } as const
