// Embed-режим для викладачів. `?embed=1` у РЕАЛЬНОМУ query-параметрі (НЕ у hash —
// hash зайнятий роутом і `?g=...`). У embed-режимі App.tsx ховає chrome (шапку),
// лишаючи самий віджет — придатний для <iframe> у LMS/блозі.
//
// Чиста частина (parse/build) живе тут і покривається юніт-тестами; `useEmbed()`
// читає конфіг ОДИН раз на маунті (non-reactive — embed не перемикається в рантаймі)
// і за наявності `&lang=` виставляє мову через setLang у useEffect (НЕ в render-body,
// інакше React попереджає про setState під час рендера).

import { useEffect, useRef } from "react"
import { useLangStore, type Lang } from "@/store/lang-store"

export interface EmbedConfig {
  /** Чи активний embed-режим (`?embed=1`). */
  readonly embed: boolean
  /** Бажана мова з `&lang=` (ua|en), якщо задана й валідна. */
  readonly lang: Lang | null
}

const DISABLED: EmbedConfig = { embed: false, lang: null }

function isLang(v: string | null): v is Lang {
  return v === "ua" || v === "en"
}

/**
 * Розбирає embed-конфіг із query-рядка (`location.search`, з/без ведучого '?').
 * `embed=1` (або будь-яке truthy-значення, окрім "0"/"false") вмикає режим;
 * `lang=ua|en` — опційний override мови. Чиста — для тестів без DOM.
 */
export function parseEmbedSearch(search: string): EmbedConfig {
  const params = new URLSearchParams(search.replace(/^\?/, ""))
  const raw = params.get("embed")
  if (raw == null) return DISABLED
  const on = raw !== "0" && raw.toLowerCase() !== "false"
  if (!on) return DISABLED
  const langParam = params.get("lang")
  return { embed: true, lang: isLang(langParam) ? langParam : null }
}

/**
 * Збирає embed-URL (для кнопки «Скопіювати код вставки» та iframe-src). Дзеркалить
 * onShare-конструкцію редактора: `?embed=1` у РЕАЛЬНОМУ query (перед '#'), роут —
 * у hash (з можливим власним `?g=...`). Зберігає `pathname` (deploy base-path).
 */
export function buildEmbedUrl(
  route: string,
  opts?: { readonly lang?: Lang | null },
): string {
  const origin = window.location.origin
  const pathname = window.location.pathname
  const langPart = opts?.lang ? `&lang=${opts.lang}` : ""
  const hash = route.replace(/^#/, "")
  return `${origin}${pathname}?embed=1${langPart}#${hash}`
}

/**
 * Читає embed-конфіг один раз на маунті (non-reactive). Якщо задано `&lang=`,
 * застосовує мову через setLang у useEffect (не під час рендера).
 *
 * ⚠️ `&lang=` пише в localStorage → перезаписує мову для всього origin назавжди
 * (iframe шарить localStorage, sandbox тут немає). Це усвідомлений компроміс
 * embed-режиму; за потреби ізоляції — sandbox-iframe на боці вбудовувача.
 */
export function useEmbed(): EmbedConfig {
  const configRef = useRef<EmbedConfig | null>(null)
  if (configRef.current === null) {
    configRef.current = parseEmbedSearch(window.location.search)
  }
  const config = configRef.current
  const setLang = useLangStore((s) => s.setLang)

  useEffect(() => {
    if (config.lang) setLang(config.lang)
    // Один раз на маунті: config незмінний (читається з ref).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return config
}
