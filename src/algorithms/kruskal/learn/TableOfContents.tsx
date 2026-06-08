import { useMemo } from "react"
import type { TocEntry } from "@/algorithms/kruskal/learn/learn-content"
import { useScrollSpy } from "@/algorithms/kruskal/learn/use-scroll-spy"
import { cn } from "@/lib/utils"

export function TableOfContents({ toc }: { toc: TocEntry[] }) {
  const ids = useMemo(() => toc.map((t) => t.id), [toc])
  const active = useScrollSpy(ids)

  return (
    <nav className="hidden lg:block">
      <div className="sticky top-4 max-h-[calc(100vh-2rem)] overflow-auto">
        <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Зміст
        </div>
        <ul className="space-y-0.5 text-sm">
          {toc.map((t) => (
            <li key={t.id}>
              <a
                href={`#${t.id}`}
                onClick={(e) => {
                  e.preventDefault()
                  document
                    .getElementById(t.id)
                    ?.scrollIntoView({ behavior: "smooth", block: "start" })
                }}
                className={cn(
                  "block rounded px-2 py-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                  active === t.id && "bg-primary/10 font-medium text-foreground",
                )}
              >
                {t.title}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  )
}
