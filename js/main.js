/**
 * Main JS - Navigation, Animations, Utilities
 */

// === Navigation Component ===
function renderNavigation(activePage) {
  const navLinks = [
    { href: 'index.html', icon: 'fas fa-home', label: 'Trang chủ', id: 'index' },
    { href: 'about.html', icon: 'fas fa-user', label: 'Giới thiệu', id: 'about' },
    { href: 'projects.html', icon: 'fas fa-rocket', label: 'Dự án', id: 'projects' },
    { href: 'skills.html', icon: 'fas fa-code', label: 'Kỹ năng', id: 'skills' },
    { href: 'experience.html', icon: 'fas fa-briefcase', label: 'Kinh nghiệm', id: 'experience' },
    { href: 'education.html', icon: 'fas fa-graduation-cap', label: 'Học vấn', id: 'education' },
    { href: 'contact.html', icon: 'fas fa-envelope', label: 'Liên hệ', id: 'contact' },
  ];

  const linksHTML = navLinks.map(link => `
    <li>
      <a href="${link.href}" class="${activePage === link.id ? 'active' : ''}">
        <i class="${link.icon}"></i>
        <span>${link.label}</span>
      </a>
    </li>
  `).join('');

  const navHTML = `
    <button class="nav-toggle" id="navToggle" aria-label="Toggle navigation">
      <i class="fas fa-bars"></i>
    </button>
    <div class="nav-overlay" id="navOverlay"></div>
    <nav class="sidebar-nav" id="sidebarNav">
      <div class="nav-logo">
        <h2>Đoàn Văn Doanh</h2>
        <span>Full Stack Developer</span>
      </div>
      <ul class="nav-links">
        ${linksHTML}
      </ul>
      <div class="nav-footer">
        <div class="social-links">
          <a href="https://github.com/itdoanh" target="_blank" rel="noopener" aria-label="GitHub"><i class="fab fa-github"></i></a>
          <a href="https://youtube.com/@itdoanh" target="_blank" rel="noopener" aria-label="YouTube"><i class="fab fa-youtube"></i></a>
          <a href="https://tiktok.com/@itdoanh" target="_blank" rel="noopener" aria-label="TikTok"><i class="fab fa-tiktok"></i></a>
          <a href="https://facebook.com/itdoanh" target="_blank" rel="noopener" aria-label="Facebook"><i class="fab fa-facebook-f"></i></a>
          <a href="https://x.com/itdoanh" target="_blank" rel="noopener" aria-label="X"><i class="fab fa-x-twitter"></i></a>
          <a href="https://instagram.com/itdoanh" target="_blank" rel="noopener" aria-label="Instagram"><i class="fab fa-instagram"></i></a>
        </div>
      </div>
    </nav>
  `;

  document.body.insertAdjacentHTML('afterbegin', navHTML);
  initNavigation();
}

function initNavigation() {
  const toggle = document.getElementById('navToggle');
  const sidebar = document.getElementById('sidebarNav');
  const overlay = document.getElementById('navOverlay');

  if (toggle) {
    toggle.addEventListener('click', () => {
      sidebar.classList.toggle('active');
      overlay.classList.toggle('active');
      const icon = toggle.querySelector('i');
      icon.classList.toggle('fa-bars');
      icon.classList.toggle('fa-times');
    });
  }

  if (overlay) {
    overlay.addEventListener('click', () => {
      sidebar.classList.remove('active');
      overlay.classList.remove('active');
      const icon = toggle.querySelector('i');
      icon.classList.add('fa-bars');
      icon.classList.remove('fa-times');
    });
  }
}

// === Custom Cursor ===
function initCustomCursor() {
  if (window.innerWidth < 1024) return;

  const dot = document.createElement('div');
  dot.className = 'cursor-dot';
  const ring = document.createElement('div');
  ring.className = 'cursor-ring';
  document.body.appendChild(dot);
  document.body.appendChild(ring);

  let mouseX = 0, mouseY = 0;
  let ringX = 0, ringY = 0;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.left = mouseX - 4 + 'px';
    dot.style.top = mouseY - 4 + 'px';
  });

  function animateRing() {
    ringX += (mouseX - ringX) * 0.15;
    ringY += (mouseY - ringY) * 0.15;
    ring.style.left = ringX - 17.5 + 'px';
    ring.style.top = ringY - 17.5 + 'px';
    requestAnimationFrame(animateRing);
  }
  animateRing();

  // Hover effect on interactive elements
  document.querySelectorAll('a, button, .glass-card, .social-card').forEach(el => {
    el.addEventListener('mouseenter', () => {
      ring.style.transform = 'scale(1.5)';
      ring.style.borderColor = 'rgba(0, 240, 255, 0.8)';
    });
    el.addEventListener('mouseleave', () => {
      ring.style.transform = 'scale(1)';
      ring.style.borderColor = 'rgba(0, 240, 255, 0.5)';
    });
  });
}

// === Loading Screen ===
function initLoader() {
  const loader = document.querySelector('.loader-screen');
  if (loader) {
    window.addEventListener('load', () => {
      setTimeout(() => {
        loader.classList.add('hidden');
        setTimeout(() => loader.remove(), 600);
      }, 400);
    });
  }
}

// === AOS-like Scroll Animations ===
function initScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const delay = entry.target.dataset.aosDelay || 0;
        setTimeout(() => {
          entry.target.classList.add('aos-animate');
        }, parseInt(delay));
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  document.querySelectorAll('[data-aos]').forEach(el => {
    observer.observe(el);
  });
}

// === Typing Effect ===
function initTypingEffect(elementId, texts, typingSpeed = 80, deleteSpeed = 40, pauseTime = 2000) {
  const element = document.getElementById(elementId);
  if (!element) return;

  let textIndex = 0;
  let charIndex = 0;
  let isDeleting = false;

  function type() {
    const currentText = texts[textIndex];

    if (isDeleting) {
      charIndex--;
      element.textContent = currentText.substring(0, charIndex);
    } else {
      charIndex++;
      element.textContent = currentText.substring(0, charIndex);
    }

    let timeout = isDeleting ? deleteSpeed : typingSpeed;

    if (!isDeleting && charIndex === currentText.length) {
      timeout = pauseTime;
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      textIndex = (textIndex + 1) % texts.length;
      timeout = 300;
    }

    setTimeout(type, timeout);
  }

  type();
}

// === Counter Animation ===
function animateCounters() {
  document.querySelectorAll('.stat-number').forEach(counter => {
    const target = parseInt(counter.dataset.count);
    const suffix = counter.dataset.suffix || '';
    const duration = 2000;
    const start = performance.now();

    function update(currentTime) {
      const elapsed = currentTime - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      const current = Math.round(eased * target);

      counter.textContent = current + suffix;

      if (progress < 1) {
        requestAnimationFrame(update);
      }
    }

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        requestAnimationFrame(update);
        observer.disconnect();
      }
    });

    observer.observe(counter);
  });
}

// === GSAP-like stagger animation ===
function staggerReveal(selector, delay = 100) {
  const elements = document.querySelectorAll(selector);
  elements.forEach((el, i) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = `all 0.6s cubic-bezier(0.4, 0, 0.2, 1) ${i * delay}ms`;

    setTimeout(() => {
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
    }, 100);
  });
}

// === Initialize Everything ===
document.addEventListener('DOMContentLoaded', () => {
  initLoader();

  // Small delay to ensure DOM is fully rendered
  setTimeout(() => {
    initScrollAnimations();
    initCustomCursor();
    animateCounters();
  }, 500);
});
