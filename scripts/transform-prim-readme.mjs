// Одноразовий трансформер: README Python-проєкту algo-prim → навчальний контент
// додатка (`content.ua.md` / `content.en.md`). Зберігає прозу/код/фігури автора
// ДОСЛІВНО, лише прибирає GitHub-«хром» (бейджі, перемикач мов, якорі, лінії),
// анімації (gif/mp4 — у застосунку їх замінюють живі віджети) та сервісні секції
// (структура репозиторію, швидкий старт, ліцензія), а заголовки секцій переводить
// у нумеровану конвенцію `## N.`, яку розуміють спільні parseToc/LearnView.
//
// Запуск:  node scripts/transform-prim-readme.mjs [шлях-до-algo-prim]
import { readFileSync, writeFileSync } from "node:fs"

const SRC = process.argv[2] ?? "/home/m-shavlak/WebstormProjects/algo-prim"
const OUT = "src/algorithms/prim/learn"

// Сервісні секції README, що не мають сенсу в застосунку (лінкують на інші файли).
const DROP_SECTIONS = new Set([
  "Структура репозиторію",
  "Швидкий старт",
  "Ліцензія",
  "Repository structure",
  "Quick start",
  "License",
])

/** Прибрати будь-яку провідну нумерацію з тексту заголовка ("3. Foo" → "Foo"). */
function stripLeadingNumber(s) {
  return s.replace(/^\s*\d+\.\s+/, "").trim()
}

function transform(raw) {
  const lines = raw.split("\n")
  const out = []
  let inFence = false
  let inToc = false
  let sawTitle = false
  let skipSection = false
  let counter = 0

  for (const line of lines) {
    const fence = /^\s*```/.test(line)
    if (fence) {
      if (!skipSection) out.push(line)
      inFence = !inFence
      continue
    }
    if (inFence) {
      if (!skipSection) out.push(line)
      continue
    }

    // Блок «## Зміст / Contents» — до наступного заголовка верхнього рівня.
    if (/^##\s+(Зміст|Contents)\s*$/.test(line)) {
      inToc = true
      continue
    }
    if (inToc) {
      if (/^#{1,2}\s/.test(line)) inToc = false // дійшли до наступного h1/h2
      else continue
    }

    // GitHub-«хром» та анімації, які не мають сенсу в застосунку.
    if (/img\.shields\.io/.test(line)) continue // бейджі (зокрема обгорнуті в лінк)
    if (/🇺🇦|🇬🇧/.test(line)) continue // перемикач мов угорі
    if (/^<a\s+id=/.test(line)) continue // якорі змісту
    if (/^---+\s*$/.test(line)) continue // горизонтальні лінії-роздільники
    if (/^!\[[^\]]*\]\([^)]+\.(gif|mp4)\)/.test(line)) continue // анімації (gif/mp4)
    if (/^\s*🎬/.test(line)) continue // «MP4-версія: …»
    if (/^\s*▶️/.test(line)) continue // підводки до анімацій

    // Заголовки: перший h1 лишаємо як назву; решту h1/h2 — у нумеровані `## N.`,
    // окрім сервісних секцій із denylist (їх вирізаємо цілком).
    const h = /^(#{1,2})\s+(.*\S)\s*$/.exec(line)
    if (h) {
      if (!sawTitle && h[1] === "#") {
        sawTitle = true
        skipSection = false
        out.push(`# ${h[2].trim()}`)
        continue
      }
      const title = stripLeadingNumber(h[2])
      if (DROP_SECTIONS.has(title)) {
        skipSection = true
        continue
      }
      skipSection = false
      counter += 1
      out.push(`## ${counter}. ${title}`)
      continue
    }

    if (skipSection) continue
    out.push(line)
  }

  // Стиснути потрійні+ порожні рядки (після вирізань) до подвійних.
  return out.join("\n").replace(/\n{3,}/g, "\n\n").replace(/^\n+/, "") + "\n"
}

for (const [inName, outName] of [
  ["README.md", "content.ua.md"],
  ["README.en.md", "content.en.md"],
]) {
  const raw = readFileSync(`${SRC}/${inName}`, "utf8")
  const result = transform(raw)
  writeFileSync(`${OUT}/${outName}`, result)
  const sections = (result.match(/^## \d+\. /gm) || []).length
  const images = (result.match(/^!\[/gm) || []).length
  console.log(`${inName} → ${outName}: ${sections} секцій, ${images} фігур`)
}
