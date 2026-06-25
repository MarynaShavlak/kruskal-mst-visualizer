import { ArrowDownNarrowWide, BookOpen, Copy, Plus, SearchX, Shuffle, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ArrayEditor } from "@/algorithms/binary-search/editor/ArrayEditor"
import { BinarySummaryPanel } from "@/algorithms/binary-search/editor/BinarySummaryPanel"
import { useBinarySearchEditor } from "@/algorithms/binary-search/editor/use-binary-search-editor"
import { EditorViewShell } from "@/algorithms/shared/editor/EditorViewShell"
import { EditorHelp } from "@/algorithms/shared/editor/EditorHelp"
import { useT } from "@/i18n/use-t"

/** Редактор двійкового пошуку: масив чисел + ціль, пресети, сортування, шаринг. */
export function EditorView() {
  const ctrl = useBinarySearchEditor()
  const t = useT()

  return (
    <EditorViewShell
      onImportFile={ctrl.onImportFile}
      onExport={ctrl.onExport}
      onShare={ctrl.onShare}
      toolbar={
        <>
          <Button size="sm" variant="outline" onClick={ctrl.onLoadIntro}>
            <BookOpen /> {t("editor.binIntro")}
          </Button>
          <Button size="sm" variant="outline" onClick={ctrl.onLoadDuplicates}>
            <Copy /> {t("editor.arrDuplicates")}
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
            <ArrowDownNarrowWide /> {t("editor.searchSort")}
          </Button>
          <Button size="sm" variant="outline" onClick={ctrl.onClear}>
            <Trash2 /> {t("editor.clear")}
          </Button>
        </>
      }
      help={
        <EditorHelp
          items={[
            { action: t("editor.binHelpTarget"), desc: t("editor.helpBinTarget") },
            { action: t("editor.searchSort"), desc: t("editor.helpBinSort") },
            { action: `+ ${t("editor.binValue")}`, desc: t("editor.helpBinAdd") },
            { action: "✕", desc: t("editor.helpArrRemove") },
          ]}
          note={t("editor.helpBinNote")}
        />
      }
    >
      <div className="flex-1 space-y-3 rounded-lg border bg-muted/20 p-3">
        <h3 className="text-sm font-medium text-muted-foreground">
          {t("editor.binArrayTitle")}
        </h3>
        <ArrayEditor />
      </div>
      <BinarySummaryPanel className="lg:w-80" />
    </EditorViewShell>
  )
}
