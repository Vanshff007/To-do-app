/* ============================================================
   app.js — App Bootstrap & Entry Point
   ============================================================ */

(function () {
  'use strict';

  function init() {
    // 1. Build all screens (inject into #app)
    DashboardScreen.build();
    TasksScreen.build();
    CalendarScreen.build();
    StatsScreen.build();

    // 2. Mount shared UI (nav, fab, modal)
    BottomNav.render();
    FAB.render();

    // 3. Load persisted tasks
    TaskStore.init();

    // 4. Navigate to initial screen
    Router.init();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
