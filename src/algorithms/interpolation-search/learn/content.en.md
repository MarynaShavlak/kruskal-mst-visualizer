# Interpolation Search: a step-by-step walkthrough

**Interpolation search** is the "smart" relative of [binary search](https://github.com/MarynaShavlak/algo-binary-search) on a **sorted** array. The skeleton is the same: keep a window `[low..high]`, look at one probe, and drop the part that cannot contain the target. The difference is **where** to place the probe. Binary search always takes the **middle**. Interpolation search **guesses** the position from the key's value: it computes it with a **linear-interpolation formula** — closer to the upper bound for large keys, closer to the lower bound for small ones. It is like looking up a word in a dictionary: for a word starting with "Z" you do not open the book in the middle, you flip straight to the end.

That cleverness has a price and conditions. First, the array **must be sorted** (just like for binary search — a direct bridge to [sorting](#series)). Second, the method is best when the keys are distributed **uniformly**: then it finds the answer in **$O(\log \log n)$** probes — often 1–2 regardless of size. On **clustered** (non-uniform) data the formula misses systematically, and the method **degrades** all the way to $O(n)$ — slower than binary. So this is an honest, two-sided walkthrough: both the strength and the weakness.

## 1. Intuition: searching a dictionary

Imagine looking up a word in a paper dictionary. You do **not** open it exactly in the middle every time (as binary search would). For a word starting with "A" you flip straight to the beginning, and for a word starting with "Z" — straight to the end. Intuitively you **project** the value (the letter) onto a position (a page), assuming the letters are spread through the book more or less uniformly.

![Intuition: a word starting with "Z" — flip straight to the end](docs/images/en/intuition_dictionary.png)

That is interpolation search. On a sorted array with uniform values we build a **straight-line model** of "position ↔ value" and drop the key's projection onto it — getting the approximate probe position. If the data really is uniform, the very first guess is almost exact.

## 2. The formula: the heart of the method

All the "cleverness" of the method is in one formula that estimates the probe position `pos`:

$$pos = lo + \frac{key - arr[lo]}{arr[hi] - arr[lo]} \times (hi - lo)$$

Each term has a simple meaning:

| Term | What it is |
|---|---|
| $pos$ | the estimated (interpolated) position of the element in the array |
| $lo$, $hi$ | the minimum and maximum indices of the current window |
| $key$ | the value we are searching for |
| $arr$ | the array we search in |
| $\dfrac{key - arr[lo]}{arr[hi] - arr[lo]}$ | the **fraction of the value range** — how far `key` has advanced from the lower bound to the upper one (a number in $[0, 1]$) |
| $\times\,(hi - lo)$ | we lay off the same fraction of the **index range** |

In words: **whatever fraction of the value range `key` makes up, we lay off the same fraction of the index range** starting from `lo`. If `key` is exactly in the middle by value — the probe is in the middle by index (as in binary search); if `key` is near `arr[hi]` — the probe shifts to the right edge.

> **Link to the code.** In the implementation the formula is written in an equivalent form with an integer floor and `float`, to avoid integer truncation in the intermediate step:
> ```python
> index = low + int((float(high - low) / (arr[high] - arr[low])) * (x - arr[low]))
> ```
> It is the same expression with the factors reordered, and `int(...)` rounds the estimate down to an integer index.

## 3. The idea: guess a probe, check, adjust

We keep a **window** `[low..high]` of possible positions. At each step:

1. determine `low`, `high`, `key`;
2. compute the probe `index` with the **formula**;
3. if `arr[index] == key` → **found**, return `index`;
4. if `arr[index] < key` → the key is on the **right**, move `low = index + 1`, repeat from step 2;
5. if `arr[index] > key` → the key is on the **left**, move `high = index - 1`, repeat from step 2.

The skeleton is exactly like binary search (a window, narrowing by comparison), but instead of the middle `mid = (low + high) // 2` there is an **interpolated probe** based on the value. The loop runs while the window is non-empty **and** the key lies within the current value range — for the second condition (the guard) see the [pitfalls](#pitfalls).

## 4. Preconditions: sortedness and uniformity

The method has **two** conditions — and these are its limitations:

1. **The array is sorted ascending.** Just like for binary search: only then can the comparison of `arr[index]` with `key` confidently drop a part of the array. This is a direct link to [sorting](#series) — it is sorting that prepares the data. The `is_sorted` utility in [`interpolation_search/core.py`](interpolation_search/core.py) helps check it.
2. **The keys are distributed uniformly.** The formula guesses accurately only when the data lies close to a straight line. On **clustered** data (for example, one huge "outlier") the probe misses systematically, and the method [degrades](#vs-binary).

| | Binary search | Interpolation search |
|---|---|---|
| **Probe** | middle `(low + high) // 2` | interpolated position (formula) |
| **Data** | any **sorted** | sorted **+ preferably uniform** |
| **Expected** | $O(\log n)$ | $O(\log \log n)$ (uniform) |
| **Worst** | $O(\log n)$ | $O(n)$ (clustered — degradation) |

## 5. Demo 1 — `[1, 3, 5, 7, 9, 11, 13, 15, 17, 19]`, searching for 15

### The example array

We work with a sorted array of 10 elements (a uniform step of 2) and search for `key = 15`:

| index | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 |
|---|---|---|---|---|---|---|---|---|---|---|
| **value** | 1 | 3 | 5 | 7 | 9 | 11 | 13 | 15 | 17 | 19 |

![Sorted array, the whole window is active](docs/images/en/array_demo1.png)

At the start the window spans the whole array: `low = 0`, `high = 9`. The badge on top is a reminder of what we are searching for.

### Base implementation

Here is the base implementation — the one we walk through line by line (the full documented version is in [`interpolation_search/core.py`](interpolation_search/core.py)):

```python
def interpolation_search(arr, x):
    low = 0
    high = len(arr) - 1

    while low <= high and x >= arr[low] and x <= arr[high]:
        index = low + int(((float(high - low) / (arr[high] - arr[low])) * (x - arr[low])))

        if arr[index] == x:
            return index

        if arr[index] < x:
            low = index + 1
        else:
            high = index - 1

    return -1
```

What is what:

- `low`, `high` — the bounds of the current window (initially the whole array: from `0` to `len(arr) - 1`);
- `while low <= high and x >= arr[low] and x <= arr[high]` — while the window is **non-empty** *and* the key lies **within the value range** `[arr[low], arr[high]]` (the second part is a guard: if `key` is outside the value range, there is nothing to search for);
- `index = low + int(...)` — the probe by the **formula** (an interpolated position, **not** the middle);
- `if arr[index] == x` → **found**, return `index`;
- `if arr[index] < x` → the key is larger than the probe, it is on the right — move `low = index + 1`;
- `else` → `arr[index] > x`, the key is on the left — move `high = index - 1`;
- `return -1` — we left the loop (the window became empty or the key is out of range) — the element is absent.

The educational version [`interpolation_search_steps`](interpolation_search/core.py) repeats this code **action for action**, but after each probe records a snapshot: the bounds `[low..high]`, the values at them, the **interpolation fraction** and the computed `index` — all the pictures below are built from these snapshots.

### How to read the frames

- 🟦 **blue cells** — the active window `[low..high]`, where `key` may still be;
- 🩶 **muted cells** — already dropped parts (outside the window);
- 🟥 **light-red cells with ✗** — the part being dropped right *now*;
- 🌸 **pink cell** — `index`, the current probe (**shifted**, not in the middle!);
- 🟢 **green cell** — the match found (`arr[index] == key`);
- the **`low` / `high`** pointers (blue bracket below the row) and **`index`** (pink ▼) are labeled;
- on top is the "searching for: key" badge; below the frame — the **formula** with numbers, the **verdict** and the **probe counter**.

### The straight-line model: the key's projection

The signature frame of the method is a two-dimensional `index ↔ value` chart. The points are the array's elements; the **purple line** connects the window's endpoints `(low, arr[low])` and `(high, arr[high])` (the linear model of the data); the **crimson horizontal** `y = key` crosses it at `(pos, key)`; from there we drop a vertical onto the index axis — and get the estimated position `pos`, with the probe `index = ⌊pos⌋`:

![Straight-line model: projecting key 15 → probe index=7](docs/images/en/line_demo1.png)

Here the data is **perfectly uniform** (an arithmetic progression), so the points lie exactly on the line, and the key `15`'s projection lands right on `index = 7` — where `15` actually is. This is a "perfect guess": the answer in **one** probe.

Plugging the numbers into the formula:

$$index = \left\lfloor 0 + \frac{15 - 1}{19 - 1} \times (9 - 0) \right\rfloor = \left\lfloor \frac{14}{18} \times 9 \right\rfloor = \lfloor 7.0 \rfloor = 7$$

### Probe by formula → found in one step

![Probe 1: the formula gives index=7, arr\[7]=15 — a match](docs/images/en/step_demo1_0.png)

The probe `index = 7` (pink, shifted). `arr[7] = 15 = key` — a match! We return `7`. Unlike binary search, which on this array would first check the middle (`index 4` or `5`), interpolation search hit the target immediately.

### Probe table and result

The same walkthrough as a `low/high/index/arr[index]/comparison` table (printed by [`examples/01_intro.py`](examples/01_intro.py)):

```text
probe | low | high | index | arr[index] | comparison
------+-----+------+-------+------------+-----------
    1 |   0 |    9 |     7 |         15 |  15 = 15 ✓
```

The console summary:

```text
Array:   [1, 3, 5, 7, 9, 11, 13, 15, 17, 19]
Target:  15
Result: index 7   ·   probes: 1
```

The verbatim driver example:

```text
index = interpolation_search(arr, 15)   # 7
print(arr[index])                          # 15
```

## 6. Demo 2 — `[1, 3, 5, 7, 9, 11, 14, 16, 18, 20, 22, 25, 28, 30]`, searching for 25

### Two probes: guess, check, correct

Here the "guess" is not perfect — the data is almost uniform, but not quite. We search for `key = 25` in an array of 14 elements (`low = 0`, `high = 13`).

**Probe 1.** The formula gives:

$$index = \left\lfloor 0 + \frac{25 - 1}{30 - 1} \times (13 - 0) \right\rfloor = \left\lfloor \frac{24}{29} \times 13 \right\rfloor = \lfloor 10.76 \rfloor = 10$$

![Probe 1: index=10, arr\[10]=22 < 25 — correct low](docs/images/en/step_demo2_0.png)

`arr[10] = 22`, and `22 < 25` — too small. So the key is on the **right**: we move `low = index + 1 = 11` and compute the probe again.

**Probe 2.** Now the window is `[11..13]`, `arr[11] = 25`, `arr[13] = 30`:

$$index = \left\lfloor 11 + \frac{25 - 25}{30 - 25} \times (13 - 11) \right\rfloor = \lfloor 11 + 0 \rfloor = 11$$

![Probe 2: index=11, arr\[11]=25 — found](docs/images/en/step_demo2_1.png)

`arr[11] = 25 = key` — a match! We return `11`. This is the loop of refining the "guess", similar to binary search, but with a probe by formula. The probe table (printed by [`examples/02_adjusting.py`](examples/02_adjusting.py)):

```text
probe | low | high | index | arr[index] | comparison
------+-----+------+-------+------------+-----------
    1 |   0 |   13 |    10 |         22 |    22 < 25
    2 |  11 |   13 |    11 |         25 |  25 = 25 ✓
```

```text
Array:   [1, 3, 5, 7, 9, 11, 14, 16, 18, 20, 22, 25, 28, 30]
Target:  25
Result: index 11   ·   probes: 2
```

The verbatim driver example prints `25`:

```text
index = interpolation_search(arr, 25)   # 11
print(arr[index])                       # 25
```

### The big picture: window evolution

Both probes one below the other — you can see the window `[low..high]` narrows **asymmetrically**, and the probe sits **not in the middle** but where the key "projected" it:

![Window evolution: two probes, asymmetric narrowing](docs/images/en/evolution_demo2.png)

## 7. Complexity: `O(log log n)` vs `O(n)`

The expected complexity of interpolation search on **uniformly** distributed data is **$O(\log \log n)$**. That is incredibly small: the double logarithm grows so slowly that in practice the number of probes barely depends on the array's size (often 1–2 even on a million elements). Printed by [`examples/04_complexity.py`](examples/04_complexity.py):

```text
  n =       100 → interpolation 1 / binary 6 probes
  n =      1000 → interpolation 1 / binary 9 probes
  n =     10000 → interpolation 1 / binary 13 probes
  n =    100000 → interpolation 1 / binary 16 probes
  n =   1000000 → interpolation 1 / binary 19 probes
```

The chart shows the hierarchy: linear $O(n)$ (blue) grows like a straight line, binary $O(\log n)$ (green) slowly, and interpolation $O(\log \log n)$ (orange) is an almost **flat** line near the very bottom:

![Complexity curves: n vs log₂n vs log₂log₂n](docs/images/en/complexity.png)

But this is the **expected** case. In the **worst** one (clustered, non-uniform data) the method **degrades** to $O(n)$ — worse than binary:

```text
  n =   10 → interpolation   9 / binary 3 probes
  n =   20 → interpolation  19 / binary 4 probes
  n =   50 → interpolation  49 / binary 5 probes
  n =  100 → interpolation  99 / binary 6 probes
  n =  200 → interpolation 199 / binary 7 probes
  n =  500 → interpolation 499 / binary 8 probes
```

![Degradation: on clustered data interpolation loses to binary](docs/images/en/degradation.png)

The array here is `[1, 2, …, n-1, 1000000000]`: one huge "outlier" skews the straight-line model so that the formula keeps pointing almost at the start, and the method crawls one element at a time — pure $O(n)$. Binary, indifferent to values, stays $O(\log n)$.

## 8. Interpolation vs binary: who wins when

A direct contrast with [binary search](https://github.com/MarynaShavlak/algo-binary-search) — **the middle vs the interpolated position** — on the same array. Printed by [`examples/03_vs_binary.py`](examples/03_vs_binary.py):

```text
  uniform data (n=15), searching for 21: interpolation 1 / binary 4 probes
  clustered data (n=10), searching for 9: interpolation 9 / binary 3 probes
```

On **uniform** data the formula guesses almost exactly — interpolation finds `21` in **one** probe where binary makes four:

![Uniform data: interpolation wins](docs/images/en/vs_binary_uniform.png)

On **clustered** data (one outlier `1000`) the formula misses systematically — interpolation crawls through all cells (**9** probes), while binary, indifferent to values, makes only **3**:

![Clustered data: interpolation degrades](docs/images/en/vs_binary_clustered.png)

**Conclusion:** interpolation search wins on large **uniform** data and loses on **clustered** data. Binary is the more reliable "all-rounder": its $O(\log n)$ does not depend on the value distribution.

## 9. Recursive variant

The same logic is naturally written with **recursion** — reducing the problem to a smaller subrange each time (a parallel to recursive binary search, only the probe is computed by formula):

```python
def interpolation_search_recursive(arr, x, low=0, high=None):
    if high is None:
        high = len(arr) - 1
    if low > high or x < arr[low] or x > arr[high]:   # empty window / key out of range
        return -1
    index = low + int(((float(high - low) / (arr[high] - arr[low])) * (x - arr[low])))
    if arr[index] == x:                               # found
        return index
    if arr[index] < x:                                # key on the right → drop the left part
        return interpolation_search_recursive(arr, x, index + 1, high)
    else:                                             # key on the left → drop the right part
        return interpolation_search_recursive(arr, x, low, index - 1)
```

The result **matches verbatim** the iterative `interpolation_search` (both the examples and the tests verify this).

## 10. Pitfalls: division by zero and out-of-range probe

The textbook code has a **latent bug**:

- **Division by zero.** The formula's denominator is `arr[high] - arr[low]`. If all elements of the window are **equal** (for example the array `[7, 7, 7, 7]`, searching for `7`), then `arr[high] == arr[low]`, the denominator is zero, and the code raises `ZeroDivisionError`. The same trap fires on an array of **one element** (there `low == high`, so the bounds are equal too).

  > **Why does the loop guard not close this?** The condition `x >= arr[low] and x <= arr[high]` checks that the key lies *between* the bounds **by value**, but **not** that the bounds are *different*. When all elements equal `7` and we search for `7`, the guard passes (`7 >= 7 and 7 <= 7` is true), and we divide by zero right away.

- **Out-of-range probe.** The full form of the guard keeps `index` within `[low, high]` **as long as** the denominator is positive. But weaker variants of the algorithm (where the guard is only `while low <= high`, without the value check) can produce an `index` outside the window — and crash on `arr[index]` or loop forever.

## 11. Safe version

[`interpolation_search_safe`](interpolation_search/core.py) closes both pitfalls — an honest fix of the textbook code:

```python
def interpolation_search_safe(arr, x):
    low = 0
    high = len(arr) - 1
    while low <= high and x >= arr[low] and x <= arr[high]:
        if arr[high] == arr[low]:                 # degenerate value range
            return low if arr[low] == x else -1   #   → no division by zero
        index = low + int(((float(high - low) / (arr[high] - arr[low])) * (x - arr[low])))
        index = max(low, min(index, high))        # clamp the probe to the window (defense)
        if arr[index] == x:
            return index
        if arr[index] < x:
            low = index + 1
        else:
            high = index - 1
    return -1
```

Two changes: explicit handling of `arr[high] == arr[low]` (return `low` if the key is there, otherwise `-1`) and a **clamp** of `index` to `[low, high]`. On correct (distinct-bounds) data the result **matches** the base version — the tests verify this too.

## 12. Animations

The same in motion — the probe "jumps" to the interpolated position, the window narrows asymmetrically, and on the straight-line model you can see the key's projection move.

▶️ Demo 1 — a perfect guess: `15` found in **one** probe (generated by [`examples/01_intro.py`](examples/01_intro.py)):

![Animation: searching for 15 in one step](docs/images/en/search_demo1.gif)

▶️ Demo 2 — with correction: probe `10` (too small) → correction → probe `11` (generated by [`examples/02_adjusting.py`](examples/02_adjusting.py)):

![Animation: searching for 25 with correction](docs/images/en/search_adjust.gif)

▶️ Degradation — on clustered data the probe crawls one element at a time (generated by [`examples/03_vs_binary.py`](examples/03_vs_binary.py)):

![Animation: degradation on clustered data](docs/images/en/search_degrade.gif)

▶️ Absent element — the key is within the range, but it is not there → `-1`:

![Animation: absent element](docs/images/en/search_absent.gif)

## 13. Code execution step by step: code ↔ data panels

The examples above showed the *result* of each probe. Here is **the code in action**: on the left a fragment of the algorithm with **highlighted active lines**, in the middle the **straight-line model** with the key's projection, on the right the window with the shifted probe at that very moment. **The color of a code line encodes what is happening:** 🟡 the line runs now (the loop / `index = …` by formula / a check), 🟦 a bound-shift branch fired (`low = index + 1` / `high = index - 1`), 🟢 `arr[index] == x` → `return index`, 🔴 exit → `return -1`.

We build this for demo 2 (with correction); generated by [`examples/05_code_walkthrough.py`](examples/05_code_walkthrough.py). Each grid row is one decision:

![Code ↔ data: searching for 25](docs/images/en/code_steps_demo2.png)

▶️ The animated version — between the "decisions" there are frames "compute `index` by formula, compare `arr[index]` with `x`?":

![Animation: code ↔ data](docs/images/en/code_walk_demo2.gif)

## 14. Full step-by-step trace of `25`

Below is the same execution of demo 2, but **in full**: every computation of `index` by formula, every comparison and bound shift as a separate "code ↔ data" frame, in the right order, with a detailed explanation under each. The cell colors are the same as in the [legend above](#how-to-read). The block is generated automatically from the event journal (example [`examples/06_full_walkthrough.py`](examples/06_full_walkthrough.py)).

#### Step 00

![Start: window \[0..13]](docs/images/en/walkthrough/step_00.png)

The initial window spans the whole array `[1, 3, 5, 7, 9, 11, 14, 16, 18, 20, 22, 25, 28, 30]`: `low = 0`, `high = 13`. We search for `25`. All cells are active (blue); the number below a cell is its index. On the right is the straight-line model `(low, arr[low]) → (high, arr[high])`. In the code, the `low`/`high` initialization is highlighted.

#### Step 01

![Probe 1: low=0, high=13, index=10](docs/images/en/walkthrough/step_01.png)

Probe 1. Window `[low=0, high=13]`, boundary values `arr[0]=1`, `arr[13]=30`. The interpolation fraction is `(25−1)/(30−1) ≈ 0.83`, so `index = 0 + ⌊0.83·(13−0)⌋ = 10`. The probe `arr[10] = 22` (pink, **shifted** — not in the middle). We compare `22` with `x = 25`.

#### Step 02

![Probe 1: low=0, high=13, index=10](docs/images/en/walkthrough/step_02.png)

`arr[10] = 22 < 25`: the key is larger, so it is on the **right**. We move the lower bound `low = index + 1 = 11` (drop the left part — red cells with ✗). Probes: 1.

#### Step 03

![Probe 2: low=11, high=13, index=11](docs/images/en/walkthrough/step_03.png)

Probe 2. Window `[low=11, high=13]`, boundary values `arr[11]=25`, `arr[13]=30`. The interpolation fraction is `(25−25)/(30−25) ≈ 0.00`, so `index = 11 + ⌊0.00·(13−11)⌋ = 11`. The probe `arr[11] = 25` (pink, **shifted** — not in the middle). We compare `25` with `x = 25`.

#### Step 04

![Probe 2: low=11, high=13, index=11](docs/images/en/walkthrough/step_04.png)

`arr[11] = 25 = 25`: a match! The cell turns green, we return index `11`. The `if arr[index] == x: return index` branch is highlighted. Total probes: 2.

#### Step 05

![Done](docs/images/en/walkthrough/step_05.png)

Result: `25` is found at index `11` in 2 probes. `return index` is highlighted.

## 15. Complexity and properties

How much work interpolation search does depends on the **distribution** of the data:

| Case | Probes | When it happens |
|---|---|---|
| **Best** | $O(1)$ | uniform data, the key right at the interpolated position |
| **Expected** | $O(\log \log n)$ | sorted, **uniformly** distributed data |
| **Worst** | $O(n)$ | clustered / non-uniform data (degradation) |

Other properties:

- **Preconditions — sortedness and uniformity:** without the first the method is incorrect, without the second it is slow (this is its main price).
- **Extra memory — $O(1)$** (the iterative version); the recursive one — up to $O(\log \log n)$ on the stack on average, $O(n)$ in the worst case.
- **Requires random access** to `arr[index]` in $O(1)$: a method for arrays, not for linked lists.
- **The cost metric** is the number of **probes** (computations of `index`): `count_probes` counts it, and `count_binary_probes` counts the binary one (for contrast).

## 16. Limitations: when the method does not fit

- **Data is not sorted.** Then either sort first ($O(n \log n)$) or search [linearly](https://github.com/MarynaShavlak/algo-linear-search).
- **Data is distributed non-uniformly** (clustered, exponential, with outliers). Here interpolation degrades to $O(n)$ — the more reliable [binary search](https://github.com/MarynaShavlak/algo-binary-search) gives $O(\log n)$.
- **Small arrays.** The overhead of the formula does not pay off — binary is simpler and no slower.
- **A structure without random access** (a linked list): there is no fast access to `arr[index]`.

## 17. Where it is useful

- **Databases and uniformly distributed keys:** numeric indices, phone books, uniform identifiers — wherever values lie close to a straight line.
- **Large sorted uniform arrays:** the larger the array, the more noticeable the advantage of $O(\log \log n)$ over $O(\log n)$.
- **"Dictionary-style search":** anywhere the human intuition "for 'Z' flip to the end" works — that is exactly what interpolation formalizes.

## 18. Place in the series: search and sorting

This is the **fourth** search algorithm in the series — the "smart" development of [binary search](https://github.com/MarynaShavlak/algo-binary-search) on sorted data. [Linear search](https://github.com/MarynaShavlak/algo-linear-search) works on any data in $O(n)$; binary requires a sorted input and gives $O(\log n)$; [indexed sequential search](https://github.com/MarynaShavlak/algo-indexed-sequential-search) adds a sparse index; and interpolation, on **uniform** data, makes even fewer probes — $O(\log \log n)$. And it is the sorting walkthroughs that prepare the sorted data:

| Algorithm | What it does | Complexity |
|---|---|---|
| [Linear search](https://github.com/MarynaShavlak/algo-linear-search) | brute-force search (unordered data) | $O(n)$ |
| [Binary search](https://github.com/MarynaShavlak/algo-binary-search) | search by halving (sorted data) | $O(\log n)$ |
| [Indexed sequential search](https://github.com/MarynaShavlak/algo-indexed-sequential-search) | search by a sparse index | $O(\sqrt{n})$ |
| **Interpolation search** *(this repository)* | search by formula (uniform data) | $O(\log \log n)$ expected |
| [Bubble](https://github.com/MarynaShavlak/algo-bubble-sort) · [Insertion](https://github.com/MarynaShavlak/algo-insertion-sort) · [Selection](https://github.com/MarynaShavlak/algo-selection-sort) | simple sorts | $O(n^2)$ |
| [Quick](https://github.com/MarynaShavlak/algo-quick-sort) · [Merge](https://github.com/MarynaShavlak/algo-merge-sort) · [Shell](https://github.com/MarynaShavlak/algo-shell-sort) · [Radix](https://github.com/MarynaShavlak/algo-radix-sort) | efficient sorts | $O(n \log n)$ and better |

The summary picture of search: **unordered — $O(n)$ (linear), sorted — $O(\log n)$ (binary), and sorted-and-uniform — $O(\log \log n)$ (interpolation).**

## 19. Summary

- **Interpolation search** on a sorted array **guesses** the probe position with a linear-interpolation formula (rather than taking the middle, like binary), checks it and adjusts the window.
- **The formula** $pos = lo + \frac{key - arr[lo]}{arr[hi] - arr[lo]} \times (hi - lo)$: whatever fraction of the value range the key makes up, we lay off the same fraction of the index range.
- **The main visualization** is the straight-line model `(lo, arr[lo]) → (hi, arr[hi])` and the projection `y = key` → `pos`; the probe is always **shifted**, not in the middle.
- **Complexity** — $O(\log \log n)$ on uniform data (often 1–2 probes regardless of $n$), but $O(n)$ on clustered data (degradation).
- **Preconditions** — the array is **sorted** (a link to sorting) and preferably **uniform**.
- **Variants:** iterative, recursive (the same answer) and **safe** (a fix for division by zero when `arr[high] == arr[low]` + a probe clamp).
- On the demo `[1, 3, 5, 7, 9, 11, 13, 15, 17, 19]` searching for `15` costs **1 probe** (index 7); on `[…, 22, 25, 28, 30]` searching for `25` — **2 probes** (index 11, with correction).

