// Always land on top for a fresh visit — stops mobile browsers from
// restoring a remembered scroll position (e.g. from a previous session
// or bfcache restore) and landing mid-page.
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}
if (!window.location.hash) {
  window.scrollTo(0, 0);
}
window.addEventListener('pageshow', (e) => {
  if (!window.location.hash) {
    window.scrollTo(0, 0);
  }
});

document.addEventListener('DOMContentLoaded', () => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------------------------------------------------------------
  // Hero Mouse-Follow Spotlight
  // ---------------------------------------------------------------
  const heroSection = document.querySelector('.hero');
  if (heroSection && !reduceMotion) {
    heroSection.addEventListener('mousemove', (e) => {
      const rect = heroSection.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      heroSection.style.setProperty('--mx', x + '%');
      heroSection.style.setProperty('--my', y + '%');
    });
  }

  // ---------------------------------------------------------------
  // Mobile Navigation Drawer Toggle
  // ---------------------------------------------------------------
  const nav = document.getElementById('nav');
  const menuToggle = document.getElementById('menuToggle');
  const navLinks = document.getElementById('navLinks');

  if (menuToggle && nav) {
    menuToggle.addEventListener('click', () => nav.classList.toggle('open'));
  }
  if (navLinks) {
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => nav.classList.remove('open'));
    });
  }

  // ---------------------------------------------------------------
  // Scroll Progress Bar
  // ---------------------------------------------------------------
  const scrollProgress = document.getElementById('scrollProgress');
  function updateScrollProgress() {
    if (!scrollProgress) return;
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    scrollProgress.style.width = pct + '%';
  }
  window.addEventListener('scroll', updateScrollProgress, { passive: true });
  updateScrollProgress();

  // ---------------------------------------------------------------
  // Active Nav Link Tracking (highlights current section)
  // ---------------------------------------------------------------
  const sections = document.querySelectorAll('main section[id]');
  const navAnchors = navLinks ? navLinks.querySelectorAll('a') : [];

  if (sections.length && navAnchors.length && 'IntersectionObserver' in window) {
    const navObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          navAnchors.forEach(a => {
            a.classList.toggle('active', a.getAttribute('href') === '#' + id);
          });
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });

    sections.forEach(sec => navObserver.observe(sec));
  }

  // ---------------------------------------------------------------
  // Scroll Reveal Animations (fade/slide/scale elements into view)
  // ---------------------------------------------------------------
  const revealEls = document.querySelectorAll('[data-reveal]');

  if (revealEls.length) {
    if (reduceMotion || !('IntersectionObserver' in window)) {
      revealEls.forEach(el => el.classList.add('in-view'));
    } else {
      // Stagger children within the same parent for a cascading effect
      const groups = new Map();
      revealEls.forEach(el => {
        const parent = el.parentElement;
        if (!groups.has(parent)) groups.set(parent, []);
        groups.get(parent).push(el);
      });
      groups.forEach(list => {
        list.forEach((el, i) => {
          el.style.transitionDelay = Math.min(i * 90, 360) + 'ms';
        });
      });

      const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            revealObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

      revealEls.forEach(el => revealObserver.observe(el));
    }
  }

  // ---------------------------------------------------------------
  // Animated Skill Bars (fill to target width once visible)
  // ---------------------------------------------------------------
  const progressFills = document.querySelectorAll('.progress-fill');

  if (progressFills.length) {
    progressFills.forEach(fill => {
      const target = fill.style.width || '0%';
      fill.dataset.target = target;
      fill.style.width = '0%';
    });

    if (reduceMotion || !('IntersectionObserver' in window)) {
      progressFills.forEach(fill => { fill.style.width = fill.dataset.target; fill.classList.add('filled'); });
    } else {
      const barObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.style.width = entry.target.dataset.target;
            entry.target.classList.add('filled');
            barObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.4 });

      progressFills.forEach(fill => barObserver.observe(fill));
    }
  }

  // ---------------------------------------------------------------
  // Hero Role Typing Cycler
  // ---------------------------------------------------------------
  const roleCycler = document.getElementById('roleCycler');
  const roles = ['AI Engineer', 'Database Architect', 'Problem Solver'];

  if (roleCycler) {
    if (reduceMotion) {
      roleCycler.textContent = roles[0];
    } else {
      let roleIndex = 0;
      let charIndex = roles[0].length;
      let deleting = false;

      function tick() {
        const current = roles[roleIndex];

        if (!deleting) {
          charIndex++;
          if (charIndex > current.length) {
            charIndex = current.length;
            deleting = true;
            setTimeout(tick, 1600);
            return;
          }
        } else {
          charIndex--;
          if (charIndex < 0) {
            charIndex = 0;
            deleting = false;
            roleIndex = (roleIndex + 1) % roles.length;
          }
        }

        roleCycler.textContent = current.substring(0, charIndex);
        setTimeout(tick, deleting ? 35 : 75);
      }

      // Kick off after the initial full word has displayed once
      roleCycler.textContent = roles[0];
      setTimeout(() => { deleting = true; tick(); }, 1800);
    }
  }

  // ---------------------------------------------------------------
  // Multi-Image Project Scroller Engine (supports multiple carousels)
  // ---------------------------------------------------------------
  const allCarousels = document.querySelectorAll('.carousel-container');

  allCarousels.forEach(container => {
    const carousel = container.querySelector('.carousel-viewport');
    const prevBtn = container.querySelector('.btn-prev');
    const nextBtn = container.querySelector('.btn-next');
    const indicatorsContainer = container.querySelector('.carousel-indicators');

    if (!carousel || !indicatorsContainer) return;

    const slides = carousel.querySelectorAll('.carousel-slide');
    let currentIndex = 0;
    let autoplayTimer = null;

    slides.forEach((_, idx) => {
      const dot = document.createElement('div');
      dot.classList.add('indicator-dot');
      if (idx === 0) dot.classList.add('active');
      dot.addEventListener('click', () => { goToSlide(idx); resetAutoplay(); });
      indicatorsContainer.appendChild(dot);
    });

    const dots = indicatorsContainer.querySelectorAll('.indicator-dot');

    function updateCarouselState() {
      carousel.style.transform = `translateX(-${currentIndex * 100}%)`;
      dots.forEach((dot, idx) => {
        dot.classList.toggle('active', idx === currentIndex);
      });
    }

    function goToSlide(index) {
      currentIndex = index;
      updateCarouselState();
    }

    function nextSlide() {
      currentIndex = (currentIndex + 1) % slides.length;
      updateCarouselState();
    }

    function prevSlide() {
      currentIndex = (currentIndex - 1 + slides.length) % slides.length;
      updateCarouselState();
    }

    function resetAutoplay() {
      if (autoplayTimer) clearInterval(autoplayTimer);
      if (!reduceMotion && slides.length > 1) {
        autoplayTimer = setInterval(nextSlide, 5000);
      }
    }

    if (nextBtn) nextBtn.addEventListener('click', () => { nextSlide(); resetAutoplay(); });
    if (prevBtn) prevBtn.addEventListener('click', () => { prevSlide(); resetAutoplay(); });

    resetAutoplay();
  });

  // ---------------------------------------------------------------
  // Subtle 3D Tilt on Flagship / Project Cards
  // ---------------------------------------------------------------
  const tiltCards = document.querySelectorAll('.project-card.tilt');

  if (tiltCards.length && !reduceMotion) {
    tiltCards.forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width - 0.5;
        const py = (e.clientY - rect.top) / rect.height - 0.5;
        const rotateX = (-py * 3.5).toFixed(2);
        const rotateY = (px * 3.5).toFixed(2);
        card.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-3px)`;
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });
  }

  // ---------------------------------------------------------------
  // Magnetic Pull on Primary Buttons
  // ---------------------------------------------------------------
  const magneticBtns = document.querySelectorAll('.btn-primary, .btn-outline');

  if (magneticBtns.length && !reduceMotion) {
    magneticBtns.forEach(btn => {
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = (e.clientX - rect.left - rect.width / 2) * 0.25;
        const y = (e.clientY - rect.top - rect.height / 2) * 0.35;
        btn.style.transform = `translate(${x}px, ${y}px)`;
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.transform = '';
      });
    });
  }
});
