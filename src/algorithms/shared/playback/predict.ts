// Режим «Вгадай рішення» (predict-before-reveal): на кадрі-інтризі плеєр стає на
// паузу, пропонує 2-3 варіанти й розкриває ✓/✗. Правильну відповідь ВИВОДИМО з
// НАСТУПНОГО (resolution) кадру trace — алгоритм не дублюємо, лягає на наявну
// дворівневість Frame[].
//
// Цей модуль — ЧИСТИЙ (без JSX): типи питання + адаптери `frames→question|null`
// для пілотних родин (двійковий пошук, лінійний пошук, Краскал). Адаптери
// АСИМЕТРИЧНІ: binary/linear резолюція суміжна (index+1), а kruskal-`consider`
// (decision=null) відділений DSU-підкадрами → СКАНУЄМО ВПЕРЕД на той самий
// consideredEdgeId з non-null decision.

import type { MessageKey } from "@/i18n/messages"
import type { BsFrame } from "@/lib/binarySearchTrace"
import type { LsFrame } from "@/lib/linearSearchTrace"
import type { Frame } from "@/lib/trace"

/** Один варіант відповіді: стабільний id + ключ підпису (+ опц. підстановки). */
export interface PredictOption {
  readonly id: string
  readonly labelKey: MessageKey
  readonly labelVars?: Record<string, string | number>
}

/** Питання-інтрига: промпт, варіанти й id правильного. */
export interface PredictQuestion {
  readonly promptKey: MessageKey
  readonly options: readonly PredictOption[]
  readonly correctId: string
}

/** Адаптер: за кадрами trace і поточним індексом будує питання (або null). */
export type PredictAdapter<F> = (
  frames: readonly F[],
  index: number,
) => PredictQuestion | null

/** Плеєри без власного адаптера — питань немає (тумблер просто нічого не робить). */
export const defaultNoQuestion: PredictAdapter<unknown> = () => null

// — Двійковий пошук --------------------------------------------------------
//
// Інтрига = кадр `probe`. Резолюція = НАСТУПНИЙ кадр (probe→discard|found суміжні).
// ⚠️ correctId визначаємо за ВІДКИНУТИМ ДІАПАЗОНОМ (discardLo/discardHi), а НЕ за
// назвою лінії: у binarySearchTrace при value<target лінія зветься `discardRight`,
// але ставить discardLo=oldLow, discardHi=mid → відкидається НИЖНІЙ діапазон.
// Ключування на label дало б реверснутий correctId (bug-magnet → unit-тест).

export const binaryPredictAdapter: PredictAdapter<BsFrame> = (frames, index) => {
  const frame = frames[index]
  if (!frame || frame.phase !== "probe") return null
  const next = frames[index + 1]
  // Останній probe без resolution (теоретично не трапляється, але уникаємо OOB).
  if (!next) return null

  const options: readonly PredictOption[] = [
    { id: "lower", labelKey: "play.predictBinDiscardLower" },
    { id: "upper", labelKey: "play.predictBinDiscardUpper" },
    { id: "found", labelKey: "play.predictBinFound" },
  ]

  let correctId: string
  if (next.phase === "found") {
    correctId = "found"
  } else if (next.phase === "discard") {
    // Відкинутий діапазон [discardLo..discardHi]: якщо він лежить НИЖЧЕ проби —
    // відкидаємо нижню половину; інакше — верхню. mid = frame.mid.
    const mid = frame.mid ?? 0
    correctId = (next.discardHi ?? mid) <= mid ? "lower" : "upper"
  } else {
    return null
  }

  return { promptKey: "play.predictBinPrompt", options, correctId }
}

// — Лінійний пошук ---------------------------------------------------------
//
// Інтрига = кадр `check`. Резолюція = НАСТУПНИЙ кадр (check→match|reject суміжні).

export const linearPredictAdapter: PredictAdapter<LsFrame> = (frames, index) => {
  const frame = frames[index]
  if (!frame || frame.phase !== "check") return null
  const next = frames[index + 1]
  if (!next) return null

  let correctId: string
  if (next.phase === "match") {
    correctId = "match"
  } else if (next.phase === "reject") {
    correctId = "reject"
  } else {
    return null
  }

  const options: readonly PredictOption[] = [
    { id: "match", labelKey: "play.predictLinMatch" },
    { id: "reject", labelKey: "play.predictLinReject" },
  ]
  return { promptKey: "play.predictLinPrompt", options, correctId }
}

// — Краскал (DSU/наївний) --------------------------------------------------
//
// Інтрига = кадр `consider` (sub.kind === "consider", decision === null). На
// відміну від пошуків резолюція НЕ суміжна: між `consider` і accept/reject лежать
// DSU-підкадри (find/compress/union). СКАНУЄМО ВПЕРЕД до першого кадру з тим самим
// consideredEdgeId і non-null decision — це і є «реальний доказ генеричності».

export const kruskalPredictAdapter: PredictAdapter<Frame> = (frames, index) => {
  const frame = frames[index]
  if (!frame || frame.sub.kind !== "consider" || frame.decision !== null) {
    return null
  }
  const edgeId = frame.consideredEdgeId
  if (edgeId == null) return null

  // Скан уперед на той самий edgeId із виставленим рішенням.
  let decision: "accept" | "reject" | null = null
  for (let i = index + 1; i < frames.length; i++) {
    const f = frames[i]
    if (f.consideredEdgeId !== edgeId) break // інше ребро → рішення не виставлене
    if (f.decision != null) {
      decision = f.decision
      break
    }
  }
  if (decision == null) return null

  const options: readonly PredictOption[] = [
    { id: "accept", labelKey: "play.predictKrAccept" },
    { id: "reject", labelKey: "play.predictKrReject" },
  ]
  return { promptKey: "play.predictKrPrompt", options, correctId: decision }
}
