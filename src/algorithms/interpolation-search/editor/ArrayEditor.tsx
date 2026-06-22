import { useInterpolationSearchStore } from "@/store/interpolation-search-store"
import { ArrayEditor as SharedArrayEditor } from "@/algorithms/shared/editor/ArrayEditor"
import { useT } from "@/i18n/use-t"

/**
 * Редактор масиву + ЦІЛЬ інтерполяційного пошуку — тонка обгортка спільного ArrayEditor.
 * ПЕРЕДУМОВА — масив відсортований (стан/кнопка «Відсортувати» — в EditorView).
 */
export function ArrayEditor({ className }: { className?: string }) {
  const t = useT()
  const values = useInterpolationSearchStore((s) => s.values)
  const target = useInterpolationSearchStore((s) => s.target)
  const updateValue = useInterpolationSearchStore((s) => s.updateValue)
  const removeValue = useInterpolationSearchStore((s) => s.removeValue)
  const setTarget = useInterpolationSearchStore((s) => s.setTarget)

  return (
    <SharedArrayEditor
      className={className}
      values={values}
      updateValue={updateValue}
      removeValue={removeValue}
      emptyText={t("editor.ipNoValues")}
      ariaValue={(i) => t("editor.ipAriaValue", { i })}
      deleteAt={(i) => t("editor.ipDeleteAt", { i })}
      cellWidthClass="w-16"
      fields={[
        {
          value: target,
          onCommit: setTarget,
          label: t("editor.ipTargetLabel"),
          aria: t("editor.ipAriaTarget"),
          tone: "rose",
          icon: true,
        },
      ]}
    />
  )
}
