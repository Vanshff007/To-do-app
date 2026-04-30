/* ============================================================
   router.js — Client-Side Screen Router
   ============================================================ */

const Router = (() => {
  const _screens = {
    home:  DashboardScreen,
    tasks: TasksScreen,
    cal:   CalendarScreen,
    stats: StatsScreen,
  };

  let _current = null;

  function goto(id) {
    if (!_screens[id]) return;
    if (_current === id) return;

    // Deactivate current
    if (_current && _screens[_current]) {
      _screens[_current].deactivate();
    }

    _current = id;
    _screens[id].activate();
    BottomNav.setActive(id);

    // Update browser URL hash (for deep linking / back button)
    if (history.replaceState) {
      history.replaceState(null, '', `#${id}`);
    }
  }

  function init() {
    // Check hash for initial screen
    const hash = location.hash.slice(1);
    const initial = _screens[hash] ? hash : 'home';
    goto(initial);

    // Handle browser back/forward
    window.addEventListener('popstate', () => {
      const h = location.hash.slice(1);
      if (_screens[h]) goto(h);
    });
  }

  return { goto, init };
})();
