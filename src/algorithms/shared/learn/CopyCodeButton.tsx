import { useEffect, useRef, useState } from "react"
import { Check, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

/**
 * Кнопка «копіювати» для блоків коду навчальної вкладки. Локальний стан
 * (Copy → Check на ~2 с) замість тосту — блоків коду багато, глобальний тост
 * на кожне копіювання був би шумним. Напівпрозора за замовчуванням, повна
 * непрозорість на hover/focus та одразу після копіювання.
 */
export function CopyCodeButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false)
  const timer = useRef<number | null>(null)

  useEffect(
    () => () => {
      if (timer.current !== null) window.clearTimeout(timer.current)
    },
    [],
  )

  const copy = () => {
    const p = navigator.clipboard?.writeText(code)
    if (!p) return
    void p.then(
      () => {
        setCopied(true)
        if (timer.current !== null) window.clearTimeout(timer.current)
        timer.current = window.setTimeout(() => setCopied(false), 2000)
      },
      () => {},
    )
  }

  return (
    <Button
      type="button"
      size="icon-sm"
      variant="outline"
      onClick={copy}
      aria-label={copied ? "Скопійовано" : "Копіювати код"}
      title={copied ? "Скопійовано" : "Копіювати код"}
      className={cn(
        "no-print absolute right-2 top-2 z-10 opacity-50 backdrop-blur transition-opacity",
        "hover:opacity-100 focus-visible:opacity-100",
        copied && "opacity-100",
      )}
    >
      {copied ? (
        <Check className="text-emerald-600 dark:text-emerald-400" />
      ) : (
        <Copy />
      )}
    </Button>
  )
}
