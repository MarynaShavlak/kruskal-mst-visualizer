import { CopyCodeButton } from "@/algorithms/shared/learn/CopyCodeButton"
import { useShikiHtml } from "@/algorithms/shared/learn/use-shiki-html"
import { useThemeStore } from "@/store/theme-store"

/**
 * Блок коду навчальної вкладки. Спільне «шасі» (рамка, радіус, відступ, скрол,
 * кнопка копіювання) однакове для обох гілок — підсвіченої Shiki (python) і
 * запасної (```text та інші мови), щоб блоки виглядали як одна родина. Праве
 * поле (`pr-10`) лишає місце під кнопку, щоб вона не перекривала перший рядок.
 */
export function MarkdownCode({ lang, code }: { lang: string; code: string }) {
  const isDark = useThemeStore((s) => s.isDark)
  const html = useShikiHtml(code, lang, isDark)

  return (
    <div className="not-prose group relative my-4">
      <CopyCodeButton code={code} />
      {html ? (
        <div
          className="overflow-auto rounded-lg border text-[13px] leading-relaxed [&_pre]:m-0 [&_pre]:py-3 [&_pre]:pl-3 [&_pre]:pr-10"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      ) : (
        <pre className="overflow-auto rounded-lg border bg-muted/40 py-3 pl-3 pr-10 text-[13px] leading-relaxed">
          <code>{code}</code>
        </pre>
      )}
    </div>
  )
}
