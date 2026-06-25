import { useEffect, useState } from "react"
import type { Player } from "@/algorithms/shared/playback/use-player"
import type { PredictQuestion } from "@/algorithms/shared/playback/predict"
import { usePredictStore } from "@/store/predict-store"

export interface PredictController {
  /** Питання поточного кадру (або null — кадр не є інтригою / режим вимкнено). */
  readonly question: PredictQuestion | null
  /** Обраний на ЦЬОМУ кадрі варіант (прив'язаний до player.index) або null. */
  readonly answeredId: string | null
  /** Чи обраний варіант правильний (null — ще не відповіли). */
  readonly isCorrect: boolean | null
  /** Чи розкрито відповідь (відповіли). */
  readonly revealed: boolean
  /** Обрати варіант. */
  pick: (id: string) => void
  /** Скинути відповідь на поточному кадрі (можна вгадати ще раз). */
  reset: () => void
}

/**
 * Логіка режиму «Вгадай рішення» для одного плеєра. Питання вже обчислене ззовні
 * (адаптер у view), тут — лише поведінка:
 * 1. Автопауза: коли режим увімкнено, кадр — інтрига (`question != null`), ще не
 *    відповіли й плеєр ГРАЄ → СИНХРОННО ставимо на паузу (dispatch у тому ж
 *    ефекті, що детектує умову — без гонки з інтервалом usePlayer).
 * 2. `answeredId` прив'язаний до `player.index`: перехід на інший кадр скидає
 *    обраний варіант (нова інтрига — нова відповідь).
 *
 * Коли тумблер вимкнено — повертає «порожній» контролер (question=null), тож
 * оверлей не рендериться, а плеєр поводиться як завжди.
 */
export function usePredict(
  player: Player,
  question: PredictQuestion | null,
): PredictController {
  const enabled = usePredictStore((s) => s.enabled)
  const [answer, setAnswer] = useState<{ index: number; id: string } | null>(null)

  const activeQuestion = enabled ? question : null

  // answeredId дійсний лише для ПОТОЧНОГО кадру (прив'язка до index).
  const answeredId =
    answer && answer.index === player.index ? answer.id : null
  const answered = answeredId !== null

  // Автопауза на інтризі — синхронно в ефекті, що детектує умову.
  useEffect(() => {
    if (activeQuestion && !answered && player.isPlaying) {
      player.dispatch({ type: "pause" })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeQuestion, answered, player.isPlaying, player.index])

  if (activeQuestion == null) {
    return {
      question: null,
      answeredId: null,
      isCorrect: null,
      revealed: false,
      pick: () => {},
      reset: () => {},
    }
  }

  const isCorrect =
    answeredId != null ? answeredId === activeQuestion.correctId : null

  return {
    question: activeQuestion,
    answeredId,
    isCorrect,
    revealed: answered,
    pick: (id) => setAnswer({ index: player.index, id }),
    reset: () => setAnswer(null),
  }
}
