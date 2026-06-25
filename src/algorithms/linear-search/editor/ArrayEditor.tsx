import { useLinearSearchStore } from "@/store/linear-search-store"
import { ArrayEditor as SharedArrayEditor } from "@/algorithms/shared/editor/ArrayEditor"
import { useT } from "@/i18n/use-t"

/**
 * Редактор масиву + ЦІЛЬ лінійного пошуку — тонка обгортка спільного ArrayEditor.
 * Дозволені будь-які цілі (зокрема від'ємні); масив не тримається відсортованим.
 */
export function ArrayEditor({ className }: { className?: string }) {
  const t = useT()
  const values = useLinearSearchStore((s) => s.values)
  const target = useLinearSearchStore((s) => s.target)
  const updateValue = useLinearSearchStore((s) => s.updateValue)
  const removeValue = useLinearSearchStore((s) => s.removeValue)
  const setTarget = useLinearSearchStore((s) => s.setTarget)

  return (
    <SharedArrayEditor
      className={className}
      values={values}
      updateValue={updateValue}
      removeValue={removeValue}
      emptyText={t("editor.arrNoValues")}
      ariaValue={(i) => t("editor.arrAriaValue", { i })}
      deleteAt={(i) => t("editor.arrDeleteAt", { i })}
      cellWidthClass="w-16"
      fields={[
        {
          value: target,
          onCommit: setTarget,
          label: t("editor.lsTargetLabel"),
          aria: t("editor.searchAriaTarget"),
          tone: "rose",
          icon: true,
        },
      ]}
    />
  )
}
