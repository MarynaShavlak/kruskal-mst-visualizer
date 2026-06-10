import { useEffect, useState } from "react"
import { createHighlighterCore, type HighlighterCore } from "shiki/core"
import { createJavaScriptRegexEngine } from "shiki/engine/javascript"
import python from "shiki/langs/python.mjs"
import githubDark from "shiki/themes/github-dark.mjs"
import githubLight from "shiki/themes/github-light.mjs"

let highlighterPromise: Promise<HighlighterCore> | null = null
function getHighlighter(): Promise<HighlighterCore> {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighterCore({
      themes: [githubLight, githubDark],
      langs: [python],
      engine: createJavaScriptRegexEngine({ forgiving: true }),
    })
  }
  return highlighterPromise
}

/** HTML-підсвічування Shiki для python; null поки вантажиться або для інших мов. */
export function useShikiHtml(
  code: string,
  lang: string,
  dark: boolean,
): string | null {
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
          setHtml(
            hl.codeToHtml(code, {
              lang: "python",
              theme: dark ? "github-dark" : "github-light",
            }),
          )
        }
      })
      .catch(() => {
        if (!cancelled) setHtml(null)
      })
    return () => {
      cancelled = true
    }
  }, [code, lang, dark])

  return html
}
