import { useEffect, useMemo, useReducer } from "react"
import {
  initialPlayerState,
  makePlayerReducer,
  type PlayerAction,
  type PlayerState,
} from "@/algorithms/shared/playback/player"

export interface Player extends PlayerState {
  readonly frameCount: number
  dispatch: (action: PlayerAction) => void
}

/**
 * Курсор по кадрах trace. `resetKey` (напр. сам trace) скидає курсор на 0
 * при зміні графа/алгоритму; інтервал просуває курсор під час відтворення.
 */
export function usePlayer(frameCount: number, resetKey: unknown): Player {
  const reducer = useMemo(() => makePlayerReducer(frameCount), [frameCount])
  const [state, dispatch] = useReducer(reducer, initialPlayerState())

  useEffect(() => {
    dispatch({ type: "reset" })
  }, [resetKey])

  useEffect(() => {
    if (!state.isPlaying) return
    const id = window.setInterval(() => dispatch({ type: "next" }), state.speedMs)
    return () => window.clearInterval(id)
  }, [state.isPlaying, state.speedMs])

  return { ...state, frameCount, dispatch }
}
