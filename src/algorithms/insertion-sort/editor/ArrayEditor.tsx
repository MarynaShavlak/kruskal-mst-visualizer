import { useInsertionSortStore } from "@/store/insertion-sort-store"
import { ArrayEditor as SharedArrayEditor } from "@/algorithms/shared/editor/ArrayEditor"
import { useT } from "@/i18n/use-t"

/** Редактор масиву сортування вставками — тонка обгортка спільного ArrayEditor. */
export function ArrayEditor({ className }: { className?: string }) {
  const t = useT()
  const values = useInsertionSortStore((s) => s.values)
  const updateValue = useInsertionSortStore((s) => s.updateValue)
  const removeValue = useInsertionSortStore((s) => s.removeValue)

  return (
    <SharedArrayEditor
      className={className}
      values={values}
      updateValue={updateValue}
      removeValue={removeValue}
      emptyText={t("editor.arrNoValues")}
      ariaValue={(i) => t("editor.arrAriaValue", { i })}
      deleteAt={(i) => t("editor.arrDeleteAt", { i })}
      cellMin={0}
    />
  )
}
