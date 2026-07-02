# Binary Search Tree

You already know how to **traverse** a tree. Now let's give the tree a single **ordering rule** — and it becomes a powerful structure for fast search, insertion, and deletion. This is a **binary search tree** (BST): for every node, all keys in its **left** subtree are **smaller**, and all keys in its **right** subtree are **larger**.

## 1. The ordering rule

A binary search tree is a binary tree with an invariant: for **any** node with value `x`,

- everything to the **left** of `x` is **smaller** than `x`;
- everything to the **right** of `x` is **larger** than `x`.

The rule is **recursive** — it holds not just for direct children but for whole subtrees. That is exactly what turns search into a sequence of "left or right?" decisions instead of scanning every node.

![Binary search tree — the ordering rule](docs/images/en/bst_anatomy.png)

We treat a BST as a **set of unique keys**: re-inserting an existing key changes nothing.

## 2. Search: descend by the rule

We look for a key `k`. Start at the root and compare at each node:

- `k == node` → **found**;
- `k < node` → go **left** (everything on the right is certainly larger — `k` cannot be there);
- `k > node` → go **right**.

Reach an empty spot — the key is absent. Every comparison **discards a whole subtree**, so the search path is just the **depth** of the tree.

```python {4-7}
def search(root, key):
    if root is None:
        return None             # empty → key not found
    if key == root.val:
        return root             # found
    if key < root.val:
        return search(root.left, key)   # smaller → go left
    return search(root.right, key)      # larger → go right
```

Scrub through the whole story below: building the tree, searching for key `4`, and deleting node `7`. Watch the **comparison path** (🔵) and the node we weigh **right now** (🟡).

![Step-by-step story: build, search, delete](docs/images/en/bst_walk.png)

## 3. Insertion: find the empty spot

Insertion is the same descent as search, but "all the way down": go left/right until we hit an **empty link**. That is exactly where we hang the new leaf node.

```python {2-3}
def insert(root, key):
    if root is None:
        return Node(key)        # empty spot → new node
    if key < root.val:
        root.left = insert(root.left, key)    # smaller → go left
    elif key > root.val:
        root.right = insert(root.right, key)  # larger → go right
    # key == root.val → already present, skip
    return root
```

**The order of insertions decides the tree's shape.** Keys "from the middle" give a balanced tree; already-sorted input (1, 2, 3, …) gives a degenerate "chain".

## 4. Deletion: three cases

Deletion is trickier: after removing a node we must **preserve the invariant**. First we find the node with the same descent, then handle one of three cases:

1. **Leaf** (no children) — just remove it.
2. **One child** — put that child in the node's place.
3. **Two children** — find the **successor**: the smallest key in the **right** subtree (descend left as far as possible). Copy its value into the node, then remove the successor itself (it has at most one child) via case 1 or 2.

Why the successor? It is larger than the whole left subtree and smaller than the rest of the right one — so it perfectly "plugs the hole" without breaking the ordering rule.

## 5. Shape decides everything: O(log n) vs O(n)

Every operation costs exactly as many comparisons as the **height** of the tree. And the height depends on the shape:

- A **balanced** tree of `n` nodes has height ≈ `log₂ n` → operations are **O(log n)**;
- A **degenerate** one (a chain from sorted input) has height `n − 1` → operations are **O(n)**, no better than a plain list.

![A balanced tree vs a degenerate chain](docs/images/en/bst_shape.png)

This is the key lesson of a BST: the idea is logarithmic, but there is no **guarantee** of it — a bad insertion order ruins the shape. That is why self-balancing trees (AVL, red-black) exist, keeping the height `O(log n)` no matter what.

## 6. The reward: in-order traversal = sorted

Recall the **in-order** traversal (left → root → right). Because of the ordering rule it yields the keys **in ascending order**:

![In-order traversal of a BST yields a sorted sequence](docs/images/en/bst_inorder.png)

For our tree that is `2, 3, 4, 5, 6, 7, 8`. So a BST keeps the data sorted "for free", and on sorted data **binary search** works — the circle is complete.

## 7. Check yourself

![Mini-quiz: the deletion case](docs/images/en/bst_quiz.png)

**Where next.** The search tree built its answer from subtrees — the same bottom-up idea as a post-order traversal. The next step is a separate paradigm, **dynamic programming**, where the optimum is assembled from solutions to smaller subproblems; the cleanest first example is the **0/1 knapsack**.
