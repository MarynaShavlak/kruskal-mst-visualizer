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
 * Розібрані фасети каталогу з query-частини хеша (`#?family=…&class=…&q=…`).
 * Усі поля необов'язкові — відсутній/«усі» фасет лишається `null` (deep-link
 * лишається коротким). Чита́ється лише коли роут указує на каталог.
 */
export interface CatalogQuery {
  readonly family: string | null
  readonly cls: string | null
  readonly q: string | null
}

/**
 * Розібраний роут платформи. `algorithmId === null && page === null` означає
 * каталог (домівку); `page !== null` — службову сторінку (не алгоритм).
 * `catalog` несе фасети каталогу з query (для глибокого посилання на пошук/фільтр).
 */
export interface Route {
  readonly algorithmId: string | null
  readonly tab: string | null
  readonly page: PageId | null
  readonly catalog: CatalogQuery
}

const EMPTY_CATALOG_QUERY: CatalogQuery = {
  family: null,
  cls: null,
  q: null,
}

/**
 * Дістає query-частину з рядка hash; '' якщо її немає. Роздільником вважаємо
 * перший '?' АБО '&' — дзеркало path-зрізання у `parseHash` (`split(/[?&]/)`),
 * щоб `#&family=…` і `#?family=…` трактувались однаково.
 */
function hashQueryString(rawHash: string): string {
  const h = rawHash.replace(/^#\/?/, "")
  const i = h.search(/[?&]/)
  return i < 0 ? "" : h.slice(i + 1)
}

/**
 * Розбирає фасети каталогу з query-частини хеша. Порожні значення й «усі»-плейсхолдери
 * нормалізуються до `null`, тож round-trip із `buildCatalogHash` стабільний.
 */
export function parseCatalogQuery(rawHash: string): CatalogQuery {
  const query = hashQueryString(rawHash)
  if (query === "") return EMPTY_CATALOG_QUERY
  const params = new URLSearchParams(query)
  const pick = (key: string): string | null => {
    const v = params.get(key)
    if (v == null) return null
    const trimmed = v.trim()
    return trimmed === "" || trimmed === "all" ? null : trimmed
  }
  return { family: pick("family"), cls: pick("class"), q: pick("q") }
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
  const catalog = parseCatalogQuery(rawHash)
  if (segments.length === 0)
    return { algorithmId: null, tab: null, page: null, catalog }

  const [first, second] = segments
  if (isAlgorithmId(first)) {
    return {
      algorithmId: first,
      tab: second ?? null,
      page: null,
      catalog: EMPTY_CATALOG_QUERY,
    }
  }
  if (isPageId(first)) {
    return {
      algorithmId: null,
      tab: null,
      page: first,
      catalog: EMPTY_CATALOG_QUERY,
    }
  }
  if (kruskal.tabs.some((t) => t.key === first)) {
    return {
      algorithmId: kruskal.id,
      tab: first,
      page: null,
      catalog: EMPTY_CATALOG_QUERY,
    }
  }
  return { algorithmId: null, tab: null, page: null, catalog }
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

/**
 * Записати хеш як `path?key=val&…`, зберігаючи path і переписуючи query повністю.
 * Порожні значення оминаються; порожній набір параметрів → лише path (без `?`).
 * Для дип-лінків плеєра (`<algoId>/playback?g=…&step=N&mode=X`): `parseHash`
 * зрізає query, тож роут лишається тим самим, а плеєр читає параметри окремо.
 */
export function setHashWithQuery(
  path: string,
  params: Record<string, string | null | undefined>,
): void {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value == null || value === "") continue
    search.set(key, value)
  }
  // toString() кодує значення (зокрема '=' у base64url не чіпається — він URL-safe);
  // лишаємо як є, щоб round-trip із readGraphParam/readStepParam/readModeParam був стабільним.
  const qs = search.toString()
  setHash(qs === "" ? path : `${path}?${qs}`)
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

/**
 * Записати хеш через `history.replaceState` (НЕ пушить history-entry) із негайним
 * повідомленням підписників. Для частих апдейтів (debounced пошук у каталозі),
 * щоб кнопка «Назад» не захлиналася проміжними станами фільтрів.
 */
export function replaceHash(raw: string): void {
  const next = "#" + raw.replace(/^#/, "")
  if (window.location.hash === next) return
  const url = `${window.location.pathname}${window.location.search}${next}`
  window.history.replaceState(window.history.state, "", url)
  // hashchange не кидається при replaceState → повідомляємо підписників самі.
  emit()
}

/** Перейти на службову сторінку платформи (не алгоритм), напр. матрицю складності. */
export function navigateToPage(page: PageId): void {
  setHash(page)
}

/**
 * Збирає хеш каталогу з фасет, омітячи «усі»/порожні значення (deep-link лишається
 * коротким; порожній набір → `''` = канонічна домівка). Текст `q` кодується через
 * URLSearchParams (пробіли/спецсимволи безпечні).
 */
export function buildCatalogHash(query: Partial<CatalogQuery>): string {
  const params = new URLSearchParams()
  const set = (key: string, v: string | null | undefined): void => {
    if (v == null) return
    const trimmed = v.trim()
    if (trimmed === "" || trimmed === "all") return
    params.set(key, trimmed)
  }
  set("family", query.family)
  set("class", query.cls)
  set("q", query.q)
  const qs = params.toString()
  return qs === "" ? "" : `?${qs}`
}

/**
 * Перейти на каталог із заданими фасетами. За замовчуванням — `replaceState`
 * (для debounced-пошуку без history-спаму); `push=true` пушить history-entry.
 */
export function navigateToCatalog(
  query: Partial<CatalogQuery>,
  push = false,
): void {
  const hash = buildCatalogHash(query)
  if (push) setHash(hash)
  else replaceHash(hash)
}

/** Реактивний роут, синхронізований із `location.hash`. */
export function useRoute(): Route {
  const hash = useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
  return useMemo(() => parseHash(hash), [hash])
}
