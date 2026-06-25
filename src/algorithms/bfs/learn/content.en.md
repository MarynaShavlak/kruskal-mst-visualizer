# Breadth-First Search (BFS)

**Graph traversal** is a fundamental algorithmic process: visit every vertex of a graph,
performing some action for each one. Breadth-First Search (BFS) is one of the two basic
traversal strategies (the other is depth-first search, DFS). BFS visits vertices in
**layers**: first all the neighbours of the start, then the neighbours of those neighbours —
level by level, moving outward from the starting vertex.

## 1. The idea

BFS starts from a chosen vertex and visits **all neighbours at the current level** before
moving on to the next level. To keep this order we need a first-in-first-out structure: a
**queue** (FIFO).

- Add vertices to the **back** of the queue.
- Take vertices to process from the **front** of the queue.

So vertices added earlier (closer to the start) are processed first — and the traversal
naturally spreads in "rings" from the starting vertex.

## 2. The queue and the visited set

BFS keeps two structures:

- `queue` — the queue of vertices waiting to be processed;
- `visited` — the set of already-visited vertices, to avoid an infinite loop on a cyclic
  graph.

We mark a vertex visited when we **remove** it from the queue. If it was already visited (it
entered the queue twice), we simply skip it.

## 3. Implementation

```python {6,11}
from collections import deque

def bfs(graph, start):
    visited = set()
    queue = deque([start])             # frontier — a queue (FIFO)
    while queue:
        v = queue.popleft()            # take from the FRONT
        if v not in visited:
            visit(v)                   # visit the vertex
            visited.add(v)
            for x in neighbors(v):     # neighbours — to the back of the queue
                if x not in visited:
                    queue.append(x)
```

The key lines are `popleft()` (take from the front, FIFO) and `append()` (add to the back).
They are exactly what makes the traversal go "breadth-first".

## 4. A worked example

Consider a graph as an adjacency list:

```python
graph = {
    'A': ['B', 'C'],
    'B': ['A', 'D', 'E'],
    'C': ['A', 'F'],
    'D': ['B'],
    'E': ['B', 'F'],
    'F': ['C', 'E'],
}
```

BFS from start `A`:

1. Remove `A`, visit → enqueue `B, C`.
2. Remove `B`, visit → enqueue `D, E`.
3. Remove `C`, visit → enqueue `F`.
4. Remove `D`, `E`, `F` — all their neighbours are already visited.

Visit order: **A B C D E F** — first level 0 (`A`), then level 1 (`B, C`), then level 2
(`D, E, F`).

Press "step" and watch the queue fill and drain while vertices light up level by level:

![Step-by-step BFS on this graph](bfs-walk.svg)

## 5. BFS and the shortest path

The main strength of BFS: in an **unweighted** graph it finds the shortest path (by number of
edges) from the start to any vertex. Because the traversal goes level by level, a vertex is
first reached along its shortest route. That makes BFS the natural choice for "fewest steps"
problems: routing, puzzle games, social graphs ("degrees of separation").

## 6. Complexity

- **Time** — `O(V + E)`: each vertex is removed from the queue once, and each edge is
  examined (in an undirected graph — twice, from both ends).
- **Space** — `O(V)`: in the worst case the queue holds most of the vertices of one level.

## 7. BFS vs DFS

BFS and DFS explore the same graph but in different orders: BFS goes "wide" (level by level),
DFS goes "deep" (to the end of a branch, then back). BFS is more economical for the shortest
path but keeps a whole level in memory; DFS uses less memory but does not guarantee the
shortest route. The choice depends on the problem.

A step-by-step comparison on the same graph — BFS on the left, DFS on the right. Scrub through
and see BFS colour vertices in a "bush" (level by level) while DFS stretches into a "long
branch":

![BFS vs DFS on the same graph](bfs-vs-dfs.svg)

## 8. Different cases

### A chain — the strategies coincide

If the graph is a simple line with no branching, BFS and DFS produce the **same** order: we
just walk along the chain. This shows that the difference between them only appears where there
is a choice of neighbours.

![BFS on a chain graph](trav-chain.svg)

### A cyclic graph — the visited set saves us

On a cycle a vertex may enter the frontier twice. The `visited` set prevents reprocessing: when
we remove an already-visited vertex, we simply skip it. Without this check the traversal would
loop forever.

![BFS on a cyclic graph](trav-cyclic.svg)

### A disconnected graph — a corner case

A traversal from one vertex reaches only its **connected component**. If not all vertices are
visited when it finishes, the graph is disconnected (this is exactly how BFS/DFS check
connectivity).

![BFS on a disconnected graph](trav-disconnected.svg)
