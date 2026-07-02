// Редактор обходу дерева: панель інструментів (пресети + очистити) над спільним
// EditorViewShell (import/export/share/embed), тіло — поле рівневого списку + вибір
// порядку обходу, збоку — живе прев'ю дерева з підсумком і трьома обходами.

import { BookOpen, GitBranch, ListTree, Shuffle, Spline, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { EditorViewShell } from "@/algorithms/shared/editor/EditorViewShell"
import { EditorHelp } from "@/algorithms/shared/editor/EditorHelp"
import { useT } from "@/i18n/use-t"
import { cn } from "@/lib/utils"
import { useTreeTraversalStore } from "@/store/tree-traversal-store"
import type { TraversalOrder } from "@/lib/treeTraversal"
import {
  levelsToText,
  parseLevelsText,
} from "@/algorithms/tree-traversal/editor/levels-text"
import { TreePreviewPanel } from "@/algorithms/tree-traversal/editor/TreePreviewPanel"
import { useTreeTraversalEditor } from "@/algorithms/tree-traversal/editor/use-tree-traversal-editor"

const CONTROL_CLASS =
  "rounded border bg-transparent px-1.5 py-0.5 outline-none focus:ring-2 focus:ring-ring"

/** Поле рівневого списку: коміт на blur; `key` перемонтовує поле на завантаженні пресета. */
function LevelsField() {
  const levels = useTreeTraversalStore((s) => s.levels)
  const setLevels = useTreeTraversalStore((s) => s.setLevels)
  const t = useT()
  const text = levelsToText(levels)
  return (
    <label className="block space-y-1">
      <span className="text-sm text-muted-foreground">{t("editor.btLevelsLabel")}</span>
      <textarea
        key={text}
        defaultValue={text}
        placeholder={t("editor.btLevelsPlaceholder")}
        aria-label={t("editor.btLevelsLabel")}
        rows={2}
        onBlur={(e) => setLevels(parseLevelsText(e.target.value))}
        className={cn(CONTROL_CLASS, "w-full resize-y font-mono text-sm tabular-nums")}
      />
      <span className="block text-xs text-muted-foreground">{t("editor.btLevelsHint")}</span>
    </label>
  )
}

/** Перемикач порядку обходу (прямий / центровий / зворотний). */
function OrderSelect() {
  const order = useTreeTraversalStore((s) => s.order)
  const setOrder = useTreeTraversalStore((s) => s.setOrder)
  const t = useT()
  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="text-muted-foreground">{t("editor.btOrderLabel")}</span>
      <select
        aria-label={t("editor.btOrderLabel")}
        value={order}
        onChange={(e) => setOrder(e.target.value as TraversalOrder)}
        className={CONTROL_CLASS}
      >
        <option value="preorder">{t("editor.btPreorder")}</option>
        <option value="inorder">{t("editor.btInorder")}</option>
        <option value="postorder">{t("editor.btPostorder")}</option>
      </select>
    </label>
  )
}

export function EditorView() {
  const ctrl = useTreeTraversalEditor()
  const t = useT()

  const toolbar = (
    <>
      <Button size="sm" variant="outline" onClick={ctrl.onLoadIntro}>
        <BookOpen /> {t("editor.btIntro")}
      </Button>
      <Button size="sm" variant="outline" onClick={ctrl.onLoadBst}>
        <ListTree /> {t("editor.btBst")}
      </Button>
      <Button size="sm" variant="outline" onClick={ctrl.onLoadChain}>
        <Spline /> {t("editor.btChain")}
      </Button>
      <Button size="sm" variant="outline" onClick={ctrl.onLoadFull}>
        <GitBranch /> {t("editor.btFull")}
      </Button>
      <Button size="sm" variant="outline" onClick={ctrl.onLoadRandom}>
        <Shuffle /> {t("editor.random")}
      </Button>
      <Button size="sm" variant="outline" onClick={ctrl.onClear}>
        <Trash2 /> {t("editor.clear")}
      </Button>
    </>
  )

  const help = (
    <EditorHelp
      items={[
        { action: t("editor.btLevelsLabel"), desc: t("editor.btHelpLevels") },
        { action: t("editor.btOrderLabel"), desc: t("editor.btHelpOrder") },
      ]}
      note={t("editor.btHelpNote")}
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
        <LevelsField />
        <OrderSelect />
      </div>
      <TreePreviewPanel className="lg:w-80" />
    </EditorViewShell>
  )
}
