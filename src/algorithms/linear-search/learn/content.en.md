# Linear Search: a step-by-step walkthrough

**Linear search** is the simplest search algorithm: to find a value `x` in an array, we **check every element left to right** and compare it with `x`. On the first match we return that element's **index**; if we reach the end with no match, we return `-1`. The array is **never modified** and needs no precondition — the search works just the same on **unsorted** data.

Unlike sorting, there are no swaps or shifts here: the only "cost" of the algorithm is the **number of checks** (comparisons `arr[i] == x`). What stands out instead is how clearly the cases differ: best — when the element is at the front (one check, $O(1)$); worst — when it is at the end or absent (a full scan, $O(n)$).

## 1. Intuition: a bookshelf

Imagine looking for a particular book on a shelf, **scanning it left to right** — one by one, until you hit the one you want (or reach the end of the shelf). That is exactly how linear search works: a running cursor moves along the still array and checks every cell in turn.

![Left-to-right scan searching for 8](docs/images/en/scan_intuition.png)

The current cell (the one we are checking *right now*) is marked **pink**. As soon as we find a match the cell turns **green** and the search stops: there is no need to look at the rest of the array.

## 2. The idea: check one by one

We work with an array of 5 elements. It is **still** — the search never rearranges it:

| index | 0 | 1 | 2 | 3 | 4 |
|---|---|---|---|---|---|
| **value** | 5 | 3 | 8 | 1 | 4 |

![The array [5, 3, 8, 1, 4] as a row of cells](docs/images/en/array_main.png)

The algorithm is a single loop: for each index `i` from `0` to `len(arr)-1` we check whether `arr[i] == x`. If so — we immediately return `i` (no point searching further). If the loop reaches the end and no check matched — the element is not in the array, and we return `-1`.

## 3. Two outputs: index or existence

Linear search naturally yields **two modes**:

- `linear_search(arr, x)` — returns the **index** of the first match (or `-1`);
- `exists_in_list(arr, x)` — returns a **boolean**: whether `x` is in the array at all (it simply checks that the index is not `-1`).

The first is needed when *where* the element lies matters; the second — when only the *fact of presence* matters.

## 4. Example — the array `[5, 3, 8, 1, 4]`, searching for `8`

### The base implementation

Here is the base implementation — the one we walk through line by line:

```python
def linear_search(arr, x):
    for i in range(len(arr)):
        if arr[i] == x:
            return i
    return -1

def exists_in_list(arr, x):
    return linear_search(arr, x) != -1

numbers = [1, 3, 5, 7, 9, 11]
print(linear_search(numbers, 7))      # 3
print(exists_in_list(numbers, 7))     # True
print(exists_in_list(numbers, 2))     # False
```

What is what:

- `for i in range(len(arr))` — the **loop**: we walk indices `0, 1, …, len(arr)-1` left to right;
- `if arr[i] == x` — the **check** (comparison): is the current element equal to the target;
- `return i` — if so, a **match** — we return the index and exit immediately (the first match);
- `return -1` — if the loop finished with no match, the element is **not** in the array.

`exists_in_list` merely calls `linear_search` and turns its result into `True`/`False`.

The teaching version `linear_search_steps` repeats this code **action for action**, but after each check it records a snapshot of the state and the check counter — those snapshots are what every picture below is built from.

### How to read the frames

- 🌸 **a pink cell with a ▼ cursor** — the element we are checking *right now* (`arr[i] == x?`);
- ⬜ **neutral cells** — not checked yet;
- 🩶 **dimmed cells with ✗** — already checked and discarded (not it);
- 🟢 **a green cell with ✓** — the match found (the cursor stops here);
- on top — the **"looking for: x"** badge; below the frame — the **verdict** of the check and the **check counter**.

### The scan: index 0 → 1 → 2-found

We are searching for `8`. The cursor starts at index `0` and moves right.

**Check 1** (`i = 0`): `arr[0] = 5`. Not `8` — discard it and move on:

![Check 1: 5 ≠ 8](docs/images/en/step_main_0.png)

**Check 2** (`i = 1`): `arr[1] = 3`. Again not `8` — move on:

![Check 2: 3 ≠ 8](docs/images/en/step_main_1.png)

**Check 3** (`i = 2`): `arr[2] = 8`. A match! We return index `2` and stop the search:

![Check 3: 8 = 8, found](docs/images/en/step_main_2.png)

The full trace of the checks:

```text
Step-by-step walkthrough: searching for 8 in [5, 3, 8, 1, 4]

  Check 1: arr[0] = 5 ≠ 8 → not it
  Check 2: arr[1] = 3 ≠ 8 → not it
  Check 3: arr[2] = 8 = 8 → MATCH, return 2
```

Notice: cells `3` and `4` were **never checked** — the moment we found a match, the search stopped. That is what makes the best cases cheap.

### The summary and the motion

All checks side by side — you can see the cursor "staircase": the pink cell creeps to the right while the discarded left part grows, until we hit the green match:

![Scan staircase of [5, 3, 8, 1, 4]](docs/images/en/scan_main.png)

▶️ The same in motion — the cursor runs along the array and stops at the match:

![Animation: searching for 8 in the array](docs/images/en/search_main.gif)

### The result

![Found 8 at index 2](docs/images/en/result_main.png)

The console summary:

```text
Array:   [5, 3, 8, 1, 4]
Target:  8
Result: index 2   ·   checks: 3
```

And here are the example outputs — on the sorted array `[1, 3, 5, 7, 9, 11]`:

```text
linear_search([1, 3, 5, 7, 9, 11], 7)  -> 3
exists_in_list([1, 3, 5, 7, 9, 11], 7) -> True
exists_in_list([1, 3, 5, 7, 9, 11], 2) -> False
```

`linear_search` returns `3` because the number `7` is in the 4th position (remember, indexing starts at `0`); `exists_in_list` returns `True` for the present `7` and `False` for the absent `2`.

## 5. Case analysis — the main focus

How many checks linear search performs depends on **where** (and whether) the target element lies. For search this difference is much more vivid than for sorting:

![Case comparison: best, worst, absent, average](docs/images/en/cases.png)

```text
Linear search: case analysis

Best case — 5 at the front (index 0)
  → checks: 1, result: 0
Worst case (found) — 4 at the end
  → checks: 5, result: 4
Absent element (worst) — full scan to -1
  → checks: 5, result: -1
Average case — 8 roughly in the middle
  → checks: 3, result: 2
```

- **Best case $O(1)$:** the element is at the front — one check and we are done.
- **Worst case $O(n)$:** the element is at the very end — to reach it we check the **whole** array.
- **Absent element $O(n)$:** there is no match at all — also a full scan to `-1` (the same number of checks as worst-found).
- **Average case $\approx n/2$:** if the element is equally likely at any position, on average we check half of the array.

### Complexity and the contrast with binary search

Linear search is $O(n)$: the number of checks grows **linearly** with the array size. For **unsorted** data this is unavoidable — there is no other way to find the element. But if the array is **sorted**, binary search gives $O(\log n)$ by discarding half each time:

![Chart: linear O(n) vs. binary O(log n)](docs/images/en/growth.png)

On a sorted array of a million elements, linear search would in the worst case do up to **a million** checks, while binary search — about **twenty**. This is exactly the bridge to the [next step](#series) — binary search.

## 6. Duplicates: the first match and `find_all`

If the target element appears **several times**, the base `linear_search` returns the **first** match and stops right away — it says nothing about the rest:

![First match of 8 at index 1](docs/images/en/dup_first.png)

To get **all** indices of occurrences, you have to scan the array **to the end** — that is what the `find_all` variant does:

![All occurrences of 8: indices 1, 3, 5](docs/images/en/dup_all.png)

```text
Duplicates: linear_search returns the FIRST match, find_all — all
  first match (linear_search): index 1
  all occurrences (find_all): [1, 3, 5]
```

## 7. The sentinel as a micro-optimization

In the base loop, every iteration really does **two** checks: whether we have run off the end of the array (a service check, implicit in `for`) and whether this is the target (`arr[i] == x` — the useful one). The classic micro-optimization is the **sentinel**: we append `x` to the end as a "guard", so a match is **guaranteed** at the latest there. Now the bounds check can be dropped — only the useful comparison remains:

```python
def linear_search_sentinel(arr, x):
    n = len(arr)
    a = list(arr)
    a.append(x)             # the sentinel: a match is now guaranteed
    i = 0
    while a[i] != x:        # no bounds check: the sentinel stops the loop
        i += 1
    return i if i < n else -1
```

The result is the **same index** as the base version (and we work on a copy, so the input array is not modified):

```text
Sentinel vs. the base search — same index, fewer service checks
  base search: index 2, bound checks per iteration — 1
  sentinel: index 2, bound checks per iteration — 0
```

This does not change the asymptotics (still $O(n)$), but it removes one service comparison from each iteration of the hot loop.

## 8. Search in motion: animations

The cursor runs along the still array — comparison by comparison. Two telling modes:

▶️ **Found early** — the main case: the cursor stops at index `2`:

![Animation: found early](docs/images/en/search_main.gif)

▶️ **Absent element** — the cursor scans the **whole** array down to `-1` (the worst case, a full pass):

![Animation: absent element, full scan](docs/images/en/search_absent.gif)

## 9. Code execution step by step: code ↔ array panels

The examples above showed the *result* of each step. Here is **the code in action**: on the left a fragment of the algorithm with **highlighted active lines**, on the right the array with the cursor at that exact moment. **The line color encodes what is happening:** 🟡 the line runs now (loop / the `if arr[i] == x` check), 🟢 the condition is true → `return i` (found), 🔴 the loop is exhausted → `return -1` (not found).

We build this for the main case `[5, 3, 8, 1, 4]`, searching for `8`. Each grid row is one check (you see both branches: not-it / match):

![Code ↔ array: the array [5, 3, 8, 1, 4]](docs/images/en/code_steps_main.png)

▶️ The animated version — between the "decisions" we insert "checking `arr[i] == x`?" frames:

![Animation: code ↔ array](docs/images/en/code_walk_main.gif)

## 10. Full step-by-step trace of `[5, 3, 8, 1, 4]`

Below is the same step-by-step execution, but **in full**: every check as a separate code ↔ array frame, in the correct order, with a detailed explanation under each. The "intrigue" frame (`arr[i] == x?`) and its resolution (not-it / match) are shown separately. The cell colors are the same as in the [legend above](#how-to-read). The block is generated automatically from the event journal.

#### Step 00

![Start: the array as given](docs/images/en/walkthrough/step_00.png)

The initial array `[5, 3, 8, 1, 4]`; we are searching for `8`. All cells are neutral — nothing has been checked yet, and the array does not change during the search. In the code, `def linear_search` and the entry into the loop `for i in range(len(arr))` are highlighted.

#### Step 01

![Check 1: index 0](docs/images/en/walkthrough/step_01.png)

Check 1 — the cursor moves to index 0 (the pink cell). We compare `arr[0] = 5` with the target `8`: the line `if arr[i] == x` is highlighted. Is it a match?

#### Step 02

![Check 1: index 0](docs/images/en/walkthrough/step_02.png)

`5 ≠ 8` — not the right element. Cell 0 is discarded (✗), `return` did not fire — the loop moves on to the next index. Checks done so far: 1.

#### Step 03

![Check 2: index 1](docs/images/en/walkthrough/step_03.png)

Check 2 — the cursor moves to index 1 (the pink cell). We compare `arr[1] = 3` with the target `8`: the line `if arr[i] == x` is highlighted. Is it a match?

#### Step 04

![Check 2: index 1](docs/images/en/walkthrough/step_04.png)

`3 ≠ 8` — not the right element. Cell 1 is discarded (✗), `return` did not fire — the loop moves on to the next index. Checks done so far: 2.

#### Step 05

![Check 3: index 2](docs/images/en/walkthrough/step_05.png)

Check 3 — the cursor moves to index 2 (the pink cell). We compare `arr[2] = 8` with the target `8`: the line `if arr[i] == x` is highlighted. Is it a match?

#### Step 06

![Check 3: index 2](docs/images/en/walkthrough/step_06.png)

`8 = 8` — a match! The condition `arr[2] == x` is true, so `return i` returns index **2** (the green cell ✓), and the search stops. Total checks: 3.

#### Step 07

![Done](docs/images/en/walkthrough/step_07.png)

Result: `8` is found at index **2** in **3** checks. The base `linear_search` returns the first match and does not scan the array any further. `return i` is highlighted.

## 11. Complexity and properties

How much work linear search does depends on the position of the target element:

| Case | Checks | When it happens |
|---|---|---|
| **Best** | $O(1)$ | the element is at the front (index 0) |
| **Average** | $O(n)$, $\approx n/2$ | the element is somewhere in the middle |
| **Worst** | $O(n)$ | the element is at the end **or** absent (a full scan) |

Other properties:

- **Does not modify the array:** the search only *reads* the elements; extra memory is $O(1)$ (the sentinel needs a copy, i.e. $O(n)$).
- **No precondition:** it works on **unsorted** data — unlike binary search, which requires a sorted array.
- **The metric is the number of checks** (comparisons `arr[i] == x`); there are no swaps or shifts as in sorting.
- **First match on duplicates:** `linear_search` returns the leftmost match; all occurrences are given by `find_all`.

## 12. Limitations: when linear search loses

Linear complexity means that for **large** arrays the search becomes slow: to find an element among a million, in the worst case you make a million checks. If the data is **sorted**, binary search is dramatically faster:

| `n` | Linear ($\approx n$) | Binary ($\approx \log_2 n$) | How many times faster |
|---|---|---|---|
| 10 | 10 | ≈ 4 | ~2× |
| 100 | 100 | ≈ 7 | ~14× |
| 1 000 | 1 000 | ≈ 10 | ~100× |
| 1 000 000 | 1 000 000 | ≈ 20 | ~50,000× |

But this gain comes with a **precondition-cost**: the array must be kept sorted. If the data is unsorted, there are only two paths — either search linearly in $O(n)$, or first sort in $O(n\log n)$ and then search by binary. For a **single** search, sorting does not pay off; linear search is the only sensible option here:

| Algorithm | Time | Precondition | Note |
|---|---|---|---|
| **Linear search** | $O(n)$ | **none** | works everywhere, including on unsorted data |
| Binary search | $O(\log n)$ | a sorted array | fast, but needs prior sorting |
| Hash table | $O(1)$ on average | a built hash structure | the fastest access, at the cost of memory and preprocessing |

## 13. Where it fits

Linear search's niche is exactly where binary search's preconditions do not hold or do not pay off:

- **Unsorted data.** No sorting — no binary search; linear works with no conditions.
- **Small sets.** On a handful of elements the $O(n)$ vs $O(\log n)$ difference is imperceptible, and the code is simpler.
- **Linked lists.** No indexed access — binary search is impossible, only a sequential pass remains.
- **Streaming / one-off searches.** Data arrives one item at a time, or we search just once — sorting for a single query does not pay off.
- **Search by a complex condition** (`find_all`, the first element satisfying a predicate) — where there simply is no "ordering by key".

## 14. Place in the series: the first step into search

This is the **first search algorithm** in the series — after several **sorting** algorithms. And the link between them is direct: linear search works on any data but slowly ($O(n)$); binary works fast ($O(\log n)$) but only on **sorted** data. So the earlier sorting walkthroughs are exactly what **enables** fast search:

| Topic | Repository |
|---|---|
| Bubble sort | [algo-bubble-sort](https://github.com/MarynaShavlak/algo-bubble-sort) |
| Insertion sort | [algo-insertion-sort](https://github.com/MarynaShavlak/algo-insertion-sort) |
| Selection sort | [algo-selection-sort](https://github.com/MarynaShavlak/algo-selection-sort) |
| Quicksort | [algo-quick-sort](https://github.com/MarynaShavlak/algo-quick-sort) |
| Merge sort | [algo-merge-sort](https://github.com/MarynaShavlak/algo-merge-sort) |
| Shell sort | [algo-shell-sort](https://github.com/MarynaShavlak/algo-shell-sort) |
| Radix sort | [algo-radix-sort](https://github.com/MarynaShavlak/algo-radix-sort) |

**Where next:** binary search ($O(\log n)$ on sorted data) is the natural next step, completing the "sort first, then search fast" pairing.

## 15. Summary

- **Linear search** checks every element left to right until it finds `x` (returning its index) or reaches the end (returning `-1`).
- It works **in place and read-only** ($O(1)$ memory) and **needs no sorted data** — the main advantage over binary search.
- **Complexity:** $O(1)$ in the best case (element at the front), $O(n)$ on average ($\approx n/2$) and in the worst case (element at the end or absent).
- **Two modes:** `linear_search` gives an index (or `-1`), `exists_in_list` gives boolean existence; on duplicates the **first** match is returned, and all occurrences are given by `find_all`.
- **The sentinel** is a classic micro-optimization: it removes the bounds check from every iteration without changing the result.
- On the array `[5, 3, 8, 1, 4]` searching for `8` costs **3 checks** (a match at index 2); the best case is **1 check**, the worst and the absent — **5** (a full scan).
- For **large sorted** arrays linear search loses to binary ($O(n)$ vs $O(\log n)$), but for **unsorted** data, small sets, linked lists, and one-off searches it is the only sensible choice.

