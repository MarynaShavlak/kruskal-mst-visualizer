// Степпер плеєра: чистий reducer над курсором кадрів trace.
// frameCount параметризує кламп (кількість кадрів змінюється з графом).

export interface PlayerState {
  readonly index: number
  readonly isPlaying: boolean
  readonly speedMs: number
}

export type PlayerAction =
  | { type: "play" }
  | { type: "pause" }
  | { type: "toggle" }
  | { type: "next" }
  | { type: "prev" }
  | { type: "seek"; index: number }
  | { type: "reset" }
  | { type: "setSpeed"; speedMs: number }

export const DEFAULT_SPEED_MS = 800

export function initialPlayerState(speedMs: number = DEFAULT_SPEED_MS): PlayerState {
  return { index: 0, isPlaying: false, speedMs }
}

export function makePlayerReducer(
  frameCount: number,
): (state: PlayerState, action: PlayerAction) => PlayerState {
  const last = Math.max(0, frameCount - 1)
  const clamp = (i: number): number => (i < 0 ? 0 : i > last ? last : i)

  return (state, action) => {
    switch (action.type) {
      case "play":
        // У кінці — програти з початку.
        return { ...state, isPlaying: true, index: state.index >= last ? 0 : state.index }
      case "pause":
        return { ...state, isPlaying: false }
      case "toggle":
        return state.isPlaying
          ? { ...state, isPlaying: false }
          : {
              ...state,
              isPlaying: true,
              index: state.index >= last ? 0 : state.index,
            }
      case "next": {
        const index = clamp(state.index + 1)
        return { ...state, index, isPlaying: index >= last ? false : state.isPlaying }
      }
      case "prev":
        return { ...state, index: clamp(state.index - 1), isPlaying: false }
      case "seek":
        return { ...state, index: clamp(action.index), isPlaying: false }
      case "reset":
        return { ...state, index: 0, isPlaying: false }
      case "setSpeed":
        return { ...state, speedMs: action.speedMs }
    }
  }
}
