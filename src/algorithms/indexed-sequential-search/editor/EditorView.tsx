import { useRef } from "react"
import { ArrowDownNarrowWide, BookMarked, BookOpen, Download, Plus, SearchX, Share2, Shuffle, Trash2, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ArrayEditor } from "@/algorithms/indexed-sequential-search/editor/ArrayEditor"
import { IxsSummaryPanel } from "@/algorithms/indexed-sequential-search/editor/IxsSummaryPanel"
import { useIndexedSequentialSearchEditor } from "@/algorithms/indexed-sequential-search/editor/use-indexed-sequential-search-editor"
import { EditorHelp } from "@/algorithms/shared/editor/EditorHelp"
import { useT } from "@/i18n/use-t"

/** Редактор індексно-послідовного пошуку: масив + ціль + крок індексу, пресети, сортування, шаринг. */
export function EditorView() {
  const ctrl = useIndexedSequentialSearchEditor()
  const t = useT()
  const fileInputRef = useRef<HTMLInputElement>(null)

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" variant="outline" onClick={ctrl.onLoadIntro}>
          <BookOpen /> {t("editor.issIntro")}
        </Button>
        <Button size="sm" variant="outline" onClick={ctrl.onLoadInIndex}>
          <BookMarked /> {t("editor.issInIndex")}
        </Button>
        <Button size="sm" variant="outline" onClick={ctrl.onLoadAbsent}>
          <SearchX /> {t("editor.issAbsent")}
        </Button>
        <Button size="sm" variant="outline" onClick={ctrl.onLoadRandom}>
          <Shuffle /> {t("editor.random")}
        </Button>
        <Button size="sm" variant="outline" onClick={ctrl.onAddValue}>
          <Plus /> {t("editor.issValue")}
        </Button>
        <Button size="sm" variant="outline" onClick={ctrl.onSort}>
          <ArrowDownNarrowWide /> {t("editor.issSort")}
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
            {t("editor.issArrayTitle")}
          </h3>
          <ArrayEditor />
        </div>
        <IxsSummaryPanel className="lg:w-80" />
      </div>

      <EditorHelp
        items={[
          { action: t("editor.issTargetLabel"), desc: t("editor.helpIssTarget") },
          { action: t("editor.issStepLabel"), desc: t("editor.helpIssStep") },
          { action: t("editor.issSort"), desc: t("editor.helpIssSort") },
          { action: `+ ${t("editor.issValue")}`, desc: t("editor.helpIssAdd") },
          { action: "✕", desc: t("editor.helpIssRemove") },
        ]}
        note={t("editor.helpIssNote")}
      />
    </div>
  )
}
