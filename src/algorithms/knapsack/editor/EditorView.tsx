import { useEffect, useRef, useState } from "react"
import {
  BookOpen,
  Download,
  Package,
  Plus,
  Share2,
  Shuffle,
  Trash2,
  Upload,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { ItemsTable } from "@/algorithms/knapsack/editor/ItemsTable"
import { KnapsackSummaryPanel } from "@/algorithms/knapsack/editor/KnapsackSummaryPanel"
import { useKnapsackEditor } from "@/algorithms/knapsack/editor/use-knapsack-editor"
import { EditorHelp } from "@/algorithms/shared/editor/EditorHelp"
import { useKnapsackStore } from "@/store/knapsack-store"
import { useT } from "@/i18n/use-t"

/** Редактор рюкзака: таблиця предметів + місткість, пресети, імпорт/експорт/шаринг. */
export function EditorView() {
  const ctrl = useKnapsackEditor()
  const t = useT()
  const fileInputRef = useRef<HTMLInputElement>(null)

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" variant="outline" onClick={ctrl.onLoadClassic}>
          <BookOpen /> {t("editor.knapClassic")}
        </Button>
        <Button size="sm" variant="outline" onClick={ctrl.onLoadSmall}>
          <BookOpen /> {t("editor.knapSmall")}
        </Button>
        <Button size="sm" variant="outline" onClick={ctrl.onLoadRandom}>
          <Shuffle /> {t("editor.random")}
        </Button>
        <Button size="sm" variant="outline" onClick={ctrl.onAddItem}>
          <Plus /> {t("editor.knapItem")}
        </Button>
        <Button size="sm" variant="outline" onClick={ctrl.onClear}>
          <Trash2 /> {t("editor.clear")}
        </Button>
        <div className="mx-1 h-5 w-px bg-border" />
        <Button
          size="sm"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload /> {t("editor.import")}
        </Button>
        <Button size="sm" variant="outline" onClick={ctrl.onExport}>
          <Download /> {t("editor.export")}
        </Button>
        <Button size="sm" variant="outline" onClick={ctrl.onShare}>
          <Share2 /> {t("editor.share")}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={ctrl.onImportFile}
        />
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-start">
        <div className="flex-1 space-y-3 rounded-lg border bg-muted/20 p-3">
          <CapacityField />
          <ItemsTable />
        </div>
        <KnapsackSummaryPanel className="lg:w-72" />
      </div>

      <EditorHelp
        items={[
          { action: `+ ${t("editor.knapItem")}`, desc: t("editor.helpKnapAddItem") },
          { action: t("editor.knapHelpCell"), desc: t("editor.helpKnapEditCell") },
          { action: t("editor.knapCapacity"), desc: t("editor.helpKnapCapacity") },
          { action: "🗑", desc: t("editor.helpKnapRemove") },
        ]}
        note={t("editor.helpKnapNote")}
      />
    </div>
  )
}

/** Поле місткості рюкзака W: локальний рядок для плавного введення. */
function CapacityField() {
  const t = useT()
  const capacity = useKnapsackStore((s) => s.capacity)
  const setCapacity = useKnapsackStore((s) => s.setCapacity)
  const [text, setText] = useState(String(capacity))
  useEffect(() => setText(String(capacity)), [capacity])

  return (
    <label className="flex items-center gap-2 text-sm">
      <Package className="size-4 text-muted-foreground" />
      <span className="font-medium">{t("editor.knapCapacity")}</span>
      <input
        type="number"
        inputMode="numeric"
        min={0}
        value={text}
        aria-label={t("editor.knapCapacity")}
        onChange={(e) => {
          setText(e.target.value)
          const n = Number.parseInt(e.target.value, 10)
          if (Number.isFinite(n)) setCapacity(n)
        }}
        onBlur={() => {
          const n = Number.parseInt(text, 10)
          setCapacity(Number.isFinite(n) ? n : 0)
        }}
        className="w-20 rounded border bg-transparent px-2 py-1 text-right tabular-nums outline-none focus:ring-2 focus:ring-ring"
      />
    </label>
  )
}
