/* ============================================================
   StatsScreen.js — Productivity Statistics Screen
   ============================================================ */

const StatsScreen = (() => {
  let _el = null;

  const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  function build() {
    _el = document.createElement('div');
    _el.className = 'screen';
    _el.id = 's-stats';
    document.getElementById('app').appendChild(_el);

    TaskStore.subscribe(_update);
  }

  function _update(tasks) {
    if (!_el) return;

    const total       = tasks.length;
    const done        = tasks.filter(t => t.done).length;
    const pending     = tasks.filter(t => !t.done).length;
    const overdue     = tasks.filter(t => Helpers.isOverdue(t)).length;
    const pct         = total === 0 ? 0 : Math.round((done / total) * 100);
    const weekly      = TaskStore.getWeeklyStats();
    const maxBar      = Math.max(...weekly, 1);
    const breakdown   = TaskStore.getCategoryBreakdown();
    const todayCount  = tasks.filter(t => t.deadline === Helpers.todayIso()).length;
    const highPri     = tasks.filter(t => t.priority === 'high').length;

    const todayDow = (new Date().getDay() + 6) % 7; // 0=Mon

    // Motivation message
    const motivation = _getMotivation(pct, pending);

    _el.innerHTML = `
      <h2 class="sr-only">Productivity statistics</h2>

      <div class="stats-intro">
        <small style="color:var(--text-hint);font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:1.5px">Productivity</small>
        <h1>Your Stats</h1>
        <p style="font-size:13px;margin-top:4px">Track your progress and stay motivated</p>
      </div>

      <!-- Overview Pills -->
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;padding:var(--sp-lg) var(--sp-lg) 0">
        <div class="streak-card">
          <span class="icon">📝</span>
          <div class="val" style="color:var(--blue)">${total}</div>
          <div class="key">Total</div>
        </div>
        <div class="streak-card">
          <span class="icon">✅</span>
          <div class="val" style="color:var(--green)">${done}</div>
          <div class="key">Done</div>
        </div>
        <div class="streak-card">
          <span class="icon">⏳</span>
          <div class="val" style="color:var(--amber)">${pending}</div>
          <div class="key">Pending</div>
        </div>
        <div class="streak-card">
          <span class="icon">🔴</span>
          <div class="val" style="color:var(--red)">${overdue}</div>
          <div class="key">Overdue</div>
        </div>
      </div>

      <!-- Weekly Chart -->
      <div class="weekly-chart-card">
        <div class="chart-header">
          <h3>Completed This Week</h3>
          <span>Total: ${weekly.reduce((a,b)=>a+b,0)}</span>
        </div>
        <div class="bar-chart" role="img" aria-label="Weekly bar chart">
          ${DAYS.map((d, i) => {
            const h = maxBar > 0 ? (weekly[i] / maxBar * 100) : 0;
            const isToday = i === todayDow;
            return `
              <div class="bar-col">
                <div class="bar-wrap">
                  <div class="bar${isToday ? ' today' : ''}"
                    style="height:${Math.max(h, weekly[i] > 0 ? 8 : 0)}%"
                    title="${d}: ${weekly[i]} task${weekly[i]!==1?'s':''}"></div>
                </div>
                <div class="bar-label" style="${isToday?'color:var(--blue);font-weight:600':''}">
                  ${d}${isToday ? '•' : ''}
                </div>
              </div>`;
          }).join('')}
        </div>
      </div>

      <!-- Completion rate + Today -->
      <div class="streak-grid">
        <div class="streak-card">
          <span class="icon">🎯</span>
          <div class="val" style="color:${pct >= 70 ? 'var(--green)' : pct >= 40 ? 'var(--amber)' : 'var(--red)'}">${pct}%</div>
          <div class="key">Completion rate</div>
        </div>
        <div class="streak-card">
          <span class="icon">📅</span>
          <div class="val" style="color:var(--cyan)">${todayCount}</div>
          <div class="key">Due today</div>
        </div>
        <div class="streak-card">
          <span class="icon">🔥</span>
          <div class="val" style="color:var(--rose)">${highPri}</div>
          <div class="key">High priority</div>
        </div>
        <div class="streak-card">
          <span class="icon">📊</span>
          <div class="val" style="color:var(--violet)">${breakdown.length}</div>
          <div class="key">Categories used</div>
        </div>
      </div>

      <!-- Category Breakdown -->
      ${breakdown.length > 0 ? `
      <div class="cat-breakdown">
        <h3>Category Breakdown</h3>
        ${breakdown.map(b => {
          const pctFill = b.total === 0 ? 0 : Math.round((b.done / b.total) * 100);
          return `
            <div class="cat-row">
              <span class="cat-name">${Helpers.catLabel(b.cat)}</span>
              <div class="cat-bar-bg">
                <div class="cat-bar-fill"
                  style="width:${pctFill}%;background:${Helpers.catColor(b.cat)}"></div>
              </div>
              <span class="cat-count">${b.total}</span>
            </div>`;
        }).join('')}
      </div>` : ''}

      <!-- Motivation -->
      <div class="motivation-card">
        <span class="m-emoji">${motivation.emoji}</span>
        <h3>${motivation.title}</h3>
        <p>${motivation.body}</p>
      </div>

      <div class="bottom-spacer"></div>
    `;
  }

  function _getMotivation(pct, pending) {
    if (pending === 0 && pct === 0) {
      return {
        emoji: '🌱',
        title: 'Ready to start?',
        body:  'Add your first task and begin building productive habits.',
      };
    }
    if (pct === 100) {
      return {
        emoji: '🏆',
        title: 'All done! You crushed it.',
        body:  'Every task completed. Take a moment to celebrate — then set new goals.',
      };
    }
    if (pct >= 80) {
      return {
        emoji: '🚀',
        title: 'Almost there!',
        body:  `Just ${pending} task${pending !== 1 ? 's' : ''} left. You're in the home stretch — keep going!`,
      };
    }
    if (pct >= 50) {
      return {
        emoji: '💪',
        title: 'Great momentum!',
        body:  `You're over halfway done. Stay focused — ${pending} task${pending !== 1 ? 's' : ''} to go.`,
      };
    }
    if (pct >= 20) {
      return {
        emoji: '⚡',
        title: 'Getting warmed up',
        body:  `You\'ve made a start. Tackle your highest priority tasks first to build momentum.`,
      };
    }
    return {
      emoji: '🎯',
      title: 'Time to focus',
      body:  'Pick one task and give it your full attention. Small progress beats perfect plans.',
    };
  }

  function activate() {
    _el.classList.add('active');
  }

  function deactivate() {
    _el.classList.remove('active');
  }

  return { build, activate, deactivate };
})();
