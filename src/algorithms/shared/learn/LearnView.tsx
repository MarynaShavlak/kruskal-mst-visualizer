import "katex/dist/katex.min.css"
import { useMemo, type ReactNode } from "react"
import Markdown, { type Components } from "react-markdown"
import rehypeKatex from "rehype-katex"
import remarkGfm from "remark-gfm"
import remarkMath from "remark-math"
import { parseToc, type Lang } from "@/algorithms/shared/learn/learn-content"
import { useT } from "@/i18n/use-t"
import { useLangStore } from "@/store/lang-store"
import { MarkdownCode } from "@/algorithms/shared/learn/MarkdownCode"
import { TableOfContents } from "@/algorithms/shared/learn/TableOfContents"

/**
 * Спільна навчальна вкладка: README через react-markdown із TOC, scroll-spy,
 * підсвіткою коду (Shiki), KaTeX і перемикачем UA/EN. Алгоритмо-специфічне
 * інжектиться пропсами: `content` — сирий markdown (UA/EN), `figureForSrc` —
 * мапить `<img>` із README у живі віджети відповідного розділу.
 */
export function LearnView({
  content,
  figureForSrc,
}: {
  content: Record<Lang, string>
  figureForSrc: (src: string | undefined, alt: string | undefined) => ReactNode
}) {
  const lang = useLangStore((s) => s.lang)
  const setLang = useLangStore((s) => s.setLang)
  const t = useT()
  const md = content[lang]
  const toc = useMemo(() => parseToc(md), [md])
  // Карта «рядок markdown → id заголовка» з того самого parseToc — id у статті
  // збігаються з id у TOC (зокрема для дедуплікованих slug-id H3).
  const idByLine = useMemo(() => {
    const map = new Map<number, string>()
    for (const section of toc) {
      map.set(section.line, section.id)
      for (const child of section.children ?? []) map.set(child.line, child.id)
    }
    return map
  }, [toc])

  const components: Components = useMemo(
    () => ({
      pre: ({ children }) => <>{children}</>,
      // Фігуру-зображення react-markdown загортає в <p>, але живі віджети —
      // блокові (svg/таблиці/панелі плеєра). Розгортаємо такий абзац, щоб не
      // вкладати блок у <p> (інакше браузер «рве» розмітку → DOM-warning).
      p: ({ node, children }) => {
        const hasFigure = node?.children?.some(
          (c) => c.type === "element" && c.tagName === "img",
        )
        return hasFigure ? <>{children}</> : <p>{children}</p>
      },
      h2: ({ node, children }) => {
        const line = node?.position?.start.line
        return <h2 id={line != null ? idByLine.get(line) : undefined}>{children}</h2>
      },
      h3: ({ node, children }) => {
        const line = node?.position?.start.line
        return <h3 id={line != null ? idByLine.get(line) : undefined}>{children}</h3>
      },
      code: ({ node, className, children }) => {
        const match = /language-(\w+)/.exec(className ?? "")
        if (!match) {
          return (
            <code className="not-prose rounded bg-muted px-1 py-0.5 text-[0.85em]">
              {children}
            </code>
          )
        }
        // Підсвітка рядків із meta огорожі: ```python {3-5,8}
        const meta = (node?.data as { meta?: string } | undefined)?.meta
        const highlight = meta ? /\{([\d,\s-]+)\}/.exec(meta)?.[1] : undefined
        return (
          <MarkdownCode
            lang={match[1]}
            code={String(children).replace(/\n$/, "")}
            highlight={highlight}
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
    [figureForSrc, idByLine],
  )

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold">{t("learn.heading")}</h2>

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
