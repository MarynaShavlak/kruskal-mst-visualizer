// Одноразовий трансформер: README Python-проєкту algo-naive-string-search →
// навчальний контент додатка (`content.ua.md` / `content.en.md`). Зберігає прозу/код/
// фігури автора ДОСЛІВНО, лише прибирає GitHub-«хром» і переводить заголовки секцій у
// нумеровану конвенцію `## N.`, яку розуміють спільні parseToc/LearnView. H3/H4
// (підсекції, кроки трасування) лишаються як є. Рядки з .mp4-зображеннями прибираємо —
// вони дублюють .gif (той самий стем → той самий живий віджет).
//
// Запуск:  node scripts/transform-boyer-moore-string-search-readme.mjs [шлях-до-репо]
import { readFileSync, writeFileSync } from "node:fs"

const SRC = process.argv[2] ?? "/home/m-shavlak/WebstormProjects/algo-boyer-moore-string-search"
const OUT = "src/algorithms/boyer-moore-string-search/learn"

/** Прибрати будь-яку провідну нумерацію з тексту заголовка ("3. Foo" → "Foo"). */
function stripLeadingNumber(s) {
  return s.replace(/^\s*\d+\.\s+/, "").trim()
}

/** Екранує `[` всередині alt-тексту зображень `![alt](url)` (вкладена `[` ламає розбір). */
function escapeImageAltBrackets(s) {
  return s.replace(/!\[([^\]]*)\]/g, (_, alt) => `![${alt.replace(/\[/g, "\\[")}]`)
}

function transform(raw) {
  const lines = raw.split("\n")
  const out = []
  let inFence = false
  let inToc = false
  let sawTitle = false
  let counter = 0

  for (let idx = 0; idx < lines.length; idx++) {
    const line = lines[idx]

    const fence = /^\s*```/.test(line)
    if (fence) {
      inFence = !inFence
      out.push(line)
      continue
    }
    if (inFence) {
      out.push(line)
      continue
    }

    // Блок «## Зміст» / «## Contents» / «## Table of contents» — до наступного заголовка.
    if (/^##\s+(Зміст|Contents|Table of contents)\s*$/i.test(line)) {
      inToc = true
      continue
    }
    if (inToc) {
      if (/^#{1,2}\s/.test(line)) inToc = false
      else continue
    }

    // GitHub-«хром», який не має сенсу в застосунку.
    if (/img\.shields\.io/.test(line)) continue // бейджі (зокрема лінковані)
    if (/🇺🇦|🇬🇧/.test(line)) continue // перемикач мов угорі
    if (/^<a\s+id=/.test(line)) continue // якорі змісту
    if (/^<!--.*-->\s*$/.test(line)) continue // HTML-коментарі (маркери WALKTHROUGH)
    if (/^---+\s*$/.test(line)) continue // горизонтальні лінії-роздільники
    if (/\]\([^)]*\.mp4\)/.test(line)) continue // .mp4 (зображення чи посилання) — мертве в застосунку, дублює .gif

    // Заголовки: перший h1 лишаємо як назву; решту h1/h2 — у нумеровані `## N.`.
    // H3/H4 (підсекції, кроки трасування) лишаємо як є.
    const h = /^(#{1,2})\s+(.*\S)\s*$/.exec(line)
    if (h) {
      if (!sawTitle && h[1] === "#") {
        sawTitle = true
        out.push(`# ${h[2].trim()}`)
        continue
      }
      counter += 1
      out.push(`## ${counter}. ${stripLeadingNumber(h[2])}`)
      continue
    }

    out.push(escapeImageAltBrackets(line))
  }

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
