// Єдиний Shiki-core на весь застосунок. Раніше learn (python+codeToHtml) і
// playback (javascript+codeToTokens) створювали окремі highlighter-и — два core
// в бандлі. Тепер один інстанс із обома мовами й темами; обидва хуки беруть його.

import { createHighlighterCore, type HighlighterCore } from "shiki/core"
import { createJavaScriptRegexEngine } from "shiki/engine/javascript"
import javascript from "shiki/langs/javascript.mjs"
import python from "shiki/langs/python.mjs"
import githubDark from "shiki/themes/github-dark.mjs"
import githubLight from "shiki/themes/github-light.mjs"

let highlighterPromise: Promise<HighlighterCore> | null = null

/** Лінива одноразова ініціалізація спільного highlighter-а. */
export function getHighlighter(): Promise<HighlighterCore> {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighterCore({
      themes: [githubLight, githubDark],
      langs: [python, javascript],
      engine: createJavaScriptRegexEngine({ forgiving: true }),
    })
  }
  return highlighterPromise
}
