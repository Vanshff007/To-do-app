/* ============================================================
   CalendarScreen.js — Calendar / Timeline View
   ============================================================ */

const CalendarScreen = (() => {
  let _el          = null;
  let _selectedDate = Helpers.todayIso();
  let _allTasks    = [];

  function build() {
    _el = document.createElement('div');
    _el.className = 'screen';
    _el.id = 's-cal';

    _el.innerHTML = `
      <h2 class="sr-only">Calendar view</h2>

      <div class="screen-header">
        <div class="greeting">
          <small>Schedule</small>
          <h1>Calendar</h1>
        </div>
        <button class="avatar-btn" aria-label="Today"
          onclick="CalendarScreen.jumpToday()"
          style="font-size:11px;font-family:var(--font-body);font-weight:600;
                 background:var(--bg-card);border:1px solid var(--border);
                 color:var(--blue)">
          Today
        </button>
      </div>

      <div id="cal-month-label" class="cal-month-label"></div>
      <div id="cal-date-strip" class="date-strip" role="group" aria-label="Select date"></div>
      <div id="cal-timeline" class="timeline" role="list" aria-live="polite"></div>
      <div class="bottom-spacer"></div>
    `;

    document.getElementById('app').appendChild(_el);

    // Expose for inline onclick
    window.CalendarScreen = { jumpToday };

    TaskStore.subscribe(tasks => {
      _allTasks = tasks;
      _updateStrip();
      _updateTimeline();
    });
  }

  function _updateStrip() {
    const stripEl = _el?.querySelector('#cal-date-strip');
    const monthEl = _el?.querySelector('#cal-month-label');
    if (!stripEl) return;

    const dates = Helpers.getWeekDates(_selectedDate);

    // Month label from selected
    const selDate = new Date(_selectedDate + 'T00:00:00');
    if (monthEl) {
      monthEl.textContent = selDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    }

    stripEl.innerHTML = dates.map(d => {
      const hasTasks = _allTasks.some(t => t.deadline === d.iso);
      const isActive = d.iso === _selectedDate;
      return `
        <div class="date-chip${isActive ? ' active' : ''}${hasTasks ? ' has-tasks' : ''}"
          data-date="${d.iso}" role="button"
          aria-label="${d.day} ${d.num}${hasTasks ? ', has tasks' : ''}"
          aria-pressed="${isActive}" tabindex="0">
          <span class="d-name">${d.day}</span>
          <span class="d-num">${d.num}</span>
          <span class="d-dot" aria-hidden="true"></span>
        </div>
      `;
    }).join('');

    stripEl.querySelectorAll('.date-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        _selectedDate = chip.dataset.date;
        _updateStrip();
        _updateTimeline();
      });
      chip.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); chip.click(); }
      });
    });

    // Scroll selected into view
    setTimeout(() => {
      const active = stripEl.querySelector('.date-chip.active');
      if (active) active.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }, 80);
  }

  function _updateTimeline() {
    const tlEl = _el?.querySelector('#cal-timeline');
    if (!tlEl) return;

    const tasks = _allTasks.filter(t => t.deadline === _selectedDate);

    if (tasks.length === 0) {
      tlEl.innerHTML = '';
      const empty = document.createElement('div');
      empty.style.cssText = 'padding: 40px 20px; text-align: center;';
      empty.innerHTML = `
        <p style="color:var(--text-hint);font-size:13px">
          No tasks scheduled for ${Helpers.formatDate(_selectedDate) || _selectedDate}
        </p>`;
      tlEl.appendChild(empty);
      return;
    }

    // Sort by time
    const sorted = [...tasks].sort((a, b) => {
      if (!a.time && !b.time) return 0;
      if (!a.time) return 1;
      if (!b.time) return -1;
      return a.time.localeCompare(b.time);
    });

    // Group by hour for timeline
    const grouped = {};
    sorted.forEach(t => {
      const hour = t.time ? t.time.slice(0, 2) + ':00' : 'No time';
      if (!grouped[hour]) grouped[hour] = [];
      grouped[hour].push(t);
    });

    tlEl.innerHTML = '';

    Object.entries(grouped).forEach(([hour, tasks]) => {
      const rowEl = document.createElement('div');
      rowEl.className = 'tl-row';
      rowEl.setAttribute('role', 'listitem');

      const timeLabel = hour === 'No time' ? '—' : Helpers.formatTime(hour.replace(':00', ':00').padStart(5,'0'));

      const events = tasks.map(t => {
        const color = Helpers.catTimelineColor(t.category);
        return `
          <div class="tl-event ${color}">
            <div class="tl-event-tag">${Helpers.catLabel(t.category)}</div>
            <h4>${Helpers.escape(t.title)}</h4>
            ${t.time ? `<p>${Helpers.formatTime(t.time)}</p>` : ''}
            ${t.note ? `<p style="margin-top:3px;font-size:10px">${Helpers.escape(t.note)}</p>` : ''}
          </div>
        `;
      }).join('');

      rowEl.innerHTML = `
        <div class="tl-time">${timeLabel}</div>
        <div class="tl-track">
          <div class="tl-line" aria-hidden="true"></div>
          ${events}
        </div>
      `;

      tlEl.appendChild(rowEl);
    });
  }

  function jumpToday() {
    _selectedDate = Helpers.todayIso();
    _updateStrip();
    _updateTimeline();
  }

  function activate() {
    _el.classList.add('active');
    _updateStrip();
    _updateTimeline();
  }

  function deactivate() {
    _el.classList.remove('active');
  }

  return { build, activate, deactivate, jumpToday };
})();
