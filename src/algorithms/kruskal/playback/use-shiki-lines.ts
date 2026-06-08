import { useEffect, useMemo, useState } from "react"
import { createHighlighterCore, type HighlighterCore } from "shiki/core"
import { createJavaScriptRegexEngine } from "shiki/engine/javascript"
import javascript from "shiki/langs/javascript.mjs"
import githubDark from "shiki/themes/github-dark.mjs"
import githubLight from "shiki/themes/github-light.mjs"

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

let highlighterPromise: Promise<HighlighterCore> | null = null
function getHighlighter(): Promise<HighlighterCore> {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighterCore({
      themes: [githubLight, githubDark],
      langs: [javascript],
      engine: createJavaScriptRegexEngine({ forgiving: true }),
    })
  }
  return highlighterPromise
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
