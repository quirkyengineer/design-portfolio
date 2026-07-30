/* ============================================================
   Prerit Mogre — Portfolio Interactions
   Custom cursor, text reveals, marquee, counters, navbar,
   mobile menu, magnetic buttons, page load, scroll reveal
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  // ─── 1. CUSTOM CURSOR ──────────────────────────────────────
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  if (!isTouchDevice) {
    const cursorDot = document.querySelector('.cursor-dot');
    const cursorRing = document.querySelector('.cursor-ring');

    if (cursorDot && cursorRing) {
      let mouseX = 0, mouseY = 0;
      let dotX = 0, dotY = 0;
      let ringX = 0, ringY = 0;

      document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
      });

      document.addEventListener('mouseleave', () => {
        cursorDot.style.opacity = '0';
        cursorRing.style.opacity = '0';
      });

      document.addEventListener('mouseenter', () => {
        cursorDot.style.opacity = '1';
        cursorRing.style.opacity = '1';
      });

      const hoverTargets = 'a, button, .btn-primary, .btn-outline, .work-card, .exp-item, .contact-link, .magnetic, [role="button"]';
      document.addEventListener('mouseover', (e) => {
        if (e.target.closest(hoverTargets)) {
          cursorDot.classList.add('hover');
          cursorRing.classList.add('hover');
        }
      });
      document.addEventListener('mouseout', (e) => {
        if (e.target.closest(hoverTargets)) {
          cursorDot.classList.remove('hover');
          cursorRing.classList.remove('hover');
        }
      });

      function updateCursor() {
        dotX += (mouseX - dotX) * 0.2;
        dotY += (mouseY - dotY) * 0.2;
        ringX += (mouseX - ringX) * 0.08;
        ringY += (mouseY - ringY) * 0.08;

        cursorDot.style.left = dotX + 'px';
        cursorDot.style.top = dotY + 'px';
        cursorRing.style.left = ringX + 'px';
        cursorRing.style.top = ringY + 'px';

        requestAnimationFrame(updateCursor);
      }
      requestAnimationFrame(updateCursor);
    }
  }


  // ─── 2. TEXT REVEAL ANIMATION ──────────────────────────────
  const revealTextEls = document.querySelectorAll('.reveal-text');

  const textRevealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const words = entry.target.querySelectorAll('.word');
          words.forEach((word, i) => {
            setTimeout(() => {
              word.classList.add('revealed');
            }, i * 80);
          });
          textRevealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -30px 0px' }
  );

  revealTextEls.forEach((el) => textRevealObserver.observe(el));


  // ─── 3. REVEAL-UP ANIMATION ────────────────────────────────
  const revealUpEls = document.querySelectorAll('.reveal-up');

  const revealUpObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          revealUpObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
  );

  revealUpEls.forEach((el) => revealUpObserver.observe(el));


  // ─── 4. MARQUEE DUPLICATION ────────────────────────────────
  const marquees = document.querySelectorAll('.marquee-track');
  marquees.forEach((track) => {
    const content = track.innerHTML;
    track.innerHTML = content + content;
  });


  // ─── 5. SMOOTH SCROLL NAVIGATION ──────────────────────────
  const navbar = document.getElementById('navbar');

  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        const navHeight = navbar ? navbar.offsetHeight : 72;
        const targetPos = target.offsetTop - navHeight;
        window.scrollTo({ top: targetPos, behavior: 'smooth' });
        closeMobileMenu();
      }
    });
  });

  // Active section highlighting
  const sections = document.querySelectorAll('section[id]');
  const navLinkEls = document.querySelectorAll('.nav-links .nav-link');

  function highlightActiveSection() {
    const scrollPos = window.scrollY + 200;
    sections.forEach((section) => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');
      if (scrollPos >= top && scrollPos < top + height) {
        navLinkEls.forEach((link) => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${id}`) link.classList.add('active');
        });
      }
    });
  }

  window.addEventListener('scroll', highlightActiveSection, { passive: true });


  // ─── 6. NAVBAR STICKY & SCROLLED STYLING ──────────────────
  function handleNavbar() {
    const scrollY = window.scrollY;

    if (scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    navbar.classList.remove('nav-hidden');
  }

  window.addEventListener('scroll', handleNavbar, { passive: true });
  handleNavbar();


  // ─── 7. COUNTER ANIMATIONS ────────────────────────────────
  const statNumbers = document.querySelectorAll('.stat-num[data-target]');

  function animateCounter(el) {
    const target = parseInt(el.getAttribute('data-target'), 10);
    const suffix = el.getAttribute('data-suffix') || '';
    const duration = 2000;
    const start = performance.now();

    function update(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(easeOut * target) + suffix;
      if (progress < 1) requestAnimationFrame(update);
    }

    requestAnimationFrame(update);
  }

  const counterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );

  statNumbers.forEach((el) => counterObserver.observe(el));


  // ─── 8. MOBILE MENU ───────────────────────────────────────
  const navToggle = document.getElementById('navToggle');
  const mobileMenu = document.getElementById('mobileMenu');
  const navLinksEl = document.getElementById('navLinks');

  function toggleMobileMenu() {
    navToggle.classList.toggle('active');
    if (mobileMenu) mobileMenu.classList.toggle('open');
    document.body.style.overflow = mobileMenu && mobileMenu.classList.contains('open') ? 'hidden' : '';
  }

  function closeMobileMenu() {
    if (navToggle) navToggle.classList.remove('active');
    if (mobileMenu) mobileMenu.classList.remove('open');
    document.body.style.overflow = '';
  }

  if (navToggle) {
    navToggle.addEventListener('click', toggleMobileMenu);
  }

  // Close on mobile link click
  if (mobileMenu) {
    mobileMenu.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', closeMobileMenu);
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMobileMenu();
  });


  // ─── 9. PAGE LOAD ANIMATION ──────────────────────────────
  const loaderEl = document.getElementById('loader');
  if (loaderEl) {
    setTimeout(() => {
      loaderEl.classList.add('done');
      setTimeout(() => loaderEl.remove(), 800);
    }, 1400);
  }


  // ─── 10. MAGNETIC BUTTONS ──────────────────────────────────
  const magneticBtns = document.querySelectorAll('.magnetic');

  magneticBtns.forEach((btn) => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      btn.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
      btn.style.transition = 'transform 0.15s ease';
    });

    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
      btn.style.transition = 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)';
    });
  });


  // ─── 11. IMAGE PARALLAX ON CASE STUDY CARDS ───────────────
  const cardImages = document.querySelectorAll('.work-card-image img');

  function updateParallax() {
    cardImages.forEach((img) => {
      const rect = img.parentElement.getBoundingClientRect();
      const viewH = window.innerHeight;
      if (rect.bottom < 0 || rect.top > viewH) return;
      const center = (rect.top + rect.bottom) / 2;
      const offset = ((center - viewH / 2) / viewH) * -20;
      img.style.transform = `translateY(${offset}px) scale(1.05)`;
    });
    requestAnimationFrame(updateParallax);
  }

  if (cardImages.length) requestAnimationFrame(updateParallax);


  // ─── 12. SCROLL LINE ANIMATION ────────────────────────────
  const scrollPrompt = document.querySelector('.scroll-prompt');
  if (scrollPrompt) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 100) {
        scrollPrompt.style.opacity = '0';
        scrollPrompt.style.transform = 'translateX(-50%) translateY(20px)';
      } else {
        scrollPrompt.style.opacity = '1';
        scrollPrompt.style.transform = 'translateX(-50%) translateY(0)';
      }
    }, { passive: true });
  }


  // ─── 13. GOOGLE ANALYTICS LINK & CTA CLICK TRACKING ───────
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a, button');
    if (!link) return;

    const href = link.getAttribute('href') || link.getAttribute('id') || '';
    const text = link.innerText ? link.innerText.trim().replace(/\s+/g, ' ') : (link.getAttribute('aria-label') || '');
    const sectionEl = link.closest('section, nav, footer, .mobile-menu');
    const sectionId = sectionEl ? (sectionEl.id || sectionEl.tagName.toLowerCase()) : 'page';

    let linkType = 'general_link';
    if (link.classList.contains('nav-link') || link.classList.contains('mobile-link') || link.classList.contains('nav-logo')) {
      linkType = 'navigation';
    } else if (link.classList.contains('btn-primary') || link.classList.contains('btn-outline') || link.classList.contains('nav-link--cta')) {
      linkType = 'cta_button';
    } else if (link.classList.contains('work-card-link')) {
      linkType = 'case_study_link';
    } else if (link.classList.contains('exp-link')) {
      linkType = 'experience_link';
    } else if (link.classList.contains('contact-link')) {
      linkType = href.startsWith('mailto:') ? 'email_contact' : 'social_contact';
    } else if (link.id === 'navToggle') {
      linkType = 'mobile_menu_toggle';
    }

    if (typeof window.gtag === 'function') {
      // Standard GA4 event
      window.gtag('event', 'click', {
        event_category: linkType,
        event_label: text,
        link_url: href,
        link_text: text,
        link_type: linkType,
        link_section: sectionId
      });

      // Additional standard select_content event for GA4 content reporting
      window.gtag('event', 'select_content', {
        content_type: linkType,
        item_id: href || text
      });
    }
  });

});

