import { BookOpen, Copy, FileText, Flame, Shuffle, Trash2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { TextPatternEditor } from "@/algorithms/shared/editor/TextPatternEditor"
import { KmpSummaryPanel } from "@/algorithms/kmp-string-search/editor/KmpSummaryPanel"
import { useKmpStringSearchEditor } from "@/algorithms/kmp-string-search/editor/use-kmp-string-search-editor"
import { useKmpStringSearchStore } from "@/store/kmp-string-search-store"
import { EditorViewShell } from "@/algorithms/shared/editor/EditorViewShell"
import { EditorHelp } from "@/algorithms/shared/editor/EditorHelp"
import { useT } from "@/i18n/use-t"

/** Редактор KMP: текст + шаблон, пресети, шаринг. */
export function EditorView() {
  const ctrl = useKmpStringSearchEditor()
  const t = useT()
  const text = useKmpStringSearchStore((s) => s.text)
  const pattern = useKmpStringSearchStore((s) => s.pattern)
  const setText = useKmpStringSearchStore((s) => s.setText)
  const setPattern = useKmpStringSearchStore((s) => s.setPattern)

  return (
    <EditorViewShell
      onImportFile={ctrl.onImportFile}
      onExport={ctrl.onExport}
      onShare={ctrl.onShare}
      toolbar={
        <>
          <Button size="sm" variant="outline" onClick={ctrl.onLoadMain}>
            <BookOpen /> {t("editor.strMain")}
          </Button>
          <Button size="sm" variant="outline" onClick={ctrl.onLoadKonspect}>
            <FileText /> {t("editor.kmpKonspect")}
          </Button>
          <Button size="sm" variant="outline" onClick={ctrl.onLoadWorst}>
            <Flame /> {t("editor.kmpWorst")}
          </Button>
          <Button size="sm" variant="outline" onClick={ctrl.onLoadNotFound}>
            <X /> {t("editor.kmpNotFoundPreset")}
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
            { action: t("editor.strPatternLabel"), desc: t("editor.helpKmpPattern") },
            { action: t("editor.strTextLabel"), desc: t("editor.helpKmpText") },
            { action: t("editor.kmpWorst"), desc: t("editor.helpKmpWorst") },
            { action: t("editor.kmpKonspect"), desc: t("editor.helpKmpKonspect") },
          ]}
          note={t("editor.helpKmpNote")}
        />
      }
    >
      <div className="flex-1 space-y-3 rounded-lg border bg-muted/20 p-3">
        <h3 className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
          <Copy className="size-3.5" /> {t("editor.strEditorTitle")}
        </h3>
        <TextPatternEditor
          text={text}
          pattern={pattern}
          onText={setText}
          onPattern={setPattern}
        />
      </div>
      <KmpSummaryPanel className="lg:w-80" />
    </EditorViewShell>
  )
}
