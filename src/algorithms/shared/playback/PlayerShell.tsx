import type { ReactNode } from "react"
import { PlayerControls } from "@/algorithms/shared/playback/PlayerControls"
import type { Player } from "@/algorithms/shared/playback/use-player"
import { useT } from "@/i18n/use-t"

/**
 * Каркас одиночного плеєра, спільний для обох алгоритмів: контроли, рядок-нарація
 * «Крок i/n» і дві 3-колонкові сітки панелей. Усе, що залежить від кадру (панелі,
 * статистики, бейдж), передається слотами — `usePlayer` і похідні `useMemo` тримає
 * виклик, тож каркас лишається суто презентаційним.
 */
export function PlayerShell({
  player,
  caption,
  captionBadge,
  headerExtra,
  statsBar,
  predictSlot,
  panels,
  secondRow,
}: {
  player: Player
  /** Нарація поточного кадру (після префікса «Крок i/n.»). */
  caption: ReactNode
  /** Необов'язковий бейдж у рядку нарації (напр. «від'ємний цикл»). */
  captionBadge?: ReactNode
  /** Слот над контролами (напр. тумблери оптимізацій DSU). */
  headerExtra?: ReactNode
  /** Слот рядка-статистики між нарацією і панелями. */
  statsBar?: ReactNode
  /** Слот «Вгадай рішення» між статистикою й панелями (опц. — інші плеєри не ламаються). */
  predictSlot?: ReactNode
  /** Перша 3-колонкова сітка (граф/код/третя панель). */
  panels: ReactNode
  /** Друга 3-колонкова сітка (таблиця рішень / журнал + підсумок). */
  secondRow?: ReactNode
}) {
  const t = useT()
  return (
    <div className="flex flex-col gap-3">
      {headerExtra}
      <PlayerControls player={player} />

      <div className="rounded-md border bg-muted/30 px-3 py-2 text-sm">
        <span className="font-medium">
          {t("play.step")} {player.index + 1}/{player.frameCount}.
        </span>{" "}
        {caption}
        {captionBadge}
      </div>

      {statsBar}

      {predictSlot}

      <div className="grid gap-3 lg:grid-cols-3">{panels}</div>

      {secondRow != null && secondRow !== false && (
        <div className="grid gap-3 lg:grid-cols-3">{secondRow}</div>
      )}
    </div>
  )
}
