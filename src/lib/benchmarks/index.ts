// Barrel усіх дескрипторів бенчмарку: ІМПОРТ цього модуля реєструє всі ядра в
// BENCHMARK_REGISTRY (side-effect `registerBenchmark` у кожному файлі). Воркер і
// generic-View тягнуть саме його, тож воркер резолвить closures за `descriptorId`
// без серіалізації функцій. Кожен новий benchmark-дескриптор додається сюди.

import { sortBenchmark } from "@/lib/benchmarks/sort-benchmark"

export { sortBenchmark }
