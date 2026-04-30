/* ============================================================
   DashboardScreen.js — Home / Dashboard Screen
   ============================================================ */

const DashboardScreen = (() => {
  let _el = null;

  /* ---- Build SVG gradient def (once) ---- */
  const SVG_DEFS = `
    <svg width="0" height="0" style="position:absolute">
      <defs>
        <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stop-color="#4f8ef7"/>
          <stop offset="100%" stop-color="#8b6ff5"/>
        </linearGradient>
      </defs>
    </svg>`;

  /* ---- Progress ring circumference (r=37) ---- */
  const R = 37, CIRC = 2 * Math.PI * R;

  function _renderProgressRing(pct) {
    const offset = CIRC - (CIRC * pct / 100);
    return `
      <div class="progress-ring-wrap">
        <svg viewBox="0 0 86 86" xmlns="http://www.w3.org/2000/svg">
          <circle class="progress-ring-bg"   cx="43" cy="43" r="${R}"/>
          <circle class="progress-ring-fill" cx="43" cy="43" r="${R}"
            stroke-dasharray="${CIRC.toFixed(2)}"
            stroke-dashoffset="${offset.toFixed(2)}"/>
        </svg>
        <div class="ring-label">
          <span class="pct">${pct}%</span>
          <span class="lbl">done</span>
        </div>
      </div>
    `;
  }

  function _renderStatPills(tasks) {
    const total   = tasks.length;
    const done    = tasks.filter(t => t.done).length;
    const pending = total - done;
    const highPri = tasks.filter(t => t.priority === 'high' && !t.done).length;
    const overdue = tasks.filter(t => Helpers.isOverdue(t)).length;

    return `
      <div class="stat-pills">
        <div class="stat-pill">
          <div class="p-val" style="color:var(--blue)">${total}</div>
          <div class="p-key">Total</div>
        </div>
        <div class="stat-pill">
          <div class="p-val" style="color:var(--green)">${done}</div>
          <div class="p-key">Done</div>
        </div>
        <div class="stat-pill">
          <div class="p-val" style="color:var(--amber)">${pending}</div>
          <div class="p-key">Pending</div>
        </div>
        <div class="stat-pill">
          <div class="p-val" style="color:var(--priority-high)">${highPri}</div>
          <div class="p-key">High Pri.</div>
        </div>
        ${overdue > 0 ? `
        <div class="stat-pill">
          <div class="p-val" style="color:var(--red)">${overdue}</div>
          <div class="p-key">Overdue</div>
        </div>` : ''}
      </div>
    `;
  }

  /* ---- Main build ---- */
  function build() {
    _el = document.createElement('div');
    _el.className = 'screen';
    _el.id = 's-home';
    document.getElementById('app').appendChild(_el);

    // Subscribe to store
    TaskStore.subscribe(_update);
  }

  function _update(tasks) {
    if (!_el) return;
    const pct     = TaskStore.getCompletionPct();
    const recent  = [...tasks].slice(0, 4); // show latest 4 on dashboard
    const today   = Helpers.todayIso();
    const todayTasks = tasks.filter(t => t.deadline === today && !t.done);

    _el.innerHTML = `
      ${SVG_DEFS}
      <h2 class="sr-only">Dashboard — task overview</h2>

      <!-- Header -->
      <div class="screen-header">
        <div class="greeting">
          <small>${Helpers.getGreeting()}</small>
          <h1>${Helpers.getLongDate()}</h1>
        </div>
        <button class="avatar-btn" aria-label="Profile">TF</button>
      </div>

      <!-- Progress Card -->
      <div class="progress-card" style="margin-top:var(--sp-lg)">
        ${_renderProgressRing(pct)}
        <div class="progress-meta">
          <h3>Today's Progress</h3>
          <div class="progress-stats">
            <div class="pstat">
              <span class="val" style="color:var(--green)">${TaskStore.getDoneCount()}</span>
              <span class="key">Completed</span>
            </div>
            <div class="pstat">
              <span class="val" style="color:var(--amber)">${TaskStore.getPendingCount()}</span>
              <span class="key">Remaining</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Stat Pills -->
      ${_renderStatPills(tasks)}

      <!-- Today section -->
      ${todayTasks.length > 0 ? `
      <div class="section-header">
        <h2>Due Today</h2>
        <button class="btn-text" onclick="Router.goto('tasks')">See all</button>
      </div>
      <div class="tasks-list" id="home-today-list"></div>
      ` : ''}

      <!-- Recent Tasks -->
      <div class="section-header">
        <h2>Recent Tasks</h2>
        <button class="btn-text" onclick="Router.goto('tasks')">See all</button>
      </div>
      <div class="tasks-list" id="home-recent-list"></div>

      <div class="bottom-spacer"></div>
    `;

    /* ---- Inject task cards (DOM elements) ---- */
    if (todayTasks.length > 0) {
      const todayList = _el.querySelector('#home-today-list');
      if (todayList) {
        todayTasks.slice(0, 3).forEach(t => todayList.appendChild(TaskCard.create(t)));
      }
    }

    const recentList = _el.querySelector('#home-recent-list');
    if (recentList) {
      if (recent.length === 0) {
        recentList.appendChild(TaskCard.renderEmpty('No tasks yet', 'Tap + to add your first task'));
      } else {
        recent.forEach(t => recentList.appendChild(TaskCard.create(t)));
      }
    }
  }

  function activate() {
    _el.classList.add('active');
  }

  function deactivate() {
    _el.classList.remove('active');
  }

  return { build, activate, deactivate };
})();
