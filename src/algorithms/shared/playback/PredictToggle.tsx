import { Lightbulb } from "lucide-react"
import { useT } from "@/i18n/use-t"
import { usePredictStore } from "@/store/predict-store"
import { cn } from "@/lib/utils"

/**
 * Тумблер режиму «Вгадай рішення». Стан ГЛОБАЛЬНИЙ (predict-store, persist), як
 * lang/theme: один прапорець на всю платформу. Рендериться у `headerExtra`
 * плеєра-пілота; перемикання НЕ скидає курсор (стан поза sig).
 */
export function PredictToggle() {
  const t = useT()
  const enabled = usePredictStore((s) => s.enabled)
  const toggle = usePredictStore((s) => s.toggle)

  return (
    <label
      className={cn(
        "flex w-fit cursor-pointer items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm transition-colors",
        enabled
          ? "border-primary/40 bg-primary/5 text-foreground"
          : "border-border bg-muted/20 text-muted-foreground hover:bg-muted/40",
      )}
    >
      <input
        type="checkbox"
        className="accent-primary"
        checked={enabled}
        onChange={toggle}
      />
      <Lightbulb className={cn("size-4", enabled && "text-primary")} />
      <span className="font-medium">{t("play.predictToggle")}</span>
    </label>
  )
}
