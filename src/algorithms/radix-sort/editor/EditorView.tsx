import { BookOpen, Copy, Equal, Maximize2, Plus, Shuffle, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ArrayEditor } from "@/algorithms/radix-sort/editor/ArrayEditor"
import { RadixSummaryPanel } from "@/algorithms/radix-sort/editor/RadixSummaryPanel"
import { useRadixSortEditor } from "@/algorithms/radix-sort/editor/use-radix-sort-editor"
import { EditorViewShell } from "@/algorithms/shared/editor/EditorViewShell"
import { EditorHelp } from "@/algorithms/shared/editor/EditorHelp"
import { useT } from "@/i18n/use-t"

/** Редактор порозрядного сортування: масив чисел, пресети, імпорт/експорт/шаринг. */
export function EditorView() {
  const ctrl = useRadixSortEditor()
  const t = useT()

  return (
    <EditorViewShell
      onImportFile={ctrl.onImportFile}
      onExport={ctrl.onExport}
      onShare={ctrl.onShare}
      toolbar={
        <>
          <Button size="sm" variant="outline" onClick={ctrl.onLoadIntro}>
            <BookOpen /> {t("editor.rxIntro")}
          </Button>
          <Button size="sm" variant="outline" onClick={ctrl.onLoadEqual}>
            <Equal /> {t("editor.rxEqual")}
          </Button>
          <Button size="sm" variant="outline" onClick={ctrl.onLoadDuplicates}>
            <Copy /> {t("editor.rxDuplicates")}
          </Button>
          <Button size="sm" variant="outline" onClick={ctrl.onLoadBig}>
            <Maximize2 /> {t("editor.rxBig")}
          </Button>
          <Button size="sm" variant="outline" onClick={ctrl.onLoadRandom}>
            <Shuffle /> {t("editor.random")}
          </Button>
          <Button size="sm" variant="outline" onClick={ctrl.onAddValue}>
            <Plus /> {t("editor.rxValue")}
          </Button>
          <Button size="sm" variant="outline" onClick={ctrl.onClear}>
            <Trash2 /> {t("editor.clear")}
          </Button>
        </>
      }
      help={
        <EditorHelp
          items={[
            { action: `+ ${t("editor.rxValue")}`, desc: t("editor.helpRxAdd") },
            { action: t("editor.arrHelpCell"), desc: t("editor.helpRxEdit") },
            { action: "✕", desc: t("editor.helpArrRemove") },
          ]}
          note={t("editor.helpRxNote")}
        />
      }
    >
      <div className="flex-1 space-y-3 rounded-lg border bg-muted/20 p-3">
        <h3 className="text-sm font-medium text-muted-foreground">
          {t("editor.rxArrayTitle")}
        </h3>
        <ArrayEditor />
      </div>
      <RadixSummaryPanel className="lg:w-72" />
    </EditorViewShell>
  )
}
