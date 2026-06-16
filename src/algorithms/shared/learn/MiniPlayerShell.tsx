import type { ReactNode } from "react"
import { Pause, Play, StepBack, StepForward } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useT } from "@/i18n/use-t"
import type { Player } from "@/algorithms/shared/playback/use-player"

/**
 * Спільна оболонка міні-плеєра для навчальних віджетів: контролери
 * крок±/грати + рядок-нарація. Сам кадр (граф, таблиця, ліс…) — у `children`.
 * Використовується покроковими фігурами всіх алгоритмів.
 */
export function MiniPlayerShell({
  player,
  frameCount,
  caption,
  children,
}: {
  player: Player
  frameCount: number
  caption: string
  children: ReactNode
}) {
  const t = useT()
  return (
    <span className="not-prose my-4 block rounded-lg border bg-card p-3">
      <span className="mb-2 flex flex-wrap items-center gap-2">
        <Button
          size="icon-sm"
          variant="outline"
          onClick={() => player.dispatch({ type: "prev" })}
          disabled={player.index <= 0}
          title={t("play.stepBack")}
        >
          <StepBack />
        </Button>
        <Button
          size="icon"
          onClick={() => player.dispatch({ type: "toggle" })}
          title={player.isPlaying ? t("play.pause") : t("play.play")}
        >
          {player.isPlaying ? <Pause /> : <Play />}
        </Button>
        <Button
          size="icon-sm"
          variant="outline"
          onClick={() => player.dispatch({ type: "next" })}
          disabled={player.index >= frameCount - 1}
          title={t("play.stepForward")}
        >
          <StepForward />
        </Button>
        <span className="text-xs tabular-nums text-muted-foreground">
          {player.index + 1} / {frameCount}
        </span>
      </span>
      <span className="mb-2 block min-h-[2.5em] text-xs text-muted-foreground">
        {caption}
      </span>
      {children}
    </span>
  )
}
