import { useEffect, useMemo, useState } from "react"
import { getHighlighter } from "@/algorithms/shared/shiki"

export interface CodeToken {
  content: string
  color?: string
  fontStyle?: number
}

export interface ShikiLines {
  lines: CodeToken[][]
  bg: string
  fg: string
}

/** Токенізує код Shiki у рядки токенів (тема залежить від `dark`). */
export function useShikiLines(
  code: readonly string[],
  dark: boolean,
): ShikiLines | null {
  const [result, setResult] = useState<ShikiLines | null>(null)
  const text = useMemo(() => code.join("\n"), [code])

  useEffect(() => {
    let cancelled = false
    void getHighlighter()
      .then((hl) => {
        if (cancelled) return
        const { tokens, bg, fg } = hl.codeToTokens(text, {
          lang: "javascript",
          theme: dark ? "github-dark" : "github-light",
        })
        setResult({
          lines: tokens.map((line) =>
            line.map((t) => ({
              content: t.content,
              color: t.color,
              fontStyle: t.fontStyle,
            })),
          ),
          bg: bg ?? (dark ? "#0d1117" : "#ffffff"),
          fg: fg ?? (dark ? "#e6edf3" : "#1f2328"),
        })
      })
      .catch(() => {
        if (!cancelled) setResult(null)
      })
    return () => {
      cancelled = true
    }
  }, [text, dark])

  return result
}
