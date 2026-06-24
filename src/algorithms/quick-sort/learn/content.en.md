# Quick Sort: a step-by-step walkthrough

**Quick Sort** (Hoare's sort) is one of the fastest sorting methods in practice. It works by the **divide-and-conquer** principle: it picks a **pivot** element, splits the array into "smaller than the pivot" and "greater than the pivot", and then **recursively** sorts each part. It is the **first** non-quadratic algorithm in this series of walkthroughs: on average it does $O(n\log n)$ work — a leap from the $O(n^2)$ of the simple sorts (bubble, insertion, selection).

Our implementation (from the lecture notes) splits the array into **three** parts: `left` (elements `< pivot`), `middle` (equal to the pivot) and `right` (elements `> pivot`), then returns `quicksort(left) + middle + quicksort(right)`. This **three-way** split is elegant, visual, and handles duplicates beautifully.

## 1. Intuition: divide and conquer

Imagine a pile of cards with numbers. Instead of slowly swapping neighbors, pick one card as the **pivot** and scatter the rest into two piles: to the left — everything smaller than the pivot, to the right — everything larger. The pivot is now **in its final place**, and the task has shrunk to two smaller ones — order the left pile and the right pile. Each of them we solve **the same way** (recursively), until a pile holds a single element (or is empty) — there is nothing left to sort.

![One partition step: left (< pivot) | middle | right (> pivot)](docs/images/en/partition_idea.png)

This is **divide and conquer**: break the problem into smaller ones, solve each, glue the answers back. One partition step costs a linear pass, but afterwards each half is half the size. If the pivot splits the array in half every time, there are only about $\log_2 n$ levels, each doing $O(n)$ work: $O(n\log n)$ in total.

## 2. The idea: pivot and three-way partition

The algorithm has three steps:

1. **Base case.** If the array has $\le 1$ element, it is already sorted — return it as is. This is the bottom of the recursion.
2. **Pick the pivot.** Take a pivot — in our implementation it is the **middle** element `pivot = arr[len(arr) // 2]`.
3. **Three-way partition + recursion.** In one pass split the array into three lists — `left` (`< pivot`), `middle` (`== pivot`), `right` (`> pivot`) — recursively sort `left` and `right`, then **concatenate**: `quicksort(left) + middle + quicksort(right)`.

`middle` holds **all** elements equal to the pivot (not just the pivot itself), so equal values land in place **immediately** and never take part in the recursion again — that is the strength of the three-way split on [duplicates](#duplicates).

## 3. Why it works: recursion and concatenation

Correctness follows from a simple **induction on length**:

- **Base:** an array of 0 or 1 element is already sorted — return it unchanged.
- **Step:** assume `quicksort` correctly sorts any **shorter** array. Then `quicksort(left)` yields sorted elements, all `< pivot`; `quicksort(right)` — sorted elements, all `> pivot`; `middle` — the elements equal to `pivot`. The concatenation `quicksort(left) + middle + quicksort(right)` puts all the smaller ones first (in order), then the equal ones, then all the larger ones (in order) — i.e. the whole array is sorted.

The recursion is guaranteed to terminate because `left` and `right` are **strictly shorter** than the input (the pivot and everything equal to it went into `middle`), so we eventually reach the base case.

## 4. Example — the array `[3, 5, 2, 4, 6, 1, 7]`

### The example array

We work with an array of 7 elements:

| index | 0 | 1 | 2 | 3 | 4 | 5 | 6 |
|---|---|---|---|---|---|---|---|
| **value** | 3 | 5 | 2 | 4 | 6 | 1 | 7 |

![The array [3, 5, 2, 4, 6, 1, 7] as bars](docs/images/en/array_intro.png)

This array is chosen so that the middle-element pivot lands close to the median every time — then the recursion tree comes out **balanced** and nicely illustrates the best case.

### The base implementation (code from the notes)

Here is the implementation from the notes — the one we dissect line by line (the fully documented version is in [`quick_sort/core.py`](quick_sort/core.py)):

```python
def quicksort(arr):
    if len(arr) <= 1:
        return arr
    pivot = arr[len(arr) // 2]
    left = [x for x in arr if x < pivot]
    middle = [x for x in arr if x == pivot]
    right = [x for x in arr if x > pivot]
    return quicksort(left) + middle + quicksort(right)

print(quicksort([5, 3, 8, 4, 2]))
# Prints: [2, 3, 4, 5, 8]
```

What each line does:

- `if len(arr) <= 1: return arr` — the **base case**: an array of 0 or 1 element is already sorted;
- `pivot = arr[len(arr) // 2]` — the **pivot** element (the one at the middle position);
- `left = [x for x in arr if x < pivot]` — all elements **smaller** than the pivot (they go left);
- `middle = [x for x in arr if x == pivot]` — all elements **equal** to the pivot (they land in place at once);
- `right = [x for x in arr if x > pivot]` — all elements **greater** than the pivot (they go right);
- `return quicksort(left) + middle + quicksort(right)` — recursively sort `left` and `right` and **glue** the result.

The teaching version [`quicksort_steps`](quick_sort/core.py) repeats this logic **step for step**, but builds a **journal / recursion tree**: each call records its subarray, the pivot, the split and the running comparison count — all the pictures below are assembled from that journal.

### How to read the tree: the color language

In the recursion-tree nodes (and everywhere in the walkthrough) the color encodes the **role of an element in the split around the pivot**:

- 🟣 **purple** — the **pivot**;
- 🔵 **blue** — elements **`< pivot`** (they go into `left`, on the left);
- 🟪 **violet** — elements **`== pivot`** (`middle`; duplicates equal to the pivot);
- 🟧 **orange** — elements **`> pivot`** (they go into `right`, on the right);
- 🟢 **green** — an already **sorted/returned** subarray (a single-element base case);
- ⬜ **gray `∅`** — the "No pivot" base case: an **empty** array.

The tree edges are colored too: **blue** edges lead to the `left` branch, **orange** ones to the `right` branch.

### The recursion tree

The central image. The root is the whole array; each call picks a pivot (🟣), splits its subarray into 🔵`<` / 🟪`==` / 🟧`>` and spawns two child calls — on `left` (to the left) and `right` (to the right). The leaves are base cases: 🟢 a single element or ⬜ an empty array.

![Recursion tree of the array [3, 5, 2, 4, 6, 1, 7]](docs/images/en/tree_intro.png)

Because the middle pivot hits the median every time, the tree is **balanced**: depth only 3, and just 13 comparisons. The same trace **by recursion level** (printed by [`examples/01_intro.py`](examples/01_intro.py)):

```text
Level | Call             | Subarray              | Pivot | left      | middle | right
------+------------------+-----------------------+-------+-----------+--------+----------
1     | quicksort(arr)   | [3, 5, 2, 4, 6, 1, 7] | 4     | [3, 2, 1] | [4]    | [5, 6, 7]
2     | quicksort(left)  | [3, 2, 1]             | 2     | [1]       | [2]    | [3]
3     | quicksort(left)  | [1]                   | —     | —         | —      | —
3     | quicksort(right) | [3]                   | —     | —         | —      | —
2     | quicksort(right) | [5, 6, 7]             | 6     | [5]       | [6]    | [7]
3     | quicksort(left)  | [5]                   | —     | —         | —      | —
3     | quicksort(right) | [7]                   | —     | —         | —      | —
```

Base cases (`len ≤ 1`) return at once — their pivot and split are marked `—`. The same tree in **pseudographics** (the `|--` symbol marks a sub-recursion, each level indents to the right):

```text
quicksort([3, 5, 2, 4, 6, 1, 7]) pivot = 4
|-- quicksort([3, 2, 1]) pivot = 2
|   |-- quicksort([1]) pivot = 1
|   |-- quicksort([3]) pivot = 3
|-- quicksort([5, 6, 7]) pivot = 6
    |-- quicksort([5]) pivot = 5
    |-- quicksort([7]) pivot = 7
```

▶️ The same in motion — the tree "grows" in traversal order (pre-order), the way the calls visit it:

![Animation: the recursion tree grows](docs/images/en/tree_grow_intro.gif)

### One node up close: the partition

Let us zoom into the root. The pivot is `pivot = arr[7 // 2] = arr[3] = 4`. In one pass we compare every element with the pivot and place it into one of three groups:

![Partitioning the root: left (< 4) | middle (== 4) | right (> 4)](docs/images/en/partition_intro.png)

`left = [3, 2, 1]` (all `< 4`), `middle = [4]` (equal to the pivot), `right = [5, 6, 7]` (all `> 4`). Then the algorithm recursively sorts `left` and `right`. ▶️ Successive partitions at each non-base call:

![Animation: successive partitions](docs/images/en/partitions_intro.gif)

### Subarrays by level

The same process, but summarized **by recursion level** — you can see how the subarrays shrink at each next level, down to the leaves:

![Subarrays of [3, 5, 2, 4, 6, 1, 7] by recursion level](docs/images/en/levels_intro.png)

### The result: concatenation

Once all recursive calls have returned, the root glues the answer together: `quicksort(left) + middle + quicksort(right)`:

![Concatenation: quicksort(left) + middle + quicksort(right) = the sorted array](docs/images/en/result_intro.png)

The console summary (printed by [`examples/01_intro.py`](examples/01_intro.py)):

```text
Input:  [3, 5, 2, 4, 6, 1, 7]
Output: [1, 2, 3, 4, 5, 6, 7]
Comparisons: 13   Calls: 7   Recursion depth: 3
```

## 5. The recursion tree from the notes `[5, 3, 8, 4, 2]`

Let us walk through the example **from the notes** — the array `[5, 3, 8, 4, 2]`. The trace **by level** (printed by [`examples/05_code_walkthrough.py`](examples/05_code_walkthrough.py)):

```text
Level | Call             | Subarray        | Pivot | left         | middle | right
------+------------------+-----------------+-------+--------------+--------+------
1     | quicksort(arr)   | [5, 3, 8, 4, 2] | 8     | [5, 3, 4, 2] | [8]    | []
2     | quicksort(left)  | [5, 3, 4, 2]    | 4     | [3, 2]       | [4]    | [5]
3     | quicksort(left)  | [3, 2]          | 2     | []           | [2]    | [3]
4     | quicksort(left)  | []              | —     | —            | —      | —
4     | quicksort(right) | [3]             | —     | —            | —      | —
3     | quicksort(right) | [5]             | —     | —            | —      | —
2     | quicksort(right) | []              | —     | —            | —      | —
```

The pseudographic tree **our code** builds (the base case is `len(arr) <= 1`, so single-element subarrays are leaves):

```text
quicksort([5, 3, 8, 4, 2]) pivot = 8
|-- quicksort([5, 3, 4, 2]) pivot = 4
|   |-- quicksort([3, 2]) pivot = 2
|   |   |-- quicksort([]) No pivot (empty array)
|   |   |-- quicksort([3]) pivot = 3
|   |-- quicksort([5]) pivot = 5
|-- quicksort([]) No pivot (empty array)
```

> **A note.** In the notes themselves the tree is drawn as if even single-element subarrays had two empty `quicksort([])` calls underneath. That is just a way to draw the tree "all the way down": in the code the base case is `len(arr) <= 1`, so the call `quicksort([3])` returns **immediately**, spawning no children. For full fidelity to the notes, the same example also prints the "textbook" variant with the empty branches drawn in:

```text
quicksort([5, 3, 8, 4, 2]) pivot = 8
|-- quicksort([5, 3, 4, 2]) pivot = 4
|   |-- quicksort([3, 2]) pivot = 2
|   |   |-- quicksort([]) No pivot (empty array)
|   |   |-- quicksort([3]) pivot = 3
|   |       |-- quicksort([]) No pivot (empty array)
|   |       |-- quicksort([]) No pivot (empty array)
|   |-- quicksort([5]) pivot = 5
|       |-- quicksort([]) No pivot (empty array)
|       |-- quicksort([]) No pivot (empty array)
|-- quicksort([]) No pivot (empty array)
```

Concatenating the results of all the calls gives `[2, 3, 4, 5, 8]` — exactly as in the notes.

## 6. Pivot choice and complexity: balanced vs. degenerate tree

**The shape of the recursion tree — and therefore the complexity — is entirely determined by the pivot choice.** Let us show this on the **same** already sorted array `[1, 2, 3, 4, 5, 6, 7]`, changing only the pivot strategy (printed by [`examples/02_pivot_and_cases.py`](examples/02_pivot_and_cases.py)):

```text
Pivot choice on the already sorted array [1, 2, 3, 4, 5, 6, 7]
  middle pivot: 13 comparisons, 7 calls, depth 3 → balanced tree, O(n·log n)
  first pivot:  27 comparisons, 13 calls, depth 7 → degenerate tree, O(n²)
A bad pivot costs 14 extra comparisons, and the recursion depth grows from 3 to 7.
```

**The middle pivot on a sorted input — the best case.** The middle element of a sorted array is its **median**, so the array splits exactly in half every time. The tree is balanced, depth $\approx \log_2 n$:

![Balanced tree: middle pivot, O(n·log n)](docs/images/en/tree_balanced.png)

**The first pivot on a sorted input — the worst case.** The first element of a sorted array is its **minimum**: `left` is empty every time, and `right` is just one shorter. The tree degenerates into a **chain** of depth $n$, and the work is $1 + 2 + \dots + n \approx n^2/2$:

![Degenerate tree: first pivot, O(n²)](docs/images/en/tree_degenerate.png)

This is what the complexity analysis rests on: a balanced tree gives $O(n\log n)$, a degenerate one $O(n^2)$. Let us compare the growth:

![Plot: n·log n vs. n²](docs/images/en/growth.png)

### How to avoid the worst case

The worst case happens when the pivot turns out to be (close to) the minimum or maximum every time. The classic remedies:

- **The middle pivot** (as in our code) already saves you from the most common trap — a sorted or nearly sorted input;
- **Median of three** (`median3`): the pivot is the median of the first, middle and last elements. Cheap and good against ordered data;
- **Random pivot** (`random`): makes the worst case practically impossible for any fixed input (an adversary can't guess it);
- **Introsort**: watches the recursion depth and, if it grows too large (a sign of degeneration), switches to an $O(n\log n)$ heap sort. This is exactly what production implementations do.

All of these strategies are supported by [`quicksort_inplace`](quick_sort/core.py) (the `pivot` parameter).

## 7. Duplicates and the three-way partition

The three-way partition is especially handy when the array has **many equal** elements. All those equal to the pivot settle into `middle` in **a single step** and are never sorted again. Take "tagged" duplicates, where the subscript shows the original position of a copy (printed by [`examples/03_duplicates.py`](examples/03_duplicates.py)):

```text
Many duplicates: [4₁, 2₁, 4₂, 4₃, 1₁, 4₄, 3₁]
Root: pivot 4₃ → middle = [4₁, 4₂, 4₃, 4₄] (all 4 elements equal to the pivot settle at once).
Recursion handles only 3 smaller elements; 7 calls in total, depth 4.
```

![The array with duplicates](docs/images/en/array_duplicates.png)

At the root the pivot is `4`, so **all four fours** go into `middle` (🟪) at once, and the recursion only deals with three smaller elements:

![Tree: all pivot duplicates go to middle at once](docs/images/en/tree_duplicates.png)

**Why is this better than a two-way split?** A classic two-way quicksort puts elements equal to the pivot into one of the halves — and then an array of many equal values (say `[7, 7, 7, …, 7]`) splits very unevenly, sliding towards $O(n^2)$. The three-way split (also tied to the *Dutch national flag* problem — named for its three colored stripes) gathers everything equal to the pivot into the middle "stripe" at once, so a large number of duplicates actually **speeds up** the sort. The concatenated result:

![Result: concatenation on the array with duplicates](docs/images/en/result_duplicates.png)

## 8. Stability: three-way version vs. in-place

A sort is **stable** if it preserves the relative order of elements with **equal keys**. Let us check both of our implementations on the tagged duplicates (printed by [`examples/03_duplicates.py`](examples/03_duplicates.py)):

```text
Stability (equal keys — is their order preserved?):
  input:                            [4₁, 2₁, 4₂, 4₃, 1₁, 4₄, 3₁]
  three-way (list comprehensions):  [1₁, 2₁, 3₁, 4₁, 4₂, 4₃, 4₄]   ✓ stable
  classic in-place (Lomuto):        [1₁, 2₁, 3₁, 4₃, 4₄, 4₂, 4₁]   ✗ unstable
```

![Stability: three-way (✓) vs. classic in-place (✗)](docs/images/en/stability_duplicates.png)

- **The three-way version (list comprehensions) is stable.** Each list (`left`, `middle`, `right`) is built by a comprehension that **preserves the order** of the original array; values equal to the pivot land in `middle` in their original order and are never rearranged again. So the fours come out as `4₁, 4₂, 4₃, 4₄`.
- **The classic in-place version (Lomuto partition) is NOT stable.** Partitioning in place makes swaps "across the whole array" that can "leapfrog" an equal key: the fours come out reordered (`4₃, 4₄, 4₂, 4₁`). This is the **expected** property of classic in-place quicksort — we do not promise stability where there is none.

> **The honest takeaway.** The version from the notes (three-way, on list comprehensions) is **stable**, but works **out of place** — it needs $O(n)$ extra memory for the new lists. Classic in-place quicksort is cheaper on memory but **unstable**. That is the main trade-off between the two implementations.

## 9. The second implementation: classic in-place quicksort

The version from the notes is visual, but it creates new lists at every level — that is $O(n)$ extra memory. **Classic** quicksort sorts **in place**, rearranging elements within the array itself with two indices (**Lomuto partition**):

```python
def quicksort_inplace(arr, lo=0, hi=None):
    if hi is None:
        hi = len(arr) - 1
    if lo < hi:
        p = partition(arr, lo, hi)         # the pivot lands at its final place p
        quicksort_inplace(arr, lo, p - 1)  # sort the left part…
        quicksort_inplace(arr, p + 1, hi)  # …and the right one
    return arr

def partition(arr, lo, hi):
    pivot = arr[hi]                        # the pivot is the last element of the slice
    i = lo                                 # boundary of "smaller than the pivot"
    for j in range(lo, hi):
        if arr[j] < pivot:
            arr[i], arr[j] = arr[j], arr[i]
            i += 1
    arr[i], arr[hi] = arr[hi], arr[i]      # the pivot goes to position i
    return i
```

The full version in [`quick_sort/core.py`](quick_sort/core.py) also takes a pivot strategy (`'middle'` by default, `'first'`, `'last'`, `'median3'`, `'random'`) — that is exactly what we used to draw the [balanced and degenerate trees](#pivot-cases).

**The trade-off between the two implementations:**

| | Three-way (from the notes) | Classic in-place (Lomuto) |
|---|---|---|
| **Memory** | $O(n)$ (new lists) | $O(\log n)$ stack on average |
| **Stability** | ✅ stable | ❌ unstable |
| **Duplicates** | ✅ gathered into `middle` at once | ⚠️ may degenerate the split |
| **Clarity** | ✅ very visual | a bit trickier (indices, swaps) |

In practice the in-place variant is the one used (it is cache-friendly and fast), reinforced with a guard against the worst case (median-of-three / randomization / introsort).

## 10. Stepping through the code: code ↔ data panels

The examples above showed the *result* of each call. Here is **the code in action**: on the left a fragment of the algorithm with **highlighted active lines**, on the right the data of the current call. The line color encodes the step: 🟡 choosing the pivot, 🔵/🟪/🟧 the three list comprehensions (`left`/`middle`/`right`), 🟢 the return-concatenation, ⬜ the base case.

We build this for the array from the notes `[5, 3, 8, 4, 2]` (generated by [`examples/05_code_walkthrough.py`](examples/05_code_walkthrough.py)). Each grid row is one call of the recursion tree:

![Code ↔ data: the array [5, 3, 8, 4, 2]](docs/images/en/code_steps_conspect.png)

▶️ The animated version — between calls it inserts the intermediate frames "choose pivot → partition → return":

![Animation: code ↔ data](docs/images/en/code_walk_conspect.gif)

## 11. Full step-by-step trace of `[3, 5, 2, 4, 6, 1, 7]`

Below is the same execution, but **in full**: every recursive call (in execution order, pre-order) as a separate code ↔ data frame with a detailed explanation under each. The colors are the same as in the [legend above](#how-to-read). The block is generated automatically from the event journal (the example [`examples/06_full_walkthrough.py`](examples/06_full_walkthrough.py)).

#### Step 00

![Level 1: quicksort(arr) = [3, 5, 2, 4, 6, 1, 7]](docs/images/en/walkthrough/step_00.png)

**Level 1**, call `quicksort(arr)` on the subarray `[3, 5, 2, 4, 6, 1, 7]` (length 7 > 1, so not a base case). The pivot is the middle element: `pivot = arr[7 // 2] = arr[3] = 4`. In one pass we split the subarray around the pivot: `left = [3, 2, 1]` (elements `< 4`, blue), `middle = [4]` (equal to `4`, violet), `right = [5, 6, 7]` (elements `> 4`, orange). Then we recursively sort `left` and `right` and return `quicksort(left) + middle + quicksort(right)`.

#### Step 01

![Level 2: quicksort(left) = [3, 2, 1]](docs/images/en/walkthrough/step_01.png)

**Level 2**, call `quicksort(left)` on the subarray `[3, 2, 1]` (length 3 > 1, so not a base case). The pivot is the middle element: `pivot = arr[3 // 2] = arr[1] = 2`. In one pass we split the subarray around the pivot: `left = [1]` (elements `< 2`, blue), `middle = [2]` (equal to `2`, violet), `right = [3]` (elements `> 2`, orange). Then we recursively sort `left` and `right` and return `quicksort(left) + middle + quicksort(right)`.

#### Step 02

![Level 3: quicksort(left) = [1]](docs/images/en/walkthrough/step_02.png)

**Level 3**, call `quicksort(left)` on the single-element subarray `[1]` (length 1 ≤ 1). This is a base case: one element is already sorted, we return `[1]` right away (green).

#### Step 03

![Level 3: quicksort(right) = [3]](docs/images/en/walkthrough/step_03.png)

**Level 3**, call `quicksort(right)` on the single-element subarray `[3]` (length 1 ≤ 1). This is a base case: one element is already sorted, we return `[3]` right away (green).

#### Step 04

![Level 2: quicksort(right) = [5, 6, 7]](docs/images/en/walkthrough/step_04.png)

**Level 2**, call `quicksort(right)` on the subarray `[5, 6, 7]` (length 3 > 1, so not a base case). The pivot is the middle element: `pivot = arr[3 // 2] = arr[1] = 6`. In one pass we split the subarray around the pivot: `left = [5]` (elements `< 6`, blue), `middle = [6]` (equal to `6`, violet), `right = [7]` (elements `> 6`, orange). Then we recursively sort `left` and `right` and return `quicksort(left) + middle + quicksort(right)`.

#### Step 05

![Level 3: quicksort(left) = [5]](docs/images/en/walkthrough/step_05.png)

**Level 3**, call `quicksort(left)` on the single-element subarray `[5]` (length 1 ≤ 1). This is a base case: one element is already sorted, we return `[5]` right away (green).

#### Step 06

![Level 3: quicksort(right) = [7]](docs/images/en/walkthrough/step_06.png)

**Level 3**, call `quicksort(right)` on the single-element subarray `[7]` (length 1 ≤ 1). This is a base case: one element is already sorted, we return `[7]` right away (green).

## 12. Complexity and properties

How much work quick sort does depends on how well the pivot is chosen:

| Case | Time | When it happens |
|---|---|---|
| **Best** | $O(n\log n)$ | the pivot splits the array in half every time (the median) |
| **Average** | $O(n\log n)$ | random order — on average the splits are balanced enough |
| **Worst** | $O(n^2)$ | the pivot is (close to) the min/max every time — e.g. a sorted input with the first/last pivot |

Other properties:

- **Memory:** the classic in-place version is $O(\log n)$ on average (the recursion stack depth); the version from the notes is $O(n)$ (new lists at every level).
- **Stability:** the three-way version from the notes is **stable**; the classic in-place one is **not**.
- **Divide and conquer:** the first algorithm in this series that achieves $O(n\log n)$ instead of $O(n^2)$.

Let us compare the growth of the comparison count in the balanced ($\approx n\log_2 n$) and degenerate ($\approx n^2/2$) cases:

| `n` | $n\log_2 n$ (balanced) | $n^2/2$ (degenerate) | How many times worse |
|---|---|---|---|
| 10 | ≈ 33 | 50 | ~1.5× |
| 100 | ≈ 664 | 5,000 | ~7× |
| 1,000 | ≈ 9,966 | 500,000 | ~50× |
| 10,000 | ≈ 132,877 | ≈ 50,000,000 | ~375× |
| 1,000,000 | ≈ 2·10⁷ | ≈ 5·10¹¹ | ~25,000× |

That is why the pivot choice is **no trifle**: it separates one of the fastest algorithms from a quadratic one.

## 13. Limitations

- **Worst case $O(n^2)$.** On a bad (or adversarially chosen) pivot the tree degenerates into a chain. Mitigated by randomization / median-of-three / introsort.
- **The classic version is unstable.** In-place quicksort rearranges equal keys. If you need stability — use merge sort or Timsort.
- **Recursion depth.** On a degenerate input the depth reaches $n$ — a stack-overflow risk. Mitigated by recursing into the **smaller** part (and looping over the larger one) and by introsort.

| Algorithm | Time (worst) | Memory | Stable | Note |
|---|---|---|---|---|
| Bubble | $O(n^2)$ | $O(1)$ | yes | simplest; early exit |
| Insertion | $O(n^2)$ | $O(1)$ | yes | fast on nearly sorted |
| Selection | $O(n^2)$ | $O(1)$ | no | minimum number of swaps |
| **Quick sort** | $O(n^2)$ | $O(\log n)$ | no | $O(n\log n)$ on average, **fastest in practice** |
| Merge sort | $O(n\log n)$ | $O(n)$ | yes | guaranteed $O(n\log n)$ (also divide-and-conquer) |
| Timsort (Python `sorted`) | $O(n\log n)$ | $O(n)$ | yes | a hybrid of insertion and merge — the real-world standard |

> **A bridge to merge sort.** Quicksort and merge sort are both divide-and-conquer, but they divide differently: quicksort does a **hard split** (partitioning around a pivot) and a **trivial combine** (concatenation), while merge sort is the opposite — a **trivial split** (in half) and a **hard combine** (merging two sorted halves). That is why merge sort **guarantees** $O(n\log n)$ even in the worst case (the split is always even), but pays $O(n)$ memory; quicksort risks $O(n^2)$ but sorts in place and is cache-friendly.

## 14. Where it fits

Despite the $O(n^2)$ worst case, quick sort is **one of the most used** algorithms in practice: it sorts in place, is cache-friendly, and on average the fastest among comparison sorts. So it sits at the core of standard libraries:

- **Introsort** — `std::sort` in C++: quicksort with a guard (it switches to heap sort on degeneration);
- **`qsort`** in the C standard library;
- countless implementations in systems and application code where a fast in-place sort is needed without a stability requirement.

When **stability** or a **guaranteed** $O(n\log n)$ is required — use merge sort or Timsort (`sorted()` / `list.sort()` in Python).

## 15. Summary

- **Quick sort** works by **divide and conquer**: it picks a pivot, splits the array into 🔵`< pivot` / 🟪`== pivot` / 🟧`> pivot`, **recursively** sorts the smaller parts and **concatenates** the result.
- **The central image is the recursion tree**: the shape of the tree determines the complexity. A balanced tree → $O(n\log n)$ (average/best case), a degenerate one (a chain) → $O(n^2)$ (worst case).
- **The pivot choice is the key decision.** The middle pivot on a sorted input gives perfect balance (the median!), while the first/last pivot gives a degenerate tree. Randomization / median-of-three / introsort make the worst case practically impossible.
- **The three-way split** gathers everything equal to the pivot into `middle` at once — a large number of duplicates actually speeds up the sort (the Dutch-national-flag motivation).
- **Two implementations, one trade-off:** the three-way one from the notes is stable but $O(n)$ memory; the classic in-place one is $O(\log n)$ memory but unstable.
- This is the **first non-quadratic** algorithm of the series — a vivid bridge from the simple $O(n^2)$ sorts to $O(n\log n)$ and to the related **merge sort**.

