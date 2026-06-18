import { useRef } from "react"
import {
  ArrowDownAZ,
  ArrowUpZA,
  BookOpen,
  Download,
  Plus,
  Share2,
  Shuffle,
  Trash2,
  Upload,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { ArrayEditor } from "@/algorithms/selection-sort/editor/ArrayEditor"
import { SelectionSummaryPanel } from "@/algorithms/selection-sort/editor/SelectionSummaryPanel"
import { useSelectionSortEditor } from "@/algorithms/selection-sort/editor/use-selection-sort-editor"
import { EditorHelp } from "@/algorithms/shared/editor/EditorHelp"
import { useT } from "@/i18n/use-t"

/** Редактор сортування прямим вибором: масив чисел, пресети, імпорт/експорт/шаринг. */
export function EditorView() {
  const ctrl = useSelectionSortEditor()
  const t = useT()
  const fileInputRef = useRef<HTMLInputElement>(null)

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" variant="outline" onClick={ctrl.onLoadIntro}>
          <BookOpen /> {t("editor.ssIntro")}
        </Button>
        <Button size="sm" variant="outline" onClick={ctrl.onLoadBest}>
          <ArrowDownAZ /> {t("editor.ssBest")}
        </Button>
        <Button size="sm" variant="outline" onClick={ctrl.onLoadWorst}>
          <ArrowUpZA /> {t("editor.ssWorst")}
        </Button>
        <Button size="sm" variant="outline" onClick={ctrl.onLoadRandom}>
          <Shuffle /> {t("editor.random")}
        </Button>
        <Button size="sm" variant="outline" onClick={ctrl.onAddValue}>
          <Plus /> {t("editor.ssValue")}
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
          <h3 className="text-sm font-medium text-muted-foreground">
            {t("editor.ssArrayTitle")}
          </h3>
          <ArrayEditor />
        </div>
        <SelectionSummaryPanel className="lg:w-72" />
      </div>

      <EditorHelp
        items={[
          { action: `+ ${t("editor.ssValue")}`, desc: t("editor.helpSsAdd") },
          { action: t("editor.ssHelpCell"), desc: t("editor.helpSsEdit") },
          { action: "✕", desc: t("editor.helpSsRemove") },
        ]}
        note={t("editor.helpSsNote")}
      />
    </div>
  )
}
