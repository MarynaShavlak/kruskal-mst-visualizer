import { useMemo, type ReactNode } from "react"
import { Card, CardContent } from "@/components/ui/card"

// Спільна обгортка побудови trace для не-графових плеєрів. Раніше кожен PlaybackView
// мав власний `type Run` + useMemo(empty/too-big/ok) + карту-заглушку. Тут — одне ядро:
// `useTraceRun` (мемоїзація trace) + `TraceFallback` (карта порожній/завеликий вхід).

/** Стан прогону trace: порожній вхід / завеликий для плавного плеєра / готовий. */
export type TraceRun<T> =
  | { kind: "empty" }
  | { kind: "too-big" }
  | { kind: "ok"; trace: T }

/**
 * Тримає trace у useMemo. Залежності навмисно лише [sig, lang] — як у вихідних плеєрах:
 * `sig` кодує всі входи (а стабільність щодо мови не скидає курсор плеєра на UA/EN).
 * `empty`/`tooBig` — передумови; інакше будує trace через `build`.
 */
export function useTraceRun<T>(
  build: () => T,
  opts: { empty: boolean; tooBig: boolean; sig: string; lang: string },
): TraceRun<T> {
  return useMemo<TraceRun<T>>(
    () => {
      if (opts.empty) return { kind: "empty" }
      if (opts.tooBig) return { kind: "too-big" }
      return { kind: "ok", trace: build() }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [opts.sig, opts.lang],
  )
}

/**
 * Карта-заглушка плеєра для порожнього/завеликого входу. `headerExtra` — опційний слот
 * над нею (зазвичай перемикач режимів, щоб він лишався доступним і без trace).
 */
export function TraceFallback({
  message,
  headerExtra,
}: {
  message: ReactNode
  headerExtra?: ReactNode
}) {
  const card = (
    <Card>
      <CardContent className="py-10 text-center text-sm text-muted-foreground">
        {message}
      </CardContent>
    </Card>
  )
  if (headerExtra == null) return card
  return (
    <div className="flex flex-col gap-3">
      {headerExtra}
      {card}
    </div>
  )
}
