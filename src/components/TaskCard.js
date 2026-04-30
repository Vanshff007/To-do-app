/* ============================================================
   TaskCard.js — Task Item Renderer
   ============================================================ */

const TaskCard = {
  /**
   * Render a single task <div> element (not HTML string — actual DOM element)
   * @param {Task} task
   * @returns {HTMLElement}
   */
  create(task) {
    const el = document.createElement('div');
    el.className = `task-item${task.done ? ' done' : ''}`;
    el.dataset.taskId   = task.id;
    el.dataset.priority = task.priority;

    const deadlineDisplay = task.deadline
      ? (Helpers.isOverdue(task) && !task.done
          ? `<span style="color:var(--red)">${Helpers.formatDate(task.deadline)}</span>`
          : Helpers.formatDate(task.deadline))
      : '';

    const timeDisplay = task.time ? Helpers.formatTime(task.time) : '';

    const metaParts = [
      `<span class="task-category ${Helpers.catClass(task.category)}">${Helpers.catLabel(task.category)}</span>`,
      `<span class="task-priority-badge ${Helpers.prioClass(task.priority)}">${task.priority}</span>`,
    ];
    if (deadlineDisplay) metaParts.push(`<span class="task-time">${deadlineDisplay}${timeDisplay ? ' · ' + timeDisplay : ''}</span>`);

    el.innerHTML = `
      <div class="task-check" role="checkbox" aria-checked="${task.done}"
           aria-label="Mark as ${task.done ? 'incomplete' : 'complete'}" tabindex="0">
        <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
          <path d="M1.5 5.5l2.8 2.8 5.2-5.2" stroke="white" stroke-width="1.8"
                stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>

      <div class="task-body">
        <div class="task-title">${Helpers.escape(task.title)}</div>
        <div class="task-meta">${metaParts.join('')}</div>
        ${task.note ? `<div style="font-size:11px;color:var(--text-hint);margin-top:5px;line-height:1.4">${Helpers.escape(task.note)}</div>` : ''}
      </div>

      <div class="task-actions">
        <button class="task-action-btn edit"   aria-label="Edit task"   data-action="edit">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
               stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
        </button>
        <button class="task-action-btn delete" aria-label="Delete task" data-action="delete">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
               stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
            <path d="M10 11v6M14 11v6"/>
            <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
          </svg>
        </button>
      </div>
    `;

    /* ---- Attach event listeners ---- */
    const checkEl = el.querySelector('.task-check');

    const doToggle = () => {
      const nowDone = TaskStore.toggle(task.id);
      el.classList.toggle('done', nowDone);
      checkEl.setAttribute('aria-checked', String(nowDone));
      checkEl.setAttribute('aria-label', `Mark as ${nowDone ? 'incomplete' : 'complete'}`);
      Toast.show(nowDone ? 'Task completed! 🎉' : 'Task marked incomplete.', nowDone ? 'success' : 'info');
    };

    checkEl.addEventListener('click', e => { e.stopPropagation(); doToggle(); });
    checkEl.addEventListener('keydown', e => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); doToggle(); } });

    el.querySelector('[data-action="edit"]').addEventListener('click', e => {
      e.stopPropagation();
      const t = TaskStore.getById(task.id);
      if (t) TaskModal.openEdit(t);
    });

    el.querySelector('[data-action="delete"]').addEventListener('click', async e => {
      e.stopPropagation();
      const confirmed = await ConfirmDialog.ask(
        'Delete task?',
        `"${task.title}" will be permanently removed.`
      );
      if (!confirmed) return;
      el.classList.add('removing');
      el.addEventListener('animationend', () => {
        TaskStore.delete(task.id);
      }, { once: true });
      Toast.show('Task deleted.', 'info');
    });

    return el;
  },

  /** Render empty state */
  renderEmpty(message = 'No tasks yet', sub = 'Tap + to add your first task') {
    const el = document.createElement('div');
    el.className = 'empty-state';
    el.innerHTML = `
      <div class="empty-icon">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor"
             stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="3"/>
          <path d="M9 12l2 2 4-4"/>
        </svg>
      </div>
      <h3>${Helpers.escape(message)}</h3>
      <p>${Helpers.escape(sub)}</p>
    `;
    return el;
  },
};
