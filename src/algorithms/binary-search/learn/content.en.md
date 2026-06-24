# Binary Search: a step-by-step walkthrough

**Binary search** is a fast way to find a value in a **sorted** array. The idea is the same as in the "guess the number" game: look at the **middle** of the range and compare it with the target. If you hit it — done. If not — **drop the whole half** that cannot contain the target, and repeat with what remains. Each step halves the range, so even in an array of a million elements the answer is found in about two dozen steps.

That speed has a price: the array **must be sorted**. This is a direct bridge to sorting (it is what makes fast search possible) and a clear contrast with [linear search](https://github.com/MarynaShavlak/algo-linear-search): linear search works on any data, even unordered, but in $O(n)$ — while binary search on sorted data gives $O(\log n)$.

## 1. Intuition: the "guess the number" game

Imagine a game: your opponent picked a number from 1 to 100, you have to guess it, and for each guess you only hear "higher" or "lower". The smartest strategy is to always name the **middle** of the current range: the "higher/lower" answer immediately **drops half** of the candidates. This way 7 guesses (since $2^7 = 128 > 100$) suffice for any number — instead of 100 one-by-one guesses.

![Guess the number by halving](docs/images/en/intuition_guess.png)

Binary search is that same strategy applied to a **sorted array**: the "middle" is the element `arr[mid]`, and the "higher/lower" answer is given to us precisely by the **orderedness** of the data (if `arr[mid]` is smaller than the target, the target is definitely on the right, because everything on the left is even smaller).

## 2. The idea: look at the middle, drop a half

We keep a **range** (window) of possible positions — from `low` to `high`. At each step:

1. compute the middle `mid = (low + high) // 2`;
2. compare `arr[mid]` with the target `x`:
   - `arr[mid] < x` → the target is on the **right**, drop the left half: `low = mid + 1`;
   - `arr[mid] > x` → the target is on the **left**, drop the right half: `high = mid - 1`;
   - `arr[mid] == x` → **found**, return `mid`;
3. if `low > high` — the range is empty, the element is absent, return `-1`.

![Checked the middle → dropped a half](docs/images/en/intuition_window.png)

At each step the window `[low..high]` halves. That is exactly why there are only about $\log_2 n$ steps, not $n$.

## 3. Precondition: the array MUST be sorted

The whole correctness of the method rests on one condition: **the array is sorted in ascending order**. Only then can the comparison of `arr[mid]` with `x` reliably tell which half to search and which to drop. On unordered data binary search may "throw away" the half that actually contains the target and return `-1` for a present element.

This is the method's main **price** — and the direct link to sorting: it is what prepares the data for fast search. This is where the boundary with [linear search](https://github.com/MarynaShavlak/algo-linear-search) lies:

| | Linear search | Binary search |
|---|---|---|
| **Data** | any (unordered) | must be **sorted** |
| **Time** | $O(n)$ | $O(\log n)$ |
| **How it searches** | scans one by one, left to right | looks at the middle, drops a half |

The `is_sorted` helper checks the precondition.

## 4. Example — array `[1, 3, 5, 8, 10, 12, 15, 18, 20, 22, 24]`, searching for 15

### The example array

We work with a sorted array of 11 elements and search it for the value `x = 15`:

| index | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| **value** | 1 | 3 | 5 | 8 | 10 | 12 | 15 | 18 | 20 | 22 | 24 |

![Sorted array, the whole window active](docs/images/en/array_intro.png)

At the start the window spans the whole array: `low = 0`, `high = 10`. The badge on top reminds us what we are searching for.

### The base implementation

Here is the base implementation — the one we walk through line by line:

```python
def binary_search(arr, x):
    low = 0
    high = len(arr) - 1
    mid = 0

    while low <= high:

        mid = (high + low) // 2

        # if x is greater than the middle value, ignore the left half
        if arr[mid] < x:
            low = mid + 1

        # if x is less than the middle value, ignore the right half
        elif arr[mid] > x:
            high = mid - 1

        # otherwise x is present at this position and we return it
        else:
            return mid

    # if the element was not found
    return -1
```

What is what:

- `low`, `high` — the bounds of the current window (initially the whole array: from `0` to `len(arr) - 1`);
- `while low <= high` — while the window is **not empty**, there is somewhere to search;
- `mid = (high + low) // 2` — the index of the middle of the window (integer division);
- `if arr[mid] < x` → the target is greater than the middle, so it is on the right — **drop the left half** (`low = mid + 1`);
- `elif arr[mid] > x` → the target is less than the middle, it is on the left — **drop the right half** (`high = mid - 1`);
- `else` → `arr[mid] == x`, **found** — return the index `mid`;
- `return -1` — we left the loop (`low > high`), the window is empty — the element is absent.

The instrumented version `binary_search_steps` repeats this code **step for step**, but after every comparison it records a snapshot of the window `[low..high]` and the probe `mid` — all the pictures below are assembled from those snapshots.

### How to read the frames

- 🟦 **blue cells** — the active window `[low..high]`, where `x` may still be;
- 🩶 **muted cells** — already discarded halves (outside the window);
- 🟥 **light-red cells with ✗** — the half being discarded *right now*;
- 🌸 **pink cell** — `mid`, the current probe (its value is compared with `x`);
- 🟢 **green cell** — the found match (`arr[mid] == x`);
- the **`low` / `high`** pointers (blue bracket under the row) and **`mid`** (pink ▼) are labeled;
- on top — the "searching for: x" badge; below the frame — the step **verdict** and the **step counter**.

### Step by step: the window `[low..high]` halves

**Step 1.** Window `[0..10]`, `mid = (10 + 0) // 2 = 5`. Probe `arr[5] = 12`. Since `12 < 15`, the target is on the right — we drop the left half (`low = mid + 1 = 6`):

![Step 1: arr[5]=12 < 15, drop the left half](docs/images/en/step_intro_0.png)

**Step 2.** Window `[6..10]`, `mid = (10 + 6) // 2 = 8`. Probe `arr[8] = 20`. Since `20 > 15`, the target is on the left — we drop the right half (`high = mid - 1 = 7`):

![Step 2: arr[8]=20 > 15, drop the right half](docs/images/en/step_intro_1.png)

**Step 3.** Window `[6..7]`, `mid = (7 + 6) // 2 = 6`. Probe `arr[6] = 15`. It is a match — we return index `6`:

![Step 3: arr[6]=15 = 15, found](docs/images/en/step_intro_2.png)

### Step table

The same walkthrough as a table `low/high/mid/arr[mid]/x/found?` — all indices are **absolute** (into the original array), so the last `mid` for a found value is the answer:

```text
step | low | high | mid | arr[mid] |  x | found?
-----+-----+------+-----+----------+----+-------
   1 |   0 |   10 |   5 |       12 | 15 |     no
   2 |   6 |   10 |   8 |       20 | 15 |     no
   3 |   6 |    7 |   6 |       15 | 15 |    yes
```

> **A note about indices.** A common variant of the table renumbers indices from zero for each subarray — then steps 2 and 3 are shown as `low=0, high=4, mid=2` and `low=0, high=1, mid=0`, and the match is at "relative" index 0 in the sublist `[15, 18]`. Our instrumented version keeps **absolute** indices into the original array, so the match is at index **6** (the true position of the value 15). Both descriptions are about the same search, just with a different frame of reference.

### The big picture: window evolution

All steps one under another — you can see how the window `[low..high]` halves each time, the discarded halves fade out, and the probe `mid` jumps to the new middle:

![Window evolution: halving at every step](docs/images/en/evolution_intro.png)

### Result

![Found at index 6](docs/images/en/result_intro.png)

The console summary:

```text
Array:   [1, 3, 5, 8, 10, 12, 15, 18, 20, 22, 24]
Target:  15
Result: index 6   ·   steps: 3
```

The same algorithm on the base example (`binary_search([2, 3, 4, 10, 40], 10)`) prints:

```text
Element is present at index 3
```

### One more: searching for 18 (4 steps)

Note: if we searched the same array for `18`, it would take **4** steps. Let us check — `18` is at index 7, so after three narrowings the window shrinks to a single cell only on the fourth step:

```text
step | low | high | mid | arr[mid] |  x | found?
-----+-----+------+-----+----------+----+-------
   1 |   0 |   10 |   5 |       12 | 18 |     no
   2 |   6 |   10 |   8 |       20 | 18 |     no
   3 |   6 |    7 |   6 |       15 | 18 |     no
   4 |   7 |    7 |   7 |       18 | 18 |    yes
```

## 5. Logarithm: how many times to halve

Why exactly $\log_2 n$ steps? Because each step shrinks the window by half: $n \to n/2 \to n/4 \to \dots \to 1$. The **logarithm** $\log_2 n$ is precisely the answer to "how many times do we halve $n$ to reach 1" (equivalently: "to what power must we raise 2 to get $n$", since $2^{\log_2 n} = n$).

![Logarithm: how many times to halve n](docs/images/en/log_explainer.png)

A few examples: $\log_2 8 = 3$ (since $2^3 = 8$), $\log_2 16 = 4$ (since $2^4 = 16$), $\log_2 1024 = 10$. In algorithm theory the base is often dropped and people just say $\log n$ — meaning the binary logarithm.

That same binary logarithm answers "how many **bits** do we need": 1 bit encodes 2 states, 2 bits — $2^2 = 4$, 8 bits (a byte) — $2^8 = 256$ combinations. Halving is a universal way to thin out a space of options, and binary search is its cleanest example.

## 6. `O(log n)` complexity and the chart vs linear search

The main consequence: **doubling $n$ adds only ONE step**:

```text
  n =        10 → up to 4 steps (binary) vs 10 (linear)
  n =       100 → up to 7 steps (binary) vs 100 (linear)
  n =      1000 → up to 10 steps (binary) vs 1000 (linear)
  n =     10000 → up to 14 steps (binary) vs 10000 (linear)
  n =    100000 → up to 17 steps (binary) vs 100000 (linear)
  n =   1000000 → up to 20 steps (binary) vs 1000000 (linear)
```

Comparing the efficiency of the two search algorithms gives this chart: linear search is a straight line $\approx n$ (blue), binary search is an almost flat curve $\approx \log_2 n$ (green).

![Comparison of linear and binary search](docs/images/en/linear_vs_binary.png)

For linear search every extra element is one extra step (hence the straight diagonal). For binary search, as the data grows the number of steps increases **negligibly** — that is exactly what $O(\log n)$ means. This is why on large **sorted** data binary search is unreachably faster than [linear](https://github.com/MarynaShavlak/algo-linear-search).

## 7. Recursive variant

The same logic is naturally written with **recursion** — each time reducing the problem to a half-sized subrange (a clear example of the [divide-and-conquer](https://github.com/MarynaShavlak/algo-quick-sort) strategy, as in quicksort or [merge sort](https://github.com/MarynaShavlak/algo-merge-sort)):

```python
def binary_search_recursive(arr, x, low=0, high=None):
    if high is None:
        high = len(arr) - 1
    if low > high:                      # empty range → the element is absent
        return -1
    mid = (high + low) // 2
    if arr[mid] < x:                    # target on the right → drop the left half
        return binary_search_recursive(arr, x, mid + 1, high)
    elif arr[mid] > x:                  # target on the left → drop the right half
        return binary_search_recursive(arr, x, low, mid - 1)
    else:                              # arr[mid] == x → found
        return mid
```

The result is **byte-for-byte** the same as the iterative `binary_search` (verified by both the example and the tests).

## 8. Bounds `lower_bound` / `upper_bound` and duplicates

If the array has **duplicates**, the base `binary_search` returns **some** matching index — not necessarily the first one. To find the **first** or **last** occurrence (or the spot to insert `x` while keeping order), one uses **bound** searches in the spirit of the standard [`bisect`](https://docs.python.org/3/library/bisect.html) module:

- `lower_bound(arr, x)` — the first index where `arr[i] >= x` (= `bisect.bisect_left`): the **first occurrence** or the insertion point;
- `upper_bound(arr, x)` — the first index where `arr[i] > x` (= `bisect.bisect_right`): **past the last occurrence**.

Together they give the half-open range of all occurrences `[lower_bound, upper_bound)`, and hence their count:

```text
Duplicates [1, 2, 2, 2, 3, 4], searching for 2:
  binary_search → 2 (some matching index)
  lower_bound  → 1 (first occurrence)
  upper_bound  → 4 (past the last occurrence; where to insert another 2)
  number of occurrences = upper_bound − lower_bound = 3
  standard bisect: bisect_left=1, bisect_right=4 — matches ✓
```

![Duplicates: binary_search, lower_bound, upper_bound](docs/images/en/variants_duplicates.png)

## 9. Pitfalls: off-by-one and `mid` overflow

Binary search is notorious for being easy to get wrong — despite the simplicity of the idea. The most typical pitfalls:

- **Loop bounds `<=` vs `<`.** In the base version the condition is `while low <= high` with `high = len(arr) - 1` (an inclusive bound). If you write `while low < high`, you must move the bounds differently — otherwise you can "skip over" a single-element window and miss the match.
- **The `mid ± 1` is mandatory.** After a probe we move `low = mid + 1` or `high = mid - 1` — exactly `±1`, because we have already checked and discarded `arr[mid]`. If you leave `low = mid` or `high = mid`, the window may stop shrinking — and the loop will hang.
- **Overflow of `(low + high)`.** In languages with bounded integers (C, Java) the sum `low + high` may overflow on large arrays. The safe idiom is to compute the middle as `mid = low + (high - low) // 2`: the same result, but without overflow. In Python integers are unbounded, so the formula `(high + low) // 2` is safe — but the idiom is worth knowing.

> A general tip: keep the **invariant** in mind — "if `x` is in the array, it is in the current window `[low..high]`". Every step must preserve this invariant and **strictly shrink** the window; then neither off-by-one nor an infinite loop will happen.

## 10. Animations

The same thing in motion — the window `[low..high]` halves, the probe `mid` jumps to the new middle, the discarded halves fade out.

▶️ The main case — `15` found in 3 steps:

![Animation: searching for 15](docs/images/en/search_intro.gif)

▶️ The best case — `12` is the very first `mid` (1 step, $O(1)$):

![Animation: best case](docs/images/en/search_best.gif)

▶️ An absent element — a full $\log n$ descent until the window empties (`low > high`) → `-1`:

![Animation: absent element](docs/images/en/search_absent.gif)

## 11. Stepping through the code: "code ↔ array" panels

The examples above showed the *result* of each step. Here is **the code itself in action**: on the left a fragment of the algorithm with **highlighted active lines**, on the right the window at that exact moment. **The color of a code line encodes what is happening:** 🟡 the line runs now (loop / `mid = …` / a check), 🟦 the half-dropping branch fired (`low = mid + 1` / `high = mid - 1`), 🟢 `arr[mid] == x` → `return mid`, 🔴 the window emptied → `return -1`.

We build this for the main instance (searching for 15). Each row of the grid is one decision (you can see which branch fired and how the window shrank):

![Code ↔ array: searching for 15](docs/images/en/code_steps_intro.png)

▶️ The animated version — between the "decisions" there are intermediate frames "compute `mid`, compare `arr[mid]` with `x`?":

![Animation: code ↔ array](docs/images/en/code_walk_intro.gif)

## 12. Full step-by-step trace of `15`

Below is the same execution, but **in full**: every `mid` computation, every comparison and half-dropping as a separate "code ↔ array" frame, in the correct order, with a detailed explanation under each. The cell colors are the same as in the legend above. The block is generated automatically from the event journal.

#### Step 00

![Start: window [0..10]](docs/images/en/walkthrough/step_00.png)

The initial window spans the whole array `[1, 3, 5, 8, 10, 12, 15, 18, 20, 22, 24]`: `low = 0`, `high = 10`. We search for `15`. All cells are active (blue); the number below a cell is its index. In the code, the `low`/`high` initialization is highlighted.

#### Step 01

![Step 1: low=0, high=10, mid=5](docs/images/en/walkthrough/step_01.png)

Step 1. Window `[low=0, high=10]`. We compute the middle `mid = (high + low) // 2 = 5`; the probe is `arr[5] = 12` (pink). `mid = …` and `if arr[mid] < x` are highlighted. We compare `12` with `x = 15`.

#### Step 02

![Step 1: low=0, high=10, mid=5](docs/images/en/walkthrough/step_02.png)

`arr[5] = 12 < 15`: the target is larger, so it is on the **right**. We drop the left half (red cells with ✗) — set `low = mid + 1 = 6`. The window halved. Steps: 1.

#### Step 03

![Step 2: low=6, high=10, mid=8](docs/images/en/walkthrough/step_03.png)

Step 2. Window `[low=6, high=10]`. We compute the middle `mid = (high + low) // 2 = 8`; the probe is `arr[8] = 20` (pink). `mid = …` and `if arr[mid] < x` are highlighted. We compare `20` with `x = 15`.

#### Step 04

![Step 2: low=6, high=10, mid=8](docs/images/en/walkthrough/step_04.png)

`arr[8] = 20 > 15`: the target is smaller, so it is on the **left**. We drop the right half (red cells with ✗) — set `high = mid - 1 = 7`. The window halved. Steps: 2.

#### Step 05

![Step 3: low=6, high=7, mid=6](docs/images/en/walkthrough/step_05.png)

Step 3. Window `[low=6, high=7]`. We compute the middle `mid = (high + low) // 2 = 6`; the probe is `arr[6] = 15` (pink). `mid = …` and `if arr[mid] < x` are highlighted. We compare `15` with `x = 15`.

#### Step 06

![Step 3: low=6, high=7, mid=6](docs/images/en/walkthrough/step_06.png)

`arr[6] = 15 = 15`: a match! The cell turns green, we return index `6`. The `else: return mid` branch is highlighted. Total steps: 3.

#### Step 07

![Done](docs/images/en/walkthrough/step_07.png)

Result: `15` is found at index `6` in 3 steps. `return mid` is highlighted.

## 13. Complexity and properties

How much work binary search does depends on where (and whether) the target lies:

| Case | Steps | When it happens |
|---|---|---|
| **Best** | $O(1)$ | the target is the very first `mid` |
| **Average** | $O(\log n)$ | a random position |
| **Worst** | $O(\log n)$ | the element is absent or a "leaf" of the search tree (a full descent to `low > high`) |

![Case analysis: how many steps to the result](docs/images/en/cases.png)

Other properties:

- **Precondition — sortedness:** without it the algorithm is incorrect (its main price).
- **Extra memory — $O(1)$** (iterative version); the recursive one is $O(\log n)$ on the call stack.
- **Random access required** to `arr[mid]` in $O(1)$: the method is great for arrays but **not for linked lists** (where you cannot reach the middle in $O(1)$).
- **The number of steps** in the worst case is exactly $\lfloor \log_2 n \rfloor + 1$.

## 14. Limitations: when binary search does not fit

- **The data is not sorted.** Then either sort it first (which is $O(n \log n)$), or search [linearly](https://github.com/MarynaShavlak/algo-linear-search) in $O(n)$.
- **A single search on unordered data.** Sorting an array for **one** answer is not worth it: $O(n \log n)$ for sorting is more expensive than $O(n)$ for a linear scan. Binary search wins when **many** searches are done over the same sorted data — then the one-off cost of sorting pays off.
- **A structure without random access** (a linked list): there is no fast access to the middle — the advantage disappears.

## 15. Where it is appropriate

- **Many searches over the same data:** sort once — and every subsequent query is $O(\log n)$ (dictionaries, database indexes, reference tables).
- **Bounds and ranges:** `lower_bound` / `upper_bound` (the `bisect` module) — order-preserving insertion, counting occurrences, "how many elements $\le x$" queries.
- **Binary search on the answer:** when the answer is monotone in a parameter — we search for it binary-style, even without an explicit array.
- **Everywhere the "drop half" principle works:** from guessing a number to debugging (`git bisect`).

## 16. Place in the series: search and sorting

This is the **second** search algorithm in the series — the "reward for sorting". [Linear search](https://github.com/MarynaShavlak/algo-linear-search) works on any data in $O(n)$; binary search requires a **sorted** input but gives $O(\log n)$. And that sorted data is prepared precisely by the sorting walkthroughs:

| Algorithm | What it does | Complexity |
|---|---|---|
| [Linear search](https://github.com/MarynaShavlak/algo-linear-search) | brute-force search (unordered data) | $O(n)$ |
| **Binary search** | search by halving (sorted data) | $O(\log n)$ |
| [Bubble](https://github.com/MarynaShavlak/algo-bubble-sort) · [Insertion](https://github.com/MarynaShavlak/algo-insertion-sort) · [Selection](https://github.com/MarynaShavlak/algo-selection-sort) | simple sorts | $O(n^2)$ |
| [Quick](https://github.com/MarynaShavlak/algo-quick-sort) · [Merge](https://github.com/MarynaShavlak/algo-merge-sort) · [Shell](https://github.com/MarynaShavlak/algo-shell-sort) · [Radix](https://github.com/MarynaShavlak/algo-radix-sort) | efficient sorts | $O(n \log n)$ and better |

The summary picture of search: **unordered data — $O(n)$ (linear), sorted — $O(\log n)$ (binary).** Sorting is an investment that makes every subsequent search nearly instant.

## 17. Summary

- **Binary search** on a sorted array looks at the middle of the range and drops a half; it repeats until it finds the value or the window empties.
- **The precondition** is a **sorted** array; this is the method's main price and the direct link to sorting.
- **Complexity** is $O(\log n)$: doubling $n$ adds only one step; the best case is $O(1)$.
- **The signature visualization** is the window `[low..high]` halving, with the probe `mid` and the dimmed discarded halves.
- **Variants:** iterative and recursive (the same answer); the bounds `lower_bound` / `upper_bound` for duplicates (the standard `bisect`).
- **Pitfalls:** off-by-one (`<=` / `mid ± 1`) and overflow — the safe idiom `mid = low + (high - low) // 2`.
- On the array `[1, 3, 5, 8, 10, 12, 15, 18, 20, 22, 24]` searching for `15` costs **3 steps** (index 6), searching for `18` — **4 steps** (index 7), and the best case (`12`) — **1 step**.

