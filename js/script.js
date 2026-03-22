'use strict';

/* ============================================================
   IRONFORGE GYM — script.js
   ============================================================
   SECTIONS:
     1. Page Load — add .js-loaded immediately to prevent flash
     2. Navbar Scroll Behavior
     3. Mobile Menu Toggle
     4. Scroll Reveal (IntersectionObserver for .fade-in)
     5. Stats Counter Animation (scrolls to and counts up numbers)
     6. FAQ Accordion
     7. Active Nav Link Detection
     8. Staggered Card Animations
     9. Button Hover Ripple Effect
    10. Smooth Anchor Scrolling
   ============================================================ */


/* ============================================================
   1. PAGE LOAD — Add .js-loaded IMMEDIATELY (before DOMContentLoaded)
   ============================================================
   WHY: CSS hides .fade-in elements only when .js-loaded is on <html>.
   Adding it instantly means JS controls visibility from first paint
   — no blank/faded page flash before JS runs.
   ============================================================ */
document.documentElement.classList.add('js-loaded');


document.addEventListener('DOMContentLoaded', () => {

  document.body.classList.add('js-loaded'); // Also add to <body> as fallback


  /* ============================================================
     2. NAVBAR SCROLL BEHAVIOR
     ============================================================
     Adds/removes 'scrolled' class on .header based on scroll position.
     'scrolled' applies the solid dark background + blur (see styles.css).

     NOTE: On index.html the navbar starts with 'scrolled' already set
     in the HTML so it is always opaque — no transparency on home page.
     ============================================================ */
  const header = document.querySelector('.header');
  if (header) {
    const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 80);
    onScroll(); // Run once on load to set correct initial state
    window.addEventListener('scroll', onScroll, { passive: true });
  }


  /* ============================================================
     3. MOBILE MENU TOGGLE
     ============================================================
     Opens/closes full-screen nav (.nav-links) on hamburger click.
     A close (✕) button is injected programmatically so it doesn't
     need to be hardcoded in every HTML file.
     Body scroll is locked while menu is open.
     ============================================================ */
  const toggle   = document.querySelector('.mobile-menu-toggle');
  const navLinks = document.querySelector('.nav-links');

  if (toggle && navLinks) {
    const closeBtn = document.createElement('button');
    closeBtn.className = 'mobile-close';
    closeBtn.innerHTML = '&#10005;';
    closeBtn.setAttribute('aria-label', 'Close menu');
    navLinks.prepend(closeBtn);

    const openMenu  = () => { navLinks.classList.add('open');    document.body.style.overflow = 'hidden'; };
    const closeMenu = () => { navLinks.classList.remove('open'); document.body.style.overflow = ''; };

    toggle.addEventListener('click', openMenu);
    closeBtn.addEventListener('click', closeMenu);
    navLinks.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });
  }


  /* ============================================================
     4. SCROLL REVEAL (IntersectionObserver)
     ============================================================
     .fade-in elements animate in (opacity + translateY) when they
     enter the viewport. Elements already visible on page load get
     .visible applied instantly — no delay for above-the-fold content.

     SCROLL THRESHOLD: Change 'threshold' (0.0–1.0) below.
     0.05 = trigger when 5% of the element is visible.
     ============================================================ */
  const fadeEls = document.querySelectorAll('.fade-in');
  if (fadeEls.length) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.05 }); // SCROLL THRESHOLD

    fadeEls.forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        el.classList.add('visible'); // Already on screen — show immediately
      } else {
        revealObserver.observe(el);  // Below fold — animate on scroll
      }
    });
  }


  /* ============================================================
     5. STATS COUNTER ANIMATION
     ============================================================
     Animates each .stat-number from 0 → data-target value using
     requestAnimationFrame with a cubic ease-out curve.
     Fires once when .stats-bar scrolls into view.

     HOW TO EDIT:
     - Change a stat → update data-target="XXXX" in index.html
     - Add % suffix → add data-suffix="%" to the element in HTML
     - COUNTER DURATION: change the ms value labelled below
     ============================================================ */
  const statsBar = document.querySelector('.stats-bar');
  if (statsBar) {
    let hasAnimated = false; // Guard — only run once

    const statsObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !hasAnimated) {
          hasAnimated = true;
          statsObserver.unobserve(entry.target);

          // Make stats bar visible (it has no fade-in class, but ensure it shows)
          statsBar.style.opacity = '1';

          entry.target.querySelectorAll('.stat-number').forEach(el => {
            const target   = parseInt(el.dataset.target, 10);
            const suffix   = el.dataset.suffix || '';
            const duration = 2200; // COUNTER DURATION (milliseconds) — edit here

            if (isNaN(target)) return;

            const start = performance.now();
            const tick = (now) => {
              const elapsed  = now - start;
              const progress = Math.min(elapsed / duration, 1);
              const eased    = 1 - Math.pow(1 - progress, 3); // Cubic ease-out
              el.textContent = Math.round(eased * target) + suffix;
              if (progress < 1) {
                requestAnimationFrame(tick);
              } else {
                el.textContent = target + suffix; // Snap to exact final value
              }
            };
            requestAnimationFrame(tick);
          });
        }
      });
    }, { threshold: 0.2 }); // Fire when 20% of stats bar is visible

    statsObserver.observe(statsBar);
  }


  /* ============================================================
     6. FAQ ACCORDION
     ============================================================
     Toggles 'open' class on .faq-item when its button is clicked.
     Only one item can be open at a time (accordion behaviour).
     CSS handles the max-height transition for smooth animation.
     ============================================================ */
  document.querySelectorAll('.faq-question').forEach(btn => {
    btn.addEventListener('click', () => {
      const item   = btn.parentElement;
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach(i => i.classList.remove('open'));
      if (!isOpen) item.classList.add('open');
    });
  });


  /* ============================================================
     7. ACTIVE NAV LINK DETECTION
     ============================================================
     Marks the nav link matching the current page filename as .active.
     This is a JS fallback — most pages also have class="active"
     hardcoded in the HTML on the correct link for reliability.

     HOW TO EDIT:
     - For new pages, add class="active" directly in the HTML <nav>
       on the matching link (preferred), or it will be caught here.
     ============================================================ */
  const navLinksEl = document.querySelector('.nav-links');
  if (navLinksEl) {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    navLinksEl.querySelectorAll('a:not(.btn)').forEach(link => {
      const href = link.getAttribute('href').replace('./', '');
      if (href === currentPage || (currentPage === '' && href === 'index.html')) {
        link.classList.add('active');
      }
    });
  }


  /* ============================================================
     8. STAGGERED CARD ANIMATIONS
     ============================================================
     Adds a progressively increasing transition-delay to each card
     inside grid containers, so cards animate in one-by-one instead
     of all at once ("stagger" effect). Delay increments 80ms per
     card, capped at 400ms so large grids don't feel sluggish.

     HOW TO EDIT:
     - Change stagger interval: adjust the 80 value below (ms)
     - Add more selectors to the querySelectorAll list if needed
     ============================================================ */
  document.querySelectorAll('.classes-grid, .trainers-grid, .testimonials-grid, .pricing-grid').forEach(grid => {
    Array.from(grid.children).forEach((card, i) => {
      card.style.transitionDelay = Math.min(i * 80, 400) + 'ms';
    });
  });


  /* ============================================================
     9. BUTTON RIPPLE EFFECT
     ============================================================
     Creates a Material-style ripple on .btn clicks — a circle
     expands + fades from the exact click point.
     The ripple <span> is injected and auto-removed after 600ms.
     ============================================================ */
  // Inject keyframe style once
  if (!document.getElementById('ripple-style')) {
    const s = document.createElement('style');
    s.id = 'ripple-style';
    s.textContent = '@keyframes ripple-expand { to { transform: scale(1); opacity: 0; } }';
    document.head.appendChild(s);
  }

  document.querySelectorAll('.btn').forEach(btn => {
    btn.style.position = 'relative';
    btn.style.overflow = 'hidden';

    btn.addEventListener('click', function (e) {
      const old = this.querySelector('.btn-ripple');
      if (old) old.remove();

      const rect   = this.getBoundingClientRect();
      const size   = Math.max(rect.width, rect.height) * 2;
      const ripple = document.createElement('span');
      ripple.className = 'btn-ripple';
      Object.assign(ripple.style, {
        position:      'absolute',
        width:         size + 'px',
        height:        size + 'px',
        left:          (e.clientX - rect.left - size / 2) + 'px',
        top:           (e.clientY - rect.top  - size / 2) + 'px',
        background:    'rgba(255,255,255,0.25)',
        borderRadius:  '50%',
        transform:     'scale(0)',
        animation:     'ripple-expand 0.55s ease-out forwards',
        pointerEvents: 'none',
      });
      this.appendChild(ripple);
      setTimeout(() => ripple.remove(), 600);
    });
  });


  /* ============================================================
     10. SMOOTH ANCHOR SCROLLING
     ============================================================
     Handles clicks on in-page anchor links (href="#some-id") with
     smooth scroll and a navbar-height offset so content isn't
     hidden behind the fixed header.

     HOW TO EDIT:
     - Adjust 'navOffset' if the navbar height changes (default 80px)
     ============================================================ */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const navOffset = 80; // Fixed navbar height in px — update here if it changes
      window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - navOffset, behavior: 'smooth' });
    });
  });

}); // End DOMContentLoaded