import { useEffect, useState } from "react"
import type { ShikiTransformer } from "shiki/core"
import { getHighlighter } from "@/algorithms/shared/shiki"

/** Розбирає специфікацію рядків ("3-5,8") у множину 1-based номерів. */
export function parseHighlightLines(spec: string | undefined): Set<number> {
  const out = new Set<number>()
  if (!spec) return out
  for (const part of spec.split(",")) {
    const m = /^\s*(\d+)\s*(?:-\s*(\d+)\s*)?$/.exec(part)
    if (!m) continue
    const a = Number(m[1])
    const b = m[2] ? Number(m[2]) : a
    for (let i = Math.min(a, b); i <= Math.max(a, b); i++) out.add(i)
  }
  return out
}

/**
 * HTML-підсвічування Shiki для python; null поки вантажиться або для інших мов.
 * `highlight` — специфікація рядків ("3-5,8") із meta огорожі (```python {3-5}):
 * відповідні рядки дістають клас `line-hl` (фон малює MarkdownCode).
 */
export function useShikiHtml(
  code: string,
  lang: string,
  dark: boolean,
  highlight?: string,
): string | null {
  const [html, setHtml] = useState<string | null>(null)

  useEffect(() => {
    if (lang !== "python") {
      setHtml(null)
      return
    }
    let cancelled = false
    const lines = parseHighlightLines(highlight)
    const transformers: ShikiTransformer[] = lines.size
      ? [
          {
            name: "learn-line-highlight",
            line(node, line) {
              if (lines.has(line)) this.addClassToHast(node, "line-hl")
            },
          },
        ]
      : []
    void getHighlighter()
      .then((hl) => {
        if (!cancelled) {
          setHtml(
            hl.codeToHtml(code, {
              lang: "python",
              theme: dark ? "github-dark" : "github-light",
              transformers,
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
  }, [code, lang, dark, highlight])

  return html
}
