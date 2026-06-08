// Web Worker: рахує бенчмарк по розмірах, не блокуючи UI.
import { benchmarkPoint, DEFAULT_SIZES, type BenchPoint } from "@/lib/benchmark"

export interface BenchRequest {
  sizes?: number[]
  seed?: number
}

export type BenchMessage =
  | { type: "point"; point: BenchPoint }
  | { type: "done" }

const post = (msg: BenchMessage): void => {
  ;(self as unknown as { postMessage: (m: BenchMessage) => void }).postMessage(
    msg,
  )
}

self.onmessage = (e: MessageEvent) => {
  const req = (e.data ?? {}) as BenchRequest
  const sizes = req.sizes ?? DEFAULT_SIZES
  const seed = req.seed ?? 1
  for (const size of sizes) {
    post({ type: "point", point: benchmarkPoint(size, seed) })
  }
  post({ type: "done" })
}
