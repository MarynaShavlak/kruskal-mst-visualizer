import { ArrowLeft, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  bridgeFrom,
  bridgeTo,
  getAlgorithm,
  type Bridge,
} from "@/algorithms/registry"
import { navigateTo, useRoute } from "@/hooks/use-route"
import { useT } from "@/i18n/use-t"
import { useLangStore } from "@/store/lang-store"

/**
 * Місточки «Звідки / Куди далі» наприкінці навчальної вкладки. Читає `BRIDGES`
 * із реєстру: `bridgeTo(id)` — звідки ми сюди прийшли, `bridgeFrom(id)` — куди
 * логіка курсу веде далі. Спільний `LearnView` НЕ отримує algo-id пропсом, тож
 * беремо його з роутера (`useRoute`); за потреби можна перевизначити `bridgeAlgoId`.
 * Рендерить `null`, коли обидва містки відсутні (кінцеві точки ланцюга / каталог).
 */
export function BridgeNav({ bridgeAlgoId }: { bridgeAlgoId?: string }) {
  const route = useRoute()
  const id = bridgeAlgoId ?? route.algorithmId
  if (!id) return null

  const incoming = bridgeTo(id)
  const outgoing = bridgeFrom(id)
  if (!incoming && !outgoing) return null

  return (
    <nav className="not-prose mt-8 grid gap-3 border-t pt-6 sm:grid-cols-2">
      {incoming ? (
        <BridgeCard bridge={incoming} algoId={incoming.from} direction="from" />
      ) : (
        <span aria-hidden className="hidden sm:block" />
      )}
      {outgoing ? (
        <BridgeCard bridge={outgoing} algoId={outgoing.to} direction="to" />
      ) : (
        <span aria-hidden className="hidden sm:block" />
      )}
    </nav>
  )
}

/** Одна картка містка: напрям, назва сусіднього алгоритму, нотатка й кнопка переходу. */
function BridgeCard({
  bridge,
  algoId,
  direction,
}: {
  bridge: Bridge
  algoId: string
  direction: "from" | "to"
}) {
  const t = useT()
  const lang = useLangStore((s) => s.lang)
  const algo = getAlgorithm(algoId)
  if (!algo) return null

  const isFrom = direction === "from"
  return (
    <div className="flex flex-col gap-2 rounded-lg border bg-card p-4">
      <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        {isFrom && <ArrowLeft className="size-3.5" />}
        {isFrom ? t("learn.bridgeFromTitle") : t("learn.bridgeToTitle")}
        {!isFrom && <ArrowRight className="size-3.5" />}
      </span>
      <span className="flex items-center gap-2 text-sm font-semibold">
        <algo.icon className="size-4 text-foreground/80" />
        {algo.shortName[lang]}
      </span>
      <p className="text-sm text-muted-foreground">{bridge.note[lang]}</p>
      <span className="mt-1 flex">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => navigateTo(algo.id, algo.defaultTab)}
        >
          {t("learn.bridgeGoLabel")} · {algo.shortName[lang]}
          <ArrowRight />
        </Button>
      </span>
    </div>
  )
}
