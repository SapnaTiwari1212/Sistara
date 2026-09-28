/**
 * Namespaced localStorage helpers.
 * Wrapped in try/catch because storage can throw in private-mode browsers,
 * and so the app degrades to in-memory only instead of crashing.
 */

const PREFIX = 'sistara:'

const memoryFallback = new Map()

const store = {
  get(key, fallback = null) {
    try {
      const raw = window.localStorage.getItem(PREFIX + key)
      return raw ? JSON.parse(raw) : fallback
    } catch {
      return memoryFallback.has(key) ? memoryFallback.get(key) : fallback
    }
  },
  set(key, value) {
    try {
      window.localStorage.setItem(PREFIX + key, JSON.stringify(value))
    } catch {
      memoryFallback.set(key, value)
    }
  },
  remove(key) {
    try {
      window.localStorage.removeItem(PREFIX + key)
    } catch {
      memoryFallback.delete(key)
    }
  },
}

export default store
