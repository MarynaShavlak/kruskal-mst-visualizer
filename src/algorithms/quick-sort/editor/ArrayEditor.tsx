import { useQuickSortStore } from "@/store/quick-sort-store"
import { ArrayEditor as SharedArrayEditor } from "@/algorithms/shared/editor/ArrayEditor"
import { useT } from "@/i18n/use-t"

/** Редактор масиву швидкого сортування — тонка обгортка спільного ArrayEditor. */
export function ArrayEditor({ className }: { className?: string }) {
  const t = useT()
  const values = useQuickSortStore((s) => s.values)
  const updateValue = useQuickSortStore((s) => s.updateValue)
  const removeValue = useQuickSortStore((s) => s.removeValue)

  return (
    <SharedArrayEditor
      className={className}
      values={values}
      updateValue={updateValue}
      removeValue={removeValue}
      emptyText={t("editor.qsNoValues")}
      ariaValue={(i) => t("editor.qsAriaValue", { i })}
      deleteAt={(i) => t("editor.qsDeleteAt", { i })}
      cellMin={0}
    />
  )
}
