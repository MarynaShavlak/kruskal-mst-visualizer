import { useRef } from "react"
import { BookOpen, Copy, Download, ListOrdered, Plus, Share2, Shuffle, Trash2, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ArrayEditor } from "@/algorithms/linear-search/editor/ArrayEditor"
import { CasesSummaryPanel } from "@/algorithms/linear-search/editor/CasesSummaryPanel"
import { useLinearSearchEditor } from "@/algorithms/linear-search/editor/use-linear-search-editor"
import { EditorHelp } from "@/algorithms/shared/editor/EditorHelp"
import { useT } from "@/i18n/use-t"

/** Редактор лінійного пошуку: масив чисел + ціль, пресети, імпорт/експорт/шаринг. */
export function EditorView() {
  const ctrl = useLinearSearchEditor()
  const t = useT()
  const fileInputRef = useRef<HTMLInputElement>(null)

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" variant="outline" onClick={ctrl.onLoadMain}>
          <BookOpen /> {t("editor.lsMain")}
        </Button>
        <Button size="sm" variant="outline" onClick={ctrl.onLoadDuplicates}>
          <Copy /> {t("editor.lsDuplicates")}
        </Button>
        <Button size="sm" variant="outline" onClick={ctrl.onLoadSorted}>
          <ListOrdered /> {t("editor.lsSorted")}
        </Button>
        <Button size="sm" variant="outline" onClick={ctrl.onLoadRandom}>
          <Shuffle /> {t("editor.random")}
        </Button>
        <Button size="sm" variant="outline" onClick={ctrl.onAddValue}>
          <Plus /> {t("editor.lsValue")}
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
            {t("editor.lsArrayTitle")}
          </h3>
          <ArrayEditor />
        </div>
        <CasesSummaryPanel className="lg:w-80" />
      </div>

      <EditorHelp
        items={[
          { action: t("editor.lsHelpTarget"), desc: t("editor.helpLsTarget") },
          { action: `+ ${t("editor.lsValue")}`, desc: t("editor.helpLsAdd") },
          { action: t("editor.lsHelpCell"), desc: t("editor.helpLsEdit") },
          { action: "✕", desc: t("editor.helpLsRemove") },
        ]}
        note={t("editor.helpLsNote")}
      />
    </div>
  )
}
