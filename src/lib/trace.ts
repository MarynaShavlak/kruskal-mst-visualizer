// Модель trace — ключова абстракція візуалізатора.
// Алгоритм проганяється ОДИН раз і пише список незмінних кадрів (Frame);
// UI лише рухає курсор по них (scrubbing, крок назад) без переобчислення.
// Формат дворівневий: крок на ребро (edgeIndex/consideredEdgeId) + підкроки (sub).

import type { DsuSnapshot, DsuStats } from "@/lib/dsu"
import type { Vertex } from "@/lib/graph"

export type Algo = "dsu" | "hasPath"
export type EdgeDecision = "accept" | "reject"

export interface MstResult {
  readonly algo: Algo
  /** Прийняті ребра у порядку додавання (нормалізовані id). */
  readonly mstEdgeIds: readonly string[]
  readonly totalWeight: number
  /** Чи вийшло остовне дерево (зв'язний граф ⇒ n-1 ребер). */
  readonly isSpanning: boolean
  /** Кількість компонент наприкінці. */
  readonly componentCount: number
  /** Скільки ребер було розглянуто. */
  readonly consideredCount: number
  /** Підсумкові лічильники DSU (лише для algo="dsu"). */
  readonly dsuStats?: DsuStats
}

/** Підкрок кадру. Дискримінант — `kind`; частина спільна, частина — на алгоритм. */
export type Sub =
  | { readonly kind: "init" }
  | { readonly kind: "consider"; readonly edgeId: string }
  // DSU:
  | {
      readonly kind: "dsu-find"
      readonly vertex: Vertex
      readonly path: readonly Vertex[]
      readonly root: Vertex
    }
  | {
      readonly kind: "dsu-compress"
      readonly vertex: Vertex
      readonly changed: readonly Vertex[]
      readonly root: Vertex
    }
  | {
      readonly kind: "dsu-union"
      readonly rootX: Vertex
      readonly rootY: Vertex
      readonly newRoot: Vertex
    }
  // has-path (BFS у допоміжному лісі):
  | {
      readonly kind: "bfs-visit"
      readonly at: Vertex
      readonly frontier: readonly Vertex[]
      readonly visited: readonly Vertex[]
    }
  | { readonly kind: "bfs-exhausted"; readonly visited: readonly Vertex[] }
  // спільні фінали кроку:
  | { readonly kind: "accept"; readonly edgeId: string }
  | { readonly kind: "reject-cycle"; readonly edgeId: string }
  | { readonly kind: "done" }

export interface Frame {
  readonly i: number
  readonly algo: Algo
  /** Індекс ребра у відсортованому списку; -1 для кадрів поза ребром. */
  readonly edgeIndex: number
  readonly consideredEdgeId: string | null
  /** Рішення по ребру (виставлено на кадрі рішення). */
  readonly decision: EdgeDecision | null
  /** Підсвічені рядки коду (1-based індекси у `Trace.code`). */
  readonly lines: readonly number[]
  /** Нарація українською. */
  readonly caption: string
  /** Прийняті ребра на момент цього кадру (для панелі графа/таблиці). */
  readonly mstEdgeIds: readonly string[]
  readonly sub: Sub
  /** Знімок DSU для панелі «ліс вказівників» (лише для algo="dsu"). */
  readonly dsu?: DsuSnapshot
  /** Лічильники DSU на момент кадру (лише для algo="dsu"). */
  readonly dsuStats?: DsuStats
}

export interface Trace {
  readonly algo: Algo
  /** Лістинг коду для панелі підсвітки (рядок = елемент масиву). */
  readonly code: readonly string[]
  readonly frames: readonly Frame[]
  readonly result: MstResult
  /** Порядок розгляду ребер (нормалізовані id). */
  readonly sortedEdgeIds: readonly string[]
}

export interface KruskalRun {
  readonly result: MstResult
  readonly trace: Trace
}

export type FrameInput = Omit<Frame, "i" | "algo">

/** Збирач кадрів: проставляє індекс `i` та `algo`, віддає готовий Trace. */
export class TraceBuilder {
  private readonly frames: Frame[] = []
  private readonly algo: Algo
  private readonly code: readonly string[]
  private readonly sortedEdgeIds: readonly string[]

  constructor(
    algo: Algo,
    code: readonly string[],
    sortedEdgeIds: readonly string[],
  ) {
    this.algo = algo
    this.code = code
    this.sortedEdgeIds = sortedEdgeIds
  }

  push(frame: FrameInput): void {
    this.frames.push({ i: this.frames.length, algo: this.algo, ...frame })
  }

  get length(): number {
    return this.frames.length
  }

  build(result: MstResult): Trace {
    return {
      algo: this.algo,
      code: this.code,
      frames: this.frames,
      result,
      sortedEdgeIds: this.sortedEdgeIds,
    }
  }
}
