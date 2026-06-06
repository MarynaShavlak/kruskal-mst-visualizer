import { useShikiHtml } from "@/features/learn/use-shiki-html"

export function MarkdownCode({ lang, code }: { lang: string; code: string }) {
  const html = useShikiHtml(code, lang)

  if (html) {
    return (
      <div
        className="not-prose my-4 overflow-auto rounded-lg border text-[13px] leading-relaxed [&_pre]:m-0 [&_pre]:p-3"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    )
  }

  return (
    <pre className="not-prose my-4 overflow-auto rounded-lg border bg-muted/40 p-3 text-[13px] leading-relaxed">
      <code>{code}</code>
    </pre>
  )
}
