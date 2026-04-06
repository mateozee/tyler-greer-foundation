(function() {
  'use strict';

  // Tournament access password - family sets this
  var TOURNAMENT_PASSWORD = 'tyler2026';
  var STORAGE_KEY = 'tgf-tournament-auth';

  var overlay = document.getElementById('passwordGate');
  var form = document.getElementById('passwordForm');
  var input = document.getElementById('passwordInput');
  var errorEl = document.getElementById('passwordError');

  if (!overlay) return;

  // Check if already authenticated this session
  if (sessionStorage.getItem(STORAGE_KEY) === 'authenticated') {
    overlay.style.display = 'none';
    return;
  }

  // Show the gate
  overlay.style.display = 'flex';

  form.addEventListener('submit', function(e) {
    e.preventDefault();

    if (input.value === TOURNAMENT_PASSWORD) {
      sessionStorage.setItem(STORAGE_KEY, 'authenticated');
      overlay.style.opacity = '0';
      setTimeout(function() {
        overlay.style.display = 'none';
      }, 400);
    } else {
      errorEl.textContent = 'Incorrect password. Please try again.';
      input.value = '';
      input.focus();
    }
  });
})();
