import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useThemeStore } from "@/store/theme-store"

export function ThemeToggle() {
  const isDark = useThemeStore((s) => s.isDark)
  const toggle = useThemeStore((s) => s.toggle)

  return (
    <Button
      size="icon-sm"
      variant="outline"
      onClick={toggle}
      title={isDark ? "Перемкнути на світлу тему" : "Перемкнути на темну тему"}
      aria-label="Перемкнути тему"
    >
      {isDark ? <Sun /> : <Moon />}
    </Button>
  )
}
