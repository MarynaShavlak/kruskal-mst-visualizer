import { BookOpen, Copy, Layers, Plus, Shuffle, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ArrayEditor } from "@/algorithms/quick-sort/editor/ArrayEditor"
import { QuickSummaryPanel } from "@/algorithms/quick-sort/editor/QuickSummaryPanel"
import { useQuickSortEditor } from "@/algorithms/quick-sort/editor/use-quick-sort-editor"
import { EditorViewShell } from "@/algorithms/shared/editor/EditorViewShell"
import { EditorHelp } from "@/algorithms/shared/editor/EditorHelp"
import { useT } from "@/i18n/use-t"

/** Редактор швидкого сортування: масив чисел, пресети, імпорт/експорт/шаринг. */
export function EditorView() {
  const ctrl = useQuickSortEditor()
  const t = useT()

  return (
    <EditorViewShell
      onImportFile={ctrl.onImportFile}
      onExport={ctrl.onExport}
      onShare={ctrl.onShare}
      toolbar={
        <>
          <Button size="sm" variant="outline" onClick={ctrl.onLoadIntro}>
            <BookOpen /> {t("editor.qsIntro")}
          </Button>
          <Button size="sm" variant="outline" onClick={ctrl.onLoadSorted}>
            <Layers /> {t("editor.qsSorted")}
          </Button>
          <Button size="sm" variant="outline" onClick={ctrl.onLoadDuplicates}>
            <Copy /> {t("editor.qsDuplicates")}
          </Button>
          <Button size="sm" variant="outline" onClick={ctrl.onLoadRandom}>
            <Shuffle /> {t("editor.random")}
          </Button>
          <Button size="sm" variant="outline" onClick={ctrl.onAddValue}>
            <Plus /> {t("editor.qsValue")}
          </Button>
          <Button size="sm" variant="outline" onClick={ctrl.onClear}>
            <Trash2 /> {t("editor.clear")}
          </Button>
        </>
      }
      help={
        <EditorHelp
          items={[
            { action: `+ ${t("editor.qsValue")}`, desc: t("editor.helpQsAdd") },
            { action: t("editor.qsHelpCell"), desc: t("editor.helpQsEdit") },
            { action: "✕", desc: t("editor.helpQsRemove") },
          ]}
          note={t("editor.helpQsNote")}
        />
      }
    >
      <div className="flex-1 space-y-3 rounded-lg border bg-muted/20 p-3">
        <h3 className="text-sm font-medium text-muted-foreground">
          {t("editor.qsArrayTitle")}
        </h3>
        <ArrayEditor />
      </div>
      <QuickSummaryPanel className="lg:w-72" />
    </EditorViewShell>
  )
}
