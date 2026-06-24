import { BookOpen, Copy, FastForward, Flame, Layers, Shuffle, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { TextPatternEditor } from "@/algorithms/shared/editor/TextPatternEditor"
import { BmSummaryPanel } from "@/algorithms/boyer-moore-string-search/editor/BmSummaryPanel"
import { useBoyerMooreStringSearchEditor } from "@/algorithms/boyer-moore-string-search/editor/use-boyer-moore-string-search-editor"
import { useBoyerMooreStringSearchStore } from "@/store/boyer-moore-string-search-store"
import { EditorViewShell } from "@/algorithms/shared/editor/EditorViewShell"
import { EditorHelp } from "@/algorithms/shared/editor/EditorHelp"
import { useT } from "@/i18n/use-t"

/** Редактор пошуку Боєра-Мура: текст + шаблон, пресети, шаринг. */
export function EditorView() {
  const ctrl = useBoyerMooreStringSearchEditor()
  const t = useT()
  const text = useBoyerMooreStringSearchStore((s) => s.text)
  const pattern = useBoyerMooreStringSearchStore((s) => s.pattern)
  const setText = useBoyerMooreStringSearchStore((s) => s.setText)
  const setPattern = useBoyerMooreStringSearchStore((s) => s.setPattern)

  return (
    <EditorViewShell
      onImportFile={ctrl.onImportFile}
      onExport={ctrl.onExport}
      onShare={ctrl.onShare}
      toolbar={
        <>
          <Button size="sm" variant="outline" onClick={ctrl.onLoadMain}>
            <BookOpen /> {t("editor.bmMain")}
          </Button>
          <Button size="sm" variant="outline" onClick={ctrl.onLoadBigJumps}>
            <FastForward /> {t("editor.bmBigJumps")}
          </Button>
          <Button size="sm" variant="outline" onClick={ctrl.onLoadWorst}>
            <Flame /> {t("editor.bmWorst")}
          </Button>
          <Button size="sm" variant="outline" onClick={ctrl.onLoadMulti}>
            <Layers /> {t("editor.bmMulti")}
          </Button>
          <Button size="sm" variant="outline" onClick={ctrl.onLoadRandom}>
            <Shuffle /> {t("editor.random")}
          </Button>
          <Button size="sm" variant="outline" onClick={ctrl.onClear}>
            <Trash2 /> {t("editor.clear")}
          </Button>
        </>
      }
      help={
        <EditorHelp
          items={[
            { action: t("editor.strPatternLabel"), desc: t("editor.helpBmPattern") },
            { action: t("editor.strTextLabel"), desc: t("editor.helpBmText") },
            { action: t("editor.bmBigJumps"), desc: t("editor.helpBmBigJumps") },
            { action: t("editor.bmWorst"), desc: t("editor.helpBmWorst") },
          ]}
          note={t("editor.helpBmNote")}
        />
      }
    >
      <div className="flex-1 space-y-3 rounded-lg border bg-muted/20 p-3">
        <h3 className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
          <Copy className="size-3.5" /> {t("editor.bmEditorTitle")}
        </h3>
        <TextPatternEditor
          text={text}
          pattern={pattern}
          onText={setText}
          onPattern={setPattern}
        />
      </div>
      <BmSummaryPanel className="lg:w-80" />
    </EditorViewShell>
  )
}
