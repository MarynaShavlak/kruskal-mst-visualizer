// Стан service worker'а для PWA: чи готова офлайн-версія і чи є оновлення, яке
// чекає на застосування. Реєстрація живе в main.tsx (virtual:pwa-register),
// а сюди лише штовхає колбеки. Тримаємо в Zustand, щоб PwaUpdatePrompt реагував
// реактивно, а main.tsx писав стан через getState() поза React.

import { create } from "zustand"

/** Викликає skipWaiting + перезавантаження; інжектиться з registerSW(). */
export type UpdateSW = (reload?: boolean) => Promise<void>

interface PwaState {
  /** Є нова версія SW у waiting — показуємо банер «Оновити». */
  readonly needRefresh: boolean
  /** Контент закешовано, застосунок працюватиме офлайн (одноразове повідомлення). */
  readonly offlineReady: boolean
  /** Функція застосування оновлення (reload). null до реєстрації SW. */
  readonly updateSW: UpdateSW | null
  setNeedRefresh: (v: boolean) => void
  setOfflineReady: (v: boolean) => void
  setUpdateSW: (fn: UpdateSW) => void
  /** Закрити банер оновлення без застосування. */
  dismissNeedRefresh: () => void
  /** Закрити повідомлення «готово до офлайну». */
  dismissOfflineReady: () => void
}

export const usePwaStore = create<PwaState>()((set) => ({
  needRefresh: false,
  offlineReady: false,
  updateSW: null,
  setNeedRefresh: (needRefresh) => set({ needRefresh }),
  setOfflineReady: (offlineReady) => set({ offlineReady }),
  setUpdateSW: (updateSW) => set({ updateSW }),
  dismissNeedRefresh: () => set({ needRefresh: false }),
  dismissOfflineReady: () => set({ offlineReady: false }),
}))
