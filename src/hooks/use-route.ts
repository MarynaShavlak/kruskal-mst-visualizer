import { useMemo, useSyncExternalStore } from "react"
import { isAlgorithmId } from "@/algorithms/registry"
import { kruskal } from "@/algorithms/kruskal"

/** Розібраний роут платформи. `algorithmId === null` означає каталог (домівку). */
export interface Route {
  readonly algorithmId: string | null
  readonly tab: string | null
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
  if (segments.length === 0) return { algorithmId: null, tab: null }

  const [first, second] = segments
  if (isAlgorithmId(first)) {
    return { algorithmId: first, tab: second ?? null }
  }
  if (kruskal.tabs.some((t) => t.key === first)) {
    return { algorithmId: kruskal.id, tab: first }
  }
  return { algorithmId: null, tab: null }
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

/** Реактивний роут, синхронізований із `location.hash`. */
export function useRoute(): Route {
  const hash = useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
  return useMemo(() => parseHash(hash), [hash])
}
