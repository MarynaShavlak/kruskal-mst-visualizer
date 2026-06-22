// Контролер редактора пошуку Боєра-Мура: пресети, імпорт/експорт/шаринг. Як інші
// редактори пошуку — БЕЗ React Flow: текст + шаблон прямо у Zustand-сторі.

import { useCallback, useEffect, type ChangeEvent } from "react"
import { readGraphParam } from "@/algorithms/shared/editor/use-graph-editor"
import { boyerMooreStringSearchCodec } from "@/algorithms/boyer-moore-string-search/editor/boyer-moore-string-search-doc"
import { setHash } from "@/hooks/use-route"
import { tr } from "@/i18n/use-t"
import { toast } from "@/store/toast-store"
import { useBoyerMooreStringSearchStore } from "@/store/boyer-moore-string-search-store"

const EXPORT_FILENAME = "boyer-moore-string-search.json"
const ROUTE_PATH = "boyer-moore-string-search/editor"

const loadedRoutes = new Set<string>()

export interface BoyerMooreStringSearchEditorController {
  readonly onLoadMain: () => void
  readonly onLoadBigJumps: () => void
  readonly onLoadWorst: () => void
  readonly onLoadMulti: () => void
  readonly onLoadRandom: () => void
  readonly onClear: () => void
  readonly onExport: () => void
  readonly onImportFile: (event: ChangeEvent<HTMLInputElement>) => void
  readonly onShare: () => void
}

export function useBoyerMooreStringSearchEditor(): BoyerMooreStringSearchEditorController {
  const clear = useBoyerMooreStringSearchStore((s) => s.clear)
  const loadMain = useBoyerMooreStringSearchStore((s) => s.loadMain)
  const loadBigJumps = useBoyerMooreStringSearchStore((s) => s.loadBigJumps)
  const loadWorst = useBoyerMooreStringSearchStore((s) => s.loadWorst)
  const loadMulti = useBoyerMooreStringSearchStore((s) => s.loadMulti)
  const loadRandom = useBoyerMooreStringSearchStore((s) => s.loadRandom)
  const loadDoc = useBoyerMooreStringSearchStore((s) => s.loadDoc)
  const toDoc = useBoyerMooreStringSearchStore((s) => s.toDoc)

  useEffect(() => {
    if (loadedRoutes.has(ROUTE_PATH)) return
    loadedRoutes.add(ROUTE_PATH)
    const param = readGraphParam(window.location.hash)
    if (!param) return
    const doc = boyerMooreStringSearchCodec.decodeHash(param)
    if (doc) loadDoc(doc)
  }, [loadDoc])

  const onExport = useCallback(() => {
    const blob = new Blob([boyerMooreStringSearchCodec.toJSON(toDoc())], {
      type: "application/json",
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = EXPORT_FILENAME
    a.click()
    URL.revokeObjectURL(url)
  }, [toDoc])

  const onImportFile = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      e.target.value = ""
      if (!file) return
      file
        .text()
        .then((text) => loadDoc(boyerMooreStringSearchCodec.fromJSON(text)))
        .catch((err: unknown) => {
          toast({
            title: tr("editor.importFailed"),
            description: err instanceof Error ? err.message : String(err),
            variant: "destructive",
          })
        })
    },
    [loadDoc],
  )

  const onShare = useCallback(() => {
    const hash = boyerMooreStringSearchCodec.encodeHash(toDoc())
    const route = `${ROUTE_PATH}?g=${hash}`
    const url = `${window.location.origin}${window.location.pathname}#${route}`
    setHash(route)
    void navigator.clipboard?.writeText(url).then(
      () => toast({ description: tr("editor.linkCopied") }),
      () => undefined,
    )
  }, [toDoc])

  return {
    onLoadMain: loadMain,
    onLoadBigJumps: loadBigJumps,
    onLoadWorst: loadWorst,
    onLoadMulti: loadMulti,
    onLoadRandom: useCallback(
      () => loadRandom(Math.floor(Math.random() * 1e9)),
      [loadRandom],
    ),
    onClear: clear,
    onExport,
    onImportFile,
    onShare,
  }
}
