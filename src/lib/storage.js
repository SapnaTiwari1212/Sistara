/**
 * Namespaced browser storage helpers.
 *
 * Wrapped in try/catch because storage can throw in private-mode browsers,
 * and so the app degrades to in-memory only instead of crashing.
 *
 * `store`        → localStorage, survives a browser restart ("Remember me").
 * `store.temporary` → sessionStorage, cleared with the tab ("Don't remember me").
 *
 * Both share one prefix and one in-memory fallback, and the fallback is shared
 * between them so a sign-in still resolves when storage is unavailable.
 */

const PREFIX = 'sistara:'

const memoryFallback = new Map()

const safe = (fn, fallback) => {
  try {
    return fn()
  } catch {
    return fallback
  }
}

const getItem = (key, fallback) =>
  safe(() => {
    const raw = window.localStorage.getItem(PREFIX + key)
    return raw ? JSON.parse(raw) : fallback
  }, memoryFallback.has(key) ? memoryFallback.get(key) : fallback)

const setItem = (key, value) =>
  safe(() => {
    window.localStorage.setItem(PREFIX + key, JSON.stringify(value))
  }, memoryFallback.set(key, value))

const removeItem = (key) =>
  safe(() => {
    window.localStorage.removeItem(PREFIX + key)
  }, memoryFallback.delete(key))

const getTempItem = (key, fallback) =>
  safe(() => {
    const raw = window.sessionStorage.getItem(PREFIX + key)
    return raw ? JSON.parse(raw) : fallback
  }, memoryFallback.has(key) ? memoryFallback.get(key) : fallback)

const setTempItem = (key, value) =>
  safe(() => {
    window.sessionStorage.setItem(PREFIX + key, JSON.stringify(value))
  }, memoryFallback.set(key, value))

const removeTempItem = (key) =>
  safe(() => {
    window.sessionStorage.removeItem(PREFIX + key)
  }, memoryFallback.delete(key))

const store = {
  get: getItem,
  set: setItem,
  remove: removeItem,

  /** Same API, but scoped to the tab via sessionStorage. */
  temporary: {
    get: getTempItem,
    set: setTempItem,
    remove: removeTempItem,
  },

  /** Drops a key from both storages — used when moving a session between them. */
  clearBoth(key) {
    removeItem(key)
    removeTempItem(key)
  },
}

export default store
