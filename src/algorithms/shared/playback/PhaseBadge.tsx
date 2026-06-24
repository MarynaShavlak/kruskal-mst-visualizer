import { cn } from "@/lib/utils"
import { useT } from "@/i18n/use-t"
import type { MessageKey } from "@/i18n/messages"

/** Стиль фази для бейджа плеєра: ключ підпису + tailwind-класи кольору. */
export interface PhaseStyle {
  readonly labelKey: MessageKey
  readonly cls: string
}

/**
 * Бейдж поточної фази плеєра. Кожен алгоритм передає статичну мапу фаза→стиль
 * (`Record<Phase, PhaseStyle>`); підпис резолвиться через `useT` всередині.
 */
export function PhaseBadge<T extends string>({
  phase,
  styles,
}: {
  phase: T
  styles: Record<T, PhaseStyle>
}) {
  const t = useT()
  const s = styles[phase]
  return (
    <span
      className={cn(
        "ml-2 inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium",
        s.cls,
      )}
    >
      {t(s.labelKey)}
    </span>
  )
}
