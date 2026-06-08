import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"
import { useToastStore } from "@/store/toast-store"

// Час на анімацію зникнення, після якого тост прибирається з масиву.
const REMOVE_DELAY = 250

/** Єдиний для застосунку рендерер тостів. Монтується раз у корені. */
export function Toaster() {
  const toasts = useToastStore((s) => s.toasts)
  const dismiss = useToastStore((s) => s.dismiss)
  const remove = useToastStore((s) => s.remove)

  return (
    <ToastProvider>
      {toasts.map((t) => (
        <Toast
          key={t.id}
          variant={t.variant}
          duration={t.duration}
          open={t.open}
          onOpenChange={(open) => {
            if (open) return
            dismiss(t.id)
            window.setTimeout(() => remove(t.id), REMOVE_DELAY)
          }}
        >
          <div className="grid gap-1">
            {t.title && <ToastTitle>{t.title}</ToastTitle>}
            <ToastDescription>{t.description}</ToastDescription>
          </div>
          <ToastClose />
        </Toast>
      ))}
      <ToastViewport />
    </ToastProvider>
  )
}
