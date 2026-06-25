// Дип-лінк на конкретний крок плеєра: `<algoId>/playback?g=…&step=N&mode=X`.
//
// Прихована основна робота: плеєр читає ТІЛЬКИ стор, а `?g=` досі вантажився лише
// в редакторі. Цей generic-хук сам відновлює спільний документ із `?g=` (як
// `useDocEditorActions`), застосовує `?mode=` (якщо валідний), і ПІСЛЯ готовності
// trace перемотує курсор на `?step=`. Плюс віддає `shareStep()` — кнопку «Поділитися
// кроком» (URL поточного документа+кроку+режиму у буфер + адрес-бар).
//
// ⚠️ Гонка trace-готовності. `sig` (`${mode}|...`) — resetKey для usePlayer: зміна
// mode синхронно міняє sig, а reset-ефект usePlayer скидає курсор на 0 ПІСЛЯ render.
// usePlayer викликається у view ДО цього хука → його reset-ефект зареєстрований
// раніше й виконується раніше за наш seek-ефект у тому ж коміті. Тож ми чекаємо, поки
// (а) mode пропагувався у sig і (б) frameCount показує реальний trace (>1), і лише тоді
// перемотуємо. pendingStep НЕ скидаємо, доки trace не готовий, інакше empty/fallback-
// trace (frameCount===1) з'їв би крок.

import { useCallback, useEffect, useRef } from "react"
import type { DocCodec } from "@/algorithms/shared/editor/doc-codec"
import {
  readGraphParam,
  readModeParam,
  readStepParam,
} from "@/algorithms/shared/editor/use-graph-editor"
import { setHashWithQuery } from "@/hooks/use-route"
import { tr } from "@/i18n/use-t"
import { toast } from "@/store/toast-store"
import type { Player } from "@/algorithms/shared/playback/use-player"

// Спільний документ із URL-хеша відновлюємо лише раз за сесію сторінки — окремо на
// кожен маршрут плеєра (ключ = routePath), щоб алгоритми не блокували один одного й
// щоб переходи між вкладками не перезатирали ручні зміни курсора.
const loadedRoutes = new Set<string>()

/** Тестовий гачок: скидає одноразовий guard (інакше другий рендер у тесті не відновлює). */
export function resetPlaybackDeeplinkGuard(): void {
  loadedRoutes.clear()
}

export interface PlaybackDeeplinkOptions<Doc, M extends string> {
  /** Курсор плеєра (frameCount/index/dispatch). */
  readonly player: Player
  /** Кодек документа (encodeHash/decodeHash) поточного алгоритму. */
  readonly codec: DocCodec<Doc>
  /** Завантажити документ у стор (з `?g=`). */
  readonly loadDoc: (doc: Doc) => void
  /** Знімок поточного документа стору (для share). */
  readonly toDoc: () => Doc
  /** Поточний режим плеєра (порожній рядок, якщо алгоритм без режиму). */
  readonly mode: M | ""
  /** Застосувати режим із `?mode=` (no-op, якщо алгоритм без режиму). */
  readonly setMode: (mode: M) => void
  /** Валідні ключі режиму. Порожній масив → `?mode=` не пишеться й ігнорується. */
  readonly modeKeys: readonly M[]
  /** Шлях плеєра, напр. `linear-search/playback`. */
  readonly routePath: string
}

export interface PlaybackDeeplink {
  /** Зібрати дип-лінк на поточний крок, оновити адрес-бар і скопіювати в буфер. */
  readonly shareStep: () => void
}

/**
 * Дип-лінк плеєра. Викликати у PlaybackView ПІСЛЯ `usePlayer` (порядок ефектів важливий
 * для гонки reset↔seek). `<M extends string>` — будь-який рядковий union режиму.
 */
export function usePlaybackDeeplink<Doc, M extends string>(
  opts: PlaybackDeeplinkOptions<Doc, M>,
): PlaybackDeeplink {
  const { player, codec, loadDoc, toDoc, mode, setMode, modeKeys, routePath } = opts
  const { frameCount, dispatch } = player

  // Стартовий крок із `?step=`, що чекає готовності trace. -1 = немає очікуваного кроку.
  const pendingStepRef = useRef<number>(-1)
  // Режим із `?mode=`, який мусить «осісти» у `mode` ПЕРЕД seek (інакше зміна mode
  // змінить sig → usePlayer-reset скине курсор уже ПІСЛЯ нашого seek і з'їсть його).
  // null — режим не запитували з URL, чекати нема на що.
  const pendingModeRef = useRef<M | null>(null)

  // Одноразове відновлення з хеша: документ (?g=) + режим (?mode=) + відкладений крок (?step=).
  useEffect(() => {
    if (loadedRoutes.has(routePath)) return
    loadedRoutes.add(routePath)

    const hash = window.location.hash
    const param = readGraphParam(hash)
    if (param) {
      const doc = codec.decodeHash(param)
      if (doc) loadDoc(doc)
    }

    const modeParam = readModeParam(hash)
    if (modeParam && (modeKeys as readonly string[]).includes(modeParam)) {
      pendingModeRef.current = modeParam as M
      setMode(modeParam as M)
    }

    const step = readStepParam(hash)
    if (step !== null) pendingStepRef.current = step
    // Намір — відновлення лише на маунт за routePath; решта залежностей стабільні.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routePath])

  // Перемотування на відкладений крок ПІСЛЯ готовності trace. Чекаємо, поки (а)
  // запитаний режим осів у `mode` (sig стабілізувався, usePlayer-reset відпрацював) і
  // (б) frameCount показує реальний trace (>1). Залежність [frameCount, mode] будить
  // ефект на КОЖНІЙ зі змін, тож ми ловимо момент, коли обидві умови виконані.
  useEffect(() => {
    if (pendingStepRef.current < 0) return
    if (frameCount <= 1) return // empty/fallback trace — крок ще не «справжній»
    if (pendingModeRef.current !== null && mode !== pendingModeRef.current) return
    dispatch({ type: "seek", index: pendingStepRef.current }) // reducer клампить
    pendingStepRef.current = -1
    pendingModeRef.current = null
  }, [frameCount, mode, dispatch])

  const shareStep = useCallback(() => {
    const g = codec.encodeHash(toDoc())
    const params: Record<string, string | undefined> = {
      g,
      step: String(player.index),
    }
    if (modeKeys.length > 0 && mode !== "") params.mode = mode
    setHashWithQuery(routePath, params)
    // Базова для deploy URL — pathname (project-site base-path), не origin+search.
    const url = `${window.location.origin}${window.location.pathname}#${routePath}?${new URLSearchParams(
      Object.fromEntries(
        Object.entries(params).filter((e): e is [string, string] => e[1] != null),
      ),
    ).toString()}`
    void navigator.clipboard?.writeText(url).then(
      () => toast({ description: tr("editor.linkCopied") }),
      () => undefined,
    )
  }, [codec, toDoc, player.index, mode, modeKeys, routePath])

  return { shareStep }
}
