// Парсер/форматер рівневого списку дерева для текстового поля редактора. Чисто, без
// React. Формат: значення через кому/пробіл; «-», «_», «x» або порожньо → null
// (порожня дитина). Приклад: "1, 2, -, 5" ↔ [1, 2, null, 5].

/** Рівневий список → рядок для поля вводу (null → «-»). */
export function levelsToText(levels: readonly (number | null)[]): string {
  return levels.map((v) => (v === null ? "-" : String(v))).join(", ")
}

/** Рядок з поля вводу → рівневий список (нечисло/«-» → null). */
export function parseLevelsText(text: string): (number | null)[] {
  const tokens = text.split(/[\s,]+/).filter((tok) => tok.length > 0)
  return tokens.map((tok) => {
    if (tok === "-" || tok === "_" || /^(null|x)$/i.test(tok)) return null
    const n = Number.parseInt(tok, 10)
    return Number.isFinite(n) ? n : null
  })
}
