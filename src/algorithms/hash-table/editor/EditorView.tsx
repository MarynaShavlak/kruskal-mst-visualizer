// Редактор хеш-таблиці: панель інструментів (пресети + додати операцію + очистити)
// над спільним EditorViewShell (import/export/share/embed), тіло — місткість +
// вибір хеш-функції + таблиця операцій, збоку — живе прев'ю розкладки.

import { Plus, Trash2, Shuffle, BookOpen, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { EditorViewShell } from "@/algorithms/shared/editor/EditorViewShell"
import { EditorHelp } from "@/algorithms/shared/editor/EditorHelp"
import { useT } from "@/i18n/use-t"
import { cn } from "@/lib/utils"
import { useHashTableStore } from "@/store/hash-table-store"
import type { HashFnId } from "@/lib/hashTable"
import { OpsTable } from "@/algorithms/hash-table/editor/OpsTable"
import { HashPreviewPanel } from "@/algorithms/hash-table/editor/HashPreviewPanel"
import { useHashTableEditor } from "@/algorithms/hash-table/editor/use-hash-table-editor"

const CONTROL_CLASS =
  "rounded border bg-transparent px-1.5 py-0.5 outline-none focus:ring-2 focus:ring-ring"

/** Поле місткості: локальний стан для плавного набору, коміт цілого ≥1. */
function CapacityField() {
  const capacity = useHashTableStore((s) => s.capacity)
  const setCapacity = useHashTableStore((s) => s.setCapacity)
  const t = useT()
  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="text-muted-foreground">{t("editor.htCapacity")}</span>
      <input
        type="number"
        inputMode="numeric"
        min={1}
        aria-label={t("editor.htCapacity")}
        defaultValue={capacity}
        key={capacity}
        onBlur={(e) => {
          const n = Number.parseInt(e.target.value, 10)
          if (Number.isFinite(n)) setCapacity(n)
        }}
        className={cn(CONTROL_CLASS, "w-16 text-right tabular-nums")}
      />
    </label>
  )
}

/** Перемикач хеш-функції: навчальна «сума кодів» / поліноміальна. */
function HashFnSelect() {
  const hashFn = useHashTableStore((s) => s.hashFn)
  const setHashFn = useHashTableStore((s) => s.setHashFn)
  const t = useT()
  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="text-muted-foreground">{t("editor.htHashFn")}</span>
      <select
        aria-label={t("editor.htHashFn")}
        value={hashFn}
        onChange={(e) => setHashFn(e.target.value as HashFnId)}
        className={CONTROL_CLASS}
      >
        <option value="sum">{t("editor.htHashSum")}</option>
        <option value="poly">{t("editor.htHashPoly")}</option>
      </select>
    </label>
  )
}

export function EditorView() {
  const ctrl = useHashTableEditor()
  const t = useT()

  const toolbar = (
    <>
      <Button size="sm" variant="outline" onClick={ctrl.onLoadClassic}>
        <BookOpen /> {t("editor.htClassic")}
      </Button>
      <Button size="sm" variant="outline" onClick={ctrl.onLoadAnagrams}>
        <Sparkles /> {t("editor.htAnagrams")}
      </Button>
      <Button size="sm" variant="outline" onClick={ctrl.onLoadRandom}>
        <Shuffle /> {t("editor.random")}
      </Button>
      <Button size="sm" variant="outline" onClick={() => ctrl.onAddOp("insert")}>
        <Plus /> {t("editor.htAddOp")}
      </Button>
      <Button size="sm" variant="outline" onClick={ctrl.onClear}>
        <Trash2 /> {t("editor.clear")}
      </Button>
    </>
  )

  const help = (
    <EditorHelp
      items={[
        { action: "insert · get · delete", desc: t("editor.htHelpKind") },
        { action: t("editor.htCapacity"), desc: t("editor.htHelpCapacity") },
        { action: t("editor.htHashFn"), desc: t("editor.htHelpHashFn") },
      ]}
      note={t("editor.helpHtNote")}
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
        <div className="flex flex-wrap items-center gap-4">
          <CapacityField />
          <HashFnSelect />
        </div>
        <OpsTable />
      </div>
      <HashPreviewPanel className="lg:w-72" />
    </EditorViewShell>
  )
}
