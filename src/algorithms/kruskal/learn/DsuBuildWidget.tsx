import { useEffect, useMemo } from "react"
import type { DsuSnapshot } from "@/lib/dsu"
import { referenceGraph } from "@/lib/exampleGraph"
import { kruskalDsu } from "@/lib/kruskalDsu"
import { colorForRoot } from "@/algorithms/kruskal/playback/highlight"
import { usePlayer } from "@/algorithms/shared/playback/use-player"
import { seekForEdge } from "@/algorithms/kruskal/learn/step-widgets"
import { MiniPlayerShell } from "@/algorithms/shared/learn/MiniPlayerShell"

interface FNode {
  id: string
  x: number
  y: number
  rank: number
  parent: string
  isRoot: boolean
  root: string
}

const DX = 46
const DY = 56
const R = 13

function layout(snap: DsuSnapshot): {
  nodes: FNode[]
  width: number
  height: number
} {
  const parent = snap.parent
  const children = new Map<string, string[]>()
  const roots: string[] = []
  for (const v of Object.keys(parent)) {
    const p = parent[v]
    if (p === v) roots.push(v)
    else {
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
    cursor++
  }

  const nodes: FNode[] = Object.keys(parent).map((id) => {
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

/** Вбудований міні-плеєр побудови лісу DSU (ранги + вказівники, стиснення). */
export function DsuBuildWidget({ focusEdge }: { focusEdge?: string }) {
  const { trace } = useMemo(() => kruskalDsu(referenceGraph()), [])
  const player = usePlayer(trace.frames.length, trace)

  useEffect(() => {
    if (!focusEdge) return
    const i = seekForEdge(trace, focusEdge, false)
    if (i >= 0) player.dispatch({ type: "seek", index: i })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trace, focusEdge])

  const frame = trace.frames[Math.min(player.index, trace.frames.length - 1)]
  const snap = frame.dsu
  const { nodes, width, height } = snap
    ? layout(snap)
    : { nodes: [], width: 1, height: 1 }
  const byId = new Map(nodes.map((n) => [n.id, n]))
  const pad = 26
  const viewBox = `${-pad} ${-pad} ${width + pad * 2} ${height + pad * 2}`

  return (
    <MiniPlayerShell player={player} frameCount={trace.frames.length} caption={frame.caption}>
      <svg viewBox={viewBox} className="h-[240px] w-full" preserveAspectRatio="xMidYMid meet">
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
                key={`e-${n.id}`}
                x1={n.x + ux * R}
                y1={n.y + uy * R}
                x2={p.x - ux * R}
                y2={p.y - uy * R}
                stroke="#94a3b8"
                strokeWidth={1.5}
              />
            )
          })}
        {nodes.map((n) => (
          <g key={n.id}>
            <circle cx={n.x} cy={n.y} r={R} fill={colorForRoot(n.root)} stroke="#ffffff" strokeWidth={n.isRoot ? 2.5 : 1.5} />
            <text x={n.x} y={n.y} textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={600} fill="#ffffff">
              {n.id}
            </text>
            {n.isRoot && (
              <text x={n.x + R + 2} y={n.y - R + 1} fontSize={9} fontWeight={500} style={{ fill: "var(--foreground)" }}>
                r{n.rank}
              </text>
            )}
          </g>
        ))}
      </svg>
    </MiniPlayerShell>
  )
}
