import { ArrowDownAZ, ArrowUpZA, BookOpen, Plus, Shuffle, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ArrayEditor } from "@/algorithms/bubble-sort/editor/ArrayEditor"
import { BubbleSummaryPanel } from "@/algorithms/bubble-sort/editor/BubbleSummaryPanel"
import { useBubbleSortEditor } from "@/algorithms/bubble-sort/editor/use-bubble-sort-editor"
import { EditorViewShell } from "@/algorithms/shared/editor/EditorViewShell"
import { EditorHelp } from "@/algorithms/shared/editor/EditorHelp"
import { useT } from "@/i18n/use-t"

/** Редактор бульбашкового сортування: масив чисел, пресети, імпорт/експорт/шаринг. */
export function EditorView() {
  const ctrl = useBubbleSortEditor()
  const t = useT()

  return (
    <EditorViewShell
      onImportFile={ctrl.onImportFile}
      onExport={ctrl.onExport}
      onShare={ctrl.onShare}
      toolbar={
        <>
          <Button size="sm" variant="outline" onClick={ctrl.onLoadIntro}>
            <BookOpen /> {t("editor.bsIntro")}
          </Button>
          <Button size="sm" variant="outline" onClick={ctrl.onLoadBest}>
            <ArrowDownAZ /> {t("editor.arrBest")}
          </Button>
          <Button size="sm" variant="outline" onClick={ctrl.onLoadWorst}>
            <ArrowUpZA /> {t("editor.arrWorst")}
          </Button>
          <Button size="sm" variant="outline" onClick={ctrl.onLoadRandom}>
            <Shuffle /> {t("editor.random")}
          </Button>
          <Button size="sm" variant="outline" onClick={ctrl.onAddValue}>
            <Plus /> {t("editor.bsValue")}
          </Button>
          <Button size="sm" variant="outline" onClick={ctrl.onClear}>
            <Trash2 /> {t("editor.clear")}
          </Button>
        </>
      }
      help={
        <EditorHelp
          items={[
            { action: `+ ${t("editor.bsValue")}`, desc: t("editor.helpBsAdd") },
            { action: t("editor.arrHelpCell"), desc: t("editor.helpArrEdit") },
            { action: "✕", desc: t("editor.helpArrRemove") },
          ]}
          note={t("editor.helpBsNote")}
        />
      }
    >
      <div className="flex-1 space-y-3 rounded-lg border bg-muted/20 p-3">
        <h3 className="text-sm font-medium text-muted-foreground">
          {t("editor.arrArrayTitle")}
        </h3>
        <ArrayEditor />
      </div>
      <BubbleSummaryPanel className="lg:w-72" />
    </EditorViewShell>
  )
}
