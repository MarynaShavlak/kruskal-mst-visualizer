# Knuth–Morris–Pratt (KMP) algorithm: a step-by-step walkthrough

**The Knuth–Morris–Pratt (KMP) algorithm** is an efficient substring-search algorithm that runs in **linear time** $O(n+m)$. It solves the same problem as the [naive search](https://github.com/MarynaShavlak/algo-naive-string-search): find at which position a **pattern** occurs inside the **main string** (the text). But it does so more cleverly.

After a mismatch the naive method shifts the pattern by **one** position and **re-compares** characters it has already checked (the text index may even "roll back"). KMP avoids this: it first analyses the pattern **once** and builds a **prefix function** — the `lps` table (*longest prefix suffix*) — which, on every mismatch, tells how far to "roll back" the pattern index `j` **without touching the text**. As a result the text index `i` **never decreases**.

The algorithm has **two phases**:

1. **Preprocessing** — `compute_lps(pattern)` builds the `lps` table from the pattern alone in $O(m)$, never looking at the text. This is a brand-new hero of the walkthrough, absent in the naive method.
2. **Search** — `kmp_search(text, pattern)` makes **one pass** over the text in $O(n)$, using `lps` for smart pattern jumps.

## 1. Intuition: why re-comparisons are wasteful

Suppose we search for the pattern `ABABCABAB` in a text and have already matched the **prefix** `ABAB`, and then the next character mismatches. The naive method would shift the pattern by one position and restart the comparison **from scratch**, re-comparing characters it has already seen. That is wasted work.

KMP notices the key fact: we already **know** the matched chunk of text — it is the start of the pattern, `ABAB`. Does `ABAB` have a proper **prefix that is also its suffix**? Yes: `AB` (at the start) equals `AB` (at the end). So instead of restarting, we can shift the pattern so that this `AB`-prefix lands on its `AB`-suffix and keep comparing onward — **without re-reading the text**.

![The KMP idea: don't re-read the already-matched prefix](docs/images/en/intuition.png)

To make such jumps instant, KMP precomputes the **`lps` table** for the pattern — for each position it stores the length of the longest prefix-suffix. That is the preprocessing.

## 2. The two phases of KMP

| Phase | Function | What it does | Complexity |
|---|---|---|---|
| **1. Preprocessing** | `compute_lps(pattern)` | builds the `lps` table from the pattern alone (no text needed) | $O(m)$ |
| **2. Search** | `kmp_search(text, pattern)` | one pass over the text using `lps` | $O(n)$ |

Together that is $O(n+m)$, linear. Below we take each phase separately.

## 3. Phase 1 — the prefix function (the `lps` table)

### What `lps` is: prefix = suffix

`lps[i]` is the length of the longest **proper** prefix of the segment `pattern[0..i]` that is **also its suffix** (proper means not equal to the whole segment). The table tells how far to "roll back" the pattern index `j` on a mismatch during the search, so we never go back to the start of the pattern.

### The `compute_lps` code

Here is the base implementation — the very one we walk through line by line (the fully documented version is in [`knuth_morris_pratt_search/core.py`](knuth_morris_pratt_search/core.py)):

```python
def compute_lps(pattern):
    lps = [0] * len(pattern)
    length = 0
    i = 1
    while i < len(pattern):
        if pattern[i] == pattern[length]:
            length += 1
            lps[i] = length
            i += 1
        else:
            if length != 0:
                length = lps[length - 1]
            else:
                lps[i] = 0
                i += 1
    return lps
```

The build algorithm:

1. Initialise the longest-prefix length to `0` (`length = 0`). Start iterating from index `1` (because `lps[0] = 0` always: a single character has no proper prefix-suffix).
2. Compare the character at the current position `i` with the character at position `length`.
3. If they **match** — increment `length` by 1 and set `lps[i] = length`.
4. If they **mismatch** and `length != 0` — set `length = lps[length - 1]` (roll back and check again, **without advancing `i`** — this is what avoids redundant checks).
5. If `length == 0` — there is no proper prefix-suffix: set `lps[i] = 0` and move on to the next index.

### The `lps` table for `ABAB`

Consider the pattern `ABAB`. The table is printed by [`examples/01_lps.py`](examples/01_lps.py):

```text
Pattern «ABAB»: lps = [0, 0, 1, 2]
Index :  0   1   2   3
Symbol:  A   B   A   B
lps   :  0   0   1   2
```

![lps table for ABAB: prefix = suffix](docs/images/en/lps_table_ABAB.png)

Explanation of each position:
- **index 0** (`A`): the longest prefix that is also a suffix is `A` itself, but it equals the whole segment, so `lps[0] = 0`;
- **index 1** (`AB`): `B` gives no prefix that is also a suffix, so `lps[1] = 0`;
- **index 2** (`ABA`): here `A` is **both a prefix and a suffix**, so `lps[2] = 1`;
- **index 3** (`ABAB`): `AB` is **both a prefix and a suffix**, so `lps[3] = 2`.

### Step-by-step build of `AABAA` and the fall-back step

Let us cement the idea on the pattern `AABAA` — it shows the most interesting step: the **fall-back** `length = lps[length-1]`. The full trace is printed by [`examples/01_lps.py`](examples/01_lps.py):

```text
Pattern «AABAA»: lps = [0, 1, 0, 1, 2]
Index :  0   1   2   3   4
Symbol:  A   A   B   A   A
lps   :  0   1   0   1   2

Step-by-step construction of the lps table for «AABAA»
  i=1: match «A» → length=1, lps[1]=1
  i=2: mismatch, fall back length = lps[0] = 0
  i=2: mismatch with length=0 → lps[2]=0
  i=3: match «A» → length=1, lps[3]=1
  i=4: match «A» → length=2, lps[4]=2
```

The key moment is **index 2**. The character `B` did not match `pattern[length]` (where `length = 1`, i.e. `A`). Since `length != 0`, we do not immediately write `0`; instead we first **fall back** `length = lps[length-1] = lps[0] = 0` and check again — **without advancing `i`**. Now `length = 0`, and only then do we write `lps[2] = 0`. This very fall-back is what later lets us "cut corners" in the search phase.

Build frames (blue is the matched **prefix**, purple is the **suffix**, with the `length` and `i` pointers):

![Step i=1: match A, length=1](docs/images/en/lps_build_AABAA_01.png)
![Step i=2: mismatch, fall back length = lps\[0] = 0](docs/images/en/lps_build_AABAA_02.png)
![Step i=4: match A, length=2, lps\[4]=2](docs/images/en/lps_build_AABAA_05.png)

### More table examples

| Pattern | `lps` | Notable for |
|---|---|---|
| `ABAB` | `[0, 0, 1, 2]` | the example |
| `AABAA` | `[0, 1, 0, 1, 2]` | showcase of the fall-back step |
| `ABABCABAB` | `[0, 0, 1, 2, 0, 1, 2, 3, 4]` | the naive-example pattern |
| `AAAAB` | `[0, 1, 2, 3, 0]` | the pathological pattern |

![lps table for ABABCABAB](docs/images/en/lps_table_ABABCABAB.png)
![lps table for AAAAB](docs/images/en/lps_table_AAAAB.png)

▶️ Building `lps` in motion (`length` moves, and jumps back on a mismatch):

![Animation: building the lps table](docs/images/en/lps_build.gif)

## 4. Phase 2 — search

### The `kmp_search` code

```python
def kmp_search(main_string, pattern):
    M = len(pattern)
    N = len(main_string)
    lps = compute_lps(pattern)
    i = j = 0
    while i < N:
        if pattern[j] == main_string[i]:
            i += 1
            j += 1
        elif j != 0:
            j = lps[j - 1]
        else:
            i += 1
        if j == M:
            return i - j
    return -1  # if the substring is not found
```

The search logic: compare `pattern[j]` and `main_string[i]`:
- **match** → advance both indices (`i += 1`, `j += 1`);
- **mismatch** and `j != 0` → roll back **only the pattern** (`j = lps[j - 1]`), keeping the text index `i` **in place** — this is a forward jump of the pattern by `j - lps[j-1]` positions;
- **mismatch** and `j == 0` → advance `i` (compare the pattern from the start);
- when `j == M` — all pattern characters matched; return the start position `i - j`;
- if the pass finishes — return `-1`.

### The example: searching for «алг» → 4

Let us reproduce the main example. The pattern and the text are **data** (they stay in Cyrillic in both languages):

```python
raw = "Цей алгоритм часто використовується в текстових редакторах та системах пошуку для ефективного знаходження підрядка в тексті."
pattern = "алг"
print(kmp_search(raw, pattern))
```

The driver prints exactly:

```text
4
```

The substring «алг» starts at position 4: `Ц`(0), `е`(1), `й`(2), `␣`(3), `а`(4), `л`(5), `г`(6). The full trace is printed by [`examples/02_search.py`](examples/02_search.py):

```text
  i  | j  | text | pat | verdict
  ------------------------------
   0 |  0 |   Ц  |  а  | advance i (j=0)
   1 |  0 |   е  |  а  | advance i (j=0)
   2 |  0 |   й  |  а  | advance i (j=0)
   3 |  0 |   ␣  |  а  | advance i (j=0)
   4 |  0 |   а  |  а  | match (i+1, j+1)
   5 |  1 |   л  |  л  | match (i+1, j+1)
   6 |  2 |   г  |  г  | match (i+1, j+1)
```

![Searching for «алг»: full match at position 4](docs/images/en/search_konspekt_match.png)

(The pattern «алг» consists of distinct characters, so its `lps = [0, 0, 0]` — there are no jumps here, only simple advances of `i`. Richer jump examples follow below.)

### `i` never rolls back: the jump by `lps`

Here is where KMP shines. Take the canonical example from the naive walkthrough: search for `ABABCABAB` in `ABABDABACDABABCABAB`. Having matched the prefix `ABAB`, at the character `D` (position 4) a mismatch occurs. The naive method would shift by 1 and restart from scratch. KMP instead does `j = lps[3] = 2`: the pattern **jumps forward by 2**, the already-matched green "border" `AB` lands on its suffix, and the text index `i` **stays put** (no character is re-read):

![Pattern jump: i stays put, the green border is preserved](docs/images/en/i_monotonic.png)

That is why the text index `i` in KMP **grows monotonically**, whereas in the naive method the comparison position `i+j` "rolls back" after every mismatch (the "saw" in the chart above).

▶️ The example search in motion (windowed — the search reads only the beginning of the text):

![Animation: searching for «алг»](docs/images/en/search_konspekt.gif)

## 5. KMP vs the naive method

### Number of comparisons

Let us compare the number of character comparisons on the same inputs (printed by [`examples/03_vs_naive.py`](examples/03_vs_naive.py)):

```text
Input: text «ABABDABACDABABCABAB», pattern «ABABCABAB»
  naive: 29 comparisons
  KMP: 32 comparisons (lps 9 + search 23)
  KMP's search reads fewer text characters: 23 vs 29 (and 0 re-reads)
```

Honestly: on such a **short** input KMP makes slightly **more** comparisons in total (32 vs 29) — because the prefix function costs 9 comparisons. That is a **one-time** preprocessing price. But the **search** itself reads fewer text characters (23 vs 29) and — crucially — re-reads none.

The real difference shows up on the **pathological** case, where the naive method blows up:

```text
Scaling of the pathological case (text «AAAA…», pattern «AAA…B», m ≈ n/2):
  n=16: naive 72 comparisons, KMP 38 — naive does 1.9× more
  n=32: naive 272 comparisons, KMP 78 — naive does 3.5× more
  n=64: naive 1056 comparisons, KMP 158 — naive does 6.7× more
  n=128: naive 4160 comparisons, KMP 318 — naive does 13.1× more
  n=256: naive 16512 comparisons, KMP 638 — naive does 25.9× more
```

The naive method grows **quadratically** (four-fold per doubling of `n`), KMP grows **linearly** (two-fold). The gap widens without bound.

![Naive vs KMP: the worst case](docs/images/en/vs_naive_worst.png)

### Complexity: `O(n+m)` vs `O(n·m)`

| Method | Time (worst) | Text re-reads | Preprocessing |
|---|---|---|---|
| **Naive** | $O(n \cdot m)$ → $O(n^2)$ when $m \approx n$ | yes (the index "rolls back") | none |
| **KMP** | $O(n + m)$ (linear) | **never** (the index `i` only grows) | `lps` in $O(m)$ |

![Chart: O(n+m) vs O(n·m)/O(n²)](docs/images/en/complexity.png)

KMP's linearity is achieved precisely thanks to the prefix function, which avoids redundant comparisons in the main string.

## 6. Step-by-step code execution: code ↔ data panels

The examples above showed the *result* of each step. Here is **the code in action**: on the left a fragment of the algorithm with **highlighted active lines**, on the right the data at that very moment. **The line colour encodes the branch:** 🟡 active line, 🟢 match / found, 🔴 mismatch / fall-back, 🔵 index advance. Two phases — two panels; generated by [`examples/05_code_walkthrough.py`](examples/05_code_walkthrough.py).

**Phase 1 — building `lps` for `ABABCABAB`** (on the right, the table fills in; the fall-back step is visible):

![Code ↔ lps table](docs/images/en/code_lps_grid.png)

**Phase 2 — searching for `ABABCABAB` in `ABABDABACDABABCABAB`** (on the right, the text ↔ pattern alignment with jumps by `lps`):

![Code ↔ alignment](docs/images/en/code_search_grid.png)

## 7. Full step-by-step trace of the example

Below is the same execution, but **fully** and in two phases: first the build of the `lps` table for the pattern «алг», then the search itself in the example text. Each step is a separate code ↔ data frame with a detailed explanation under it. The colours are the same as in the [legend above](#code-walkthrough). The block is generated automatically from the event journals (by [`examples/06_full_walkthrough.py`](examples/06_full_walkthrough.py)).

### Phase 1 — preprocessing: the `lps` table of pattern «алг»

#### Step L00

![Start: lps\[0] = 0 (a single char has no proper prefix-suffix)](docs/images/en/walkthrough/lps_00.png)

Phase 1 — **preprocessing**. We build the `lps` table of the pattern «алг» (length 3) from the pattern alone, without touching the text. By definition `lps[0] = 0`: a single character has no proper prefix that is also a suffix. We start with `length = 0`, `i = 1`.

#### Step L01

![Step i = 1, length = 0](docs/images/en/walkthrough/lps_01.png)

Step `i = 1`, `length = 0`. `pattern[1] = «л»` ≠ `pattern[0] = «а»`, and `length = 0` — there is no proper prefix-suffix. We set `lps[1] = 0` and move on to the next index.

#### Step L02

![Step i = 2, length = 0](docs/images/en/walkthrough/lps_02.png)

Step `i = 2`, `length = 0`. `pattern[2] = «г»` ≠ `pattern[0] = «а»`, and `length = 0` — there is no proper prefix-suffix. We set `lps[2] = 0` and move on to the next index.

#### Step L03

![Done: lps = \[0, 0, 0]](docs/images/en/walkthrough/lps_03.png)

The `lps` table is built: `[0, 0, 0]` — in 2 character comparisons. For «алг» it is trivial (all characters differ), yet it is exactly what drives the jumps in the search phase.

### Phase 2 — searching for «алг» in the example text

#### Step S00

![Start: searching for «алг» in the text](docs/images/en/walkthrough/search_00.png)

Phase 2 — **search**. We look for «алг» in the text (table `lps = [0, 0, 0]`). We start with `i = 0`, `j = 0`. The key invariant: the text cursor `i` will only move **forward**. (The text is long — we show its beginning.)

#### Step S01

![Comparison at i = 0, j = 0](docs/images/en/walkthrough/search_01.png)

`i = 0`, `j = 0`. `main_string[0] = «Ц»` ≠ `pattern[0] = «а»`, and `j = 0` — we simply advance `i = 1` and compare from the start of the pattern. (Here KMP behaves like the naive method — but `i` still only grows.)

#### Step S02

![Comparison at i = 1, j = 0](docs/images/en/walkthrough/search_02.png)

`i = 1`, `j = 0`. `main_string[1] = «е»` ≠ `pattern[0] = «а»`, and `j = 0` — we simply advance `i = 2` and compare from the start of the pattern. (Here KMP behaves like the naive method — but `i` still only grows.)

#### Step S03

![Comparison at i = 2, j = 0](docs/images/en/walkthrough/search_03.png)

`i = 2`, `j = 0`. `main_string[2] = «й»` ≠ `pattern[0] = «а»`, and `j = 0` — we simply advance `i = 3` and compare from the start of the pattern. (Here KMP behaves like the naive method — but `i` still only grows.)

#### Step S04

![Comparison at i = 3, j = 0](docs/images/en/walkthrough/search_04.png)

`i = 3`, `j = 0`. `main_string[3] = «␣»` ≠ `pattern[0] = «а»`, and `j = 0` — we simply advance `i = 4` and compare from the start of the pattern. (Here KMP behaves like the naive method — but `i` still only grows.)

#### Step S05

![Comparison at i = 4, j = 0](docs/images/en/walkthrough/search_05.png)

`i = 4`, `j = 0`. `main_string[4] = «а»` = `pattern[0] = «а»` — a **match**: we advance both indices (`i = 5`, `j = 1`). The green «border» of the already-matched prefix grows.

#### Step S06

![Comparison at i = 5, j = 1](docs/images/en/walkthrough/search_06.png)

`i = 5`, `j = 1`. `main_string[5] = «л»` = `pattern[1] = «л»` — a **match**: we advance both indices (`i = 6`, `j = 2`). The green «border» of the already-matched prefix grows.

#### Step S07

![Comparison at i = 6, j = 2](docs/images/en/walkthrough/search_07.png)

`i = 6`, `j = 2`. `main_string[6] = «г»` = `pattern[2] = «г»` — a **match**: we advance both indices (`i = 7`, `j = 3`). The green «border» of the already-matched prefix grows.

#### Step S08

![Full match: pattern found at position 4](docs/images/en/walkthrough/search_08.png)

`j` reached `M = 3` — all pattern characters matched. We return the start position `i - j = 4`. Summary: 7 comparisons, and the index `i` **never rolled back** — that is exactly KMP's edge over the naive method.

## 8. Properties and edge cases

- **Complexity:** $O(n+m)$ time (preprocessing $O(m)$ + search $O(n)$), $O(m)$ extra memory for the `lps` table.
- **The text index `i` never decreases** — the defining advantage over the naive method: no text character is re-read.
- **Preprocessing does not depend on the text:** the same `lps` table can be built once and used to search the pattern in many texts.

Edge cases (verified in [`tests/`](tests)):

| Case | Behaviour |
|---|---|
| pattern **equals** the text | position `0` |
| pattern **longer** than the text | `-1` (`j` never reaches `M`) |
| **single-character** pattern | ordinary search |
| **empty** pattern | the verbatim `kmp_search` raises `IndexError` (because of `pattern[0]` on an empty pattern)! Safe handling (`0`) is provided by `kmp_search_all` and `kmp_search_steps` |
| **multiple** occurrences | `kmp_search` returns the first; `kmp_search_all` returns all (including overlapping ones) |

> **About the empty pattern.** The code is kept **verbatim** on purpose, so on an empty pattern `pattern[j]` (i.e. `pattern[0]`) immediately raises `IndexError`. This is an honest limit of the verbatim implementation; the instrumented versions handle it safely.

## 9. Place in the series of string algorithms

KMP is the **second** string algorithm in the series and the **direct successor** of the [naive search](https://github.com/MarynaShavlak/algo-naive-string-search): it removes the naive method's main flaw — re-comparing characters that have already been matched. Other algorithms develop the idea further:

| Algorithm | Time (worst) | Preprocessing | Idea |
|---|---|---|---|
| [**Naive**](https://github.com/MarynaShavlak/algo-naive-string-search) | $O(n \cdot m)$ | none | shift by 1, compare from scratch |
| **KMP** (this walkthrough) | $O(n + m)$ | `lps` in $O(m)$ | jump by the prefix function, `i` never rolls back |
| Boyer–Moore | $O(n \cdot m)$, but fast in practice | tables in $O(m + \sigma)$ | compare **from the end**, big jumps by the "bad character" |
| Rabin–Karp | $O(n + m)$ on average | hashing | a rolling **hash** instead of char-by-char comparison |

**KMP's niche**: text editors and search systems — for efficiently finding a substring in text, especially when guaranteed linearity matters.

## 10. Summary

- **KMP** finds a substring in **linear time** $O(n+m)$ thanks to the **prefix function** — the `lps` table built from the pattern itself.
- `lps[i]` is the length of the longest proper **prefix** that is a **suffix** of the segment `pattern[0..i]`. Reference values: `ABAB → [0,0,1,2]`, `AABAA → [0,1,0,1,2]`.
- **Two phases:** the preprocessing `compute_lps` ($O(m)$, never touches the text) and the search `kmp_search` ($O(n)$, one pass).
- On a mismatch KMP does `j = lps[j-1]` — a **forward jump of the pattern** without re-reading the text; the text index `i` **never rolls back** (unlike the naive method).
- Against the naive $O(n\cdot m)$/$O(n^2)$ on pathological inputs KMP stays linear; on the same inputs it makes **substantially fewer** character comparisons in the text.
- The example `print(kmp_search(raw, "алг"))` prints **4**.

