import { Panel } from "@/algorithms/shared/playback/Panel"
import { useShikiLines } from "@/algorithms/shared/playback/use-shiki-lines"
import { useT } from "@/i18n/use-t"
import { cn } from "@/lib/utils"
import { useThemeStore } from "@/store/theme-store"

export function CodePanel({
  code,
  activeLines,
  contextLines = [],
  title,
  className,
}: {
  code: readonly string[]
  activeLines: readonly number[]
  /** Охопні рядки (цикли) — тьмяна підсвітка під поточною дією. */
  contextLines?: readonly number[]
  title?: string
  className?: string
}) {
  const isDark = useThemeStore((s) => s.isDark)
  const result = useShikiLines(code, isDark)
  const active = new Set(activeLines)
  const context = new Set(contextLines)
  const t = useT()

  return (
    <Panel title={title ?? t("play.code")} className={className} bodyClassName="p-0">
      <pre
        className="h-full overflow-auto p-2 text-[12.5px] leading-[1.6]"
        style={{ background: result?.bg ?? (isDark ? "#0d1117" : "#ffffff") }}
      >
        <code className="block font-mono">
          {code.map((raw, i) => {
            const ln = i + 1
            const tokens = result?.lines[i]
            return (
              <div
                key={ln}
                className={cn(
                  "flex gap-2 rounded px-1 transition-colors",
                  active.has(ln)
                    ? isDark
                      ? "bg-amber-400/25"
                      : "bg-amber-200/70"
                    : context.has(ln) &&
                        (isDark ? "bg-slate-50/[0.06]" : "bg-slate-500/10"),
                )}
              >
                <span
                  className="w-5 shrink-0 select-none text-right text-[11px]"
                  style={{ color: result?.fg, opacity: 0.4 }}
                >
                  {ln}
                </span>
                <span className="whitespace-pre">
                  {tokens
                    ? tokens.map((t, j) => (
                        <span
                          key={j}
                          style={{
                            color: t.color,
                            fontStyle: (t.fontStyle ?? 0) & 1 ? "italic" : undefined,
                            fontWeight: (t.fontStyle ?? 0) & 2 ? 600 : undefined,
                          }}
                        >
                          {t.content}
                        </span>
                      ))
                    : raw || " "}
                </span>
              </div>
            )
          })}
        </code>
      </pre>
    </Panel>
  )
}
