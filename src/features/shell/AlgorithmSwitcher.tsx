import { Fragment } from "react"
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
import { algorithmsByFamily } from "@/algorithms/registry"
import { navigateTo } from "@/hooks/use-route"
import { useT } from "@/i18n/use-t"
import { cn } from "@/lib/utils"
import { useLangStore } from "@/store/lang-store"
import type { Algorithm } from "@/algorithms/types"

/** Дропдаун у шапці для швидкої зміни активного алгоритму. */
export function AlgorithmSwitcher({ current }: { current: Algorithm | null }) {
  const t = useT()
  const lang = useLangStore((s) => s.lang)
  const groups = algorithmsByFamily()
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" aria-label={t("switcher.aria")}>
          {current ? (
            <>
              <current.icon className="text-muted-foreground" />
              <span className="max-w-[10rem] truncate">
                {current.shortName[lang]}
              </span>
            </>
          ) : (
            <span>{t("switcher.placeholder")}</span>
          )}
          <ChevronDown className="text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[15rem]">
        <DropdownMenuLabel>{t("switcher.label")}</DropdownMenuLabel>
        {groups.map((group) => (
          <Fragment key={group.family.id}>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">
              {group.family.label[lang]}
            </DropdownMenuLabel>
            {group.items.map((algo) => (
              <DropdownMenuItem
                key={algo.id}
                onSelect={() =>
                  navigateTo(
                    algo.id,
                    algo.status === "ready" ? algo.defaultTab : null,
                  )
                }
              >
                <algo.icon className="text-muted-foreground" />
                <span className="flex-1 truncate">{algo.shortName[lang]}</span>
                {algo.status === "soon" && (
                  <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                    {t("common.soonShort")}
                  </span>
                )}
                <Check
                  className={cn(
                    current?.id === algo.id ? "opacity-100" : "opacity-0",
                  )}
                />
              </DropdownMenuItem>
            ))}
          </Fragment>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
