// Редактор ДДП: панель інструментів (пресети + додати операцію + очистити) над спільним
// EditorViewShell (import/export/share/embed), тіло — таблиця операцій insert/search/
// delete, збоку — живе прев'ю фінального дерева з підсумком і центровим обходом.

import { BookOpen, GitBranch, Plus, Scissors, Shuffle, Spline, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { EditorViewShell } from "@/algorithms/shared/editor/EditorViewShell"
import { EditorHelp } from "@/algorithms/shared/editor/EditorHelp"
import { useT } from "@/i18n/use-t"
import { OpsTable } from "@/algorithms/bst/editor/OpsTable"
import { BstPreviewPanel } from "@/algorithms/bst/editor/BstPreviewPanel"
import { useBstEditor } from "@/algorithms/bst/editor/use-bst-editor"

export function EditorView() {
  const ctrl = useBstEditor()
  const t = useT()

  const toolbar = (
    <>
      <Button size="sm" variant="outline" onClick={ctrl.onLoadIntro}>
        <BookOpen /> {t("editor.bstIntro")}
      </Button>
      <Button size="sm" variant="outline" onClick={ctrl.onLoadBalanced}>
        <GitBranch /> {t("editor.bstBalanced")}
      </Button>
      <Button size="sm" variant="outline" onClick={ctrl.onLoadDegenerate}>
        <Spline /> {t("editor.bstDegenerate")}
      </Button>
      <Button size="sm" variant="outline" onClick={ctrl.onLoadDeleteCases}>
        <Scissors /> {t("editor.bstDeleteCases")}
      </Button>
      <Button size="sm" variant="outline" onClick={ctrl.onLoadRandom}>
        <Shuffle /> {t("editor.random")}
      </Button>
      <Button size="sm" variant="outline" onClick={() => ctrl.onAddOp("insert")}>
        <Plus /> {t("editor.bstAddOp")}
      </Button>
      <Button size="sm" variant="outline" onClick={ctrl.onClear}>
        <Trash2 /> {t("editor.clear")}
      </Button>
    </>
  )

  const help = (
    <EditorHelp
      items={[
        { action: "insert · search · delete", desc: t("editor.bstHelpOps") },
        { action: t("editor.bstKey"), desc: t("editor.bstHelpKey") },
      ]}
      note={t("editor.bstHelpNote")}
    />
  )

  return (
    <EditorViewShell
      toolbar={toolbar}
      onImportFile={ctrl.onImportFile}
      onExport={ctrl.onExport}
      onShare={ctrl.onShare}
      onCopyEmbed={ctrl.onCopyEmbed}
      help={help}
    >
      <div className="flex-1 space-y-3 rounded-lg border bg-muted/20 p-3">
        <div className="text-sm font-medium">{t("editor.bstOpsTitle")}</div>
        <OpsTable />
      </div>
      <BstPreviewPanel className="lg:w-80" />
    </EditorViewShell>
  )
}
