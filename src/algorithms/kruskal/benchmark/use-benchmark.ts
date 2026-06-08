import { useCallback, useEffect, useRef, useState } from "react"
import type { BenchPoint } from "@/lib/benchmark"
import type {
  BenchMessage,
  BenchRequest,
} from "@/algorithms/kruskal/benchmark/benchmark.worker"

export function useBenchmark() {
  const [points, setPoints] = useState<BenchPoint[]>([])
  const [running, setRunning] = useState(false)
  const workerRef = useRef<Worker | null>(null)

  useEffect(() => {
    return () => workerRef.current?.terminate()
  }, [])

  const run = useCallback((req?: BenchRequest) => {
    workerRef.current?.terminate()
    setPoints([])
    setRunning(true)

    const worker = new Worker(
      new URL("./benchmark.worker.ts", import.meta.url),
      { type: "module" },
    )
    workerRef.current = worker

    worker.onmessage = (e: MessageEvent<BenchMessage>) => {
      const msg = e.data
      if (msg.type === "point") {
        setPoints((prev) => [...prev, msg.point])
      } else {
        setRunning(false)
        worker.terminate()
        if (workerRef.current === worker) workerRef.current = null
      }
    }

    worker.postMessage(req ?? {})
  }, [])

  return { points, running, run }
}
