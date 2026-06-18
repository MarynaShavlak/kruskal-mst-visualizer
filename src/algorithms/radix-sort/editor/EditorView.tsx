import { useRef } from "react"
import { BookOpen, Copy, Download, Equal, Maximize2, Plus, Share2, Shuffle, Trash2, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ArrayEditor } from "@/algorithms/radix-sort/editor/ArrayEditor"
import { RadixSummaryPanel } from "@/algorithms/radix-sort/editor/RadixSummaryPanel"
import { useRadixSortEditor } from "@/algorithms/radix-sort/editor/use-radix-sort-editor"
import { EditorHelp } from "@/algorithms/shared/editor/EditorHelp"
import { useT } from "@/i18n/use-t"

/** Редактор порозрядного сортування: масив чисел, пресети, імпорт/експорт/шаринг. */
export function EditorView() {
  const ctrl = useRadixSortEditor()
  const t = useT()
  const fileInputRef = useRef<HTMLInputElement>(null)

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
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
        <div className="mx-1 h-5 w-px bg-border" />
        <Button
          size="sm"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
        >
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
          <h3 className="text-sm font-medium text-muted-foreground">
            {t("editor.rxArrayTitle")}
          </h3>
          <ArrayEditor />
        </div>
        <RadixSummaryPanel className="lg:w-72" />
      </div>

      <EditorHelp
        items={[
          { action: `+ ${t("editor.rxValue")}`, desc: t("editor.helpRxAdd") },
          { action: t("editor.rxHelpCell"), desc: t("editor.helpRxEdit") },
          { action: "✕", desc: t("editor.helpRxRemove") },
        ]}
        note={t("editor.helpRxNote")}
      />
    </div>
  )
}
