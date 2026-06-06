# Kruskal MST Visualizer

[![Deploy to GitHub Pages](https://github.com/MarynaShavlak/kruskal-mst-visualizer/actions/workflows/deploy.yml/badge.svg)](https://github.com/MarynaShavlak/kruskal-mst-visualizer/actions/workflows/deploy.yml)

Інтерактивний навчальний застосунок про **алгоритм Краскала** (мінімальне остовне дерево, МОД).
Компаньйон до Python-репозиторію з повним розбором:
https://github.com/MarynaShavlak/algo-krustal-mst

Мова інтерфейсу та контенту — українська.

🔗 **Демо:** https://marynashavlak.github.io/kruskal-mst-visualizer/

## Стек

- Vite + React 19 + TypeScript (strict)
- Tailwind CSS v4 + shadcn/ui
- Vitest + Testing Library

> Бібліотеки візуалізації (@xyflow/react, Recharts, react-markdown + Shiki, Motion, Zustand)
> підключаються у відповідних фазах роадмепу.

## Локальний запуск

```bash
nvm use            # Node 22 (див. .nvmrc)
npm install
npm run dev        # http://localhost:5173/kruskal-mst-visualizer/
```

Інші скрипти:

```bash
npm run build      # tsc -b && vite build
npm run preview    # перегляд продакшн-збірки під base-path
npm test           # юніт-тести (Vitest)
```

## Структура

```
src/
  lib/         алгоритмічне ядро (граф, DSU, Краскал, trace) — без залежності від UI
  features/    learn · editor · playback · benchmark
  components/  спільний UI (shadcn — у components/ui)
  store/       стан застосунку
  hooks/       хуки (напр. синхронізація вкладки з URL-хешем)
```

## Деплой

Автоматичний на **GitHub Pages** через GitHub Actions при push у `main`
(`.github/workflows/deploy.yml`). У `vite.config.ts` задано `base: "/kruskal-mst-visualizer/"`.

## Ліцензія

[MIT](./LICENSE)
