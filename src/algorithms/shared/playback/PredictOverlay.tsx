import { RotateCcw, Lightbulb } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useT } from "@/i18n/use-t"
import { cn } from "@/lib/utils"
import type { PredictController } from "@/algorithms/shared/playback/use-predict"

/**
 * Картка-інтрига режиму «Вгадай рішення». До відповіді — нейтральні кнопки-
 * варіанти; після кліку — зелений/червоний фідбек із ✓/✗ на КОЖНОМУ варіанті
 * (правильний підсвічується завжди, обраний хибний — червоним) і кнопка скидання.
 * Без JS-анімацій — лише `transition-colors`, тож reduced-motion коректний за
 * замовчуванням (розкриття статичне). Рендериться лише коли `controller.question`
 * не null (тумблер увімкнено й кадр — інтрига).
 */
export function PredictOverlay({ controller }: { controller: PredictController }) {
  const t = useT()
  const { question, answeredId, isCorrect, revealed } = controller
  if (question == null) return null

  return (
    <div className="rounded-md border border-primary/40 bg-primary/5 px-3 py-2.5">
      <div className="mb-2 flex items-center gap-1.5 text-sm font-medium">
        <Lightbulb className="size-4 text-primary" />
        {t(question.promptKey)}
      </div>

      <div
        className={cn(
          "grid gap-2",
          question.options.length >= 3 ? "sm:grid-cols-3" : "sm:grid-cols-2",
        )}
      >
        {question.options.map((opt) => {
          const isThisCorrect = opt.id === question.correctId
          const isPicked = answeredId === opt.id
          return (
            <button
              key={opt.id}
              type="button"
              disabled={revealed}
              onClick={() => controller.pick(opt.id)}
              aria-pressed={isPicked}
              className={cn(
                "flex items-center justify-between gap-2 rounded-md border px-2.5 py-2 text-left text-sm transition-colors",
                !revealed && "border-border hover:bg-muted/50",
                revealed &&
                  isThisCorrect &&
                  "border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
                revealed &&
                  !isThisCorrect &&
                  isPicked &&
                  "border-rose-500 bg-rose-500/10 text-rose-700 dark:text-rose-300",
                revealed &&
                  !isThisCorrect &&
                  !isPicked &&
                  "border-border opacity-60",
              )}
            >
              <span>{t(opt.labelKey, opt.labelVars)}</span>
              {revealed && isThisCorrect && <span aria-hidden>✓</span>}
              {revealed && !isThisCorrect && isPicked && <span aria-hidden>✗</span>}
            </button>
          )
        })}
      </div>

      {revealed && (
        <div className="mt-2.5 flex items-center justify-between gap-2">
          <span
            className={cn(
              "text-sm font-medium",
              isCorrect
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-rose-600 dark:text-rose-400",
            )}
          >
            {isCorrect ? t("play.predictRight") : t("play.predictWrong")}
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={controller.reset}
          >
            <RotateCcw />
            {t("play.predictReset")}
          </Button>
        </div>
      )}
    </div>
  )
}
