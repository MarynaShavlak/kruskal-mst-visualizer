// Одноразовий трансформер: README Python-проєкту algo-knapsack → навчальний
// контент додатка (`content.ua.md` / `content.en.md`). Зберігає прозу/код/фігури
// автора ДОСЛІВНО, лише прибирає GitHub-«хром» і переводить заголовки секцій у
// нумеровану конвенцію `## N.`, яку розуміють спільні parseToc/LearnView.
//
// Запуск:  node scripts/transform-knapsack-readme.mjs [шлях-до-algo-knapsack]
import { readFileSync, writeFileSync } from "node:fs"

const SRC = process.argv[2] ?? "/home/m-shavlak/WebstormProjects/algo-knapsack"
const OUT = "src/algorithms/knapsack/learn"

/** Прибрати будь-яку провідну нумерацію з тексту заголовка ("3. Foo" → "Foo"). */
function stripLeadingNumber(s) {
  return s.replace(/^\s*\d+\.\s+/, "").trim()
}

function transform(raw) {
  const lines = raw.split("\n")
  const out = []
  let inFence = false
  let inToc = false
  let inDetails = false
  let sawTitle = false
  let counter = 0

  for (let idx = 0; idx < lines.length; idx++) {
    const line = lines[idx]

    // <details>…</details> у README обгортають ЛИШЕ код генерації matplotlib-
    // фігур — у застосунку зайвий (кожну фігуру замінює живий віджет).
    if (/^<details>/.test(line)) {
      inDetails = true
      continue
    }
    if (inDetails) {
      if (/^<\/details>/.test(line)) inDetails = false
      continue
    }
    if (/^<Figure size .*Axes>\s*$/.test(line)) continue

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

    // Блок «## Зміст» — від заголовка до наступного заголовка верхнього рівня.
    if (/^##\s+(Зміст|Contents)\s*$/.test(line)) {
      inToc = true
      continue
    }
    // TOC у цьому README закінчується наступним заголовком будь-якого рівня (усі
    // секції тут — h2, тож завершуємо на ^#{1,2}; рядок-заголовок не ковтаємо).
    if (inToc) {
      if (/^#{1,2}\s/.test(line)) inToc = false
      else continue
    }

    // GitHub-«хром», який не має сенсу в застосунку.
    if (/img\.shields\.io/.test(line)) continue // бейджі (зокрема лінковані [![…]](…))
    if (/🇺🇦|🇬🇧/.test(line)) continue // перемикач мов угорі
    if (/^<a\s+id=/.test(line)) continue // якорі змісту
    if (/^>\s*🛠️/.test(line) || /\[project\.md\]/.test(line)) continue // нотатка про project.md
    if (/^---+\s*$/.test(line)) continue // горизонтальні лінії-роздільники

    // Заголовки: перший h1 лишаємо як назву; решту h1/h2 — у нумеровані `## N.`.
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

    out.push(line)
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
