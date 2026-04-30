/* ============================================================
   Toast.js — Toast Notification Component
   ============================================================ */

const Toast = (() => {
  let _container = null;

  function _ensureContainer() {
    if (!_container) {
      _container = document.createElement('div');
      _container.className = 'toast-container';
      _container.setAttribute('aria-live', 'polite');
      _container.setAttribute('aria-atomic', 'false');
      document.body.appendChild(_container);
    }
  }

  /**
   * Show a toast message
   * @param {string} message
   * @param {'success'|'error'|'info'} type
   * @param {number} duration ms
   */
  function show(message, type = 'success', duration = 2800) {
    _ensureContainer();

    const icons = { success: '✓', error: '✕', info: 'ℹ' };
    const colors = {
      success: 'var(--green)',
      error:   'var(--red)',
      info:    'var(--blue)',
    };

    const el = document.createElement('div');
    el.className = 'toast';
    el.innerHTML = `
      <span class="toast-icon" style="color:${colors[type]}">${icons[type]}</span>
      <span>${Helpers.escape(message)}</span>
    `;

    _container.appendChild(el);

    setTimeout(() => {
      el.classList.add('fade-out');
      el.addEventListener('animationend', () => el.remove(), { once: true });
    }, duration);
  }

  return { show };
})();
