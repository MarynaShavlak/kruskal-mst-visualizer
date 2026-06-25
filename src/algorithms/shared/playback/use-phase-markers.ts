import { useMemo } from "react"
import type { PhaseStyle } from "@/algorithms/shared/playback/PhaseBadge"
import {
  computePhaseMarkers,
  type PhaseMarker,
  type PhaseMarkerOpts,
} from "@/algorithms/shared/playback/phase-markers"
import { useT } from "@/i18n/use-t"

/** Засічка фази з готовим, локалізованим підписом (для title/tooltip). */
export interface LabeledPhaseMarker extends PhaseMarker {
  /** Локалізований підпис фази (через `styles[phase].labelKey`), або сира мітка. */
  readonly label: string
}

/**
 * Мемоізовані засічки фаз + локалізований підпис кожної. Підпис реюзає
 * `styles[phase].labelKey` (того ж `PHASE_STYLES`, що годує `PhaseBadge`) — не
 * вводимо нових ключів на фази.
 */
export function usePhaseMarkers<F>(
  frames: readonly F[],
  getPhase: (frame: F) => string,
  styles?: Partial<Record<string, PhaseStyle>>,
  opts?: PhaseMarkerOpts,
): LabeledPhaseMarker[] {
  const t = useT()
  const only = opts?.only
  return useMemo(() => {
    const markers = computePhaseMarkers(frames, getPhase, styles, only ? { only } : undefined)
    return markers.map((m) => {
      const labelKey = styles?.[m.phase]?.labelKey
      return { ...m, label: labelKey ? t(labelKey) : m.phase }
    })
    // getPhase/styles стабільні (module-level), t реагує на мову.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [frames, only, t])
}

/** Діф «фаза→фаза» навколо поточного кадру: попередня фаза, поточна, чи це межа. */
export interface PhaseDiff {
  /** Фаза поточного кадру. */
  readonly current: string
  /** Фаза попереднього кадру (або null на першому). */
  readonly previous: string | null
  /** true, якщо саме на цьому кадрі фаза змінилася (`current !== previous`). */
  readonly atBoundary: boolean
  /** Локалізований підпис поточної фази. */
  readonly currentLabel: string
  /** Локалізований підпис попередньої (або null). */
  readonly previousLabel: string | null
}

/**
 * Діф фаз на поточному кадрі: показуємо «{prev} → {current}» рівно тоді, коли кадр
 * — точка входу в нову фазу (`atBoundary`). Підписи реюзають `styles[phase].labelKey`.
 */
export function usePhaseDiff<F>(
  frames: readonly F[],
  index: number,
  getPhase: (frame: F) => string,
  styles?: Partial<Record<string, PhaseStyle>>,
): PhaseDiff | null {
  const t = useT()
  const frame = frames[index]
  if (!frame) return null

  const current = getPhase(frame)
  const prevFrame = index > 0 ? frames[index - 1] : undefined
  const previous = prevFrame ? getPhase(prevFrame) : null

  const labelFor = (phase: string): string => {
    const labelKey = styles?.[phase]?.labelKey
    return labelKey ? t(labelKey) : phase
  }

  return {
    current,
    previous,
    atBoundary: previous != null && previous !== current,
    currentLabel: labelFor(current),
    previousLabel: previous != null ? labelFor(previous) : null,
  }
}
