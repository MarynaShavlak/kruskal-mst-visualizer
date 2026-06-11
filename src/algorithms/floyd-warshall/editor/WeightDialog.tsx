import { useCallback, useRef, useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { tr, useT } from "@/i18n/use-t"

interface WeightDialogProps {
  open: boolean
  /** Початкове значення поля (підставляється під час редагування ребра). */
  initial: number
  /** Викликається з вагою при підтвердженні або з null при скасуванні. */
  onSettle: (weight: number | null) => void
}

/**
 * Модальне вікно для введення ваги ребра. На відміну від Краскала, Флойд–Воршал
 * допускає будь-яке ціле число (зокрема 0 і від'ємні — для від'ємних ребер).
 */
export function WeightDialog({ open, initial, onSettle }: WeightDialogProps) {
  const [value, setValue] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [wasOpen, setWasOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const t = useT()

  // Скидаємо поле синхронно під час рендера при відкритті (а не в useEffect),
  // щоб onOpenAutoFocus побачив уже правильне значення й виділив його.
  if (open !== wasOpen) {
    setWasOpen(open)
    if (open) {
      setValue(String(initial))
      setError(null)
    }
  }

  const submit = useCallback(() => {
    const w = Number.parseInt(value, 10)
    if (!Number.isInteger(w)) {
      setError(tr("editor.weightErrAnyInt"))
      return
    }
    onSettle(w)
  }, [value, onSettle])

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) onSettle(null)
      }}
    >
      <DialogContent
        className="sm:max-w-xs"
        onOpenAutoFocus={(e) => {
          // Фокус + виділення вмісту, щоб одразу можна було набрати нову вагу.
          e.preventDefault()
          inputRef.current?.focus()
          inputRef.current?.select()
        }}
      >
        <DialogHeader>
          <DialogTitle>{t("editor.weightTitle")}</DialogTitle>
          <DialogDescription>{t("editor.weightDescAnyInt")}</DialogDescription>
        </DialogHeader>

        <form
          noValidate
          className="flex flex-col gap-2"
          onSubmit={(e) => {
            e.preventDefault()
            submit()
          }}
        >
          <Input
            ref={inputRef}
            type="number"
            step={1}
            inputMode="numeric"
            value={value}
            aria-invalid={error != null}
            aria-label={t("editor.weightTitle")}
            onChange={(e) => {
              setValue(e.target.value)
              if (error) setError(null)
            }}
          />
          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}

          <DialogFooter className="mt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onSettle(null)}
            >
              {t("common.cancel")}
            </Button>
            <Button type="submit">{t("common.save")}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

interface UseWeightPrompt {
  /** Відкриває діалог і резолвиться вагою або null (скасування). */
  promptWeight: (current?: number) => Promise<number | null>
  /** Пропси для <WeightDialog />. */
  dialogProps: WeightDialogProps
}

/**
 * Імперативний міст до WeightDialog: повертає async-функцію promptWeight,
 * яку можна await-ити так само, як колишній синхронний window.prompt.
 */
export function useWeightPrompt(): UseWeightPrompt {
  const [state, setState] = useState<{ open: boolean; initial: number }>({
    open: false,
    initial: 1,
  })
  const resolverRef = useRef<((weight: number | null) => void) | null>(null)

  const promptWeight = useCallback(
    (current?: number) =>
      new Promise<number | null>((resolve) => {
        // Якщо попередній виклик ще «висить» — закриваємо його скасуванням.
        resolverRef.current?.(null)
        resolverRef.current = resolve
        setState({
          open: true,
          initial: current != null && Number.isInteger(current) ? current : 1,
        })
      }),
    [],
  )

  const onSettle = useCallback((weight: number | null) => {
    setState((s) => ({ ...s, open: false }))
    resolverRef.current?.(weight)
    resolverRef.current = null
  }, [])

  return {
    promptWeight,
    dialogProps: { open: state.open, initial: state.initial, onSettle },
  }
}
