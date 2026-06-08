import { motion } from "motion/react"
import type { DsuSnapshot } from "@/lib/dsu"
import { colorForRoot } from "@/algorithms/kruskal/playback/highlight"
import { Panel } from "@/algorithms/kruskal/playback/Panel"

interface ForestNode {
  id: string
  x: number
  y: number
  rank: number
  parent: string
  isRoot: boolean
  root: string
}

const DX = 50
const DY = 62
const R = 15

function layoutForest(snap: DsuSnapshot): {
  nodes: ForestNode[]
  width: number
  height: number
} {
  const parent = snap.parent
  const children = new Map<string, string[]>()
  const roots: string[] = []
  for (const v of Object.keys(parent)) {
    const p = parent[v]
    if (p === v) {
      roots.push(v)
    } else {
      const arr = children.get(p)
      if (arr) arr.push(v)
      else children.set(p, [v])
    }
  }
  for (const arr of children.values()) arr.sort()
  roots.sort()

  const pos = new Map<string, { x: number; y: number }>()
  const rootOf = new Map<string, string>()
  let cursor = 0
  let maxDepth = 0

  const place = (node: string, depth: number, root: string): number => {
    maxDepth = Math.max(maxDepth, depth)
    rootOf.set(node, root)
    const kids = children.get(node) ?? []
    let x: number
    if (kids.length === 0) {
      x = cursor * DX
      cursor++
    } else {
      const xs = kids.map((k) => place(k, depth + 1, root))
      x = (xs[0] + xs[xs.length - 1]) / 2
    }
    pos.set(node, { x, y: depth * DY })
    return x
  }

  for (const r of roots) {
    place(r, 0, r)
    cursor++ // проміжок між деревами
  }

  const nodes: ForestNode[] = Object.keys(parent).map((id) => {
    const p = pos.get(id) ?? { x: 0, y: 0 }
    return {
      id,
      x: p.x,
      y: p.y,
      rank: snap.rank[id] ?? 0,
      parent: parent[id],
      isRoot: parent[id] === id,
      root: rootOf.get(id) ?? id,
    }
  })
  return { nodes, width: Math.max(1, cursor) * DX, height: (maxDepth + 1) * DY }
}

export function DsuForestPanel({
  snapshot,
  className,
}: {
  snapshot?: DsuSnapshot
  className?: string
}) {
  if (!snapshot) {
    return (
      <Panel title="Ліс DSU" className={className}>
        <p className="text-sm text-muted-foreground">
          Доступно лише для DSU-версії алгоритму.
        </p>
      </Panel>
    )
  }

  const { nodes, width, height } = layoutForest(snapshot)
  const byId = new Map(nodes.map((n) => [n.id, n]))
  const pad = 28
  const viewBox = `${-pad} ${-pad} ${width + pad * 2} ${height + pad * 2}`

  return (
    <Panel
      title="Ліс DSU (ранги, вказівники)"
      className={className}
      bodyClassName="p-0"
    >
      <svg viewBox={viewBox} className="h-full w-full" preserveAspectRatio="xMidYMid meet">
        <defs>
          <marker id="dsu-arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
            <path d="M0,0 L8,4 L0,8 Z" fill="#64748b" />
          </marker>
        </defs>
        {nodes
          .filter((n) => !n.isRoot)
          .map((n) => {
            const p = byId.get(n.parent)
            if (!p) return null
            const dx = p.x - n.x
            const dy = p.y - n.y
            const len = Math.hypot(dx, dy) || 1
            const ux = dx / len
            const uy = dy / len
            return (
              <line
                key={`arrow-${n.id}`}
                x1={n.x + ux * R}
                y1={n.y + uy * R}
                x2={p.x - ux * R}
                y2={p.y - uy * R}
                stroke="#64748b"
                strokeWidth={1.5}
                markerEnd="url(#dsu-arrow)"
              />
            )
          })}
        {nodes.map((n) => (
          <g key={n.id}>
            <motion.circle
              cx={n.x}
              cy={n.y}
              r={R}
              stroke={n.isRoot ? "#0f172a" : "#ffffff"}
              strokeWidth={n.isRoot ? 2.5 : 1.5}
              initial={false}
              animate={{ fill: colorForRoot(n.root) }}
            />
            <text x={n.x} y={n.y} textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight={600} fill="#ffffff">
              {n.id}
            </text>
            {n.isRoot && (
              <text x={n.x + R + 3} y={n.y - R + 2} fontSize={10} fontWeight={500} style={{ fill: "var(--foreground)" }}>
                rank {n.rank}
              </text>
            )}
          </g>
        ))}
      </svg>
    </Panel>
  )
}
