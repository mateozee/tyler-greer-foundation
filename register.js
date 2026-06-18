(function() {
  'use strict';

  // === CONFIG ===
  // Paste the deployed Google Apps Script Web App URL here.
  // Deploy: Apps Script → Deploy → New deployment → Web app
  //   Execute as: Me, Who has access: Anyone
  var APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyVJUs7ghaoGKv0HCwNqfFaPZ9GRghpPMnwVbjivd7eas8pwLeBLwLX8PBbJYSFeqAP/exec';

  var REGISTRATION_TYPES = {
    foursome: { count: 4, label: 'Foursome', amount: 800, subtitle: '$800 — team of four' },
    double:   { count: 2, label: 'Double',   amount: 400, subtitle: '$400 — two golfers' },
    single:   { count: 1, label: 'Single',   amount: 200, subtitle: '$200 — individual golfer' }
  };

  var SIZES_MEN = ['S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL'];
  var SIZES_WOMEN = ['XS', 'S', 'M', 'L', 'XL', '2XL'];

  var modal = document.getElementById('registerModal');
  if (!modal) return;

  var body = document.getElementById('registerModalBody');
  var success = document.getElementById('registerSuccess');
  var titleEl = document.getElementById('registerModalTitle');
  var labelEl = document.getElementById('registerModalLabel');
  var subtitleEl = document.getElementById('registerModalSubtitle');
  var fieldsetsEl = document.getElementById('golferFieldsets');
  var form = document.getElementById('registrationForm');
  var errorEl = document.getElementById('registerError');
  var submitBtn = document.getElementById('registerSubmit');
  var successCopy = document.getElementById('successCopy');

  var currentType = null;

  function buildGolferFieldset(index, total) {
    var legendText = total === 1 ? 'Golfer Details' : 'Golfer ' + (index + 1);
    return ''
      + '<fieldset class="golfer-fieldset">'
      +   '<legend>' + legendText + '</legend>'
      +   '<div class="form-row">'
      +     '<div class="form-field">'
      +       '<label for="g' + index + '-first">First name</label>'
      +       '<input id="g' + index + '-first" name="g' + index + '-first" type="text" autocomplete="given-name" required>'
      +     '</div>'
      +     '<div class="form-field">'
      +       '<label for="g' + index + '-last">Last name</label>'
      +       '<input id="g' + index + '-last" name="g' + index + '-last" type="text" autocomplete="family-name" required>'
      +     '</div>'
      +   '</div>'
      +   '<div class="form-field">'
      +     '<label for="g' + index + '-email">Email</label>'
      +     '<input id="g' + index + '-email" name="g' + index + '-email" type="email" autocomplete="email" required>'
      +   '</div>'
      +   '<div class="form-row">'
      +     '<div class="form-field">'
      +       '<label for="g' + index + '-gender">Shirt</label>'
      +       '<select id="g' + index + '-gender" name="g' + index + '-gender" required data-gender data-index="' + index + '">'
      +         '<option value="">Select…</option>'
      +         '<option value="Men\'s">Men\'s</option>'
      +         '<option value="Women\'s">Women\'s</option>'
      +       '</select>'
      +     '</div>'
      +     '<div class="form-field">'
      +       '<label for="g' + index + '-size">Size</label>'
      +       '<select id="g' + index + '-size" name="g' + index + '-size" required data-size data-index="' + index + '" disabled>'
      +         '<option value="">Select shirt first</option>'
      +       '</select>'
      +     '</div>'
      +   '</div>'
      + '</fieldset>';
  }

  function populateSizes(index, gender) {
    var sizeSelect = document.getElementById('g' + index + '-size');
    if (!sizeSelect) return;

    sizeSelect.innerHTML = '';
    if (!gender) {
      sizeSelect.disabled = true;
      sizeSelect.innerHTML = '<option value="">Select shirt first</option>';
      return;
    }

    var sizes = gender === "Men's" ? SIZES_MEN : SIZES_WOMEN;
    sizeSelect.disabled = false;

    var placeholder = document.createElement('option');
    placeholder.value = '';
    placeholder.textContent = 'Select size…';
    sizeSelect.appendChild(placeholder);

    for (var i = 0; i < sizes.length; i++) {
      var opt = document.createElement('option');
      opt.value = sizes[i];
      opt.textContent = sizes[i];
      sizeSelect.appendChild(opt);
    }
  }

  function openModal(typeKey) {
    var type = REGISTRATION_TYPES[typeKey];
    if (!type) return;

    currentType = typeKey;

    titleEl.textContent = 'Register ' + type.label;
    labelEl.textContent = 'Register — ' + type.label;
    subtitleEl.innerHTML = type.subtitle.replace('—', '&mdash;');

    var html = '';
    for (var i = 0; i < type.count; i++) {
      html += buildGolferFieldset(i, type.count);
    }
    fieldsetsEl.innerHTML = html;

    var genderSelects = fieldsetsEl.querySelectorAll('[data-gender]');
    for (var j = 0; j < genderSelects.length; j++) {
      genderSelects[j].addEventListener('change', function() {
        var idx = parseInt(this.getAttribute('data-index'), 10);
        populateSizes(idx, this.value);
      });
    }

    body.hidden = false;
    success.hidden = true;
    errorEl.textContent = '';
    submitBtn.disabled = false;
    submitBtn.textContent = 'Submit Registration';

    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');

    var firstInput = fieldsetsEl.querySelector('input');
    if (firstInput) {
      setTimeout(function() { firstInput.focus(); }, 50);
    }
  }

  function closeModal() {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
    form.reset();
    fieldsetsEl.innerHTML = '';
    errorEl.textContent = '';
  }

  function collectFormData() {
    var type = REGISTRATION_TYPES[currentType];
    var golfers = [];
    for (var i = 0; i < type.count; i++) {
      golfers.push({
        firstName:   document.getElementById('g' + i + '-first').value.trim(),
        lastName:    document.getElementById('g' + i + '-last').value.trim(),
        email:       document.getElementById('g' + i + '-email').value.trim(),
        shirtGender: document.getElementById('g' + i + '-gender').value,
        shirtSize:   document.getElementById('g' + i + '-size').value
      });
    }
    return {
      type: type.label,
      amount: type.amount,
      golfers: golfers,
      submittedAt: new Date().toISOString()
    };
  }

  function validate(data) {
    for (var i = 0; i < data.golfers.length; i++) {
      var g = data.golfers[i];
      if (!g.firstName || !g.lastName || !g.email || !g.shirtGender || !g.shirtSize) {
        return 'Please fill in all fields for golfer ' + (i + 1) + '.';
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(g.email)) {
        return 'Please enter a valid email for golfer ' + (i + 1) + '.';
      }
    }
    return null;
  }

  function showSuccess(data) {
    body.hidden = true;
    success.hidden = false;

    var firstName = data.golfers[0].firstName;
    var typeLabel = data.type.toLowerCase();

    successCopy.innerHTML =
      'Thanks, ' + escapeHtml(firstName) + '! Your ' + typeLabel + ' is on the waitlist. ' +
      'Please do not send any money at this time. If we have a cancellation, we will contact you as soon as possible.';

    success.scrollTop = 0;
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function(c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function submitRegistration(data) {
    if (!APPS_SCRIPT_URL || APPS_SCRIPT_URL.indexOf('PASTE_YOUR') === 0) {
      // Dev fallback so the flow is testable before the script URL is wired up.
      console.warn('[register] APPS_SCRIPT_URL not configured. Submission payload:', data);
      return Promise.resolve({ ok: true, dev: true });
    }

    return fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      mode: 'cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(data)
    }).then(function(res) {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res.json();
    });
  }

  // === Wire up triggers ===
  var triggers = document.querySelectorAll('[data-register]');
  for (var k = 0; k < triggers.length; k++) {
    triggers[k].addEventListener('click', function(e) {
      e.preventDefault();
      var typeKey = this.getAttribute('data-register');
      openModal(typeKey);
    });
  }

  var closers = modal.querySelectorAll('[data-close-modal]');
  for (var m = 0; m < closers.length; m++) {
    closers[m].addEventListener('click', closeModal);
  }

  form.addEventListener('submit', function(e) {
    e.preventDefault();
    errorEl.textContent = '';

    var data = collectFormData();
    var validationError = validate(data);
    if (validationError) {
      errorEl.textContent = validationError;
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting…';

    submitRegistration(data)
      .then(function(result) {
        if (result && result.ok === false) {
          throw new Error(result.error || 'Submission failed');
        }
        showSuccess(data);
      })
      .catch(function(err) {
        console.error('[register] submission error:', err);
        errorEl.textContent = 'Something went wrong submitting your registration. Please try again or email k.greer@rogers.com.';
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit Registration';
      });
  });
})();
