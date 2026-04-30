/* ============================================================
   TaskModal.js — Add / Edit Task Bottom Sheet
   ============================================================ */

const TaskModal = (() => {
  let _overlay   = null;
  let _mode      = 'add';   // 'add' | 'edit'
  let _editId    = null;
  let _priority  = 'medium';

  /* ---- Build DOM (once) ---- */
  function _build() {
    _overlay = document.createElement('div');
    _overlay.className = 'modal-overlay';
    _overlay.setAttribute('role', 'dialog');
    _overlay.setAttribute('aria-modal', 'true');
    _overlay.setAttribute('aria-label', 'Task form');

    _overlay.innerHTML = `
      <div class="modal-sheet" id="task-modal-sheet">
        <div class="modal-handle" aria-hidden="true"></div>

        <div class="modal-header">
          <h2 class="modal-title" id="modal-title-text">New Task</h2>
          <button class="modal-close" id="modal-close-btn" aria-label="Close">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
              <path d="M1 1l12 12M13 1L1 13"/>
            </svg>
          </button>
        </div>

        <div class="form-body">
          <!-- Title -->
          <div class="form-group">
            <label class="form-label" for="field-title">Task Title *</label>
            <input id="field-title" class="form-input" type="text"
              placeholder="What needs to be done?" maxlength="120" autocomplete="off" />
          </div>

          <!-- Category -->
          <div class="form-group">
            <label class="form-label" for="field-category">Category</label>
            <div class="select-wrap">
              <select id="field-category" class="form-select">
                <option value="work">💼 Work</option>
                <option value="personal">🏠 Personal</option>
                <option value="meeting">🤝 Meeting</option>
                <option value="health">💪 Health</option>
                <option value="finance">💰 Finance</option>
                <option value="other">🔖 Other</option>
              </select>
            </div>
          </div>

          <!-- Priority -->
          <div class="form-group">
            <label class="form-label">Priority</label>
            <div class="priority-chips" id="priority-chips">
              <button class="priority-chip" data-value="high"   type="button">High</button>
              <button class="priority-chip" data-value="medium" type="button">Medium</button>
              <button class="priority-chip" data-value="low"    type="button">Low</button>
            </div>
          </div>

          <!-- Date & Time -->
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
            <div class="form-group">
              <label class="form-label" for="field-deadline">Deadline</label>
              <input id="field-deadline" class="form-input" type="date" />
            </div>
            <div class="form-group">
              <label class="form-label" for="field-time">Time</label>
              <input id="field-time" class="form-input" type="time" />
            </div>
          </div>

          <!-- Note -->
          <div class="form-group">
            <label class="form-label" for="field-note">Note <span style="color:var(--text-hint);font-weight:400;text-transform:none;letter-spacing:0">(optional)</span></label>
            <textarea id="field-note" class="form-input form-textarea"
              placeholder="Add a note or details…" maxlength="500"></textarea>
          </div>
        </div>

        <div class="form-footer">
          <button class="btn-secondary" id="modal-cancel-btn">Cancel</button>
          <button class="btn-primary"   id="modal-submit-btn">Add Task</button>
        </div>
      </div>
    `;

    document.body.appendChild(_overlay);

    /* ---- Event listeners ---- */
    _overlay.querySelector('#modal-close-btn').addEventListener('click',  close);
    _overlay.querySelector('#modal-cancel-btn').addEventListener('click', close);
    _overlay.querySelector('#modal-submit-btn').addEventListener('click', _submit);

    // Backdrop close
    _overlay.addEventListener('click', e => { if (e.target === _overlay) close(); });

    // Priority chips
    _overlay.querySelectorAll('.priority-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        _priority = chip.dataset.value;
        _overlay.querySelectorAll('.priority-chip').forEach(c => c.classList.remove('selected'));
        chip.classList.add('selected');
      });
    });

    // Keyboard
    _overlay.addEventListener('keydown', e => {
      if (e.key === 'Escape') close();
      if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA' && e.target.tagName !== 'BUTTON') {
        e.preventDefault();
        _submit();
      }
    });
  }

  /* ---- Set priority chip UI ---- */
  function _setPriority(p) {
    _priority = p;
    if (!_overlay) return;
    _overlay.querySelectorAll('.priority-chip').forEach(c => {
      c.classList.toggle('selected', c.dataset.value === p);
    });
  }

  /* ---- Validate & submit ---- */
  function _submit() {
    const titleEl = _overlay.querySelector('#field-title');
    const title   = titleEl.value.trim();

    if (!title) {
      titleEl.focus();
      titleEl.classList.add('error');
      titleEl.addEventListener('input', () => titleEl.classList.remove('error'), { once: true });
      Toast.show('Please enter a task title.', 'error');
      return;
    }

    const data = {
      title,
      category: _overlay.querySelector('#field-category').value,
      priority: _priority,
      deadline: _overlay.querySelector('#field-deadline').value,
      time:     _overlay.querySelector('#field-time').value,
      note:     _overlay.querySelector('#field-note').value,
    };

    if (_mode === 'add') {
      TaskStore.add(data);
      Toast.show('Task added!', 'success');
    } else {
      TaskStore.update(_editId, data);
      Toast.show('Task updated!', 'success');
    }

    close();
  }

  /* ---- Public API ---- */
  function open() {
    if (!_overlay) _build();

    _mode   = 'add';
    _editId = null;

    // Reset form
    _overlay.querySelector('#field-title').value    = '';
    _overlay.querySelector('#field-category').value = 'work';
    _overlay.querySelector('#field-deadline').value = '';
    _overlay.querySelector('#field-time').value     = '';
    _overlay.querySelector('#field-note').value     = '';
    _setPriority('medium');

    _overlay.querySelector('#modal-title-text').textContent  = 'New Task';
    _overlay.querySelector('#modal-submit-btn').textContent  = 'Add Task';

    _overlay.classList.add('open');
    setTimeout(() => _overlay.querySelector('#field-title').focus(), 350);
  }

  function openEdit(task) {
    if (!_overlay) _build();

    _mode   = 'edit';
    _editId = task.id;

    _overlay.querySelector('#field-title').value    = task.title;
    _overlay.querySelector('#field-category').value = task.category;
    _overlay.querySelector('#field-deadline').value = task.deadline;
    _overlay.querySelector('#field-time').value     = task.time;
    _overlay.querySelector('#field-note').value     = task.note || '';
    _setPriority(task.priority);

    _overlay.querySelector('#modal-title-text').textContent  = 'Edit Task';
    _overlay.querySelector('#modal-submit-btn').textContent  = 'Save Changes';

    _overlay.classList.add('open');
    setTimeout(() => _overlay.querySelector('#field-title').focus(), 350);
  }

  function close() {
    if (!_overlay) return;
    _overlay.classList.remove('open');
  }

  return { open, openEdit, close };
})();
