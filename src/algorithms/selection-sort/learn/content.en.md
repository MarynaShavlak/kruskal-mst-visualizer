# Selection Sort: a step-by-step walkthrough

**Selection sort** is one of the simplest ways to order an array. The idea is in the name: at each step we **select the most suitable (smallest) element** from the unsorted part and put it in place. We mentally split the array into two parts — a **sorted prefix** on the left and an **unsorted suffix** on the right. In one pass we scan the **whole** suffix, find its minimum and move it to the prefix boundary with **a single swap**. The prefix grows left to right, and the smaller elements gradually push the larger ones to the right.

The method is slow for large arrays (time — $O(n^2)$), but it has two instructive features that bubble and insertion sort do not: it makes the **minimum number of swaps** ($\le n-1$, i.e. $O(n)$ writes) and yet it is **not adaptive** — the number of comparisons is the same for any input. It is also **unstable** in its standard form — a perfect way to show the classic stability “trap”.

## 1. Intuition: pick the smallest

Picture the array as vertical **bars**, where the height is the element's value. On each pass we look only at the **unsorted part** (on the right) and search it for the smallest element. Once found, we swap it with the first unsorted element — and the smallest one lands at its final spot on the boundary of the sorted prefix:

![One pass: find the minimum and put it at the front](docs/images/en/selection_idea.png)

The next pass finds the next smallest element and puts it in the second place, the one after — in the third, and so on. So the **sorted “prefix” grows left to right**, while the unsorted suffix gets one element shorter each time.

## 2. The idea: prefix, scanning the suffix, one swap

The algorithm consists of two nested loops:

1. The **outer loop** (`i`) counts the passes. `arr[i]` is the first position of the unsorted suffix, i.e. the **boundary** of the sorted prefix.
2. The **inner loop** (`j`) makes one pass: it scans the **whole** suffix `[i+1, n)` and keeps in `min_idx` the index of the smallest element found — a “running minimum” that jumps onto each new, smaller candidate.

After the full scan — **exactly one swap** `arr[i] ↔ arr[min_idx]`: the minimum found takes the prefix boundary. This is the key difference from the other simple sorts: not a swap of every adjacent pair (as in bubble sort) and not a shift of a whole run (as in insertion sort), but **one swap per pass** after looking through the rest.

## 3. Why it works: the prefix invariant

Correctness follows from a simple **invariant**: *after the $k$-th pass the first $k$ elements of the array are the $k$ smallest values, already placed in the right order, and they no longer move.*

Why? On pass $i$ the inner loop scans the **whole** suffix and is guaranteed to find its minimum. That minimum is not smaller than any element of the already-sorted prefix (those were minima of earlier, wider suffixes), so once it lands at position $i$ it is exactly in its place. After $n-1$ passes the prefix covers almost the whole array, and the last element is automatically the largest — the array is sorted.

Notice: the search scans the suffix **fully** regardless of how ordered it already is. That is exactly why the number of comparisons does not depend on the input — the method is [**not adaptive**](#non-adaptive). And the single swap at the end of a pass may “jump over” equal keys — which makes standard selection [**unstable**](#stability).

## 4. Example — the array `[5, 3, 8, 4, 2, 7]`

### The example array

We work with an array of 6 elements:

| index | 0 | 1 | 2 | 3 | 4 | 5 |
|---|---|---|---|---|---|---|
| **value** | 5 | 3 | 8 | 4 | 2 | 7 |

![The array [5, 3, 8, 4, 2, 7] as bars](docs/images/en/array_intro.png)

### The base implementation

Here is the base implementation — the one we dissect line by line:

```python
def selection_sort(arr):
    n = len(arr)
    for i in range(n):
        min_idx = i
        for j in range(i+1, n):
            if arr[j] < arr[min_idx]:
                min_idx = j
        arr[i], arr[min_idx] = arr[min_idx], arr[i]
    return arr

numbers = [5, 3, 8, 4, 2]
print(selection_sort(numbers))
```

What is what:

- `n = len(arr)` — the array length;
- `for i in range(n)` — the **outer loop**: the passes. `arr[i]` is the prefix boundary (the first unsorted element);
- `min_idx = i` — at the start of a pass we treat the first suffix element as the minimum candidate;
- `for j in range(i+1, n)` — the **inner loop**: scans the whole suffix to the right of `i`;
- `if arr[j] < arr[min_idx]` — if a smaller element shows up…
- `min_idx = j` — …the “running minimum” jumps onto it;
- `arr[i], arr[min_idx] = arr[min_idx], arr[i]` — the **single swap** per pass: the minimum takes the prefix boundary.

> **A small note on the self-swap.** When the suffix minimum already sits at position `i` (`min_idx == i`), the swap line runs `arr[i], arr[i] = arr[i], arr[i]` — an idle write. It is not a bug, but it is also pointless work; the learning version below counts only **real** swaps (where `min_idx != i`) and skips the self-swap.

The learning version `selection_sort_steps` repeats this code **action for action**, but after every significant event it records a snapshot of the array and the comparison and swap counters — all the pictures below are built from those snapshots.

### How to read the frames

- 🟢 **green bars** — the sorted prefix (elements already in place);
- 🟡 **amber bar** — the current minimum candidate `min_idx` (the “running minimum”);
- 🟣 **cursor ▲** below a bar — the current `j` scanning the suffix;
- 🔴 **red bars with the ↔ arrow** — the swap pair `arr[i] ↔ arr[min_idx]` at the end of a pass;
- 🔵 **blue bar** — the element that just reached its place;
- ⬜ **slate bars** — the unsorted suffix;
- below the frame — the **verdict** of the step and the **counters**: how many comparisons and swaps there have been in total.

### One pass under the microscope

Let's follow **pass 0** (`i = 0`) frame by frame. First we take `a[0] = 5` as the minimum candidate and start scanning the suffix:

![Pass 0: min_idx = 0](docs/images/en/step_intro_0.png)

`j = 1`: `3 < 5` — a smaller one is found, the “running minimum” jumps to index 1:

![Pass 0, j=1: 3 < 5 → new minimum](docs/images/en/step_intro_1.png)

`j = 2`: `8 ≥ 3` — keep; `j = 3`: `4 ≥ 3` — keep. At `j = 4` we hit `2 < 3` — the minimum jumps again, now to index 4:

![Pass 0, j=4: 2 < 3 → new minimum](docs/images/en/step_intro_4.png)

`j = 5`: `7 ≥ 2` — keep. The scan is done, the suffix minimum is `2` at index 4. One swap `a[0] ↔ a[4]` puts it at the front (blue), and `5` moves into the freed slot (red):

![Pass 0: swap a[0] ↔ a[4]](docs/images/en/step_intro_6.png)

Over the whole pass — **5 comparisons and only 1 swap**.

### The full journal over the passes

The full journal of all the passes:

```text
Step-by-step walkthrough of the array [5, 3, 8, 4, 2, 7]

Pass i = 0
  j=1: 3 < 5 → new minimum: min = a[1]
  j=2: 8 ≥ 3 → the minimum stays
  j=3: 4 ≥ 3 → the minimum stays
  j=4: 2 < 3 → new minimum: min = a[4]
  j=5: 7 ≥ 2 → the minimum stays
  → swap a[0] ↔ a[4]: 2 reached position 0;  array: [2, 3, 8, 4, 5, 7]

Pass i = 1
  j=2: 8 ≥ 3 → the minimum stays
  j=3: 4 ≥ 3 → the minimum stays
  j=4: 5 ≥ 3 → the minimum stays
  j=5: 7 ≥ 3 → the minimum stays
  → the minimum is already in place (min_idx = 1) → no swap;  array: [2, 3, 8, 4, 5, 7]

Pass i = 2
  j=3: 4 < 8 → new minimum: min = a[3]
  j=4: 5 ≥ 4 → the minimum stays
  j=5: 7 ≥ 4 → the minimum stays
  → swap a[2] ↔ a[3]: 4 reached position 2;  array: [2, 3, 4, 8, 5, 7]

Pass i = 3
  j=4: 5 < 8 → new minimum: min = a[4]
  j=5: 7 ≥ 5 → the minimum stays
  → swap a[3] ↔ a[4]: 5 reached position 3;  array: [2, 3, 4, 5, 8, 7]

Pass i = 4
  j=5: 7 < 8 → new minimum: min = a[5]
  → swap a[4] ↔ a[5]: 7 reached position 4;  array: [2, 3, 4, 5, 7, 8]

Pass i = 5
  → the minimum is already in place (min_idx = 5) → no swap;  array: [2, 3, 4, 5, 7, 8]
```

Note **passes 1 and 5**: the minimum is already in place (`min_idx == i`), so there is no real swap — it is a self-swap. And one more thing: the array effectively becomes sorted already after pass 4, but the algorithm still runs the last pass `i = 5` (without any swaps) — unlike bubble sort with an early exit, selection sort does not notice this.

### The big picture: evolution over the passes

All the array states side by side — you can see the green prefix growing left to right, the element that reached its place this pass marked blue, and the self-swaps labelled separately:

![Evolution of the array [5, 3, 8, 4, 2, 7] over the passes](docs/images/en/evolution_intro.png)

▶️ The same in motion — the cursor `j` runs along the suffix, the “running minimum” jumps onto new candidates, and at the end of the pass — the single swap ↔:

![Animation: selection sort step by step](docs/images/en/sort_intro.gif)

### Result

![The sorted array [2, 3, 4, 5, 7, 8]](docs/images/en/result_intro.png)

The summary from the console:

```text
Input:  [5, 3, 8, 4, 2, 7]
Output: [2, 3, 4, 5, 7, 8]
Comparisons: 15   Swaps: 4   Passes: 6
```

Selection sort always makes all $\frac{n(n-1)}{2} = 15$ comparisons, but only **4 real swaps** (on passes 1 and 5 the minimum was already in place).

## 5. Non-adaptivity: best and worst cases

The main feature of selection sort among the simple sorts — it is **not adaptive**. The inner loop always scans the suffix **in full**, so the number of comparisons is always exactly $\frac{n(n-1)}{2}$, **regardless of the input**. Let's compare an already sorted array (best case) and a reverse-sorted one (worst case):

```text
Best case (non-adaptive) — the already sorted array [1, 2, 3, 4, 5, 6]
  comparisons: 15   swaps: 0
Worst case — the reverse sorted array [6, 5, 4, 3, 2, 1]
  comparisons: 15   swaps: 3

Comparisons are equal: 15 = n(n−1)/2 in both cases — selection sort is NOT adaptive.
Swaps differ: 0 (sorted) vs. 3 (reversed) — but both ≤ n−1 = 5.
```

**Best case — the already sorted array.** Every minimum is already in place (`min_idx == i`), so **0** real swaps — yet all 15 comparisons are still made:

![Best case: 0 swaps, but all comparisons are made](docs/images/en/evolution_sorted.png)

▶️ In motion you can see the cursor scan the whole suffix of every pass, even though there is no swap at all:

![Animation: best case, non-adaptivity](docs/images/en/sort_sorted.gif)

**Worst case — the reverse sorted array.** The same number of comparisons, but now the minimum sits at the end of the suffix each time, so there are more swaps (still $\le n-1$, though):

![Worst case: reverse array, more swaps](docs/images/en/evolution_reversed.png)

▶️ The worst case in motion:

![Animation: worst case](docs/images/en/sort_reversed.gif)

This is a fundamental difference from [insertion sort](https://github.com/MarynaShavlak/algo-insertion-sort) (best case $O(n)$) and [bubble sort with an early exit](https://github.com/MarynaShavlak/algo-bubble-sort): on already ordered input selection sort **does not get any faster**.

## 6. Minimum swaps: why selection saves writes

The flip side of non-adaptivity is the method's main **advantage**: over the whole algorithm there are **at most $n-1$ swaps** (one per pass, and only when `min_idx != i`). That is the fewest among comparison sorts: $O(n)$ writes to memory versus $O(n^2)$ for bubble or insertion sort.

Look at the plot: the red curve (comparisons) grows like $n^2$, while the green one (swaps) only like $n$:

![Plot: n² comparisons vs. n swaps](docs/images/en/growth.png)

This matters where **writing to memory is expensive** while comparing is cheap: for example, when the elements are very large (copying them is costly) or when it is flash memory or EEPROM with a limited rewrite budget. In that niche selection sort, with its $O(n)$ swaps, can beat “faster” algorithms.

## 7. Stability: an array with duplicates

A sort is **stable** if it keeps the relative order of elements with **equal keys**. And here is the classic “trap”: standard selection sort is **unstable**. The single swap `arr[i] ↔ arr[min_idx]` may “jump over” an equal key and change its order — unlike bubble and insertion sort, which are stable.

To see it, take “tagged” duplicates — each copy of a value carries a subscript showing its original position (`5₁`, `5₂`):

![Array with tagged duplicates: 5₁, 2₁, 5₂, 2₂, 1₁](docs/images/en/array_duplicates.png)

```text
Stability on an array with duplicates
Input (labels show the original order of equal keys): [5₁, 2₁, 5₂, 2₂, 1₁]
Standard selection:  [1₁, 2₁, 2₂, 5₂, 5₁]  → unstable ✗ (equal keys reordered)
Stable variant:      [1₁, 2₁, 2₂, 5₁, 5₂]  → stable ✓ (order of equal keys kept)
Conclusion: standard selection sort is NOT stable; the shifting variant restores stability.
```

What happened in the standard version? On pass 0 the minimum `1₁` was swapped with `a[0] = 5₁` — and `5₁` “jumped over” `5₂`, ending up **after** it. Result: `5₂` stands before `5₁`, although the input had it the other way around. This is clearly visible in the evolution over the passes:

![Evolution of the standard version — the swap breaks the order of equal keys](docs/images/en/evolution_duplicates.png)

**How to fix it — the stable variant via shifting.** Instead of the swap `arr[i] ↔ arr[min_idx]`, the minimum is **lifted out**, the elements of the block `[i..min_idx-1]` are **shifted right** by one position, and the minimum is inserted at position `i`:

```python
def selection_sort_stable(lst, *, key=None):
    keyf = key if key is not None else (lambda x: x)
    n = len(lst)
    for i in range(n):
        min_idx = i
        for j in range(i + 1, n):
            if keyf(lst[j]) < keyf(lst[min_idx]):
                min_idx = j
        # lift the minimum out and shift the block [i..min_idx-1] right by one
        min_val = lst[min_idx]
        while min_idx > i:
            lst[min_idx] = lst[min_idx - 1]
            min_idx -= 1
        lst[i] = min_val
    return lst
```

Shifting preserves the relative order of the rest of the elements, so equal keys no longer jump over one another — the sort becomes **stable**. The price is the loss of the main advantage: instead of $O(n)$ swaps there are now $O(n^2)$ **writes** (the shifts). The two results side by side:

![The standard version breaks the order of equal keys, the stable one keeps it](docs/images/en/stability_compare.png)

This mirrors bubble and insertion sort: there stability was a “free” property, whereas here you have to pay for it with writes — or live with instability.

## 8. Running the code step by step: code ↔ array panels

The examples above showed the *result* of each step. Here is **the code in action**: on the left a fragment of the algorithm with **highlighted active lines**, on the right the array at that very moment. **The color of a code line encodes what happens:** 🟡 the line runs now (a loop / resetting `min_idx` / the condition check), 🟠 the condition `arr[j] < arr[min_idx]` is true → a new minimum `min_idx = j`, 🔴 the swap at the end of a pass, 🟢 the loops finished → the array is sorted.

We build this for the example array `[5, 3, 8, 4, 2]` (its line-by-line trace matches the walkthrough above):

![Code ↔ array: the array [5, 3, 8, 4, 2]](docs/images/en/code_steps_conspect.png)

▶️ The animated version — between the “decisions” there are frames “check `a[j] < a[min_idx]`?” and resetting `min_idx` at the start of each pass:

![Animation: code ↔ array](docs/images/en/code_walk_conspect.gif)

## 9. Full step-by-step trace of `[5, 3, 8, 4, 2, 7]`

Below is the same step-by-step run, but **in full**: the start of each pass, every comparison and every swap as a separate code ↔ array frame, in the right order, with a detailed explanation under each. The bar colors are the same as in the [legend above](#how-to-read). The block is generated automatically from the event journal.

#### Step 00

![Start: the array as given](docs/images/en/walkthrough/step_00.png)

The initial array `[5, 3, 8, 4, 2, 7]`. A bar's height is the element's value, the number below it is the index. All bars are slate — the array is not ordered yet. In the code, `n = len(arr)` and the entry into the pass loop are highlighted.

#### Step 01

![Pass 0: min_idx = 0](docs/images/en/walkthrough/step_01.png)

Pass `i = 0`. We reset the minimum candidate: `min_idx = 0` (the amber bar `a[0] = 5`). To the left is the sorted prefix of 0 element(s) (green), to the right is the unsorted suffix we are about to scan. `for i …` and `min_idx = i` are highlighted.

#### Step 02

![Pass 0, j=1: compare a[1] and a[0]](docs/images/en/walkthrough/step_02.png)

Pass `i = 0`, cursor `j = 1`. We compare `a[1] = 3` with the current minimum `a[0] = 5`. Since `3 < 5`, a smaller candidate is found — the running minimum jumps to it: `min_idx = 1` (amber). The line `min_idx = j` is highlighted. Comparisons — 1, swaps — 0.

#### Step 03

![Pass 0, j=2: compare a[2] and a[1]](docs/images/en/walkthrough/step_03.png)

Pass `i = 0`, cursor `j = 2`. We compare `a[2] = 8` with the current minimum `a[1] = 3`. Since `8 ≥ 3`, nothing smaller is found — the minimum stays (`min_idx = 1`). The check `if a[j] < a[min_idx]` is highlighted (the condition is false). Comparisons — 2, swaps — 0.

#### Step 04

![Pass 0, j=3: compare a[3] and a[1]](docs/images/en/walkthrough/step_04.png)

Pass `i = 0`, cursor `j = 3`. We compare `a[3] = 4` with the current minimum `a[1] = 3`. Since `4 ≥ 3`, nothing smaller is found — the minimum stays (`min_idx = 1`). The check `if a[j] < a[min_idx]` is highlighted (the condition is false). Comparisons — 3, swaps — 0.

#### Step 05

![Pass 0, j=4: compare a[4] and a[1]](docs/images/en/walkthrough/step_05.png)

Pass `i = 0`, cursor `j = 4`. We compare `a[4] = 2` with the current minimum `a[1] = 3`. Since `2 < 3`, a smaller candidate is found — the running minimum jumps to it: `min_idx = 4` (amber). The line `min_idx = j` is highlighted. Comparisons — 4, swaps — 0.

#### Step 06

![Pass 0, j=5: compare a[5] and a[4]](docs/images/en/walkthrough/step_06.png)

Pass `i = 0`, cursor `j = 5`. We compare `a[5] = 7` with the current minimum `a[4] = 2`. Since `7 ≥ 2`, nothing smaller is found — the minimum stays (`min_idx = 4`). The check `if a[j] < a[min_idx]` is highlighted (the condition is false). Comparisons — 5, swaps — 0.

#### Step 07

![Pass 0: swap a[0] ↔ a[4]](docs/images/en/walkthrough/step_07.png)

End of pass `i = 0`. The suffix scan is done, the minimum is `a[4] = 2`. One swap `a[0] ↔ a[4]` (red bars, the ↔ arrow) puts it on the prefix boundary: `2` is now at position 0 (blue), the green prefix grew to 1. The swap line is highlighted. Comparisons — 5, swaps — 1.

#### Step 08

![Pass 1: min_idx = 1](docs/images/en/walkthrough/step_08.png)

Pass `i = 1`. We reset the minimum candidate: `min_idx = 1` (the amber bar `a[1] = 3`). To the left is the sorted prefix of 1 element(s) (green), to the right is the unsorted suffix we are about to scan. `for i …` and `min_idx = i` are highlighted.

#### Step 09

![Pass 1, j=2: compare a[2] and a[1]](docs/images/en/walkthrough/step_09.png)

Pass `i = 1`, cursor `j = 2`. We compare `a[2] = 8` with the current minimum `a[1] = 3`. Since `8 ≥ 3`, nothing smaller is found — the minimum stays (`min_idx = 1`). The check `if a[j] < a[min_idx]` is highlighted (the condition is false). Comparisons — 6, swaps — 1.

#### Step 10

![Pass 1, j=3: compare a[3] and a[1]](docs/images/en/walkthrough/step_10.png)

Pass `i = 1`, cursor `j = 3`. We compare `a[3] = 4` with the current minimum `a[1] = 3`. Since `4 ≥ 3`, nothing smaller is found — the minimum stays (`min_idx = 1`). The check `if a[j] < a[min_idx]` is highlighted (the condition is false). Comparisons — 7, swaps — 1.

#### Step 11

![Pass 1, j=4: compare a[4] and a[1]](docs/images/en/walkthrough/step_11.png)

Pass `i = 1`, cursor `j = 4`. We compare `a[4] = 5` with the current minimum `a[1] = 3`. Since `5 ≥ 3`, nothing smaller is found — the minimum stays (`min_idx = 1`). The check `if a[j] < a[min_idx]` is highlighted (the condition is false). Comparisons — 8, swaps — 1.

#### Step 12

![Pass 1, j=5: compare a[5] and a[1]](docs/images/en/walkthrough/step_12.png)

Pass `i = 1`, cursor `j = 5`. We compare `a[5] = 7` with the current minimum `a[1] = 3`. Since `7 ≥ 3`, nothing smaller is found — the minimum stays (`min_idx = 1`). The check `if a[j] < a[min_idx]` is highlighted (the condition is false). Comparisons — 9, swaps — 1.

#### Step 13

![Pass 1: the minimum is already in place](docs/images/en/walkthrough/step_13.png)

End of pass `i = 1`. The suffix minimum already sits at position 1 (`min_idx == 1`), so the swap is idle — we skip it (a micro-optimization). `3` stays in place (blue), the prefix still grew to 2. Comparisons — 9, swaps — 1.

#### Step 14

![Pass 2: min_idx = 2](docs/images/en/walkthrough/step_14.png)

Pass `i = 2`. We reset the minimum candidate: `min_idx = 2` (the amber bar `a[2] = 8`). To the left is the sorted prefix of 2 element(s) (green), to the right is the unsorted suffix we are about to scan. `for i …` and `min_idx = i` are highlighted.

#### Step 15

![Pass 2, j=3: compare a[3] and a[2]](docs/images/en/walkthrough/step_15.png)

Pass `i = 2`, cursor `j = 3`. We compare `a[3] = 4` with the current minimum `a[2] = 8`. Since `4 < 8`, a smaller candidate is found — the running minimum jumps to it: `min_idx = 3` (amber). The line `min_idx = j` is highlighted. Comparisons — 10, swaps — 1.

#### Step 16

![Pass 2, j=4: compare a[4] and a[3]](docs/images/en/walkthrough/step_16.png)

Pass `i = 2`, cursor `j = 4`. We compare `a[4] = 5` with the current minimum `a[3] = 4`. Since `5 ≥ 4`, nothing smaller is found — the minimum stays (`min_idx = 3`). The check `if a[j] < a[min_idx]` is highlighted (the condition is false). Comparisons — 11, swaps — 1.

#### Step 17

![Pass 2, j=5: compare a[5] and a[3]](docs/images/en/walkthrough/step_17.png)

Pass `i = 2`, cursor `j = 5`. We compare `a[5] = 7` with the current minimum `a[3] = 4`. Since `7 ≥ 4`, nothing smaller is found — the minimum stays (`min_idx = 3`). The check `if a[j] < a[min_idx]` is highlighted (the condition is false). Comparisons — 12, swaps — 1.

#### Step 18

![Pass 2: swap a[2] ↔ a[3]](docs/images/en/walkthrough/step_18.png)

End of pass `i = 2`. The suffix scan is done, the minimum is `a[3] = 4`. One swap `a[2] ↔ a[3]` (red bars, the ↔ arrow) puts it on the prefix boundary: `4` is now at position 2 (blue), the green prefix grew to 3. The swap line is highlighted. Comparisons — 12, swaps — 2.

#### Step 19

![Pass 3: min_idx = 3](docs/images/en/walkthrough/step_19.png)

Pass `i = 3`. We reset the minimum candidate: `min_idx = 3` (the amber bar `a[3] = 8`). To the left is the sorted prefix of 3 element(s) (green), to the right is the unsorted suffix we are about to scan. `for i …` and `min_idx = i` are highlighted.

#### Step 20

![Pass 3, j=4: compare a[4] and a[3]](docs/images/en/walkthrough/step_20.png)

Pass `i = 3`, cursor `j = 4`. We compare `a[4] = 5` with the current minimum `a[3] = 8`. Since `5 < 8`, a smaller candidate is found — the running minimum jumps to it: `min_idx = 4` (amber). The line `min_idx = j` is highlighted. Comparisons — 13, swaps — 2.

#### Step 21

![Pass 3, j=5: compare a[5] and a[4]](docs/images/en/walkthrough/step_21.png)

Pass `i = 3`, cursor `j = 5`. We compare `a[5] = 7` with the current minimum `a[4] = 5`. Since `7 ≥ 5`, nothing smaller is found — the minimum stays (`min_idx = 4`). The check `if a[j] < a[min_idx]` is highlighted (the condition is false). Comparisons — 14, swaps — 2.

#### Step 22

![Pass 3: swap a[3] ↔ a[4]](docs/images/en/walkthrough/step_22.png)

End of pass `i = 3`. The suffix scan is done, the minimum is `a[4] = 5`. One swap `a[3] ↔ a[4]` (red bars, the ↔ arrow) puts it on the prefix boundary: `5` is now at position 3 (blue), the green prefix grew to 4. The swap line is highlighted. Comparisons — 14, swaps — 3.

#### Step 23

![Pass 4: min_idx = 4](docs/images/en/walkthrough/step_23.png)

Pass `i = 4`. We reset the minimum candidate: `min_idx = 4` (the amber bar `a[4] = 8`). To the left is the sorted prefix of 4 element(s) (green), to the right is the unsorted suffix we are about to scan. `for i …` and `min_idx = i` are highlighted.

#### Step 24

![Pass 4, j=5: compare a[5] and a[4]](docs/images/en/walkthrough/step_24.png)

Pass `i = 4`, cursor `j = 5`. We compare `a[5] = 7` with the current minimum `a[4] = 8`. Since `7 < 8`, a smaller candidate is found — the running minimum jumps to it: `min_idx = 5` (amber). The line `min_idx = j` is highlighted. Comparisons — 15, swaps — 3.

#### Step 25

![Pass 4: swap a[4] ↔ a[5]](docs/images/en/walkthrough/step_25.png)

End of pass `i = 4`. The suffix scan is done, the minimum is `a[5] = 7`. One swap `a[4] ↔ a[5]` (red bars, the ↔ arrow) puts it on the prefix boundary: `7` is now at position 4 (blue), the green prefix grew to 5. The swap line is highlighted. Comparisons — 15, swaps — 4.

#### Step 26

![Pass 5: min_idx = 5](docs/images/en/walkthrough/step_26.png)

Pass `i = 5`. We reset the minimum candidate: `min_idx = 5` (the amber bar `a[5] = 8`). To the left is the sorted prefix of 5 element(s) (green), to the right is the unsorted suffix we are about to scan. `for i …` and `min_idx = i` are highlighted.

#### Step 27

![Pass 5: the minimum is already in place](docs/images/en/walkthrough/step_27.png)

End of pass `i = 5`. The suffix minimum already sits at position 5 (`min_idx == 5`), so the swap is idle — we skip it (a micro-optimization). `8` stays in place (blue), the prefix still grew to 6. Comparisons — 15, swaps — 4.

#### Step 28

![Done](docs/images/en/walkthrough/step_28.png)

Result: the array is sorted — `[2, 3, 4, 5, 7, 8]`. In total 15 comparisons (exactly n(n−1)/2 — the same for any input) and only 4 swaps over 6 pass(es). `return arr` is highlighted.

## 10. Complexity and properties

How much work selection sort does — and, crucially, what does **not** depend on the input:

| Case | Comparisons | Swaps | When it happens |
|---|---|---|---|
| **Best** | $\frac{n(n-1)}{2} = O(n^2)$ | $0$ | already sorted input |
| **Average** | $\frac{n(n-1)}{2} = O(n^2)$ | $O(n)$ | random order |
| **Worst** | $\frac{n(n-1)}{2} = O(n^2)$ | $\le n-1 = O(n)$ | any (e.g. reverse) |

Other properties:

- **Extra memory — $O(1)$:** the sort happens *in place*, only one temporary slot for the swap is needed.
- **Not adaptive:** always $\frac{n(n-1)}{2}$ comparisons — on ordered input the method is no faster (unlike insertion sort and bubble sort with an early exit).
- **Minimum swaps:** $\le n-1$, i.e. $O(n)$ writes — the fewest among comparison sorts.
- **Standard version is unstable:** a swap can reorder equal keys. Stability comes from the shifting variant — at the cost of $O(n^2)$ writes.

The number of comparisons grows like $n^2$ regardless of the input, while there are only $\le n-1$ swaps. Compare this with $n\log_2 n$ (efficient sorts):

![Plot: n² comparisons vs. n swaps](docs/images/en/growth.png)

## 11. Limitations: why selection sort is impractical for large `n`

Quadratic complexity **in comparisons** means that as the array grows, the work grows catastrophically fast. Compare the number of comparisons ($\frac{n(n-1)}{2}$) with efficient sorts ($\approx n\log_2 n$):

| `n` | Selection ($\approx n^2/2$) | `n·log₂n` | How many times worse |
|---|---|---|---|
| 10 | 45 | ≈ 33 | ~1× |
| 100 | 4,950 | ≈ 664 | ~7× |
| 1,000 | 499,500 | ≈ 9,966 | ~50× |
| 10,000 | ≈ 50,000,000 | ≈ 132,877 | ~375× |
| 1,000,000 | ≈ 5·10¹¹ | ≈ 2·10⁷ | ~25,000× |

On top of the quadratic complexity there are two more drawbacks:

- **Non-adaptivity.** Even if the array is already almost ordered, selection sort still makes all $\frac{n(n-1)}{2}$ comparisons — it cannot “notice” the order and finish earlier (as bubble sort with an early exit or insertion sort in $O(n)$ do).
- **Instability.** The standard version breaks the order of equal keys; to restore it you have to sacrifice the main advantage (the minimum number of swaps) and pay $O(n^2)$ writes.

> **The “edge” case.** Just as graph algorithms have inputs that break the method, selection sort's “edge” case is **a large amount of data**: formally the method always gives the right answer, but the time makes it unusable. Selection's real niche is narrow: it is exactly where it is critical to **minimize the number of writes** to memory (large elements, flash memory with a limited rewrite budget), not where a lot of data needs to be sorted quickly.

**Educational value vs. performance.** Despite being impractical, selection sort is the cleanest illustration of the “selection” paradigm (at each step take the best of the rest) and a classic stability “trap”. It is the most convenient place to show what adaptivity is (and its absence), why “few swaps” does not save you from $O(n^2)$, and when stability is expensive.

## 12. Three simple sorts side by side

Selection sort is best understood next to the two other simple $O(n^2)$ sorts:

| Property | Bubble | Insertion | **Selection** |
|---|---|---|---|
| Comparisons (worst) | $O(n^2)$ | $O(n^2)$ | $O(n^2)$ |
| Comparisons (best) | $O(n)$ | $O(n)$ | $O(n^2)$ |
| Swaps / writes | $O(n^2)$ | $O(n^2)$ | **$O(n)$ swaps** |
| Adaptive | yes (early exit) | yes | **no** |
| Stable | yes | yes | **no** (standard) |
| When it fits | easiest to explain | short / nearly ordered arrays | when writing is expensive |

In short: **bubble** is the easiest to explain; **insertion** is best on short or nearly ordered arrays (adaptive and stable); **selection** wins only where it is critical to have few writes to memory — at the cost of non-adaptivity and instability. Detailed walkthroughs of the first two: [bubble sort](https://github.com/MarynaShavlak/algo-bubble-sort) and [insertion sort](https://github.com/MarynaShavlak/algo-insertion-sort).

## 13. Where it fits

The rare situations where selection sort is justified:

- **Learning.** The clearest illustration of the “pick the best of the rest” idea and a classic example of an unstable sort.
- **Expensive writes to memory.** When copying an element is costly (very large elements) or the number of rewrites is limited (flash/EEPROM), $O(n)$ swaps are a real advantage.
- **Tiny arrays** (a handful of elements), where simplicity of the code matters more than speed.

For everything more serious, use the built-in `sorted()` / `list.sort()` (Timsort) — stable, adaptive and $O(n\log n)$.

## 14. Summary

- **Selection sort** scans the whole unsorted suffix each pass, finds its minimum and puts it on the boundary of the sorted prefix with **a single swap**; the prefix grows left to right.
- It works on an **array, in place** ($O(1)$ memory).
- **Complexity:** $O(n^2)$ comparisons in **all** cases (the method is **not adaptive**), at most $n-1$ swaps ($O(n)$ — the fewest among comparison sorts).
- **Standard selection is unstable:** a swap jumps over equal keys. Stability comes from the **shifting variant** — at the cost of $O(n^2)$ writes.
- On the array `[5, 3, 8, 4, 2, 7]` the sort costs **15 comparisons and 4 swaps**; on the already sorted `[1..6]` — the same **15 comparisons** but **0 swaps**; on the reverse `[6..1]` — again 15 comparisons and 3 swaps.
- Its main advantage is the **minimum number of swaps** (useful when writing is expensive); its main drawbacks are **non-adaptivity** and **instability**. The method's value is mostly **educational**.

