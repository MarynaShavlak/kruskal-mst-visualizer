import { useRef } from "react"
import { ArrowDownNarrowWide, BookOpen, Copy, Download, Plus, SearchX, Share2, Shuffle, Trash2, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ArrayEditor } from "@/algorithms/binary-search/editor/ArrayEditor"
import { BinarySummaryPanel } from "@/algorithms/binary-search/editor/BinarySummaryPanel"
import { useBinarySearchEditor } from "@/algorithms/binary-search/editor/use-binary-search-editor"
import { EditorHelp } from "@/algorithms/shared/editor/EditorHelp"
import { useT } from "@/i18n/use-t"

/** Редактор двійкового пошуку: масив чисел + ціль, пресети, сортування, шаринг. */
export function EditorView() {
  const ctrl = useBinarySearchEditor()
  const t = useT()
  const fileInputRef = useRef<HTMLInputElement>(null)

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" variant="outline" onClick={ctrl.onLoadIntro}>
          <BookOpen /> {t("editor.binIntro")}
        </Button>
        <Button size="sm" variant="outline" onClick={ctrl.onLoadDuplicates}>
          <Copy /> {t("editor.binDuplicates")}
        </Button>
        <Button size="sm" variant="outline" onClick={ctrl.onLoadAbsent}>
          <SearchX /> {t("editor.binAbsent")}
        </Button>
        <Button size="sm" variant="outline" onClick={ctrl.onLoadRandom}>
          <Shuffle /> {t("editor.random")}
        </Button>
        <Button size="sm" variant="outline" onClick={ctrl.onAddValue}>
          <Plus /> {t("editor.binValue")}
        </Button>
        <Button size="sm" variant="outline" onClick={ctrl.onSort}>
          <ArrowDownNarrowWide /> {t("editor.binSort")}
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
            {t("editor.binArrayTitle")}
          </h3>
          <ArrayEditor />
        </div>
        <BinarySummaryPanel className="lg:w-80" />
      </div>

      <EditorHelp
        items={[
          { action: t("editor.binHelpTarget"), desc: t("editor.helpBinTarget") },
          { action: t("editor.binSort"), desc: t("editor.helpBinSort") },
          { action: `+ ${t("editor.binValue")}`, desc: t("editor.helpBinAdd") },
          { action: "✕", desc: t("editor.helpBinRemove") },
        ]}
        note={t("editor.helpBinNote")}
      />
    </div>
  )
}
