import { Button } from "@/components/ui/button"
import { setHash } from "@/hooks/use-route"

/**
 * Запасна картка для статичних фігур README без живого віджета: підпис і
 * опційний перехід (`cta.route` → setHash). Спільна для навчальних вкладок усіх
 * алгоритмів — інжектиться у їхній `figureForSrc`.
 */
export function FigureCard({
  caption,
  cta,
}: {
  caption: string
  cta?: { label: string; route: string }
}) {
  return (
    <span className="not-prose my-4 block rounded-lg border border-dashed bg-muted/30 p-4 text-center">
      <span className="block text-sm text-muted-foreground">{caption}</span>
      {cta && (
        <Button
          size="sm"
          variant="outline"
          className="mt-3"
          onClick={() => setHash(cta.route)}
        >
          {cta.label} →
        </Button>
      )}
    </span>
  )
}
