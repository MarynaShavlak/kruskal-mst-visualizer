import { useRef } from "react"
import { BookOpen, Copy, Download, Flame, Layers, Share2, Shuffle, Trash2, Upload, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { TextPatternEditor } from "@/algorithms/shared/editor/TextPatternEditor"
import { NssSummaryPanel } from "@/algorithms/naive-string-search/editor/NssSummaryPanel"
import { useNaiveStringSearchEditor } from "@/algorithms/naive-string-search/editor/use-naive-string-search-editor"
import { useNaiveStringSearchStore } from "@/store/naive-string-search-store"
import { EditorHelp } from "@/algorithms/shared/editor/EditorHelp"
import { useT } from "@/i18n/use-t"

/** Редактор наївного пошуку в рядках: текст + шаблон, пресети, шаринг. */
export function EditorView() {
  const ctrl = useNaiveStringSearchEditor()
  const t = useT()
  const text = useNaiveStringSearchStore((s) => s.text)
  const pattern = useNaiveStringSearchStore((s) => s.pattern)
  const setText = useNaiveStringSearchStore((s) => s.setText)
  const setPattern = useNaiveStringSearchStore((s) => s.setPattern)
  const fileInputRef = useRef<HTMLInputElement>(null)

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" variant="outline" onClick={ctrl.onLoadMain}>
          <BookOpen /> {t("editor.nssMain")}
        </Button>
        <Button size="sm" variant="outline" onClick={ctrl.onLoadWorst}>
          <Flame /> {t("editor.nssWorst")}
        </Button>
        <Button size="sm" variant="outline" onClick={ctrl.onLoadNotFound}>
          <X /> {t("editor.nssNotFoundPreset")}
        </Button>
        <Button size="sm" variant="outline" onClick={ctrl.onLoadOverlap}>
          <Layers /> {t("editor.nssOverlap")}
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
            <Copy className="size-3.5" /> {t("editor.nssEditorTitle")}
          </h3>
          <TextPatternEditor
            text={text}
            pattern={pattern}
            onText={setText}
            onPattern={setPattern}
          />
        </div>
        <NssSummaryPanel className="lg:w-80" />
      </div>

      <EditorHelp
        items={[
          { action: t("editor.strPatternLabel"), desc: t("editor.helpNssPattern") },
          { action: t("editor.strTextLabel"), desc: t("editor.helpNssText") },
          { action: t("editor.nssWorst"), desc: t("editor.helpNssWorst") },
          { action: t("editor.nssOverlap"), desc: t("editor.helpNssOverlap") },
        ]}
        note={t("editor.helpNssNote")}
      />
    </div>
  )
}
