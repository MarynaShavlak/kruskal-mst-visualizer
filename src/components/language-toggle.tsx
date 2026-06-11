import { Button } from "@/components/ui/button"
import { useLangStore } from "@/store/lang-store"

/** Глобальний перемикач мови у шапці (UA / EN). Стан — у lang-store. */
export function LanguageToggle() {
  const lang = useLangStore((s) => s.lang)
  const setLang = useLangStore((s) => s.setLang)

  return (
    <div className="flex gap-1" role="group" aria-label="Мова / Language">
      <Button
        size="sm"
        variant={lang === "ua" ? "default" : "outline"}
        aria-pressed={lang === "ua"}
        onClick={() => setLang("ua")}
      >
        UA
      </Button>
      <Button
        size="sm"
        variant={lang === "en" ? "default" : "outline"}
        aria-pressed={lang === "en"}
        onClick={() => setLang("en")}
      >
        EN
      </Button>
    </div>
  )
}
