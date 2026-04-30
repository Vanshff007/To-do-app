/* ============================================================
   helpers.js — Shared Utility Functions
   ============================================================ */

const Helpers = {
  /** Escape HTML to prevent XSS */
  escape(str) {
    const d = document.createElement('div');
    d.appendChild(document.createTextNode(String(str)));
    return d.innerHTML;
  },

  /** Format ISO date (YYYY-MM-DD) to human-readable */
  formatDate(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr + 'T00:00:00');
    const today    = new Date(); today.setHours(0,0,0,0);
    const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
    const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);

    if (d.getTime() === today.getTime())     return 'Today';
    if (d.getTime() === tomorrow.getTime())  return 'Tomorrow';
    if (d.getTime() === yesterday.getTime()) return 'Yesterday';

    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  },

  /** Format HH:MM to 12-hour */
  formatTime(timeStr) {
    if (!timeStr) return '';
    const [h, m] = timeStr.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12  = h % 12 || 12;
    return `${h12}:${String(m).padStart(2,'0')} ${ampm}`;
  },

  /** Today as YYYY-MM-DD */
  todayIso() {
    return new Date().toISOString().slice(0, 10);
  },

  /** Get greeting based on time */
  getGreeting() {
    const h = new Date().getHours();
    if (h < 5)  return 'Good night';
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    if (h < 21) return 'Good evening';
    return 'Good night';
  },

  /** Format current date long-form */
  getLongDate() {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long', month: 'long', day: 'numeric',
    });
  },

  /** Get CSS class for category */
  catClass(cat) {
    const map = { work:'cat-work', personal:'cat-personal', meeting:'cat-meeting',
                  health:'cat-health', finance:'cat-finance', other:'cat-other' };
    return map[cat] || 'cat-other';
  },

  /** Get CSS class for priority badge */
  prioClass(p) {
    const map = { high:'pb-high', medium:'pb-medium', low:'pb-low' };
    return map[p] || 'pb-low';
  },

  /** Color for timeline event based on category */
  catTimelineColor(cat) {
    const map = { work:'blue', personal:'violet', meeting:'rose', health:'green', finance:'amber', other:'gray' };
    return map[cat] || 'gray';
  },

  /** Category display label */
  catLabel(cat) {
    const map = { work:'Work', personal:'Personal', meeting:'Meeting', health:'Health', finance:'Finance', other:'Other' };
    return map[cat] || 'Other';
  },

  /** Category bar fill color for breakdown */
  catColor(cat) {
    const map = {
      work: 'var(--cat-work)', personal: 'var(--cat-personal)',
      meeting: 'var(--cat-meeting)', health: 'var(--cat-health)',
      finance: 'var(--cat-finance)', other: 'var(--cat-other)',
    };
    return map[cat] || 'var(--cat-other)';
  },

  /** Generate a range of 7 dates centred on today for calendar strip */
  getWeekDates(centreDate) {
    const dates = [];
    const base = centreDate ? new Date(centreDate + 'T00:00:00') : new Date();
    base.setHours(0,0,0,0);
    // 3 before, today, 3 after
    for (let i = -3; i <= 10; i++) {
      const d = new Date(base);
      d.setDate(base.getDate() + i);
      dates.push({
        iso:  d.toISOString().slice(0, 10),
        day:  d.toLocaleDateString('en-US', { weekday: 'short' }),
        num:  d.getDate(),
      });
    }
    return dates;
  },

  /** Check if an ISO date is in the past */
  isPast(dateStr) {
    if (!dateStr) return false;
    return new Date(dateStr + 'T00:00:00') < new Date(new Date().setHours(0,0,0,0));
  },

  /** Check if overdue (past + not done) */
  isOverdue(task) {
    return !task.done && !!task.deadline && this.isPast(task.deadline);
  },

  /** Debounce */
  debounce(fn, ms) {
    let t;
    return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
  },
};
