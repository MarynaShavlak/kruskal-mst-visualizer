# Dijkstra's Algorithm

**Dijkstra's algorithm** finds the shortest paths in a graph with **non-negative** edge
weights from one (source) vertex to **all** others. Picture a map of cities and roads of
different lengths: standing in city `A`, you want to know the shortest distance to every other
city.

## 1. Steps of the algorithm

1. **Initialisation.** The distance to the start = `0`, to all others — `∞` (we don't yet know
   how to reach them). No vertex is "checked" yet.
2. **Processing vertices.** Pick the unvisited vertex with the **smallest** distance. For each
   of its neighbours, try to **relax**: if `distance_to_current + edge_weight` is smaller than
   the known distance to the neighbour, update it. Mark the current vertex as checked.
3. **Termination.** Once all reachable vertices are checked, the distances are final.

## 2. Why it works (greedy choice)

Because the weights are non-negative, the vertex with the smallest current distance can no
longer get closer — no other path through not-yet-processed vertices would be shorter. So its
distance can be fixed forever. This is exactly what the greedy "pick the minimum" choice relies
on.

## 3. A worked example

A graph of 5 vertices and weighted roads:

```python
graph = {
    'A': {'B': 5, 'C': 10},
    'B': {'A': 5, 'D': 3},
    'C': {'A': 10, 'D': 2},
    'D': {'B': 3, 'C': 2, 'E': 4},
    'E': {'D': 4},
}
```

It helps to keep a "Vertex · Distance · Checked" table. The initial state and the steps from
`A`:

| Step | A | B | C | D | E | Picked |
|------|---|---|---|---|---|--------|
| start | 0 | ∞ | ∞ | ∞ | ∞ | — |
| 1 | 0 | **5** | **10** | ∞ | ∞ | A |
| 2 | 0 | 5 | 10 | **8** | ∞ | B |
| 3 | 0 | 5 | 10 | 8 | **12** | D |
| 4 | 0 | 5 | 10 | 8 | 12 | C |
| 5 | 0 | 5 | 10 | 8 | 12 | E |

The result — shortest distances from `A`: `{A: 0, B: 5, C: 10, D: 8, E: 12}`. The path to `E`:
`A → B → D → E` of length `12`. Note step 3: through `D` to `C` gives `8 + 2 = 10` — no shorter
than the direct `A–C = 10`, so the distance to `C` does not change.

## 4. Implementation

The simplest variant linearly searches for the minimum-distance unvisited vertex:

```python {6,9,10}
def dijkstra(graph, start):
    dist = {v: float('inf') for v in graph}
    dist[start] = 0
    unvisited = set(graph)
    while unvisited:
        u = min(unvisited, key=lambda v: dist[v])   # smallest dist
        if dist[u] == float('inf'):
            break                                    # the rest is unreachable
        for v, w in graph[u].items():
            if dist[u] + w < dist[v]:                # relaxation
                dist[v] = dist[u] + w
        unvisited.remove(u)
    return dist
```

## 5. Complexity

- A linear minimum search at each step gives **`O(V²)`** — clear and good enough for small
  graphs.
- With a **priority queue** (binary heap) the minimum costs `O(log V)`, and the complexity
  drops to `O((V + E) · log V)` — the standard variant for large sparse graphs.

## 6. An important caveat

Dijkstra **traverses** the graph, but it is **not a traversal algorithm**: its goal is path
optimisation, not merely visiting all vertices. It is an extended combination of depth-first
and breadth-first search ideas. The key restriction: weights must be **non-negative** — for
negative edges a different algorithm is needed (for example, Bellman–Ford).
