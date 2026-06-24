# Boyer-Moore algorithm (bad-character table): a step-by-step walkthrough

The **Boyer-Moore algorithm** is a substring-search algorithm optimized for scanning the text **right-to-left**. It solves the same problem as [naive search](https://github.com/MarynaShavlak/algo-naive-string-search) and [KMP](https://github.com/MarynaShavlak/algo-knuth-morris-pratt-search): find the position from which a **pattern** occurs in a **text**. But it does it differently — and often faster than all of them.

Two defining new features of this walkthrough:

1. **Right-to-left comparison.** The inner loop starts at the **last** character of the pattern and moves toward the start. The matched **suffix** grows until a mismatch occurs.
2. **The bad-character table (shift table).** Preprocessing builds a «symbol → shift» dictionary: when a text symbol does not match, the pattern **leaps** forward — by its whole length if that symbol is absent from the pattern. The **rarer** the pattern's symbols are in the text, the **bigger** the jumps and the more **skipped** (never compared) text symbols there are.

> 💡 This walkthrough deliberately covers **only one** component — the bad-character table. It skips the **good-suffix** table (leaving it for self-study); here it is likewise only [mentioned](#good-suffix) as the second component that the full Boyer-Moore combines via `max` of the two shifts.

The algorithm has **two phases**:

1. **Preprocessing** — `build_shift_table(pattern)` builds the shift table from the pattern alone, without looking at the text.
2. **Search** — `boyer_moore_search(text, pattern)` scans the text right-to-left inside each window and leaps by the table.

## 1. Intuition: why scan from the end

Suppose we search for the pattern `developer` in the text `Being a developer is not easy`. The naive method would place the pattern at the start and compare **from the left**: `B` vs `d` — mismatch, shift by 1, and so on. Boyer-Moore does the opposite: it places the pattern at the start and compares **from the end** — the text symbol at position 8 (`d`) against the last symbol of the pattern (`r`).

They don't match. But here's the trick: the symbol `d` **is** in the pattern `developer` — right at the start. So we can immediately shift the pattern so that its `d` lands under the text's `d`, **leaping over eight text positions** we never even looked at:

![Boyer-Moore idea: scan from the end and leap over](docs/images/en/intuition.png)

To make such jumps instantly, Boyer-Moore precomputes the **bad-character table** — for each symbol it stores how far to shift the pattern. The rarer the pattern's symbols are in the text, the bigger the jumps. Here is how many symbols our example **skips without comparing at all**:

![Skipped text symbols](docs/images/en/intro_skipped.png)

We found `developer` having compared only **10** text symbols and skipped **8** — that is how Boyer-Moore saves work.

## 2. The two phases of Boyer-Moore

| Phase | Function | What it does |
|---|---|---|
| **1. Preprocessing** | `build_shift_table(pattern)` | builds the shift table from the pattern alone (no text needed) |
| **2. Search** | `boyer_moore_search(text, pattern)` | scans the text right-to-left and leaps by the table |

Let's go through each phase separately.

## 3. Phase 1 — the bad-character table (shift table)

### What it is and how the shift is computed

The **bad-character table** is a «symbol → shift» dictionary. For each symbol it tells how far to shift the pattern forward when this text symbol does not match the current pattern symbol:

- **the symbol is absent** from the pattern → shift by the **whole length** of the pattern (the window can be moved entirely past it);
- **the symbol is present** in the pattern → shift so that the occurrence of that symbol closest to the end lands on the current position.

Hence the shift formula for each pattern symbol (except the last): `shift = length − index − 1` — the distance from the symbol to the end of the pattern. For the **last** symbol we use `setdefault(pattern[-1], length)`: if the symbol isn't in the table yet, add the full length; if it already is (i.e. the symbol repeats), keep the existing value.

### The `build_shift_table` code

Here is the base implementation — the one we walk through line by line:

```python
def build_shift_table(pattern):
    """Створити таблицю зсувів для алгоритму Боєра-Мура."""
    table = {}
    length = len(pattern)
    # Для кожного символу в підрядку встановлюємо зсув рівний довжині підрядка
    for index, char in enumerate(pattern[:-1]):
        table[char] = length - index - 1
    # Якщо символу немає в таблиці, зсув буде дорівнювати довжині підрядка
    table.setdefault(pattern[-1], length)
    return table
```

Construction logic:

1. Create an empty dictionary `table` and take the pattern length `length`.
2. For each symbol `char` at position `index` (for **all but the last**) write `table[char] = length − index − 1`.
3. If a symbol **repeats**, a later occurrence **overwrites** the earlier one — i.e. the one **closer to the end** wins (a smaller shift).
4. For the **last** symbol call `setdefault(pattern[-1], length)`: add the full length only if the key isn't there yet.

> **The example.** For the pattern `ABC` and text `XBC`: when `X` doesn't match `A`, we can shift by `3` (the length of `ABC`), because `X` isn't in the pattern. But when `B` doesn't match `A`, we can shift only by `2`, because `B` **is** in the pattern, 1 position from the end.

### The table for `developer` and the `'e'` overwrite

Consider the pattern `developer` (`length = 9`) — the main example. It is interesting because the symbol `e` appears **three times**, so it gets **overwritten** in the table. Here is the columnar table:

```text
  index | Symbol | length-index-1 | Table entry
  ---------------------------------------------
      0 |   d   | 9 - 0 - 1 = 8  | 'd': 8
      1 |   e   | 9 - 1 - 1 = 7  | 'e': 7
      2 |   v   | 9 - 2 - 1 = 6  | 'v': 6
      3 |   e   | 9 - 3 - 1 = 5  | 'e': 5
      4 |   l   | 9 - 4 - 1 = 4  | 'l': 4
      5 |   o   | 9 - 5 - 1 = 3  | 'o': 3
      6 |   p   | 9 - 6 - 1 = 2  | 'p': 2
      7 |   e   | 9 - 7 - 1 = 1  | 'e': 1
      8 |   r   | setdefault → 9 | 'r': 9
```

The value for `e` is computed three times — `7`, `5`, `1` — and the **last one wins** (`1`, closest to the end). The last symbol `r` is added via `setdefault` with shift `9` (the full length). The final table:

```text
Shift table for «developer»: {'d': 8, 'e': 1, 'v': 6, 'l': 4, 'o': 3, 'p': 2, 'r': 9}
```

![Columnar shift table for developer with overwrite highlighted](docs/images/en/shift_table_developer.png)

🟧 The overwritten values `'e': 7` and `'e': 5` «burn away» (struck through), while `'e': 1` survives.

### Step-by-step construction

The same step by step — you can see the two **overwrites** of `e` and the `setdefault` for `r`:

```text
Step-by-step construction of the shift table for «developer»
  index=0: write «d» → 8
  index=1: write «e» → 7
  index=2: write «v» → 6
  index=3: overwrite «e»: 7 → 5
  index=4: write «l» → 4
  index=5: write «o» → 3
  index=6: write «p» → 2
  index=7: overwrite «e»: 5 → 1
  index=8: setdefault «r»: was absent → 9
```

Construction frames (the active line is highlighted; on the right is the dictionary being filled):

![Overwrite e: 7 → 5](docs/images/en/build_developer_04.png)
![Overwrite e: 5 → 1](docs/images/en/build_developer_08.png)
![setdefault of the last r → 9](docs/images/en/build_developer_09.png)

▶️ Building the table in motion (`length − index − 1`, overwrite, `setdefault`):

![Animation: building the shift table](docs/images/en/table_build.gif)

### More table examples

The minimal example — `ABC`:

```text
  index | Symbol | length-index-1 | Table entry
  ---------------------------------------------
      0 |   A   | 3 - 0 - 1 = 2  | 'A': 2
      1 |   B   | 3 - 1 - 1 = 1  | 'B': 1
      2 |   C   | setdefault → 3 | 'C': 3
```

| Pattern | Shift table | Feature |
|---|---|---|
| `developer` | `{'d': 8, 'e': 1, 'v': 6, 'l': 4, 'o': 3, 'p': 2, 'r': 9}` | the canonical example (overwrite of `'e'`) |
| `ABC` | `{'A': 2, 'B': 1, 'C': 3}` | the canonical example |
| `AABA` | `{'A': 2, 'B': 1}` | the last occurrence wins (`'A'`: 3 → 2) |
| `CAAAA` | `{'C': 4, 'A': 1}` | pathological — the window-end symbol `'A'` gives shift 1 |

![Shift table for ABC](docs/images/en/shift_table_ABC.png)
![Shift table for CAAAA](docs/images/en/shift_table_CAAAA.png)

## 4. Phase 2 — search

### The `boyer_moore_search` code

```python
def boyer_moore_search(text, pattern):
    # Створюємо таблицю зсувів для патерну (підрядка)
    shift_table = build_shift_table(pattern)
    i = 0  # Ініціалізуємо початковий індекс для основного тексту
    # Проходимо по основному тексту, порівнюючи з підрядком
    while i <= len(text) - len(pattern):
        j = len(pattern) - 1  # Починаємо з кінця підрядка
        # Порівнюємо символи від кінця підрядка до його початку
        while j >= 0 and text[i + j] == pattern[j]:
            j -= 1  # Зсуваємось до початку підрядка
        # Якщо весь підрядок збігається, повертаємо його позицію в тексті
        if j < 0:
            return i  # Підрядок знайдено
        # Зсуваємо індекс i на основі таблиці зсувів
        # Це дозволяє "перестрибувати" над неспівпадаючими частинами тексту
        i += shift_table.get(text[i + len(pattern) - 1], len(pattern))
    # Якщо підрядок не знайдено, повертаємо -1
    return -1
```

Search logic:

- the inner loop starts at the end of the pattern (`j = len(pattern) - 1`) and goes **left** while symbols match (`j -= 1`);
- if `j < 0` — the whole pattern matched, return position `i`;
- otherwise shift the window: `i += shift_table.get(text[i + len(pattern) - 1], len(pattern))`.

> **An honest detail.** The shift is taken by `text[i + len(pattern) - 1]` — the text symbol aligned with the **last** position of the pattern (the end of the window), and **not** necessarily by the symbol at which the mismatch occurred. This is a simplified form of the bad-character rule (the Horspool form); it is a touch simpler than «classic» Boyer-Moore but works on the same principle.

### The example: searching for «developer» → 8

Let's reproduce the main example. The text and pattern are **data** (kept unchanged in both languages):

```python
text = "Being a developer is not easy"
pattern = "developer"
position = boyer_moore_search(text, pattern)
if position != -1:
    print(f"Substring found at index {position}")
else:
    print("Substring not found")
```

The driver prints **exactly**:

```text
Substring found at index 8
```

How exactly? The first alignment places the pattern at position 0. Scanning **from the end**: the window-end symbol — `text[8] = 'd'` — against the last symbol of the pattern `pattern[8] = 'r'`. An immediate mismatch. We look at the table: `table['d'] = 8`, so the pattern **leaps by 8** positions, skipping `Being a ` (8 symbols). The second alignment is at position 8 — and now all nine symbols match right-to-left. The full trace:

```text
  i  | j  | text | pat | verdict
  ------------------------------
   0 |  8 |   d  |  r  | mismatch → jump
   8 |  8 |   r  |  r  | match (j−1)
   8 |  7 |   e  |  e  | match (j−1)
   8 |  6 |   p  |  p  | match (j−1)
   8 |  5 |   o  |  o  | match (j−1)
   8 |  4 |   l  |  l  | match (j−1)
   8 |  3 |   e  |  e  | match (j−1)
   8 |  2 |   v  |  v  | match (j−1)
   8 |  1 |   e  |  e  | match (j−1)
   8 |  0 |   d  |  d  | match (j−1)
```

The first row is the single mismatch of the first window (symbol `d` at the end), the rest is the full match of the second window right-to-left. In total **10** comparisons, **1** jump, **8** skipped symbols:

```text
Result: found at position 8   ·   comparisons: 10
```

![First mismatch at the window end](docs/images/en/search_konspekt_start.png)
![Pattern jumps by 8 and skipped symbols](docs/images/en/search_konspekt_jump.png)
![Full match at position 8](docs/images/en/search_konspekt_match.png)

▶️ The search in motion (windowed — the search reads only the start of the text):

![Animation: searching for developer](docs/images/en/search_konspekt.gif)

### Big jumps and skipped text

This is where Boyer-Moore shines. If the pattern's symbols are **rare** in the text, the window-end symbol is often **absent** from the pattern entirely — and then the pattern leaps by its **whole length**, skipping whole chunks of text. Searching for `jumps` in `the quick brown fox jumps over the lazy dog`:

![Skipped symbols: big jumps](docs/images/en/skipped_big_jumps.png)

The pattern was found at position 20 having made only **9** comparisons and skipped **16** of the 43 symbols — fewer comparisons than even half the text length.

▶️ Big jumps in motion:

![Animation: big jumps](docs/images/en/search_big_jumps.gif)

## 5. Boyer-Moore vs naive and KMP

### Comparison count: the contrast triangle

The three string algorithms of the series solve one problem differently. Let's compare the number of character comparisons on the main example:

```text
Input: text «Being a developer is not easy», pattern «developer»
  naive: 29 comparisons
  KMP: 25 comparisons (lps 8 + search 17)
  Boyer-Moore: 10 comparisons, 1 jumps, 8 skipped
```

![Triangle: naive / KMP / Boyer-Moore](docs/images/en/vs_others.png)

| Algorithm | Direction | Shift strategy | Comparisons here |
|---|---|---|---|
| **Naive** | left-to-right → | shift by 1, re-reading | 29 |
| **KMP** | left-to-right → | jump by `lps`, `i` never rolls back | 25 |
| **Boyer-Moore** | **right-to-left** ← | jump by the table, **skipping text** | **10** |

Boyer-Moore wins because it **skips** symbols: on natural text it often makes **fewer comparisons than the text length**. On the rare-symbol case the gap is even bigger:

```text
Input: text «the quick brown fox jumps over the lazy dog», pattern «jumps»
  naive: 43 comparisons
  KMP: 29 comparisons (lps 4 + search 25)
  Boyer-Moore: 9 comparisons, 4 jumps, 16 skipped
```

### Complexity: `O(n)` best / `O(n·m)` worst

| Case | Complexity | When |
|---|---|---|
| **best** | $O(n)$ | the pattern's symbols rarely occur in the text → maximal shifts, text skipped |
| **worst** | $O(n \cdot m)$ | the pattern's symbols occur often but there is no full match → shifts of 1 |

![Graph: Boyer-Moore O(n)/O(n·m) vs naive n·m and KMP n+m](docs/images/en/complexity.png)

Unlike KMP, Boyer-Moore **has no better-than-linear guarantee**: in the worst case it degrades to $O(n \cdot m)$. The classic trap is `CAAAA` in `AAAAAAAAAA`: the window-end symbol `'A'` has shift **1**, so the pattern crawls one step at a time, re-checking almost the whole suffix each time. Here Boyer-Moore **loses** even to the naive method:

```text
Input: text «AAAAAAAAAA», pattern «CAAAA»
  naive: 6 comparisons
  KMP: 14 comparisons (lps 4 + search 10)
  Boyer-Moore: 30 comparisons, 6 jumps, 0 skipped
```

That is an honest limit: the naive method here sees the mismatch on the first symbol (`C` ≠ `A`) right away and makes only 6 comparisons, whereas Boyer-Moore re-checks four `A`s of the suffix each time before hitting `C`. But **on general, natural text** (with diverse symbols) Boyer-Moore is usually the **fastest** of the three — precisely thanks to the big jumps.

### Bad-character only; good-suffix for later

This walkthrough implements **only** the **bad-character** rule. The full Boyer-Moore algorithm has a **second** component — the **good-suffix** rule: when part of the suffix has already matched, it suggests its own shift that accounts for the matched chunk. The full Boyer-Moore takes the **`max`** of the two shifts on each mismatch:

```text
shift = max(bad_character_shift, good_suffix_shift)
```

The good-suffix table is deliberately skipped in this walkthrough, left for self-study — so it is only mentioned here (no implementation). Even the bad-character component alone already produces the characteristic big jumps.

## 6. Code execution step by step: «code ↔ data» panels

The examples above showed the *result* of each step. Here is **the code in action**: on the left a fragment of the algorithm with **highlighted active lines**, on the right the data at that very moment. **The line color encodes the branch:** 🟡 active line, 🟢 match / write / found, 🔴 mismatch / jump, 🔵 index advance. Two phases — two panels.

**Phase 1 — building the table for `MOORE`** (on the right the dictionary fills up; you can see the overwrite of `'O'`):

![Code ↔ shift table](docs/images/en/code_table_grid.png)

**Phase 2 — searching for `MOORE` in `THE BOYER MOORE`** (on the right the «text ↔ pattern» alignment with right-to-left scanning and big jumps):

![Code ↔ alignment](docs/images/en/code_search_grid.png)

## 7. Full step-by-step trace of the example

Below is the same execution, but **in full** and in two phases: first the construction of the shift table for `developer`, then the search itself in our text. Each step is a separate «code ↔ data» frame with a detailed explanation beneath it. The colors are the same as in the [legend above](#code-walkthrough). The block is generated automatically from the event logs.

### Phase 1 — preprocessing: the shift table of pattern «developer»

#### Step T00

![Start: empty table, length = 9](docs/images/en/walkthrough/table_00.png)

Phase 1 — **preprocessing**. We build the bad-character table of the pattern «developer» (length 9) from the pattern alone, without touching the text. We iterate `index` over every character **except the last** and write `table[char] = length − index − 1`.

#### Step T01

![index = 0, symbol «d»](docs/images/en/walkthrough/table_01.png)

`index = 0`, symbol «d». We write `table[«d»] = 9 − 0 − 1 = 8`. The symbol is new — it gets shift 8 (how far to move the pattern if this very text symbol lands at the end of the window).

#### Step T02

![index = 1, symbol «e»](docs/images/en/walkthrough/table_02.png)

`index = 1`, symbol «e». We write `table[«e»] = 9 − 1 − 1 = 7`. The symbol is new — it gets shift 7 (how far to move the pattern if this very text symbol lands at the end of the window).

#### Step T03

![index = 2, symbol «v»](docs/images/en/walkthrough/table_03.png)

`index = 2`, symbol «v». We write `table[«v»] = 9 − 2 − 1 = 6`. The symbol is new — it gets shift 6 (how far to move the pattern if this very text symbol lands at the end of the window).

#### Step T04

![index = 3, symbol «e»](docs/images/en/walkthrough/table_04.png)

`index = 3`, symbol «e». «e» is already in the table (7), but a **later occurrence wins**: we overwrite `table[«e»] = 5` (closer to the end → smaller shift). The old value 7 «burns away».

#### Step T05

![index = 4, symbol «l»](docs/images/en/walkthrough/table_05.png)

`index = 4`, symbol «l». We write `table[«l»] = 9 − 4 − 1 = 4`. The symbol is new — it gets shift 4 (how far to move the pattern if this very text symbol lands at the end of the window).

#### Step T06

![index = 5, symbol «o»](docs/images/en/walkthrough/table_06.png)

`index = 5`, symbol «o». We write `table[«o»] = 9 − 5 − 1 = 3`. The symbol is new — it gets shift 3 (how far to move the pattern if this very text symbol lands at the end of the window).

#### Step T07

![index = 6, symbol «p»](docs/images/en/walkthrough/table_07.png)

`index = 6`, symbol «p». We write `table[«p»] = 9 − 6 − 1 = 2`. The symbol is new — it gets shift 2 (how far to move the pattern if this very text symbol lands at the end of the window).

#### Step T08

![index = 7, symbol «e»](docs/images/en/walkthrough/table_08.png)

`index = 7`, symbol «e». «e» is already in the table (5), but a **later occurrence wins**: we overwrite `table[«e»] = 1` (closer to the end → smaller shift). The old value 5 «burns away».

#### Step T09

![setdefault: last symbol «r»](docs/images/en/walkthrough/table_09.png)

`setdefault(«r», 9)` for the **last** symbol «r»: it was not in the table, so it gets the **whole length** 9 (the symbol is absent before the last position → we may shift by the full length).

#### Step T10

![Done: {'d': 8, 'e': 1, 'v': 6, 'l': 4, 'o': 3, 'p': 2, 'r': 9}](docs/images/en/walkthrough/table_10.png)

The shift table is built: `{'d': 8, 'e': 1, 'v': 6, 'l': 4, 'o': 3, 'p': 2, 'r': 9}`. The repeated «e» kept its **last** occurrence (7 → 5 → 1), and «r» was added via `setdefault` (9). This very table drives the jumps in the search phase.

### Phase 2 — searching for «developer» in our text

#### Step S00

![Start: searching for «developer» in the text](docs/images/en/walkthrough/search_00.png)

Phase 2 — **search**. We look for «developer» in the text (table `{'d': 8, 'e': 1, 'v': 6, 'l': 4, 'o': 3, 'p': 2, 'r': 9}`). We compare each window **right-to-left** — starting from the last symbol of the pattern. (The text is long — we show its beginning.)

#### Step S01

![Comparison right-to-left: i = 0, j = 8](docs/images/en/walkthrough/search_01.png)

`i = 0`, `j = 8`. `text[8] = «d»` ≠ `pattern[8] = «r»` — a **mismatch**. We stop scanning this window and shift the pattern.

#### Step S02

![Mismatch at i = 0, j = 8: jump by the table](docs/images/en/walkthrough/search_02.png)

We shift by the **window-end** symbol. `text[8] = «d»`, `table[«d»] = 8` → the pattern leaps forward by 8 (`i`: 0 → 8). Symbols 0–7 are skipped (never compared).

#### Step S03

![Comparison right-to-left: i = 8, j = 8](docs/images/en/walkthrough/search_03.png)

`i = 8`, `j = 8`. `text[16] = «r»` = `pattern[8] = «r»` — a **match**. We move further left: `j − 1`. The green suffix on the right grows.

#### Step S04

![Comparison right-to-left: i = 8, j = 7](docs/images/en/walkthrough/search_04.png)

`i = 8`, `j = 7`. `text[15] = «e»` = `pattern[7] = «e»` — a **match**. We move further left: `j − 1`. The green suffix on the right grows.

#### Step S05

![Comparison right-to-left: i = 8, j = 6](docs/images/en/walkthrough/search_05.png)

`i = 8`, `j = 6`. `text[14] = «p»` = `pattern[6] = «p»` — a **match**. We move further left: `j − 1`. The green suffix on the right grows.

#### Step S06

![Comparison right-to-left: i = 8, j = 5](docs/images/en/walkthrough/search_06.png)

`i = 8`, `j = 5`. `text[13] = «o»` = `pattern[5] = «o»` — a **match**. We move further left: `j − 1`. The green suffix on the right grows.

#### Step S07

![Comparison right-to-left: i = 8, j = 4](docs/images/en/walkthrough/search_07.png)

`i = 8`, `j = 4`. `text[12] = «l»` = `pattern[4] = «l»` — a **match**. We move further left: `j − 1`. The green suffix on the right grows.

#### Step S08

![Comparison right-to-left: i = 8, j = 3](docs/images/en/walkthrough/search_08.png)

`i = 8`, `j = 3`. `text[11] = «e»` = `pattern[3] = «e»` — a **match**. We move further left: `j − 1`. The green suffix on the right grows.

#### Step S09

![Comparison right-to-left: i = 8, j = 2](docs/images/en/walkthrough/search_09.png)

`i = 8`, `j = 2`. `text[10] = «v»` = `pattern[2] = «v»` — a **match**. We move further left: `j − 1`. The green suffix on the right grows.

#### Step S10

![Comparison right-to-left: i = 8, j = 1](docs/images/en/walkthrough/search_10.png)

`i = 8`, `j = 1`. `text[9] = «e»` = `pattern[1] = «e»` — a **match**. We move further left: `j − 1`. The green suffix on the right grows.

#### Step S11

![Comparison right-to-left: i = 8, j = 0](docs/images/en/walkthrough/search_11.png)

`i = 8`, `j = 0`. `text[8] = «d»` = `pattern[0] = «d»` — a **match**. We move further left: `j − 1`. The green suffix on the right grows.

#### Step S12

![Full match: pattern found at position 8](docs/images/en/walkthrough/search_12.png)

`j` became `< 0` — all 9 symbols matched (right-to-left). We return the start position `i = 8`. Summary: 10 comparisons, 1 jumps, 8 skipped text symbols — that is how Boyer-Moore saves work.

## 8. Properties and edge cases

- **Complexity:** best case $O(n)$, worst case $O(n \cdot m)$; table preprocessing is $O(m + \sigma)$ in time and memory (where $\sigma$ is the alphabet size). In practice, on natural text it is often **sublinear**.
- **Right-to-left scanning** is the defining feature: the inner loop starts at the last symbol of the pattern.
- **Skipping text** is the payoff: big jumps leave whole chunks of text never compared.
- **Preprocessing is text-independent:** one shift table can be built once and reused to search many texts.

Edge cases (verified in [`tests/`](tests)):

| Case | Behavior |
|---|---|
| pattern **equals** the text | position `0` |
| pattern **longer** than the text | `-1` (the condition `i <= len(text) - len(pattern)` is immediately false — the loop never runs) |
| **single-character** pattern | ordinary search |
| text symbol **outside** the pattern | shift by the **whole length** of the pattern |
| **empty** pattern | the verbatim `build_shift_table` raises `IndexError` (because of `pattern[-1]` on an empty pattern)! Safe handling is provided by `boyer_moore_search_all` and `*_steps` |
| **multiple** occurrences | `boyer_moore_search` returns the first; `boyer_moore_search_all` returns all (including overlapping) |
| **worst** (`CAAAA` in `AAAAAAAAAA`) | shift of 1 → $O(n \cdot m)$, nothing skipped |

> **About the empty pattern.** The code is kept **verbatim** on purpose, so on an empty pattern `pattern[-1]` raises `IndexError` right away (still inside `build_shift_table`, before the loop). That is an honest limit of the verbatim implementation; the teaching-instrumented versions handle it safely.

## 9. Place in the string-algorithm series

Boyer-Moore is the **third** string algorithm of the series. It builds a contrast with its two predecessors: both scan **left-to-right**, while it scans **right-to-left** and leaps in big steps.

| Algorithm | Time (worst) | Direction | Idea |
|---|---|---|---|
| [**Naive**](https://github.com/MarynaShavlak/algo-naive-string-search) | $O(n \cdot m)$ | left-to-right → | shift by 1, compare from scratch |
| [**KMP**](https://github.com/MarynaShavlak/algo-knuth-morris-pratt-search) | $O(n + m)$ | left-to-right → | jump by the prefix function `lps`, `i` never rolls back |
| **Boyer-Moore** (this walkthrough) | $O(n \cdot m)$, but often the fastest | **right-to-left** ← | scanning from the end + jump by the bad-character table, skipping text |
| Rabin-Karp | $O(n + m)$ on average | left-to-right → | a rolling **hash** instead of character-by-character comparison |

**Boyer-Moore's niche:** large texts and long patterns over a diverse alphabet (search in editors, `grep`) — where the big jumps make it the fastest in practice, despite the absence of a better-than-quadratic guarantee.

## 10. Summary

- **Boyer-Moore** scans **right-to-left** and on a mismatch **leaps** by the bad-character table, skipping text symbols; the rarer the pattern's symbols, the bigger the jumps.
- **The bad-character table** is a «symbol → shift» dictionary, `shift = length − index − 1`; for repeated symbols the **last** occurrence wins, for absent ones the shift is the full length. References: `developer → {'d':8,'e':1,'v':6,'l':4,'o':3,'p':2,'r':9}`, `ABC → {'A':2,'B':1,'C':3}`.
- **Two phases:** preprocessing `build_shift_table` ($O(m+\sigma)$, doesn't touch the text) and search `boyer_moore_search` (best case $O(n)$).
- **Complexity** best $O(n)$ / worst $O(n \cdot m)$: on natural text usually the fastest of the three, but without KMP's guarantee (the trap is the shift of 1 on `CAAAA`/`AAAA…`).
- Only the **bad-character** rule is implemented; the good-suffix is the second component that the full Boyer-Moore combines via `max`.
- The example `print(boyer_moore_search("Being a developer is not easy", "developer"))` gives **8**, and the driver prints `Substring found at index 8`.

