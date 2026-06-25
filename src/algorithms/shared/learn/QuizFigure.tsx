import { useState, type ReactNode } from "react"
import { RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useT } from "@/i18n/use-t"
import { useLangStore } from "@/store/lang-store"
import { cn } from "@/lib/utils"
import {
  isOptionCorrect,
  type BilingualText,
  type QuizSpec,
} from "@/algorithms/shared/learn/quiz-types"

// Data-driven MCQ-чекпойнт навчальної вкладки. Узагальнює єдиний прецедент
// (квіз max-купи) у перевикористовуваний віджет із МИТТЄВИМ фідбеком і АДРЕСНИМ
// поясненням КОЖНОГО хибного варіанта (а не лише обраного). Без JS-анімацій —
// тільки `transition-colors`, тож reduced-motion коректний за замовчуванням.

/** Чи це двомовний рядок {ua,en} (а не готовий ReactNode-підпис). */
function isBilingual(x: ReactNode | BilingualText): x is BilingualText {
  return (
    typeof x === "object" &&
    x !== null &&
    "ua" in x &&
    "en" in x &&
    typeof (x as BilingualText).ua === "string"
  )
}

/**
 * Спільний MCQ-віджет. Приймає декларативний `QuizSpec`; коректність варіанта —
 * `option.correct` або `spec.correctPredicate(payload)`. Один обраний варіант:
 * підсвічуємо зелено/червоно й показуємо адресне пояснення; під вердиктом —
 * кнопка скидання. `caption` — підпис фігури (alt із markdown).
 */
export function QuizFigure<P>({
  spec,
  caption,
}: {
  spec: QuizSpec<P>
  caption?: string
}) {
  const t = useT()
  const lang = useLangStore((s) => s.lang)
  const [picked, setPicked] = useState<string | null>(null)

  const pick = (ua: string, en: string) => (lang === "ua" ? ua : en)
  const text = (x: BilingualText) => pick(x.ua, x.en)
  const renderLabel = (label: ReactNode | BilingualText): ReactNode =>
    isBilingual(label) ? text(label) : label

  const pickedOption = picked
    ? spec.options.find((o) => o.id === picked) ?? null
    : null
  const pickedCorrect = pickedOption
    ? isOptionCorrect(pickedOption, spec.correctPredicate)
    : false

  return (
    <span className="not-prose my-4 block overflow-x-auto rounded-lg border bg-card p-3">
      <span className="mb-2 block text-center text-xs font-medium">
        {text(spec.prompt)}
      </span>

      <span className="grid gap-3 sm:grid-cols-3">
        {spec.options.map((opt) => {
          const valid = isOptionCorrect(opt, spec.correctPredicate)
          const isPicked = picked === opt.id
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => setPicked(opt.id)}
              aria-pressed={isPicked}
              className={cn(
                "block rounded-md border p-2 text-left transition-colors",
                isPicked
                  ? valid
                    ? "border-emerald-500 bg-emerald-500/10"
                    : "border-rose-500 bg-rose-500/10"
                  : "border-border hover:bg-muted/40",
              )}
            >
              <span className="mb-1 flex items-center justify-between text-xs font-semibold">
                <span>{opt.id}</span>
                {isPicked && (
                  <span
                    className={
                      valid
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-rose-600 dark:text-rose-400"
                    }
                  >
                    {valid ? t("learn.quizCorrect") : t("learn.quizWrong")}
                  </span>
                )}
              </span>
              {renderLabel(opt.label)}
            </button>
          )
        })}
      </span>

      {pickedOption === null ? (
        <span className="mt-2 block text-center text-[11px] text-muted-foreground">
          {t("learn.quizPickHint")}
        </span>
      ) : (
        <span className="mt-3 block">
          <span
            className={cn(
              "block text-center text-xs font-medium",
              pickedCorrect
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-rose-600 dark:text-rose-400",
            )}
          >
            {pickedCorrect ? t("learn.quizVerdictRight") : t("learn.quizVerdictWrong")}
          </span>
          <span className="mt-1 block text-center text-[11px] text-muted-foreground">
            <b>{t("learn.quizWhy")}</b> {text(pickedOption.explain)}
          </span>
          <span className="mt-3 flex justify-center">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setPicked(null)}
            >
              <RotateCcw />
              {t("learn.quizReset")}
            </Button>
          </span>
        </span>
      )}

      {caption && (
        <span className="mt-2 block text-center text-xs text-muted-foreground">
          {caption}
        </span>
      )}
    </span>
  )
}
