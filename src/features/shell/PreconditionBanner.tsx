import { PreconditionCard } from "@/algorithms/shared/editor/precondition"
import { useBinarySearchStore } from "@/store/binary-search-store"
import { useInterpolationSearchStore } from "@/store/interpolation-search-store"
import { useIndexedSequentialSearchStore } from "@/store/indexed-sequential-search-store"
import { useGraphStore } from "@/store/graph-store"
import { usePrimGraphStore } from "@/store/prim-graph-store"
import { isSorted } from "@/lib/arrayUtils"
import { analyzeGraph } from "@/lib/graphAnalysis"
import { useT } from "@/i18n/use-t"
import type { Algorithm } from "@/algorithms/types"
import type { Graph } from "@/lib/graph"

// Живий детектор передумови у ШАПЦІ розділу. Це єдиний місток `features/shell` → стори
// (свідомий cross-layer): шапка не має доступу до стору, тож адаптер за `precondition.kind`
// та `id` алгоритму обирає правильний стор-хук і lib-перевірку, лишаючи `PreconditionCard`
// чисто презентаційним. Граф-передумова — ІНФОРМАТИВНА, не блокуюча (незв'язність →
// валідний остовний ліс), тож формулюємо без слова «помилка».
//
// Тонкі під-компоненти (Sorted*/Connected*) локалізують coupling: кожен викликає РІВНО
// один стор-хук безумовно (правила хуків), а батько лише маршрутизує за kind/id.

/** Картка для алгоритмів із передумовою «масив відсортований». */
function SortedArrayBanner({
  algorithm,
  values,
}: {
  algorithm: Algorithm
  values: readonly number[]
}) {
  const t = useT()
  const ok = isSorted(values)
  return (
    <PreconditionCard
      className="no-print mt-4 mb-4"
      title={t("precond.title")}
      typical={algorithm.complexity.typical}
      worst={algorithm.complexity.worst}
      typicalLabel={t("precond.typical")}
      worstLabel={t("precond.worst")}
      ok={ok}
      okText={t("precond.sortedOk")}
      badText={t("precond.sortedBad")}
      note={t("precond.note")}
    />
  )
}

/** Адаптери «sorted-array» — кожен прив'язаний до свого стору пошуку. */
function BinarySortedBanner({ algorithm }: { algorithm: Algorithm }) {
  const values = useBinarySearchStore((s) => s.values)
  return <SortedArrayBanner algorithm={algorithm} values={values} />
}

function InterpolationSortedBanner({ algorithm }: { algorithm: Algorithm }) {
  const values = useInterpolationSearchStore((s) => s.values)
  return <SortedArrayBanner algorithm={algorithm} values={values} />
}

function IndexedSequentialSortedBanner({ algorithm }: { algorithm: Algorithm }) {
  const values = useIndexedSequentialSearchStore((s) => s.values)
  return <SortedArrayBanner algorithm={algorithm} values={values} />
}

/** Картка для алгоритмів МОД із передумовою «граф зв'язний» (інформативна). */
function ConnectedGraphBanner({
  algorithm,
  graph,
}: {
  algorithm: Algorithm
  graph: Graph
}) {
  const t = useT()
  const a = analyzeGraph(graph)
  const ok = a.isConnected
  const badText =
    a.vertexCount === 0
      ? t("precond.connectedEmpty")
      : t("precond.connectedBad", { n: a.componentCount })
  return (
    <PreconditionCard
      className="no-print mt-4 mb-4"
      title={t("precond.title")}
      typical={algorithm.complexity.typical}
      worst={algorithm.complexity.worst}
      typicalLabel={t("precond.typical")}
      worstLabel={t("precond.worst")}
      ok={ok}
      okText={t("precond.connectedOk")}
      badText={badText}
      note={t("precond.note")}
    />
  )
}

/** Адаптери «connected-graph» — кожен прив'язаний до свого стору МОД. */
function KruskalConnectedBanner({ algorithm }: { algorithm: Algorithm }) {
  const graph = useGraphStore((s) => s.graph)
  return <ConnectedGraphBanner algorithm={algorithm} graph={graph} />
}

function PrimConnectedBanner({ algorithm }: { algorithm: Algorithm }) {
  const graph = usePrimGraphStore((s) => s.graph)
  return <ConnectedGraphBanner algorithm={algorithm} graph={graph} />
}

/**
 * Маршрутизатор картки передумови за дескриптором алгоритму. `null`, коли передумови
 * немає (лінійний/наївний пошук, сортування тощо). Граф-передумову роз'єднуємо за id
 * (kruskal → graph-store, prim → prim-graph-store), бо кожен МОД має окремий стор.
 */
export function PreconditionBanner({ algorithm }: { algorithm: Algorithm }) {
  const pre = algorithm.precondition
  if (!pre) return null

  if (pre.kind === "sorted-array") {
    switch (algorithm.id) {
      case "binary-search":
        return <BinarySortedBanner algorithm={algorithm} />
      case "interpolation-search":
        return <InterpolationSortedBanner algorithm={algorithm} />
      case "indexed-sequential-search":
        return <IndexedSequentialSortedBanner algorithm={algorithm} />
      default:
        return null
    }
  }

  if (pre.kind === "connected-graph") {
    switch (algorithm.id) {
      case "kruskal":
        return <KruskalConnectedBanner algorithm={algorithm} />
      case "prim":
        return <PrimConnectedBanner algorithm={algorithm} />
      default:
        return null
    }
  }

  return null
}
