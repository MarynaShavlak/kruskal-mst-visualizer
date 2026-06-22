import { useBinarySearchStore } from "@/store/binary-search-store"
import { ArrayEditor as SharedArrayEditor } from "@/algorithms/shared/editor/ArrayEditor"
import { useT } from "@/i18n/use-t"

/**
 * Редактор масиву + ЦІЛЬ двійкового пошуку — тонка обгортка спільного ArrayEditor.
 * ПЕРЕДУМОВА — масив відсортований (стан/кнопка «Відсортувати» — в EditorView).
 */
export function ArrayEditor({ className }: { className?: string }) {
  const t = useT()
  const values = useBinarySearchStore((s) => s.values)
  const target = useBinarySearchStore((s) => s.target)
  const updateValue = useBinarySearchStore((s) => s.updateValue)
  const removeValue = useBinarySearchStore((s) => s.removeValue)
  const setTarget = useBinarySearchStore((s) => s.setTarget)

  return (
    <SharedArrayEditor
      className={className}
      values={values}
      updateValue={updateValue}
      removeValue={removeValue}
      emptyText={t("editor.binNoValues")}
      ariaValue={(i) => t("editor.binAriaValue", { i })}
      deleteAt={(i) => t("editor.binDeleteAt", { i })}
      cellWidthClass="w-16"
      fields={[
        {
          value: target,
          onCommit: setTarget,
          label: t("editor.binTargetLabel"),
          aria: t("editor.binAriaTarget"),
          tone: "rose",
          icon: true,
        },
      ]}
    />
  )
}
