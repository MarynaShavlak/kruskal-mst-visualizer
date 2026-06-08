import { Check, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ALGORITHMS } from "@/algorithms/registry"
import { navigateTo } from "@/hooks/use-route"
import { cn } from "@/lib/utils"
import type { Algorithm } from "@/algorithms/types"

/** Дропдаун у шапці для швидкої зміни активного алгоритму. */
export function AlgorithmSwitcher({ current }: { current: Algorithm | null }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" aria-label="Обрати алгоритм">
          {current ? (
            <>
              <current.icon className="text-muted-foreground" />
              <span className="max-w-[10rem] truncate">
                {current.shortName}
              </span>
            </>
          ) : (
            <span>Оберіть алгоритм</span>
          )}
          <ChevronDown className="text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[15rem]">
        <DropdownMenuLabel>Алгоритми</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {ALGORITHMS.map((algo) => (
          <DropdownMenuItem
            key={algo.id}
            onSelect={() =>
              navigateTo(algo.id, algo.status === "ready" ? algo.defaultTab : null)
            }
          >
            <algo.icon className="text-muted-foreground" />
            <span className="flex-1 truncate">{algo.shortName}</span>
            {algo.status === "soon" && (
              <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                скоро
              </span>
            )}
            <Check
              className={cn(current?.id === algo.id ? "opacity-100" : "opacity-0")}
            />
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
