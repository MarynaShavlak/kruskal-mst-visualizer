import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import "./index.css"
import App from "./App.tsx"
import { usePwaStore } from "@/store/pwa-store"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// Реєстрація service worker'а — імперативно, ПОЗА React і лише в PROD-білді.
// `virtual:pwa-register` існує тільки при vite build (плагін VitePWA), тож
// динамічний імпорт за import.meta.env.PROD тримає Vitest/dev чистими (модуль
// там не резолвиться). registerType:'prompt' → оновлення чекає кліку.
if (import.meta.env.PROD) {
  void import("virtual:pwa-register").then(({ registerSW }) => {
    const updateSW = registerSW({
      onNeedRefresh() {
        usePwaStore.getState().setNeedRefresh(true)
      },
      onOfflineReady() {
        usePwaStore.getState().setOfflineReady(true)
      },
    })
    usePwaStore.getState().setUpdateSW(updateSW)
  })
}
