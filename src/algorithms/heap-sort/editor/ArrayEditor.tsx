import { useHeapSortStore } from "@/store/heap-sort-store"
import { ArrayEditor as SharedArrayEditor } from "@/algorithms/shared/editor/ArrayEditor"
import { useT } from "@/i18n/use-t"

/** Редактор масиву пірамідального сортування — тонка обгортка спільного ArrayEditor. */
export function ArrayEditor({ className }: { className?: string }) {
  const t = useT()
  const values = useHeapSortStore((s) => s.values)
  const updateValue = useHeapSortStore((s) => s.updateValue)
  const removeValue = useHeapSortStore((s) => s.removeValue)

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
