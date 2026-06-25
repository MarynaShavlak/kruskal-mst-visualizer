import { useMemo, useSyncExternalStore } from "react"
import { isAlgorithmId } from "@/algorithms/registry"
import { kruskal } from "@/algorithms/kruskal"

/**
 * Службові сторінки платформи, що НЕ є алгоритмами (напр. матриця складності
 * `#compare`). Зарезервовані id — щоб роутер не плутав їх з алгоритмами й не
 * скочувався в каталог. Поповнюється разом із новими крос-алгоритмовими екранами.
 */
export const PAGE_IDS = ["compare"] as const
export type PageId = (typeof PAGE_IDS)[number]

function isPageId(id: string): id is PageId {
  return (PAGE_IDS as readonly string[]).includes(id)
}

/**
 * Розібраний роут платформи. `algorithmId === null && page === null` означає
 * каталог (домівку); `page !== null` — службову сторінку (не алгоритм).
 */
export interface Route {
  readonly algorithmId: string | null
  readonly tab: string | null
  readonly page: PageId | null
}

const listeners = new Set<() => void>()

function emit(): void {
  for (const l of listeners) l()
}

function subscribe(cb: () => void): () => void {
  listeners.add(cb)
  window.addEventListener("hashchange", cb)
  return () => {
    listeners.delete(cb)
    window.removeEventListener("hashchange", cb)
  }
}

function getSnapshot(): string {
  return window.location.hash
}

/**
 * Розбирає хеш у роут. Формат: `#<algoId>` або `#<algoId>/<tab>` (+ необов'язкові
 * `?параметри`, які тут відкидаються — їх читають окремі екрани, напр. шаринг графа
 * у редакторі через `?g=...`).
 * Зворотна сумісність: старі посилання `#editor`, `#playback?g=...` (коли рівня
 * алгоритму ще не було) трактуємо як відповідну вкладку Краскала.
 */
export function parseHash(rawHash: string): Route {
  const path = rawHash.replace(/^#\/?/, "").split(/[?&]/)[0]
  const segments = path.split("/").filter(Boolean)
  if (segments.length === 0) return { algorithmId: null, tab: null, page: null }

  const [first, second] = segments
  if (isAlgorithmId(first)) {
    return { algorithmId: first, tab: second ?? null, page: null }
  }
  if (isPageId(first)) {
    return { algorithmId: null, tab: null, page: first }
  }
  if (kruskal.tabs.some((t) => t.key === first)) {
    return { algorithmId: kruskal.id, tab: first, page: null }
  }
  return { algorithmId: null, tab: null, page: null }
}

/** Низькорівневе записування хеша з негайним повідомленням підписників. */
export function setHash(raw: string): void {
  const next = "#" + raw.replace(/^#/, "")
  if (window.location.hash !== next) {
    window.location.hash = next
  }
  // jsdom (і деякі сценарії) не завжди синхронно кидають `hashchange` —
  // повідомляємо самі, щоб UI оновився одразу.
  emit()
}

/** Перейти до алгоритму (і, за бажанням, вкладки) або на домівку (`null`). */
export function navigateTo(
  algorithmId: string | null,
  tab?: string | null,
): void {
  if (!algorithmId) {
    setHash("")
    return
  }
  setHash(tab ? `${algorithmId}/${tab}` : algorithmId)
}

/** Перейти на службову сторінку платформи (не алгоритм), напр. матрицю складності. */
export function navigateToPage(page: PageId): void {
  setHash(page)
}

/** Реактивний роут, синхронізований із `location.hash`. */
export function useRoute(): Route {
  const hash = useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
  return useMemo(() => parseHash(hash), [hash])
}
