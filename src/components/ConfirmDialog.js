/* ============================================================
   ConfirmDialog.js — Delete Confirmation Dialog
   ============================================================ */

const ConfirmDialog = (() => {
  let _overlay = null;
  let _resolve  = null;

  function _build() {
    _overlay = document.createElement('div');
    _overlay.className = 'confirm-overlay';
    _overlay.setAttribute('role', 'dialog');
    _overlay.setAttribute('aria-modal', 'true');
    _overlay.setAttribute('aria-label', 'Confirm action');
    _overlay.innerHTML = `
      <div class="confirm-box">
        <h3 id="confirm-title">Are you sure?</h3>
        <p  id="confirm-body">This action cannot be undone.</p>
        <div class="confirm-btns">
          <button class="btn-secondary" id="confirm-cancel">Cancel</button>
          <button class="btn-danger"    id="confirm-ok">Delete</button>
        </div>
      </div>
    `;

    document.body.appendChild(_overlay);

    _overlay.querySelector('#confirm-cancel').addEventListener('click', () => _settle(false));
    _overlay.querySelector('#confirm-ok').addEventListener('click',     () => _settle(true));

    // Close on backdrop
    _overlay.addEventListener('click', e => { if (e.target === _overlay) _settle(false); });

    // Keyboard
    document.addEventListener('keydown', e => {
      if (!_overlay.classList.contains('open')) return;
      if (e.key === 'Escape') _settle(false);
      if (e.key === 'Enter')  _settle(true);
    });
  }

  function _settle(result) {
    _overlay.classList.remove('open');
    if (_resolve) { _resolve(result); _resolve = null; }
  }

  /**
   * Show confirm dialog. Returns a Promise<boolean>.
   * @param {string} title
   * @param {string} body
   * @returns {Promise<boolean>}
   */
  function ask(title = 'Are you sure?', body = 'This action cannot be undone.') {
    if (!_overlay) _build();
    _overlay.querySelector('#confirm-title').textContent = title;
    _overlay.querySelector('#confirm-body').textContent  = body;
    _overlay.classList.add('open');
    _overlay.querySelector('#confirm-ok').focus();

    return new Promise(resolve => { _resolve = resolve; });
  }

  return { ask };
})();
