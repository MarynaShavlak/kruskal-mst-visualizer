import { useMergeSortStore } from "@/store/merge-sort-store"
import { ArrayEditor as SharedArrayEditor } from "@/algorithms/shared/editor/ArrayEditor"
import { useT } from "@/i18n/use-t"

/** Редактор масиву сортування злиттям — тонка обгортка спільного ArrayEditor. */
export function ArrayEditor({ className }: { className?: string }) {
  const t = useT()
  const values = useMergeSortStore((s) => s.values)
  const updateValue = useMergeSortStore((s) => s.updateValue)
  const removeValue = useMergeSortStore((s) => s.removeValue)

  return (
    <SharedArrayEditor
      className={className}
      values={values}
      updateValue={updateValue}
      removeValue={removeValue}
      emptyText={t("editor.msNoValues")}
      ariaValue={(i) => t("editor.msAriaValue", { i })}
      deleteAt={(i) => t("editor.msDeleteAt", { i })}
      cellMin={0}
    />
  )
}
