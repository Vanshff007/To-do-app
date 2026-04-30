/* ============================================================
   TasksScreen.js — Full Task List with Filters
   ============================================================ */

const TasksScreen = (() => {
  let _el        = null;
  let _listEl    = null;
  let _filter    = 'all';
  let _allTasks  = [];
  let _searchVal = '';

  const FILTERS = [
    { id: 'all',      label: 'All'      },
    { id: 'active',   label: 'Active'   },
    { id: 'today',    label: 'Today'    },
    { id: 'high',     label: 'Priority' },
    { id: 'work',     label: 'Work'     },
    { id: 'personal', label: 'Personal' },
    { id: 'done',     label: 'Done'     },
  ];

  function build() {
    _el = document.createElement('div');
    _el.className = 'screen';
    _el.id = 's-tasks';

    _el.innerHTML = `
      <h2 class="sr-only">Task list</h2>

      <!-- Header -->
      <div class="screen-header">
        <div class="greeting">
          <small>Manage</small>
          <h1>My Tasks</h1>
        </div>
        <button class="avatar-btn" aria-label="Add task"
          style="background:linear-gradient(135deg,var(--blue),var(--violet))"
          onclick="TaskModal.open()">+</button>
      </div>

      <!-- Search -->
      <div style="padding:var(--sp-md) var(--sp-lg) 0">
        <div style="position:relative">
          <svg style="position:absolute;left:12px;top:50%;transform:translateY(-50%);color:var(--text-hint);pointer-events:none"
               width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
               stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
          </svg>
          <input id="tasks-search" class="form-input"
            type="search" placeholder="Search tasks…"
            style="padding-left:36px"
            aria-label="Search tasks" />
        </div>
      </div>

      <!-- Filter Chips -->
      <div class="filter-row" role="group" aria-label="Filter tasks by category">
        ${FILTERS.map(f => `
          <button class="filter-chip${f.id === _filter ? ' active' : ''}"
            data-filter="${f.id}" aria-pressed="${f.id === _filter}">
            ${f.label}
          </button>
        `).join('')}
      </div>

      <!-- Count label -->
      <div style="padding:0 var(--sp-lg) var(--sp-sm);display:flex;justify-content:space-between;align-items:center">
        <span id="tasks-count" style="font-size:12px;color:var(--text-hint)"></span>
        <span style="font-size:11px;color:var(--text-hint)">Tap task to toggle done</span>
      </div>

      <!-- Task List -->
      <div class="tasks-list" id="tasks-list-el" role="list" aria-live="polite"></div>

      <div class="bottom-spacer"></div>
    `;

    document.getElementById('app').appendChild(_el);

    /* ---- Filter chip clicks ---- */
    _el.querySelectorAll('.filter-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        _filter = chip.dataset.filter;
        _el.querySelectorAll('.filter-chip').forEach(c => {
          c.classList.toggle('active', c.dataset.filter === _filter);
          c.setAttribute('aria-pressed', c.dataset.filter === _filter);
        });
        _render();
      });
    });

    /* ---- Search ---- */
    const searchEl = _el.querySelector('#tasks-search');
    searchEl.addEventListener('input', Helpers.debounce(e => {
      _searchVal = e.target.value.trim().toLowerCase();
      _render();
    }, 220));

    _listEl = _el.querySelector('#tasks-list-el');

    TaskStore.subscribe(tasks => {
      _allTasks = tasks;
      _render();
    });
  }

  function _render() {
    if (!_listEl) return;

    let tasks = TaskStore.getByFilter(_filter);

    // Apply search
    if (_searchVal) {
      tasks = tasks.filter(t =>
        t.title.toLowerCase().includes(_searchVal) ||
        t.note?.toLowerCase().includes(_searchVal) ||
        t.category.toLowerCase().includes(_searchVal)
      );
    }

    // Sort: undone first, then by deadline, then by priority weight
    const prioWeight = { high: 0, medium: 1, low: 2 };
    tasks.sort((a, b) => {
      if (a.done !== b.done) return a.done ? 1 : -1;
      if (a.deadline && b.deadline) {
        const diff = a.deadline.localeCompare(b.deadline);
        if (diff !== 0) return diff;
      } else if (a.deadline) return -1;
      else if (b.deadline) return 1;
      return (prioWeight[a.priority] ?? 1) - (prioWeight[b.priority] ?? 1);
    });

    _listEl.innerHTML = '';

    // Update count label
    const countEl = _el.querySelector('#tasks-count');
    if (countEl) countEl.textContent = `${tasks.length} task${tasks.length !== 1 ? 's' : ''}`;

    if (tasks.length === 0) {
      const emptyMsgs = {
        all:      ['No tasks yet',          'Tap + to add your first task'],
        active:   ['All caught up! ✓',      'No pending tasks right now'],
        today:    ['Nothing due today',      'Enjoy your free time!'],
        high:     ['No high priority tasks', 'You\'re in good shape'],
        done:     ['Nothing completed yet',  'Start checking off tasks'],
        work:     ['No work tasks',          'Add a work task to get started'],
        personal: ['No personal tasks',      'Add a personal task to get started'],
      };
      const [msg, sub] = emptyMsgs[_filter] || ['No tasks', ''];
      _listEl.appendChild(TaskCard.renderEmpty(msg, sub));
      return;
    }

    tasks.forEach((task, i) => {
      const card = TaskCard.create(task);
      card.style.animationDelay = `${i * 30}ms`;
      _listEl.appendChild(card);
    });
  }

  function activate() {
    _el.classList.add('active');
    _render();
  }

  function deactivate() {
    _el.classList.remove('active');
  }

  return { build, activate, deactivate };
})();
