import { describe, it, expect, beforeEach, vi } from "vitest"

import { usePwaStore } from "./pwa-store"

describe("pwa-store", () => {
  beforeEach(() => {
    usePwaStore.setState({
      needRefresh: false,
      offlineReady: false,
      updateSW: null,
    })
  })

  it("дефолтний стан — без оновлення й без офлайн-готовності", () => {
    const s = usePwaStore.getState()
    expect(s.needRefresh).toBe(false)
    expect(s.offlineReady).toBe(false)
    expect(s.updateSW).toBeNull()
  })

  it("setNeedRefresh / setOfflineReady перемикають прапорці", () => {
    usePwaStore.getState().setNeedRefresh(true)
    usePwaStore.getState().setOfflineReady(true)

    const s = usePwaStore.getState()
    expect(s.needRefresh).toBe(true)
    expect(s.offlineReady).toBe(true)
  })

  it("setUpdateSW зберігає інжектовану функцію оновлення", () => {
    const fn = vi.fn(async () => {})
    usePwaStore.getState().setUpdateSW(fn)

    expect(usePwaStore.getState().updateSW).toBe(fn)
  })

  it("dismissNeedRefresh знімає лише банер оновлення", () => {
    usePwaStore.setState({ needRefresh: true, offlineReady: true })
    usePwaStore.getState().dismissNeedRefresh()

    const s = usePwaStore.getState()
    expect(s.needRefresh).toBe(false)
    expect(s.offlineReady).toBe(true)
  })

  it("dismissOfflineReady знімає лише повідомлення офлайну", () => {
    usePwaStore.setState({ needRefresh: true, offlineReady: true })
    usePwaStore.getState().dismissOfflineReady()

    const s = usePwaStore.getState()
    expect(s.needRefresh).toBe(true)
    expect(s.offlineReady).toBe(false)
  })
})
