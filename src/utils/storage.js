/* ============================================================
   storage.js — LocalStorage Persistence Layer
   ============================================================ */

const STORAGE_KEY = 'taskflow_tasks_v1';

const Storage = {
  /**
   * Load all tasks from localStorage.
   * Returns an empty array if nothing is stored or data is corrupt.
   * @returns {Task[]}
   */
  load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed;
    } catch {
      console.warn('[TaskFlow] Failed to load tasks from storage.');
      return [];
    }
  },

  /**
   * Persist the full tasks array to localStorage.
   * @param {Task[]} tasks
   */
  save(tasks) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch (e) {
      console.warn('[TaskFlow] Failed to save tasks:', e);
    }
  },

  /**
   * Wipe all stored tasks.
   */
  clear() {
    localStorage.removeItem(STORAGE_KEY);
  },
};
