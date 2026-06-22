import { useShellSortStore } from "@/store/shell-sort-store"
import { ArrayEditor as SharedArrayEditor } from "@/algorithms/shared/editor/ArrayEditor"
import { useT } from "@/i18n/use-t"

/** Редактор масиву сортування Шелла — тонка обгортка спільного ArrayEditor. */
export function ArrayEditor({ className }: { className?: string }) {
  const t = useT()
  const values = useShellSortStore((s) => s.values)
  const updateValue = useShellSortStore((s) => s.updateValue)
  const removeValue = useShellSortStore((s) => s.removeValue)

  return (
    <SharedArrayEditor
      className={className}
      values={values}
      updateValue={updateValue}
      removeValue={removeValue}
      emptyText={t("editor.shNoValues")}
      ariaValue={(i) => t("editor.shAriaValue", { i })}
      deleteAt={(i) => t("editor.shDeleteAt", { i })}
      cellMin={0}
    />
  )
}
