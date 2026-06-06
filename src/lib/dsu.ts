// Union-Find (DSU) з union-by-rank + path compression.
// Оптимізації можна вимикати (для демонстрації виродження в ланцюг).
// Методи повертають деталі кроків (шлях підйому, стиснення, об'єднання) і
// рахують операції — щоб алгоритм писав trace й показував живу складність.

import type { Vertex } from "@/lib/graph"

export interface DsuSnapshot {
  readonly parent: Record<Vertex, Vertex>
  readonly rank: Record<Vertex, number>
}

export interface FindResult {
  /** Корінь множини. */
  readonly root: Vertex
  /** Шлях підйому [x, ..., root] ДО стиснення. */
  readonly path: Vertex[]
  /** Вузли, чий батько змінився під час стиснення шляху. */
  readonly compressed: Vertex[]
}

export interface UnionResult {
  /** false, якщо елементи вже в одній множині. */
  readonly merged: boolean
  /** Підсумковий корінь. */
  readonly root: Vertex
  readonly rootX: Vertex
  readonly rootY: Vertex
  /** Корінь, який підвісили під інший (null, якщо merged=false). */
  readonly attached: Vertex | null
  /** Чи зріс ранг кореня (об'єднання дерев рівного рангу). */
  readonly rankIncreased: boolean
}

export interface DsuOptions {
  readonly unionByRank: boolean
  readonly pathCompression: boolean
}

export const DEFAULT_DSU_OPTIONS: DsuOptions = {
  unionByRank: true,
  pathCompression: true,
}

/** Лічильники операцій (для лічильника складності). */
export interface DsuStats {
  readonly finds: number
  readonly findSteps: number
  readonly unions: number
  readonly compressions: number
}

export class DSU {
  private readonly parent = new Map<Vertex, Vertex>()
  private readonly rank = new Map<Vertex, number>()
  private readonly options: DsuOptions
  private _finds = 0
  private _findSteps = 0
  private _unions = 0
  private _compressions = 0

  constructor(
    elements: Iterable<Vertex> = [],
    options: DsuOptions = DEFAULT_DSU_OPTIONS,
  ) {
    this.options = options
    for (const e of elements) this.makeSet(e)
  }

  get stats(): DsuStats {
    return {
      finds: this._finds,
      findSteps: this._findSteps,
      unions: this._unions,
      compressions: this._compressions,
    }
  }

  /** Створює одноелементну множину (ідемпотентно). */
  makeSet(x: Vertex): void {
    if (!this.parent.has(x)) {
      this.parent.set(x, x)
      this.rank.set(x, 0)
    }
  }

  has(x: Vertex): boolean {
    return this.parent.has(x)
  }

  /** Знаходить корінь (зі стисненням, якщо увімкнено); повертає деталі для trace. */
  find(x: Vertex): FindResult {
    this.assertKnown(x)
    const path: Vertex[] = []
    let cur = x
    while (this.parent.get(cur) !== cur) {
      path.push(cur)
      cur = this.parent.get(cur)!
    }
    path.push(cur)
    const root = cur

    this._finds++
    this._findSteps += path.length - 1

    const compressed: Vertex[] = []
    if (this.options.pathCompression) {
      for (const node of path) {
        if (node !== root && this.parent.get(node) !== root) {
          this.parent.set(node, root)
          compressed.push(node)
        }
      }
      this._compressions += compressed.length
    }
    return { root, path, compressed }
  }

  /** Лише корінь. */
  findRoot(x: Vertex): Vertex {
    return this.find(x).root
  }

  connected(x: Vertex, y: Vertex): boolean {
    return this.findRoot(x) === this.findRoot(y)
  }

  /** Об'єднує множини (за рангом, якщо увімкнено); повертає деталі для trace. */
  union(x: Vertex, y: Vertex): UnionResult {
    const rootX = this.findRoot(x)
    const rootY = this.findRoot(y)
    if (rootX === rootY) {
      return {
        merged: false,
        root: rootX,
        rootX,
        rootY,
        attached: null,
        rankIncreased: false,
      }
    }
    this._unions++

    let root: Vertex
    let attached: Vertex
    let rankIncreased = false
    if (this.options.unionByRank) {
      const rankX = this.rank.get(rootX)!
      const rankY = this.rank.get(rootY)!
      if (rankX < rankY) {
        root = rootY
        attached = rootX
      } else if (rankX > rankY) {
        root = rootX
        attached = rootY
      } else {
        root = rootX
        attached = rootY
        this.rank.set(root, rankX + 1)
        rankIncreased = true
      }
    } else {
      // Без рангу: завжди підвішуємо корінь Y під корінь X — можливі довгі ланцюги.
      root = rootX
      attached = rootY
    }
    this.parent.set(attached, root)
    return { merged: true, root, rootX, rootY, attached, rankIncreased }
  }

  /** Кількість незалежних множин серед відомих елементів. */
  componentCount(): number {
    let n = 0
    for (const x of this.parent.keys()) {
      if (this.parent.get(x) === x) n++
    }
    return n
  }

  /** Знімок parent/rank для незмінних кадрів trace. */
  snapshot(): DsuSnapshot {
    return {
      parent: Object.fromEntries(this.parent),
      rank: Object.fromEntries(this.rank),
    }
  }

  private assertKnown(x: Vertex): void {
    if (!this.parent.has(x)) {
      throw new Error(`Невідомий елемент DSU: ${x}`)
    }
  }
}
