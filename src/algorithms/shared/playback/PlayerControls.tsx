import { Pause, Play, Share2, SkipBack, StepBack, StepForward } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useT } from "@/i18n/use-t"
import { cn } from "@/lib/utils"
import type { Player } from "@/algorithms/shared/playback/use-player"
import { usePlayerHotkeys } from "@/algorithms/shared/playback/use-player-hotkeys"
import { SPEEDS } from "@/algorithms/shared/playback/speeds"
import type { LabeledPhaseMarker } from "@/algorithms/shared/playback/use-phase-markers"

export function PlayerControls({
  player,
  markers,
  onShareStep,
}: {
  player: Player
  /** Семантичні засічки фаз поверх слайдера (опц. — без них оверлея немає). */
  markers?: readonly LabeledPhaseMarker[]
  /** Дип-лінк на поточний крок (опц. — без нього кнопки share немає). */
  onShareStep?: () => void
}) {
  const { index, isPlaying, speedMs, frameCount, dispatch } = player
  const last = frameCount - 1
  const t = useT()
  usePlayerHotkeys(player)

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

      <div className="relative mx-2 flex min-w-[140px] flex-1 items-center">
        <input
          type="range"
          min={0}
          max={Math.max(0, last)}
          value={index}
          onChange={(e) => dispatch({ type: "seek", index: Number(e.target.value) })}
          className="h-1.5 w-full cursor-pointer accent-primary"
          aria-label={t("play.timeline")}
        />
        {markers && markers.length > 0 && last > 0 && (
          // Шар засічок: контейнер НЕ перехоплює кліки (слайдер лишається тягучим),
          // лише самі кнопки-засічки клікабельні (pointer-events:auto).
          <div className="pointer-events-none absolute inset-0">
            {markers.map((m) => (
              <button
                key={m.index}
                type="button"
                title={t("play.jumpToPhase", { phase: m.label })}
                onClick={() => dispatch({ type: "seek", index: m.index })}
                style={{ left: `${m.leftPct}%` }}
                className={cn(
                  "pointer-events-auto absolute top-1/2 h-3 w-1 -translate-x-1/2 -translate-y-1/2 cursor-pointer rounded-sm border border-background",
                  m.cls ?? "bg-primary/70",
                )}
              />
            ))}
          </div>
        )}
      </div>
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

      {onShareStep && (
        <Button
          size="icon-sm"
          variant="outline"
          onClick={onShareStep}
          title={t("play.shareStep")}
        >
          <Share2 />
        </Button>
      )}
    </div>
  )
}
