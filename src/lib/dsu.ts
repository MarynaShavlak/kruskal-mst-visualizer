// Union-Find (DSU) з union-by-rank + path compression.
// Методи повертають деталі кроків (шлях підйому, стиснення, обʼєднання),
// щоб алгоритм міг писати trace, не зазираючи у приватний стан.

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

export class DSU {
  private readonly parent = new Map<Vertex, Vertex>()
  private readonly rank = new Map<Vertex, number>()

  constructor(elements: Iterable<Vertex> = []) {
    for (const e of elements) this.makeSet(e)
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

  /** Знаходить корінь зі стисненням шляху; повертає деталі для trace. */
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

    const compressed: Vertex[] = []
    for (const node of path) {
      if (node !== root && this.parent.get(node) !== root) {
        this.parent.set(node, root)
        compressed.push(node)
      }
    }
    return { root, path, compressed }
  }

  /** Лише корінь (зі стисненням шляху). */
  findRoot(x: Vertex): Vertex {
    return this.find(x).root
  }

  connected(x: Vertex, y: Vertex): boolean {
    return this.findRoot(x) === this.findRoot(y)
  }

  /** Обʼєднує множини за рангом; повертає деталі для trace. */
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

    const rankX = this.rank.get(rootX)!
    const rankY = this.rank.get(rootY)!

    let root: Vertex
    let attached: Vertex
    let rankIncreased = false
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
