import { useRef } from "react"
import { BookOpen, Copy, Download, Layers, Share2, Shuffle, Sparkles, Trash2, Upload, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { TextPatternEditor } from "@/algorithms/shared/editor/TextPatternEditor"
import { RkSummaryPanel } from "@/algorithms/rabin-karp-string-search/editor/RkSummaryPanel"
import { useRabinKarpStringSearchEditor } from "@/algorithms/rabin-karp-string-search/editor/use-rabin-karp-string-search-editor"
import { useRabinKarpStringSearchStore } from "@/store/rabin-karp-string-search-store"
import { EditorHelp } from "@/algorithms/shared/editor/EditorHelp"
import { useT } from "@/i18n/use-t"

/** Редактор пошуку Рабіна-Карпа: текст + шаблон, пресети, шаринг. */
export function EditorView() {
  const ctrl = useRabinKarpStringSearchEditor()
  const t = useT()
  const text = useRabinKarpStringSearchStore((s) => s.text)
  const pattern = useRabinKarpStringSearchStore((s) => s.pattern)
  const setText = useRabinKarpStringSearchStore((s) => s.setText)
  const setPattern = useRabinKarpStringSearchStore((s) => s.setPattern)
  const fileInputRef = useRef<HTMLInputElement>(null)

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" variant="outline" onClick={ctrl.onLoadMain}>
          <BookOpen /> {t("editor.rkMain")}
        </Button>
        <Button size="sm" variant="outline" onClick={ctrl.onLoadCollision}>
          <Sparkles /> {t("editor.rkCollision")}
        </Button>
        <Button size="sm" variant="outline" onClick={ctrl.onLoadMulti}>
          <Layers /> {t("editor.rkMulti")}
        </Button>
        <Button size="sm" variant="outline" onClick={ctrl.onLoadNotFound}>
          <X /> {t("editor.rkNotFoundPreset")}
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
            <Copy className="size-3.5" /> {t("editor.rkEditorTitle")}
          </h3>
          <TextPatternEditor
            text={text}
            pattern={pattern}
            onText={setText}
            onPattern={setPattern}
          />
        </div>
        <RkSummaryPanel className="lg:w-80" />
      </div>

      <EditorHelp
        items={[
          { action: t("editor.strPatternLabel"), desc: t("editor.helpRkPattern") },
          { action: t("editor.strTextLabel"), desc: t("editor.helpRkText") },
          { action: t("editor.rkCollision"), desc: t("editor.helpRkCollision") },
          { action: t("editor.rkMulti"), desc: t("editor.helpRkMulti") },
        ]}
        note={t("editor.helpRkNote")}
      />
    </div>
  )
}
