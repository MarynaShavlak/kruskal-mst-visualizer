# Bubble Sort: a step-by-step walkthrough

**Bubble sort** is one of the simplest ways to order an array. The idea is elementary: walk through the array and **compare adjacent elements**; if they are in the wrong order (the left one is larger than the right) — **swap them**. After one such pass the largest element "bubbles up" to the end of the array — hence the name (large values rise like bubbles to the surface of water).

The method is slow for large arrays (time is $O(n^2)$), but its simplicity makes it a great **teaching** example: it clearly shows what stability is, the pass invariant, early exit, and why quadratic complexity is impractical.

The repository is educational material: a clean implementation of the algorithm + detailed visualizations of every step. The entire walkthrough below is reproduced by the code in [`examples/`](examples), and the figures live in [`docs/images/en/`](docs/images/en).

## 1. Repository structure

The directory tree and the split of responsibilities between modules are in a separate file — **[PROJECT_STRUCTURE.en.md](PROJECT_STRUCTURE.en.md)**.

## 2. Quick start

Installation commands, how to run the examples and the tests, and a minimal library-usage snippet are in **[USAGE.en.md](USAGE.en.md)**.

## 3. Intuition: why "bubble"

Picture the array as vertical **bars**, where the height is the element's value. In one left-to-right pass the method compares every adjacent pair and "pushes" the larger element to the right. As a result **the largest element of the whole array rolls all the way to the right edge** — like a big bubble surfacing:

![One pass: the largest element bubbles to the end](docs/images/en/bubble_idea.png)

The next pass lifts the second-largest element to the second-to-last spot, the next one — the third, and so on. So the **sorted "tail" grows from the right**, and each pass has to check one element fewer.

## 4. The idea: compare neighbours and swap

The algorithm is two nested loops:

1. The **outer loop** counts *passes*. An array of $n$ elements is sorted in at most $n-1$ passes.
2. The **inner loop** performs one pass: it walks adjacent pairs `(j, j+1)` and, if `a[j] > a[j+1]`, swaps them.

After pass $i$ the last $i+1$ elements are already in their final spots (the largest values bubbled there), so the inner loop gets shorter every time — hence the bound `n-i-1`.

## 5. Why it works: the pass invariant

Correctness follows from a simple **invariant**: *after the $k$-th pass the $k$ largest elements sit in their final spots at the end of the array and never move again.*

Why is the maximum guaranteed to reach the end in a single pass? As the inner loop moves rightward it "carries" the largest value it has met so far: as soon as the current element turns out to be smaller than its right neighbour, they swap, and the larger one keeps moving. The array's maximum never "loses" a swap, so it rolls all the way to the end. After $n-1$ passes everything is in place — the array is sorted.

Because a swap happens only on a **strict** inequality (`>`, not `>=`), equal elements never swap places — and that makes the sort [**stable**](#stability).

## 6. Example — the array `[5, 1, 4, 2, 8, 3]`

### The array

We work with an array of 6 elements:

| index | 0 | 1 | 2 | 3 | 4 | 5 |
|---|---|---|---|---|---|---|
| **value** | 5 | 1 | 4 | 2 | 8 | 3 |

![The array [5, 1, 4, 2, 8, 3] as bars](docs/images/en/array_intro.png)

### Base implementation (the code from the notes)

Here is the implementation from the lecture notes — the one we dissect line by line (the fully documented version is in [`bubble_sort/core.py`](bubble_sort/core.py)):

```python
def bubble_sort(lst):
    n = len(lst)
    for i in range(0, n-1):
        for j in range(0, n-i-1):
            if lst[j] > lst[j+1] :
                lst[j], lst[j+1] = lst[j+1], lst[j]
    return lst

numbers = [5, 3, 8, 4, 2]
bubble_sort(numbers)
```

What is what:

- `n = len(lst)` — the array length;
- `for i in range(0, n-1)` — the **outer loop**: counts passes. There are $n-1$ of them, because each pass bubbles the largest of the unsorted elements to the end, and once the $n-1$-th element is placed, the last one is automatically in place too;
- `for j in range(0, n-i-1)` — the **inner loop**: walks adjacent pairs. The bound `n-i-1` shrinks each time, because the last `i` elements are already sorted (no need to check them);
- `if lst[j] > lst[j+1]` — if the left element is larger than the right, they are in the wrong order;
- `lst[j], lst[j+1] = lst[j+1], lst[j]` — a swap via tuple unpacking (no temporary variable).

The instrumented version [`bubble_sort_steps`](bubble_sort/core.py) repeats this code **action for action**, but after every comparison it records a snapshot of the array and the comparison/swap counters — all the pictures below are built from those snapshots.

### How to read the frames

- 🟡 **amber bars** — the pair being compared *right now*;
- 🔴 **red bars with a ↔ arrow** — the pair was just swapped;
- 🟢 **green bars** — elements already in their final spots (the sorted "tail");
- ⬜ **slate bars** — not ordered yet;
- below the frame — the comparison **verdict** and the **counters**: total comparisons and swaps so far.

### Pass 0: the largest "bubbles up"

The first pass (`i = 0`) makes 5 comparisons — from the pair `(0, 1)` to the pair `(4, 5)`. Let's follow it frame by frame.

`j = 0`: compare `5` and `1`. Since `5 > 1` — swap:

![Pass 0, j=0: 5 > 1, swap](docs/images/en/step_intro_0.png)

`j = 1`: now the pair `(1, 2)` is in focus. The same `5` (it "rides" to the right) against `4`: `5 > 4` — swap:

![Pass 0, j=1: 5 > 4, swap](docs/images/en/step_intro_1.png)

`j = 2`: `5` against `2` — swap again. `j = 3`: `5` against `8` — `5 ≤ 8`, **keep** as is (the larger value is now carried by `8`). `j = 4`: `8` against `3` — swap, and `8` lands in the last spot:

![Pass 0, j=2: 5 > 2, swap](docs/images/en/step_intro_2.png)
![Pass 0, j=3: 5 ≤ 8, keep](docs/images/en/step_intro_3.png)
![Pass 0, j=4: 8 > 3, swap — 8 in place](docs/images/en/step_intro_4.png)

The full journal of all passes (printed by [`examples/01_intro.py`](examples/01_intro.py)):

```text
Pass i = 0
  j=0: 5 > 1 → swap
  j=1: 5 > 4 → swap
  j=2: 5 > 2 → swap
  j=3: 5 ≤ 8 → keep
  j=4: 8 > 3 → swap
  → array after the pass: [1, 4, 2, 5, 3, 8];  swaps: 4;  bubbled up: 8 (index 5)

Pass i = 1
  j=0: 1 ≤ 4 → keep
  j=1: 4 > 2 → swap
  j=2: 4 ≤ 5 → keep
  j=3: 5 > 3 → swap
  → array after the pass: [1, 2, 4, 3, 5, 8];  swaps: 2;  bubbled up: 5 (index 4)

Pass i = 2
  j=0: 1 ≤ 2 → keep
  j=1: 2 ≤ 4 → keep
  j=2: 4 > 3 → swap
  → array after the pass: [1, 2, 3, 4, 5, 8];  swaps: 1;  bubbled up: 4 (index 3)

Pass i = 3
  j=0: 1 ≤ 2 → keep
  j=1: 2 ≤ 3 → keep
  → array after the pass: [1, 2, 3, 4, 5, 8];  swaps: 0;  bubbled up: 3 (index 2)

Pass i = 4
  j=0: 1 ≤ 2 → keep
  → array after the pass: [1, 2, 3, 4, 5, 8];  swaps: 0;  bubbled up: 2 (index 1)
```

Notice **passes 3 and 4**: the array became sorted already after pass 2, yet the naive implementation still "spins" two more passes without a single swap. That is wasted work — and exactly what the [optimization](#optimization) below removes.

### The big picture: evolution by passes

All states of the array side by side — you can see the green "tail" grow from right to left while the number of swaps per pass drops:

![Evolution of the array [5, 1, 4, 2, 8, 3] by passes](docs/images/en/evolution_intro.png)

▶️ The same in motion — comparison by comparison (red swaps, the green "tail" grows):

![Animation: sorting the array comparison by comparison](docs/images/en/sort_intro.gif)

🎬 *MP4 version:* [`sort_intro.mp4`](docs/images/en/sort_intro.mp4)

### Result

![The sorted array [1, 2, 3, 4, 5, 8]](docs/images/en/result_intro.png)

The console summary (printed by [`examples/01_intro.py`](examples/01_intro.py)):

```text
Input:  [5, 1, 4, 2, 8, 3]
Output: [1, 2, 3, 4, 5, 8]
Comparisons: 15   Swaps: 7   Passes: 5
```

The naive version always makes all $n-1 = 5$ passes and all $\frac{n(n-1)}{2} = 15$ comparisons — regardless of how early the array actually became ordered.

## 7. Optimization: the `swapped` flag and early exit

The key observation: **if a whole pass makes no swaps, the array is already sorted**, and the remaining passes change nothing. Add a single `swapped` flag and break out early:

```python
def bubble_sort_optimized(lst):
    n = len(lst)
    for i in range(0, n - 1):
        swapped = False
        for j in range(0, n - i - 1):
            if lst[j] > lst[j + 1]:
                lst[j], lst[j + 1] = lst[j + 1], lst[j]
                swapped = True
        if not swapped:      # nothing changed in the pass → the array is sorted
            break
    return lst
```

This changes neither the result nor the number of swaps — it only removes the wasteful "idle" passes at the end. On our array `[5, 1, 4, 2, 8, 3]` early exit saves the comparisons of passes 3–4; it shines brightest on an already-ordered input.

### Best and worst cases

**Best case — an already sorted array.** The optimized version makes a single pass with no swaps, sees `swapped == False` and exits immediately — that is $O(n)$:

![Best case: one pass with no swaps → early exit](docs/images/en/evolution_sorted.png)

```text
Best case — the already sorted array [1, 2, 3, 4, 5, 6]
  naive: 15 comparisons, 0 swaps
  optimized: 5 comparisons, 0 swaps, 1 pass(es)
Early exit saves 10 comparisons on already sorted input.
```

▶️ Early exit in motion (the optimized version):

![Animation: best case, early exit](docs/images/en/sort_sorted.gif)

🎬 *MP4 version:* [`sort_sorted.mp4`](docs/images/en/sort_sorted.mp4)

**Worst case — a reverse sorted array.** Every adjacent pair is in the wrong order, so **every** comparison triggers a swap: maximum work, $O(n^2)$. Early exit does not help here — there are swaps in every pass until the very end:

![Worst case: reverse array, maximum swaps](docs/images/en/evolution_reversed.png)

```text
Worst case — the reverse sorted array [6, 5, 4, 3, 2, 1]
  naive: 15 comparisons, 15 swaps
  optimized: 15 comparisons, 15 swaps, 5 pass(es)
On reverse input the optimization does not help: 15 comparisons either way.
```

▶️ The worst case in motion — a swap on every step:

![Animation: worst case, maximum swaps](docs/images/en/sort_reversed.gif)

🎬 *MP4 version:* [`sort_reversed.mp4`](docs/images/en/sort_reversed.mp4)

## 8. Stability: an array with duplicates

A sort is **stable** if it preserves the relative order of elements with **equal keys**. Bubble sort is stable because a swap happens only on a **strict** inequality `a[j] > a[j+1]`: equal elements do not satisfy the condition and never swap.

To see it, take "tagged" duplicates — each copy of a value carries a subscript showing its original spot (`3₁`, `3₂`, `3₃`):

![Array with tagged duplicates: 3₁, 1₁, 3₂, 2₁, 1₂, 3₃](docs/images/en/array_duplicates.png)

```text
Stability on an array with duplicates
Input (labels show the original order of equal keys): [3₁, 1₁, 3₂, 2₁, 1₂, 3₃]
Output (equal keys kept their original order): [1₁, 1₂, 2₁, 3₁, 3₂, 3₃]
Stable ✓: among equal keys the order of labels is unchanged.
```

After sorting, the triple `3₁, 3₂, 3₃` stayed in exactly this order (rather than, say, `3₃, 3₁, 3₂`) — and so did the pair `1₁, 1₂`:

![The sorted array: equal keys in their original order](docs/images/en/result_duplicates.png)

Stability matters when elements carry extra data (you sort records by one field without destroying a previous ordering by another).

## 9. Executing the code step by step: code ↔ array panels

The examples above showed the *result* of each step. Here is **the code in action**: on the left a fragment of the algorithm with **highlighted active lines**, on the right the array at that very moment. **The colour of a code line encodes what is happening:** 🟡 the line runs now (a loop / the condition check), 🔴 the condition `if lst[j] > lst[j+1]` is true → the pair swaps, 🟢 the loops finished → the array is sorted.

We build this for the array from the notes `[5, 3, 8, 4, 2]` (its line-by-line trace matches the dissection in the notes); generated by [`examples/05_code_walkthrough.py`](examples/05_code_walkthrough.py). Each grid row is one comparison (both branches of the `if` are visible: swap / keep):

![Code ↔ array: the array [5, 3, 8, 4, 2]](docs/images/en/code_steps_conspect.png)

▶️ The animated version — between the "resolutions" there are frames "checking `a[j] > a[j+1]`?":

![Animation: code ↔ array](docs/images/en/code_walk_conspect.gif)

🎬 *MP4 version:* [`code_walk_conspect.mp4`](docs/images/en/code_walk_conspect.mp4)

## 10. Full step-by-step trace of `[5, 1, 4, 2, 8, 3]`

Below is the same step-by-step execution, but **in full**: every comparison and the end of every pass as a separate code ↔ array frame, in the right order, with a detailed explanation under each. The bar colours are the same as in the [legend above](#how-to-read). The block is generated automatically from the event journal (example [`examples/06_full_walkthrough.py`](examples/06_full_walkthrough.py)).

#### Step 00

![Start: the array as given](docs/images/en/walkthrough/step_00.png)

The initial array `[5, 1, 4, 2, 8, 3]`. A bar's height is the element's value, the number below it is the index. All bars are slate — the array is not ordered yet. In the code, `n = len(lst)` and the entry into the pass loop are highlighted.

#### Step 01

![Pass 0, j=0: comparing a[0] and a[1]](docs/images/en/walkthrough/step_01.png)

Pass `i = 0`, `j = 0`. We compare `a[0] = 5` and `a[1] = 1`. Since `5 > 1`, the pair is in the wrong order — we swap them (red bars, the ↔ arrow). In the code, the swap line `lst[j], lst[j+1] = lst[j+1], lst[j]` is highlighted. After the step: comparisons — 1, swaps — 1.

#### Step 02

![Pass 0, j=1: comparing a[1] and a[2]](docs/images/en/walkthrough/step_02.png)

Pass `i = 0`, `j = 1`. We compare `a[1] = 5` and `a[2] = 4`. Since `5 > 4`, the pair is in the wrong order — we swap them (red bars, the ↔ arrow). In the code, the swap line `lst[j], lst[j+1] = lst[j+1], lst[j]` is highlighted. After the step: comparisons — 2, swaps — 2.

#### Step 03

![Pass 0, j=2: comparing a[2] and a[3]](docs/images/en/walkthrough/step_03.png)

Pass `i = 0`, `j = 2`. We compare `a[2] = 5` and `a[3] = 2`. Since `5 > 2`, the pair is in the wrong order — we swap them (red bars, the ↔ arrow). In the code, the swap line `lst[j], lst[j+1] = lst[j+1], lst[j]` is highlighted. After the step: comparisons — 3, swaps — 3.

#### Step 04

![Pass 0, j=3: comparing a[3] and a[4]](docs/images/en/walkthrough/step_04.png)

Pass `i = 0`, `j = 3`. We compare `a[3] = 5` and `a[4] = 8`. Since `5 ≤ 8`, the pair is already in order — we leave it as is (amber bars). The check `if lst[j] > lst[j+1]` is highlighted (the condition is false). Comparisons — 4, swaps — 3.

#### Step 05

![Pass 0, j=4: comparing a[4] and a[5]](docs/images/en/walkthrough/step_05.png)

Pass `i = 0`, `j = 4`. We compare `a[4] = 8` and `a[5] = 3`. Since `8 > 3`, the pair is in the wrong order — we swap them (red bars, the ↔ arrow). In the code, the swap line `lst[j], lst[j+1] = lst[j+1], lst[j]` is highlighted. After the step: comparisons — 5, swaps — 4.

#### Step 06

![Pass 0 done](docs/images/en/walkthrough/step_06.png)

End of pass `i = 0`. The largest of the remaining elements bubbled up to index 5: the value 8 reached its final spot, and the green tail grew by one. So the inner loop of the next pass will be one shorter (the bound `n-i-1`). The outer-loop line `for i …` is highlighted.

#### Step 07

![Pass 1, j=0: comparing a[0] and a[1]](docs/images/en/walkthrough/step_07.png)

Pass `i = 1`, `j = 0`. We compare `a[0] = 1` and `a[1] = 4`. Since `1 ≤ 4`, the pair is already in order — we leave it as is (amber bars). The check `if lst[j] > lst[j+1]` is highlighted (the condition is false). Comparisons — 6, swaps — 4.

#### Step 08

![Pass 1, j=1: comparing a[1] and a[2]](docs/images/en/walkthrough/step_08.png)

Pass `i = 1`, `j = 1`. We compare `a[1] = 4` and `a[2] = 2`. Since `4 > 2`, the pair is in the wrong order — we swap them (red bars, the ↔ arrow). In the code, the swap line `lst[j], lst[j+1] = lst[j+1], lst[j]` is highlighted. After the step: comparisons — 7, swaps — 5.

#### Step 09

![Pass 1, j=2: comparing a[2] and a[3]](docs/images/en/walkthrough/step_09.png)

Pass `i = 1`, `j = 2`. We compare `a[2] = 4` and `a[3] = 5`. Since `4 ≤ 5`, the pair is already in order — we leave it as is (amber bars). The check `if lst[j] > lst[j+1]` is highlighted (the condition is false). Comparisons — 8, swaps — 5.

#### Step 10

![Pass 1, j=3: comparing a[3] and a[4]](docs/images/en/walkthrough/step_10.png)

Pass `i = 1`, `j = 3`. We compare `a[3] = 5` and `a[4] = 3`. Since `5 > 3`, the pair is in the wrong order — we swap them (red bars, the ↔ arrow). In the code, the swap line `lst[j], lst[j+1] = lst[j+1], lst[j]` is highlighted. After the step: comparisons — 9, swaps — 6.

#### Step 11

![Pass 1 done](docs/images/en/walkthrough/step_11.png)

End of pass `i = 1`. The largest of the remaining elements bubbled up to index 4: the value 5 reached its final spot, and the green tail grew by one. So the inner loop of the next pass will be one shorter (the bound `n-i-1`). The outer-loop line `for i …` is highlighted.

#### Step 12

![Pass 2, j=0: comparing a[0] and a[1]](docs/images/en/walkthrough/step_12.png)

Pass `i = 2`, `j = 0`. We compare `a[0] = 1` and `a[1] = 2`. Since `1 ≤ 2`, the pair is already in order — we leave it as is (amber bars). The check `if lst[j] > lst[j+1]` is highlighted (the condition is false). Comparisons — 10, swaps — 6.

#### Step 13

![Pass 2, j=1: comparing a[1] and a[2]](docs/images/en/walkthrough/step_13.png)

Pass `i = 2`, `j = 1`. We compare `a[1] = 2` and `a[2] = 4`. Since `2 ≤ 4`, the pair is already in order — we leave it as is (amber bars). The check `if lst[j] > lst[j+1]` is highlighted (the condition is false). Comparisons — 11, swaps — 6.

#### Step 14

![Pass 2, j=2: comparing a[2] and a[3]](docs/images/en/walkthrough/step_14.png)

Pass `i = 2`, `j = 2`. We compare `a[2] = 4` and `a[3] = 3`. Since `4 > 3`, the pair is in the wrong order — we swap them (red bars, the ↔ arrow). In the code, the swap line `lst[j], lst[j+1] = lst[j+1], lst[j]` is highlighted. After the step: comparisons — 12, swaps — 7.

#### Step 15

![Pass 2 done](docs/images/en/walkthrough/step_15.png)

End of pass `i = 2`. The largest of the remaining elements bubbled up to index 3: the value 4 reached its final spot, and the green tail grew by one. So the inner loop of the next pass will be one shorter (the bound `n-i-1`). The outer-loop line `for i …` is highlighted.

#### Step 16

![Pass 3, j=0: comparing a[0] and a[1]](docs/images/en/walkthrough/step_16.png)

Pass `i = 3`, `j = 0`. We compare `a[0] = 1` and `a[1] = 2`. Since `1 ≤ 2`, the pair is already in order — we leave it as is (amber bars). The check `if lst[j] > lst[j+1]` is highlighted (the condition is false). Comparisons — 13, swaps — 7.

#### Step 17

![Pass 3, j=1: comparing a[1] and a[2]](docs/images/en/walkthrough/step_17.png)

Pass `i = 3`, `j = 1`. We compare `a[1] = 2` and `a[2] = 3`. Since `2 ≤ 3`, the pair is already in order — we leave it as is (amber bars). The check `if lst[j] > lst[j+1]` is highlighted (the condition is false). Comparisons — 14, swaps — 7.

#### Step 18

![Pass 3 done](docs/images/en/walkthrough/step_18.png)

End of pass `i = 3`. The largest of the remaining elements bubbled up to index 2: the value 3 reached its final spot, and the green tail grew by one. So the inner loop of the next pass will be one shorter (the bound `n-i-1`). The outer-loop line `for i …` is highlighted.

#### Step 19

![Pass 4, j=0: comparing a[0] and a[1]](docs/images/en/walkthrough/step_19.png)

Pass `i = 4`, `j = 0`. We compare `a[0] = 1` and `a[1] = 2`. Since `1 ≤ 2`, the pair is already in order — we leave it as is (amber bars). The check `if lst[j] > lst[j+1]` is highlighted (the condition is false). Comparisons — 15, swaps — 7.

#### Step 20

![Pass 4 done](docs/images/en/walkthrough/step_20.png)

End of pass `i = 4`. The largest of the remaining elements bubbled up to index 1: the value 2 reached its final spot, and the green tail grew by one. So the inner loop of the next pass will be one shorter (the bound `n-i-1`). The outer-loop line `for i …` is highlighted.

#### Step 21

![Done](docs/images/en/walkthrough/step_21.png)

Result: the array is sorted — `[1, 2, 3, 4, 5, 8]`. In total 15 comparisons and 7 swaps over 5 pass(es). `return lst` is highlighted.

## 11. Complexity and properties

How much work bubble sort does depends on how ordered the input is:

| Case | Comparisons | Swaps | When it happens |
|---|---|---|---|
| **Best** | $O(n)$ | $0$ | already sorted input (with early exit — one pass) |
| **Average** | $O(n^2)$ | $O(n^2)$ | random order |
| **Worst** | $O(n^2)$ | $O(n^2)$ | reverse sorted input (maximum swaps) |

Other properties:

- **Extra memory — $O(1)$:** the sort runs *in place*, needing just one temporary slot for the swap (and in Python not even that, thanks to tuple unpacking).
- **Stable:** equal elements keep their relative order (the swap condition is strict).
- **Adaptive** (in the optimized version): on "nearly sorted" data it finishes fast thanks to early exit.

The number of comparisons in the naive version is always $\frac{n(n-1)}{2}$, i.e. it grows as $n^2$. Compare that growth with $n\log_2 n$ (efficient sorts) and $n$ (bubble's best case):

![Plot: n² vs n·log n](docs/images/en/growth.png)

## 12. Limitations: why bubble sort is impractical for large `n`

Quadratic complexity means that as the array grows, the number of operations grows **catastrophically fast**. Compare the number of comparisons in the worst case ($\frac{n(n-1)}{2}$) with efficient sorts ($\approx n\log_2 n$):

| `n` | Bubble ($\approx n^2/2$) | `n·log₂n` | How much worse |
|---|---|---|---|
| 10 | 45 | ≈ 33 | ~1× |
| 100 | 4,950 | ≈ 664 | ~7× |
| 1,000 | 499,500 | ≈ 9,966 | ~50× |
| 10,000 | ≈ 50,000,000 | ≈ 132,877 | ~375× |
| 1,000,000 | ≈ 5·10¹¹ | ≈ 2·10⁷ | ~25,000× |

For a million elements bubble sort would make about **half a trillion** comparisons, while `merge sort` or `quicksort` — about **twenty million**. That is the difference between a fraction of a second and hours.

That is why bubble sort is **not used** for real data in practice — it is displaced by $O(n\log n)$ algorithms:

| Algorithm | Time (worst) | Memory | Stable | Note |
|---|---|---|---|---|
| **Bubble** | $O(n^2)$ | $O(1)$ | yes | simplest; early exit on nearly ordered data |
| Insertion | $O(n^2)$ | $O(1)$ | yes | fast on short/nearly ordered arrays |
| Selection | $O(n^2)$ | $O(1)$ | no | minimal number of swaps ($O(n)$) |
| Quicksort | $O(n^2)$ | $O(\log n)$ | no | $O(n\log n)$ on average, fastest in practice |
| Merge sort | $O(n\log n)$ | $O(n)$ | yes | guaranteed $O(n\log n)$ |
| Timsort (Python `sorted`) | $O(n\log n)$ | $O(n)$ | yes | a hybrid of insertion and merge — the real-world standard |

> **The "edge" case analogy.** Just as graph algorithms have inputs that break the method (for instance, negative cycles for some shortest-path algorithms), bubble sort's "edge" case is a **large amount of data**: formally the method always returns the correct answer, but the running time makes it unusable. The honest conclusion: bubble sort is a tool for *teaching and tiny arrays*, not for production.

**Educational value vs. performance.** Despite its impracticality, bubble sort remains the first algorithm in many courses — and for good reason: it is the easiest way to show a loop invariant, the notion of stability, the early-exit idea, and the very method of complexity analysis. Once you understand "why it is slow", it is easier to appreciate *why* smarter algorithms are faster.

## 13. Where it fits

The rare situations where plain bubble sort is still justified:

- **Teaching.** The most visual way to introduce comparison, swap, pass and invariant.
- **Tiny arrays** (a handful of elements), where simplicity of the code matters more than speed and the performance difference is imperceptible.
- **Nearly sorted data** with the optimization: if the array is almost ordered and a few elements need "fixing up", early exit gives near $O(n)$ (though insertion sort is usually even better here).
- **Detecting "already sorted".** A single pass of the optimized version confirms in $O(n)$ that the array is ordered.

In any more serious task you reach for the built-in `sorted()` / `list.sort()` (Timsort) — stable, adaptive and $O(n\log n)$.

## 14. Summary

- **Bubble sort** compares adjacent elements and swaps them when they are in the wrong order; each pass bubbles the largest element to the end.
- It runs on an **array, in place** ($O(1)$ memory) and is **stable** (a swap happens only on a strict inequality).
- **Complexity:** $O(n^2)$ comparisons on average and in the worst case, $O(n)$ in the best (already sorted input + early exit).
- **The optimization** is the `swapped` flag: if a pass makes no swaps, the array is sorted, and we exit early. It changes nothing in the result, removing only the wasteful passes.
- On the array `[5, 1, 4, 2, 8, 3]` the sort costs **15 comparisons and 7 swaps**; on the already sorted `[1..6]` the optimized version makes only **5 comparisons in 1 pass**, and on the reverse `[6..1]` — the maximum: **15 swaps**.
- For **large** arrays the method is impractical — it is displaced by $O(n\log n)$ algorithms (merge sort, quicksort, Timsort). Bubble sort's value is **educational**.

## 15. License

[MIT](LICENSE) © 2026 Maryna Shavlak

