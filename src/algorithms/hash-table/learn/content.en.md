# Hash tables and hash functions

A hash table is a data structure for fast insert, search and delete **by key**. Its
superpower is average **constant-time** access, $O(1)$, regardless of table size.
Python dictionaries, JavaScript objects, Java's `HashMap`, database indexes and
caching all rest on it.

## 1. Why we need it

Picture a list of `name → phone` pairs. To find a number in a plain array you'd scan
every element — that's $O(n)$. Even on a sorted array, binary search only gives
$O(\log n)$ and forces you to keep everything ordered.

A hash table does it differently: it **computes** where the value lives and jumps
straight there — no scanning and **no sorting**. It is the final rung of the search
story:

| Approach | Search time | Precondition |
| --- | --- | --- |
| Linear search | $O(n)$ | none |
| Binary search | $O(\log n)$ | array sorted |
| **Hash table** | **$O(1)$ on average** | none |

## 2. Key, index and value

The one distinction to nail from the start:

- **key** — what we look up (`"apple"`);
- **index** — the cell number the hash function produces (`0`);
- **value** — what sits in the cell (`10`).

One chain: `key "apple"` → (hash function) → `index 0` → cell #0 holds `value 10`.
Analogy — a **coat check**: you hand over a coat (value), get a tag (index), then walk
straight to the right hook instead of checking them all.

## 3. The hash function

A **hash function** turns a key into a number — a "hash code" — which after a modulo
becomes the cell index:

$$\text{index} = \text{hash}(\text{key}) \bmod m$$

where $m$ is the table capacity. The `% m` folds the large hash number into the range
of real cells $0 \dots m-1$.

A good hash function has three properties:

1. **Determinism** — the same key always yields the same index.
2. **Speed** — computed instantly.
3. **Uniformity** — spreads keys evenly, without hot spots.

The player defaults to a teaching function, "sum of character codes", easy to check by
hand: `hash("apple") = 97+112+112+108+101 = 530`, and `530 % 5 = 0`.

## 4. Collisions — why they're inevitable

A **collision** is when two different keys map to the same index. It's not a bug but a
mathematical certainty: there are more keys than cells. The "birthday paradox"
intuition: just 23 people give a 50 % chance that two share a birthday — clashes
happen far sooner than you'd expect.

In our example `hash("lemon") = 539`, and `539 % 5 = 4` — the same slot as `banana`.
So we need a way to resolve collisions.

## 5. Chaining

The simplest way is **chaining**: a cell stores not one value but a **list** of all
pairs that landed there. On lookup we first find the cell via the hash function, then
scan its short chain.

```python {2,4,8}
def insert(key, value):
    i = hash(key) % size          # hash -> cell index
    bucket = table[i]
    for pair in bucket:           # is the key already in the chain?
        if pair.key == key:
            pair.value = value    # update the existing one
            return
    bucket.append((key, value))   # new key -> append to the chain
```

Note: re-inserting the same key is an **update**, not a duplicate.

## 6. Load factor α and rehashing

The **load factor** $\alpha = n / m$ tells how full the table is ($n$ pairs, $m$
cells). The closer $\alpha$ gets to one, the longer the chains and the slower the
lookup: the average number of checks is $\approx 1 + \alpha$.

So real tables, once $\alpha$ passes $\approx 0.75$, **rehash**: build a larger table
and move every key into it. This teaching release doesn't animate rehashing yet — but
the $\alpha$ gauge in the player shows when it would kick in.

## 7. Complexity

- **Best / average case:** $O(1)$ — the hash function is uniform, chains are short,
  access is nearly instant.
- **Worst case:** $O(n)$ — every key landed in one cell (say, a bad hash function),
  and the chain degenerated into an ordinary list.

Try the "Anagrams" script in the editor: `ate`, `eat`, `tea` share the same code sum
(314), so they all go into one cell — the worst case made visible.

## 8. When a hash table isn't best

A hash table loses **order**: data sits "wherever the hash put it". So if you need an
ordered traversal, range queries ("all keys from 10 to 20") or a minimum, **search
trees** (BST, AVL, red-black, B-trees) fit better. And when you only need "present /
absent" with minimal memory — a **Bloom filter**.

## 9. Summary

A hash table trades **order** for **speed**: by computing an index instead of
scanning, it gives $O(1)$ average access. The key ideas are the hash function
(deterministic, fast, uniform), inevitable collisions and a way to resolve them (here,
chaining), plus the load factor $\alpha$ that governs the speed.
