import "katex/dist/katex.min.css"
import { useMemo, useState } from "react"
import Markdown, { type Components } from "react-markdown"
import rehypeKatex from "rehype-katex"
import remarkGfm from "remark-gfm"
import remarkMath from "remark-math"
import { Button } from "@/components/ui/button"
import {
  LEARN_CONTENT,
  parseToc,
  type Lang,
} from "@/algorithms/floyd-warshall/learn/learn-content"
import { MarkdownCode } from "@/algorithms/floyd-warshall/learn/MarkdownCode"
import { TableOfContents } from "@/algorithms/floyd-warshall/learn/TableOfContents"
import { figureForSrc } from "@/algorithms/floyd-warshall/learn/figure-widgets"

export function LearnView() {
  const [lang, setLang] = useState<Lang>("ua")
  const md = LEARN_CONTENT[lang]
  const toc = useMemo(() => parseToc(md), [md])

  const components: Components = useMemo(
    () => ({
      pre: ({ children }) => <>{children}</>,
      h2: ({ children }) => {
        const first = Array.isArray(children) ? children[0] : children
        const m = typeof first === "string" ? /^(\d+)\.\s/.exec(first) : null
        return <h2 id={m ? `sec${m[1]}` : undefined}>{children}</h2>
      },
      code: ({ className, children }) => {
        const match = /language-(\w+)/.exec(className ?? "")
        if (!match) {
          return (
            <code className="not-prose rounded bg-muted px-1 py-0.5 text-[0.85em]">
              {children}
            </code>
          )
        }
        return (
          <MarkdownCode
            lang={match[1]}
            code={String(children).replace(/\n$/, "")}
          />
        )
      },
      img: ({ src, alt }) =>
        figureForSrc(typeof src === "string" ? src : undefined, alt),
      a: ({ href, children }) => {
        if (href === "README.en.md") {
          return (
            <button type="button" className="text-primary underline" onClick={() => setLang("en")}>
              {children}
            </button>
          )
        }
        if (href === "README.ua.md" || href === "README.md") {
          return (
            <button type="button" className="text-primary underline" onClick={() => setLang("ua")}>
              {children}
            </button>
          )
        }
        if (href?.startsWith("#")) {
          return (
            <a
              href={href}
              onClick={(e) => {
                e.preventDefault()
                document
                  .getElementById(href.slice(1))
                  ?.scrollIntoView({ behavior: "smooth" })
              }}
            >
              {children}
            </a>
          )
        }
        return (
          <a href={href} target="_blank" rel="noreferrer">
            {children}
          </a>
        )
      },
    }),
    [],
  )

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-lg font-semibold">Навчальний розбір</h2>
        <div className="flex gap-1">
          <Button size="sm" variant={lang === "ua" ? "default" : "outline"} onClick={() => setLang("ua")}>
            UA
          </Button>
          <Button size="sm" variant={lang === "en" ? "default" : "outline"} onClick={() => setLang("en")}>
            EN
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[210px_minmax(0,1fr)]">
        <TableOfContents toc={toc} />
        <article className="prose prose-sm max-w-none min-w-0 prose-headings:scroll-mt-20 md:prose-base dark:prose-invert">
          <Markdown
            remarkPlugins={[remarkGfm, remarkMath]}
            rehypePlugins={[rehypeKatex]}
            components={components}
          >
            {md}
          </Markdown>
        </article>
      </div>
    </div>
  )
}
