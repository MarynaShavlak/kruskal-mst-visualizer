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
import { ArrayEditor } from "@/algorithms/insertion-sort/editor/ArrayEditor"
import { InsertionSummaryPanel } from "@/algorithms/insertion-sort/editor/InsertionSummaryPanel"
import { useInsertionSortEditor } from "@/algorithms/insertion-sort/editor/use-insertion-sort-editor"
import { EditorHelp } from "@/algorithms/shared/editor/EditorHelp"
import { useT } from "@/i18n/use-t"

/** Редактор сортування вставками: масив чисел, пресети, імпорт/експорт/шаринг. */
export function EditorView() {
  const ctrl = useInsertionSortEditor()
  const t = useT()
  const fileInputRef = useRef<HTMLInputElement>(null)

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" variant="outline" onClick={ctrl.onLoadIntro}>
          <BookOpen /> {t("editor.isIntro")}
        </Button>
        <Button size="sm" variant="outline" onClick={ctrl.onLoadBest}>
          <ArrowDownAZ /> {t("editor.isBest")}
        </Button>
        <Button size="sm" variant="outline" onClick={ctrl.onLoadWorst}>
          <ArrowUpZA /> {t("editor.isWorst")}
        </Button>
        <Button size="sm" variant="outline" onClick={ctrl.onLoadRandom}>
          <Shuffle /> {t("editor.random")}
        </Button>
        <Button size="sm" variant="outline" onClick={ctrl.onAddValue}>
          <Plus /> {t("editor.isValue")}
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
            {t("editor.isArrayTitle")}
          </h3>
          <ArrayEditor />
        </div>
        <InsertionSummaryPanel className="lg:w-72" />
      </div>

      <EditorHelp
        items={[
          { action: `+ ${t("editor.isValue")}`, desc: t("editor.helpIsAdd") },
          { action: t("editor.isHelpCell"), desc: t("editor.helpIsEdit") },
          { action: "✕", desc: t("editor.helpIsRemove") },
        ]}
        note={t("editor.helpIsNote")}
      />
    </div>
  )
}
