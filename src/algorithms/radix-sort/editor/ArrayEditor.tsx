import { useRadixSortStore } from "@/store/radix-sort-store"
import { ArrayEditor as SharedArrayEditor } from "@/algorithms/shared/editor/ArrayEditor"
import { useT } from "@/i18n/use-t"

/**
 * Редактор масиву порозрядного сортування — тонка обгортка спільного ArrayEditor.
 * Працює з невід'ємними цілими; клітинки ширші (числа можуть бути великі).
 */
export function ArrayEditor({ className }: { className?: string }) {
  const t = useT()
  const values = useRadixSortStore((s) => s.values)
  const updateValue = useRadixSortStore((s) => s.updateValue)
  const removeValue = useRadixSortStore((s) => s.removeValue)

  return (
    <SharedArrayEditor
      className={className}
      values={values}
      updateValue={updateValue}
      removeValue={removeValue}
      emptyText={t("editor.rxNoValues")}
      ariaValue={(i) => t("editor.rxAriaValue", { i })}
      deleteAt={(i) => t("editor.rxDeleteAt", { i })}
      cellMin={0}
      cellWidthClass="w-16"
    />
  )
}
