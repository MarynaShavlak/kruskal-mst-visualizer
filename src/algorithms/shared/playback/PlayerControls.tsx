import { Pause, Play, SkipBack, StepBack, StepForward } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useT } from "@/i18n/use-t"
import type { Player } from "@/algorithms/shared/playback/use-player"

const SPEEDS = [
  { label: "0.5×", ms: 1500 },
  { label: "1×", ms: 800 },
  { label: "2×", ms: 380 },
]

export function PlayerControls({ player }: { player: Player }) {
  const { index, isPlaying, speedMs, frameCount, dispatch } = player
  const last = frameCount - 1
  const t = useT()

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        size="icon-sm"
        variant="outline"
        onClick={() => dispatch({ type: "reset" })}
        title={t("play.toStart")}
      >
        <SkipBack />
      </Button>
      <Button
        size="icon-sm"
        variant="outline"
        onClick={() => dispatch({ type: "prev" })}
        disabled={index <= 0}
        title={t("play.stepBack")}
      >
        <StepBack />
      </Button>
      <Button
        size="icon"
        onClick={() => dispatch({ type: "toggle" })}
        title={isPlaying ? t("play.pause") : t("play.play")}
      >
        {isPlaying ? <Pause /> : <Play />}
      </Button>
      <Button
        size="icon-sm"
        variant="outline"
        onClick={() => dispatch({ type: "next" })}
        disabled={index >= last}
        title={t("play.stepForward")}
      >
        <StepForward />
      </Button>

      <input
        type="range"
        min={0}
        max={Math.max(0, last)}
        value={index}
        onChange={(e) => dispatch({ type: "seek", index: Number(e.target.value) })}
        className="mx-2 h-1.5 min-w-[140px] flex-1 cursor-pointer accent-primary"
        aria-label={t("play.timeline")}
      />
      <span className="tabular-nums text-sm text-muted-foreground">
        {index + 1} / {frameCount}
      </span>

      <div className="ml-2 flex items-center gap-1">
        {SPEEDS.map((s) => (
          <Button
            key={s.ms}
            size="sm"
            variant={speedMs === s.ms ? "default" : "outline"}
            onClick={() => dispatch({ type: "setSpeed", speedMs: s.ms })}
          >
            {s.label}
          </Button>
        ))}
      </div>
    </div>
  )
}
