import { BookOpen, Copy, ListOrdered, Plus, Shuffle, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ArrayEditor } from "@/algorithms/linear-search/editor/ArrayEditor"
import { CasesSummaryPanel } from "@/algorithms/linear-search/editor/CasesSummaryPanel"
import { useLinearSearchEditor } from "@/algorithms/linear-search/editor/use-linear-search-editor"
import { EditorViewShell } from "@/algorithms/shared/editor/EditorViewShell"
import { EditorHelp } from "@/algorithms/shared/editor/EditorHelp"
import { useT } from "@/i18n/use-t"

/** Редактор лінійного пошуку: масив чисел + ціль, пресети, імпорт/експорт/шаринг. */
export function EditorView() {
  const ctrl = useLinearSearchEditor()
  const t = useT()

  return (
    <EditorViewShell
      onImportFile={ctrl.onImportFile}
      onExport={ctrl.onExport}
      onShare={ctrl.onShare}
      toolbar={
        <>
          <Button size="sm" variant="outline" onClick={ctrl.onLoadMain}>
            <BookOpen /> {t("editor.lsMain")}
          </Button>
          <Button size="sm" variant="outline" onClick={ctrl.onLoadDuplicates}>
            <Copy /> {t("editor.arrDuplicates")}
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
        </>
      }
      help={
        <EditorHelp
          items={[
            { action: t("editor.lsHelpTarget"), desc: t("editor.helpLsTarget") },
            { action: `+ ${t("editor.lsValue")}`, desc: t("editor.helpLsAdd") },
            { action: t("editor.arrHelpCell"), desc: t("editor.helpLsEdit") },
            { action: "✕", desc: t("editor.helpArrRemove") },
          ]}
          note={t("editor.helpLsNote")}
        />
      }
    >
      <div className="flex-1 space-y-3 rounded-lg border bg-muted/20 p-3">
        <h3 className="text-sm font-medium text-muted-foreground">
          {t("editor.lsArrayTitle")}
        </h3>
        <ArrayEditor />
      </div>
      <CasesSummaryPanel className="lg:w-80" />
    </EditorViewShell>
  )
}
