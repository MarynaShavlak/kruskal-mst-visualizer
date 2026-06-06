import { useCallback, useEffect, useState } from "react"

/**
 * Повертає ключ вкладки з хеша: "#editor" -> "editor".
 * Параметри після "?"/"&" відкидаються (напр. "#editor?g=..." -> "editor"),
 * щоб шаринг графа через URL-хеш співіснував із роутингом вкладок.
 */
function readHash(): string {
  return window.location.hash.replace(/^#/, "").split(/[?&]/)[0]
}

/**
 * Синхронізує активну вкладку з `location.hash`.
 * - Ініціалізація з поточного хеша; якщо порожній або невалідний — `defaultTab`.
 * - Слухає `hashchange` (кнопки назад/вперед + ручна правка URL).
 * - `selectTab` одразу оновлює стан (оптимістично) і відображає його в хеші,
 *   тож UI не залежить від того, чи jsdom синхронно кидає `hashchange`.
 *
 * `tabs` має бути стабільним посиланням (визначеним поза компонентом).
 */
export function useHashTab(tabs: readonly string[], defaultTab: string) {
  const [tab, setTab] = useState<string>(() => {
    const initial = readHash()
    return tabs.includes(initial) ? initial : defaultTab
  })

  useEffect(() => {
    const onHashChange = () => {
      const next = readHash()
      setTab(tabs.includes(next) ? next : defaultTab)
    }
    window.addEventListener("hashchange", onHashChange)
    return () => window.removeEventListener("hashchange", onHashChange)
  }, [tabs, defaultTab])

  const selectTab = useCallback((value: string) => {
    setTab(value)
    if (readHash() !== value) {
      window.location.hash = value
    }
  }, [])

  return [tab, selectTab] as const
}
