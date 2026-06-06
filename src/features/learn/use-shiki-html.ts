import { useEffect, useState } from "react"
import { createHighlighterCore, type HighlighterCore } from "shiki/core"
import { createJavaScriptRegexEngine } from "shiki/engine/javascript"
import python from "shiki/langs/python.mjs"
import githubLight from "shiki/themes/github-light.mjs"

let highlighterPromise: Promise<HighlighterCore> | null = null
function getHighlighter(): Promise<HighlighterCore> {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighterCore({
      themes: [githubLight],
      langs: [python],
      engine: createJavaScriptRegexEngine({ forgiving: true }),
    })
  }
  return highlighterPromise
}

/** HTML-підсвічування Shiki для python; null поки вантажиться або для інших мов. */
export function useShikiHtml(code: string, lang: string): string | null {
  const [html, setHtml] = useState<string | null>(null)

  useEffect(() => {
    if (lang !== "python") {
      setHtml(null)
      return
    }
    let cancelled = false
    void getHighlighter()
      .then((hl) => {
        if (!cancelled) {
          setHtml(hl.codeToHtml(code, { lang: "python", theme: "github-light" }))
        }
      })
      .catch(() => {
        if (!cancelled) setHtml(null)
      })
    return () => {
      cancelled = true
    }
  }, [code, lang])

  return html
}
