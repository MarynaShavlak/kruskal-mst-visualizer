import { CopyCodeButton } from "@/algorithms/shared/learn/CopyCodeButton"
import { useShikiHtml } from "@/algorithms/shared/learn/use-shiki-html"
import { cn } from "@/lib/utils"
import { useThemeStore } from "@/store/theme-store"

/**
 * Блок коду навчальної вкладки. Спільне «шасі» (рамка, радіус, відступ, скрол,
 * кнопка копіювання) однакове для обох гілок — підсвіченої Shiki (python) і
 * запасної (```text та інші мови). Праве поле (`pr-10`) лишає місце під кнопку.
 * `highlight` (з meta огорожі, напр. ```python {3-5}) підсвічує окремі рядки —
 * amber-фоном, як активний рядок у плеєрі; `display:grid` на <code> дає фон на
 * всю ширину рядка й прибирає зайві переноси між Shiki-рядками.
 */
export function MarkdownCode({
  lang,
  code,
  highlight,
}: {
  lang: string
  code: string
  highlight?: string
}) {
  const isDark = useThemeStore((s) => s.isDark)
  const html = useShikiHtml(code, lang, isDark, highlight)

  return (
    <div className="not-prose group relative my-4">
      <CopyCodeButton code={code} />
      {html ? (
        <div
          className={cn(
            "overflow-auto rounded-lg border text-[13px] leading-relaxed [&_pre]:m-0 [&_pre]:py-3 [&_pre]:pl-3 [&_pre]:pr-10",
            highlight &&
              "[&_code]:grid [&_.line-hl]:bg-amber-200/70 dark:[&_.line-hl]:bg-amber-400/20",
          )}
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
