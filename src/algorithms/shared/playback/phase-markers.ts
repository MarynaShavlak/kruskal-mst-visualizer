// Семантичні засічки на таймлайні: де змінюється «фаза» кадру (frame.phase у
// рядкових/сортувальних родинах, frame.sub.kind у графових — accessor generic).
// ЧИСТЕ ядро без React/i18n: рахуємо ІНДЕКСИ кадрів-входів у відмінну фазу, щоб UI
// поставив клікабельну засічку поверх слайдера й показав рядок-діф «фаза→фаза».

import type { PhaseStyle } from "@/algorithms/shared/playback/PhaseBadge"

/** Засічка фази: індекс кадру-входу + сира мітка фази + опц. tailwind-клас. */
export interface PhaseMarker {
  /** Індекс кадру, на якому фаза вперше стає `phase`. */
  readonly index: number
  /** Позиція засічки у відсотках 0..100 (index / last). */
  readonly leftPct: number
  /** Сира мітка фази (`getPhase(frame)`) — UI резолвить підпис через стилі. */
  readonly phase: string
  /** Опц. tailwind-клас фарбування засічки (зі `styles[phase]`). */
  readonly cls?: string
}

/** Налаштування побудови засічок. */
export interface PhaseMarkerOpts {
  /** Білий список фаз: якщо заданий — лишаємо лише засічки цих фаз (для щільних). */
  readonly only?: readonly string[]
}

/**
 * Чисто: за списком кадрів і accessor-ом фази повертає засічки — індекси кадрів,
 * на яких фаза ВПЕРШЕ змінюється (вхід у нову фазу). Кадр 0 НЕ засікаємо (це не
 * «зміна», а старт), окрім випадку, коли потрібен whitelisted-вхід — але навіть
 * тоді перша поява фази на index 0 не є переходом, тож пропускаємо.
 *
 * ⚠️ Guard `last===0`: на одно-/нуль-кадрових trace ділення на `last` дало б NaN —
 * повертаємо `[]`.
 */
export function computePhaseMarkers<F>(
  frames: readonly F[],
  getPhase: (frame: F) => string,
  styles?: Partial<Record<string, PhaseStyle>>,
  opts?: PhaseMarkerOpts,
): PhaseMarker[] {
  const last = frames.length - 1
  if (last <= 0) return []

  const only = opts?.only
  const markers: PhaseMarker[] = []
  let prev = getPhase(frames[0])

  for (let i = 1; i < frames.length; i++) {
    const phase = getPhase(frames[i])
    if (phase !== prev) {
      if (!only || only.includes(phase)) {
        markers.push({
          index: i,
          leftPct: (i / last) * 100,
          phase,
          cls: styles?.[phase]?.cls,
        })
      }
      prev = phase
    }
  }

  return markers
}
