# Insertion Sort: a step-by-step walkthrough

**Insertion sort** uses the same idea a person uses when arranging playing cards in hand: you take one card at a time and insert each into its correct place among the ones already sorted. The array is mentally split into two parts — a **sorted prefix** (on the left) and an **unsorted suffix** (on the right). At each step we take the first element of the suffix “into the hand”, shift right every element of the prefix larger than it, and drop it into the freed slot. Each iteration grows the sorted prefix **left to right** by one element.

The method is slow for large arrays (time — $O(n^2)$), but it is the **best of the simple** $O(n^2)$ sorts: it is **stable**, works **in place**, is **naturally adaptive** (on nearly ordered data — close to $O(n)$ *without any flag*) and **online**. That is exactly why production sorts (Timsort in Python, introsort in C++) use it for short subarrays — so it is not just a teaching example, but a real working tool.

## 1. Intuition: arranging cards in hand

Imagine you are dealt cards and you keep them **sorted** in your hand. You pick up the next card and run it right-to-left along the ones already in hand: as soon as you see a larger card you push it right to make room; when you meet a smaller or equal one (or reach the edge) you insert the new card there. The already sorted “hand” grows by one card each time.

The same motion in an array of bars: we take `key` “into the hand” (the amber bar above the array), shift the larger prefix elements right (red ones, with a → arrow) and insert `key` into the freed “hole”:

![One insertion: take the key → shift the larger ones → insert](docs/images/en/insertion_idea.png)

**The sorted prefix grows left to right** — unlike bubble sort, where the sorted “tail” grew on the right. And we never need to scan the whole “hand”: as soon as the key lands in place, the iteration is done.

## 2. The idea: prefix, key and shifts

The algorithm consists of an outer and an inner loop:

1. The **outer loop** (`for i`) walks the elements of the **unsorted suffix** left to right, one at a time. The first element (`i = 0`) is taken as an already sorted prefix of length 1.
2. On each iteration we take `key = lst[i]` “into the hand”.
3. The **inner loop** (`while`) walks the prefix right-to-left and **shifts right** (`lst[j+1] = lst[j]`) every element larger than `key`. It stops as soon as it meets an element `<= key` (or reaches the start of the array).
4. `key` lands in the freed slot (`lst[j+1] = key`). The sorted prefix has grown by one.

The two key quantities used to measure the method’s “cost” are **comparisons** (`key < lst[j]`) and **shifts** (`lst[j+1] = lst[j]`). Note: there are no “neighbour swaps” as in bubble sort — there is a **block shift** of the larger elements and a single **insertion** of the key.

## 3. Why it works: the prefix invariant

Correctness follows from a simple **invariant**: *before each iteration `i` the subarray `lst[0..i-1]` is already sorted* (the same elements that were there originally, just put in order).

- **Base.** Before `i = 1` the prefix `lst[0..0]` is a single element, trivially sorted.
- **Step.** The inner loop shifts right every prefix element larger than `key` and inserts `key` right before the first element that is `<= key`. So after the iteration `lst[0..i]` is sorted and consists of the same elements.
- **End.** When `i` reaches `n-1`, the invariant gives that `lst[0..n-1]` is sorted — that is the whole array.

Because a shift happens only under a **strict** inequality (`key < lst[j]`), an equal element does not satisfy the condition: `key` stops **to the right** of an element equal to it and never jumps over it. That is what makes the sort [**stable**](#stability).

## 4. Example — the array `[5, 2, 4, 6, 1, 3]`

### The example array

We work with the classic 6-element array (the CLRS example):

| index | 0 | 1 | 2 | 3 | 4 | 5 |
|---|---|---|---|---|---|---|
| **value** | 5 | 2 | 4 | 6 | 1 | 3 |

![The array [5, 2, 4, 6, 1, 3] as bars](docs/images/en/array_intro.png)

### The base implementation

Here is the base implementation — the one we dissect line by line:

```python
def insertion_sort(lst):
    for i in range(1, len(lst)):
        key = lst[i]
        j = i-1
        while j >=0 and key < lst[j] :
            lst[j+1] = lst[j]
            j -= 1
        lst[j+1] = key
    return lst

numbers = [5, 3, 8, 4, 2]
insertion_sort(numbers)
```

What is what:

- `for i in range(1, len(lst))` — the **outer loop**: takes the next suffix element. It starts at `1` because element `0` is already a sorted prefix of length 1;
- `key = lst[i]` — take the current element “into the hand” (a separate variable frees its slot — a “hole” appears);
- `j = i-1` — the index of the right edge of the sorted prefix;
- `while j >= 0 and key < lst[j]` — while we have not gone past the start **and** the prefix element is larger than `key`. The check `key < lst[j]` is a **comparison**; thanks to short-circuit evaluation (`and`), at the boundary (`j < 0`) the comparison is no longer performed;
- `lst[j+1] = lst[j]` — a **shift**: the larger element moves right, the “hole” moves left;
- `lst[j+1] = key` — the **insertion**: `key` lands in the freed slot.

The learning version `insertion_sort_steps` repeats this code **action for action**, but after every meaningful action it records a snapshot of the array state and the comparison and shift counters — all the pictures below are assembled from these snapshots.

### How to read the frames

- 🟢 **green bars** — elements of the sorted **prefix** (on the left);
- 🟡 **the amber bar above the array** — `key` “in the hand”; an amber bar inside the array is the element `key` is being compared with *right now*;
- 🔴 **a red bar with a → arrow** — an element that has just been **shifted right**;
- ⬜ **slate bars** — the unsorted **suffix** (on the right);
- ⋯ **the dashed cell** — the “hole”: the free slot waiting for `key`;
- below the frame — the step’s **verdict** and the **counters**: how many comparisons and shifts there were in total.

### One iteration under the microscope

Let us look at iteration `i = 5` (`key = 3`) — it has both shifts and a “spot found” moment. Before it, the prefix `[1, 2, 4, 5, 6]` is already sorted, and `3` is the last element of the suffix.

We take `key = 3` “into the hand” — a hole is left at position 5:

![Iteration 5: take key = 3](docs/images/en/step_intro_0.png)

`j = 4`: `3 < 6` — `6` is larger, we shift it right (red, the → arrow), the hole moves to index 4:

![Iteration 5, j=4: 3 < 6 → shift](docs/images/en/step_intro_1.png)

`j = 3`: `3 < 5` — we shift `5`. `j = 2`: `3 < 4` — we shift `4`. The larger elements move right one by one, freeing up room:

![Iteration 5, j=3: 3 < 5 → shift](docs/images/en/step_intro_2.png)
![Iteration 5, j=2: 3 < 4 → shift](docs/images/en/step_intro_3.png)

`j = 1`: `3 ≥ 2` — we hit a smaller element, the **spot is found**, the `while` loop stops:

![Iteration 5, j=1: 3 ≥ 2 → spot found](docs/images/en/step_intro_4.png)

We insert `key = 3` into the hole at position 2 — the prefix is now the full `[1, 2, 3, 4, 5, 6]`:

![Iteration 5: insert key = 3 at index 2](docs/images/en/step_intro_5.png)

### The full per-iteration trace

The complete trace of all iterations:

```text
Step-by-step walkthrough of the array [5, 2, 4, 6, 1, 3]

Iteration i = 1
  take key = 2
  j=0: 2 < 5 → shift 5 right
  → array after the iteration: [2, 5, 4, 6, 1, 3];  shifts: 1;  key 2 inserted at index 0

Iteration i = 2
  take key = 4
  j=1: 4 < 5 → shift 5 right
  j=0: 4 ≥ 2 → the spot is found
  → array after the iteration: [2, 4, 5, 6, 1, 3];  shifts: 1;  key 4 inserted at index 1

Iteration i = 3
  take key = 6
  j=2: 6 ≥ 5 → the spot is found
  → array after the iteration: [2, 4, 5, 6, 1, 3];  shifts: 0;  key 6 inserted at index 3

Iteration i = 4
  take key = 1
  j=3: 1 < 6 → shift 6 right
  j=2: 1 < 5 → shift 5 right
  j=1: 1 < 4 → shift 4 right
  j=0: 1 < 2 → shift 2 right
  → array after the iteration: [1, 2, 4, 5, 6, 3];  shifts: 4;  key 1 inserted at index 0

Iteration i = 5
  take key = 3
  j=4: 3 < 6 → shift 6 right
  j=3: 3 < 5 → shift 5 right
  j=2: 3 < 4 → shift 4 right
  j=1: 3 ≥ 2 → the spot is found
  → array after the iteration: [1, 2, 3, 4, 5, 6];  shifts: 3;  key 3 inserted at index 2
```

Notice **iteration 3** (`key = 6`): `6` is already larger than the whole prefix, so the body of `while` **never runs** — 0 shifts. And **iteration 4** (`key = 1`) is the costliest: `1` is the smallest, so it “squeezes” through the entire prefix, causing 4 shifts. The cheapness of ordered runs and the expense of “the smallest one at the back” are the essence of [adaptivity](#adaptive).

### The big picture: evolution by iterations

All array states side by side — you can see the green sorted prefix grow **left to right** while the unsorted suffix melts away on the right:

![Evolution of the array [5, 2, 4, 6, 1, 3] by iterations](docs/images/en/evolution_intro.png)

▶️ The same in motion — the key “in the hand” moves left, the larger elements shift right, the prefix turns green:

![Animation: insertion sort step by step](docs/images/en/sort_intro.gif)

### Result

![The sorted array [1, 2, 3, 4, 5, 6]](docs/images/en/result_intro.png)

The console summary:

```text
Input:  [5, 2, 4, 6, 1, 3]
Output: [1, 2, 3, 4, 5, 6]
Comparisons: 12   Shifts: 9   Insertions: 5
```

On this array the sort costs **12 comparisons and 9 shifts** over **5 insertions** (one per outer-loop iteration).

## 5. Adaptive without a flag: best and worst cases

Here is the key difference from bubble sort. **Best case — an already sorted array.** For each `key` the very first check `key < lst[j]` is false (the element on the left is not larger), so the body of `while` **never runs**: $O(n)$ comparisons and **zero** shifts. And this is **without any flag** — insertion sort is adaptive *by construction* (bubble sort needs a special `swapped` flag for that):

![Best case: the prefix is full at once, 0 shifts](docs/images/en/evolution_sorted.png)

```text
Best case — the already sorted array [1, 2, 3, 4, 5, 6]
  linear: 5 comparisons, 0 shifts
Adaptive: on already sorted input — 5 comparisons and 0 shifts (without any flag).
```

▶️ The best case in motion — comparisons only, not a single shift:

![Animation: best case, 0 shifts](docs/images/en/sort_sorted.gif)

**Worst case — a reverse sorted array.** Every new `key` is smaller than the whole prefix, so it “squeezes” all the way to the start: the maximum of comparisons and shifts, $O(n^2)$:

![Worst case: a reverse array, the maximum of shifts](docs/images/en/evolution_reversed.png)

```text
Worst case — the reverse sorted array [6, 5, 4, 3, 2, 1]
  linear: 15 comparisons, 15 shifts
  binary: 11 comparisons, 15 shifts
Binary insertion cuts comparisons to 11 (linear — 15), but the shifts are the same: 15.
```

▶️ The worst case in motion — a shift at every step:

![Animation: worst case, the maximum of shifts](docs/images/en/sort_reversed.gif)

## 6. Binary insertion: fewer comparisons, the same shifts

The “optimization” of insertion sort is **not** an early-exit flag (the inner `while` already stops early). Instead, we can speed up the **search for the slot**: the sorted prefix lets us find the insertion position with a **binary search** instead of a linear one. This is **binary insertion sort**.

The win concerns only **comparisons** — they become $O(n\log n)$ instead of $O(n^2)$. But the **shifts stay** $O(n^2)$: the elements still have to be physically moved right to free the slot. On reverse input the gap in comparisons grows with the array size:

```text
The larger the array, the bigger the win in comparisons (shifts stay the same):
  n=8: linear 28 comparisons / binary 17 comparisons; 28 shifts in both
  n=16: linear 120 comparisons / binary 49 comparisons; 120 shifts in both
  n=32: linear 496 comparisons / binary 129 comparisons; 496 shifts in both
```

![Plot: n² (linear) vs n·log n (binary) vs n (best case)](docs/images/en/growth.png)

> ⚠️ **An honest caveat.** Binary insertion wins in the *worst* case, but it **loses adaptivity**: a binary search always makes $\approx\log n$ comparisons, even when the element is already in place. On *already sorted* input the linear version makes only $n-1$ comparisons (one per key), while the binary one makes all $\approx n\log n$. So binary insertion is a trade-off, not an unconditional win, and the method’s main cost — $O(n^2)$ **shifts** — does not go away.

## 7. Stability: an array with duplicates

A sort is **stable** if it preserves the relative order of elements with **equal keys**. Insertion sort is stable because a shift happens only under a **strict** inequality `key < lst[j]`: an equal element does not satisfy the condition, so `key` stops to the right of an element equal to it and never jumps over it.

To see this, let us take “tagged” duplicates — each copy of a value has a subscript that shows its original place (`3₁`, `3₂`, `3₃`):

![An array with tagged duplicates: 3₁, 1₁, 3₂, 2₁, 1₂, 3₃](docs/images/en/array_duplicates.png)

```text
Stability on an array with duplicates
Input (labels show the original order of equal keys): [3₁, 1₁, 3₂, 2₁, 1₂, 3₃]
Output (equal keys kept their original order): [1₁, 1₂, 2₁, 3₁, 3₂, 3₃]
Stable ✓: among equal keys the order of labels is unchanged.
```

After sorting, the trio `3₁, 3₂, 3₃` stayed in exactly that order (and not, say, `3₃, 3₁, 3₂`) — and so did the pair `1₁, 1₂`:

![The sorted array: equal keys in their original order](docs/images/en/result_duplicates.png)

Stability matters when elements carry extra data (we sort records by one field without destroying a previous ordering by another). That is also why the stability of insertion sort is valuable for Timsort.

## 8. Executing the code step by step: code ↔ array panels

The examples above showed the *result* of each step. Here is **the code in action**: on the left a fragment of the algorithm with **highlighted active lines**, on the right the array at exactly that moment. **The colour of a code line encodes what is happening:** 🟡 the line runs now (a loop / taking the key / the `while` condition check), 🔴 the condition `key < lst[j]` is true → `lst[j+1] = lst[j]` (a shift), 🟢 the insertion `lst[j+1] = key` and the final `return`.

We build this for the example array `[5, 3, 8, 4, 2]` (its line-by-line trace matches the walkthrough above). Each grid row is a step of the algorithm (taking the key, the shift / “spot found” branch, the insertion):

![Code ↔ array: the array [5, 3, 8, 4, 2]](docs/images/en/code_steps_conspect.png)

▶️ The animated version — between the “decisions” there are “check `key < lst[j]`?” frames:

![Animation: code ↔ array](docs/images/en/code_walk_conspect.gif)

## 9. The full step-by-step trace of `[5, 2, 4, 6, 1, 3]`

Below is the same step-by-step execution, but **in full**: taking each key, every comparison/shift, every insertion — each as a separate code ↔ array frame, in the right order, with a detailed explanation under each. The bar colours are the same as in the [legend above](#how-to-read). The block is generated automatically from the event journal.

#### Step 00

![Start: the array as given](docs/images/en/walkthrough/step_00.png)

The initial array `[5, 2, 4, 6, 1, 3]`. A bar's height is the element's value, the number below it is the index. The left element `5` is taken as a trivial sorted prefix (green), the rest is the unsorted suffix (slate). In the code, the entry into the outer loop `for i …` is highlighted.

#### Step 01

![Iteration 1: take key = 2](docs/images/en/walkthrough/step_01.png)

Iteration `i = 1`. We take `key = lst[1] = 2` “into the hand” (the amber bar above the array) — a hole is left at position 1 (dashed). To the left is the sorted prefix of 1 element(s). `key = lst[i]` and `j = i - 1` are highlighted.

#### Step 02

![Iteration 1: compare key and a[0]](docs/images/en/walkthrough/step_02.png)

Iteration `i = 1`, `j = 0`. We compare `key = 2` with `a[0] = 5`. Since `2 < 5`, the element `5` is larger — we shift it right into the free slot (red bar, the → arrow), `lst[1] = lst[0]`. The hole moves left. After the step: comparisons — 1, shifts — 1.

#### Step 03

![Iteration 1: insert key](docs/images/en/walkthrough/step_03.png)

Iteration `i = 1`. We drop `key = 2` into the freed position 0: `lst[0] = key` (green bar). The sorted prefix grew to 2 element(s). The insertion line `lst[j+1] = key` is highlighted.

#### Step 04

![Iteration 2: take key = 4](docs/images/en/walkthrough/step_04.png)

Iteration `i = 2`. We take `key = lst[2] = 4` “into the hand” (the amber bar above the array) — a hole is left at position 2 (dashed). To the left is the sorted prefix of 2 element(s). `key = lst[i]` and `j = i - 1` are highlighted.

#### Step 05

![Iteration 2: compare key and a[1]](docs/images/en/walkthrough/step_05.png)

Iteration `i = 2`, `j = 1`. We compare `key = 4` with `a[1] = 5`. Since `4 < 5`, the element `5` is larger — we shift it right into the free slot (red bar, the → arrow), `lst[2] = lst[1]`. The hole moves left. After the step: comparisons — 2, shifts — 2.

#### Step 06

![Iteration 2: compare key and a[0]](docs/images/en/walkthrough/step_06.png)

Iteration `i = 2`, `j = 0`. We compare `key = 4` with `a[0] = 2`. Since `4 ≥ 2`, the spot for the key is found — the `while` loop stops (no shift). The `while` condition check is highlighted. Comparisons — 3, shifts — 2.

#### Step 07

![Iteration 2: insert key](docs/images/en/walkthrough/step_07.png)

Iteration `i = 2`. We drop `key = 4` into the freed position 1: `lst[1] = key` (green bar). The sorted prefix grew to 3 element(s). The insertion line `lst[j+1] = key` is highlighted.

#### Step 08

![Iteration 3: take key = 6](docs/images/en/walkthrough/step_08.png)

Iteration `i = 3`. We take `key = lst[3] = 6` “into the hand” (the amber bar above the array) — a hole is left at position 3 (dashed). To the left is the sorted prefix of 3 element(s). `key = lst[i]` and `j = i - 1` are highlighted.

#### Step 09

![Iteration 3: compare key and a[2]](docs/images/en/walkthrough/step_09.png)

Iteration `i = 3`, `j = 2`. We compare `key = 6` with `a[2] = 5`. Since `6 ≥ 5`, the spot for the key is found — the `while` loop stops (no shift). The `while` condition check is highlighted. Comparisons — 4, shifts — 2.

#### Step 10

![Iteration 3: insert key](docs/images/en/walkthrough/step_10.png)

Iteration `i = 3`. We drop `key = 6` into the freed position 3: `lst[3] = key` (green bar). The sorted prefix grew to 4 element(s). The insertion line `lst[j+1] = key` is highlighted.

#### Step 11

![Iteration 4: take key = 1](docs/images/en/walkthrough/step_11.png)

Iteration `i = 4`. We take `key = lst[4] = 1` “into the hand” (the amber bar above the array) — a hole is left at position 4 (dashed). To the left is the sorted prefix of 4 element(s). `key = lst[i]` and `j = i - 1` are highlighted.

#### Step 12

![Iteration 4: compare key and a[3]](docs/images/en/walkthrough/step_12.png)

Iteration `i = 4`, `j = 3`. We compare `key = 1` with `a[3] = 6`. Since `1 < 6`, the element `6` is larger — we shift it right into the free slot (red bar, the → arrow), `lst[4] = lst[3]`. The hole moves left. After the step: comparisons — 5, shifts — 3.

#### Step 13

![Iteration 4: compare key and a[2]](docs/images/en/walkthrough/step_13.png)

Iteration `i = 4`, `j = 2`. We compare `key = 1` with `a[2] = 5`. Since `1 < 5`, the element `5` is larger — we shift it right into the free slot (red bar, the → arrow), `lst[3] = lst[2]`. The hole moves left. After the step: comparisons — 6, shifts — 4.

#### Step 14

![Iteration 4: compare key and a[1]](docs/images/en/walkthrough/step_14.png)

Iteration `i = 4`, `j = 1`. We compare `key = 1` with `a[1] = 4`. Since `1 < 4`, the element `4` is larger — we shift it right into the free slot (red bar, the → arrow), `lst[2] = lst[1]`. The hole moves left. After the step: comparisons — 7, shifts — 5.

#### Step 15

![Iteration 4: compare key and a[0]](docs/images/en/walkthrough/step_15.png)

Iteration `i = 4`, `j = 0`. We compare `key = 1` with `a[0] = 2`. Since `1 < 2`, the element `2` is larger — we shift it right into the free slot (red bar, the → arrow), `lst[1] = lst[0]`. The hole moves left. After the step: comparisons — 8, shifts — 6.

#### Step 16

![Iteration 4: insert key](docs/images/en/walkthrough/step_16.png)

Iteration `i = 4`. We drop `key = 1` into the freed position 0: `lst[0] = key` (green bar). The sorted prefix grew to 5 element(s). The insertion line `lst[j+1] = key` is highlighted.

#### Step 17

![Iteration 5: take key = 3](docs/images/en/walkthrough/step_17.png)

Iteration `i = 5`. We take `key = lst[5] = 3` “into the hand” (the amber bar above the array) — a hole is left at position 5 (dashed). To the left is the sorted prefix of 5 element(s). `key = lst[i]` and `j = i - 1` are highlighted.

#### Step 18

![Iteration 5: compare key and a[4]](docs/images/en/walkthrough/step_18.png)

Iteration `i = 5`, `j = 4`. We compare `key = 3` with `a[4] = 6`. Since `3 < 6`, the element `6` is larger — we shift it right into the free slot (red bar, the → arrow), `lst[5] = lst[4]`. The hole moves left. After the step: comparisons — 9, shifts — 7.

#### Step 19

![Iteration 5: compare key and a[3]](docs/images/en/walkthrough/step_19.png)

Iteration `i = 5`, `j = 3`. We compare `key = 3` with `a[3] = 5`. Since `3 < 5`, the element `5` is larger — we shift it right into the free slot (red bar, the → arrow), `lst[4] = lst[3]`. The hole moves left. After the step: comparisons — 10, shifts — 8.

#### Step 20

![Iteration 5: compare key and a[2]](docs/images/en/walkthrough/step_20.png)

Iteration `i = 5`, `j = 2`. We compare `key = 3` with `a[2] = 4`. Since `3 < 4`, the element `4` is larger — we shift it right into the free slot (red bar, the → arrow), `lst[3] = lst[2]`. The hole moves left. After the step: comparisons — 11, shifts — 9.

#### Step 21

![Iteration 5: compare key and a[1]](docs/images/en/walkthrough/step_21.png)

Iteration `i = 5`, `j = 1`. We compare `key = 3` with `a[1] = 2`. Since `3 ≥ 2`, the spot for the key is found — the `while` loop stops (no shift). The `while` condition check is highlighted. Comparisons — 12, shifts — 9.

#### Step 22

![Iteration 5: insert key](docs/images/en/walkthrough/step_22.png)

Iteration `i = 5`. We drop `key = 3` into the freed position 2: `lst[2] = key` (green bar). The sorted prefix grew to 6 element(s). The insertion line `lst[j+1] = key` is highlighted.

#### Step 23

![Done](docs/images/en/walkthrough/step_23.png)

Result: the array is sorted — `[1, 2, 3, 4, 5, 6]`. In total 12 comparisons and 9 shifts over 5 iterations. `return lst` is highlighted.

## 10. Complexity and properties

How much work insertion sort does depends on how ordered the input is:

| Case | Comparisons | Shifts | When it happens |
|---|---|---|---|
| **Best** | $O(n)$ | $0$ | already sorted input (the body of `while` never runs) |
| **Average** | $O(n^2)$ | $O(n^2)$ | random order |
| **Worst** | $O(n^2)$ | $O(n^2)$ | reverse sorted input (the maximum of shifts) |

Other properties:

- **Extra memory — $O(1)$:** the sort happens *in place*, only one temporary slot for `key` is needed.
- **Stable:** equal elements keep their relative order (the shift condition is strict).
- **Adaptive:** on “nearly sorted” data it finishes in nearly $O(n)$ — *without any flag*.
- **Online:** it can sort data as it arrives — each new element is inserted into the sorted prefix right away.

The number of comparisons in the worst case is $\frac{n(n-1)}{2}$, i.e. it grows like $n^2$. **Binary insertion** brings comparisons down to $\approx n\log_2 n$, but the shifts stay $O(n^2)$ (the plot is [above](#binary)).

## 11. Limitations: why $O(n^2)$ is impractical for large `n`

Quadratic complexity means that as the array size grows, the number of operations grows **catastrophically fast**. Let us compare the number of operations in the worst case ($\frac{n(n-1)}{2}$) with efficient sorts ($\approx n\log_2 n$):

| `n` | Insertion ($\approx n^2/2$) | `n·log₂n` | How much worse |
|---|---|---|---|
| 10 | 45 | ≈ 33 | ~1× |
| 100 | 4,950 | ≈ 664 | ~7× |
| 1,000 | 499,500 | ≈ 9,966 | ~50× |
| 10,000 | ≈ 50,000,000 | ≈ 132,877 | ~375× |
| 1,000,000 | ≈ 5·10¹¹ | ≈ 2·10⁷ | ~25,000× |

Even binary insertion does not save the day here: it removes the square only from *comparisons*, while the $O(n^2)$ **shifts** remain. For a million elements that is about **half a trillion** moves — the difference between fractions of a second and hours.

So for large data sets insertion sort **is not used on its own** — it is displaced by $O(n\log n)$ algorithms. But, unlike bubble sort, insertion sort has a **real industrial niche** (see below).

## 12. Where it fits: insertion in Timsort/introsort

Insertion sort is the **best of the simple** $O(n^2)$ sorts in practice, and it is genuinely used:

- **Short subarrays in production sorts.** **Timsort** (the standard `sorted()` / `list.sort()` in Python) and **introsort** (`std::sort` in C++) switch to insertion sort when a subarray is small (dozens of elements): on short runs its small constant and the absence of recursion overhead make it **faster** than $O(n\log n)$ algorithms.
- **Nearly sorted data.** Thanks to its adaptivity, on “nearly ordered” input the method works in nearly $O(n)$ — another reason Timsort relies on it while processing natural sorted “runs”.
- **Online sorting.** You can insert elements as they arrive, keeping the collection ordered without a full re-sort.
- **Tiny arrays and teaching.** The most intuitive way to introduce the notions of a prefix, a shift, an insertion, a loop invariant and complexity analysis.

## 13. Comparison with bubble and selection sort

Three simple $O(n^2)$ sorts — and why insertion is better:

| Algorithm | Mechanics | Time (worst / best) | Stable | Adaptive | Highlight |
|---|---|---|---|---|---|
| **Insertion** | **shift** a block + insert the key; the prefix grows on the left | $O(n^2)$ / $O(n)$ | yes | **yes** (no flag) | the best of the simple ones; a niche in Timsort/introsort |
| Bubble | **swap** neighbours; the “tail” grows on the right | $O(n^2)$ / $O(n)$ | yes | only with a `swapped` flag | the simplest to explain |
| Selection | pick the minimum + one swap per pass | $O(n^2)$ / $O(n^2)$ | no | no | the fewest swaps ($O(n)$) |

The key difference from **bubble sort**: insertion **shifts** a block of larger elements (rather than swapping neighbours in pairs) and grows **left to right**; on top of that it is adaptive *without any flag*. Compared with **selection sort**, insertion wins on adaptivity and stability (although selection does fewer writes to memory).

## 14. Summary

- **Insertion sort** splits the array into a sorted prefix (on the left) and an unsorted suffix; on each iteration it takes `key` “into the hand”, shifts the larger prefix elements right and inserts `key` into the freed slot. The prefix grows **left to right**.
- It works on an **array, in place** ($O(1)$ memory), is **stable** (a shift only under a strict inequality), **adaptive** (no flag) and **online**.
- **Complexity:** $O(n^2)$ comparisons and shifts in the average and worst cases, $O(n)$ comparisons and **0 shifts** in the best case (already sorted input).
- **Binary insertion** cuts *comparisons* to $O(n\log n)$, but the **shifts stay** $O(n^2)$ — and it loses adaptivity on ordered data.
- On the array `[5, 2, 4, 6, 1, 3]` the sort costs **12 comparisons and 9 shifts**; on the already sorted `[1..6]` — only **5 comparisons and 0 shifts**; on the reverse `[6..1]` — the maximum: **15 shifts** (binary brings comparisons down from 15 to 11).
- Unlike bubble sort, insertion sort has a **real niche**: production sorts (Timsort, introsort) use it for short and nearly ordered subarrays.

