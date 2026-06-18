import { useRef } from "react"
import { ArrowDownNarrowWide, BookOpen, Copy, Download, Layers, Plus, Share2, Shuffle, Trash2, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ArrayEditor } from "@/algorithms/interpolation-search/editor/ArrayEditor"
import { IpSummaryPanel } from "@/algorithms/interpolation-search/editor/IpSummaryPanel"
import { useInterpolationSearchEditor } from "@/algorithms/interpolation-search/editor/use-interpolation-search-editor"
import { EditorHelp } from "@/algorithms/shared/editor/EditorHelp"
import { useT } from "@/i18n/use-t"

/** Редактор інтерполяційного пошуку: масив чисел + ціль, пресети, сортування, шаринг. */
export function EditorView() {
  const ctrl = useInterpolationSearchEditor()
  const t = useT()
  const fileInputRef = useRef<HTMLInputElement>(null)

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" variant="outline" onClick={ctrl.onLoadDemo1}>
          <BookOpen /> {t("editor.ipDemo1")}
        </Button>
        <Button size="sm" variant="outline" onClick={ctrl.onLoadDemo2}>
          <Copy /> {t("editor.ipDemo2")}
        </Button>
        <Button size="sm" variant="outline" onClick={ctrl.onLoadClustered}>
          <Layers /> {t("editor.ipClustered")}
        </Button>
        <Button size="sm" variant="outline" onClick={ctrl.onLoadRandom}>
          <Shuffle /> {t("editor.random")}
        </Button>
        <Button size="sm" variant="outline" onClick={ctrl.onAddValue}>
          <Plus /> {t("editor.ipValue")}
        </Button>
        <Button size="sm" variant="outline" onClick={ctrl.onSort}>
          <ArrowDownNarrowWide /> {t("editor.ipSort")}
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
            {t("editor.ipArrayTitle")}
          </h3>
          <ArrayEditor />
        </div>
        <IpSummaryPanel className="lg:w-80" />
      </div>

      <EditorHelp
        items={[
          { action: t("editor.ipHelpTarget"), desc: t("editor.helpIpTarget") },
          { action: t("editor.ipSort"), desc: t("editor.helpIpSort") },
          { action: `+ ${t("editor.ipValue")}`, desc: t("editor.helpIpAdd") },
          { action: "✕", desc: t("editor.helpIpRemove") },
        ]}
        note={t("editor.helpIpNote")}
      />
    </div>
  )
}
