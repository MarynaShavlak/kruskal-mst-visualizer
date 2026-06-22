import { useRef } from "react"
import { BookOpen, Copy, Download, FileText, Flame, Share2, Shuffle, Trash2, Upload, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { TextPatternEditor } from "@/algorithms/shared/editor/TextPatternEditor"
import { KmpSummaryPanel } from "@/algorithms/kmp-string-search/editor/KmpSummaryPanel"
import { useKmpStringSearchEditor } from "@/algorithms/kmp-string-search/editor/use-kmp-string-search-editor"
import { useKmpStringSearchStore } from "@/store/kmp-string-search-store"
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
  const fileInputRef = useRef<HTMLInputElement>(null)

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" variant="outline" onClick={ctrl.onLoadMain}>
          <BookOpen /> {t("editor.kmpMain")}
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
        <div className="mx-1 h-5 w-px bg-border" />
        <Button size="sm" variant="outline" onClick={() => fileInputRef.current?.click()}>
          <Upload /> {t("editor.import")}
        </Button>
        <Button size="sm" variant="outline" onClick={ctrl.onExport}>
          <Download /> {t("editor.export")}
        </Button>
        <Button size="sm" variant="outline" onClick={ctrl.onShare}>
          <Share2 /> {t("editor.share")}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={ctrl.onImportFile}
        />
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-start">
        <div className="flex-1 space-y-3 rounded-lg border bg-muted/20 p-3">
          <h3 className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
            <Copy className="size-3.5" /> {t("editor.kmpEditorTitle")}
          </h3>
          <TextPatternEditor
            text={text}
            pattern={pattern}
            onText={setText}
            onPattern={setPattern}
          />
        </div>
        <KmpSummaryPanel className="lg:w-80" />
      </div>

      <EditorHelp
        items={[
          { action: t("editor.strPatternLabel"), desc: t("editor.helpKmpPattern") },
          { action: t("editor.strTextLabel"), desc: t("editor.helpKmpText") },
          { action: t("editor.kmpWorst"), desc: t("editor.helpKmpWorst") },
          { action: t("editor.kmpKonspect"), desc: t("editor.helpKmpKonspect") },
        ]}
        note={t("editor.helpKmpNote")}
      />
    </div>
  )
}
