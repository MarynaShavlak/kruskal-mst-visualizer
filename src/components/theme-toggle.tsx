import { Monitor, Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useThemeStore, type Theme } from "@/store/theme-store"

const ORDER: Theme[] = ["light", "dark", "system"]
const ICON: Record<Theme, typeof Sun> = {
  light: Sun,
  dark: Moon,
  system: Monitor,
}
const LABEL: Record<Theme, string> = {
  light: "світла",
  dark: "темна",
  system: "системна",
}

export function ThemeToggle() {
  const theme = useThemeStore((s) => s.theme)
  const setTheme = useThemeStore((s) => s.setTheme)
  const Icon = ICON[theme]
  const next = ORDER[(ORDER.indexOf(theme) + 1) % ORDER.length]

  return (
    <Button
      size="icon-sm"
      variant="outline"
      onClick={() => setTheme(next)}
      title={`Тема: ${LABEL[theme]} (клік → ${LABEL[next]})`}
      aria-label={`Перемкнути тему (зараз ${LABEL[theme]})`}
    >
      <Icon />
    </Button>
  )
}
