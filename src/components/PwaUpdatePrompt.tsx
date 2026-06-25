import { CheckCircle2, RefreshCw, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useT } from "@/i18n/use-t"
import { usePwaStore } from "@/store/pwa-store"

/**
 * Банер PWA: пропонує застосувати оновлення (needRefresh) або повідомляє, що
 * застосунок готовий до офлайну (offlineReady). Через registerType:'prompt'
 * оновлення НЕ застосовується автоматично — лише за кліком «Оновити», щоб не
 * свопнути чанки під працюючим плеєром. Монтується раз у корені поряд із Toaster.
 */
export function PwaUpdatePrompt() {
  const t = useT()
  const needRefresh = usePwaStore((s) => s.needRefresh)
  const offlineReady = usePwaStore((s) => s.offlineReady)
  const updateSW = usePwaStore((s) => s.updateSW)
  const dismissNeedRefresh = usePwaStore((s) => s.dismissNeedRefresh)
  const dismissOfflineReady = usePwaStore((s) => s.dismissOfflineReady)

  if (!needRefresh && !offlineReady) return null

  return (
    <div className="no-print fixed bottom-4 left-4 z-100 w-80 max-w-[calc(100%-2rem)]">
      {needRefresh ? (
        <div
          role="alert"
          className="rounded-lg border bg-background p-4 shadow-lg"
        >
          <div className="flex items-start gap-2">
            <RefreshCw className="mt-0.5 size-4 shrink-0 text-primary" />
            <div className="grid gap-0.5">
              <p className="text-sm font-medium">{t("pwa.updateTitle")}</p>
              <p className="text-sm text-muted-foreground">
                {t("pwa.updateBody")}
              </p>
            </div>
          </div>
          <div className="mt-3 flex justify-end gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={dismissNeedRefresh}
            >
              {t("pwa.updateDismiss")}
            </Button>
            <Button
              size="sm"
              onClick={() => {
                void updateSW?.(true)
              }}
            >
              {t("pwa.updateReload")}
            </Button>
          </div>
        </div>
      ) : (
        <div
          role="status"
          className="flex items-center gap-2 rounded-lg border bg-background p-4 shadow-lg"
        >
          <CheckCircle2 className="size-4 shrink-0 text-primary" />
          <p className="text-sm">{t("pwa.offlineReady")}</p>
          <button
            type="button"
            aria-label={t("pwa.updateDismiss")}
            onClick={dismissOfflineReady}
            className="ml-auto rounded p-1 text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
          >
            <X className="size-4" />
          </button>
        </div>
      )}
    </div>
  )
}
