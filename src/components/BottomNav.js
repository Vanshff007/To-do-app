/* ============================================================
   BottomNav.js — Bottom Navigation Bar
   ============================================================ */

const BottomNav = (() => {
  const ITEMS = [
    { id: 'home',  label: 'Home',     icon: navIcon('home')  },
    { id: 'tasks', label: 'Tasks',    icon: navIcon('tasks') },
    { id: 'cal',   label: 'Calendar', icon: navIcon('cal')   },
    { id: 'stats', label: 'Stats',    icon: navIcon('stats') },
  ];

  function navIcon(type) {
    const icons = {
      home: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"/>
        <path d="M9 21V12h6v9"/>
      </svg>`,
      tasks: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <path d="M9 11l3 3L22 4"/>
        <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
      </svg>`,
      cal: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2"/>
        <path d="M16 2v4M8 2v4M3 10h18"/>
      </svg>`,
      stats: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <path d="M18 20V10M12 20V4M6 20v-6"/>
      </svg>`,
    };
    return icons[type] || '';
  }

  let _nav = null;

  function render() {
    _nav = document.createElement('nav');
    _nav.className = 'bottom-nav';
    _nav.setAttribute('role', 'navigation');
    _nav.setAttribute('aria-label', 'Main navigation');

    _nav.innerHTML = ITEMS.map(item => `
      <button class="nav-btn" id="nav-${item.id}" data-screen="${item.id}"
        aria-label="${item.label}" aria-current="false">
        ${item.icon}
        <span>${item.label}</span>
        <div class="nav-indicator" aria-hidden="true"></div>
      </button>
    `).join('');

    _nav.querySelectorAll('.nav-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        Router.goto(btn.dataset.screen);
      });
    });

    document.body.appendChild(_nav);
  }

  function setActive(screenId) {
    if (!_nav) return;
    _nav.querySelectorAll('.nav-btn').forEach(btn => {
      const isActive = btn.dataset.screen === screenId;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-current', isActive ? 'page' : 'false');
    });
  }

  return { render, setActive };
})();
