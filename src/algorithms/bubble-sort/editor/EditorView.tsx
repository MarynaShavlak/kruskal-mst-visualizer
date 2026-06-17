import { useRef } from "react"
import {
  ArrowDownAZ,
  ArrowUpZA,
  BookOpen,
  Download,
  Plus,
  Share2,
  Shuffle,
  Trash2,
  Upload,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { ArrayEditor } from "@/algorithms/bubble-sort/editor/ArrayEditor"
import { BubbleSummaryPanel } from "@/algorithms/bubble-sort/editor/BubbleSummaryPanel"
import { useBubbleSortEditor } from "@/algorithms/bubble-sort/editor/use-bubble-sort-editor"
import { EditorHelp } from "@/algorithms/shared/editor/EditorHelp"
import { useT } from "@/i18n/use-t"

/** Редактор бульбашкового сортування: масив чисел, пресети, імпорт/експорт/шаринг. */
export function EditorView() {
  const ctrl = useBubbleSortEditor()
  const t = useT()
  const fileInputRef = useRef<HTMLInputElement>(null)

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" variant="outline" onClick={ctrl.onLoadIntro}>
          <BookOpen /> {t("editor.bsIntro")}
        </Button>
        <Button size="sm" variant="outline" onClick={ctrl.onLoadBest}>
          <ArrowDownAZ /> {t("editor.bsBest")}
        </Button>
        <Button size="sm" variant="outline" onClick={ctrl.onLoadWorst}>
          <ArrowUpZA /> {t("editor.bsWorst")}
        </Button>
        <Button size="sm" variant="outline" onClick={ctrl.onLoadRandom}>
          <Shuffle /> {t("editor.random")}
        </Button>
        <Button size="sm" variant="outline" onClick={ctrl.onAddValue}>
          <Plus /> {t("editor.bsValue")}
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
            {t("editor.bsArrayTitle")}
          </h3>
          <ArrayEditor />
        </div>
        <BubbleSummaryPanel className="lg:w-72" />
      </div>

      <EditorHelp
        items={[
          { action: `+ ${t("editor.bsValue")}`, desc: t("editor.helpBsAdd") },
          { action: t("editor.bsHelpCell"), desc: t("editor.helpBsEdit") },
          { action: "✕", desc: t("editor.helpBsRemove") },
        ]}
        note={t("editor.helpBsNote")}
      />
    </div>
  )
}
