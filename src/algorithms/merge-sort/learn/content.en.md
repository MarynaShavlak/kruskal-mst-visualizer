# Merge Sort: a step-by-step walkthrough

**Merge sort** is a classic efficient method built on the **divide and conquer** principle (proposed by John von Neumann back in 1945). The idea is simple: **split** the array in half, sort each half separately (recursively — by the same method), and then **merge** the two already-sorted halves into one sorted array. The splitting continues until single elements remain (those are already sorted), after which the halves are merged back together from the bottom up.

Unlike the simple $O(n^2)$ sorts and even quicksort, merge sort delivers a **guaranteed** $O(n\log n)$ in **every case** — best, average and worst: there is no input that "breaks" it. It is **stable** and a perfect fit for external sorting, linked lists and parallelism. The price for these guarantees is $O(n)$ extra memory (the method is **not in-place**). Together with insertion sort, merge sort is exactly what powers **TimSort** — the standard `sorted()` / `list.sort()` in Python.

## 1. Intuition: divide and conquer

Picture the array as a row of **cells** with values. Merge sort does not compare all pairs in a row — it **splits the task in half**: to sort the array it suffices to sort its two halves and then **merge** them. Merging two **already sorted** lists is easy and fast — walk them simultaneously and always take the smaller of the two "front" elements:

![Divide and conquer: split in half, then merge the sorted halves](docs/images/en/idea_intro.png)

Each half is sorted the same way — split in half again — until **single elements** remain: a one-element list is already sorted. Then the way back begins: the halves are **merged from the bottom up** into ever-larger sorted runs until the whole sorted array is formed. One such merge of two halves, step by step, looks like this:

![A walkthrough of one merge operation with two pointers](docs/images/en/idea_merge_steps.png)

## 2. The idea: split in half and merge

The algorithm consists of two functions:

1. **`merge_sort`** splits the array in half **by position** (`mid = len(arr) // 2`), recursively sorts both halves and returns the result of merging them. The base case is a list of ≤ 1 element: it is already sorted.
2. **`merge`** merges two sorted halves with two pointers: it compares their "heads", appends the smaller one to the result and advances the matching pointer; once one list is exhausted, it "drains" the rest of the other.

The key difference from quicksort (also divide and conquer): quicksort does its work **before** the recursion (it partitions around a pivot), while merge sort does it **after** the recursion (it merges two sorted halves). So the main work here is in the **merge** phase.

## 3. Why the tree is always balanced

Because the split is **strictly in half by position** (not by a pivot value, as in quicksort), the left and right halves always differ by at most one element. Therefore the **recursion tree is always balanced**, and its depth is exactly $\lceil\log_2 n\rceil$ for **any** input.

Hence the main advantage: at each of the $\log n$ levels, merging processes $n$ elements in total, so altogether it is $O(n\log n)$ — **guaranteed, regardless of the input order**. In quicksort a bad pivot choice can make the tree degenerate (depth $n$) and give $O(n^2)$; in merge sort such a case **simply does not exist**.

## 4. Example — the array `[8, 4, 6, 2, 7, 1, 5, 3]`

We work with an array of 8 elements (a power of two — the split tree comes out perfectly balanced, depth 3).

### The base implementation

Here is the base implementation — the one we walk through line by line:

```python
def merge_sort(arr):
    if len(arr) <= 1:
        return arr

    mid = len(arr) // 2
    left_half = arr[:mid]
    right_half = arr[mid:]

    return merge(merge_sort(left_half), merge_sort(right_half))

def merge(left, right):
    merged = []
    left_index = 0
    right_index = 0

    # First combine the smaller elements
    while left_index < len(left) and right_index < len(right):
        if left[left_index] <= right[right_index]:
            merged.append(left[left_index])
            left_index += 1
        else:
            merged.append(right[right_index])
            right_index += 1

    # If elements remain in the left or right half,
    # append them to the result
    while left_index < len(left):
        merged.append(left[left_index])
        left_index += 1

    while right_index < len(right):
        merged.append(right[right_index])
        right_index += 1

    return merged

print(merge_sort([5, 3, 8, 4, 2]))   # [2, 3, 4, 5, 8]
```

What is what:

- `if len(arr) <= 1: return arr` — the **base case**: a list of 0 or 1 element is already sorted;
- `mid = len(arr) // 2` — the midpoint: we split **strictly in half by position**;
- `left_half = arr[:mid]`, `right_half = arr[mid:]` — the two halves;
- `return merge(merge_sort(left_half), merge_sort(right_half))` — recursively sort both halves and **merge** the results;
- inside `merge`, the first `while` compares the "heads" of the two lists and appends the smaller into `merged` (on a tie — the one from the **left** half, which makes the sort stable), while the next two `while` loops "drain" the leftover of whichever list did not run out.

The instrumented version `merge_sort_steps` replays this code **step for step**, but builds a **journal/tree** of split and merge events together with counters of comparisons, appends and depth — and all the pictures below are assembled from those events.

### How to read the frames

- 🔵 **blue cells** — elements of the **left** half (`left`);
- 🟧 **orange cells** — elements of the **right** half (`right`);
- 🟡 **amber cell** — the current smaller "head" being appended to `merged` (it also appears last in the result);
- 🟢 **green cells** — the sorted / already merged result;
- ⬜ **slate cells** — the base case (a single element) or an already-consumed element of a half;
- ▲ **cursors** under the cells — the `left_index` / `right_index` pointers.

### The recursion tree and the trace

First `merge_sort` recursively splits the array in half (the **divide** phase, going down), and then merges the sorted halves (the **merge** phase, going up). All together it is the **recursion tree**. The split is always strictly in half, so the tree is perfectly balanced:

![The recursion tree of [8, 4, 6, 2, 7, 1, 5, 3]](docs/images/en/tree_intro.png)

The same thing as a step-by-step trace — the recursion level, the function, the subarray, `mid` and the two halves. The `merge_sort` rows go top-down (the split), the `merge` rows go bottom-up (the merge), in actual execution order:

```text
Level  Function    arr                       mid  left_half     right_half
-----  ----------  ------------------------  ---  ------------  ------------
1      merge_sort  [8, 4, 6, 2, 7, 1, 5, 3]  4    [8, 4, 6, 2]  [7, 1, 5, 3]
2      merge_sort  [8, 4, 6, 2]              2    [8, 4]        [6, 2]
3      merge_sort  [8, 4]                    1    [8]           [4]
4      merge_sort  [8]                       -    -             -
4      merge_sort  [4]                       -    -             -
3      merge       -                         -    [8]           [4]
3      merge_sort  [6, 2]                    1    [6]           [2]
4      merge_sort  [6]                       -    -             -
4      merge_sort  [2]                       -    -             -
3      merge       -                         -    [6]           [2]
2      merge       -                         -    [4, 8]        [2, 6]
2      merge_sort  [7, 1, 5, 3]              2    [7, 1]        [5, 3]
3      merge_sort  [7, 1]                    1    [7]           [1]
4      merge_sort  [7]                       -    -             -
4      merge_sort  [1]                       -    -             -
3      merge       -                         -    [7]           [1]
3      merge_sort  [5, 3]                    1    [5]           [3]
4      merge_sort  [5]                       -    -             -
4      merge_sort  [3]                       -    -             -
3      merge       -                         -    [5]           [3]
2      merge       -                         -    [1, 7]        [3, 5]
1      merge       -                         -    [2, 4, 6, 8]  [1, 3, 5, 7]
```

And here is just the merge phase — the order in which the sorted halves are merged (bottom-up):

```text
merge([8], [4])                    →  [4, 8]
merge([6], [2])                    →  [2, 6]
merge([4, 8], [2, 6])              →  [2, 4, 6, 8]
merge([7], [1])                    →  [1, 7]
merge([5], [3])                    →  [3, 5]
merge([1, 7], [3, 5])              →  [1, 3, 5, 7]
merge([2, 4, 6, 8], [1, 3, 5, 7])  →  [1, 2, 3, 4, 5, 6, 7, 8]
```

▶️ The same in motion — the tree first unfolds downward (the split), then merges upward (the green results appear from the bottom up):

![Animation: the tree unfolds down and merges up](docs/images/en/recursion_intro.gif)

### Subarrays by level

The same split, but by recursion level: level 1 is the whole array, level 2 is two halves, level 3 is four, level 4 is single elements (the base case, 🟢). You can see that the split is **always strictly in half**:

![Subarrays by recursion level](docs/images/en/levels_intro.png)

### The star operation: merging with two pointers

All of merge sort's work is in the **merge** phase (`merge`), **after** the recursion. This is the star mechanic of the method, so let's look at it on its own. We merge two sorted halves from the top level — `[2, 4, 6, 8]` and `[1, 3, 5, 7]`: the cursors `left_index` / `right_index` sit on the "heads" of the halves, we compare the heads and take the **smaller** element into `merged`, then advance the matching cursor. Once one list is exhausted, we "drain" the rest of the other:

![Merging two sorted halves step by step](docs/images/en/merge_root_intro.png)

▶️ A standalone animation of one `merge` operation (here on the smaller halves `[3, 5]` and `[2, 4, 8]`): the pointers, the head comparisons, taking the smaller, and draining the leftover:

![Animation: one merge operation](docs/images/en/merge_step.gif)

### The result

![The sorted array [1, 2, 3, 4, 5, 6, 7, 8]](docs/images/en/result_intro.png)

The console summary:

```text
Input:  [8, 4, 6, 2, 7, 1, 5, 3]
Output: [1, 2, 3, 4, 5, 6, 7, 8]
Comparisons: 17   Appends: 24   Merges: 7   Depth: 3
```

For $n = 8$ elements the tree has depth $\log_2 8 = 3$, there are $n-1 = 7$ merges, and the total number of "appends" into `merged` is $n\log_2 n = 24$ (each of the 3 levels moves all 8 elements).

## 5. The $O(n\log n)$ guarantee with no degeneration

The most important property of merge sort is the **guaranteed** $O(n\log n)$ in **all** cases. Let's look more closely at the merge operation itself and compare the growth with quicksort:

![A walkthrough of one merge operation with two pointers](docs/images/en/merge_step_grid.png)

```text
A single merge operation: [3, 5] + [2, 4, 8]
Merging [3, 5] + [2, 4, 8] = [2, 3, 4, 5, 8] (4 comparisons)
```

Why does the complexity never degenerate? The **tree is always balanced** (the split is strictly in half), so the depth is always $\log_2 n$ and each level merges $n$ elements. Plug in different inputs of the same size $n = 8$:

| Input | Depth | Merges | Appends | Comparisons |
|---|---|---|---|---|
| `[8, 4, 6, 2, 7, 1, 5, 3]` (random) | 3 | 7 | 24 | 17 |
| `[1, 2, 3, 4, 5, 6, 7, 8]` (sorted) | 3 | 7 | 24 | 12 |
| `[8, 7, 6, 5, 4, 3, 2, 1]` (reversed) | 3 | 7 | 24 | 12 |

The depth, the number of merges and the number of appends are **the same** for any order — the structure of the work does not depend on the data. There are even slightly fewer comparisons in the sorted/reversed case (one half "wins" first each time), but it is nowhere near $O(n^2)$:

![Chart: guaranteed n·log n vs. n²](docs/images/en/growth.png)

The blue band is merge sort: it always sits between the best ($\approx \tfrac12 n\log_2 n$) and worst ($\approx n\log_2 n$) cases. The red curve is the worst case of quicksort ($\approx n^2/2$): **that is exactly what does not happen in merge sort**. This is the key contrast: quicksort is faster on average in practice, but it **can** degenerate to $O(n^2)$; merge sort — **never**.

## 6. Stability: an array with duplicates

A sort is **stable** if it preserves the relative order of elements with **equal keys**. Merge sort is stable thanks to the **non-strict** comparison `left[left_index] <= right[right_index]`: when the heads of the halves are equal, we take the element from the **left** half first, so elements that came earlier stay earlier.

To see it, take "tagged" duplicates — each copy of a value carries a subscript showing its original spot (`3₁`, `3₂`, `3₃`):

```text
Stability on an array with duplicates
Input (labels show the original order of equal keys): [3₁, 1₁, 3₂, 2₁, 1₂, 3₃]
Output (equal keys kept their original order): [1₁, 1₂, 2₁, 3₁, 3₂, 3₃]
Stable ✓: among equal keys the order of labels is unchanged.
```

It is best seen in the top-level merge: when the heads of both halves have an equal key, the **left** one wins (by `<=`), so `3₁` comes before `3₂`, and `3₂` before `3₃`:

![The root-level merge: equal keys come from the left half first](docs/images/en/merge_duplicates.png)

![The sorted array: equal keys in their original order](docs/images/en/result_duplicates.png)

Stability matters when elements carry extra data (sorting records by one field without destroying a previous ordering by another). That is exactly why a stable merge sort is the foundation of industrial sorts. The recursion tree for this example is [`docs/images/en/tree_duplicates.png`](docs/images/en/tree_duplicates.png).

## 7. Top-down vs. bottom-up → the bridge to TimSort

The version above is **top-down recursive**: it splits the array from the top down and merges on the way back up the recursion. The same algorithm can be written **without recursion** — the **bottom-up** way: treat each element as a sorted "run" of length 1 and merge adjacent runs into runs of length 2, then 4, 8, … until one run covers the whole array:

```python
def merge_sort_bottom_up(arr):
    a = list(arr)
    n = len(a)
    width = 1
    while width < n:
        for lo in range(0, n, 2 * width):
            mid = min(lo + width, n)
            hi = min(lo + 2 * width, n)
            a[lo:hi] = merge(a[lo:mid], a[mid:hi])
        width *= 2
    return a
```

On power-of-two sizes the block layout coincides with the top-down split in half, so the **result and the number of comparisons are identical** (for our array — the same 17 comparisons). The bottom-up version removes the recursion overhead and, most importantly, is a **direct bridge to TimSort**: it too merges sorted runs from the bottom up — it just first finds (and, if needed, extends with insertion sort) the natural sorted runs in the input.

## 8. Step-by-step code execution: code ↔ data panels

The examples above showed the *result* of each step. Here is **the code itself in action**: on the left a fragment of the algorithm with the **active lines highlighted**, on the right the data at that very moment. **The color of a code line encodes what happens:** 🟡 the line running now; 🔵/🟧 the split into `left_half` / `right_half`; 🟡 appending the smaller element into `merged`; 🟢 returning the sorted list. During the split, the right side shows a row of subarray cells; during the merge — the **star panel** of two pointers.

We build this for the example array `[5, 3, 8, 4, 2]` (its line-by-line trace matches the walkthrough above). The tree trace for this array:

```text
Level  Function    arr              mid  left_half  right_half
-----  ----------  ---------------  ---  ---------  ----------
1      merge_sort  [5, 3, 8, 4, 2]  2    [5, 3]     [8, 4, 2]
2      merge_sort  [5, 3]           1    [5]        [3]
3      merge_sort  [5]              -    -          -
3      merge_sort  [3]              -    -          -
2      merge       -                -    [5]        [3]
2      merge_sort  [8, 4, 2]        1    [8]        [4, 2]
3      merge_sort  [8]              -    -          -
3      merge_sort  [4, 2]           1    [4]        [2]
4      merge_sort  [4]              -    -          -
4      merge_sort  [2]              -    -          -
3      merge       -                -    [4]        [2]
2      merge       -                -    [8]        [2, 4]
1      merge       -                -    [3, 5]     [2, 4, 8]
```

```text
merge([5], [3])           →  [3, 5]
merge([4], [2])           →  [2, 4]
merge([8], [2, 4])        →  [2, 4, 8]
merge([3, 5], [2, 4, 8])  →  [2, 3, 4, 5, 8]
```

The static grid — splits, base cases and one completed merge per node:

![Code ↔ data: the array [5, 3, 8, 4, 2]](docs/images/en/code_steps_conspect.png)

▶️ The animated version — with a frame for every append into `merged`:

![Animation: code ↔ data](docs/images/en/code_walk_conspect.gif)

## 9. Full step-by-step trace of `[8, 4, 6, 2, 7, 1, 5, 3]`

Below is the same execution, but **in full**: every node split, every base case and every completed merge as a separate code ↔ data frame, in the right order (splits top-down, merges bottom-up), with a detailed explanation under each. The colors are the same as in the [legend above](#how-to-read). The block is generated automatically from the event journal.

#### Step 00

![Start: the array as given](docs/images/en/walkthrough/step_00.png)

The initial array `[8, 4, 6, 2, 7, 1, 5, 3]`. All cells are slate — the array is not ordered yet. Merge sort first splits it in half recursively, and only then **merges** the sorted halves back. The `def merge_sort(arr)` header is highlighted in the code.

#### Step 01

![Split: level 1, mid = 4](docs/images/en/walkthrough/step_01.png)

A split at level 1. The call `merge_sort([8, 4, 6, 2, 7, 1, 5, 3])`: `mid = len(arr) // 2 = 4`, so the array is split in half by position into `left_half = [8, 4, 6, 2]` (🔵 blue) and `right_half = [7, 1, 5, 3]` (🟧 orange). This is the **divide** phase — no work is done here yet, we only go deeper. The `mid`, `left_half`, `right_half` lines are highlighted.

#### Step 02

![Split: level 2, mid = 2](docs/images/en/walkthrough/step_02.png)

A split at level 2. The call `merge_sort([8, 4, 6, 2])`: `mid = len(arr) // 2 = 2`, so the array is split in half by position into `left_half = [8, 4]` (🔵 blue) and `right_half = [6, 2]` (🟧 orange). This is the **divide** phase — no work is done here yet, we only go deeper. The `mid`, `left_half`, `right_half` lines are highlighted.

#### Step 03

![Split: level 3, mid = 1](docs/images/en/walkthrough/step_03.png)

A split at level 3. The call `merge_sort([8, 4])`: `mid = len(arr) // 2 = 1`, so the array is split in half by position into `left_half = [8]` (🔵 blue) and `right_half = [4]` (🟧 orange). This is the **divide** phase — no work is done here yet, we only go deeper. The `mid`, `left_half`, `right_half` lines are highlighted.

#### Step 04

![Base case: level 4](docs/images/en/walkthrough/step_04.png)

A base case at level 4. The subarray `[8]` has ≤ 1 element, so it is **already sorted** — `merge_sort` returns it unchanged (no deeper recursion). `if len(arr) <= 1: return arr` is highlighted.

#### Step 05

![Base case: level 4](docs/images/en/walkthrough/step_05.png)

A base case at level 4. The subarray `[4]` has ≤ 1 element, so it is **already sorted** — `merge_sort` returns it unchanged (no deeper recursion). `if len(arr) <= 1: return arr` is highlighted.

#### Step 06

![Merge: level 3](docs/images/en/walkthrough/step_06.png)

A merge at level 3 (the phase **after** the recursion). The two sorted halves `[8]` (🔵) and `[4]` (🟧) are merged with two pointers: each step compares the heads and takes the smaller into `merged` (ties go to the left, which keeps the sort stable). The result is `[4, 8]` after 1 head comparisons. The body of the `merge` loops is highlighted.

#### Step 07

![Split: level 3, mid = 1](docs/images/en/walkthrough/step_07.png)

A split at level 3. The call `merge_sort([6, 2])`: `mid = len(arr) // 2 = 1`, so the array is split in half by position into `left_half = [6]` (🔵 blue) and `right_half = [2]` (🟧 orange). This is the **divide** phase — no work is done here yet, we only go deeper. The `mid`, `left_half`, `right_half` lines are highlighted.

#### Step 08

![Base case: level 4](docs/images/en/walkthrough/step_08.png)

A base case at level 4. The subarray `[6]` has ≤ 1 element, so it is **already sorted** — `merge_sort` returns it unchanged (no deeper recursion). `if len(arr) <= 1: return arr` is highlighted.

#### Step 09

![Base case: level 4](docs/images/en/walkthrough/step_09.png)

A base case at level 4. The subarray `[2]` has ≤ 1 element, so it is **already sorted** — `merge_sort` returns it unchanged (no deeper recursion). `if len(arr) <= 1: return arr` is highlighted.

#### Step 10

![Merge: level 3](docs/images/en/walkthrough/step_10.png)

A merge at level 3 (the phase **after** the recursion). The two sorted halves `[6]` (🔵) and `[2]` (🟧) are merged with two pointers: each step compares the heads and takes the smaller into `merged` (ties go to the left, which keeps the sort stable). The result is `[2, 6]` after 1 head comparisons. The body of the `merge` loops is highlighted.

#### Step 11

![Merge: level 2](docs/images/en/walkthrough/step_11.png)

A merge at level 2 (the phase **after** the recursion). The two sorted halves `[4, 8]` (🔵) and `[2, 6]` (🟧) are merged with two pointers: each step compares the heads and takes the smaller into `merged` (ties go to the left, which keeps the sort stable). The result is `[2, 4, 6, 8]` after 3 head comparisons. The body of the `merge` loops is highlighted.

#### Step 12

![Split: level 2, mid = 2](docs/images/en/walkthrough/step_12.png)

A split at level 2. The call `merge_sort([7, 1, 5, 3])`: `mid = len(arr) // 2 = 2`, so the array is split in half by position into `left_half = [7, 1]` (🔵 blue) and `right_half = [5, 3]` (🟧 orange). This is the **divide** phase — no work is done here yet, we only go deeper. The `mid`, `left_half`, `right_half` lines are highlighted.

#### Step 13

![Split: level 3, mid = 1](docs/images/en/walkthrough/step_13.png)

A split at level 3. The call `merge_sort([7, 1])`: `mid = len(arr) // 2 = 1`, so the array is split in half by position into `left_half = [7]` (🔵 blue) and `right_half = [1]` (🟧 orange). This is the **divide** phase — no work is done here yet, we only go deeper. The `mid`, `left_half`, `right_half` lines are highlighted.

#### Step 14

![Base case: level 4](docs/images/en/walkthrough/step_14.png)

A base case at level 4. The subarray `[7]` has ≤ 1 element, so it is **already sorted** — `merge_sort` returns it unchanged (no deeper recursion). `if len(arr) <= 1: return arr` is highlighted.

#### Step 15

![Base case: level 4](docs/images/en/walkthrough/step_15.png)

A base case at level 4. The subarray `[1]` has ≤ 1 element, so it is **already sorted** — `merge_sort` returns it unchanged (no deeper recursion). `if len(arr) <= 1: return arr` is highlighted.

#### Step 16

![Merge: level 3](docs/images/en/walkthrough/step_16.png)

A merge at level 3 (the phase **after** the recursion). The two sorted halves `[7]` (🔵) and `[1]` (🟧) are merged with two pointers: each step compares the heads and takes the smaller into `merged` (ties go to the left, which keeps the sort stable). The result is `[1, 7]` after 1 head comparisons. The body of the `merge` loops is highlighted.

#### Step 17

![Split: level 3, mid = 1](docs/images/en/walkthrough/step_17.png)

A split at level 3. The call `merge_sort([5, 3])`: `mid = len(arr) // 2 = 1`, so the array is split in half by position into `left_half = [5]` (🔵 blue) and `right_half = [3]` (🟧 orange). This is the **divide** phase — no work is done here yet, we only go deeper. The `mid`, `left_half`, `right_half` lines are highlighted.

#### Step 18

![Base case: level 4](docs/images/en/walkthrough/step_18.png)

A base case at level 4. The subarray `[5]` has ≤ 1 element, so it is **already sorted** — `merge_sort` returns it unchanged (no deeper recursion). `if len(arr) <= 1: return arr` is highlighted.

#### Step 19

![Base case: level 4](docs/images/en/walkthrough/step_19.png)

A base case at level 4. The subarray `[3]` has ≤ 1 element, so it is **already sorted** — `merge_sort` returns it unchanged (no deeper recursion). `if len(arr) <= 1: return arr` is highlighted.

#### Step 20

![Merge: level 3](docs/images/en/walkthrough/step_20.png)

A merge at level 3 (the phase **after** the recursion). The two sorted halves `[5]` (🔵) and `[3]` (🟧) are merged with two pointers: each step compares the heads and takes the smaller into `merged` (ties go to the left, which keeps the sort stable). The result is `[3, 5]` after 1 head comparisons. The body of the `merge` loops is highlighted.

#### Step 21

![Merge: level 2](docs/images/en/walkthrough/step_21.png)

A merge at level 2 (the phase **after** the recursion). The two sorted halves `[1, 7]` (🔵) and `[3, 5]` (🟧) are merged with two pointers: each step compares the heads and takes the smaller into `merged` (ties go to the left, which keeps the sort stable). The result is `[1, 3, 5, 7]` after 3 head comparisons. The body of the `merge` loops is highlighted.

#### Step 22

![Merge: level 1](docs/images/en/walkthrough/step_22.png)

A merge at level 1 (the phase **after** the recursion). The two sorted halves `[2, 4, 6, 8]` (🔵) and `[1, 3, 5, 7]` (🟧) are merged with two pointers: each step compares the heads and takes the smaller into `merged` (ties go to the left, which keeps the sort stable). The result is `[1, 2, 3, 4, 5, 6, 7, 8]` after 7 head comparisons. The body of the `merge` loops is highlighted.

#### Step 23

![Done](docs/images/en/walkthrough/step_23.png)

Result: the array is sorted — `[1, 2, 3, 4, 5, 6, 7, 8]`. In total 17 comparisons, 24 appends and 7 merges at recursion depth 3. `return merged` / `return merge(...)` is highlighted.

## 10. Complexity and properties

| Case | Time | Why |
|---|---|---|
| **Best** | $O(n\log n)$ | the tree is always balanced — even on sorted input all splits and merges still happen |
| **Average** | $O(n\log n)$ | $\log n$ levels × $n$ work per level |
| **Worst** | $O(n\log n)$ | a degenerate case **does not exist** (unlike quicksort) |

Other properties:

- **Extra memory — $O(n)$:** `merge` builds a **new** list `merged`, so the method is **not in-place** (this is the main trade-off against in-place quicksort with $O(\log n)$ memory).
- **Stable:** equal keys keep their relative order (on a tie we take from the left half, `<=`).
- **Not adaptive** (in its base form): on already-sorted data it still does all splits and merges. Adaptivity is added by TimSort (it detects ready-made runs → $O(n)$ on sorted input).

The number of comparisons grows like $n\log_2 n$ in any case. Compare this growth with $n^2/2$ (quicksort's worst case):

| `n` | Merge sort ($\approx n\log_2 n$) | Quicksort worst ($\approx n^2/2$) | How much better |
|---|---|---|---|
| 10 | ≈ 33 | 45 | ~1× |
| 100 | ≈ 664 | 4,950 | ~7× |
| 1,000 | ≈ 9,966 | 499,500 | ~50× |
| 10,000 | ≈ 132,877 | ≈ 50,000,000 | ~375× |
| 1,000,000 | ≈ 2·10⁷ | ≈ 5·10¹¹ | ~25,000× |

## 11. Limitations: the memory cost and non-adaptivity

The guaranteed $O(n\log n)$ and stability do not come for free:

- **$O(n)$ extra memory** — the main drawback. Every merge builds a new list, so a buffer the size of the array is needed. For huge in-memory arrays this is significant (in-place quicksort gets by with $O(\log n)$). In-place merge variants exist, but they are complex and slower in practice.
- **Non-adaptivity of the base version:** merge sort does not "notice" that the input is already nearly ordered — it does all the splits and merges regardless. (TimSort fixes this by detecting natural runs.)
- **Recursion overhead** on small subarrays: the function-call cost starts to dominate. This is mitigated by the **bottom-up** version and by switching to insertion sort for short stretches — which is exactly what TimSort does.

Even so, the **guaranteed** $O(n\log n)$ and **stability** make merge sort the foundation of industrial sorts wherever predictability matters more than the constant factor or memory.

## 12. Where it fits

Merge sort is especially strong where quicksort is weak:

- **External sorting** (data does not fit in memory): merge sort naturally merges sorted "runs" from disk/tape — the classic scheme for sorting large files.
- **Linked lists:** merging needs no random access by index, so a list can be sorted in $O(n\log n)$ **without** extra array memory (just by re-linking pointers).
- **When stability** and **guaranteed** behavior are needed (e.g. in libraries where an accidental $O(n^2)$ is unacceptable).
- **Parallelism:** independent halves can be sorted on different cores/machines and then merged.

## 13. Series finale: TimSort and the whole sorting picture

Python's standard `sorted()` and `list.sort()` use **TimSort** — a hybrid that combines **insertion sort** and **merge sort** (designed by Tim Peters, 2002). The idea: the array is split into short "runs", each is brought to a sorted state with **insertion sort** (which is fast on short and nearly-ordered stretches), and then the sorted runs are **merged** together with merge sort from the bottom up — until only one remains. TimSort takes the best of both methods: the adaptivity and small constant of insertion sort on short/ordered data, and the guaranteed $O(n\log n)$ and stability of merging. On already-sorted input it detects ready-made runs and works in $O(n)$; memory is $O(n)$.

This is how the whole series of simple and efficient sorts comes together into one picture — from the simplest to the industrial standard:

| Algorithm | Best | Average | Worst | Memory | Stable | Adaptive | In-place |
|---|---|---|---|---|---|---|---|
| [Bubble](https://github.com/MarynaShavlak/algo-bubble-sort) | $O(n)$ | $O(n^2)$ | $O(n^2)$ | $O(1)$ | yes | yes¹ | yes |
| [Insertion](https://github.com/MarynaShavlak/algo-insertion-sort) | $O(n)$ | $O(n^2)$ | $O(n^2)$ | $O(1)$ | yes | yes | yes |
| [Selection](https://github.com/MarynaShavlak/algo-selection-sort) | $O(n^2)$ | $O(n^2)$ | $O(n^2)$ | $O(1)$ | no | no | yes |
| [Quicksort](https://github.com/MarynaShavlak/algo-quick-sort) | $O(n\log n)$ | $O(n\log n)$ | $O(n^2)$ | $O(\log n)$ | no | no | yes |
| **Merge sort** | $O(n\log n)$ | $O(n\log n)$ | $O(n\log n)$ | $O(n)$ | **yes** | no | no |
| **TimSort** (`sorted`) | $O(n)$ | $O(n\log n)$ | $O(n\log n)$ | $O(n)$ | **yes** | **yes** | no |

<sub>¹ bubble sort is adaptive only in the optimized version with the early-stop flag.</sub>

Sibling repositories in this series: [**algo-bubble-sort**](https://github.com/MarynaShavlak/algo-bubble-sort) · [**algo-insertion-sort**](https://github.com/MarynaShavlak/algo-insertion-sort) · [**algo-selection-sort**](https://github.com/MarynaShavlak/algo-selection-sort) · [**algo-quick-sort**](https://github.com/MarynaShavlak/algo-quick-sort) · **algo-merge-sort** (this one).

## 14. Summary

- **Merge sort** works by divide and conquer: it splits the array in half, recursively sorts both halves and **merges** them with two pointers (all the work is in the merge phase, **after** the recursion — a mirror image of quicksort).
- Splitting strictly in half by position makes the recursion tree **always balanced** (depth $\log n$), so the complexity is a **guaranteed $O(n\log n)$ in every case**: there is no degenerate $O(n^2)$ as in quicksort.
- The method is **stable** (on a tie the head is taken from the left half, `<=`) and costs $O(n)$ **extra memory** — it is **not in-place**.
- The base version is **not adaptive**; the **bottom-up** version removes the recursion and leads straight to **TimSort** — the hybrid of insertion and merge that is Python's standard `sorted()`.
- On the array `[8, 4, 6, 2, 7, 1, 5, 3]` the sort costs **17 comparisons, 24 appends, 7 merges** at recursion depth **3**.
- Merge sort is the foundation of industrial sorts wherever **guaranteed** behavior, **stability**, external sorting or sorting of linked lists is needed.

