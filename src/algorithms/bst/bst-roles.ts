// Ролі вузла у візуалі ДДП + класи кольору. Роль вузла на кадрі: спокій / шлях
// порівнянь / порівнюємо зараз / результат (знайдено/вставлено) / видаляємо / наступник.
// Спільне джерело для SVG-дерева й легенди плеєра.

/** Роль вузла у візуалі дерева пошуку. */
export type BstNodeRole = "idle" | "path" | "active" | "result" | "remove" | "successor"

/** Класи заливки кола SVG за роллю. */
export const BST_ROLE_FILL: Record<BstNodeRole, string> = {
  idle: "fill-slate-200 dark:fill-slate-600",
  path: "fill-sky-400 dark:fill-sky-500",
  active: "fill-amber-500",
  result: "fill-emerald-500",
  remove: "fill-rose-500",
  successor: "fill-violet-500",
}

/** Класи свотча легенди (заливка) — та сама палітра, що в BST_ROLE_FILL. */
export const BST_ROLE_SWATCH: Record<BstNodeRole, string> = {
  idle: "bg-slate-200 dark:bg-slate-600",
  path: "bg-sky-400 dark:bg-sky-500",
  active: "bg-amber-500",
  result: "bg-emerald-500",
  remove: "bg-rose-500",
  successor: "bg-violet-500",
}
