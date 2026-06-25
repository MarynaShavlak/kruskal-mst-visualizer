import { ArrowDownWideNarrow, BookOpen, Copy, Layers, Plus, Shuffle, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ArrayEditor } from "@/algorithms/heap-sort/editor/ArrayEditor"
import { HeapSummaryPanel } from "@/algorithms/heap-sort/editor/HeapSummaryPanel"
import { useHeapSortEditor } from "@/algorithms/heap-sort/editor/use-heap-sort-editor"
import { EditorViewShell } from "@/algorithms/shared/editor/EditorViewShell"
import { EditorHelp } from "@/algorithms/shared/editor/EditorHelp"
import { useT } from "@/i18n/use-t"

/** Редактор пірамідального сортування: масив чисел, пресети, імпорт/експорт/шаринг. */
export function EditorView() {
  const ctrl = useHeapSortEditor()
  const t = useT()

  return (
    <EditorViewShell
      onImportFile={ctrl.onImportFile}
      onExport={ctrl.onExport}
      onShare={ctrl.onShare}
      onCopyEmbed={ctrl.onCopyEmbed}
      toolbar={
        <>
          <Button size="sm" variant="outline" onClick={ctrl.onLoadIntro}>
            <BookOpen /> {t("editor.hpIntro")}
          </Button>
          <Button size="sm" variant="outline" onClick={ctrl.onLoadSorted}>
            <Layers /> {t("editor.hpSorted")}
          </Button>
          <Button size="sm" variant="outline" onClick={ctrl.onLoadReversed}>
            <ArrowDownWideNarrow /> {t("editor.hpReversed")}
          </Button>
          <Button size="sm" variant="outline" onClick={ctrl.onLoadDuplicates}>
            <Copy /> {t("editor.arrDuplicates")}
          </Button>
          <Button size="sm" variant="outline" onClick={ctrl.onLoadRandom}>
            <Shuffle /> {t("editor.random")}
          </Button>
          <Button size="sm" variant="outline" onClick={ctrl.onAddValue}>
            <Plus /> {t("editor.hpValue")}
          </Button>
          <Button size="sm" variant="outline" onClick={ctrl.onClear}>
            <Trash2 /> {t("editor.clear")}
          </Button>
        </>
      }
      help={
        <EditorHelp
          items={[
            { action: `+ ${t("editor.hpValue")}`, desc: t("editor.helpHpAdd") },
            { action: t("editor.arrHelpCell"), desc: t("editor.helpArrEdit") },
            { action: "✕", desc: t("editor.helpArrRemove") },
          ]}
          note={t("editor.helpHpNote")}
        />
      }
    >
      <div className="flex-1 space-y-3 rounded-lg border bg-muted/20 p-3">
        <h3 className="text-sm font-medium text-muted-foreground">
          {t("editor.arrArrayTitle")}
        </h3>
        <ArrayEditor />
      </div>
      <HeapSummaryPanel className="lg:w-72" />
    </EditorViewShell>
  )
}
