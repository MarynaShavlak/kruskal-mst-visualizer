import { Component, type ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { navigateTo } from "@/hooks/use-route"
import { useT } from "@/i18n/use-t"

/** Внутрішній екран помилки (функційний — щоб мати доступ до i18n через хук). */
function ErrorFallback({ onRetry }: { onRetry: () => void }) {
  const t = useT()
  return (
    <div role="alert" className="mx-auto max-w-md space-y-4 py-16 text-center">
      <h2 className="text-lg font-semibold">{t("error.title")}</h2>
      <p className="text-sm text-muted-foreground">{t("error.body")}</p>
      <div className="flex justify-center gap-2">
        <Button variant="outline" onClick={onRetry}>
          {t("error.retry")}
        </Button>
        <Button
          onClick={() => {
            navigateTo(null)
            onRetry()
          }}
        >
          {t("error.home")}
        </Button>
      </div>
    </div>
  )
}

interface Props {
  readonly children: ReactNode
}

interface State {
  readonly hasError: boolean
}

/**
 * Межа помилок: ловить виняток під час рендеру піддерева й показує fallback
 * замість «білого екрана» всього застосунку. Скидається кнопкою «Перезавантажити»
 * (повторна спроба рендеру — корисно для тимчасових збоїв на кшталт невдалого
 * завантаження lazy-чанка) або через `key` на місці використання: зміна key при
 * навігації монтує межу заново.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  private retry = () => this.setState({ hasError: false })

  render() {
    if (this.state.hasError) {
      return <ErrorFallback onRetry={this.retry} />
    }
    return this.props.children
  }
}
