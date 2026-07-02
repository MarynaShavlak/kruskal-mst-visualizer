// Ролі вузла у візуалі обходу дерева + класи кольору. Винесено з TreeSvg.tsx, щоб
// компонентний файл експортував лише компонент (react-refresh), а палітру ділили
// SVG-дерево й легенда плеєра з одного джерела.

/** Роль вузла у візуалі (визначає заливку кола). */
export type TreeNodeRole = "pending" | "stack" | "current" | "done"

/** Класи заливки кола SVG за роллю. */
export const TREE_ROLE_FILL: Record<TreeNodeRole, string> = {
  pending: "fill-slate-200 dark:fill-slate-700",
  stack: "fill-sky-400 dark:fill-sky-500",
  current: "fill-rose-500",
  done: "fill-emerald-500",
}

/** Класи свотча легенди (заливка) — та сама палітра, що в TREE_ROLE_FILL. */
export const TREE_ROLE_SWATCH: Record<TreeNodeRole, string> = {
  pending: "bg-slate-200 dark:bg-slate-700",
  stack: "bg-sky-400 dark:bg-sky-500",
  current: "bg-rose-500",
  done: "bg-emerald-500",
}
