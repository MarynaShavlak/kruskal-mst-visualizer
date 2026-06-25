# Heap Sort: a step-by-step walkthrough

**Heap Sort** is a sorting method built on the **heap** data structure (a «pyramid»). The idea is simple and elegant: first we turn an unordered array into a heap, where the **largest** (or smallest) element always floats to the top; then we repeatedly remove that top and place it at its final position. Unlike quicksort, Heap Sort **guarantees** $O(n \cdot \log n)$ in **every** case and works **in place** (no extra memory).

This walkthrough makes the essentials visual: how **an array is simultaneously a binary tree**, what **sift-down** (heapify) is, how a **heap** emerges from chaos, and how the sorted «tail» of the array **grows from the end**.

## 1. The heap: idea and two flavours

A **heap** is a binary tree with two properties:

1. **Shape completeness.** The tree is filled level by level, left to right (all levels but possibly the last are full). That is exactly why it can be packed densely into an array with no «holes».
2. **The heap property.** In a **max-heap** every **parent ≥ its children** (the maximum is at the top). In a **min-heap** it is the opposite: every **parent ≤ its children** (the minimum is at the top).

Note: a heap is **not** a sorted array. It only guarantees that the **root** is the extremum. Siblings are not ordered among themselves — and that is fine.

To sort **ascending** we build a **max-heap** (largest on top); to sort **descending** — a **min-heap**.

## 2. The array as a binary tree

The key insight: a heap does **not** need to be stored as separate nodes with pointers. A complete tree fits perfectly into an array, level by level. For an element at index `i`:

- the **left child** is at index `2i + 1`;
- the **right child** is at index `2i + 2`;
- the **parent** is at index `(i − 1) // 2`.

So the «tree» is just another way to **read the same array**. Step through below: nodes show indices, and the same array is shown as cells underneath.

![The array as a binary tree: index formulas](docs/images/en/heap_index_map.png)

The last **parent** node has index `n // 2 − 1` — every index after it is a **leaf** (has no children). This is the boundary where building the heap begins.

## 3. Sift-down (heapify)

**Sift-down** (often called `heapify`) is the heart of the algorithm. It «sinks» a node to its rightful place, restoring the heap property inside one subtree:

1. Look at node `i` and its children.
2. Find the **strongest** of the three (for a max-heap — the largest): the parent or one of the children.
3. If the strongest is a **child**, swap it with the parent and **repeat** sift-down from the new position (the swap may have broken the heap below).
4. If the parent is already stronger than both children — everything is in place, stop.

```python {4,6,8}
def heapify(a, n, i):        # sift node i down within a heap of size n
    largest = i
    l, r = 2*i + 1, 2*i + 2
    if l < n and a[l] > a[largest]:   # is the left child larger?
        largest = l
    if r < n and a[r] > a[largest]:   # is the right child larger?
        largest = r
    if largest != i:                  # parent smaller than a child →
        a[i], a[largest] = a[largest], a[i]   # pull the child up
        heapify(a, n, largest)        # keep sifting down
```

A single sift-down does at most **the tree height** swaps, i.e. $O(\log n)$.

## 4. The algorithm: two phases

Heap Sort consists of exactly two phases:

1. **Build the heap.** Turn the whole array into a max-heap.
2. **Sort.** Repeatedly remove the root (the maximum) and place it at the end, shrinking the heap.

```python {3,4,6,7,8}
def heap_sort(a):
    n = len(a)
    for i in range(n // 2 - 1, -1, -1):   # 1) build the max-heap
        heapify(a, n, i)
    for end in range(n - 1, 0, -1):       # 2) sort
        a[0], a[end] = a[end], a[0]       # root → to the end
        heapify(a, end, 0)                # restore a smaller heap
    return a
```

## 5. Phase 1 — building the heap

We start building the heap **not** from the root but from the **last parent** node (`n // 2 − 1`) and move **back to the root**, sifting each node down. Why from the end? Because when we sift a node, its subtrees must already be heaps — and the leaves (the second half of the array) are trivial heaps on their own.

![Building the heap: before and after](docs/images/en/heap_build.png)

Although each sift-down costs up to $O(\log n)$, a careful count shows that the **whole build** is only $O(n)$: most nodes are near the leaves and sift down just 1–2 levels.

## 6. Phase 2 — sorting by extraction

Now the root is guaranteed to be the **largest** element. We sort like this:

1. Swap the root `a[0]` with the **last** element of the heap. The maximum lands at its **final** position at the end.
2. **Remove** that element from the heap (shrink its size by 1) — it is already sorted.
3. Sift the new root down, **restoring** the heap.
4. Repeat until one element remains in the heap.

The sorted region **grows from right to left**, while the heap shrinks each step. When the heap empties, the array is sorted.

## 7. A step-by-step example

Take the array from the notes — `[12, 11, 13, 5, 6, 7]`:

![Initial array [12, 11, 13, 5, 6, 7]](docs/images/en/heap_array_intro.png)

Scrub the whole process: the **heap tree** on top (🔵 the node being sifted, 🟡 the child being compared, 🔴 a swap, 🟣 root extraction, 🟢 sorted), the **code** with the active line on the right, and the same **array** with the «heap ↔ sorted» boundary below:

![Step-by-step Heap Sort](docs/images/en/heap_walk.png)

The result is `[5, 6, 7, 11, 12, 13]` in **14 comparisons** and **10 swaps**.

## 8. Ascending and descending

The sort direction is set by the **heap type**: a max-heap → ascending, a min-heap → descending (in the player this is the «Order» switch). Everything else is the same algorithm; only the comparison sign in `heapify` flips from `>` to `<`.

![Comparing directions on the same array](docs/images/en/order_compare.png)

In the GoIT notes the same result is obtained **without a custom `heapify`** — via the standard `heapq` module (which implements a **min-heap**). A sign trick gives both directions:

```python
import heapq

def heap_sort(iterable, descending=False):
    sign = -1 if descending else 1          # the sign sets the order
    h = [sign * el for el in iterable]
    heapq.heapify(h)                         # build the heap in O(n)
    return [sign * heapq.heappop(h) for _ in range(len(h))]

print(heap_sort([12, 11, 13, 5, 6, 7]))                  # [5, 6, 7, 11, 12, 13]
print(heap_sort([12, 11, 13, 5, 6, 7], descending=True)) # [13, 12, 11, 7, 6, 5]
```

> 💡 `heapq` is handy in practice, but the «teaching» implementation with a hand-written `heapify` shows **what exactly** happens inside the heap. That is the one the player visualises.

## 9. Complexity

The running time comes from two phases:

- **Building the heap** — $O(n)$.
- **Sorting** — we extract the root $n$ times, each restore costs $O(\log n)$, together $O(n \cdot \log n)$.

In total: $O(n + n\log n) = O(n \cdot \log n)$ — in the **best**, the **average** and the **worst** case alike.

![Growth of n·log n vs n²](docs/images/en/growth.png)

Heap Sort is **not adaptive**: on an «already sorted» input it is no faster. Moreover, an ascending array is actually a min-heap, so the max-heap has to be built from scratch (even slightly more work than on a reversed input):

![The same cost on different inputs](docs/images/en/non_adaptive.png)

## 10. Properties of the method

- **In place** — needs only $O(1)$ extra memory (unlike merge sort).
- **Guaranteed** $O(n \cdot \log n)$ — there is no «evil» input that degrades it to $O(n^2)$ (unlike quicksort with a bad pivot).
- **Unstable** — equal keys may change their relative order (far-away swaps in the tree).
- **Not adaptive** — the input order barely affects the cost.

That is why Heap Sort is often chosen when a **worst-case guarantee** and **bounded memory** matter.

## 11. Test yourself: which is a valid heap

Recall both rules: a complete tree shape **and** the «parent ≥ children» property (for a max-heap). Click an option to check:

![Which option is a valid max-heap?](docs/images/en/max_heap_quiz.png)

## 12. Summary

- A heap is a **complete binary tree stored in an array**: the children of `i` are at `2i+1` and `2i+2`.
- **Sift-down** (`heapify`) restores the heap property in $O(\log n)$.
- The algorithm = **build a max-heap** $O(n)$ + **extract the root** $n$ times at $O(\log n)$ each.
- The result — **$O(n \cdot \log n)$ always**, **in place**, but **unstable** and **not adaptive**.

The full code and examples live in the companion repository of Python walkthroughs for the sorting series.
