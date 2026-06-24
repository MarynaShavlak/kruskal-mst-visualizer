import { ArrowDownWideNarrow, BookOpen, Copy, Layers, Plus, Shuffle, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ArrayEditor } from "@/algorithms/merge-sort/editor/ArrayEditor"
import { MergeSummaryPanel } from "@/algorithms/merge-sort/editor/MergeSummaryPanel"
import { useMergeSortEditor } from "@/algorithms/merge-sort/editor/use-merge-sort-editor"
import { EditorViewShell } from "@/algorithms/shared/editor/EditorViewShell"
import { EditorHelp } from "@/algorithms/shared/editor/EditorHelp"
import { useT } from "@/i18n/use-t"

/** Редактор сортування злиттям: масив чисел, пресети, імпорт/експорт/шаринг. */
export function EditorView() {
  const ctrl = useMergeSortEditor()
  const t = useT()

  return (
    <EditorViewShell
      onImportFile={ctrl.onImportFile}
      onExport={ctrl.onExport}
      onShare={ctrl.onShare}
      toolbar={
        <>
          <Button size="sm" variant="outline" onClick={ctrl.onLoadIntro}>
            <BookOpen /> {t("editor.msIntro")}
          </Button>
          <Button size="sm" variant="outline" onClick={ctrl.onLoadSorted}>
            <Layers /> {t("editor.msSorted")}
          </Button>
          <Button size="sm" variant="outline" onClick={ctrl.onLoadReversed}>
            <ArrowDownWideNarrow /> {t("editor.msReversed")}
          </Button>
          <Button size="sm" variant="outline" onClick={ctrl.onLoadDuplicates}>
            <Copy /> {t("editor.msDuplicates")}
          </Button>
          <Button size="sm" variant="outline" onClick={ctrl.onLoadRandom}>
            <Shuffle /> {t("editor.random")}
          </Button>
          <Button size="sm" variant="outline" onClick={ctrl.onAddValue}>
            <Plus /> {t("editor.msValue")}
          </Button>
          <Button size="sm" variant="outline" onClick={ctrl.onClear}>
            <Trash2 /> {t("editor.clear")}
          </Button>
        </>
      }
      help={
        <EditorHelp
          items={[
            { action: `+ ${t("editor.msValue")}`, desc: t("editor.helpMsAdd") },
            { action: t("editor.msHelpCell"), desc: t("editor.helpMsEdit") },
            { action: "✕", desc: t("editor.helpMsRemove") },
          ]}
          note={t("editor.helpMsNote")}
        />
      }
    >
      <div className="flex-1 space-y-3 rounded-lg border bg-muted/20 p-3">
        <h3 className="text-sm font-medium text-muted-foreground">
          {t("editor.msArrayTitle")}
        </h3>
        <ArrayEditor />
      </div>
      <MergeSummaryPanel className="lg:w-72" />
    </EditorViewShell>
  )
}
