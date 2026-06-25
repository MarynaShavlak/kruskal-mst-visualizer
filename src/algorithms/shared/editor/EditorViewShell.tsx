import { useRef, type ChangeEvent, type ReactNode } from "react"
import { Code2, Download, Share2, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useT } from "@/i18n/use-t"

// Спільний каркас екрана-редактора (масив / текст-шаблон / предмети — БЕЗ React Flow):
// тулбар з алгоритмо-специфічними кнопками + однаковий кластер імпорт/експорт/шаринг,
// дворядкове тіло (бокс редактора + панель-підсумок) і блок довідки. Алгоритмо-
// специфічне (пресет-кнопки, тіло, довідка) інжектиться слотами.

export interface EditorViewShellProps {
  /** Алгоритмо-специфічні кнопки тулбару: пресети, додавання, сортування, очистка. */
  readonly toolbar: ReactNode
  readonly onImportFile: (event: ChangeEvent<HTMLInputElement>) => void
  readonly onExport: () => void
  readonly onShare: () => void
  /** Копіює `<iframe>`-сніпет embed-режиму (опц. — лишає старі виклики сумісними). */
  readonly onCopyEmbed?: () => void
  /** Тіло редактора: бокс вводу + панель-підсумок (зазвичай дві колонки на lg). */
  readonly children: ReactNode
  /** Блок довідки під тілом (зазвичай <EditorHelp />). */
  readonly help?: ReactNode
}

/** Каркас не-графового редактора: тулбар + тіло + довідка. */
export function EditorViewShell({
  toolbar,
  onImportFile,
  onExport,
  onShare,
  onCopyEmbed,
  children,
  help,
}: EditorViewShellProps) {
  const t = useT()
  const fileInputRef = useRef<HTMLInputElement>(null)

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        {toolbar}
        <div className="mx-1 h-5 w-px bg-border" />
        <Button
          size="sm"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload /> {t("editor.import")}
        </Button>
        <Button size="sm" variant="outline" onClick={onExport}>
          <Download /> {t("editor.export")}
        </Button>
        <Button size="sm" variant="outline" onClick={onShare}>
          <Share2 /> {t("editor.share")}
        </Button>
        {onCopyEmbed && (
          <Button size="sm" variant="outline" onClick={onCopyEmbed}>
            <Code2 /> {t("embed.copyCode")}
          </Button>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={onImportFile}
        />
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-start">
        {children}
      </div>

      {help}
    </div>
  )
}
