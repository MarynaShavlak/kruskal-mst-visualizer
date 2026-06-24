# Shell Sort: a step-by-step walkthrough

**Shell sort** is a clever improvement on insertion sort, proposed by Donald Shell in 1959. Insertion sort's basic idea — compare and shift **adjacent** elements — is slow, because an element can only travel one position per step. Shell sort removes that limit: it compares and shifts elements that are **a step `gap` apart**. A large `gap` lets elements "leap" far in a single shift, so gross disorder disappears in the early phases. Then `gap` shrinks (`n//2 → … → 1`), and when `gap = 1` the final pass is plain insertion sort — but on an **almost-ordered** array (and therefore cheap).

This makes Shell sort an excellent **teaching** example: it shows how a tiny change (a step `gap` instead of 1) turns a quadratic algorithm into a sub-quadratic one, how the array decomposes into **subsequences with step `gap`**, why the choice of **gap sequence** decides the complexity, and why the far-apart shifts make the method **unstable**.

> 📚 Shell sort **generalizes** insertion sort. If you haven't seen the base method, start with the [**algo-insertion-sort**](https://github.com/MarynaShavlak/algo-insertion-sort) walkthrough — it covers the "key in hand", the shift, and stability that we keep referring to here.

## 1. Intuition: insertion sort, but "across a step"

Picture the array as vertical **bars** whose height is the element's value. Insertion sort takes each element and "drags" it leftwards, comparing it with its **neighbour** (`gap = 1`). If a small value ends up at the end of the array, it reaches the front only after many tiny steps — that's slow.

Shell sort looks at the same array **through a step `gap`**: it compares and shifts elements `gap` positions apart. On the left — the split into subsequences at a large `gap = n//2`; on the right — the same array at `gap = 1`, where there is a single subsequence and neighbours are compared, i.e. plain insertion sort:

![Shell sort = insertion sort with step gap](docs/images/en/shell_idea.png)

A large `gap` removes **far-apart** disorder in a single leap (an element flies across half the array). By shrinking `gap` to 1, each phase leaves the array more ordered, so the final insertion pass has almost nothing to do.

## 2. The idea: subsequences with step `gap`

This is the **signature** image of Shell sort. For a given `gap` the array splits into `gap` interleaved **subsequences**: indices `0, gap, 2·gap, …` are one group, `1, gap+1, …` are another, and so on. Each group is **insertion-sorted independently** (colour = group `i mod gap`, arcs link elements `gap` apart):

![The array split into subsequences at gap = 4](docs/images/en/gap_groups_intro.png)

The algorithm has two nested parts:

1. The **outer loop `while gap > 0`** counts the *phases*: it starts with `gap = n//2` and halves it each time, until `gap` becomes 0.
2. **For each `gap`** it is an insertion sort with step `gap`: we take `temp = arr[i]` "into hand" and shift right (by `gap` positions) every element of its subsequence that is larger than `temp`, until a slot frees up.

## 3. Why it works: `gap`-sortedness

Correctness follows from the notion of **`k`-sortedness**: an array is `k`-sorted if every subsequence with step `k` is sorted. After a phase with gap `gap` the array becomes `gap`-sorted — and, crucially, it **stays** `gap`-sorted through the later phases with smaller gaps. So by the time we reach `gap = 1` the array is already `2`-sorted (and `4`-sorted, …), i.e. "almost sorted".

And the last pass at `gap = 1` is plain insertion sort, which on an almost-ordered array runs fast (close to $O(n)$). That's exactly why Shell "boosts" insertion sort: the expensive far-apart moves are done cheaply on large gaps, and the cheap final pass only tidies up the small leftover disorder.

> Because the final phase is always `gap = 1` (plain insertion sort), the result is **guaranteed** sorted — regardless of which gaps came before. The gap sequence only affects **speed**, not correctness.

## 4. Example — array `[8, 5, 3, 7, 6, 1, 4, 2]`

### The example array

We work with an array of 8 elements (the length is a power of two, so the gaps are exactly `4, 2, 1`):

| index | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 |
|---|---|---|---|---|---|---|---|---|
| **value** | 8 | 5 | 3 | 7 | 6 | 1 | 4 | 2 |

![The array [8, 5, 3, 7, 6, 1, 4, 2] as bars](docs/images/en/array_intro.png)

### The base implementation (the notes code)

Here is the implementation from the notes — the one we walk through line by line (the fully documented version is in [`shell_sort/core.py`](shell_sort/core.py)):

```python
def shell_sort(arr):
    n = len(arr)
    gap = n // 2
    while gap > 0:
        for i in range(gap, n):
            temp = arr[i]
            j = i
            while j >= gap and arr[j - gap] > temp:
                arr[j] = arr[j - gap]
                j -= gap
            arr[j] = temp
        gap //= 2
    return arr

numbers = [5, 3, 8, 4, 2]
shell_sort(numbers)
```

What's what:

- `gap = n // 2` — the **initial gap** (half the array length);
- `while gap > 0` — the **outer phase loop**: each iteration halves `gap` (`gap //= 2`) until it hits 0. This is just *one* gap sequence — see [below](#gap-sequences) for others;
- `for i in range(gap, n)` — this is **insertion sort with step `gap`**: we walk the elements that need to be placed within their subsequence;
- `temp = arr[i]` — take the current element "into hand"; `j = i` — where we start moving left **with step `gap`** (`j -= gap`);
- `while j >= gap and arr[j - gap] > temp` — check the element `arr[j - gap]`, which sits `gap` positions to the left: if it is larger than `temp`, it must be shifted;
- `arr[j] = arr[j - gap]` — the **gap-shift**: the larger element moves `gap` positions to the right (this is how Shell "boosts" insertion sort);
- `arr[j] = temp` — once the slot is free, we put `temp` there.

The instrumented version [`shell_sort_steps`](shell_sort/core.py) repeats this code **action for action**, but after each significant event it records a snapshot of the array and the comparison/shift counters — every picture below is built from those snapshots.

### How to read the frames

- 🟡 **amber bars** — `temp` "in hand" and the element `arr[j - gap]` it is *currently* compared with (a `gap` apart);
- 🔴 **a red bar with a long arrow →** — a **gap-shift** just happened: the element flew `gap` positions to the right;
- ⋯ **a dashed "hole"** — the free slot waiting for `temp`;
- 🟢 **green bars** — the array on the final frame (sorted);
- ⬜ **slate bars** — not yet ordered;
- below the frame — the step's **verdict** and the **counters**: total comparisons and shifts.

### Phase `gap = 4`: far leaps

The first phase (`gap = n//2 = 4`) splits the array into 4 subsequences of two elements each: `{0,4}`, `{1,5}`, `{2,6}`, `{3,7}`. We insertion-sort each — but the elements in a pair are a whole 4 positions apart.

Let's follow iteration `i = 4` (`temp = arr[4] = 6`). We take `6` "into hand" — a hole is left at position 4:

![gap = 4, i = 4: take temp = 6](docs/images/en/step_intro_00.png)

We compare `arr[0] = 8` with `temp = 6` (elements a `gap = 4` apart). Since `8 > 6`, `8` must shift to the right — by a whole **4 positions** (the long red arrow):

![gap = 4: gap-shift 8 to the right](docs/images/en/step_intro_02.png)

Now `j = 0`, there is nowhere further to go — we insert `temp = 6` into the freed position 0:

![gap = 4: insert temp = 6](docs/images/en/step_intro_03.png)

Such far-apart moves are Shell's main advantage: a single shift carries a large element halfway across the array. The rest of the phase (`i = 5, 6, 7`) is shown in the [animation](#evolution) and the [full trace](#full-walkthrough).

### Phases `gap = 2` and `gap = 1`

After `gap = 4` we halve the gap. At `gap = 2` there are two subsequences — even and odd indices:

![Subsequences at gap = 2](docs/images/en/gap_groups_g2.png)

And at `gap = 1` there is a single subsequence — this is **plain insertion sort** on an already almost-ordered array (hence cheap):

![Subsequences at gap = 1](docs/images/en/gap_groups_g1.png)

The full trace by phase (printed by [`examples/01_intro.py`](examples/01_intro.py)) — you can see that the early phases do only a few far-apart shifts, while the final `gap = 1` phase merely tidies up:

```text
Step-by-step walkthrough of the array [8, 5, 3, 7, 6, 1, 4, 2]

Phase gap = 4  (subsequences: [[0, 4], [1, 5], [2, 6], [3, 7]])
  i=4: temp=6  →  [6, 5, 3, 7, 8, 1, 4, 2];  comparisons: 1;  shifts: 1
  i=5: temp=1  →  [6, 1, 3, 7, 8, 5, 4, 2];  comparisons: 1;  shifts: 1
  i=6: temp=4  →  [6, 1, 3, 7, 8, 5, 4, 2];  comparisons: 1;  shifts: 0
  i=7: temp=2  →  [6, 1, 3, 2, 8, 5, 4, 7];  comparisons: 1;  shifts: 1
  ⇒ after phase gap = 4: [6, 1, 3, 2, 8, 5, 4, 7]  (comparisons: 4, shifts: 3)

Phase gap = 2  (subsequences: [[0, 2, 4, 6], [1, 3, 5, 7]])
  i=2: temp=3  →  [3, 1, 6, 2, 8, 5, 4, 7];  comparisons: 1;  shifts: 1
  i=3: temp=2  →  [3, 1, 6, 2, 8, 5, 4, 7];  comparisons: 1;  shifts: 0
  i=4: temp=8  →  [3, 1, 6, 2, 8, 5, 4, 7];  comparisons: 1;  shifts: 0
  i=5: temp=5  →  [3, 1, 6, 2, 8, 5, 4, 7];  comparisons: 1;  shifts: 0
  i=6: temp=4  →  [3, 1, 4, 2, 6, 5, 8, 7];  comparisons: 3;  shifts: 2
  i=7: temp=7  →  [3, 1, 4, 2, 6, 5, 8, 7];  comparisons: 1;  shifts: 0
  ⇒ after phase gap = 2: [3, 1, 4, 2, 6, 5, 8, 7]  (comparisons: 8, shifts: 3)

Phase gap = 1  (subsequences: [[0, 1, 2, 3, 4, 5, 6, 7]])
  i=1: temp=1  →  [1, 3, 4, 2, 6, 5, 8, 7];  comparisons: 1;  shifts: 1
  i=2: temp=4  →  [1, 3, 4, 2, 6, 5, 8, 7];  comparisons: 1;  shifts: 0
  i=3: temp=2  →  [1, 2, 3, 4, 6, 5, 8, 7];  comparisons: 3;  shifts: 2
  i=4: temp=6  →  [1, 2, 3, 4, 6, 5, 8, 7];  comparisons: 1;  shifts: 0
  i=5: temp=5  →  [1, 2, 3, 4, 5, 6, 8, 7];  comparisons: 2;  shifts: 1
  i=6: temp=8  →  [1, 2, 3, 4, 5, 6, 8, 7];  comparisons: 1;  shifts: 0
  i=7: temp=7  →  [1, 2, 3, 4, 5, 6, 7, 8];  comparisons: 2;  shifts: 1
  ⇒ after phase gap = 1: [1, 2, 3, 4, 5, 6, 7, 8]  (comparisons: 11, shifts: 5)
```

### The big picture: evolution by phase

All the array states side by side — you can see how the array is gradually ordered from large gaps (far-apart moves) down to `gap = 1` (final insertion sort on an almost-finished array):

![Evolution of the array by gap phase](docs/images/en/evolution_intro.png)

▶️ The same in motion — phase by phase (long gap-leaps on large gaps, small inserts at `gap = 1`):

![Animation: Shell sort by gap phase](docs/images/en/sort_intro.gif)

### Result

![The sorted array [1, 2, 3, 4, 5, 6, 7, 8]](docs/images/en/result_intro.png)

The console summary (printed by [`examples/01_intro.py`](examples/01_intro.py)):

```text
Input:  [8, 5, 3, 7, 6, 1, 4, 2]
Output: [1, 2, 3, 4, 5, 6, 7, 8]
Comparisons: 23   Shifts: 11   Gap phases: 3
```

## 5. Gap sequences: `n//2` vs Knuth vs Ciura

This is the **key lesson specific to Shell sort** (an analogue of pivot choice in quicksort): the **gap sequence** itself decides the complexity. The base implementation uses `n//2, n//4, …, 1` — but that is just one option:

| Sequence | Formula | Gaps (example) | Worst case |
|---|---|---|---|
| **Shell** (original, 1959) | `n//2`, then `÷2` | `8, 4, 2, 1` | $O(n^2)$ |
| **Knuth** (1973) | `h = 3·h + 1` | `1, 4, 13, 40, …` | $O(n^{3/2})$ |
| **Ciura** (2001) | empirical | `1, 4, 10, 23, 57, …` | unknown (best in practice) |

Why `n//2` is poor: its consecutive gaps are not coprime (`8, 4, 2, 1` are all powers of two), so elements from even and odd positions stay "unmixed" for a long time. Knuth and Ciura avoid this. The parameterized implementation [`shell_sort_with_gaps`](shell_sort/core.py) with the generators [`gaps_shell`/`gaps_knuth`/`gaps_ciura`](shell_sort/core.py) lets us compare them on the same data (printed by [`examples/02_gap_sequences.py`](examples/02_gap_sequences.py)):

```text
Comparing gap sequences on main array ([8, 5, 3, 7, 6, 1, 4, 2])
  Shell n//2 gaps=[4, 2, 1]  →  comparisons: 23, shifts: 11, phases: 3
  Knuth 3k+1 gaps=[4, 1]  →  comparisons: 20, shifts: 13, phases: 2
  Ciura      gaps=[4, 1]  →  comparisons: 20, shifts: 13, phases: 2

Comparing gap sequences on reversed array ([8, 7, 6, 5, 4, 3, 2, 1])
  Shell n//2 gaps=[4, 2, 1]  →  comparisons: 22, shifts: 12, phases: 3
  Knuth 3k+1 gaps=[4, 1]  →  comparisons: 20, shifts: 16, phases: 2
  Ciura      gaps=[4, 1]  →  comparisons: 20, shifts: 16, phases: 2

Comparing gap sequences on large array ([42, 20, 51, 84, 7, 10, 69, 13, 47, 75, 8, 65, 28, 5, 12, 56, 54, 9, 31, 12, 71, 55, 8, 73])
  Shell n//2 gaps=[12, 6, 3, 1]  →  comparisons: 146, shifts: 83, phases: 4
  Knuth 3k+1 gaps=[13, 4, 1]  →  comparisons: 105, shifts: 61, phases: 3
  Ciura      gaps=[23, 10, 4, 1]  →  comparisons: 100, shifts: 53, phases: 4
```

On **tiny** arrays the difference is negligible (a shorter sequence sometimes even costs a few more shifts). But already on a 24-element array `n//2` does **229** operations vs **153** for Ciura — and the gap grows with `n`:

![Comparison of gap sequences](docs/images/en/gap_comparison.png)

The choice of sequence "slides" Shell between the complexity curves: a poor `n//2` tends toward $n^2$, better sequences toward sub-quadratic $n^{1.5}$ and below:

![Complexity: n² vs n^1.5 vs n·log n](docs/images/en/growth.png)

> 🧮 The exact asymptotics of Shell sort for many sequences is **still an open mathematical problem**. For Ciura's sequence there isn't even a proven upper bound — its advantages are established only experimentally.

## 6. Instability: an array with duplicates

A sort is **stable** if it preserves the relative order of elements with **equal keys**. Insertion sort is stable (only *strictly* larger neighbours are shifted). Shell sort, however, is **unstable**: a gap-shift moves an element `gap` positions at once and can "leap over" an equal key, ending up in front of it.

To see it, take "tagged" duplicates — each copy of a value carries a subscript showing its original position (`2₁`, `2₂`). Already the first phase `gap = 3` throws the duplicates over the head of their equals:

![An array with tagged duplicates, split at gap = 3](docs/images/en/gap_groups_dup.png)

```text
Instability on an array with duplicates
Input (labels show the original order of equal keys): [3₁, 2₁, 4₁, 2₂, 4₂, 3₂]
Output (equal keys CHANGED order — unstable): [2₂, 2₁, 3₂, 3₁, 4₂, 4₁]
Unstable ✗: among equal keys the order of labels changed (e.g. 2₂ before 2₁).
```

All three pairs of equal keys came out in reversed internal order (`…₂` before `…₁`):

![The sorted array: equal keys changed order](docs/images/en/result_duplicates.png)

This is a consequence of the far-apart leaps: across a distance of `gap` the algorithm "does not see" that it is jumping over an equal key. If stability is critical (sorting records by one field without destroying a previous ordering by another), use a stable method — for example [insertion sort](https://github.com/MarynaShavlak/algo-insertion-sort) or `Timsort` (`sorted`).

## 7. Code execution step by step: "code ↔ array" panels

The examples above showed the *result* of each step. Here is **the code in action**: on the left a fragment of the algorithm with **highlighted active lines**, on the right the array at that very moment. **The colour of the code line encodes what is happening:** 🟡 the line runs now (gap phase / taking `temp` / a condition check), 🔴 the condition `arr[j-gap] > temp` is true → a gap-shift, 🟢 inserting `temp` / shrinking the gap.

We build this for the array from the notes `[5, 3, 8, 4, 2]` (phases `gap = 2`, then `gap = 1`); generated by [`examples/05_code_walkthrough.py`](examples/05_code_walkthrough.py):

![Code ↔ array: the array [5, 3, 8, 4, 2]](docs/images/en/code_steps_conspect.png)

▶️ The animated version — between the "decisions" there are intermediate frames "is `arr[j-gap] > temp`?":

![Animation: code ↔ array](docs/images/en/code_walk_conspect.gif)

The same array also gives the **instrumented trace from the notes** — the verbatim terminal output of the `print` version (printed by the same [`examples/05_code_walkthrough.py`](examples/05_code_walkthrough.py)). It is kept exactly as in the notes (Ukrainian print messages):

```text
GAP: ==============2===================
i: ----------------- 2 ----------------
Список на початку ітерації 2: [5, 3, 8, 4, 2]
j: 2, temp: 8, gap: 2
Порівнюємо елементи: 5 > 8
В кінці циклу for: значення 8 замінило 8
Список на кінець ітерації 2: [5, 3, 8, 4, 2]
i: ----------------- 3 ----------------
Список на початку ітерації 3: [5, 3, 8, 4, 2]
j: 3, temp: 4, gap: 2
Порівнюємо елементи: 3 > 4
В кінці циклу for: значення 4 замінило 4
Список на кінець ітерації 3: [5, 3, 8, 4, 2]
i: ----------------- 4 ----------------
Список на початку ітерації 4: [5, 3, 8, 4, 2]
j: 4, temp: 2, gap: 2
Порівнюємо елементи: 8 > 2
Виконано обмін в циклу while: значення 8 замінило 2
Список змінився j: 4: [5, 3, 8, 4, 8]
Змінили j вліво: 2
Виконано обмін в циклу while: значення 5 замінило 8
Список змінився j: 2: [5, 3, 5, 4, 8]
Змінили j вліво: 0
В кінці циклу for: значення 2 замінило 5
Список на кінець ітерації 4: [2, 3, 5, 4, 8]
GAP: ==============1===================
i: ----------------- 1 ----------------
Список на початку ітерації 1: [2, 3, 5, 4, 8]
j: 1, temp: 3, gap: 1
Порівнюємо елементи: 2 > 3
В кінці циклу for: значення 3 замінило 3
Список на кінець ітерації 1: [2, 3, 5, 4, 8]
i: ----------------- 2 ----------------
Список на початку ітерації 2: [2, 3, 5, 4, 8]
j: 2, temp: 5, gap: 1
Порівнюємо елементи: 3 > 5
В кінці циклу for: значення 5 замінило 5
Список на кінець ітерації 2: [2, 3, 5, 4, 8]
i: ----------------- 3 ----------------
Список на початку ітерації 3: [2, 3, 5, 4, 8]
j: 3, temp: 4, gap: 1
Порівнюємо елементи: 5 > 4
Виконано обмін в циклу while: значення 5 замінило 4
Список змінився j: 3: [2, 3, 5, 5, 8]
Змінили j вліво: 2
В кінці циклу for: значення 4 замінило 5
Список на кінець ітерації 3: [2, 3, 4, 5, 8]
i: ----------------- 4 ----------------
Список на початку ітерації 4: [2, 3, 4, 5, 8]
j: 4, temp: 8, gap: 1
Порівнюємо елементи: 5 > 8
В кінці циклу for: значення 8 замінило 8
Список на кінець ітерації 4: [2, 3, 4, 5, 8]
Сортування завершено
[2, 3, 4, 5, 8]
```

## 8. Full step-by-step trace of `[8, 5, 3, 7, 6, 1, 4, 2]`

Below is the same step-by-step execution, but **in full**: every journal event (the start of a `gap` phase, taking `temp`, every comparison a `gap` apart, every gap-shift, an insert, the end of a phase) as a separate "code ↔ array" frame, in the right order, with a detailed explanation under each. The bar colours are the same as in the [legend above](#how-to-read). The block is generated automatically from the event journal (the example [`examples/06_full_walkthrough.py`](examples/06_full_walkthrough.py)).

#### Step 00 · start

![Start: the array as given](docs/images/en/walkthrough/step_00.png)

The initial array `[8, 5, 3, 7, 6, 1, 4, 2]`. A bar's height is the element's value, the number below it is the index. All bars are slate — the array is not ordered yet. We take the initial gap `gap = n // 2 = 4`.

#### Step 01 · gap phase begins

![Phase gap = 4](docs/images/en/walkthrough/step_01.png)

Phase `gap = 4` begins. The array splits into 4 subsequences with step 4 (indices [[0, 4], [1, 5], [2, 6], [3, 7]]); each is insertion-sorted **independently**. In the code, `while gap > 0` and `for i in range(gap, n)` are highlighted.

#### Step 02 · take temp

![gap = 4, i = 4: take temp = 6](docs/images/en/walkthrough/step_02.png)

Phase `gap = 4`, `i = 4`. We lift `temp = arr[4] = 6` into hand — a hole is left at position 4, `j = 4`. `temp = arr[i]` is highlighted.

#### Step 03 · comparison

![gap = 4, j = 4: compare a[0] and temp](docs/images/en/walkthrough/step_03.png)

Phase `gap = 4`, `j = 4`. We compare `arr[0] = 8` with `temp = 6` (elements gap apart). The condition `while j >= gap and arr[j-gap] > temp` is highlighted.

#### Step 04 · gap-shift

![gap = 4: gap-shift to the right](docs/images/en/walkthrough/step_04.png)

`8 > 6` is true, so we gap-shift: `arr[4] = arr[0]`. The element 8 jumps 4 positions to the right (red bar, the long arrow →), and `j` decreases by gap. `arr[j] = arr[j-gap]` is highlighted. After the step: comparisons — 1, shifts — 1.

#### Step 05 · insert

![gap = 4: insert temp](docs/images/en/walkthrough/step_05.png)

We insert `temp = 6` into the freed position 0: `arr[0] = temp`. The gap-step subsequence is ordered up to this element (green bar). `arr[j] = temp` is highlighted.

#### Step 06 · take temp

![gap = 4, i = 5: take temp = 1](docs/images/en/walkthrough/step_06.png)

Phase `gap = 4`, `i = 5`. We lift `temp = arr[5] = 1` into hand — a hole is left at position 5, `j = 5`. `temp = arr[i]` is highlighted.

#### Step 07 · comparison

![gap = 4, j = 5: compare a[1] and temp](docs/images/en/walkthrough/step_07.png)

Phase `gap = 4`, `j = 5`. We compare `arr[1] = 5` with `temp = 1` (elements gap apart). The condition `while j >= gap and arr[j-gap] > temp` is highlighted.

#### Step 08 · gap-shift

![gap = 4: gap-shift to the right](docs/images/en/walkthrough/step_08.png)

`5 > 1` is true, so we gap-shift: `arr[5] = arr[1]`. The element 5 jumps 4 positions to the right (red bar, the long arrow →), and `j` decreases by gap. `arr[j] = arr[j-gap]` is highlighted. After the step: comparisons — 2, shifts — 2.

#### Step 09 · insert

![gap = 4: insert temp](docs/images/en/walkthrough/step_09.png)

We insert `temp = 1` into the freed position 1: `arr[1] = temp`. The gap-step subsequence is ordered up to this element (green bar). `arr[j] = temp` is highlighted.

#### Step 10 · take temp

![gap = 4, i = 6: take temp = 4](docs/images/en/walkthrough/step_10.png)

Phase `gap = 4`, `i = 6`. We lift `temp = arr[6] = 4` into hand — a hole is left at position 6, `j = 6`. `temp = arr[i]` is highlighted.

#### Step 11 · place found

![gap = 4, j = 6: compare a[2] and temp](docs/images/en/walkthrough/step_11.png)

`3 ≤ 4` is false: temp's place is found and the inner `while` loop stops. The condition check is highlighted (false). Comparisons — 3, shifts — 2.

#### Step 12 · insert

![gap = 4: insert temp](docs/images/en/walkthrough/step_12.png)

We insert `temp = 4` into the freed position 6: `arr[6] = temp`. The gap-step subsequence is ordered up to this element (green bar). `arr[j] = temp` is highlighted.

#### Step 13 · take temp

![gap = 4, i = 7: take temp = 2](docs/images/en/walkthrough/step_13.png)

Phase `gap = 4`, `i = 7`. We lift `temp = arr[7] = 2` into hand — a hole is left at position 7, `j = 7`. `temp = arr[i]` is highlighted.

#### Step 14 · comparison

![gap = 4, j = 7: compare a[3] and temp](docs/images/en/walkthrough/step_14.png)

Phase `gap = 4`, `j = 7`. We compare `arr[3] = 7` with `temp = 2` (elements gap apart). The condition `while j >= gap and arr[j-gap] > temp` is highlighted.

#### Step 15 · gap-shift

![gap = 4: gap-shift to the right](docs/images/en/walkthrough/step_15.png)

`7 > 2` is true, so we gap-shift: `arr[7] = arr[3]`. The element 7 jumps 4 positions to the right (red bar, the long arrow →), and `j` decreases by gap. `arr[j] = arr[j-gap]` is highlighted. After the step: comparisons — 4, shifts — 3.

#### Step 16 · insert

![gap = 4: insert temp](docs/images/en/walkthrough/step_16.png)

We insert `temp = 2` into the freed position 3: `arr[3] = temp`. The gap-step subsequence is ordered up to this element (green bar). `arr[j] = temp` is highlighted.

#### Step 17 · gap phase ends

![Phase gap = 4 complete](docs/images/en/walkthrough/step_17.png)

Phase `gap = 4` is complete — the array is now 4-sorted (every subsequence with step 4 is ordered). We halve the gap `gap //= 2`. The line `gap //= 2` is highlighted.

#### Step 18 · gap phase begins

![Phase gap = 2](docs/images/en/walkthrough/step_18.png)

Phase `gap = 2` begins. The array splits into 2 subsequences with step 2 (indices [[0, 2, 4, 6], [1, 3, 5, 7]]); each is insertion-sorted **independently**. In the code, `while gap > 0` and `for i in range(gap, n)` are highlighted.

#### Step 19 · take temp

![gap = 2, i = 2: take temp = 3](docs/images/en/walkthrough/step_19.png)

Phase `gap = 2`, `i = 2`. We lift `temp = arr[2] = 3` into hand — a hole is left at position 2, `j = 2`. `temp = arr[i]` is highlighted.

#### Step 20 · comparison

![gap = 2, j = 2: compare a[0] and temp](docs/images/en/walkthrough/step_20.png)

Phase `gap = 2`, `j = 2`. We compare `arr[0] = 6` with `temp = 3` (elements gap apart). The condition `while j >= gap and arr[j-gap] > temp` is highlighted.

#### Step 21 · gap-shift

![gap = 2: gap-shift to the right](docs/images/en/walkthrough/step_21.png)

`6 > 3` is true, so we gap-shift: `arr[2] = arr[0]`. The element 6 jumps 2 positions to the right (red bar, the long arrow →), and `j` decreases by gap. `arr[j] = arr[j-gap]` is highlighted. After the step: comparisons — 5, shifts — 4.

#### Step 22 · insert

![gap = 2: insert temp](docs/images/en/walkthrough/step_22.png)

We insert `temp = 3` into the freed position 0: `arr[0] = temp`. The gap-step subsequence is ordered up to this element (green bar). `arr[j] = temp` is highlighted.

#### Step 23 · take temp

![gap = 2, i = 3: take temp = 2](docs/images/en/walkthrough/step_23.png)

Phase `gap = 2`, `i = 3`. We lift `temp = arr[3] = 2` into hand — a hole is left at position 3, `j = 3`. `temp = arr[i]` is highlighted.

#### Step 24 · place found

![gap = 2, j = 3: compare a[1] and temp](docs/images/en/walkthrough/step_24.png)

`1 ≤ 2` is false: temp's place is found and the inner `while` loop stops. The condition check is highlighted (false). Comparisons — 6, shifts — 4.

#### Step 25 · insert

![gap = 2: insert temp](docs/images/en/walkthrough/step_25.png)

We insert `temp = 2` into the freed position 3: `arr[3] = temp`. The gap-step subsequence is ordered up to this element (green bar). `arr[j] = temp` is highlighted.

#### Step 26 · take temp

![gap = 2, i = 4: take temp = 8](docs/images/en/walkthrough/step_26.png)

Phase `gap = 2`, `i = 4`. We lift `temp = arr[4] = 8` into hand — a hole is left at position 4, `j = 4`. `temp = arr[i]` is highlighted.

#### Step 27 · place found

![gap = 2, j = 4: compare a[2] and temp](docs/images/en/walkthrough/step_27.png)

`6 ≤ 8` is false: temp's place is found and the inner `while` loop stops. The condition check is highlighted (false). Comparisons — 7, shifts — 4.

#### Step 28 · insert

![gap = 2: insert temp](docs/images/en/walkthrough/step_28.png)

We insert `temp = 8` into the freed position 4: `arr[4] = temp`. The gap-step subsequence is ordered up to this element (green bar). `arr[j] = temp` is highlighted.

#### Step 29 · take temp

![gap = 2, i = 5: take temp = 5](docs/images/en/walkthrough/step_29.png)

Phase `gap = 2`, `i = 5`. We lift `temp = arr[5] = 5` into hand — a hole is left at position 5, `j = 5`. `temp = arr[i]` is highlighted.

#### Step 30 · place found

![gap = 2, j = 5: compare a[3] and temp](docs/images/en/walkthrough/step_30.png)

`2 ≤ 5` is false: temp's place is found and the inner `while` loop stops. The condition check is highlighted (false). Comparisons — 8, shifts — 4.

#### Step 31 · insert

![gap = 2: insert temp](docs/images/en/walkthrough/step_31.png)

We insert `temp = 5` into the freed position 5: `arr[5] = temp`. The gap-step subsequence is ordered up to this element (green bar). `arr[j] = temp` is highlighted.

#### Step 32 · take temp

![gap = 2, i = 6: take temp = 4](docs/images/en/walkthrough/step_32.png)

Phase `gap = 2`, `i = 6`. We lift `temp = arr[6] = 4` into hand — a hole is left at position 6, `j = 6`. `temp = arr[i]` is highlighted.

#### Step 33 · comparison

![gap = 2, j = 6: compare a[4] and temp](docs/images/en/walkthrough/step_33.png)

Phase `gap = 2`, `j = 6`. We compare `arr[4] = 8` with `temp = 4` (elements gap apart). The condition `while j >= gap and arr[j-gap] > temp` is highlighted.

#### Step 34 · gap-shift

![gap = 2: gap-shift to the right](docs/images/en/walkthrough/step_34.png)

`8 > 4` is true, so we gap-shift: `arr[6] = arr[4]`. The element 8 jumps 2 positions to the right (red bar, the long arrow →), and `j` decreases by gap. `arr[j] = arr[j-gap]` is highlighted. After the step: comparisons — 9, shifts — 5.

#### Step 35 · comparison

![gap = 2, j = 4: compare a[2] and temp](docs/images/en/walkthrough/step_35.png)

Phase `gap = 2`, `j = 4`. We compare `arr[2] = 6` with `temp = 4` (elements gap apart). The condition `while j >= gap and arr[j-gap] > temp` is highlighted.

#### Step 36 · gap-shift

![gap = 2: gap-shift to the right](docs/images/en/walkthrough/step_36.png)

`6 > 4` is true, so we gap-shift: `arr[4] = arr[2]`. The element 6 jumps 2 positions to the right (red bar, the long arrow →), and `j` decreases by gap. `arr[j] = arr[j-gap]` is highlighted. After the step: comparisons — 10, shifts — 6.

#### Step 37 · place found

![gap = 2, j = 2: compare a[0] and temp](docs/images/en/walkthrough/step_37.png)

`3 ≤ 4` is false: temp's place is found and the inner `while` loop stops. The condition check is highlighted (false). Comparisons — 11, shifts — 6.

#### Step 38 · insert

![gap = 2: insert temp](docs/images/en/walkthrough/step_38.png)

We insert `temp = 4` into the freed position 2: `arr[2] = temp`. The gap-step subsequence is ordered up to this element (green bar). `arr[j] = temp` is highlighted.

#### Step 39 · take temp

![gap = 2, i = 7: take temp = 7](docs/images/en/walkthrough/step_39.png)

Phase `gap = 2`, `i = 7`. We lift `temp = arr[7] = 7` into hand — a hole is left at position 7, `j = 7`. `temp = arr[i]` is highlighted.

#### Step 40 · place found

![gap = 2, j = 7: compare a[5] and temp](docs/images/en/walkthrough/step_40.png)

`5 ≤ 7` is false: temp's place is found and the inner `while` loop stops. The condition check is highlighted (false). Comparisons — 12, shifts — 6.

#### Step 41 · insert

![gap = 2: insert temp](docs/images/en/walkthrough/step_41.png)

We insert `temp = 7` into the freed position 7: `arr[7] = temp`. The gap-step subsequence is ordered up to this element (green bar). `arr[j] = temp` is highlighted.

#### Step 42 · gap phase ends

![Phase gap = 2 complete](docs/images/en/walkthrough/step_42.png)

Phase `gap = 2` is complete — the array is now 2-sorted (every subsequence with step 2 is ordered). We halve the gap `gap //= 2`. The line `gap //= 2` is highlighted.

#### Step 43 · gap phase begins

![Phase gap = 1](docs/images/en/walkthrough/step_43.png)

Phase `gap = 1` begins. The array splits into 1 subsequences with step 1 (indices [[0, 1, 2, 3, 4, 5, 6, 7]]); each is insertion-sorted **independently**. In the code, `while gap > 0` and `for i in range(gap, n)` are highlighted.

#### Step 44 · take temp

![gap = 1, i = 1: take temp = 1](docs/images/en/walkthrough/step_44.png)

Phase `gap = 1`, `i = 1`. We lift `temp = arr[1] = 1` into hand — a hole is left at position 1, `j = 1`. `temp = arr[i]` is highlighted.

#### Step 45 · comparison

![gap = 1, j = 1: compare a[0] and temp](docs/images/en/walkthrough/step_45.png)

Phase `gap = 1`, `j = 1`. We compare `arr[0] = 3` with `temp = 1` (elements gap apart). The condition `while j >= gap and arr[j-gap] > temp` is highlighted.

#### Step 46 · gap-shift

![gap = 1: gap-shift to the right](docs/images/en/walkthrough/step_46.png)

`3 > 1` is true, so we gap-shift: `arr[1] = arr[0]`. The element 3 jumps 1 positions to the right (red bar, the long arrow →), and `j` decreases by gap. `arr[j] = arr[j-gap]` is highlighted. After the step: comparisons — 13, shifts — 7.

#### Step 47 · insert

![gap = 1: insert temp](docs/images/en/walkthrough/step_47.png)

We insert `temp = 1` into the freed position 0: `arr[0] = temp`. The gap-step subsequence is ordered up to this element (green bar). `arr[j] = temp` is highlighted.

#### Step 48 · take temp

![gap = 1, i = 2: take temp = 4](docs/images/en/walkthrough/step_48.png)

Phase `gap = 1`, `i = 2`. We lift `temp = arr[2] = 4` into hand — a hole is left at position 2, `j = 2`. `temp = arr[i]` is highlighted.

#### Step 49 · place found

![gap = 1, j = 2: compare a[1] and temp](docs/images/en/walkthrough/step_49.png)

`3 ≤ 4` is false: temp's place is found and the inner `while` loop stops. The condition check is highlighted (false). Comparisons — 14, shifts — 7.

#### Step 50 · insert

![gap = 1: insert temp](docs/images/en/walkthrough/step_50.png)

We insert `temp = 4` into the freed position 2: `arr[2] = temp`. The gap-step subsequence is ordered up to this element (green bar). `arr[j] = temp` is highlighted.

#### Step 51 · take temp

![gap = 1, i = 3: take temp = 2](docs/images/en/walkthrough/step_51.png)

Phase `gap = 1`, `i = 3`. We lift `temp = arr[3] = 2` into hand — a hole is left at position 3, `j = 3`. `temp = arr[i]` is highlighted.

#### Step 52 · comparison

![gap = 1, j = 3: compare a[2] and temp](docs/images/en/walkthrough/step_52.png)

Phase `gap = 1`, `j = 3`. We compare `arr[2] = 4` with `temp = 2` (elements gap apart). The condition `while j >= gap and arr[j-gap] > temp` is highlighted.

#### Step 53 · gap-shift

![gap = 1: gap-shift to the right](docs/images/en/walkthrough/step_53.png)

`4 > 2` is true, so we gap-shift: `arr[3] = arr[2]`. The element 4 jumps 1 positions to the right (red bar, the long arrow →), and `j` decreases by gap. `arr[j] = arr[j-gap]` is highlighted. After the step: comparisons — 15, shifts — 8.

#### Step 54 · comparison

![gap = 1, j = 2: compare a[1] and temp](docs/images/en/walkthrough/step_54.png)

Phase `gap = 1`, `j = 2`. We compare `arr[1] = 3` with `temp = 2` (elements gap apart). The condition `while j >= gap and arr[j-gap] > temp` is highlighted.

#### Step 55 · gap-shift

![gap = 1: gap-shift to the right](docs/images/en/walkthrough/step_55.png)

`3 > 2` is true, so we gap-shift: `arr[2] = arr[1]`. The element 3 jumps 1 positions to the right (red bar, the long arrow →), and `j` decreases by gap. `arr[j] = arr[j-gap]` is highlighted. After the step: comparisons — 16, shifts — 9.

#### Step 56 · place found

![gap = 1, j = 1: compare a[0] and temp](docs/images/en/walkthrough/step_56.png)

`1 ≤ 2` is false: temp's place is found and the inner `while` loop stops. The condition check is highlighted (false). Comparisons — 17, shifts — 9.

#### Step 57 · insert

![gap = 1: insert temp](docs/images/en/walkthrough/step_57.png)

We insert `temp = 2` into the freed position 1: `arr[1] = temp`. The gap-step subsequence is ordered up to this element (green bar). `arr[j] = temp` is highlighted.

#### Step 58 · take temp

![gap = 1, i = 4: take temp = 6](docs/images/en/walkthrough/step_58.png)

Phase `gap = 1`, `i = 4`. We lift `temp = arr[4] = 6` into hand — a hole is left at position 4, `j = 4`. `temp = arr[i]` is highlighted.

#### Step 59 · place found

![gap = 1, j = 4: compare a[3] and temp](docs/images/en/walkthrough/step_59.png)

`4 ≤ 6` is false: temp's place is found and the inner `while` loop stops. The condition check is highlighted (false). Comparisons — 18, shifts — 9.

#### Step 60 · insert

![gap = 1: insert temp](docs/images/en/walkthrough/step_60.png)

We insert `temp = 6` into the freed position 4: `arr[4] = temp`. The gap-step subsequence is ordered up to this element (green bar). `arr[j] = temp` is highlighted.

#### Step 61 · take temp

![gap = 1, i = 5: take temp = 5](docs/images/en/walkthrough/step_61.png)

Phase `gap = 1`, `i = 5`. We lift `temp = arr[5] = 5` into hand — a hole is left at position 5, `j = 5`. `temp = arr[i]` is highlighted.

#### Step 62 · comparison

![gap = 1, j = 5: compare a[4] and temp](docs/images/en/walkthrough/step_62.png)

Phase `gap = 1`, `j = 5`. We compare `arr[4] = 6` with `temp = 5` (elements gap apart). The condition `while j >= gap and arr[j-gap] > temp` is highlighted.

#### Step 63 · gap-shift

![gap = 1: gap-shift to the right](docs/images/en/walkthrough/step_63.png)

`6 > 5` is true, so we gap-shift: `arr[5] = arr[4]`. The element 6 jumps 1 positions to the right (red bar, the long arrow →), and `j` decreases by gap. `arr[j] = arr[j-gap]` is highlighted. After the step: comparisons — 19, shifts — 10.

#### Step 64 · place found

![gap = 1, j = 4: compare a[3] and temp](docs/images/en/walkthrough/step_64.png)

`4 ≤ 5` is false: temp's place is found and the inner `while` loop stops. The condition check is highlighted (false). Comparisons — 20, shifts — 10.

#### Step 65 · insert

![gap = 1: insert temp](docs/images/en/walkthrough/step_65.png)

We insert `temp = 5` into the freed position 4: `arr[4] = temp`. The gap-step subsequence is ordered up to this element (green bar). `arr[j] = temp` is highlighted.

#### Step 66 · take temp

![gap = 1, i = 6: take temp = 8](docs/images/en/walkthrough/step_66.png)

Phase `gap = 1`, `i = 6`. We lift `temp = arr[6] = 8` into hand — a hole is left at position 6, `j = 6`. `temp = arr[i]` is highlighted.

#### Step 67 · place found

![gap = 1, j = 6: compare a[5] and temp](docs/images/en/walkthrough/step_67.png)

`6 ≤ 8` is false: temp's place is found and the inner `while` loop stops. The condition check is highlighted (false). Comparisons — 21, shifts — 10.

#### Step 68 · insert

![gap = 1: insert temp](docs/images/en/walkthrough/step_68.png)

We insert `temp = 8` into the freed position 6: `arr[6] = temp`. The gap-step subsequence is ordered up to this element (green bar). `arr[j] = temp` is highlighted.

#### Step 69 · take temp

![gap = 1, i = 7: take temp = 7](docs/images/en/walkthrough/step_69.png)

Phase `gap = 1`, `i = 7`. We lift `temp = arr[7] = 7` into hand — a hole is left at position 7, `j = 7`. `temp = arr[i]` is highlighted.

#### Step 70 · comparison

![gap = 1, j = 7: compare a[6] and temp](docs/images/en/walkthrough/step_70.png)

Phase `gap = 1`, `j = 7`. We compare `arr[6] = 8` with `temp = 7` (elements gap apart). The condition `while j >= gap and arr[j-gap] > temp` is highlighted.

#### Step 71 · gap-shift

![gap = 1: gap-shift to the right](docs/images/en/walkthrough/step_71.png)

`8 > 7` is true, so we gap-shift: `arr[7] = arr[6]`. The element 8 jumps 1 positions to the right (red bar, the long arrow →), and `j` decreases by gap. `arr[j] = arr[j-gap]` is highlighted. After the step: comparisons — 22, shifts — 11.

#### Step 72 · place found

![gap = 1, j = 6: compare a[5] and temp](docs/images/en/walkthrough/step_72.png)

`6 ≤ 7` is false: temp's place is found and the inner `while` loop stops. The condition check is highlighted (false). Comparisons — 23, shifts — 11.

#### Step 73 · insert

![gap = 1: insert temp](docs/images/en/walkthrough/step_73.png)

We insert `temp = 7` into the freed position 6: `arr[6] = temp`. The gap-step subsequence is ordered up to this element (green bar). `arr[j] = temp` is highlighted.

#### Step 74 · gap phase ends

![Phase gap = 1 complete](docs/images/en/walkthrough/step_74.png)

Phase `gap = 1` is complete — the array is now 1-sorted (every subsequence with step 1 is ordered). We halve the gap `gap //= 2`. The line `gap //= 2` is highlighted.

#### Step 75 · done

![Done](docs/images/en/walkthrough/step_75.png)

Result: the array is sorted — `[1, 2, 3, 4, 5, 6, 7, 8]`. In total 23 comparisons and 11 shifts over 3 gap phases. `return arr` is highlighted.

## 9. Complexity and properties

How much work Shell sort does depends on the **gap sequence** and on how ordered the input is:

| Case | Comparisons | When it happens |
|---|---|---|
| **Best** | $O(n\log n)$ | already sorted input (each phase does almost no shifts) |
| **Average** | depends on the sequence (empirically $\approx n^{1.25}$) | random order |
| **Worst** | $O(n^2)$ for `n//2`; $O(n^{3/2})$ for Knuth | depends on the gap sequence |

Other properties:

- **Extra memory — $O(1)$:** the sort happens *in place*, only a slot for `temp` is needed. **No recursion** (unlike quicksort/merge sort).
- **Unstable:** gap-shifts can leap over equal keys ([see above](#stability)).
- **Adaptive:** on "almost sorted" data the phases do fewer shifts; at `gap = 1` the final insertion pass is cheap.
- **A generalization of insertion sort:** at `gap = 1` the algorithm coincides with plain insertion sort — Shell merely "boosts" it with large leaps in the early phases.

## 10. Limitations

- **The complexity is hard to analyze and depends on the gap sequence.** The exact asymptotics for many sequences is still an open problem; there is no simple formula for "how much Shell costs".
- **The plain `n//2` version is still $O(n^2)$ in the worst case** — to get sub-quadratic behaviour you must deliberately pick a better sequence (Knuth, Ciura).
- **Unstable** — not suitable where the order of equal keys must be preserved.
- **Loses to $O(n\log n)$ sorts on large `n`:** merge sort, quicksort and Timsort are asymptotically faster, so for millions of elements you'd pick them.

**BUT** Shell sort has a real niche. It is **simple** (a few lines of code), works **in place** with $O(1)$ memory, **without recursion** (no call stack), and behaves well on **medium** arrays. That's why it is valued in **embedded and constrained systems**, where small code size and the absence of recursion matter, and as a fast "good enough" sort when pulling in a full $O(n\log n)$ algorithm would be overkill.

## 11. Where it fits

- **Embedded / constrained systems:** small code, $O(1)$ memory, no recursion — Shell sort was historically used in kernels, bootloaders, and the `uClibc` library.
- **Medium arrays**, where an $O(n\log n)$ algorithm with its overhead (recursion, extra memory) is not justified, and plain $O(n^2)$ ones are already too slow.
- **Teaching:** a visual bridge from simple $O(n^2)$ sorts to sub-quadratic ones — it shows how one idea (a step `gap`) dramatically speeds up the method.

For most general-purpose tasks you'd reach for the built-in `sorted()` / `list.sort()` (Timsort) — stable, adaptive and $O(n\log n)$.

## 12. Place in the sorting series

Shell sort is a "clever improvement on a simple sort": a bridge from $O(n^2)$ (insertion sort) to sub-quadratic complexity, still without divide-and-conquer (as in quicksort/merge sort).

| Algorithm | Time (worst) | Memory | Stable | Notable for |
|---|---|---|---|---|
| [Bubble](https://github.com/MarynaShavlak/algo-bubble-sort) | $O(n^2)$ | $O(1)$ | yes | simplest; early exit on almost-ordered input |
| [Insertion](https://github.com/MarynaShavlak/algo-insertion-sort) | $O(n^2)$ | $O(1)$ | yes | fast on short/almost-ordered arrays; **Shell generalizes it** |
| [Selection](https://github.com/MarynaShavlak/algo-selection-sort) | $O(n^2)$ | $O(1)$ | no | minimum number of swaps ($O(n)$) |
| **Shell** | $O(n^2)$…$O(n^{3/2})$ | $O(1)$ | no | insertion sort with step `gap`; sub-quadratic, in-place, no recursion |
| [Quicksort](https://github.com/MarynaShavlak/algo-quick-sort) | $O(n^2)$ | $O(\log n)$ | no | $O(n\log n)$ on average, fastest in practice |
| [Merge sort](https://github.com/MarynaShavlak/algo-merge-sort) | $O(n\log n)$ | $O(n)$ | yes | guaranteed $O(n\log n)$ |
| Timsort (Python `sorted`) | $O(n\log n)$ | $O(n)$ | yes | a hybrid of insertion and merge — the real-world standard |

## 13. Summary

- **Shell sort** is insertion sort with a step `gap`: we compare and shift elements that are **a `gap` apart**, gradually shrinking `gap` to 1.
- For a given `gap` the array splits into `gap` **subsequences**, each insertion-sorted; large gaps remove far-apart disorder in a single leap, and the final pass (`gap = 1`) is plain insertion sort on an almost-ordered array.
- The **choice of gap sequence** decides the complexity: `n//2` → $O(n^2)$ worst case; Knuth `3k+1` → $O(n^{3/2})$; Ciura — best in practice. The exact asymptotics for many sequences is an open problem.
- It runs **in place** ($O(1)$ memory), **without recursion**, is **adaptive**, but **unstable** (gap-shifts leap over equal keys).
- On the array `[8, 5, 3, 7, 6, 1, 4, 2]` the sort costs **23 comparisons and 11 shifts** over **3 phases** (`gap = 4, 2, 1`).
- Its real niche is **simple, in-place, recursion-free** sorting of medium arrays (embedded/constrained systems); on large `n` it is displaced by $O(n\log n)$ algorithms.

