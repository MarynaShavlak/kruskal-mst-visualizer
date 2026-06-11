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

export function TableOfContents({ toc }: { toc: TocEntry[] }) {
  const t = useT()
  // Плаский список усіх id (H2 + H3) у порядку документа — для scroll-spy.
  const ids = useMemo(
    () => toc.flatMap((s) => [s.id, ...(s.children ?? []).map((c) => c.id)]),
    [toc],
  )
  const active = useScrollSpy(ids)

  return (
    <nav className="hidden lg:block">
      <div className="sticky top-4 max-h-[calc(100vh-2rem)] overflow-auto">
        <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {t("toc.title")}
        </div>
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
      </div>
    </nav>
  )
}
