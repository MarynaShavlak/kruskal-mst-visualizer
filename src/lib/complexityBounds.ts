// Теоретичні криві-орієнтири для бенчмарку. Чисті функції росту f(n), нормовані
// так, щоб ПРОХОДИТИ через виміряну якірну точку (anchor). Це педагогічний
// ОРІЄНТИР («так росте n²/n·log n»), а НЕ передбачення реального часу — масштаб
// підбирається під спостереження, форма — теоретична. Без React, без стану.

/** Рід теоретичної кривої. */
export type ComplexityCurveKind =
  | "constant"
  | "log"
  | "linear"
  | "linearithmic"
  | "quadratic"
  | "cubic"

/** Чиста форма росту f(n) (ненормована). */
function shape(kind: ComplexityCurveKind, n: number): number {
  const x = Math.max(1, n)
  switch (kind) {
    case "constant":
      return 1
    case "log":
      return Math.log2(x)
    case "linear":
      return x
    case "linearithmic":
      return x * Math.log2(x)
    case "quadratic":
      return x * x
    case "cubic":
      return x * x * x
  }
}

/**
 * Масштаб кривої так, щоб у точці `anchorN` вона дорівнювала `anchorValue`.
 * Повертає коефіцієнт k: f_scaled(n) = k · shape(n). Якщо форма в якорі нульова
 * (теоретично неможливо для n≥1), повертає 0.
 */
export function anchorScale(
  kind: ComplexityCurveKind,
  anchorN: number,
  anchorValue: number,
): number {
  const base = shape(kind, anchorN)
  return base > 0 ? anchorValue / base : 0
}

/**
 * Значення anchor-scaled теоретичної кривої у точці `n`. `anchorN`/`anchorValue`
 * — координати якоря (зазвичай остання виміряна точка серії), через який крива
 * проходить точно.
 */
export function theoreticalAt(
  kind: ComplexityCurveKind,
  n: number,
  anchorN: number,
  anchorValue: number,
): number {
  return anchorScale(kind, anchorN, anchorValue) * shape(kind, n)
}
