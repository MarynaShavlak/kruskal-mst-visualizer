import { useEffect } from "react"
import type { Player } from "@/algorithms/shared/playback/use-player"
import { SPEEDS } from "@/algorithms/shared/playback/speeds"

// Чи фокус у редагованому полі — тоді клавіші плеєра пропускаємо
// (поряд range-слайдер, ArrayEditor/TextPatternEditor тощо).
function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  const tag = target.tagName
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true
  if (target.isContentEditable) return true
  if (target.getAttribute("role") === "textbox") return true
  return false
}

/**
 * Глобальні гарячі клавіші плеєра поверх reducer-екшенів.
 * Space — грати/пауза, ←/→ — крок, Home/End — на старт/кінець,
 * Digit1/2/3 — пресети швидкості (SPEEDS). Працює лише поки змонтований
 * `PlayerControls` (один на сторінку); guard пропускає поля вводу.
 *
 * Залежності ефекту — стабільні `dispatch` + `frameCount` (НЕ весь `player`:
 * `usePlayer` повертає свіжий об'єкт щорендеру, тож `[player]` переписував би
 * підписку на кожен кадр).
 */
export function usePlayerHotkeys(player: Player): void {
  const { dispatch, frameCount } = player

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent): void => {
      if (e.defaultPrevented) return
      if (e.altKey || e.ctrlKey || e.metaKey) return
      if (isEditableTarget(e.target)) return

      switch (e.code) {
        case "Space":
          e.preventDefault()
          dispatch({ type: "toggle" })
          break
        case "ArrowRight":
          e.preventDefault()
          dispatch({ type: "next" })
          break
        case "ArrowLeft":
          e.preventDefault()
          dispatch({ type: "prev" })
          break
        case "Home":
          e.preventDefault()
          dispatch({ type: "reset" })
          break
        case "End":
          e.preventDefault()
          dispatch({ type: "seek", index: frameCount - 1 })
          break
        case "Digit1":
        case "Digit2":
        case "Digit3": {
          const speed = SPEEDS[Number(e.code.slice(5)) - 1]
          if (speed) {
            e.preventDefault()
            dispatch({ type: "setSpeed", speedMs: speed.ms })
          }
          break
        }
      }
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [dispatch, frameCount])
}
