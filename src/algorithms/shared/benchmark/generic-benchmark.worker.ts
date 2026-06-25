// Узагальнений Web Worker бенчмарку: рахує точки для БУДЬ-ЯКОГО зареєстрованого
// дескриптора, не блокуючи UI. По дроту приходить лише `descriptorId` (+опц.
// розміри/seed); closures воркер дістає локально з BENCHMARK_REGISTRY (імпорт
// barrel реєструє всі ядра). Один спільний воркер на фіксованому шляху (Vite).

import "@/lib/benchmarks"
import {
  getBenchmarkCore,
  runBenchmarkPoint,
  type SeriesPoint,
} from "@/lib/benchmark-descriptor"

export interface GenericBenchRequest {
  descriptorId: string
  sizes?: number[]
  seed?: number
}

export type GenericBenchMessage =
  | { type: "point"; point: SeriesPoint }
  | { type: "done" }
  | { type: "error"; message: string }

const post = (msg: GenericBenchMessage): void => {
  ;(self as unknown as { postMessage: (m: GenericBenchMessage) => void }).postMessage(msg)
}

self.onmessage = (e: MessageEvent) => {
  const req = (e.data ?? {}) as GenericBenchRequest
  const core = getBenchmarkCore(req.descriptorId)
  if (!core) {
    post({ type: "error", message: `Unknown benchmark descriptor: ${req.descriptorId}` })
    return
  }
  const sizes = req.sizes ?? core.sizes
  const seed = req.seed ?? 1
  for (const size of sizes) {
    post({ type: "point", point: runBenchmarkPoint(core, size, seed) })
  }
  post({ type: "done" })
}
