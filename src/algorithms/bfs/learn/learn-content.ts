// Навчальний контент BFS: локальні content.*.md (UA/EN), що ведуться вручну.
import uaRaw from "./content.ua.md?raw"
import enRaw from "./content.en.md?raw"
import { makeLearnContent } from "@/algorithms/shared/learn/learn-content"

export const LEARN_CONTENT = makeLearnContent(uaRaw, enRaw)
