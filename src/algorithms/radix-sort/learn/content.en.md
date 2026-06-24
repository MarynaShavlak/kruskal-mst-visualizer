# Radix Sort: a step-by-step walkthrough

**Radix sort** is the first algorithm in this series that **does not compare elements with one another**. Instead of asking "which is larger, $a$ or $b$?" it looks at the **digits** of the numbers themselves: it distributes numbers into 10 buckets (`0–9`) by the digit of the current place and gathers them back — and repeats from the least significant digit to the most significant (ones → tens → hundreds…). That is exactly why it sidesteps the $\Omega(n\log n)$ lower bound that binds comparison sorts, and runs **linearly** — $O(d\cdot(n+k))$, where $d$ is the number of digits and $k$ is the base (10 here).

The key to correctness is **stability**: each digit pass uses a stable [counting sort](#counting), and it is exactly that which preserves the order achieved on the previous digits. Stability here is not a nice bonus but the **linchpin** of the whole method.

## 1. Intuition: buckets, not comparisons

Picture a postal sorter. They do not compare letters with one another — they simply drop them into **boxes by the last digit** of the ZIP code, then collect the boxes in order. Then they repeat by the second-to-last digit — and so on. After a few such passes the letters are ordered.

Radix sort does the same with numbers: on each digit it scatters the numbers into 10 buckets (`0–9`) by that digit and gathers the buckets in order. No "greater/smaller" comparison — the **digit itself** picks the bucket:

![Intuition: one digit — distributed into buckets and gathered](docs/images/en/radix_idea.png)

Each number is a **chip made of its own digits**; what matters is not the height but the specific **digit** of the current place (highlighted in the figures). Smaller numbers are padded with zeros on the left — `3` is treated as `003` on the hundreds pass.

## 2. The idea: digit by digit (LSD)

The algorithm works **from the least significant digit to the most significant** (LSD — Least Significant Digit first):

1. Determine the **number of digits** $d$ from the largest number in the list.
2. Sort by the **ones** with a stable sort (counting sort), then by the **tens**, then by the **hundreds** — $d$ passes in total.
3. The digit of the current place is computed as `index = number // position % 10`, where `position` = `1, 10, 100, …`.

The key idea: **after sorting by one digit, the relative order is preserved for the next digits** — thanks to the stable sort. So by the time we reach the most significant digit, we get a fully ordered array.

## 3. Why it works: stability as the linchpin

Why is it enough to sort "digit by digit" without comparing the numbers as a whole? Because each pass is **stable**: among numbers with the same digit of the current place, their relative order does not change. So when we sort by the tens, numbers with the same tens digit stay in the order the previous pass (by the ones) put them in. This way the higher digits are "in charge" and the lower ones break ties — exactly as when comparing numbers normally.

Remove stability and everything breaks: sorting by the tens could shuffle numbers with equal tens, destroying the work of the ones pass. That is why the stable [counting sort](#counting) is the **linchpin** of all of radix.

And, crucially: we **never compare two elements with each other**. The algorithm uses the **structure of the numbers themselves** (their digits), not answers to "$a < b$?". That is exactly what lets it bypass the $\Omega(n\log n)$ lower bound — [more below](#linear).

## 4. Example — the array `[3, 89, 67, 254, 9, 21, 185, 4, 62]`

### The array

We work with an array of 9 numbers of varying width (1–3 digits). The maximum is `254` (three digits), so there will be **three** digit passes: ones, tens, hundreds.

| index | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 |
|---|---|---|---|---|---|---|---|---|---|
| **value** | 3 | 89 | 67 | 254 | 9 | 21 | 185 | 4 | 62 |

![The array [3, 89, 67, 254, 9, 21, 185, 4, 62] as chips](docs/images/en/array_conspect.png)

### Base implementation

Here is the base implementation — the one we dissect line by line. `counting_sort` sorts by **one** digit, and `radix_sort` calls it for each digit of the largest number:

```python
def counting_sort(arr, position):
    size = len(arr)
    output = [0] * size
    count = [0] * 10

    # Рахунок входжень певного розряду
    for i in range(0, size):
        index = arr[i] // position % 10
        count[index] += 1

    # Оновлення count[i] так, щоб він показував позицію наступного входження своєї цифри
    for i in range(1, 10):
        count[i] += count[i - 1]

    # Побудова вихідного масиву
    i = size - 1
    while i >= 0:
        index = arr[i] // position % 10
        output[count[index] - 1] = arr[i]
        count[index] -= 1
        i -= 1

    for i in range(0, size):
        arr[i] = output[i]

def radix_sort(arr):
    # Визначення максимального числа для визначення кількості розрядів
    max_num = max(arr)
    position = 1
    # Виконання counting_sort для кожного розряду
    while max_num // position > 0:
        counting_sort(arr, position)
        position *= 10

arr = [3, 89, 67, 254, 9, 21, 185, 4, 62]
radix_sort(arr)
print("Відсортований масив:", arr)  # [3, 4, 9, 21, 62, 67, 89, 185, 254]
```

> The code is kept verbatim (with the original Ukrainian comments). What each line does in `radix_sort`:

- `max_num = max(arr)` — the largest number; it tells us how many digits to walk;
- `position = 1` — start with the ones digit;
- `while max_num // position > 0` — while the maximum still has a digit at this place (for `254`: `position` runs `1 → 10 → 100`, and stops at `1000`);
- `counting_sort(arr, position)` — **stably** sort by the current digit;
- `position *= 10` — move to the next (higher) digit.

`counting_sort` itself (three phases: frequencies → prefix sums → stable build) is detailed in the [Counting sort](#counting) section.

### The visual bucket version

The base code is efficient, but its inner workings (the `count[]` array, prefix sums) hide the main idea. So for **visualization** there is a second, intuitive implementation — with 10 **explicit bucket-lists**: append each number into a bucket by its digit, then concatenate the buckets in order. The result is the same, but the distribution process is visible:

```python
def radix_sort_buckets(lst):
    a = list(lst)
    for d in range(max_digits(a)):          # digit by digit (LSD)
        buckets = [[] for _ in range(10)]   # 10 empty buckets
        for x in a:                          # each number
            buckets[x // 10 ** d % 10].append(x)   # into the bucket by its digit
        a = [x for b in buckets for x in b]  # concatenate buckets 0→9
    return a
```

This is the version that produces the bucket distributions you see below — and they match the base implementation **exactly**. (Both versions, like the instrumented `radix_sort_steps`, give the same result as Python's built-in `sorted()` — this is checked by the tests.)

### How to read the frames

- 🟠 **highlighted digit** — the digit of the *current* place in each number (the one we bucket by); dim leading zeros are absent higher digits (`3` → `003`);
- 🔵 **the frames of the 10 buckets `0–9`** — each bucket has its own colour (easier to track where numbers fall);
- 🔴 **a red chip** — the number that is dropping into a bucket at this step;
- 🟢 **green chips** — the gathered/sorted array;
- ⬜ **slate chips** — not distributed yet.

### Pass by the ones

The first pass (`position = 1`). We look at the **last** digit of each number and drop it into the matching bucket. Numbers with the same ones digit land in the same bucket in the order encountered:

![Buckets by the ones](docs/images/en/buckets_units.png)

The bucket distribution and the array after gathering:

```text
Digit by the ones (position = 1):
  0:
  1: 21
  2: 62
  3: 3
  4: 254, 4
  5: 185
  6:
  7: 67
  8:
  9: 89, 9
  → array after distribution: [21, 62, 3, 254, 4, 185, 67, 89, 9]
```

### Pass by the tens

The second pass (`position = 10`). Now we look at the **second digit from the right**. The numbers `3`, `4`, `9` have a zero in the tens place (`003`, `004`, `009`) — they go into bucket `0`, and **in the very same order** the previous pass produced (stability!):

![Buckets by the tens](docs/images/en/buckets_tens.png)

```text
Digit by the tens (position = 10):
  0: 3, 4, 9
  1:
  2: 21
  3:
  4:
  5: 254
  6: 62, 67
  7:
  8: 185, 89
  9:
  → array after distribution: [3, 4, 9, 21, 254, 62, 67, 185, 89]
```

### Pass by the hundreds

The third pass (`position = 100`). We look at the third digit from the right; numbers with fewer than three digits are treated as if their highest digit is `0`. Most numbers settle into bucket `0` (they are already ordered among themselves by the previous passes), while `185` and `254` go into buckets `1` and `2`:

![Buckets by the hundreds](docs/images/en/buckets_hundreds.png)

```text
Digit by the hundreds (position = 100):
  0: 3, 4, 9, 21, 62, 67, 89
  1: 185
  2: 254
  3:
  4:
  5:
  6:
  7:
  8:
  9:
  → array after distribution: [3, 4, 9, 21, 62, 67, 89, 185, 254]
```

After the hundreds pass the array is **fully sorted**.

### The big picture: evolution by digits

All the states of the array side by side — you can see how order "matures" from the lower digits to the higher ones with each pass (the highlighted digit changes every time):

![Evolution of the array by digit passes](docs/images/en/evolution_conspect.png)

▶️ The same in motion — numbers drop into buckets one by one, then are gathered; pass by pass:

![Animation: sorting through buckets](docs/images/en/sort_buckets.gif)

### Result

![The sorted array [3, 4, 9, 21, 62, 67, 89, 185, 254]](docs/images/en/result_conspect.png)

The console summary:

```text
Input:  [3, 89, 67, 254, 9, 21, 185, 4, 62]
Output: [3, 4, 9, 21, 62, 67, 89, 185, 254]
Digit passes: 3   Distributions: 27   Element comparisons: 0
```

Three digit passes, $3\times9 = 27$ distributions — and **not a single** comparison of elements with one another.

## 5. Counting sort: the inner workings

What exactly does `counting_sort` do for one digit? This is the stable subroutine that radix rests on. Three phases (using the ones digit of the main array):

![Counting sort panel for the ones](docs/images/en/counting_units.png)

1. **`count[]` — digit frequencies.** Walk the array and count how many numbers have each digit `0–9` in the current place.
2. **Prefix sums.** Replace `count[i]` with the sum `count[0..i]`. Now `count[digit]` is the **position** (the end of the block, to be precise) for numbers with that digit.
3. **Stable build of `output` from the end.** Walk the array **from the end** to the start, place each number at `output[count[digit] - 1]`, and decrement `count[digit]`. Walking from the end is exactly what makes counting **stable**: the last of the equal numbers settles further right, preserving the original order.

```text
Counting sort by the ones of the array [3, 89, 67, 254, 9, 21, 185, 4, 62]
  ones digits: [3, 9, 7, 4, 9, 1, 5, 4, 2]
  count[] (frequencies): [0, 1, 1, 1, 2, 1, 0, 1, 0, 2]
  count[] (prefix):      [0, 1, 2, 3, 5, 6, 6, 7, 7, 9]
  output (stable):       [21, 62, 3, 254, 4, 185, 67, 89, 9]
```

The same line by line, with code highlighting and the `count[]`/`output` state:

![Code ↔ data: counting_sort by the ones](docs/images/en/count_steps_units.png)

▶️ The animated version (the `count` → prefix → stable build phases):

![Animation: counting sort](docs/images/en/counting_units.gif)

The complexity of one phase is $O(n+k)$, where $k$ is the base (10 here). There are $d$ digits in total, so radix costs $O(d\cdot(n+k))$.

## 6. Stability: an array with duplicates

Stability is not cosmetics but a **correctness condition** of radix. To see it, take "tagged" duplicates — each copy of an equal value carries a subscript that shows its original position (`52₁`, `52₂`):

![An array with tagged duplicates](docs/images/en/array_duplicates.png)

```text
Stability on an array with duplicates
Input (labels show the original order of equal keys): [52₁, 12₁, 52₂, 31₁, 12₂, 41₁]
Output (equal keys kept their original order): [12₁, 12₂, 31₁, 41₁, 52₁, 52₂]
Stable ✓: among equal keys (52₁ before 52₂, 12₁ before 12₂) the order is preserved.
```

Follow the evolution: after the ones pass `52₁` stands before `52₂`; the tens pass sorts by the tens digit, but among numbers with the same digit (both `52` have a tens digit of `5`) it **preserves** their order — so `52₁` stays before `52₂`:

![Evolution of the array with duplicates](docs/images/en/evolution_duplicates.png)

![The sorted array: equal keys in their original order](docs/images/en/result_duplicates.png)

If the per-digit sort were unstable, the pair `52₁, 52₂` could be shuffled — and the whole method would give a wrong result. That is exactly why radix's subroutine must be a **stable** sort.

## 7. Choosing the base: passes vs. memory

We worked in base `10` (decimal digits, 10 buckets). But the base is a **parameter**. In a larger base $b$ (for example, `256` $= 2^8$) each "digit" holds more information, so there are **fewer digits** ($d = \lceil \log_b(\max) \rceil$), and therefore fewer passes. We pay for this with a **larger `count` array** (the number of buckets becomes $k = b$).

This is the classic **"passes vs. memory"** trade-off:

| Base $k$ | Digits per number (passes $d$) | Size of `count` | When it pays off |
|---|---|---|---|
| 2 | many (one per bit) | tiny (2) | very little memory |
| 10 | moderate | small (10) | intuitive, "human" digits |
| 256 ($2^8$) | few (one per byte) | medium (256) | fast for 32/64-bit integers |

The visual implementation takes the base as a parameter (`radix_sort_buckets(lst, base=256)`) — the result is the same, only the number of passes and buckets changes. In practice, for machine integers people often pick base $2^8$ or $2^{16}$: a handful of passes instead of a dozen, at the cost of a moderate counter array.

## 8. Executing the code step by step: code ↔ data panels

The examples above showed the *result* of each step. Here is **the code in action**: on the left, the visual `radix_sort_buckets` implementation with **highlighted active lines**, on the right — the source array and the buckets at that very moment. **The colour of the code line encodes what is happening:** 🟡 the line runs now, 🟠 digit computation and distribution into a bucket (`buckets[...].append(x)`), 🟢 buckets gathered into the array.

We build this for the example array (its bucket distributions match the walkthrough above). The grid shows the outer LSD loop — for each digit, "made buckets → gathered":

![Code ↔ data: digit by digit through buckets](docs/images/en/code_steps_conspect.png)

▶️ The full animation — with **every** number being distributed into a bucket:

![Animation: code ↔ data](docs/images/en/code_walk_conspect.gif)

## 9. Full step-by-step trace of `[3, 89, 67, 254, 9, 21, 185, 4, 62]`

Below is the same step-by-step execution, but **in full**: the start of each digit pass, the distribution of each number into a bucket, and the gathered array after each digit — each as a separate code ↔ data frame, in the right order, with a detailed explanation under each. The colours are the same as in the [legend above](#how-to-read). The block is generated automatically from the event journal.

#### Step 00

![Start: the array is unsorted](docs/images/en/walkthrough/step_00.png)

The initial array `[3, 89, 67, 254, 9, 21, 185, 4, 62]`. Each number is a chip of its own digits; leading zeros are dim (smaller numbers are padded with zeros on the left to three places, since the maximum is three digits). All chips are slate: the array is not ordered yet. In the code, `a = list(lst)` is highlighted.

#### Step 01

![Digit pass by the ones (position = 1)](docs/images/en/walkthrough/step_01.png)

Start of the digit pass by ones (`position = 1`). We look at the corresponding digit of **every** number (highlighted in amber) — that digit is what we bucket by, across 10 buckets. In the code, the digit loop and `buckets = [[] for _ in range(10)]` are highlighted.

#### Step 02

![Distributing by the ones](docs/images/en/walkthrough/step_02.png)

Number `3`: its ones digit is `3` → we drop the chip into bucket `3` (`buckets[3].append(3)`). This is **not** a comparison with other elements — the digit alone picks the bucket. Distributions so far: 1; element-to-element comparisons: 0.

#### Step 03

![Distributing by the ones](docs/images/en/walkthrough/step_03.png)

Number `89`: its ones digit is `9` → we drop the chip into bucket `9` (`buckets[9].append(89)`). This is **not** a comparison with other elements — the digit alone picks the bucket. Distributions so far: 2; element-to-element comparisons: 0.

#### Step 04

![Distributing by the ones](docs/images/en/walkthrough/step_04.png)

Number `67`: its ones digit is `7` → we drop the chip into bucket `7` (`buckets[7].append(67)`). This is **not** a comparison with other elements — the digit alone picks the bucket. Distributions so far: 3; element-to-element comparisons: 0.

#### Step 05

![Distributing by the ones](docs/images/en/walkthrough/step_05.png)

Number `254`: its ones digit is `4` → we drop the chip into bucket `4` (`buckets[4].append(254)`). This is **not** a comparison with other elements — the digit alone picks the bucket. Distributions so far: 4; element-to-element comparisons: 0.

#### Step 06

![Distributing by the ones](docs/images/en/walkthrough/step_06.png)

Number `9`: its ones digit is `9` → we drop the chip into bucket `9` (`buckets[9].append(9)`). This is **not** a comparison with other elements — the digit alone picks the bucket. Distributions so far: 5; element-to-element comparisons: 0.

#### Step 07

![Distributing by the ones](docs/images/en/walkthrough/step_07.png)

Number `21`: its ones digit is `1` → we drop the chip into bucket `1` (`buckets[1].append(21)`). This is **not** a comparison with other elements — the digit alone picks the bucket. Distributions so far: 6; element-to-element comparisons: 0.

#### Step 08

![Distributing by the ones](docs/images/en/walkthrough/step_08.png)

Number `185`: its ones digit is `5` → we drop the chip into bucket `5` (`buckets[5].append(185)`). This is **not** a comparison with other elements — the digit alone picks the bucket. Distributions so far: 7; element-to-element comparisons: 0.

#### Step 09

![Distributing by the ones](docs/images/en/walkthrough/step_09.png)

Number `4`: its ones digit is `4` → we drop the chip into bucket `4` (`buckets[4].append(4)`). This is **not** a comparison with other elements — the digit alone picks the bucket. Distributions so far: 8; element-to-element comparisons: 0.

#### Step 10

![Distributing by the ones](docs/images/en/walkthrough/step_10.png)

Number `62`: its ones digit is `2` → we drop the chip into bucket `2` (`buckets[2].append(62)`). This is **not** a comparison with other elements — the digit alone picks the bucket. Distributions so far: 9; element-to-element comparisons: 0.

#### Step 11

![Gathered after the ones digit](docs/images/en/walkthrough/step_11.png)

The ones digit is done: we concatenate the buckets in order `0→9` into one array — `[21, 62, 3, 254, 4, 185, 67, 89, 9]`. Because we appended left to right and gather in order, **stability** preserves the order achieved on the previous digits. In the code, `a = [x for b in buckets for x in b]` is highlighted.

#### Step 12

![Digit pass by the tens (position = 10)](docs/images/en/walkthrough/step_12.png)

Start of the digit pass by tens (`position = 10`). We look at the corresponding digit of **every** number (highlighted in amber) — that digit is what we bucket by, across 10 buckets. In the code, the digit loop and `buckets = [[] for _ in range(10)]` are highlighted.

#### Step 13

![Distributing by the tens](docs/images/en/walkthrough/step_13.png)

Number `21`: its tens digit is `2` → we drop the chip into bucket `2` (`buckets[2].append(21)`). This is **not** a comparison with other elements — the digit alone picks the bucket. Distributions so far: 10; element-to-element comparisons: 0.

#### Step 14

![Distributing by the tens](docs/images/en/walkthrough/step_14.png)

Number `62`: its tens digit is `6` → we drop the chip into bucket `6` (`buckets[6].append(62)`). This is **not** a comparison with other elements — the digit alone picks the bucket. Distributions so far: 11; element-to-element comparisons: 0.

#### Step 15

![Distributing by the tens](docs/images/en/walkthrough/step_15.png)

Number `3`: its tens digit is `0` → we drop the chip into bucket `0` (`buckets[0].append(3)`). This is **not** a comparison with other elements — the digit alone picks the bucket. Distributions so far: 12; element-to-element comparisons: 0.

#### Step 16

![Distributing by the tens](docs/images/en/walkthrough/step_16.png)

Number `254`: its tens digit is `5` → we drop the chip into bucket `5` (`buckets[5].append(254)`). This is **not** a comparison with other elements — the digit alone picks the bucket. Distributions so far: 13; element-to-element comparisons: 0.

#### Step 17

![Distributing by the tens](docs/images/en/walkthrough/step_17.png)

Number `4`: its tens digit is `0` → we drop the chip into bucket `0` (`buckets[0].append(4)`). This is **not** a comparison with other elements — the digit alone picks the bucket. Distributions so far: 14; element-to-element comparisons: 0.

#### Step 18

![Distributing by the tens](docs/images/en/walkthrough/step_18.png)

Number `185`: its tens digit is `8` → we drop the chip into bucket `8` (`buckets[8].append(185)`). This is **not** a comparison with other elements — the digit alone picks the bucket. Distributions so far: 15; element-to-element comparisons: 0.

#### Step 19

![Distributing by the tens](docs/images/en/walkthrough/step_19.png)

Number `67`: its tens digit is `6` → we drop the chip into bucket `6` (`buckets[6].append(67)`). This is **not** a comparison with other elements — the digit alone picks the bucket. Distributions so far: 16; element-to-element comparisons: 0.

#### Step 20

![Distributing by the tens](docs/images/en/walkthrough/step_20.png)

Number `89`: its tens digit is `8` → we drop the chip into bucket `8` (`buckets[8].append(89)`). This is **not** a comparison with other elements — the digit alone picks the bucket. Distributions so far: 17; element-to-element comparisons: 0.

#### Step 21

![Distributing by the tens](docs/images/en/walkthrough/step_21.png)

Number `9`: its tens digit is `0` → we drop the chip into bucket `0` (`buckets[0].append(9)`). This is **not** a comparison with other elements — the digit alone picks the bucket. Distributions so far: 18; element-to-element comparisons: 0.

#### Step 22

![Gathered after the tens digit](docs/images/en/walkthrough/step_22.png)

The tens digit is done: we concatenate the buckets in order `0→9` into one array — `[3, 4, 9, 21, 254, 62, 67, 185, 89]`. Because we appended left to right and gather in order, **stability** preserves the order achieved on the previous digits. In the code, `a = [x for b in buckets for x in b]` is highlighted.

#### Step 23

![Digit pass by the hundreds (position = 100)](docs/images/en/walkthrough/step_23.png)

Start of the digit pass by hundreds (`position = 100`). We look at the corresponding digit of **every** number (highlighted in amber) — that digit is what we bucket by, across 10 buckets. In the code, the digit loop and `buckets = [[] for _ in range(10)]` are highlighted.

#### Step 24

![Distributing by the hundreds](docs/images/en/walkthrough/step_24.png)

Number `3`: its hundreds digit is `0` → we drop the chip into bucket `0` (`buckets[0].append(3)`). This is **not** a comparison with other elements — the digit alone picks the bucket. Distributions so far: 19; element-to-element comparisons: 0.

#### Step 25

![Distributing by the hundreds](docs/images/en/walkthrough/step_25.png)

Number `4`: its hundreds digit is `0` → we drop the chip into bucket `0` (`buckets[0].append(4)`). This is **not** a comparison with other elements — the digit alone picks the bucket. Distributions so far: 20; element-to-element comparisons: 0.

#### Step 26

![Distributing by the hundreds](docs/images/en/walkthrough/step_26.png)

Number `9`: its hundreds digit is `0` → we drop the chip into bucket `0` (`buckets[0].append(9)`). This is **not** a comparison with other elements — the digit alone picks the bucket. Distributions so far: 21; element-to-element comparisons: 0.

#### Step 27

![Distributing by the hundreds](docs/images/en/walkthrough/step_27.png)

Number `21`: its hundreds digit is `0` → we drop the chip into bucket `0` (`buckets[0].append(21)`). This is **not** a comparison with other elements — the digit alone picks the bucket. Distributions so far: 22; element-to-element comparisons: 0.

#### Step 28

![Distributing by the hundreds](docs/images/en/walkthrough/step_28.png)

Number `254`: its hundreds digit is `2` → we drop the chip into bucket `2` (`buckets[2].append(254)`). This is **not** a comparison with other elements — the digit alone picks the bucket. Distributions so far: 23; element-to-element comparisons: 0.

#### Step 29

![Distributing by the hundreds](docs/images/en/walkthrough/step_29.png)

Number `62`: its hundreds digit is `0` → we drop the chip into bucket `0` (`buckets[0].append(62)`). This is **not** a comparison with other elements — the digit alone picks the bucket. Distributions so far: 24; element-to-element comparisons: 0.

#### Step 30

![Distributing by the hundreds](docs/images/en/walkthrough/step_30.png)

Number `67`: its hundreds digit is `0` → we drop the chip into bucket `0` (`buckets[0].append(67)`). This is **not** a comparison with other elements — the digit alone picks the bucket. Distributions so far: 25; element-to-element comparisons: 0.

#### Step 31

![Distributing by the hundreds](docs/images/en/walkthrough/step_31.png)

Number `185`: its hundreds digit is `1` → we drop the chip into bucket `1` (`buckets[1].append(185)`). This is **not** a comparison with other elements — the digit alone picks the bucket. Distributions so far: 26; element-to-element comparisons: 0.

#### Step 32

![Distributing by the hundreds](docs/images/en/walkthrough/step_32.png)

Number `89`: its hundreds digit is `0` → we drop the chip into bucket `0` (`buckets[0].append(89)`). This is **not** a comparison with other elements — the digit alone picks the bucket. Distributions so far: 27; element-to-element comparisons: 0.

#### Step 33

![Gathered after the hundreds digit](docs/images/en/walkthrough/step_33.png)

The hundreds digit is done: we concatenate the buckets in order `0→9` into one array — `[3, 4, 9, 21, 62, 67, 89, 185, 254]`. Because we appended left to right and gather in order, **stability** preserves the order achieved on the previous digits. In the code, `a = [x for b in buckets for x in b]` is highlighted.

#### Step 34

![Done: the array is sorted](docs/images/en/walkthrough/step_34.png)

Result: the array is sorted — `[3, 4, 9, 21, 62, 67, 89, 185, 254]`. In total 3 digit passes and 27 distributions, with **0 element-to-element comparisons**. Radix sort is linear — `O(d·(n+k))` — which is exactly how it sidesteps the `Ω(n·log n)` lower bound of comparison sorts. `return a` is highlighted.

## 10. Complexity and properties

Unlike comparison sorts, radix has no "worst case" caused by an unlucky arrangement — the work depends only on the number of digits $d$ and the array size $n$:

| Case | Time | Why |
|---|---|---|
| **Best / average / worst** | $O(d\cdot(n+k))$ | $d$ passes, each $O(n+k)$ work via counting |

Other properties:

- **Non-comparison:** elements are **not compared** with one another — the digit picks the bucket. That is why the method bypasses the $\Omega(n\log n)$ lower bound.
- **Stable:** equal keys keep their relative order (because the subroutine is a stable counting sort).
- **Not in-place:** it needs $O(n+k)$ **extra** memory (the `output` array and the `count` counters).
- **Linear for a fixed width:** if $d$ and $k$ are constants (e.g. 32-bit integers), the time is $O(n)$.

## 11. Why it is linear: how the n·log n bound is bypassed

Any sort that relies **only on comparisons** between elements cannot be faster than $\Omega(n\log n)$ in the worst case — this is a proven lower bound (a decision tree with $n!$ leaves has depth $\ge \log_2 n! \approx n\log_2 n$). Radix does **not violate** this bound — it **bypasses** it, because it does not compare elements at all. Instead of "$a < b$?" questions it reads the **structure of the numbers** (their digits), and a number has a fixed number of digits.

Compare the growth of the number of operations: linear $d\cdot(n+k)$ vs. the comparison lower bound $n\log_2 n$ (and $n^2$ for quadratic methods):

![Graph: d·(n+k) vs. n·log n](docs/images/en/growth.png)

For integers with a bounded number of digits, radix beats even $n\log n$ sorts. But there is no "free lunch" — there are [limitations](#limitations).

## 12. Limitations: where radix does not win

- **Integers / fixed-length keys only.** Radix works with things that have "digits": integers, fixed-width strings, tuples. For arbitrary objects with a "less/greater" order (say, a custom comparator) it is not suitable — those need comparisons.
- **The base version handles non-negative integers only.** Negative and fractional numbers need special handling (range shift / sorting the sign separately / radix over mantissa bits).
- **$O(n+k)$ extra memory** — radix is **not in-place**, unlike bubble or quicksort.
- **Large $d$ — large slowdown.** If there are few numbers but they are huge (many digits), $d$ is large and the advantage disappears. The "edge" example is the array `[4, 7, 1000000, 23, 9]`: only 5 numbers, but $\max = 10^6$ → **7 digit passes** instead of one or two. Formally radix still gives the right answer, but $d\gg\log n$ makes it slower than a plain `sorted()`.

The honest conclusion: radix shines on **large arrays of integers with a small width** (and on fixed-width strings, suffix arrays, etc.), not as a universal sort.

## 13. Place in the series: the first non-comparison sort

This is the **seventh** algorithm in the series — and the first that is **not comparison-based**. The previous six ordered elements by asking "which is larger?"; radix makes a conceptual leap: it uses the **structure of the keys** and a **stable counting sort** as a subroutine (stability, important throughout the series, becomes the linchpin here).

| Algorithm | Type | Time (worst) | Memory | Stable | In-place |
|---|---|---|---|---|---|
| Bubble | comparison | $O(n^2)$ | $O(1)$ | yes | yes |
| Insertion | comparison | $O(n^2)$ | $O(1)$ | yes | yes |
| Selection | comparison | $O(n^2)$ | $O(1)$ | no | yes |
| Shell | comparison | $O(n^{3/2})$* | $O(1)$ | no | yes |
| Quicksort | comparison | $O(n^2)$ | $O(\log n)$ | no | yes |
| Merge sort | comparison | $O(n\log n)$ | $O(n)$ | yes | no |
| **Radix** | **non-comparison** | $O(d\cdot(n+k))$ | $O(n+k)$ | yes | no |

\* for popular Shell gap sequences; the exact bound depends on the sequence.

All comparison methods hit the $\Omega(n\log n)$ wall; radix goes past it because it pays with something else — a restriction on the data type and extra memory.

## 14. Where it fits

- **Large arrays of integers** with a small number of digits (IDs, codes, fixed-width keys) — radix is often faster than $O(n\log n)$.
- **Sorting strings** of equal length (LSD-radix over characters) and **suffix arrays** in text processing/bioinformatics.
- **Sorting in base $2^k$** for machine integers (a few passes over bytes) — the basis of production implementations.
- As a **subroutine** in other algorithms when the keys are integers from a bounded range.

For arbitrary data with a comparator, use `sorted()` / `list.sort()` (Timsort) — stable, adaptive, $O(n\log n)$.

## 15. Summary

- **Radix sort** does not compare elements — it distributes them into 10 buckets (`0–9`) by the digit of the current place and gathers them back, from the least significant digit to the most significant (LSD).
- Each digit pass uses a **stable counting sort** (`count[]` frequencies → prefix sums → building `output` from the end). **Stability is the linchpin**: without it the method breaks.
- **Non-comparison → linear time** $O(d\cdot(n+k))$: radix bypasses the $\Omega(n\log n)$ lower bound because it uses the structure of digits, not comparisons.
- **Not in-place** ($O(n+k)$ memory); the base version handles **non-negative integers** only.
- On the array `[3, 89, 67, 254, 9, 21, 185, 4, 62]` the sort costs **3 digit passes and 27 distributions — 0 element comparisons**.
- **Choosing the base** is a "passes vs. memory" trade-off: a larger base → fewer passes, but a bigger `count`.
- This is the **first non-comparison** algorithm in the series — a conceptual leap beyond comparison sorts.

