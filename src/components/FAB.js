/* ============================================================
   FAB.js — Floating Action Button
   ============================================================ */

const FAB = (() => {
  let _btn = null;

  function render() {
    _btn = document.createElement('button');
    _btn.className = 'fab';
    _btn.setAttribute('aria-label', 'Add new task');
    _btn.setAttribute('title',      'Add new task');
    _btn.innerHTML = `
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
           stroke="currentColor" stroke-width="2.2"
           stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 5v14M5 12h14"/>
      </svg>
    `;

    _btn.addEventListener('click', () => {
      TaskModal.open();
    });

    document.body.appendChild(_btn);
  }

  return { render };
})();
