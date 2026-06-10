import { useCallback, useState } from "react"
import { Plus, Trash2 } from "lucide-react"
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
import { nextVertexName } from "@/lib/graph"
import type { TspCity } from "@/lib/tsp"
import type { TspDoc } from "@/store/tsp-store"

interface Row {
  readonly name: string
  /** Сирий рядок із поля (щоб набір був плавним); у число переводимо лише на «Зберегти». */
  readonly x: string
  readonly y: string
}

interface CoordinatesDialogProps {
  open: boolean
  initialCities: readonly TspCity[]
  initialStart: number
  /** Результат: новий документ або null (скасування). */
  onSettle: (doc: TspDoc | null) => void
}

/** Ціла координата ≥ 0 (як снап на полотні); порожнє/нечисло → 0. */
const toInt = (s: string): number => Math.max(0, Math.round(Number(s) || 0))

/**
 * Таблиця точних координат міст — альтернатива перетягуванню на полотні. Дає
 * ввести x/y кожного міста вручну (як у словнику `{"A": (0, 0), ...}`), обрати
 * старт, додати/видалити місто. Координати — математичні цілі (полотно масштабує
 * їх саме). Працює як чернетка: стор оновлюється одним `loadDoc` на «Зберегти».
 */
export function CoordinatesDialog({
  open,
  initialCities,
  initialStart,
  onSettle,
}: CoordinatesDialogProps) {
  const [rows, setRows] = useState<Row[]>([])
  const [startIdx, setStartIdx] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [wasOpen, setWasOpen] = useState(false)

  // Засіваємо чернетку синхронно при відкритті (не в useEffect) — щоб поля одразу
  // показали поточні координати, навіть якщо їх змінювали на полотні.
  if (open !== wasOpen) {
    setWasOpen(open)
    if (open) {
      setRows(
        initialCities.map((c) => ({
          name: c.name,
          x: String(c.x),
          y: String(c.y),
        })),
      )
      setStartIdx(initialStart)
      setError(null)
    }
  }

  const setCell = useCallback((i: number, key: "x" | "y", value: string) => {
    setRows((rs) => rs.map((r, k) => (k === i ? { ...r, [key]: value } : r)))
    setError(null)
  }, [])

  const addRow = useCallback(() => {
    setRows((rs) => [
      ...rs,
      { name: nextVertexName(rs.map((r) => r.name)), x: "0", y: "0" },
    ])
  }, [])

  const removeRow = useCallback((i: number) => {
    setRows((rs) => rs.filter((_, k) => k !== i))
    // Старт «їде» за своїм рядком; видалили сам старт — відкат на перший.
    setStartIdx((s) => (i === s ? 0 : i < s ? s - 1 : s))
    setError(null)
  }, [])

  const submit = useCallback(() => {
    const cities: TspCity[] = rows.map((r) => ({
      name: r.name,
      x: toInt(r.x),
      y: toInt(r.y),
    }))
    const seen = new Set<string>()
    for (const c of cities) {
      const key = `${c.x},${c.y}`
      if (seen.has(key)) {
        setError(
          `Дві точки збігаються в (${c.x}, ${c.y}) — координати мають бути різними.`,
        )
        return
      }
      seen.add(key)
    }
    const start =
      cities.length === 0
        ? 0
        : Math.min(Math.max(0, startIdx), cities.length - 1)
    onSettle({ cities, start })
  }, [rows, startIdx, onSettle])

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) onSettle(null)
      }}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Координати міст</DialogTitle>
          <DialogDescription>
            Цілі математичні координати (як у прикладі{" "}
            <span className="font-mono">A: (0, 0)</span>). Радіокнопка позначає
            стартове місто.
          </DialogDescription>
        </DialogHeader>

        <form
          noValidate
          className="flex flex-col gap-2"
          onSubmit={(e) => {
            e.preventDefault()
            submit()
          }}
        >
          <div className="grid grid-cols-[1.75rem_1fr_1fr_auto_1.75rem] items-center gap-2 px-1 text-xs font-medium text-muted-foreground">
            <span>№</span>
            <span>X</span>
            <span>Y</span>
            <span>старт</span>
            <span />
          </div>

          <div className="max-h-[46vh] space-y-1.5 overflow-auto pr-1">
            {rows.map((r, i) => (
              <div
                key={i}
                className="grid grid-cols-[1.75rem_1fr_1fr_auto_1.75rem] items-center gap-2"
              >
                <span className="text-sm font-semibold">{r.name}</span>
                <Input
                  type="number"
                  step={1}
                  inputMode="numeric"
                  aria-label={`X міста ${r.name}`}
                  value={r.x}
                  onChange={(e) => setCell(i, "x", e.target.value)}
                />
                <Input
                  type="number"
                  step={1}
                  inputMode="numeric"
                  aria-label={`Y міста ${r.name}`}
                  value={r.y}
                  onChange={(e) => setCell(i, "y", e.target.value)}
                />
                <label
                  className="flex items-center justify-center"
                  title={`Зробити стартом — ${r.name}`}
                >
                  <input
                    type="radio"
                    name="tsp-coord-start"
                    className="size-4 accent-primary"
                    checked={startIdx === i}
                    onChange={() => setStartIdx(i)}
                    aria-label={`Старт — ${r.name}`}
                  />
                </label>
                <Button
                  type="button"
                  size="icon-sm"
                  variant="ghost"
                  aria-label={`Видалити ${r.name}`}
                  onClick={() => removeRow(i)}
                >
                  <Trash2 />
                </Button>
              </div>
            ))}
            {rows.length === 0 && (
              <p className="px-1 py-4 text-center text-sm text-muted-foreground">
                Ще немає міст — додай перше.
              </p>
            )}
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="self-start"
            onClick={addRow}
          >
            <Plus /> Додати місто
          </Button>

          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}

          <DialogFooter className="mt-2">
            <Button type="button" variant="outline" onClick={() => onSettle(null)}>
              Скасувати
            </Button>
            <Button type="submit">Зберегти</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
