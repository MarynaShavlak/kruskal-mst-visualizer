# Naive String Search: a step-by-step walkthrough

**Naive string search** is the simplest substring-search algorithm: to find a **pattern** `pattern` inside a **text** `main_string`, we **slide** the pattern along the text and, at every alignment (offset `i`), compare characters left to right. As soon as all pattern characters match — we return the position `i`; on the very first mismatch we shift the pattern **one position to the right** and restart the comparison from `j = 0`. If no alignment matches — we return `-1`. No preprocessing: the method works on any string (text, DNA, a log) and needs no sorting or other precondition.

This is the **first string algorithm** in the series — a new problem domain: the data here is not a numeric array but **sequences of characters** (text + pattern), and the operation is character-by-character **equality** (`==`). In spirit it is a direct analogue of [linear search](https://github.com/MarynaShavlak/algo-linear-search) for arrays: brute force, zero preprocessing. The algorithm's "cost" is the **number of character comparisons**; its defining trait is **wasted work**: after a partial match and a mismatch, the naive method throws everything away and shifts by only 1, **re-comparing** already-checked characters. This is exactly what the smarter successors remove — KMP, Boyer–Moore, Rabin–Karp.

## 1. Intuition: searching for a word by hand

Imagine searching for a word in a text "by hand": you run your **finger** along the line and check letter by letter. If some letter does not match — you shift the word **one position** to the right and start the comparison from the beginning again. That is exactly how naive search works: the pattern slides along the text, and at each alignment the characters are compared left to right.

First we place the pattern at the start of the text and begin comparing characters left to right:

![The text HELLO WORLD and the pattern WORLD at the start](docs/images/en/intuition_setup.png)

![Searching for WORLD in HELLO WORLD: comparing letter by letter](docs/images/en/intuition_slide.png)

The current pair of compared characters is joined by a "text ↔ pattern" **bridge**. A character match is marked **green**, a mismatch — **red**. No match — shift by 1 and try again; this way we reach the position where the whole word matches (here — position 6).

## 2. The idea: slide the pattern

The core principle: compare each character of the main string with the first character of the pattern; if they match — compare the next characters to the end of the pattern. The steps for each character of the main string:

1. Compare this character and the following ones with the pattern characters.
2. If **all** pattern characters matched — the substring is found.
3. If even one character does not match — move on to the **next** character of the main string (shift by 1).

We place the pattern under the text at offset `i`; pattern character `j` ends up under text character `i + j`:

![Pattern ABABCABAB at offset i = 0](docs/images/en/intro_align_i0.png)

## 3. Two indices: `i` (alignment) and `j` (position in the pattern)

The method's work is described by **two** indices:

- the outer **`i`** — the **offset** of the pattern's alignment along the text (the outer `for` loop — "which alignment");
- the inner **`j`** — the **position** inside the pattern (the inner `while j < M` loop — "the character-by-character comparison at this alignment").

At each alignment `i` the inner loop runs `j = 0, 1, 2, …` and compares `main_string[i + j]` with `pattern[j]` while the characters match. On a mismatch — `break`, and the outer loop shifts the pattern (`i + 1`), restarting the comparison from `j = 0`.

## 4. Base implementation

Here is the base implementation — the one we walk through line by line:

```python
def naive_search(main_string, pattern):
    M = len(pattern)
    N = len(main_string)

    # Iterate over the characters of the main string
    for i in range(N - M + 1):
        j = 0

        # Iterate over the characters of the pattern
        while j < M:
            if main_string[i + j] != pattern[j]:
                break
            j += 1

        # If j equals the pattern length, the substring is found
        if j == M:
            return i

    return -1

main_string = "ABABDABACDABABCABAB"
pattern = "ABABCABAB"
position = naive_search(main_string, pattern)

if position != -1:
    print(f"Substring found at position {position}")
else:
    print("Substring not found in the main string.")
```

What is what:

- `for i in range(N - M + 1)` — the **outer loop**: iterate over all alignment offsets `0, 1, …, N-M` (beyond that the pattern no longer fits the text);
- `while j < M` — the **inner loop**: compare the pattern character by character, left to right;
- `if main_string[i + j] != pattern[j]: break` — a **mismatch**: the characters differ → stop the comparison and shift the pattern by 1;
- `j += 1` — a **character match**: move on to the next pattern character;
- `if j == M: return i` — a **full match**: all `M` characters matched → return the offset `i`;
- `return -1` — no alignment matched, the pattern is **absent** from the text.

The teaching version `naive_search_steps` repeats this code **step for step** but, after each comparison, records a state snapshot and the counters (comparisons, alignments, shifts) — all the pictures below are assembled from those snapshots.

Running the driver prints exactly:

```text
Substring found at position 10
```

## 5. How to read the frames

- the top row is the **text** (all `N` characters), the bottom one is the **pattern**, shifted by the offset `i`;
- 🟢 **green cell** — a pattern character that **matched** a text character;
- 🔴 **red cell** — the **mismatching** character (this is where the pattern breaks and shifts by 1);
- 🔵 **blue cell** — a character in the current **window** that has not been compared **yet**;
- ⬜ **neutral / 🩶 dimmed** — a text character outside the window (ahead / already passed);
- 🟠 **amber cell** — a character compared **again** after a shift (wasted work);
- at the top — the **"looking for pattern: …"** badge, below the frame — the **verdict** and the **counters** (comparisons · alignments · shifts).

## 6. Trace: alignment by alignment

We search for `ABABCABAB` in `ABABDABACDABABCABAB` (`N = 19`, `M = 9`). The first alignment `i = 0` gives a **partial match**: the prefix `ABAB` matches (four greens), but at `j = 4` there is a mismatch — `D ≠ C`:

![Alignment i = 0: ABAB matched, then D ≠ C](docs/images/en/intro_mismatch_i0.png)

Mismatch → shift the pattern by 1 (`i = 1`) and restart the comparison from `j = 0`. So it goes, alignment by alignment. The first five comparisons at `i = 0` in detail:

| `j` | `text[i+j]` | `pattern[j]` | result |
|---|---|---|---|
| 0 | `A` (text[0]) | `A` | match → `j += 1` |
| 1 | `B` (text[1]) | `B` | match → `j += 1` |
| 2 | `A` (text[2]) | `A` | match → `j += 1` |
| 3 | `B` (text[3]) | `B` | match → `j += 1` |
| 4 | `D` (text[4]) | `C` | **mismatch** → `break`, shift |

A summary across all 11 alignments — you can see how many comparisons each one "eats":

```text
Per-alignment summary (i → result, comparisons in parentheses):
  i= 0: matched 4, mismatch at j=4 (D≠C) → shift  (5)
  i= 1: matched 0, mismatch at j=0 (B≠A) → shift  (1)
  i= 2: matched 2, mismatch at j=2 (D≠A) → shift  (3)
  i= 3: matched 0, mismatch at j=0 (B≠A) → shift  (1)
  i= 4: matched 0, mismatch at j=0 (D≠A) → shift  (1)
  i= 5: matched 3, mismatch at j=3 (C≠B) → shift  (4)
  i= 6: matched 0, mismatch at j=0 (B≠A) → shift  (1)
  i= 7: matched 1, mismatch at j=1 (C≠B) → shift  (2)
  i= 8: matched 0, mismatch at j=0 (C≠A) → shift  (1)
  i= 9: matched 0, mismatch at j=0 (D≠A) → shift  (1)
  i=10: full pattern match → position 10  (9)
```

Note alignments `i = 0`, `i = 2`, `i = 5`, `i = 7` — there the pattern matches **partially** (the repeated prefix `ABAB`), and those are exactly where the naive method wastes the most work, yet still shifts by only 1. All the alignments sliding right by 1 per row are visible at once — this is the "ladder" of sliding:

![The sliding ladder: all alignments one under another](docs/images/en/intro_evolution.png)

## 7. The alignment grid: a bird's-eye view

If we look at all the work from a bird's-eye view — a matrix whose rows are the alignments `i = 0..N-M` and whose columns are the text positions `0..N-1`. Each cell is colored: 🟢 match, 🔴 mismatch, 🔵 inside the window but not compared (broke earlier). You can see that the same text column is compared at **several** alignments — that is the redundant work:

![Alignment grid: all the work of naive search](docs/images/en/intro_grid.png)

A total of **29** character comparisons — and that with only **19** text positions. The naive method keeps returning to already-seen characters again and again.

## 8. Result

At alignment `i = 10` all nine pattern characters match — a full match, return `10`:

![Full match at position 10](docs/images/en/intro_match.png)

The console summary:

```text
Text:    ABABDABACDABABCABAB
Pattern: ABABCABAB
Result: found at position 10   ·   comparisons: 29

Substring found at position 10
```

## 9. Wasted work: re-comparisons and the bridge to KMP

This is the **heart of the lesson**. Look at alignment `i = 0`: the pattern matched the prefix `ABAB` (text positions 0–3) and then stumbled on `D ≠ C`. What does the naive method do? It throws away that **whole** partial match and shifts the pattern by only **one** position — to `i = 1`. And now text characters `1, 2, 3` are compared **again** (amber), even though it saw them a moment ago:

![Wasted work: re-comparisons after a shift](docs/images/en/wasted_work.png)

This very redundancy is what makes the naive method slow on "structured" texts. Smarter algorithms (KMP, Boyer–Moore) use the information about the already-checked prefix so as **not** to compare these characters twice — and shift by several positions at once. The naive method cannot do this: it starts each alignment "from a blank slate".

## 10. (In)efficiency: the "not found" case

When the pattern is absent from the text, the naive method honestly tries **all** alignments to the end and returns `-1` (the `else` branch prints the corresponding line). Text `ABABABABAB`, pattern `ABABB` — the repeated prefix `ABAB` produces a partial match at every other alignment, all in vain:

![Alignment grid for the "not found" case](docs/images/en/not_found_grid.png)

```text
The «not found» case: text «ABABABABAB», pattern «ABABB»
Substring not found in the main string.
  → comparisons: 18, alignments: 6, shifts: 6
```

## 11. The worst case and complexity

How many comparisons does the naive method make? In the **best** case (a mismatch on the very first character of each alignment) — about `N-M+1` (one comparison per alignment). In the **worst** — a pathological counterexample: text `AAAAAAAAAA`, pattern `AAAAB`. At **every** alignment the whole prefix `AAAA` matches (four greens), and only the last character `B` gives a mismatch — that is nearly `M` comparisons at each of `N-M+1` alignments:

![Worst case AAAAAAAAAA / AAAAB: an explosion of comparisons](docs/images/en/worst_case.png)

```text
Worst case: text «AAAAAAAAAA», pattern «AAAAB»
  → comparisons: 30 = (N-M+1)·M = 6·5  (nearly m comparisons per alignment)
Best case (a mismatch on the first character every time): ≈ N-M+1 = 11
```

Hence the complexity of naive search is $O(n \cdot m)$ (where $n$ is the text length and $m$ is the pattern length). When the pattern length $m$ approaches the text length $n$, this degenerates into $O(n^2)$ — inefficient for long strings:

![Complexity curves: n / n·m / n²](docs/images/en/complexity.png)

## 12. Variants: all occurrences with `naive_search_all`

The base `naive_search` returns the **first** occurrence and stops immediately. If you need **all** occurrences (including overlapping ones), you have to keep sliding to the end of the text — that is what `naive_search_all` does. In `ABABAB` the pattern `AB` occurs three times:

![All occurrences of AB: positions 0, 2, 4](docs/images/en/all_matches.png)

```text
Multiple occurrences: naive_search returns the FIRST, naive_search_all — all
  text «ABABAB», pattern «AB»
  first occurrence (naive_search): position 0
  all occurrences (naive_search_all): [0, 2, 4]
```

## 13. The Pythonic variant via slices

The same idea can be written idiomatically — via Python **slices**: instead of the manual inner loop we take a text slice the length of the pattern and compare it with the pattern using a single `==` operator:

```python
def naive_search_slices(main_string, pattern):
    M = len(pattern)
    N = len(main_string)
    for i in range(N - M + 1):
        if main_string[i:i + M] == pattern:
            return i
    return -1
```

This is the **same** set of offsets `i` and the **same** result as the base version — only the character-by-character comparison is hidden inside the string `==` operator (Python does it for you). To count the "cost" (character comparisons), use `count_comparisons` on the base version — on the canonical example it is **29**.

## 14. Search in motion: animations

The pattern slides along the text — comparison by comparison; on a mismatch a shift by 1 and a restart from `j = 0`, on a full match — green and stop. Three telling clips:

▶️ **The canonical example** — found at position 10 (with partial matches along the way):

![Animation: the canonical example](docs/images/en/search_canonical.gif)

▶️ **The worst case** `AAAAAAAAAA` / `AAAAB` — nearly `m` comparisons before failure at every alignment:

![Animation: the worst case](docs/images/en/search_worst.gif)

▶️ **The pattern is absent** — slide to the end of the text and return `-1`:

![Animation: pattern not found](docs/images/en/search_not_found.gif)

## 15. Stepping through the code: code ↔ data panels

The examples above showed the *result* of each step. Here is the **code itself in action**: on the left, a fragment of the algorithm with **highlighted active lines**; on the right, the "text ↔ pattern" alignment at that very moment. **The line color encodes what is happening:** 🟡 a line running now (the loop / the `main_string[i+j] != pattern[j]` check / `j += 1`), 🟢 `j == M` → `return i` (found), 🔴 a mismatch (`break`, shift) or exhaustion (`return -1`).

We build this for the canonical example. Each grid row is one alignment (its verdict):

![Code ↔ data: one row per alignment](docs/images/en/code_grid.png)

▶️ The animated version — with all the intermediate frames (alignment, every character comparison, shift):

![Animation: code ↔ data](docs/images/en/code_walk.gif)

## 16. Full step-by-step trace of the canonical example

Below is the same execution **in full**: each alignment as a separate "code ↔ data" frame, in the right order, with a detailed explanation under each (and in the explanation — all the character comparisons: `i`, `j`, characters, the decision, the counter). The cell colors are the same as in the legend above. The block is generated automatically from the event journal.

#### Step 00

![Start: searching for pattern «ABABCABAB» in the text](docs/images/en/walkthrough/step_00.png)

The text `ABABDABACDABABCABAB` (length N = 19); we search for the pattern `ABABCABAB` (length M = 9). All cells are neutral — nothing has been compared yet. In the code, `def naive_search`, `M = len(pattern)` and `N = len(main_string)` are highlighted.

#### Step 01

![Mismatch at i = 0, j = 4](docs/images/en/walkthrough/step_01.png)

Alignment **i = 0**: 4 characters matched (`«ABAB»`), but at `j = 4` there is a mismatch: `main_string[4] = «D»` ≠ `«C» = pattern[4]`. `break`, shift the pattern by 1 — and some of the already-checked characters will have to be compared **again**. Comparisons so far: 5.

#### Step 02

![Mismatch at i = 1, j = 0](docs/images/en/walkthrough/step_02.png)

Alignment **i = 1**: we place the pattern at offset 1 and compare from `j = 0`. An immediate mismatch: `main_string[1] = «B»` ≠ `«A» = pattern[0]`. Not a single character matched → `break`, shift the pattern by 1. Comparisons so far: 6.

#### Step 03

![Mismatch at i = 2, j = 2](docs/images/en/walkthrough/step_03.png)

Alignment **i = 2**: 2 characters matched (`«AB»`), but at `j = 2` there is a mismatch: `main_string[4] = «D»` ≠ `«A» = pattern[2]`. `break`, shift the pattern by 1 — and some of the already-checked characters will have to be compared **again**. Comparisons so far: 9.

#### Step 04

![Mismatch at i = 3, j = 0](docs/images/en/walkthrough/step_04.png)

Alignment **i = 3**: we place the pattern at offset 3 and compare from `j = 0`. An immediate mismatch: `main_string[3] = «B»` ≠ `«A» = pattern[0]`. Not a single character matched → `break`, shift the pattern by 1. Comparisons so far: 10.

#### Step 05

![Mismatch at i = 4, j = 0](docs/images/en/walkthrough/step_05.png)

Alignment **i = 4**: we place the pattern at offset 4 and compare from `j = 0`. An immediate mismatch: `main_string[4] = «D»` ≠ `«A» = pattern[0]`. Not a single character matched → `break`, shift the pattern by 1. Comparisons so far: 11.

#### Step 06

![Mismatch at i = 5, j = 3](docs/images/en/walkthrough/step_06.png)

Alignment **i = 5**: 3 characters matched (`«ABA»`), but at `j = 3` there is a mismatch: `main_string[8] = «C»` ≠ `«B» = pattern[3]`. `break`, shift the pattern by 1 — and some of the already-checked characters will have to be compared **again**. Comparisons so far: 15.

#### Step 07

![Mismatch at i = 6, j = 0](docs/images/en/walkthrough/step_07.png)

Alignment **i = 6**: we place the pattern at offset 6 and compare from `j = 0`. An immediate mismatch: `main_string[6] = «B»` ≠ `«A» = pattern[0]`. Not a single character matched → `break`, shift the pattern by 1. Comparisons so far: 16.

#### Step 08

![Mismatch at i = 7, j = 1](docs/images/en/walkthrough/step_08.png)

Alignment **i = 7**: 1 characters matched (`«A»`), but at `j = 1` there is a mismatch: `main_string[8] = «C»` ≠ `«B» = pattern[1]`. `break`, shift the pattern by 1 — and some of the already-checked characters will have to be compared **again**. Comparisons so far: 18.

#### Step 09

![Mismatch at i = 8, j = 0](docs/images/en/walkthrough/step_09.png)

Alignment **i = 8**: we place the pattern at offset 8 and compare from `j = 0`. An immediate mismatch: `main_string[8] = «C»` ≠ `«A» = pattern[0]`. Not a single character matched → `break`, shift the pattern by 1. Comparisons so far: 19.

#### Step 10

![Mismatch at i = 9, j = 0](docs/images/en/walkthrough/step_10.png)

Alignment **i = 9**: we place the pattern at offset 9 and compare from `j = 0`. An immediate mismatch: `main_string[9] = «D»` ≠ `«A» = pattern[0]`. Not a single character matched → `break`, shift the pattern by 1. Comparisons so far: 20.

#### Step 11

![Full match at position 10](docs/images/en/walkthrough/step_11.png)

Alignment **i = 10**: all 9 pattern characters matched (`main_string[10:19] = «ABABCABAB»`), i.e. `j == M`. The condition `if j == M` is true → `return i` returns position **10** and the search stops. Total comparisons: 29.

#### Step 12

![Done: found at position 10](docs/images/en/walkthrough/step_12.png)

Result: the pattern `ABABCABAB` is found at position **10** in **29** character comparisons (with 11 alignments and 10 shifts). `return i` is highlighted.

## 17. Complexity and properties

How much work the naive search does depends on how well the pattern "partially matches" the text:

| Case | Comparisons | When it happens |
|---|---|---|
| **Best** | $O(n)$, $\approx n - m + 1$ | a mismatch on the first character of every alignment |
| **Typical** | $O(n \cdot m)$ | ordinary text |
| **Worst** | $O(n \cdot m)$, with $m \approx n$ → $O(n^2)$ | the pattern almost matches at every alignment (`AAAA…` / `AAA…B`) |

Other properties:

- **Does not modify the strings:** the method only *reads* characters; auxiliary memory is $O(1)$.
- **No preconditions:** works on any text — unlike binary search in arrays, here **nothing needs to be sorted** or ordered.
- **The metric is the number of character comparisons** (`main_string[i+j] == pattern[j]`); plus the alignment and shift counters.
- **First occurrence on duplicates:** `naive_search` returns the leftmost occurrence; `naive_search_all` returns all of them.
- **Case sensitivity:** `==` distinguishes `A` from `a` — the search is case-sensitive.

## 18. Limitations and edge cases

The main limitation is **wasted work**: the naive method does not remember already-checked characters and, after a partial match, shifts by only 1, comparing them again. For **long**, structured texts this is expensive. Honestly about the edge cases (the method handles them correctly):

| Edge case | Behavior |
|---|---|
| **Empty pattern** (`M = 0`) | `range(N+1)`, the inner `while` does not run, `j == M == 0` immediately → returns `0` |
| **Pattern longer than the text** (`M > N`) | `N - M + 1 ≤ 0` → the `range` is empty → `-1` right away |
| **Pattern == text** | a full match at `i = 0` → `0` |
| **Single-character pattern** | a plain single-character search |
| **Different case** | `A` ≠ `a` → the search will not confuse them |

## 19. Where it fits

Despite its worst-case inefficiency, the naive method is perfectly fine where its simplicity pays off:

- **Short texts** or **rare matches** — few alignments, the difference from KMP is unnoticeable.
- **A basic "Find"** in text editors and input fields — searching for a word in a small document.
- **Any alphabet without preprocessing** — text, DNA, binary data: nothing needs to be indexed or sorted.
- **Simplicity and transparency** — a correctness reference against which the more complex algorithms are checked.

## 20. Place in the series: the first step into string search

This is the **first string algorithm** in the series — it **opens the string-search subseries**. Before it came sorting and search algorithms over **arrays** of numbers; now the problem domain is **strings of characters**. The link is direct: naive search for strings is the same thing as **linear search** for arrays (brute force, zero preprocessing):

| Topic | Repository |
|---|---|
| Linear search (arrays) | [algo-linear-search](https://github.com/MarynaShavlak/algo-linear-search) |
| Binary search (arrays) | [algo-binary-search](https://github.com/MarynaShavlak/algo-binary-search) |
| Interpolation search (arrays) | [algo-interpolation-search](https://github.com/MarynaShavlak/algo-interpolation-search) |
| Indexed sequential search (arrays) | [algo-indexed-sequential-search](https://github.com/MarynaShavlak/algo-indexed-sequential-search) |
| Bubble sort | [algo-bubble-sort](https://github.com/MarynaShavlak/algo-bubble-sort) |
| Insertion sort | [algo-insertion-sort](https://github.com/MarynaShavlak/algo-insertion-sort) |
| Selection sort | [algo-selection-sort](https://github.com/MarynaShavlak/algo-selection-sort) |
| Quick sort | [algo-quick-sort](https://github.com/MarynaShavlak/algo-quick-sort) |
| Merge sort | [algo-merge-sort](https://github.com/MarynaShavlak/algo-merge-sort) |
| Shell sort | [algo-shell-sort](https://github.com/MarynaShavlak/algo-shell-sort) |
| Radix sort | [algo-radix-sort](https://github.com/MarynaShavlak/algo-radix-sort) |

**Where to next.** The naive method wastes work on re-comparisons — and that is exactly what the smarter successors remove:

| Algorithm | Time | Idea |
|---|---|---|
| **Naive search** | $O(n \cdot m)$ | slides the pattern, shifts by 1 on a mismatch, re-comparisons |
| **Knuth–Morris–Pratt (KMP)** | $O(n + m)$ | the prefix function: on a mismatch shifts the pattern by several positions at once without re-comparing the checked characters |
| **Boyer–Moore** | $O(n / m)$ at best | compares from the end of the pattern; the "bad character" and "good suffix" heuristics give big jumps |
| **Rabin–Karp** | $O(n + m)$ on average | a rolling hash of the window: compares hashes first, and characters only when the hashes match |

## 21. Summary

- **Naive search** slides the pattern along the text and, at each alignment, compares characters left to right; on a mismatch it shifts the pattern by 1 and restarts from `j = 0`; on a full match it returns the position, otherwise `-1`.
- **Two indices:** the outer `i` — the alignment offset (the outer `for`), the inner `j` — the position in the pattern (the inner `while`).
- **A new problem domain — strings:** the data is a text + a pattern (sequences of characters), the operation is character-by-character equality `==`; nothing is sorted and there are no preconditions.
- **Wasted work is the defining trait:** after a partial match and a mismatch the method throws everything away and shifts by only 1, **re-comparing** already-checked characters. This is exactly what KMP/Boyer–Moore remove.
- **Complexity:** $O(n \cdot m)$, in the worst case ($m \approx n$) — $O(n^2)$; at best — $\approx n - m + 1$. On the canonical example the search costs **29** comparisons (a match at position 10), and the pathological `AAAAAAAAAA` / `AAAAB` — exactly $(N-M+1)\cdot M = 30$.
- **Good enough** for short texts and rare matches; for long strings it loses to KMP, Boyer–Moore, Rabin–Karp.
- This is the **first string algorithm** in the series — a direct analogue of linear search for arrays that opens the string-search subseries.

