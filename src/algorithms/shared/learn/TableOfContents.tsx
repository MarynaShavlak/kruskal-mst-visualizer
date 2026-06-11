import { useMemo } from "react"
import type { TocEntry } from "@/algorithms/shared/learn/learn-content"
import { useScrollSpy } from "@/algorithms/shared/learn/use-scroll-spy"
import { useT } from "@/i18n/use-t"
import { cn } from "@/lib/utils"

/** Посилання змісту: плавний скрол до заголовка + підсвітка активного. */
function TocLink({
  entry,
  active,
  nested = false,
}: {
  entry: TocEntry
  active: boolean
  nested?: boolean
}) {
  return (
    <a
      href={`#${entry.id}`}
      onClick={(e) => {
        e.preventDefault()
        // На мобільному закриваємо згортний <details>, щоб меню не лишалось
        // розгорнутим поверх контенту (на десктопі ancestor-details немає — no-op).
        e.currentTarget.closest("details")?.removeAttribute("open")
        document
          .getElementById(entry.id)
          ?.scrollIntoView({ behavior: "smooth", block: "start" })
      }}
      className={cn(
        "block rounded px-2 py-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
        nested && "text-[0.8rem]",
        active && "bg-primary/10 font-medium text-foreground",
      )}
    >
      {entry.title}
    </a>
  )
}

/** Вкладений список секцій (H3 розкриваються під активною). Спільний для
 *  десктопного сайдбара і мобільного disclosure. */
function TocList({ toc, active }: { toc: TocEntry[]; active: string | null }) {
  return (
    <ul className="space-y-0.5 text-sm">
      {toc.map((section) => {
        const children = section.children ?? []
        // H3 показуємо лише під активною секцією — інакше зміст довгих
        // розборів був би надто розлогим.
        const open =
          active === section.id || children.some((c) => c.id === active)
        return (
          <li key={section.id}>
            <TocLink entry={section} active={active === section.id} />
            {open && children.length > 0 && (
              <ul className="mt-0.5 ml-3 space-y-0.5 border-l border-border pl-2">
                {children.map((child) => (
                  <li key={child.id}>
                    <TocLink entry={child} active={active === child.id} nested />
                  </li>
                ))}
              </ul>
            )}
          </li>
        )
      })}
    </ul>
  )
}

export function TableOfContents({ toc }: { toc: TocEntry[] }) {
  const t = useT()
  // Плаский список усіх id (H2 + H3) у порядку документа — для scroll-spy.
  const ids = useMemo(
    () => toc.flatMap((s) => [s.id, ...(s.children ?? []).map((c) => c.id)]),
    [toc],
  )
  const active = useScrollSpy(ids)

  // Один grid-елемент (інакше зламає 2-колонкову сітку LearnView): мобільний
  // disclosure + десктопний липкий сайдбар, видимі взаємовиключно за брейкпоінтом.
  return (
    <div>
      <details className="rounded-lg border bg-card lg:hidden">
        <summary className="cursor-pointer select-none px-3 py-2 text-sm font-medium">
          {t("toc.title")}
        </summary>
        <div className="max-h-[60vh] overflow-auto border-t px-3 py-2">
          <TocList toc={toc} active={active} />
        </div>
      </details>

      <nav className="hidden lg:block">
        <div className="sticky top-4 max-h-[calc(100vh-2rem)] overflow-auto">
          <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {t("toc.title")}
          </div>
          <TocList toc={toc} active={active} />
        </div>
      </nav>
    </div>
  )
}
