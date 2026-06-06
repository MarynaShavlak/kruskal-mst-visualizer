import { useEffect, useMemo, useState } from "react"
// Дрібнозерниста збірка Shiki: лише JS-граматика + одна тема + JS-движок
// (без WASM і без сотень інших мов у бандлі).
import { createHighlighterCore, type HighlighterCore } from "shiki/core"
import { createJavaScriptRegexEngine } from "shiki/engine/javascript"
import javascript from "shiki/langs/javascript.mjs"
import githubLight from "shiki/themes/github-light.mjs"

export interface CodeToken {
  content: string
  color?: string
  fontStyle?: number
}

let highlighterPromise: Promise<HighlighterCore> | null = null
function getHighlighter(): Promise<HighlighterCore> {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighterCore({
      themes: [githubLight],
      langs: [javascript],
      engine: createJavaScriptRegexEngine(),
    })
  }
  return highlighterPromise
}

/** Токенізує код Shiki у рядки токенів; null поки highlighter вантажиться. */
export function useShikiLines(code: readonly string[]): CodeToken[][] | null {
  const [lines, setLines] = useState<CodeToken[][] | null>(null)
  const text = useMemo(() => code.join("\n"), [code])

  useEffect(() => {
    let cancelled = false
    void getHighlighter()
      .then((hl) => {
        if (cancelled) return
        const { tokens } = hl.codeToTokens(text, {
          lang: "javascript",
          theme: "github-light",
        })
        setLines(
          tokens.map((line) =>
            line.map((t) => ({
              content: t.content,
              color: t.color,
              fontStyle: t.fontStyle,
            })),
          ),
        )
      })
      .catch(() => {
        if (!cancelled) setLines(null)
      })
    return () => {
      cancelled = true
    }
  }, [text])

  return lines
}
