import { useRef } from "react"
import { ArrowDownWideNarrow, BookOpen, Copy, Download, Layers, Plus, Share2, Shuffle, Trash2, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ArrayEditor } from "@/algorithms/shell-sort/editor/ArrayEditor"
import { ShellSummaryPanel } from "@/algorithms/shell-sort/editor/ShellSummaryPanel"
import { useShellSortEditor } from "@/algorithms/shell-sort/editor/use-shell-sort-editor"
import { EditorHelp } from "@/algorithms/shared/editor/EditorHelp"
import { useT } from "@/i18n/use-t"

/** Редактор сортування Шелла: масив чисел, пресети, імпорт/експорт/шаринг. */
export function EditorView() {
  const ctrl = useShellSortEditor()
  const t = useT()
  const fileInputRef = useRef<HTMLInputElement>(null)

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" variant="outline" onClick={ctrl.onLoadIntro}>
          <BookOpen /> {t("editor.shIntro")}
        </Button>
        <Button size="sm" variant="outline" onClick={ctrl.onLoadSorted}>
          <Layers /> {t("editor.shSorted")}
        </Button>
        <Button size="sm" variant="outline" onClick={ctrl.onLoadReversed}>
          <ArrowDownWideNarrow /> {t("editor.shReversed")}
        </Button>
        <Button size="sm" variant="outline" onClick={ctrl.onLoadDuplicates}>
          <Copy /> {t("editor.shDuplicates")}
        </Button>
        <Button size="sm" variant="outline" onClick={ctrl.onLoadRandom}>
          <Shuffle /> {t("editor.random")}
        </Button>
        <Button size="sm" variant="outline" onClick={ctrl.onAddValue}>
          <Plus /> {t("editor.shValue")}
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
            {t("editor.shArrayTitle")}
          </h3>
          <ArrayEditor />
        </div>
        <ShellSummaryPanel className="lg:w-72" />
      </div>

      <EditorHelp
        items={[
          { action: `+ ${t("editor.shValue")}`, desc: t("editor.helpShAdd") },
          { action: t("editor.shHelpCell"), desc: t("editor.helpShEdit") },
          { action: "✕", desc: t("editor.helpShRemove") },
        ]}
        note={t("editor.helpShNote")}
      />
    </div>
  )
}
