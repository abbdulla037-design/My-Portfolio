document.addEventListener('DOMContentLoaded', () => {

  // 1. Scroll Progress Bar
  const scrollProgress = document.getElementById('scrollProgress');
  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    scrollProgress.style.width = `${(scrollTop / docHeight) * 100}%`;
  }, { passive: true });

  // 2. Background Orbs Parallax Effect
  const orbs = document.querySelectorAll('.orb');
  window.addEventListener('scroll', () => {
    const scrolled = window.scrollY;
    orbs.forEach(orb => {
      const speed = parseFloat(orb.getAttribute('data-speed'));
      orb.style.transform = `translateY(${scrolled * speed}px)`;
    });
  }, { passive: true });

  // 3. Magnetic Hover Buttons
  const magneticEls = document.querySelectorAll('.magnetic');
  magneticEls.forEach(el => {
    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left - rect.width / 2) * 0.3;
      const y = (e.clientY - rect.top - rect.height / 2) * 0.3;
      el.style.transform = `translate(${x}px, ${y}px) scale(1.02)`;
    });
    el.addEventListener('mouseleave', () => {
      el.style.transform = `translate(0px, 0px) scale(1)`;
    });
  });

  // 4. Scroll Reveal & Skill Bar Observer
  const revealEls = document.querySelectorAll('[data-reveal]');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        
        const bars = entry.target.querySelectorAll('.progress-fill');
        bars.forEach((bar, index) => {
          setTimeout(() => { bar.style.width = bar.getAttribute('data-target'); }, 200 + (index * 100));
        });
        
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  
  revealEls.forEach(el => observer.observe(el));

  // 5. Active Navigation Dock Sync
  const sections = document.querySelectorAll('main section[id]');
  const navItems = document.querySelectorAll('.dock-item');
  
  const navObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navItems.forEach(item => {
          item.classList.toggle('current', item.dataset.key === id);
        });
      }
    });
  }, { rootMargin: '-40% 0px -60% 0px' });
  sections.forEach(sec => navObserver.observe(sec));

  // 6. Hero Role Typing Cycler
  const roleCycler = document.getElementById('roleCycler');
  const roles = ['AI Engineer', 'Backend Developer', 'System Architect'];
  let roleIdx = 0, charIdx = roles[0].length, deleting = true;

  function tickRoles() {
    const current = roles[roleIdx];
    if (!deleting) {
      charIdx++;
      if (charIdx > current.length) { charIdx = current.length; deleting = true; setTimeout(tickRoles, 1600); return; }
    } else {
      charIdx--;
      if (charIdx < 0) { charIdx = 0; deleting = false; roleIdx = (roleIdx + 1) % roles.length; }
    }
    roleCycler.textContent = current.substring(0, charIdx);
    setTimeout(tickRoles, deleting ? 30 : 60);
  }
  if (roleCycler) setTimeout(tickRoles, 1600);

  // 7. Carousel Logic
  document.querySelectorAll('.carousel-container').forEach(container => {
    const viewport = container.querySelector('.carousel-viewport');
    const slides = container.querySelectorAll('.carousel-slide');
    const indicators = container.querySelector('.carousel-indicators');
    const nextBtn = container.querySelector('.btn-next');
    const prevBtn = container.querySelector('.btn-prev');
    
    if (!viewport || slides.length <= 1) return;

    let currentIdx = 0;

    slides.forEach((_, i) => {
      const dot = document.createElement('div');
      dot.className = `indicator-dot ${i === 0 ? 'active' : ''}`;
      dot.onclick = () => { currentIdx = i; update(); };
      indicators.appendChild(dot);
    });

    const update = () => {
      viewport.style.transform = `translateX(-${currentIdx * 100}%)`;
      container.querySelectorAll('.indicator-dot').forEach((dot, i) => dot.classList.toggle('active', i === currentIdx));
    };

    const next = () => { currentIdx = (currentIdx + 1) % slides.length; update(); };
    const prev = () => { currentIdx = (currentIdx - 1 + slides.length) % slides.length; update(); };

    if(nextBtn) nextBtn.addEventListener('click', next);
    if(prevBtn) prevBtn.addEventListener('click', prev);
    
    setInterval(next, 4500); 
  });

  // 8. Certificate Lightbox Modal
  const certModal = document.getElementById('certModal');
  const certModalImg = document.getElementById('certModalImg');
  const certModalTitle = document.getElementById('certModalTitle');
  const certModalIssuer = document.getElementById('certModalIssuer');
  const certModalMeta = document.getElementById('certModalMeta');

  document.querySelectorAll('.cert-card-premium').forEach(card => {
    card.addEventListener('click', () => {
      const img = card.querySelector('img');
      const title = card.querySelector('h4');
      const issuer = card.querySelector('.cert-premium-issuer');
      const meta = card.querySelector('.cert-premium-meta');

      if (img) certModalImg.src = img.src;
      if (title) certModalTitle.textContent = title.textContent;
      if (issuer) certModalIssuer.textContent = issuer.textContent;
      certModalMeta.textContent = meta ? meta.textContent : '';
      
      certModal.classList.add('active');
    });
  });

  const closeModal = () => certModal.classList.remove('active');
  document.getElementById('certModalClose').addEventListener('click', closeModal);
  document.getElementById('certModalBackdrop').addEventListener('click', closeModal);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && certModal.classList.contains('active')) {
      closeModal();
    }
  });

});
