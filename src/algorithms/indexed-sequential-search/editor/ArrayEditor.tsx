import { useIndexedSequentialSearchStore } from "@/store/indexed-sequential-search-store"
import { ArrayEditor as SharedArrayEditor } from "@/algorithms/shared/editor/ArrayEditor"
import { useT } from "@/i18n/use-t"

/**
 * Редактор масиву + ЦІЛЬ + КРОК індексу — тонка обгортка спільного ArrayEditor.
 * Верхній ряд: ціль (🌹) і крок індексу (🟣, ≥ 1). ПЕРЕДУМОВА — масив відсортований
 * (стан/кнопка «Відсортувати» — в EditorView).
 */
export function ArrayEditor({ className }: { className?: string }) {
  const t = useT()
  const values = useIndexedSequentialSearchStore((s) => s.values)
  const target = useIndexedSequentialSearchStore((s) => s.target)
  const step = useIndexedSequentialSearchStore((s) => s.step)
  const updateValue = useIndexedSequentialSearchStore((s) => s.updateValue)
  const removeValue = useIndexedSequentialSearchStore((s) => s.removeValue)
  const setTarget = useIndexedSequentialSearchStore((s) => s.setTarget)
  const setStep = useIndexedSequentialSearchStore((s) => s.setStep)

  return (
    <SharedArrayEditor
      className={className}
      values={values}
      updateValue={updateValue}
      removeValue={removeValue}
      emptyText={t("editor.issNoValues")}
      ariaValue={(i) => t("editor.issAriaValue", { i })}
      deleteAt={(i) => t("editor.issDeleteAt", { i })}
      cellWidthClass="w-16"
      fields={[
        {
          value: target,
          onCommit: setTarget,
          label: t("editor.issTargetLabel"),
          aria: t("editor.issAriaTarget"),
          tone: "rose",
          icon: true,
        },
        {
          value: step,
          onCommit: setStep,
          label: t("editor.issStepLabel"),
          aria: t("editor.issAriaStep"),
          tone: "violet",
          min: 1,
        },
      ]}
    />
  )
}
