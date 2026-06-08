import { useShikiHtml } from "@/algorithms/kruskal/learn/use-shiki-html"
import { useThemeStore } from "@/store/theme-store"

export function MarkdownCode({ lang, code }: { lang: string; code: string }) {
  const isDark = useThemeStore((s) => s.isDark)
  const html = useShikiHtml(code, lang, isDark)

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
