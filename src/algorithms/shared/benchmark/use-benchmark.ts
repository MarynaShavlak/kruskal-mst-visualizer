import { useCallback, useEffect, useRef, useState } from "react"
import type { SeriesPoint } from "@/lib/benchmark-descriptor"
import type {
  GenericBenchMessage,
  GenericBenchRequest,
} from "@/algorithms/shared/benchmark/generic-benchmark.worker"

/**
 * Узагальнений хук бенчмарку: запускає спільний воркер для дескриптора `descriptorId`,
 * стрімить точки. Воркер резолвить closures за id (замикання не серіалізуються),
 * тож по дроту йде лише id + опційні розміри/seed.
 */
export function useGenericBenchmark(descriptorId: string) {
  const [points, setPoints] = useState<SeriesPoint[]>([])
  const [running, setRunning] = useState(false)
  const workerRef = useRef<Worker | null>(null)

  useEffect(() => {
    return () => workerRef.current?.terminate()
  }, [])

  const run = useCallback(
    (opts?: Omit<GenericBenchRequest, "descriptorId">) => {
      workerRef.current?.terminate()
      setPoints([])
      setRunning(true)

      const worker = new Worker(
        new URL("./generic-benchmark.worker.ts", import.meta.url),
        { type: "module" },
      )
      workerRef.current = worker

      const finish = () => {
        setRunning(false)
        worker.terminate()
        if (workerRef.current === worker) workerRef.current = null
      }

      worker.onmessage = (e: MessageEvent<GenericBenchMessage>) => {
        const msg = e.data
        if (msg.type === "point") {
          setPoints((prev) => [...prev, msg.point])
        } else {
          finish()
        }
      }

      worker.postMessage({ descriptorId, ...opts } satisfies GenericBenchRequest)
    },
    [descriptorId],
  )

  return { points, running, run }
}
