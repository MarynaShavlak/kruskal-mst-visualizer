import { FileText } from "lucide-react"
import { SearchTargetBadge } from "@/algorithms/shared/playback/SearchTargetBadge"
import { useT } from "@/i18n/use-t"
import { cn } from "@/lib/utils"

// Спільний ввід для всіх рядкових алгоритмів: ТЕКСТ (у якому шукаємо) + ШАБЛОН
// (підрядок). Текст — багаторядкове поле, шаблон — однорядкове, виділене рамкою.
// Пише через колбеки (стор інжектить кожен алгоритм). Підписи/підказки спільні
// (ключі editor.str*), бо в усіх чотирьох методів модель даних однакова.

export function TextPatternEditor({
  text,
  pattern,
  onText,
  onPattern,
  className,
}: {
  text: string
  pattern: string
  onText: (s: string) => void
  onPattern: (s: string) => void
  className?: string
}) {
  const t = useT()
  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {/* Шаблон — те, що шукаємо. */}
      <div className="flex flex-col gap-1">
        <SearchTargetBadge className="w-fit px-2">{t("editor.strPatternLabel")}</SearchTargetBadge>
        <input
          type="text"
          value={pattern}
          aria-label={t("editor.strAriaPattern")}
          onChange={(e) => onPattern(e.target.value)}
          spellCheck={false}
          className="w-full rounded border border-rose-400/60 bg-transparent px-2 py-1.5 font-mono text-sm tabular-nums outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {/* Текст — де шукаємо. */}
      <div className="flex flex-col gap-1">
        <span className="inline-flex w-fit items-center gap-1.5 rounded-md border bg-muted px-2 py-1 text-sm font-medium text-muted-foreground">
          <FileText className="size-3.5" />
          {t("editor.strTextLabel")}
        </span>
        <textarea
          value={text}
          aria-label={t("editor.strAriaText")}
          onChange={(e) => onText(e.target.value)}
          spellCheck={false}
          rows={3}
          className="w-full resize-y rounded border bg-transparent px-2 py-1.5 font-mono text-sm outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      <p className="text-xs text-muted-foreground">
        {t("editor.strLenNote", { n: text.length, m: pattern.length })}
      </p>
    </div>
  )
}
