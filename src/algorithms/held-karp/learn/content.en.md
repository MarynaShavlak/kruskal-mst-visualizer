# Traveling Salesman Problem: Brute Force vs Held–Karp Algorithm

An educational and research-oriented project that solves the **Traveling Salesman Problem** (TSP) using two **exact** methods and compares them in detail on an example with five cities:

- **Brute-force search** — generates all `n!` possible routes. It is simple and guaranteed to be exact, but factorially slow: `O(n!)`.
- **Held–Karp algorithm** — dynamic programming with memoization of subproblems. It finds the same exact optimum, but the complexity decreases to `O(n² · 2ⁿ)`.

The main focus is on **step-by-step visualizations**: the distance matrix, level-by-level filling of the dynamic-programming table, reuse of already computed blocks, and complexity comparison.

> **Example result:** both methods return the same optimal route:
> **A → C → B → D → E → A**, with length ≈ **16.75**.

## 1. Traveling Salesman Problem — brute-force method

The salesman must visit five cities exactly once and return home. The goal is to find the shortest route. The brute-force method generates **all** possible routes and chooses the route with the smallest total distance.

```python
from itertools import permutations
from math import sqrt

# Coordinates of five cities
cities = {"A": (0, 0), "B": (1, 5), "C": (2, 2), "D": (3, 3), "E": (5, 1)}
```

## 2. Distance between two cities

The distance is calculated using the Pythagorean theorem. If city 1 has coordinates $(x_1, y_1)$ and city 2 has coordinates $(x_2, y_2)$, then:

$$ distance = \sqrt{(x_2 - x_1)^2 + (y_2 - y_1)^2} $$

```python
# Distance between two cities by their names
def distance(first_city_name, second_city_name):
    x1, y1 = cities[first_city_name]
    x2, y2 = cities[second_city_name]
    return sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2)
```

## 3. Total route length

We add the distances between all neighboring cities in the route and then add the return distance from the last city back to the starting city.

```python
# Total route distance, including return to the starting point
def total_distance_with_return(tour):
    return sum(
        distance(tour[i], tour[i + 1]) for i in range(len(tour) - 1)
    ) + distance(tour[-1], tour[0])
```

## 4. How `total_distance_with_return` works

The function receives one argument, `tour`, which is the sequence of city names in the order they are visited. Example: `('A', 'C', 'B', 'D', 'E')`.

It returns the total length of a **closed** route: all moves between neighboring cities plus the return from the last city to the first one. The expression consists of two parts that are added together.

### Part 1 — moves between neighboring cities

```python
sum(distance(tour[i], tour[i + 1]) for i in range(len(tour) - 1))
```

- `range(len(tour) - 1)` gives the indices `0, 1, 2, 3` for five cities. We use `-1` because we build **neighboring pairs** `(tour[i], tour[i + 1])`; for the last city there is no next city in the list.
- At every step, `distance(tour[i], tour[i + 1])` calculates the distance between the current city and the next city. This is a **generator expression**: it produces distances one by one.
- `sum(...)` adds all these distances into one number.

For the route `('A', 'C', 'B', 'D', 'E')`, this means the moves A→C, C→B, B→D, and D→E: four segments connecting five cities.

### Part 2 — returning home

```python
distance(tour[-1], tour[0])
```

- `tour[-1]` is the last city in the route, `E`. A negative index counts from the end.
- `tour[0]` is the first city, the starting point `A`.
- This is the return distance E→A, which closes the cycle.

Without this part we would calculate only the “outgoing” path. But in TSP, the salesman must return home, so the return edge is part of the total route length.

```python
# Expanded version of the same logic — to see every step separately.
# Requires cities and distance to be defined in previous cells.
tour = ('A', 'C', 'B', 'D', 'E')

total = 0

# Part 1: moves between neighboring cities
for i in range(len(tour) - 1):
    leg = distance(tour[i], tour[i + 1])
    print(f"{tour[i]} -> {tour[i + 1]}: {leg:.3f}")
    total += leg

# Part 2: return from the last city to the first one
back = distance(tour[-1], tour[0])
print(f"{tour[-1]} -> {tour[0]}: {back:.3f}  (return home)")
total += back

print(f"\nTotal distance: {total:.3f}")
```

```text
A -> C: 2.828
C -> B: 3.162
B -> D: 2.828
D -> E: 2.828
E -> A: 5.099  (return home)

Total distance: 16.747
```

## 5. Finding the shortest route

`permutations` generates all possible visiting orders. The `min` function chooses the route with the smallest total distance.

```python
# All possible routes
all_tours = permutations(cities.keys())

# Route with the smallest total distance
shortest_tour = min(all_tours, key=total_distance_with_return)

# Length of this route including the return edge
shortest_distance_with_return = total_distance_with_return(shortest_tour)

print(shortest_tour, shortest_distance_with_return)
```

```text
('A', 'C', 'B', 'D', 'E') 16.746578547999732
```

## 6. Step-by-step breakdown of the shortest-route search

### Step 1 — generate all routes

```python
all_tours = permutations(cities.keys())
```

- `cities.keys()` returns the city names: `'A', 'B', 'C', 'D', 'E'`.
- `permutations(...)` from `itertools` creates **all possible orders** of visiting these cities. For five cities, this is $5! = 120$ routes.
- Each route is a tuple, for example `('A', 'B', 'C', 'D', 'E')`, `('A', 'B', 'C', 'E', 'D')`, and so on.
- `permutations` returns an **iterator**. It is lazy and does not store all 120 routes in memory at once. Important: the iterator is one-time-use. Once `min` consumes it, it becomes empty.

### Step 2 — choose the shortest route

```python
shortest_tour = min(all_tours, key=total_distance_with_return)
```

This is the key line. `min` finds the smallest element, but it does not compare routes directly. Instead, it compares the values returned by the function passed as `key`:

- for each route, `min` calls `total_distance_with_return(route)` and receives its length;
- then it compares those numeric lengths and keeps the route with the smallest one.

Notice that the function is passed to `key` **without parentheses**: `key=total_distance_with_return`, not `key=total_distance_with_return()`. We pass the function itself, and `min` calls it as many times as needed.

### Step 3 — get the length of the winner

```python
shortest_distance_with_return = total_distance_with_return(shortest_tour)
```

`min` returns only the route, not its length. Therefore, we call the function once more on the shortest route to obtain the numeric distance.

### Step 4 — print the result

```python
print(shortest_tour, shortest_distance_with_return)
```

Output:

```text
('A', 'C', 'B', 'D', 'E') 16.746578547999732
```

> Note: among the 120 permutations, many routes are essentially the same cycle, just started at another city or traversed in the reverse direction. Brute force does not remove these duplicates. It checks all 120 routes honestly, which is why it becomes too slow when the number of cities grows.

```python
# What exactly does this code iterate over? Let us inspect it.
# We create a list, not an iterator, so we can traverse it several times.
all_tours = list(permutations(cities.keys()))

print("Number of cities:", len(cities))                  # 5
print("Number of routes (5!):", len(all_tours))          # 120
print()

# First 3 routes and their lengths
print("Example routes:")
for tour in all_tours[:3]:
    print(" ", tour, "->", round(total_distance_with_return(tour), 3))
print()

# What min(..., key=...) does internally:
best = None
best_len = None
for tour in all_tours:
    length = total_distance_with_return(tour)
    if best_len is None or length < best_len:
        best = tour
        best_len = length

print("Shortest route:", best)
print("Its length:", round(best_len, 3))
```

```text
Number of cities: 5
Number of routes (5!): 120

Example routes:
  ('A', 'B', 'C', 'D', 'E') -> 17.603
  ('A', 'B', 'C', 'E', 'D') -> 18.495
  ('A', 'B', 'D', 'C', 'E') -> 17.603

Shortest route: ('A', 'C', 'B', 'D', 'E')
Its length: 16.747
```

## 7. Result

Shortest route: **A → C → B → D → E → A**, with total distance ≈ **16.75** units.

The time complexity of the method is factorial, $O(n!)$: for five cities it is 120 permutations, while for ten cities it is already 3,628,800. Therefore, the method becomes impractical for a large number of cities.

## 8. Conclusion: time complexity of brute force

The brute-force method **guarantees the exact optimal route** because it checks every possible option. The price for this accuracy is **factorial complexity $O(n!)$**.

The algorithm generates all city permutations, $n!$ of them, and calculates the length of each. The number of computations grows explosively: adding just one city multiplies the amount of work by the new value of $n$.

Numerically:

- 5 cities → $5! = 120$ routes, instant.
- 10 cities → $10! = 3\,628\,800$ routes, seconds.
- 15 cities → more than $1.3$ trillion routes, unrealistically long.
- 20 cities → about $2.4 \times 10^{18}$ routes, practically impossible.

Because of that, brute force is suitable only for **very small problems**, roughly up to 10–12 cities. For larger cases, more efficient approaches are needed: dynamic programming, such as the Held–Karp algorithm with $O(n^2 \cdot 2^n)$ complexity, for medium-sized tasks, or heuristic and metaheuristic methods, such as nearest neighbor, genetic algorithms, and ant colony algorithms, for large tasks. They do not always guarantee the perfect route, but they provide good results in acceptable time.

## 9. Traveling Salesman Problem — Held–Karp algorithm

## 10. Main idea

The Held–Karp algorithm solves the Traveling Salesman Problem using **dynamic programming**. Instead of checking all $n!$ routes, it splits the problem into subproblems and reuses their solutions.

Each subproblem asks: *“What is the shortest path that starts at the start city, visits exactly a given subset of cities, and ends in city $j$?”* Answers to these subproblems are **stored** through memoization and then used as building blocks for larger subsets.

The method is based on **optimal substructure**: the shortest path through a large subset of cities is built from shortest paths through smaller subsets plus one final move. This is what allows the algorithm not to recompute the same thing many times.

## 11. Step-by-step work

1. **Base.** For every city $i$, store the distance from the start to that city. This is the path through the subset $\{start, i\}$.
2. **Grow subsets** by size: first subsets of 3 cities, then 4, and so on.
3. For each subset $S$ and final city $j$, take the minimum over all possible previous cities $k$:

   $$ dp[S][j] = \min_{k \in S \setminus \{j\}} \big( dp[S \setminus \{j\}][k] + dist(k, j) \big) $$

4. When $S$ contains **all cities**, we have the shortest paths that visit everything and end in each city $j$, but without returning to the start yet.
5. **Close the route.** Add the distance from the last city back to the start for each such path and take the smallest total.

```python
from math import sqrt
from itertools import combinations

# City coordinates, same as in brute force
cities = {"A": (0, 0), "B": (1, 5), "C": (2, 2), "D": (3, 3), "E": (5, 1)}

# Euclidean distance between two points
def calculate_distance(coord1, coord2):
    return sqrt((coord1[0] - coord2[0]) ** 2 + (coord1[1] - coord2[1]) ** 2)

# Distance matrix: distance_matrix[i][j] is the distance from city i to city j
distance_matrix = []
for source in cities.values():
    row = [calculate_distance(source, target) for target in cities.values()]
    distance_matrix.append(row)

# Inspect the matrix
for row in distance_matrix:
    print([round(d, 2) for d in row])
```

```text
[0.0, 5.1, 2.83, 4.24, 5.1]
[5.1, 0.0, 3.16, 2.83, 5.66]
[2.83, 3.16, 0.0, 1.41, 3.16]
[4.24, 2.83, 1.41, 0.0, 2.83]
[5.1, 5.66, 3.16, 2.83, 0.0]
```

## 12. What the distance matrix means and why it is needed

The distance matrix is a square $n \times n$ table. In this example it is $5 \times 5$ because there are five cities. It contains the distances between all pairs of cities, calculated in advance.

### What each number means

The number in row $i$ and column $j$ is the distance **from city $i$ to city $j$**. Rows and columns correspond to cities in the order A, B, C, D, E, with indices 0–4. Examples:

- `distance_matrix[0][1] = 5.10` — distance from **A to B**.
- `distance_matrix[2][3] = 1.41` — distance from **C to D**, the closest pair.
- `distance_matrix[1][4] = 5.66` — distance from **B to E**, one of the longest distances.

Each value is the **Euclidean straight-line distance** between two coordinate pairs, calculated using the Pythagorean theorem.

### Two important properties

- **Zero diagonal:** `distance_matrix[i][i] = 0`, because the distance from a city to itself is zero.
- **Symmetry:** `distance_matrix[i][j] = distance_matrix[j][i]`, because the distance from A to B is the same as from B to A.

### Why the matrix is useful

Held–Karp repeatedly needs distances between pairs of cities inside nested loops. Recomputing square roots each time would be slow and unnecessary. Therefore, all distances are calculated **once in advance** and stored in the matrix. The algorithm then works with city indices and retrieves `distance_matrix[i][j]` instantly.

![Heatmap of the distance matrix between cities.](images/en/01_distance_matrix.png)

*Heatmap of the distance matrix between cities.*

![All five cities and distances between each pair.](images/en/02_cities_graph.png)

*All five cities and distances between each pair.*

## 13. Main algorithm code

```python
def held_karp(distance_matrix):
    n = len(distance_matrix)  # number of cities

    # dp is the dynamic-programming table.
    # Key: (subset of cities as frozenset, last city in this subset).
    # Value: (minimum distance from the start to this city through the subset,
    #         the path itself as a list of indices).

    # --- BASE ---
    # Subsets of two cities {start(0), i}: path 0 -> i.
    dp = {(frozenset([0, i]), i): (distance_matrix[0][i], [0, i]) for i in range(1, n)}
    # Distance from the start to itself is 0.
    dp[(frozenset([0]), 0)] = (0, [0])

    # --- GROW SUBSETS by size r ---
    for r in range(2, n + 1):
        # All subsets of r non-start cities selected from 1..n-1
        for subset in combinations(range(1, n), r):
            subset = frozenset(subset) | frozenset([0])  # add the start city

            # Try to make every city in the subset the final city
            for next_city in subset:
                if next_city == 0:
                    continue  # the start cannot be the final city of an intermediate path

                # Subset without the final city; its solution is already known
                prev_subset = subset - frozenset([next_city])

                # Shortest path to next_city = best option among all possible previous cities
                dp[(subset, next_city)] = min(
                    (
                        dp[(prev_subset, last_city)][0] + distance_matrix[last_city][next_city],
                        dp[(prev_subset, last_city)][1] + [next_city],
                    )
                    for last_city in prev_subset
                    if last_city != 0
                )

    # --- CLOSE THE ROUTE ---
    # Add the return to the start city to each full path, then take the minimum.
    all_cities = frozenset(range(n))
    result = min(
        (
            dp[(all_cities, last_city)][0] + distance_matrix[last_city][0],
            dp[(all_cities, last_city)][1] + [0],
        )
        for last_city in range(1, n)
    )
    return result  # (minimum distance, optimal path as indices)
```

## 14. Essence of the `held_karp` function

The function finds the **exact** shortest route using dynamic programming. Its idea is not to iterate over all $n!$ routes, but to solve small subproblems, store them, and combine them into larger ones.

### What the `dp` table stores

`dp` is a dictionary:

- **Key** — a pair `(subset of cities, last city)`. The subset is a `frozenset` of indices because a normal `set` cannot be used as a dictionary key.
- **Value** — a pair `(minimum distance from the start to this last city through this subset, path as a list of indices)`.

In other words, `dp[(S, j)]` answers the question: *“What is the shortest path that starts at 0, visits exactly the cities in subset $S$, and ends in city $j$?”*

### Recurrence relation — the heart of the function

$$ dp[S][j] = \min_{\substack{k \in S \\ k \ne 0,\, k \ne j}} \big( dp[S \setminus \{j\}][k] + dist(k, j) \big) $$

In words: to reach $j$ through subset $S$, we try every possible **previous** city $k$, take the already-known shortest path to $k$ through $S$ without $j$, and add the move $k \to j$. Among all options, we keep the cheapest one. This is exactly what the built-in `min` does.

Each candidate is a tuple `(cost, path)`. `min` compares tuples by the first element, so it immediately returns both the smallest distance and the corresponding path.

## 15. Why `frozenset` is used

In the `dp` table, the key is a pair `(subset of cities, last city)`, for example `(frozenset([0, 2, 3]), 1)`. The subset must be represented as a `frozenset` for two reasons.

### 1. Dictionary keys must be hashable

Dictionary keys and set elements must be **immutable / hashable**. A normal `set` is mutable, so it cannot be hashed and cannot be used as a key. Trying to do so raises `TypeError: unhashable type: 'set'`.

`frozenset` is an immutable version of a set, and it is hashable, so it can safely be used as a dictionary key.

### 2. We need set semantics, not sequence semantics

A subset of cities is an **unordered collection**: `{A, C, D}` is the same subset regardless of how it is written. `frozenset` provides exactly this behavior:

`frozenset([0, 2, 3]) == frozenset([3, 2, 0])` is `True`, and the hash is the same.

If we used tuples instead, `(0, 2, 3)` and `(3, 2, 0)` would be different keys, even though they describe the same subset. The algorithm would store duplicates and lose the main benefit of memoization.

### Bonus: convenient set operations

`frozenset` supports the set operations used directly by `held_karp`:

- `subset | frozenset([0])` — add the start city to the subset.
- `subset - frozenset([next_city])` — remove the final city from the subset.

Summary: we need a collection that **ignores order**, **removes duplicates**, and **can be used as a dictionary key**. `frozenset` is exactly that.

```python
# 1) A normal set CANNOT be a dictionary key
try:
    d = {set([0, 1]): "x"}
except TypeError as e:
    print("set as a key ->", e)

# 2) frozenset can be a key
print("frozenset as a key ->", {frozenset([0, 1]): "ok"})

# 3) Order does not matter: the same subset is the same key
a = frozenset([0, 1, 2])
b = frozenset([2, 1, 0])
print("frozenset([0,1,2]) == frozenset([2,1,0]) ->", a == b)
print("same hash ->", hash(a) == hash(b))

# 4) Tuples would be interpreted as DIFFERENT keys
print("(0,1,2) == (2,1,0) ->", (0, 1, 2) == (2, 1, 0))

# 5) Set operations used by held_karp
subset = frozenset([0, 1, 2])
print("subset | {3} ->", subset | frozenset([3]))
print("subset - {1} ->", subset - frozenset([1]))
```

```text
set as a key -> unhashable type: 'set'
frozenset as a key -> {frozenset({0, 1}): 'ok'}
frozenset([0,1,2]) == frozenset([2,1,0]) -> True
same hash -> True
(0,1,2) == (2,1,0) -> False
subset | {3} -> frozenset({0, 1, 2, 3})
subset - {1} -> frozenset({0, 2})
```

## 16. Step-by-step work

The function works in three phases.

**1. Base.** For every city $i$, store the direct path from the start:
`dp[({0, i}, i)] = (dist(0, i), [0, i])`. Separately, `dp[({0}, 0)] = (0, [0])`, meaning the start city to itself has distance 0.

**2. Growth.** The outer loop `for r` takes larger and larger subsets: first with 3 cities, then 4, and so on. For each subset $S$ and every possible final city `next_city`, the recurrence relation is applied. We look at the smaller subset `prev_subset = S \ {next_city}`. Its solutions have already been calculated on the previous level. Then we choose the best previous city.

**3. Closing.** When $S$ contains all cities, we have shortest paths that end in every city, but **without the return home**. The final `min` adds the distance back to the start, `dist(last, 0)`, and chooses the smallest total route.

The next traced version runs the same logic but prints how `dp` is filled at each level.

## 17. Main idea on our five cities

Start: **A (0, 0)**. Other cities: B (1, 5), C (2, 2), D (3, 3), E (5, 1). Instead of iterating over all 24 routes starting from A, we build the answer from ready-made blocks: first find shortest paths through small city sets, store them, and then combine them into larger paths. Each block is computed only once.

1. **Base.** Store the direct distance from A to every city: B — 5.10, C — 2.83, D — 4.24, E — 5.10.
2. **Grow.** Find shortest paths through **3 cities**, then **4 cities**, then **all 5 cities**, each time using already computed shorter paths.
3. **One cell example.** The shortest path through `{A, C, B}` ending in B can only have C before B. So we take A→C (2.83) and add C→B (3.16), giving **5.99**. Where several candidates exist, we take the cheapest one. For example, for `{A, B, C, D}` ending in D:
   - through B: A→C→B (5.99) + B→D (2.83) = **8.82**;
   - through C: A→B→C (8.26) + C→D (1.41) = 9.68.

   The minimum is **8.82**, so the path is A→C→B→D.
4. **All cities.** When the subset contains all five cities, we have shortest paths that visit all cities and end in B/C/D/E, still without return. For example, ending in E gives A→C→B→D→E = **11.65**.
5. **Close.** Add the return to A. Ending in E gives 11.65 + E→A (5.10) = **16.75**, which is the optimal tour **A → C → B → D → E → A**.

```text
Hint: cost = (ready block + new edge); path format A→…→end.
=== BASE: subsets of 2 cities ===
  {A, B}, end B:  5.10 (direct edge A→B)   A → B
  {A, C}, end C:  2.83 (direct edge A→C)   A → C
  {A, D}, end D:  4.24 (direct edge A→D)   A → D
  {A, E}, end E:  5.10 (direct edge A→E)   A → E

=== LEVEL: subsets of 3 cities ===
  {A, B, C}, end B:  5.99 (=  2.83 + 3.16)   A → C → B
  {A, B, C}, end C:  8.26 (=  5.10 + 3.16)   A → B → C
  {A, B, D}, end B:  7.07 (=  4.24 + 2.83)   A → D → B
  {A, B, D}, end D:  7.93 (=  5.10 + 2.83)   A → B → D
  {A, B, E}, end B: 10.76 (=  5.10 + 5.66)   A → E → B
  {A, B, E}, end E: 10.76 (=  5.10 + 5.66)   A → B → E
  {A, C, D}, end C:  5.66 (=  4.24 + 1.41)   A → D → C
  {A, C, D}, end D:  4.24 (=  2.83 + 1.41)   A → C → D
  {A, C, E}, end C:  8.26 (=  5.10 + 3.16)   A → E → C
  {A, C, E}, end E:  5.99 (=  2.83 + 3.16)   A → C → E
  {A, D, E}, end D:  7.93 (=  5.10 + 2.83)   A → E → D
  {A, D, E}, end E:  7.07 (=  4.24 + 2.83)   A → D → E

=== LEVEL: subsets of 4 cities ===
  {A, B, C, D}, end B:  7.07 (=  4.24 + 2.83)   A → C → D → B
  {A, B, C, D}, end C:  9.34 (=  7.93 + 1.41)   A → B → D → C
  {A, B, C, D}, end D:  8.82 (=  5.99 + 2.83)   A → C → B → D
  {A, B, C, E}, end B: 11.42 (=  8.26 + 3.16)   A → E → C → B
  {A, B, C, E}, end C: 13.92 (= 10.76 + 3.16)   A → B → E → C
  {A, B, C, E}, end E: 11.42 (=  8.26 + 3.16)   A → B → C → E
  {A, B, D, E}, end B: 10.76 (=  7.93 + 2.83)   A → E → D → B
  {A, B, D, E}, end D: 13.58 (= 10.76 + 2.83)   A → B → E → D
  {A, B, D, E}, end E: 10.76 (=  7.93 + 2.83)   A → B → D → E
  {A, C, D, E}, end C:  9.34 (=  7.93 + 1.41)   A → E → D → C
  {A, C, D, E}, end D:  8.82 (=  5.99 + 2.83)   A → C → E → D
  {A, C, D, E}, end E:  7.07 (=  4.24 + 2.83)   A → C → D → E

=== LEVEL: subsets of 5 cities ===
  {A, B, C, D, E}, end B: 11.65 (=  8.82 + 2.83)   A → C → E → D → B
  {A, B, C, D, E}, end C: 13.92 (= 10.76 + 3.16)   A → B → D → E → C
  {A, B, C, D, E}, end D: 14.25 (= 11.42 + 2.83)   A → B → C → E → D
  {A, B, C, D, E}, end E: 11.65 (=  8.82 + 2.83)   A → C → B → D → E

=== CLOSE THE ROUTE: return to A ===
  Optimal: 16.75 (= 11.65 level 5 path + 5.10 edge E→A)   A → C → B → D → E → A
(16.746578547999732, [0, 2, 1, 3, 4, 0])
```

## 18. How `held_karp` works step by step

The algorithm solves the problem bottom-up: from the smallest subproblems to the full route. The main rule is simple: every new value equals **a ready block from the previous level plus one move**, and among several options the smallest one is kept.

- **Base, level 2.** The smallest subproblem is reaching one city from A. There is nothing to choose: the shortest path is the direct edge. These values become the foundation.
- **Level 3.** If the route has three cities and ends, for example, in B, then only one city can stand before B. There is only one candidate. For every triple, the algorithm stores the best path for each possible final city because we do not know in advance which one will be needed later.
- **Level 4 — the key moment.** Once there are four cities, the final city may have two possible predecessors. Here `min` starts doing real selection: try each predecessor, using the already computed smaller subproblem, and keep the cheaper one.
- **Level 5.** Same logic, but now there are three candidates.
- **Closing.** After level 5, we have shortest paths through all cities, but they are one-way paths. Add the return to A and take the smallest total. Several variants may give the same 16.75 because they are the same cycle traversed in opposite directions.
- **Result:** A → C → B → D → E → A, length ≈ 16.75, the same optimum as brute force.

## 19. Step-by-step visualization: all subproblems by levels

Each level below is shown completely: all subsets of the required size and **all possible final cities**, in the same order as the textual trace of `held_karp_traced` above.

Each panel is the optimal path that **starts at A**, visits **exactly this subset** of cities, and **ends in the specified city**. The route color corresponds to the final city: B — amber, C — blue, D — green, E — red. Pale circles represent cities that are not included in the current subset.

## 20. How to understand which path is chosen

The grid for level 3 can be confusing. Its 12 panels are **6 different subsets × 2 endings = 12 separate subproblems**, not four groups of competing options. If we group by the final city, we indeed get three panels for each final city. For example, for final city **B**:

- `{A, B, C}` → B
- `{A, B, D}` → B
- `{A, B, E}` → B

But these three panels visit different city sets. They are different subproblems, not alternative solutions to the same one. The algorithm stores all of them because each may be reused as a ready block on level 4.

**Where does the real choice happen?** It happens inside a single subproblem, when the final city can be reached from several different previous cities.

- **Levels 2 and 3 have no real choice.** For three cities, A + one intermediate city + final city, the previous city is unique. For example, `{A, B, C}` ending in B can only come from C: `A → C → B`.
- **Level 4 has 2 possible previous cities**, and level 5 has **3**. This is where the algorithm actually chooses the variant where **ready path to the previous city + final edge** is minimal:

$$ dp[S][j] = \min_{k}\big( dp[S \setminus \{j\}][k] + dist(k, j) \big) $$

## 21. Levels 2–5 and closing as colored tables — where the blocks come from

The colored tables show the main idea of dynamic programming: **compute once, reuse many times**. Each subset receives its own color, and each cell has a coordinate. To avoid mixing levels, the coordinates are different: **level 2 — `1T…4T`**, **level 3 — `1X…4Z`**, **level 4 — `5P…8R`**, **level 5 — `9M…10N`**. Candidate rows refer to those coordinates.

- **Level 2, base.** Four cells: direct edge `A → X` for each city. No choice yet. It is the starting layer. Cell color is the final city.
- **Level 3.** Twelve cells: six subsets × two endings. Cell color is the subset; both endings of one subset have the same color.
- **Level 4.** Cell color is the source subset `S \ {end}` whose ready blocks are inserted here. The same color as in level 3 shows where the ready path came from. Below the title, each candidate is shown as a separate row. The green row with ✓ is selected; red rows are rejected.
- **Level 5.** Four cells: endings B, C, D, E. Color is the source subset with four cities. There are three candidate rows because the previous city can be one of three cities.
- **Closing.** Four cells, one for each final city. Take a ready level-5 path and add the edge `j → A` to close the route. The ✓ marks the endings that produce the minimal tour, 16.75.

Example: the cell `{A, B, C, D} → B` uses the ready block `{A, C, D}` from level 3 and compares two options: through C, `5.66 + 3.16 = 8.82`, and through D, `4.24 + 2.83 = 7.07`. The minimum is through D.

### Level 2 in the code — the **`--- BASE ---`** block

This is the fragment of `held_karp` that creates what the table below shows (direct edges `A → X`):

```python
# --- BASE ---
dp = {(frozenset([0, i]), i): (distance_matrix[0][i], [0, i]) for i in range(1, n)}
dp[(frozenset([0]), 0)] = (0, [0])
```

Each entry `dp[(frozenset([0, i]), i)]` is one cell of this table: subset `{0, i}` (start + city `i`), ending `i`, cost = `distance_matrix[0][i]`, path = `[0, i]`. There is no choice here yet — these are the starting values.

![Level 2, base — direct edges A→X for each city.](images/en/03_level2_base.png)

*Level 2, base — direct edges A→X for each city.*

### Level 3 in the code — the first growth pass, `r = 2`

```python
for r in range(2, n + 1):                 # r = 2 -> subsets of 3 cities
    for subset in combinations(range(1, n), r):
        subset = frozenset(subset) | frozenset([0])
        for next_city in subset:
            if next_city == 0:
                continue
            prev_subset = subset - frozenset([next_city])
            dp[(subset, next_city)] = min(
                (
                    dp[(prev_subset, last_city)][0] + distance_matrix[last_city][next_city],
                    dp[(prev_subset, last_city)][1] + [next_city],
                )
                for last_city in prev_subset
                if last_city != 0
            )
```

When `r = 2`, the loop takes subsets with **3 cities**. In each cell, `min(...)` tries all possible previous cities, takes the ready block from level 2, and adds the final edge. Because `prev_subset` contains only two cities, the candidate is unique.

![Level 3 — 12 subproblems: 6 subsets × 2 endings.](images/en/04_level3.png)

*Level 3 — 12 subproblems: 6 subsets × 2 endings.*

### Level 4 in the code — the same loop, next pass `r = 3`

This is the same line `dp[(subset, next_city)] = min(...)`, just with the next value of `r`:

```python
for r in range(2, n + 1):                 # r = 3 -> subsets of 4 cities
    ...
    prev_subset = subset - frozenset([next_city])
    dp[(subset, next_city)] = min(
        (
            dp[(prev_subset, last_city)][0] + distance_matrix[last_city][next_city],
            dp[(prev_subset, last_city)][1] + [next_city],
        )
        for last_city in prev_subset
        if last_city != 0
    )
```

When `r = 3`, subsets contain **4 cities**, and `prev_subset` points to ready level-3 blocks that are already stored in `dp`. Now `min(...)` chooses among several `last_city` values. This is where green selected rows and red rejected rows appear in the visualization.

![Level 4 — choosing between candidates built from level-3 blocks.](images/en/05_level4.png)

*Level 4 — choosing between candidates built from level-3 blocks.*

## 22. Level 4. Explanation of the first cell (orange 5P): why `min(8.82, 7.07) = 7.07` and route A → C → D → B

Consider the cell **`{A, B, C, D} → B`**. It asks:

> What is the shortest path that starts at A, visits exactly A, B, C, D, and ends in B?

Since the path must end in B, the previous city can be either C or D. Therefore, there are two candidates:

### Candidate 1 — arrive in B from C

- Ready block: shortest path through `{A, C, D}` ending in C.
- From the previous level, this is `A → D → C` with cost `5.66`.
- Add the new edge C→B with cost `3.16`.
- Total: `5.66 + 3.16 = 8.82`.

### Candidate 2 — arrive in B from D

- Ready block: shortest path through `{A, C, D}` ending in D.
- From the previous level, this is `A → C → D` with cost `4.24`.
- Add the new edge D→B with cost `2.83`.
- Total: `4.24 + 2.83 = 7.07`.

Because `7.07 < 8.82`, the second candidate wins:

```text
A → C → D → B
```

### Where did C before D come from?

It came from the already-computed level-3 block `{A, C, D} → D`. That block was optimal by itself: to reach D while visiting A, C, and D, the best path is `A → C → D`. Level 4 does not rebuild it from scratch. It reuses it and adds one new edge, D→B.

### Level 5 in the code — the same loop, final pass `r = 4`

```python
for r in range(2, n + 1):                 # r = 4 -> the subset of all 5 cities
    ...
    dp[(subset, next_city)] = min(
        (
            dp[(prev_subset, last_city)][0] + distance_matrix[last_city][next_city],
            dp[(prev_subset, last_city)][1] + [next_city],
        )
        for last_city in prev_subset
        if last_city != 0
    )
```

For `r = 4`, each subset contains all five cities. For each final city, the previous city can be one of three alternatives. The algorithm again uses the same recurrence and chooses the cheapest candidate.

![Level 5 — full paths through all cities, before returning to A.](images/en/06_level5.png)

*Level 5 — full paths through all cities, before returning to A.*

### Closing in the code — the final route-closing block

```python
# --- CLOSE THE ROUTE ---
all_cities = frozenset(range(n))
result = min(
    (
        dp[(all_cities, last_city)][0] + distance_matrix[last_city][0],
        dp[(all_cities, last_city)][1] + [0],
    )
    for last_city in range(1, n)
)
```

Here the algorithm takes the ready paths through all cities, adds the return edge to the start, and chooses the minimum.

![Closing the route — adding the final edge back to A.](images/en/07_closing.png)

*Closing the route — adding the final edge back to A.*

## 23. Running the final algorithm

```python
# Run the algorithm
min_distance, optimal_path = held_karp(distance_matrix)

print("Minimum route distance:", min_distance)
print("Optimal route by city indices:", optimal_path)

# Convert indices to city names for readability
city_names = list(cities.keys())
optimal_route_names = [city_names[i] for i in optimal_path]
print("Optimal route:", " -> ".join(optimal_route_names))
```

```text
Minimum route distance: 16.746578547999732
Optimal route by city indices: [0, 2, 1, 3, 4, 0]
Optimal route: A -> C -> B -> D -> E -> A
```

## 24. Why it is faster than brute force: compute once, reuse many times

Brute force treats routes as independent. Even if two routes share the same beginning or the same internal segment, brute force recalculates that segment again.

Held–Karp stores each meaningful subproblem once. A value such as `dp[{A, C, D}][D]` can be reused many times when building larger subsets. This is the central advantage of dynamic programming.

In visual terms:

- Brute force is like a tree: many branches contain repeated parts.
- Dynamic programming is like a directed acyclic graph: repeated parts are merged into one stored block.

![Brute force re-sums the shared prefix; DP computes it once and reuses it.](images/en/08_brute_vs_dp.png)

*Brute force re-sums the shared prefix; DP computes it once and reuses it.*

### Counter: how many times each block is reused

The dynamic-programming table is valuable because one computed block can be used by several later states. For example, a shortest path for a subset of three cities may be reused in several different level-4 candidates.

```text
How many times EACH ready block is used later:

  Level 2:  4 blocks — each computed once, used 3 time(s) in level 3
  Level 3: 12 blocks — each computed once, used 2 time(s) in level 4
  Level 4: 12 blocks — each computed once, used 1 time(s) in level 5
  Level 5:  4 blocks — each computed once, used 1 time(s) in the closing

For example, the block {A, C} → C (= 2.83) is computed ONCE and then plugged into 3 cells of level 3:
   • {A, B, C} → B
   • {A, C, D} → D
   • {A, C, E} → E

Summary (n = 5):
  Held–Karp: 32 subproblems, each computed once; 52 reads of ready blocks in total.
  Brute force: 24 full routes, each summing 5 edges — shared prefixes recomputed every time.
```

![How many times each block is reused, by level.](images/en/09_block_reuse.png)

*How many times each block is reused, by level.*

## 25. Complexity

### Brute force

Brute force checks every permutation of the cities. If the starting city is fixed, it checks $(n - 1)!$ routes. If the start is not fixed, it checks $n!$ permutations. For each route, the algorithm sums about $n$ edges.

- Number of routes: factorial growth.
- Time complexity: usually described as $O(n!)$.
- Memory usage: small if routes are generated lazily.

### Held–Karp

Held–Karp stores states of the form:

```text
(subset of cities, final city)
```

There are approximately $n \cdot 2^n$ such states, and for each state the algorithm may try up to $n$ previous cities. Therefore:

$$ O(n^2 \cdot 2^n) $$

The memory complexity is:

$$ O(n \cdot 2^n) $$

This is still exponential, but it is much better than factorial growth. For example, for $n = 20$: brute force gives $20! \approx 2.4 \times 10^{18}$ candidate routes, while Held–Karp needs only about $20^2 \cdot 2^{20} \approx 4 \times 10^8$ operations — billions of times less.

## 26. Visual result

![Optimal route A → C → B → D → E → A.](images/en/10_optimal_route.png)

*Optimal route A → C → B → D → E → A.*

![Growth of computational work: O(n!) vs O(n²·2ⁿ).](images/en/11_complexity_growth.png)

*Growth of computational work: O(n!) vs O(n²·2ⁿ).*

## 27. Meaning

The Held–Karp algorithm (1962) was the **first exact TSP algorithm substantially faster than naive enumeration**, and it is still the asymptotically fastest known exact method for the general case. Its value:

- it clearly demonstrates the power of dynamic programming — memoization and optimal substructure;
- it returns a **guaranteed optimal** route, unlike heuristics;
- it is practical for small and medium instances — roughly up to 15–20 cities.

This project demonstrates an important algorithmic idea:

> Better algorithms are not always about giving up exactness. Sometimes they are about avoiding repeated work.

Both brute force and Held–Karp find the exact optimal route. The difference is that brute force forgets everything between routes, while Held–Karp remembers subproblem answers and builds larger answers from them.

## 28. Conclusions

- The brute-force method is easy to understand and guarantees the optimal route, but its factorial complexity makes it practical only for very small inputs.
- Held–Karp also gives the exact optimal route, but uses dynamic programming to avoid repeated work.
- Its complexity, $O(n^2 \cdot 2^n)$, is still exponential, but significantly better than $O(n!)$.
- The distance matrix makes repeated distance lookups fast and keeps the algorithm clean.
- `frozenset` is a convenient way to represent subsets as dictionary keys because it is immutable, hashable, and order-independent.
- The example with five cities clearly shows that both methods return the same route: **A → C → B → D → E → A**, length ≈ **16.75**.

