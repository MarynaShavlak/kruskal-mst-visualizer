// Чисті похідні підсвітки для плеєра Флойда–Воршала: роль клітинки матриці
// на поточному кадрі, формула релаксації та журнал релаксацій до курсора.
// Без залежностей від UI.

import type { Vertex } from "@/lib/directedGraph"
import { INF } from "@/lib/floydWarshall"
import type { FwFrame, FwTrace } from "@/lib/floydWarshallTrace"

export interface CellRole {
  /** Клітинка лежить на «хресті» півота k (рядок k або стовпець k). */
  readonly pivot: boolean
  /** Один із двох доданків via_k: D[i][k] або D[k][j]. */
  readonly summand: boolean
  /** Активна клітинка (i, j), яку порівнюємо на цьому кадрі. */
  readonly target: boolean
  /** Покращена від початку поточного кроку k (для зеленого тла). */
  readonly improved: boolean
}

/** Роль клітинки (r, c) на кадрі — керує підсвіткою у MatrixPanel. */
export function cellRole(frame: FwFrame, r: number, c: number): CellRole {
  const k = frame.k
  const pivot = k !== null && (r === k || c === k)
  const improved = frame.improvedThisK.some(([a, b]) => a === r && b === c)
  let summand = false
  let target = false
  // І на рішенні (compare), і на оновленні (apply) активна та сама клітинка (i, j)
  // та два доданки via_k — так підсвітка матриці не «стрибає» між кадрами пари.
  const sub = frame.sub
  if (sub.kind === "compare" || sub.kind === "apply") {
    const [i, j] = sub.cell
    target = r === i && c === j
    summand = (r === i && c === k) || (r === k && c === j)
  }
  return { pivot, summand, target, improved }
}

export interface CellFormula {
  /** Оновлювана відстань, напр. "D[A][C]". */
  readonly target: string
  /** Лівий доданок via_k, напр. "D[A][B]". */
  readonly termIK: string
  /** Правий доданок via_k, напр. "D[B][C]". */
  readonly termKJ: string
  /** Поточне D[i][j] (можливо "∞"). */
  readonly curr: string
  /** Сума доданків текстом: "3 + 1" або "∞", якщо хоча б один недосяжний. */
  readonly viaText: string
  /** Результат min(...) текстом. */
  readonly result: string
  /** Чи дає via_k коротший шлях (тоді результат — зелений). */
  readonly improved: boolean
}

/**
 * Формула релаксації для поточного кадру:
 *   D[i][j] = min( D[i][j], D[i][k] + D[k][j] ) = min( curr, a + b ) = result
 * Лише для кадрів compare/apply; інакше null (показуємо загальне правило).
 */
export function cellFormula(
  frame: FwFrame,
  order: readonly Vertex[],
): CellFormula | null {
  const sub = frame.sub
  if (sub.kind !== "compare" && sub.kind !== "apply") return null
  const [i, j] = sub.cell
  const k = sub.k
  const lbl = (x: number): string => order[x] ?? String(x)
  const fmt = (x: number): string => (x === INF ? "∞" : String(x))

  const dik = frame.matrix[i][k]
  const dkj = frame.matrix[k][j]
  const curr = sub.kind === "compare" ? sub.current : sub.from
  const unreachable = dik === INF || dkj === INF
  const via = unreachable ? INF : dik + dkj
  const result = Math.min(curr, via)

  return {
    target: `D[${lbl(i)}][${lbl(j)}]`,
    termIK: `D[${lbl(i)}][${lbl(k)}]`,
    termKJ: `D[${lbl(k)}][${lbl(j)}]`,
    curr: fmt(curr),
    viaText: unreachable ? "∞" : `${fmt(dik)} + ${fmt(dkj)}`,
    result: fmt(result),
    improved: via < curr,
  }
}

export interface Relaxation {
  /** Індекс кадру з цією релаксацією (для переходу по кліку). */
  readonly frameIndex: number
  readonly k: number
  readonly i: number
  readonly j: number
  /** Попередня відстань D[i][j] (можливо ∞). */
  readonly from: number
  /** Нова (менша) відстань via_k. */
  readonly to: number
}

/**
 * Усі релаксації (покращення) від початку до кадру `index` включно — для
 * журналу рішень. Похідне від кадрів trace; рекомпʼютиться при русі курсора.
 * Рахуємо кадри `apply` (саме на них записано нову відстань) — клік по рядку
 * журналу веде на кадр, де клітинка вже зелена.
 */
export function relaxationsUpTo(trace: FwTrace, index: number): Relaxation[] {
  const out: Relaxation[] = []
  const last = Math.min(index, trace.frames.length - 1)
  for (let f = 0; f <= last; f++) {
    const sub = trace.frames[f].sub
    if (sub.kind === "apply") {
      out.push({
        frameIndex: f,
        k: sub.k,
        i: sub.cell[0],
        j: sub.cell[1],
        from: sub.from,
        to: sub.to,
      })
    }
  }
  return out
}
