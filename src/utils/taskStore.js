/* ============================================================
   taskStore.js — Task State Management (CRUD + Observers)
   ============================================================ */

/**
 * @typedef {Object} Task
 * @property {string}  id        - Unique UUID
 * @property {string}  title     - Task title
 * @property {string}  category  - work | personal | meeting | health | finance | other
 * @property {string}  priority  - high | medium | low
 * @property {string}  deadline  - ISO date string (YYYY-MM-DD) or ''
 * @property {string}  time      - HH:MM string or ''
 * @property {string}  note      - Optional note text
 * @property {boolean} done      - Completion state
 * @property {number}  createdAt - Unix timestamp ms
 */

const TaskStore = (() => {
  let _tasks = [];
  const _listeners = new Set();

  /* ---- Private helpers ---- */
  const _notify = () => _listeners.forEach(fn => fn([..._tasks]));

  const _generateId = () =>
    `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

  /* ---- Public API ---- */
  return {
    /** Load from storage and notify subscribers */
    init() {
      _tasks = Storage.load();
      _notify();
    },

    /** Subscribe to task changes. Returns unsubscribe fn. */
    subscribe(fn) {
      _listeners.add(fn);
      fn([..._tasks]); // immediate call with current state
      return () => _listeners.delete(fn);
    },

    /** Get a snapshot of all tasks */
    getAll() {
      return [..._tasks];
    },

    /** Get a single task by id */
    getById(id) {
      return _tasks.find(t => t.id === id) || null;
    },

    /**
     * Add a new task
     * @param {Omit<Task,'id'|'done'|'createdAt'>} data
     * @returns {Task}
     */
    add(data) {
      const task = {
        id:        _generateId(),
        title:     data.title.trim(),
        category:  data.category  || 'other',
        priority:  data.priority  || 'medium',
        deadline:  data.deadline  || '',
        time:      data.time      || '',
        note:      data.note      ? data.note.trim() : '',
        done:      false,
        createdAt: Date.now(),
      };
      _tasks.unshift(task);
      Storage.save(_tasks);
      _notify();
      return task;
    },

    /**
     * Update an existing task
     * @param {string} id
     * @param {Partial<Task>} updates
     * @returns {Task|null}
     */
    update(id, updates) {
      const idx = _tasks.findIndex(t => t.id === id);
      if (idx === -1) return null;
      _tasks[idx] = { ..._tasks[idx], ...updates };
      Storage.save(_tasks);
      _notify();
      return _tasks[idx];
    },

    /**
     * Toggle done state
     * @param {string} id
     * @returns {boolean} new done state
     */
    toggle(id) {
      const idx = _tasks.findIndex(t => t.id === id);
      if (idx === -1) return false;
      _tasks[idx].done = !_tasks[idx].done;
      Storage.save(_tasks);
      _notify();
      return _tasks[idx].done;
    },

    /**
     * Delete a task
     * @param {string} id
     */
    delete(id) {
      _tasks = _tasks.filter(t => t.id !== id);
      Storage.save(_tasks);
      _notify();
    },

    /* ---- Derived / computed helpers ---- */
    getTotalCount()     { return _tasks.length; },
    getDoneCount()      { return _tasks.filter(t => t.done).length; },
    getPendingCount()   { return _tasks.filter(t => !t.done).length; },

    getCompletionPct() {
      if (_tasks.length === 0) return 0;
      return Math.round((this.getDoneCount() / _tasks.length) * 100);
    },

    getByCategory(cat) {
      return _tasks.filter(t => t.category === cat);
    },

    getByDate(dateStr) {
      return _tasks.filter(t => t.deadline === dateStr);
    },

    getByFilter(filter) {
      switch (filter) {
        case 'active':   return _tasks.filter(t => !t.done);
        case 'done':     return _tasks.filter(t => t.done);
        case 'high':     return _tasks.filter(t => t.priority === 'high' && !t.done);
        case 'today': {
          const today = new Date().toISOString().slice(0, 10);
          return _tasks.filter(t => t.deadline === today);
        }
        case 'work':     return _tasks.filter(t => t.category === 'work');
        case 'personal': return _tasks.filter(t => t.category === 'personal');
        default:         return [..._tasks];
      }
    },

    /** Weekly completions — returns array of 7 counts (Mon→Sun) for current week */
    getWeeklyStats() {
      const now = new Date();
      const day = now.getDay(); // 0=Sun
      const mon = new Date(now);
      mon.setDate(now.getDate() - ((day + 6) % 7));
      mon.setHours(0,0,0,0);

      const counts = new Array(7).fill(0);
      _tasks.forEach(t => {
        if (!t.done || !t.deadline) return;
        const d = new Date(t.deadline + 'T00:00:00');
        const diff = Math.floor((d - mon) / 86400000);
        if (diff >= 0 && diff < 7) counts[diff]++;
      });
      return counts;
    },

    getCategoryBreakdown() {
      const cats = ['work','personal','meeting','health','finance','other'];
      return cats.map(c => ({
        cat:   c,
        total: _tasks.filter(t => t.category === c).length,
        done:  _tasks.filter(t => t.category === c && t.done).length,
      })).filter(x => x.total > 0);
    },
  };
})();
