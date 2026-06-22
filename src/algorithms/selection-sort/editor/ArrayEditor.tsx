import { useSelectionSortStore } from "@/store/selection-sort-store"
import { ArrayEditor as SharedArrayEditor } from "@/algorithms/shared/editor/ArrayEditor"
import { useT } from "@/i18n/use-t"

/** Редактор масиву сортування вибором — тонка обгортка спільного ArrayEditor. */
export function ArrayEditor({ className }: { className?: string }) {
  const t = useT()
  const values = useSelectionSortStore((s) => s.values)
  const updateValue = useSelectionSortStore((s) => s.updateValue)
  const removeValue = useSelectionSortStore((s) => s.removeValue)

  return (
    <SharedArrayEditor
      className={className}
      values={values}
      updateValue={updateValue}
      removeValue={removeValue}
      emptyText={t("editor.ssNoValues")}
      ariaValue={(i) => t("editor.ssAriaValue", { i })}
      deleteAt={(i) => t("editor.ssDeleteAt", { i })}
      cellMin={0}
    />
  )
}
