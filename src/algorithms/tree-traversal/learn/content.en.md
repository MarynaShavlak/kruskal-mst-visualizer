# Trees. Implementation. Tree Traversal

A **tree** is a hierarchical data structure for one-to-many relationships. It is made
of **nodes**; each node may have several **children** but only one **parent**. The node
with no parent is the **root**. Unlike an array or a hash table, a tree stores not a
linear list but a *hierarchy*.

## 1. Anatomy of a tree

Here is the vocabulary on a small tree:

- **Root** — the single node with no parent; every traversal starts here.
- **Parent** — a node that has children.
- **Child** — a node reached by an edge from its parent.
- **Leaf** — a node with no children (the end of a branch).
- **Branch node** — a node with at least one child.
- **Edge** — the connection between two nodes.
- **Siblings** — nodes that share the same parent.
- **Height** — the number of edges on the longest root-to-leaf path.
- **Ancestor / descendant** — nodes reached by moving up (to the parent) / down (to a child).

![Anatomy of a tree: root, parent, children, leaves](docs/images/en/tt_anatomy.png)

## 2. Binary tree

A **binary tree** is a tree where every node has **at most two** children: a left and a
right one. Binary trees are the foundation of richer structures: **binary search trees
(BST)**, **AVL** and **red-black trees**. The basic node looks like this:

```python
class Node:
    def __init__(self, key):
        self.left = None      # left subtree
        self.right = None     # right subtree
        self.val = key        # node value
```

Throughout we use one example tree: root `1`, its children `2` and `3`, and node `2`
has children `4` and `5`.

## 3. What a traversal is

A **tree traversal** is the process of visiting *all* nodes and performing an action
(usually printing) on each. The goal is to visit every node **exactly once**. Depending
on the *sequence* of visits, there are several ways to traverse.

A binary tree has three classic **depth-first** traversals. All three visit each node
once — the only difference is **when** we visit the root relative to the left and right
subtrees:

| Traversal | Order | On the example |
|-----------|-------|----------------|
| Pre-order | **root** → left → right | 1, 2, 4, 5, 3 |
| In-order | left → **root** → right | 4, 2, 5, 1, 3 |
| Post-order | left → right → **root** | 4, 5, 2, 3, 1 |

Each traversal is a **recursion**: the function calls itself on the left and right
subtrees. The base case is an empty branch (`None`): the recursion returns immediately.
It is the function's call stack that produces the visiting order (you can see it in the
player — the "recursion stack" panel).

## 4. Pre-order traversal

Pre-order visits the **root** first, then recurses into the left subtree, then the
right one:

```python {3}
def preorder(node):
    if node:
        print(node.val)        # 1) ROOT — visited FIRST
        preorder(node.left)    # 2) left subtree
        preorder(node.right)   # 3) right subtree
```

On the example tree this gives `1, 2, 4, 5, 3`. Step through it:

![Pre-order traversal step by step](docs/images/en/tt_preorder.png)

Pre-order is handy when you need to **clone** a tree or **serialize** it to a file so it
can be rebuilt easily: the root comes first, so the tree is reconstructed top-down.

## 5. In-order traversal

In-order first goes into the **left** subtree, then visits the **root**, and only then
the **right** one:

```python {4}
def inorder(node):
    if node:
        inorder(node.left)     # 1) left subtree
        print(node.val)        # 2) ROOT — visited in the MIDDLE
        inorder(node.right)    # 3) right subtree
```

On the example tree the result is `4, 2, 5, 1, 3`:

![In-order traversal step by step](docs/images/en/tt_inorder.png)

**Key property.** If the tree is a **binary search tree** (BST: smaller values on the
left, larger on the right), then in-order emits the values in **sorted order**. This is
the "reward" for the search structure and a direct bridge to binary search:

![In-order traversal of a BST yields a sorted sequence](docs/images/en/tt_bst.png)

## 6. Post-order traversal

Post-order visits the root **last** — first the left subtree, then the right one, and
only then the node itself:

```python {5}
def postorder(node):
    if node:
        postorder(node.left)   # 1) left subtree
        postorder(node.right)  # 2) right subtree
        print(node.val)        # 3) ROOT — visited LAST
```

On the example tree this is `4, 5, 2, 3, 1`:

![Post-order traversal step by step](docs/images/en/tt_postorder.png)

Post-order processes **children before the parent** — exactly what you need when a
node's result depends on its subtrees. For example, to compute the sum of all values in
the tree, first compute the sums of the left and right subtrees, then add the root's
value. For the same reason a tree is safely **freed** this way: children first, then the
parent.

## 7. Why trees are useful

Trees store **hierarchical** information that is hard or impossible to represent with a
flat array. Examples are everywhere:

- a **file system**: directories and subdirectories;
- **HTML / XML (DOM)**: a document as a tree of tags;
- **parsing**: the parse tree of an arithmetic expression.

Compare this with a **hash table**. A hash table gives key access in O(1) on average
but **keeps no order** and spends memory resolving collisions. A tree is slower
(operations in a general tree are O(n), in a balanced search tree O(log n)), yet it
offers what a hash table cannot: an **ordered traversal** of the data and a natural
representation of hierarchy.

![Which traversal yields the given sequence?](docs/images/en/tt_quiz.png)

## 8. Complexity and the bridge onward

Any of the three traversals visits each node exactly once, so its time is **O(n)**, with
O(h) extra memory for the recursion stack (h being the tree's height).

A binary **search** tree makes search / insert / delete logarithmic — O(log n) on a
balanced tree. And the **post-order** traversal, which computes a subtree's answer
*before* the parent's, is the very idea of **dynamic programming**: build the whole from
ready answers to smaller parts. That is exactly where the course goes next.
