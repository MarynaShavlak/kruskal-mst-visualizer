# Indexed Sequential Search: a step-by-step walkthrough

**Indexed sequential search** is a **hybrid** method that combines the strengths of [**binary**](https://github.com/MarynaShavlak/algo-binary-search) and [**sequential (linear)**](https://github.com/MarynaShavlak/algo-linear-search) search. It works in **two phases** over **two levels of data**: first a **binary** search over a sparse *index table* narrows the area down to a small **block** of the main array (phase 1), then a **sequential** scan goes through that block only (phase 2).

The metaphor is a book with **tab dividers**: first you roughly jump to the right section by the tabs (the index), then you flip through its pages in order. Like binary search, the method requires a **sorted** array; like linear search, it ends with a plain scan. So it is a natural **synthesis** of the two earlier search walkthroughs.

## 1. Intuition: a book with tab dividers

Imagine a thick sorted book with **tab dividers** on its edge. To find a page you do not flip through everything from the start (that is linear search) — first you roughly jump to the **right section** by the tabs, and only there do you flip pages in order.

That is exactly how indexed sequential search works. The data lives on **two levels**: on top is a sparse **index table** (the tab dividers: every `step`-th element as a `(key, position)` pair), below is the full **array**, split by those tabs into **blocks**:

![Two data levels: the index on top, the array with blocks below](docs/images/en/two_level.png)

First a **binary** search over the tabs narrows the area to a single section (block), then we **linearly** flip through it only:

![A tabbed book: roughly by the tabs, then flip through the section](docs/images/en/intuition.png)

## 2. The idea: two phases over two data levels

The algorithm has two phases:

1. **Phase 1 — binary search over the index.** We keep a window `[start, end]` over the index-table entries and look at the middle signal pillar `mid`. Comparing its key with the target, we drop half of the window (just like ordinary binary search). The result is **which block** of the main array to scan. If a pillar's key equals the target — the answer is found right here.
2. **Phase 2 — sequential search in the block.** We linearly scan **only** the chosen block of the main array and return the index of the first match (or `-1` if the block is exhausted).

The index sparsity is set by the **step** `step`: every `step`-th element becomes a signal pillar. This is the classic trade-off: the denser the pillars (a smaller `step`), the shorter the blocks — but the larger the table; the sparser they are (a larger `step`), the smaller the table — but the longer the scans. The optimum is near `√n` (see [below](#step)).

## 3. Precondition: the array must be sorted

Like [binary search](https://github.com/MarynaShavlak/algo-binary-search), indexed sequential search is correct **only on a sorted array**: both the binary search over the index and the block-choice logic rely on ordering. On unsorted data the method may "discard" the block that actually contains the target.

This is a direct link to **sorting**: it is sorting that orders the data and enables such fast search. In the code the precondition is checked by the `is_sorted` utility, and all teaching instances (`examples/_searches.py`) are sorted by construction (`assert is_sorted(...)`).

## 4. Synthesis: linear + binary search

This method literally **combines** the two earlier walkthroughs of the series — it is their synthesis on sorted data:

| Phase | What it does | Where it comes from |
|---|---|---|
| **Phase 1** | binary search over the index table (narrow to a block) | [**algo-binary-search**](https://github.com/MarynaShavlak/algo-binary-search) — `O(log n)` |
| **Phase 2** | sequential scan inside the block | [**algo-linear-search**](https://github.com/MarynaShavlak/algo-linear-search) — `O(m)` |

Phase 1 is a binary search, but not over the whole array — over its sparse "map" (the index). Phase 2 is a linear search, but not over the whole array — over a single short block. Their combination yields a speed in between.

## 5. Example — array `[1, 3, …, 25]`, step 4, searching for 15

### The array and the index table

We work with a sorted array of 13 elements and an index step `step = 4`:

| index | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **value** | 1 | 3 | 5 | 7 | 9 | 11 | 13 | 15 | 17 | 19 | 21 | 23 | 25 |

`create_index_table` takes every 4th element and stores it as a `(key, position)` pair. The result is a sparse table — "signal pillars" evenly spread across the array (printed by [`examples/01_intro.py`](examples/01_intro.py)):

```text
Index table: [(1, 0), (9, 4), (17, 8), (25, 12)]
```

Here `(9, 4)` means: the element with key `9` is at position `4` of the main array. These four pillars split the array into blocks `[0, 4)`, `[4, 8)`, `[8, 12)`, and a tail `[12, 13)`.

### The base implementation

Here are the two base functions — the ones we walk through line by line (the fully documented versions are in [`indexed_sequential_search/core.py`](indexed_sequential_search/core.py)):

```python
def create_index_table(array, step):
    index_table = []
    for i in range(0, len(array), step):
        index_table.append((array[i], i))
    return index_table

# The main sorted array
main_array = [1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25]

# Build the index table with step 4
index_table = create_index_table(main_array, 4)
# [(1, 0), (9, 4), (17, 8), (25, 12)]

def indexed_sequential_search(array, index_table, target):
    # Search in the index table
    start = 0
    end = len(index_table) - 1
    while start <= end:
        mid = (start + end) // 2
        if index_table[mid][0] == target:
            return index_table[mid][1]
        elif index_table[mid][0] < target:
            start = mid + 1
        else:
            end = mid - 1

    # Determine the range for the sequential search
    if start == 0:
        search_range = (0, index_table[0][1])
    elif start >= len(index_table):
        search_range = (index_table[-1][1], len(array))
    else:
        search_range = (index_table[start - 1][1], index_table[start][1])

    # Sequential search within the range
    for i in range(search_range[0], search_range[1]):
        if array[i] == target:
            return i
    return -1  # if the element is not found
```

What is what:

- **Phase 1** — `while start <= end`: a binary search over `index_table`. We take the middle `mid` and compare `index_table[mid][0]` (the pillar key) with `target`: equal — return the position right away; less — drop the left half (`start = mid + 1`); greater — drop the right half (`end = mid - 1`).
- **Choosing the block** — the three `if/elif/else` branches: once the window is empty, `start` tells **between which signal pillars** the target lies. Hence the `search_range` bounds (empty/left block, right tail, or the general block between adjacent pillars).
- **Phase 2** — `for i in range(...)`: a sequential pass **only** within the block; on a match we return `i`, otherwise `-1`.

The teaching version [`indexed_sequential_search_steps`](indexed_sequential_search/core.py) repeats this code **action by action** but, after every index probe and every sequential comparison, records a snapshot tagged with the **phase** and counters — all the pictures below are built from those snapshots.

### How to read the frames

The main visualization is **two-level**: 🟪 the index table on top, ⬜ the array with blocks below, connected by "pillar → position" lines. Color encodes the phase and the role:

- 🟦 **blue window** over the index — the range `[start, end]` where we are still searching (**phase 1**);
- 🌸 **pink `mid` pillar** — the current probe of phase 1 (with a ▼ cursor);
- 🟦 **blue frame** around the block — the block chosen for scanning; other blocks are **dimmed**;
- 🌸 **pink cell** — the current cursor check (**phase 2**); 🩶 discarded cells (✗);
- 🟢 **green cell** — the match found (✓);
- 🟣 the "looking for" and "step" badges — what and with which step we search;
- below the frame — the step **verdict** and the **counters**: index probes and block comparisons separately.

### Phase 1: binary search over the index

We search for `15`. Binary search goes over the four signal pillars `[(1, 0), (9, 4), (17, 8), (25, 12)]`.

`mid = 1`: the pillar key `9 < 15` — the target is **to the right**, drop the left half of the index (`start = mid + 1`):

![Phase 1, probe 1: 9 < 15 → go right](docs/images/en/step_main_1.png)

`mid = 2`: the pillar key `17 > 15` — the target is **to the left**, drop the right half (`end = mid - 1`). The window is empty:

![Phase 1, probe 2: 17 > 15 → go left](docs/images/en/step_main_2.png)

The full phase-1 trace (printed by [`examples/01_intro.py`](examples/01_intro.py)):

```text
Phase 1 — binary search over the index table:
  probe 1: index_table[1] = (9, 4); 9 < 15 → go right
  probe 2: index_table[2] = (17, 8); 17 > 15 → go left
  → block [4, 8) (branch general)
```

### Choosing the block: three branches

Once the index window is empty, `start` tells between which pillars the target lies, and one of three branches sets `search_range`:

| Branch | When | `search_range` | Example |
|---|---|---|---|
| `start == 0` | target is left of the first pillar | `(0, index_table[0][1])` — empty/left block | `target = 0` → `-1` |
| `start >= len(index_table)` | target is right of the last pillar | `(index_table[-1][1], len(array))` — the tail | `target = 27` → `-1` |
| **general** | between adjacent pillars | `(index_table[start-1][1], index_table[start][1])` | `target = 15` → block `[4, 8)` |

For `15` the **general** branch fires: `9 ≤ 15 < 17`, so the block is `[4, 8)` (between pillars `(9, 4)` and `(17, 8)`). The other blocks are dimmed:

![Selected block \[4, 8) of the main array](docs/images/en/step_main_3.png)

### Phase 2: sequential search in the block

Now it is an ordinary **linear** search, but **only** within the block `[4, 8)`. The cursor walks over the cells `9, 11, 13, 15`:

![Phase 2: cursor on the first cell of the block (9 ≠ 15)](docs/images/en/step_main_4.png)

`15 = 15` — a match! Return position **7** (the green cell):

![Phase 2: a match at position 7](docs/images/en/step_main_7.png)

The full phase-2 trace:

```text
Phase 2 — sequential search in block [4, 8):
  array[4] = 9 ≠ 15 → not it
  array[5] = 11 ≠ 15 → not it
  array[6] = 13 ≠ 15 → not it
  array[7] = 15 = 15 → MATCH, return 7
```

### Step table and the combined evolution

All the steps of both phases in one table (`phase / start / end / mid / comparison / block / i / match?`):

![Step table: two phases over two data levels](docs/images/en/step_table.png)

The same sequence of frames stacked — you can see the transition from narrowing the index window (phase 1) to the cursor in the block (phase 2):

![Step-by-step evolution: phase 1 → block choice → phase 2](docs/images/en/evolution_main.png)

▶️ The same in motion — first the index window narrows and the block lights up, then the cursor runs over the block cells:

![Animation: indexed sequential search for 15](docs/images/en/search_main.gif)

### Result

![Done: found at position 7](docs/images/en/result_main.png)

The console summary and the **runnable example** — the very same output (printed by [`examples/01_intro.py`](examples/01_intro.py); the program output line is in Ukrainian):

```text
Array:   [1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25]
Target:  15
Result: position 7   ·   index probes: 2, block comparisons: 4, total: 6

The runnable example:
index_table = [(1, 0), (9, 4), (17, 8), (25, 12)]
Елемент 15 знайдено на позиції 7
```

Searching for `15` cost only **2 index probes** (phase 1) + **4 sequential comparisons** in the block (phase 2) = **6** in total. Had we searched for `9` (a signal-pillar key), the answer would have been found already in phase 1 — in **1 probe, 0** sequential comparisons.

## 6. Complexity `O(log n + m)`: two terms

The hybrid's cost is the sum of **two terms** — one per phase:

- **Phase 1** — a binary search over an index of `n_idx` entries: `O(log n_idx)` ≈ `O(log n)`;
- **Phase 2** — a sequential scan of a block of `m` elements: `O(m)`.

Together — **`O(log n + m)`**. When `m` is small (as it is with a good step), `O(log n)` dominates. The counters for various instances (printed by [`examples/02_complexity.py`](examples/02_complexity.py)):

```text
Complexity O(log n + m): two terms

  main (target=15): index probes 2 + block comparisons 4 = total 6
  in_index (target=9): index probes 1 + block comparisons 0 = total 1
  block_last (target=23): index probes 3 + block comparisons 4 = total 7
  right_absent (target=27): index probes 3 + block comparisons 1 = total 4
```

Where the hybrid sits **between** pure linear and pure binary search on the same array:

```text
Contrast on this array (n = 13):
  pure linear search: up to 13 comparisons (scan the whole array)
  pure binary search: ≈ 4 comparisons (log₂ n)
  indexed sequential (step 4): 6 comparisons (in between)
```

![Where the hybrid sits: O(n) vs. O(log n) vs. O(log n + m)](docs/images/en/complexity.png)

The hybrid loses to pure binary search (it works over a sparse index and then still scans a block), but it greatly outpaces linear search — and, unlike binary search, it naturally fits structures where the index is built separately from the data (databases, file systems).

## 7. Choosing the step and the optimum ≈ √n

The step `step` is the method's main parameter. A small `step` → a large table and tiny blocks (cheap scan, but an expensive index and memory); a large `step` → a small table, but long scans. The balance is in the middle, near **`√n`**.

The experiment: total comparisons vs. step for an array of `n = 100` elements (printed by [`examples/03_step_and_variants.py`](examples/03_step_and_variants.py)):

```text
Experiment: total comparisons vs. step (n = 100)
  step = 2: probes (linear) ≈ 50 + block ≈ 2 = 52
  step = 5: probes (linear) ≈ 20 + block ≈ 5 = 25
  step = 10: probes (linear) ≈ 10 + block ≈ 10 = 20
  step = 20: probes (linear) ≈ 5 + block ≈ 20 = 25
  step = 50: probes (linear) ≈ 2 + block ≈ 50 = 52
  optimum near √100 ≈ 10.0
```

The "comparisons vs. `step`" curve has a clear **minimum near `√n`**:

![Choosing the step: total comparisons vs. step (minimum ≈ √n)](docs/images/en/step_tradeoff.png)

> **A bridge to Jump Search.** The sum `n/step + step` is minimized exactly at `step = √n` — the same balance as in **block search with jumps** (Jump Search): it makes **linear jumps** of length `√n` over the blocks instead of a binary search in the index. A binary search over the index makes the first part even cheaper (`≈ log(n/step)`), but the table size `n/step` (memory) still pushes toward the same optimal step.

## 8. Variants and the Jump Search relative

Phase 1 can be implemented in different ways, and the method itself has a close relative — and they all give **the same result** (printed by [`examples/03_step_and_variants.py`](examples/03_step_and_variants.py)):

```text
The phase-1 variants give the same result:
  base (binary index): position 7
  linear index: position 7
  jump search (step √n): position 7
```

- **`indexed_sequential_search`** — the base version: phase 1 is a **binary** search over the index, `O(log n)`.
- **`indexed_sequential_search_linear_index`** — phase 1 is a **linear** pass over the index (simpler to grasp), `O(n/step)`. The block-choice logic and phase 2 are identical to the base.
- **`jump_search`** — a relative with jumps: the "narrowing" phase is linear (jumps of `√n` directly over the array), and no separate table is stored. The optimal step is `√n`.

## 9. Stepping through the code: code ↔ data panels

The examples above showed the *result* of each step. Here is **the code in action**: on the left both functions with **highlighted active lines**, on the right the two-level schematic at that very moment. **The line color encodes the phase and the branch:** 🟡 the line runs now, 🟦 a phase-1 branch (window narrowing / block choice), 🌸 a phase-2 step (linear in the block), 🟢 "found" → `return`, 🔴 the block is exhausted → `return -1`.

We build it for the main case; generated by [`examples/05_code_walkthrough.py`](examples/05_code_walkthrough.py). Each grid row is one decision (an index probe / a block choice / a sequential comparison):

![Code ↔ data: the two phases of indexed sequential search](docs/images/en/code_steps_main.png)

▶️ The animated version — frames "are we checking the condition?" are inserted between the decisions:

![Animation: code ↔ data](docs/images/en/code_walk_main.gif)

## 10. Full step-by-step trace of `[1, 3, …, 25]`, step 4, target 15

Below is the same execution, but **in full**: every index probe, the block choice, and every sequential comparison as a separate "code ↔ data" frame, in the right order, with a detailed explanation under each. The colors are the same as in the [legend above](#how-to-read). The block is generated automatically from the event journal (the [`examples/06_full_walkthrough.py`](examples/06_full_walkthrough.py) script).

#### Step 00

![Start: build the index, search for 15](docs/images/en/walkthrough/step_00.png)

The initial array `[1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25]`; we search for `15` with index step `4`. On top — the sparse **index table** (signal pillars `(key, position)`), below — the full array split into **blocks**. In the code, `create_index_table` is highlighted — the table is already built.

#### Step 01

![Phase 1: probe 1 (mid = 1)](docs/images/en/walkthrough/step_01.png)

**Phase 1 (binary over the index).** Probe 1: we look at the middle signal pillar `mid = 1` of the window `[start, end]` (pink). We compare its key `9` with the target `15`: `if index_table[mid][0] == target` is highlighted. Is it a match?

#### Step 02

![Phase 1: probe 1 (mid = 1)](docs/images/en/walkthrough/step_02.png)

`9 < 15` — the target is **to the right**: drop the left half of the index (`start = mid + 1`). The window `[start, end]` narrowed. Index probes: 1.

#### Step 03

![Phase 1: probe 2 (mid = 2)](docs/images/en/walkthrough/step_03.png)

**Phase 1 (binary over the index).** Probe 2: we look at the middle signal pillar `mid = 2` of the window `[start, end]` (pink). We compare its key `17` with the target `15`: `if index_table[mid][0] == target` is highlighted. Is it a match?

#### Step 04

![Phase 1: probe 2 (mid = 2)](docs/images/en/walkthrough/step_04.png)

`17 > 15` — the target is **to the left**: drop the right half of the index (`end = mid - 1`). The window `[start, end]` narrowed. Index probes: 2.

#### Step 05

![Determine the block (branch: general)](docs/images/en/walkthrough/step_05.png)

Phase 1 is done. Branch `general` fired: the target lies between adjacent pillars, so `search_range = [4, 8)`. This is the **block** of the main array (blue frame); the other blocks are dimmed. Next — a linear scan of **only** this block.

#### Step 06

![Phase 2: checking array\[4] in the block](docs/images/en/walkthrough/step_06.png)

**Phase 2 (linear in the block).** The cursor moves to position `4` of the block (the pink cell). We compare `array[4] = 9` with `15`: `if array[i] == target` is highlighted. Is it a match?

#### Step 07

![Phase 2: checking array\[4] in the block](docs/images/en/walkthrough/step_07.png)

`9 ≠ 15` — not the right element. Cell 4 is discarded (✗); the loop moves on to the next index of the block. Sequential comparisons: 1.

#### Step 08

![Phase 2: checking array\[5] in the block](docs/images/en/walkthrough/step_08.png)

**Phase 2 (linear in the block).** The cursor moves to position `5` of the block (the pink cell). We compare `array[5] = 11` with `15`: `if array[i] == target` is highlighted. Is it a match?

#### Step 09

![Phase 2: checking array\[5] in the block](docs/images/en/walkthrough/step_09.png)

`11 ≠ 15` — not the right element. Cell 5 is discarded (✗); the loop moves on to the next index of the block. Sequential comparisons: 2.

#### Step 10

![Phase 2: checking array\[6] in the block](docs/images/en/walkthrough/step_10.png)

**Phase 2 (linear in the block).** The cursor moves to position `6` of the block (the pink cell). We compare `array[6] = 13` with `15`: `if array[i] == target` is highlighted. Is it a match?

#### Step 11

![Phase 2: checking array\[6] in the block](docs/images/en/walkthrough/step_11.png)

`13 ≠ 15` — not the right element. Cell 6 is discarded (✗); the loop moves on to the next index of the block. Sequential comparisons: 3.

#### Step 12

![Phase 2: checking array\[7] in the block](docs/images/en/walkthrough/step_12.png)

**Phase 2 (linear in the block).** The cursor moves to position `7` of the block (the pink cell). We compare `array[7] = 15` with `15`: `if array[i] == target` is highlighted. Is it a match?

#### Step 13

![Phase 2: a match at position 7](docs/images/en/walkthrough/step_13.png)

`15 = 15` — a match! `return i` returns position **7** (the green cell ✓), and the search stops. Index probes: 2, block comparisons: 4.

#### Step 14

![Done](docs/images/en/walkthrough/step_14.png)

Result: `15` is found at position **7**. In total **2** index probes (phase 1) + **4** sequential block comparisons (phase 2) = **6**. That is the `O(log n + m)` hybrid.

## 11. Properties, pros and cons

| Property | Value |
|---|---|
| **Precondition** | the array is **sorted** (as for binary search) |
| **Time (phase 1)** | `O(log n)` — binary search over the index |
| **Time (phase 2)** | `O(m)` — block scan (`m` ≈ `step`) |
| **Time (total)** | **`O(log n + m)`**; with step `√n` ≈ `O(√n)` |
| **Extra memory** | `O(n / step)` — the index table |
| **Duplicates** | the block scan returns the **first** occurrence (stable, leftmost) |
| **Array** | **not modified** during the search |

**Pros:**

- **faster** than a plain sequential search;
- effective for **large** data sets;
- naturally fits structures where **updates are rare and search is a constant operation** (databases, file systems).

**Cons:**

- needs **extra memory** for the index table;
- the table must be **updated** on every change to the main array;
- requires **sorted** data.

So the method's niche is **rare updates + frequent search** over large sorted sets: the index is built once and then speeds up search many times over.

## 12. Place in the series: search over sorted data

This is the **third and final** search algorithm in the series — the point where linear and binary search over sorted data (which [sorting](https://github.com/MarynaShavlak/algo-bubble-sort) provides) converge:

| Search | Data | Time | Idea |
|---|---|---|---|
| [**Linear**](https://github.com/MarynaShavlak/algo-linear-search) | any (including unsorted) | `O(n)` | scan in order |
| [**Binary**](https://github.com/MarynaShavlak/algo-binary-search) | **sorted** | `O(log n)` | halve the range each time |
| **Indexed sequential** | **sorted** | `O(log n + m)` | **hybrid**: binary over the index + linear in the block |

Indexed sequential search is the **synthesis** of the first two: it takes the `O(log n)` narrowing from [binary](https://github.com/MarynaShavlak/algo-binary-search) and the `O(m)` scan from [linear](https://github.com/MarynaShavlak/algo-linear-search), applying each where it fits best.

## 13. Summary

- **Indexed sequential search** is a hybrid two-phase method over two data levels: a **binary** search over a sparse index table (phase 1) + a **sequential** search in the chosen block (phase 2).
- **Precondition** — a sorted array (a link to sorting and binary search). The array is **not modified**.
- **Complexity** — `O(log n + m)`: when the block `m` is small, `O(log n)` dominates. The hybrid sits between linear `O(n)` and binary `O(log n)`.
- The **step `step`** balances table size against block length; the optimum is near `√n` (a bridge to **Jump Search**).
- On the array `[1, 3, …, 25]` searching for `15` costs **2 index probes + 4 block comparisons = 6**; searching for the pillar key `9` — just **1 probe**.
- The **niche** is large sorted sets with **rare updates and frequent search** (databases, file systems): the index is built once and speeds up search many times over.

