(function() {
  'use strict';

  // Dynamic footer year
  var yearEl = document.getElementById('yearEl');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  // Header scroll effect
  var header = document.getElementById('header');
  window.addEventListener('scroll', function() {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  // Mobile navigation toggle
  var mobileToggle = document.getElementById('mobileToggle');
  var navLinks = document.getElementById('navLinks');

  if (mobileToggle && navLinks) {
    mobileToggle.addEventListener('click', function() {
      var isActive = navLinks.classList.toggle('active');
      mobileToggle.classList.toggle('active');
      mobileToggle.setAttribute('aria-expanded', isActive);
    });

    // Close mobile nav on link click
    var navAnchors = navLinks.querySelectorAll('a');
    for (var i = 0; i < navAnchors.length; i++) {
      navAnchors[i].addEventListener('click', function() {
        navLinks.classList.remove('active');
        mobileToggle.classList.remove('active');
        mobileToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    }
  }

  // Smooth scroll with offset for fixed header
  var allLinks = document.querySelectorAll('a[href^="#"]');
  for (var j = 0; j < allLinks.length; j++) {
    allLinks[j].addEventListener('click', function(e) {
      var targetId = this.getAttribute('href');
      if (targetId === '#') return;
      var targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        var headerHeight = header.offsetHeight;
        var targetPosition = targetEl.getBoundingClientRect().top + window.pageYOffset - headerHeight - 20;
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  }

  // Scroll reveal animations
  var revealElements = document.querySelectorAll('.about, .about-text, .about-photo, .details-inner, .detail-card, .pricing-inner, .price-card, .sponsors-inner, .sponsor-tier, .donate-inner, .stats-bar, .tournament-cta-inner');

  function addRevealClass() {
    for (var k = 0; k < revealElements.length; k++) {
      revealElements[k].classList.add('reveal');
    }
  }
  addRevealClass();

  var observer = new IntersectionObserver(function(entries) {
    for (var m = 0; m < entries.length; m++) {
      if (entries[m].isIntersecting) {
        entries[m].target.classList.add('visible');

        // Stagger children
        var children = entries[m].target.querySelectorAll('.detail-card, .price-card, .sponsor-tier, .stat-item');
        for (var n = 0; n < children.length; n++) {
          (function(child, delay) {
            setTimeout(function() {
              child.classList.add('reveal-child');
              child.classList.add('visible');
            }, delay);
          })(children[n], n * 100);
        }
      }
    }
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
  });

  for (var p = 0; p < revealElements.length; p++) {
    observer.observe(revealElements[p]);
  }

  // Donation amount selection
  var donateAmounts = document.querySelectorAll('.donate-amount');
  var donateCustom = document.getElementById('donateCustom');
  var donateBtn = document.getElementById('donateBtn');
  var selectedAmount = 100;

  function updateDonateButton() {
    if (donateBtn) {
      donateBtn.textContent = 'Donate $' + selectedAmount;
    }
  }

  for (var q = 0; q < donateAmounts.length; q++) {
    donateAmounts[q].addEventListener('click', function() {
      // Remove active from all
      for (var r = 0; r < donateAmounts.length; r++) {
        donateAmounts[r].classList.remove('active');
      }
      this.classList.add('active');
      selectedAmount = parseInt(this.getAttribute('data-amount'), 10);
      donateCustom.value = '';
      updateDonateButton();
    });
  }

  if (donateCustom) {
    donateCustom.addEventListener('input', function() {
      var val = parseInt(this.value, 10);
      if (val > 0) {
        // Remove active from preset buttons
        for (var s = 0; s < donateAmounts.length; s++) {
          donateAmounts[s].classList.remove('active');
        }
        selectedAmount = val;
        updateDonateButton();
      }
    });
  }

  // Payment button click handlers (Stripe integration placeholder)
  var paymentButtons = document.querySelectorAll('[data-payment]');
  for (var t = 0; t < paymentButtons.length; t++) {
    paymentButtons[t].addEventListener('click', function(e) {
      e.preventDefault();
      var paymentType = this.getAttribute('data-payment');

      // Tournament registrations (foursome/double/single) are handled by register.js.
      // Remaining placeholders for sponsor and donate flows:
      var message = '';
      if (paymentType === 'sponsor') {
        message = 'Hole Sponsorship - $1,000\n\nPayment integration coming soon.';
      } else if (paymentType === 'donate') {
        message = 'Donation - $' + selectedAmount + '\n\nPayment integration coming soon.';
      }
      if (message) alert(message);
    });
  }

})();