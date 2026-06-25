import { ArrowDownNarrowWide, BookMarked, BookOpen, Plus, SearchX, Shuffle, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ArrayEditor } from "@/algorithms/indexed-sequential-search/editor/ArrayEditor"
import { IxsSummaryPanel } from "@/algorithms/indexed-sequential-search/editor/IxsSummaryPanel"
import { useIndexedSequentialSearchEditor } from "@/algorithms/indexed-sequential-search/editor/use-indexed-sequential-search-editor"
import { EditorViewShell } from "@/algorithms/shared/editor/EditorViewShell"
import { EditorHelp } from "@/algorithms/shared/editor/EditorHelp"
import { useT } from "@/i18n/use-t"

/** Редактор індексно-послідовного пошуку: масив + ціль + крок індексу, пресети, сортування, шаринг. */
export function EditorView() {
  const ctrl = useIndexedSequentialSearchEditor()
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
            { action: t("editor.issTargetLabel"), desc: t("editor.helpIssTarget") },
            { action: t("editor.issStepLabel"), desc: t("editor.helpIssStep") },
            { action: t("editor.searchSort"), desc: t("editor.helpIssSort") },
            { action: `+ ${t("editor.issValue")}`, desc: t("editor.helpIssAdd") },
            { action: "✕", desc: t("editor.helpArrRemove") },
          ]}
          note={t("editor.helpIssNote")}
        />
      }
    >
      <div className="flex-1 space-y-3 rounded-lg border bg-muted/20 p-3">
        <h3 className="text-sm font-medium text-muted-foreground">
          {t("editor.issArrayTitle")}
        </h3>
        <ArrayEditor />
      </div>
      <IxsSummaryPanel className="lg:w-80" />
    </EditorViewShell>
  )
}
