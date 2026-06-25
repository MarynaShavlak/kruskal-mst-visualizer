import { ArrowDownAZ, ArrowUpZA, BookOpen, Plus, Shuffle, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ArrayEditor } from "@/algorithms/insertion-sort/editor/ArrayEditor"
import { InsertionSummaryPanel } from "@/algorithms/insertion-sort/editor/InsertionSummaryPanel"
import { useInsertionSortEditor } from "@/algorithms/insertion-sort/editor/use-insertion-sort-editor"
import { EditorViewShell } from "@/algorithms/shared/editor/EditorViewShell"
import { EditorHelp } from "@/algorithms/shared/editor/EditorHelp"
import { useT } from "@/i18n/use-t"

/** Редактор сортування вставками: масив чисел, пресети, імпорт/експорт/шаринг. */
export function EditorView() {
  const ctrl = useInsertionSortEditor()
  const t = useT()

  return (
    <EditorViewShell
      onImportFile={ctrl.onImportFile}
      onExport={ctrl.onExport}
      onShare={ctrl.onShare}
      toolbar={
        <>
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
        </>
      }
      help={
        <EditorHelp
          items={[
            { action: `+ ${t("editor.isValue")}`, desc: t("editor.helpIsAdd") },
            { action: t("editor.arrHelpCell"), desc: t("editor.helpIsEdit") },
            { action: "✕", desc: t("editor.helpArrRemove") },
          ]}
          note={t("editor.helpIsNote")}
        />
      }
    >
      <div className="flex-1 space-y-3 rounded-lg border bg-muted/20 p-3">
        <h3 className="text-sm font-medium text-muted-foreground">
          {t("editor.isArrayTitle")}
        </h3>
        <ArrayEditor />
      </div>
      <InsertionSummaryPanel className="lg:w-72" />
    </EditorViewShell>
  )
}
