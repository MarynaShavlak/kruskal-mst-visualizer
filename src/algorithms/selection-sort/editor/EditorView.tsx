import { ArrowDownAZ, ArrowUpZA, BookOpen, Plus, Shuffle, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ArrayEditor } from "@/algorithms/selection-sort/editor/ArrayEditor"
import { SelectionSummaryPanel } from "@/algorithms/selection-sort/editor/SelectionSummaryPanel"
import { useSelectionSortEditor } from "@/algorithms/selection-sort/editor/use-selection-sort-editor"
import { EditorViewShell } from "@/algorithms/shared/editor/EditorViewShell"
import { EditorHelp } from "@/algorithms/shared/editor/EditorHelp"
import { useT } from "@/i18n/use-t"

/** Редактор сортування прямим вибором: масив чисел, пресети, імпорт/експорт/шаринг. */
export function EditorView() {
  const ctrl = useSelectionSortEditor()
  const t = useT()

  return (
    <EditorViewShell
      onImportFile={ctrl.onImportFile}
      onExport={ctrl.onExport}
      onShare={ctrl.onShare}
      toolbar={
        <>
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
        </>
      }
      help={
        <EditorHelp
          items={[
            { action: `+ ${t("editor.ssValue")}`, desc: t("editor.helpSsAdd") },
            { action: t("editor.arrHelpCell"), desc: t("editor.helpSsEdit") },
            { action: "✕", desc: t("editor.helpArrRemove") },
          ]}
          note={t("editor.helpSsNote")}
        />
      }
    >
      <div className="flex-1 space-y-3 rounded-lg border bg-muted/20 p-3">
        <h3 className="text-sm font-medium text-muted-foreground">
          {t("editor.ssArrayTitle")}
        </h3>
        <ArrayEditor />
      </div>
      <SelectionSummaryPanel className="lg:w-72" />
    </EditorViewShell>
  )
}
