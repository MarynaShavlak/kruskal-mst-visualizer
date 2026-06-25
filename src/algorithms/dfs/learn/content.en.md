# Depth-First Search (DFS)

**Graph traversal** is a fundamental process: visit every vertex, performing some action for
each. Depth-First Search (DFS) dives **as deep as possible** along one branch until it hits a
"dead end", then **backtracks** and looks for not-yet-visited vertices. It is the second basic
traversal strategy alongside BFS.

## 1. The idea

DFS visits a vertex and then recursively visits its **first not-yet-visited neighbour**, going
deeper and deeper. When no neighbours are left, it steps back. To keep this last-in-first-out
order we need a **stack** (LIFO) — explicit, or via the system recursion stack.

## 2. Recursive implementation

The most natural way to write DFS is recursion: the function calls itself for each unvisited
neighbour.

```python {7}
def dfs_recursive(graph, vertex, visited=None):
    if visited is None:
        visited = set()
    visit(vertex)                      # visit the vertex
    visited.add(vertex)
    for x in neighbors(vertex):
        if x not in visited:           # prevents an infinite loop
            dfs_recursive(graph, x, visited)
```

The `if x not in visited` check is essential: on a **cyclic** graph, without it the recursion
would never end.

## 3. Iterative implementation

The same logic can be written as a loop with an explicit **stack** instead of recursion:

```python {5,11}
def dfs_iterative(graph, start):
    visited = set()
    stack = [start]                    # frontier — a stack (LIFO)
    while stack:
        v = stack.pop()                # take from the END
        if v not in visited:
            visit(v)                   # visit the vertex
            visited.add(v)
            for x in reversed(neighbors(v)):  # neighbours — onto the stack
                if x not in visited:
                    stack.append(x)
```

We push neighbours in **reverse** order so that the lexicographically smaller neighbour ends
up on top of the stack and is processed first — that way iterative DFS produces the same order
as the recursive one.

## 4. A worked example

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

DFS from start `A`:

1. Visit `A`, go to neighbour `B`.
2. From `B` — deep to `D` (dead end), backtrack, then `E`.
3. From `E` — to `F`, from `F` — to `C`.
4. All vertices visited.

Visit order: **A B D E F C** — one branch to the end first, then backtrack.

Press "step" and watch the stack grow as we dive and shrink as we backtrack:

![Step-by-step DFS on this graph](dfs-walk.svg)

## 5. Applications of DFS

- **Connectivity check**: run a traversal from any vertex; if all are visited, the graph is
  connected.
- **Cycle detection**: if during the traversal we hit an already-visited vertex (not the
  parent), the graph has a cycle.
- Foundation of more advanced algorithms: topological sort, strongly connected components,
  maze solving.

## 6. Complexity

- **Time** — `O(V + E)`: each vertex is visited once, each edge is examined.
- **Space** — `O(V)`: the recursion (stack) depth is, in the worst case, the whole length of
  the path.

## 7. DFS vs BFS

DFS goes "deep", BFS goes "wide". DFS is more memory-efficient and convenient for "is there a
path / cycle / component" questions. But for the **shortest** path in an unweighted graph, BFS
is better: DFS may find a longer route before a shorter one.

A step-by-step comparison on the same graph — BFS on the left, DFS on the right. See DFS
stretch into a "long branch" while BFS colours vertices in a "bush" (level by level):

![BFS vs DFS on the same graph](bfs-vs-dfs.svg)

## 8. Different cases

### A chain — the strategies coincide

If the graph is a simple line with no branching, DFS and BFS produce the **same** order: we just
walk along the chain. The difference between them only appears where there is a choice of
neighbours.

![DFS on a chain graph](trav-chain.svg)

### A cyclic graph — the visited set saves us

On a cycle DFS could loop forever. The `visited` set prevents it: a repeated vertex is simply
skipped. This is exactly how DFS detects cycles — by hitting an already-visited vertex.

![DFS on a cyclic graph](trav-cyclic.svg)

### A disconnected graph — a corner case

A traversal from one vertex reaches only its **connected component**. If not all vertices are
visited when it finishes, the graph is disconnected (this is how connectivity is checked by a
traversal).

![DFS on a disconnected graph](trav-disconnected.svg)
