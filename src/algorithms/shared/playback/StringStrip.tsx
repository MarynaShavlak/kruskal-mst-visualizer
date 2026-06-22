import { cn } from "@/lib/utils"

// Спільна СТРІЧКА «текст / шаблон» для всіх рядкових алгоритмів (наївний, KMP,
// Боєра-Мура, Рабіна-Карпа). Верхній ряд — символи тексту; нижній — шаблон, зсунутий
// під поточне вирівнювання `offset`. Колір кожної комірки задає алгоритм через колбеки
// `textRole`/`patternRole` — спільний словник ролей покриває всі чотири методи (збіг,
// розбіжність, вікно, пропущено). Лише <span> (жодного <div>), тож безпечно й усередині
// markdown-фігур навчальної вкладки.

/** Роль символу для кольору — спільна для всіх рядкових алгоритмів. */
export type CharRole = "idle" | "window" | "active" | "match" | "mismatch" | "skipped"

export const CHAR_CLASS: Record<CharRole, string> = {
  idle: "border-border bg-muted/30 text-muted-foreground/50",
  window: "border-sky-500/60 bg-sky-500/10 text-sky-700 dark:text-sky-300",
  active: "border-rose-500 bg-rose-500/20 text-rose-700 dark:text-rose-300",
  match: "border-emerald-500 bg-emerald-500/20 text-emerald-700 dark:text-emerald-300",
  mismatch: "border-red-500 bg-red-500/25 text-red-700 line-through dark:text-red-300",
  skipped: "border-border/60 bg-muted/20 text-muted-foreground/30",
}

const SIZE = {
  sm: "h-7 w-6 text-xs",
  md: "h-9 w-8 text-sm",
} as const

/** Видимий символ: пробіл → «␣», щоб не зливався з порожніми комірками. */
function glyph(ch: string | undefined): string {
  if (ch === undefined) return ""
  if (ch === " ") return "␣"
  return ch
}

function Cell({
  ch,
  role,
  size,
  label,
  pointer,
}: {
  ch: string | undefined
  role: CharRole
  size: "sm" | "md"
  /** Підпис під коміркою (індекс / позиція в шаблоні). */
  label?: string | number
  /** Курсор ▼ над коміркою (поточне порівняння). */
  pointer?: boolean
}) {
  return (
    <span className="inline-flex shrink-0 flex-col items-center gap-0.5">
      <span
        className={cn(
          "leading-none text-rose-500",
          size === "md" ? "text-[10px]" : "text-[9px]",
          pointer ? "opacity-100" : "opacity-0",
        )}
      >
        ▼
      </span>
      <span
        className={cn(
          "inline-flex items-center justify-center rounded border-2 font-mono tabular-nums transition-colors",
          SIZE[size],
          CHAR_CLASS[role],
        )}
      >
        {glyph(ch)}
      </span>
      <span
        className={cn(
          "tabular-nums leading-none text-muted-foreground/50",
          size === "md" ? "text-[9px]" : "text-[8px]",
        )}
      >
        {label ?? ""}
      </span>
    </span>
  )
}

/** Порожня комірка-розпірка (під зсувом шаблону) — тримає вирівнювання колонок. */
function Spacer({ size }: { size: "sm" | "md" }) {
  return (
    <span className="inline-flex shrink-0 flex-col items-center gap-0.5" aria-hidden>
      <span className={size === "md" ? "text-[10px]" : "text-[9px]"}>&nbsp;</span>
      <span className={cn(SIZE[size])} />
      <span className={size === "md" ? "text-[9px]" : "text-[8px]"}>&nbsp;</span>
    </span>
  )
}

export interface StringStripProps {
  readonly text: string
  readonly pattern: string
  /** Зсув шаблону: pattern[0] під text[offset]. -1 → шаблон не показуємо вирівняним. */
  readonly offset: number
  /** Роль символу тексту за індексом. */
  readonly textRole: (idx: number) => CharRole
  /** Роль символу шаблону за позицією. */
  readonly patternRole: (j: number) => CharRole
  /** Індекс тексту під курсором ▼ (поточне порівняння) або null. */
  readonly pointer?: number | null
  /** Підпис нижнього ряду (напр. «шаблон»). */
  readonly patternLabel?: string
  /** Підпис верхнього ряду (напр. «текст»). */
  readonly textLabel?: string
  /** Показувати ряд шаблону (false — лише текст, напр. фаза хешування Рабіна-Карпа). */
  readonly showPattern?: boolean
  readonly size?: "sm" | "md"
}

/**
 * Дворядкова стрічка: текст зверху, шаблон під вирівнюванням `offset`. Колонки
 * вирівняні фіксованою шириною комірок + розпірками. Колір кожної комірки — з колбеків
 * ролей, які задає конкретний алгоритм. Спільна для плеєра й навчальних віджетів.
 */
export function StringStrip({
  text,
  pattern,
  offset,
  textRole,
  patternRole,
  pointer = null,
  patternLabel,
  textLabel,
  showPattern = true,
  size = "md",
}: StringStripProps) {
  const aligned = showPattern && offset >= 0
  return (
    <span className="inline-flex max-w-full flex-col gap-1 overflow-x-auto">
      <span className="inline-flex items-end gap-0.5">
        {textLabel && (
          <span className="mr-1 self-center text-[10px] font-medium text-muted-foreground">
            {textLabel}
          </span>
        )}
        {Array.from(text).map((ch, idx) => (
          <Cell
            key={idx}
            ch={ch}
            role={textRole(idx)}
            size={size}
            label={idx}
            pointer={pointer === idx}
          />
        ))}
      </span>
      {aligned && (
        <span className="inline-flex items-start gap-0.5">
          {patternLabel && (
            <span className="mr-1 self-center text-[10px] font-medium text-muted-foreground">
              {patternLabel}
            </span>
          )}
          {Array.from({ length: offset }).map((_, k) => (
            <Spacer key={`s${k}`} size={size} />
          ))}
          {Array.from(pattern).map((ch, j) => (
            <Cell key={j} ch={ch} role={patternRole(j)} size={size} label={j} />
          ))}
        </span>
      )}
    </span>
  )
}
