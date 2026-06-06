import { Panel } from "@/features/playback/Panel"
import { useShikiLines } from "@/features/playback/use-shiki-lines"
import { cn } from "@/lib/utils"

export function CodePanel({
  code,
  activeLines,
  title = "Код (DSU)",
  className,
}: {
  code: readonly string[]
  activeLines: readonly number[]
  title?: string
  className?: string
}) {
  const lines = useShikiLines(code)
  const active = new Set(activeLines)

  return (
    <Panel title={title} className={className} bodyClassName="p-0">
      <pre className="h-full overflow-auto bg-white p-2 text-[12.5px] leading-[1.6]">
        <code className="block font-mono">
          {code.map((raw, i) => {
            const ln = i + 1
            const tokens = lines?.[i]
            return (
              <div
                key={ln}
                className={cn(
                  "flex gap-2 rounded px-1",
                  active.has(ln) && "bg-amber-200/70",
                )}
              >
                <span className="w-5 shrink-0 select-none text-right text-[11px] text-muted-foreground/50">
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
