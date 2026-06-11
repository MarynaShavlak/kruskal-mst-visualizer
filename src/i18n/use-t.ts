import { messages, type MessageKey } from "@/i18n/messages"
import { useLangStore, type Lang } from "@/store/lang-store"

function format(
  lang: Lang,
  key: MessageKey,
  vars?: Record<string, string | number>,
): string {
  let out = messages[lang][key] ?? key
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      out = out.replaceAll(`{${k}}`, String(v))
    }
  }
  return out
}

/**
 * Хук перекладу chrome-рядків: `const t = useT()` → `t("home.heading")`.
 * Реагує на глобальний lang-store. Підтримує підстановку `{name}` через `vars`.
 * Невідомий ключ повертається як є (видно в UI → легко помітити пропуск).
 */
export function useT() {
  const lang = useLangStore((s) => s.lang)
  return (key: MessageKey, vars?: Record<string, string | number>): string =>
    format(lang, key, vars)
}

/**
 * Імперативний переклад поза React-рендером (тости, кодеки): бере поточну мову
 * зі стору на момент виклику. Для компонентів використовуй useT().
 */
export function tr(
  key: MessageKey,
  vars?: Record<string, string | number>,
): string {
  return format(useLangStore.getState().lang, key, vars)
}
