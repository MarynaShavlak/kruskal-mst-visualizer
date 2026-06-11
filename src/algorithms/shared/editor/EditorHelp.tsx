/**
 * Підказка під редактором: список «дія → ефект». Дію (жест/клавішу) виділяємо
 * чипом, щоб одразу було видно всі доступні дії. Items та note інжектить кожен
 * редактор зі свого i18n (дії спільні там, де збігаються).
 */
export interface EditorHelpItem {
  /** Жест або клавіша — виділяється чипом. */
  readonly action: string
  /** Що ця дія робить. */
  readonly desc: string
}

export function EditorHelp({
  items,
  note,
}: {
  items: readonly EditorHelpItem[]
  note?: string
}) {
  return (
    <div className="text-xs text-muted-foreground">
      <ul className="flex flex-col gap-1.5">
        {items.map((it) => (
          <li key={it.action} className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <span className="rounded border bg-muted px-1.5 py-0.5 font-medium text-foreground">
              {it.action}
            </span>
            <span>{it.desc}</span>
          </li>
        ))}
      </ul>
      {note && <p className="mt-2">{note}</p>}
    </div>
  )
}
