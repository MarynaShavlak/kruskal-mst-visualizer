import { Construction } from "lucide-react"
import type { Algorithm } from "@/algorithms/types"

/** Екран-заглушка для алгоритмів зі status="soon". */
export function ComingSoon({ algorithm }: { algorithm: Algorithm }) {
  const Icon = algorithm.icon
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center gap-6 py-16 text-center">
      <div className="relative">
        <span className="flex size-20 items-center justify-center rounded-2xl bg-muted text-foreground/80">
          <Icon className="size-9" />
        </span>
        <span className="absolute -right-2 -bottom-2 flex size-8 items-center justify-center rounded-full bg-amber-500/15 text-amber-600 ring-2 ring-background dark:text-amber-400">
          <Construction className="size-4" />
        </span>
      </div>

      <div className="space-y-2">
        <h2 className="text-2xl font-semibold">{algorithm.name}</h2>
        <p className="text-muted-foreground">{algorithm.tagline}</p>
      </div>

      <p className="inline-flex items-center gap-2 rounded-full bg-amber-500/10 px-3 py-1 text-sm font-medium text-amber-700 dark:text-amber-400">
        У розробці — незабаром
      </p>

      {algorithm.planned && algorithm.planned.length > 0 && (
        <div className="w-full rounded-xl border bg-card p-5 text-left">
          <p className="mb-3 text-sm font-medium">Що буде в цьому розділі:</p>
          <ul className="space-y-2">
            {algorithm.planned.map((item) => (
              <li
                key={item}
                className="flex gap-2 text-sm text-muted-foreground"
              >
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-muted-foreground/40" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
