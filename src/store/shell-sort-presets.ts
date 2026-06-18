// Пресети редактора сортування Шелла: головний приклад із README, вже
// відсортований (адаптивність — 0 зсувів), зворотний (багато зсувів), дублікати
// (нестабільність) та випадковий. Чисто (без React). Повертають копії.

import {
  SHELL_INTRO,
  SHELL_SORTED,
  SHELL_REVERSED,
  SHELL_DUPLICATES,
} from "@/lib/exampleShellSort"
import { randomArray } from "@/lib/randomArray"
import type { ShellSortDoc } from "@/store/shell-sort-store"

/** Головний приклад `[8,5,3,7,6,1,4,2]`. */
export function shellIntroPreset(): ShellSortDoc {
  return { values: [...SHELL_INTRO] }
}

/** Уже відсортований `[1..8]` — адаптивність (0 зсувів). */
export function shellSortedPreset(): ShellSortDoc {
  return { values: [...SHELL_SORTED] }
}

/** Зворотний `[8..1]` — багато зсувів. */
export function shellReversedPreset(): ShellSortDoc {
  return { values: [...SHELL_REVERSED] }
}

/** Дублікати `[3,2,4,2,4,3]` — нестабільність. */
export function shellDuplicatesPreset(): ShellSortDoc {
  return { values: [...SHELL_DUPLICATES] }
}

/** Випадковий масив: `count` цілих [1..99], детерміновано за seed. */
export function shellRandomPreset(seed: number, count = 10): ShellSortDoc {
  return { values: randomArray({ count, seed }) }
}
