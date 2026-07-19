/* ============================================================
   MOHAMAD ASMAL — DEVELOPER PORTFOLIO — script.js
   Vanilla ES6+. No frameworks, no build step.
   ============================================================ */
(() => {
  'use strict';

  const $  = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------------------------------------------------
     1. LOADING SCREEN
  --------------------------------------------------------- */
  window.addEventListener('load', () => {
    const loader = $('#loader');
    if (!loader) return;
    setTimeout(() => loader.classList.add('hide'), 900);
  });

  /* ---------------------------------------------------------
     2. SCROLL PROGRESS BAR
  --------------------------------------------------------- */
  const progressBar = $('#scroll-progress');
  const onScrollProgress = () => {
    const h = document.documentElement;
    const scrolled = (h.scrollTop) / (h.scrollHeight - h.clientHeight) * 100;
    if (progressBar) progressBar.style.width = `${scrolled}%`;
  };
  document.addEventListener('scroll', onScrollProgress, { passive: true });

  /* ---------------------------------------------------------
     3. STICKY NAVBAR — shrink + active link on scroll
  --------------------------------------------------------- */
  const nav = $('#navbar');
  const sections = $$('main section[id]');
  const navLinks = $$('.nav-link');

  const onScrollNav = () => {
    if (window.scrollY > 40) nav.classList.add('nav-solid');
    else nav.classList.remove('nav-solid');

    let current = sections[0]?.id;
    const scrollPos = window.scrollY + window.innerHeight * 0.35;
    for (const sec of sections) {
      if (scrollPos >= sec.offsetTop) current = sec.id;
    }
    navLinks.forEach(link => {
      link.classList.toggle('active', link.dataset.link === current);
    });
  };
  document.addEventListener('scroll', onScrollNav, { passive: true });
  onScrollNav();

  /* ---------------------------------------------------------
     4. MOBILE MENU
  --------------------------------------------------------- */
  const menuBtn = $('#menu-btn');
  const mobileMenu = $('#mobile-menu');
  const menuIconOpen = $('#icon-open');
  const menuIconClose = $('#icon-close');

  menuBtn?.addEventListener('click', () => {
    const isOpen = mobileMenu.classList.toggle('open');
    menuIconOpen.classList.toggle('hidden', isOpen);
    menuIconClose.classList.toggle('hidden', !isOpen);
    menuBtn.setAttribute('aria-expanded', String(isOpen));
  });
  $$('#mobile-menu a').forEach(a => a.addEventListener('click', () => {
    mobileMenu.classList.remove('open');
    menuIconOpen.classList.remove('hidden');
    menuIconClose.classList.add('hidden');
  }));

  /* ---------------------------------------------------------
     5. BACK TO TOP
  --------------------------------------------------------- */
  const backToTop = $('#back-to-top');
  document.addEventListener('scroll', () => {
    backToTop?.classList.toggle('show', window.scrollY > 600);
  }, { passive: true });
  backToTop?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  /* ---------------------------------------------------------
     6. CUSTOM CURSOR + GLOW
  --------------------------------------------------------- */
  if (!reduceMotion && window.matchMedia('(hover:hover)').matches) {
    const glow = $('#cursor-glow');
    const dot = $('#cursor-dot');
    const ring = $('#cursor-ring');
    let mx = innerWidth / 2, my = innerHeight / 2;
    let rx = mx, ry = my;

    window.addEventListener('mousemove', e => {
      mx = e.clientX; my = e.clientY;
      if (glow) { glow.style.transform = `translate(${mx}px, ${my}px) translate(-50%,-50%)`; }
      if (dot) { dot.style.left = `${mx}px`; dot.style.top = `${my}px`; }
    });

    const animateRing = () => {
      rx += (mx - rx) * 0.15;
      ry += (my - ry) * 0.15;
      if (ring) { ring.style.left = `${rx}px`; ring.style.top = `${ry}px`; }
      requestAnimationFrame(animateRing);
    };
    animateRing();

    $$('a, button, .glass-hover, .skill-card, .project-card').forEach(el => {
      el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
      el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
    });
  }

  /* ---------------------------------------------------------
     7. MOUSE PARALLAX (hero blobs / floating shapes)
  --------------------------------------------------------- */
  const parallaxEls = $$('[data-parallax]');
  if (!reduceMotion && parallaxEls.length) {
    window.addEventListener('mousemove', e => {
      const px = (e.clientX / innerWidth - 0.5);
      const py = (e.clientY / innerHeight - 0.5);
      parallaxEls.forEach(el => {
        const depth = parseFloat(el.dataset.parallax) || 20;
        el.style.transform = `translate(${px * depth}px, ${py * depth}px)`;
      });
    });
  }

  /* ---------------------------------------------------------
     8. BACKGROUND CANVAS — network / node particles
  --------------------------------------------------------- */
  const canvas = $('#bg-canvas');
  if (canvas && !reduceMotion) {
    const ctx = canvas.getContext('2d');
    let w, h, particles = [];
    const COUNT = window.innerWidth < 768 ? 45 : 90;
    const MAX_DIST = 130;
    const mouse = { x: null, y: null, radius: 150 };

    function resize() {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resize);
    resize();

    class Particle {
      constructor() {
        this.x = Math.random() * w;
        this.y = Math.random() * h;
        this.vx = (Math.random() - 0.5) * 0.35;
        this.vy = (Math.random() - 0.5) * 0.35;
        this.r = Math.random() * 1.6 + 0.6;
      }
      update() {
        this.x += this.vx; this.y += this.vy;
        if (this.x < 0 || this.x > w) this.vx *= -1;
        if (this.y < 0 || this.y > h) this.vy *= -1;
        if (mouse.x !== null) {
          const dx = this.x - mouse.x, dy = this.y - mouse.y;
          const dist = Math.hypot(dx, dy);
          if (dist < mouse.radius) {
            const force = (mouse.radius - dist) / mouse.radius;
            this.x += (dx / dist) * force * 1.2;
            this.y += (dy / dist) * force * 1.2;
          }
        }
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(56,189,248,0.7)';
        ctx.fill();
      }
    }

    for (let i = 0; i < COUNT; i++) particles.push(new Particle());

    window.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });
    window.addEventListener('mouseleave', () => { mouse.x = null; mouse.y = null; });

    function connect() {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.hypot(dx, dy);
          if (dist < MAX_DIST) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(124,58,237,${0.16 * (1 - dist / MAX_DIST)})`;
            ctx.lineWidth = 1;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
    }

    function loop() {
      ctx.clearRect(0, 0, w, h);
      particles.forEach(p => { p.update(); p.draw(); });
      connect();
      requestAnimationFrame(loop);
    }
    loop();
  }

  /* ---------------------------------------------------------
     9. TYPING EFFECT — hero role cycle
  --------------------------------------------------------- */
  const typeTarget = $('#typing-role');
  const roles = [
    'Software Engineer',
    'Full-Stack Developer',
    'MERN Stack Developer',
    'Vibe Coder',
    'Graphic Designer'
  ];
  if (typeTarget) {
    let roleIndex = 0, charIndex = 0, deleting = false;

    function tick() {
      const current = roles[roleIndex];
      if (!deleting) {
        charIndex++;
        typeTarget.textContent = current.slice(0, charIndex);
        if (charIndex === current.length) {
          deleting = true;
          setTimeout(tick, 1600);
          return;
        }
      } else {
        charIndex--;
        typeTarget.textContent = current.slice(0, charIndex);
        if (charIndex === 0) {
          deleting = false;
          roleIndex = (roleIndex + 1) % roles.length;
        }
      }
      setTimeout(tick, deleting ? 40 : 80);
    }
    tick();
  }

  /* ---------------------------------------------------------
     10. SCROLL REVEAL (IntersectionObserver)
  --------------------------------------------------------- */
  const revealEls = $$('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('in-view'));
  }

  /* ---------------------------------------------------------
     11. SKILL BARS — animate width when in view
  --------------------------------------------------------- */
  const skillBars = $$('.skill-fill');
  if ('IntersectionObserver' in window && skillBars.length) {
    const skillIO = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          el.style.width = `${el.dataset.level}%`;
          skillIO.unobserve(el);
        }
      });
    }, { threshold: 0.4 });
    skillBars.forEach(el => skillIO.observe(el));
  }

  /* ---------------------------------------------------------
     12. ANIMATED COUNTERS
  --------------------------------------------------------- */
  const counters = $$('.counter');
  if ('IntersectionObserver' in window && counters.length) {
    const counterIO = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = parseInt(el.dataset.target, 10);
        const duration = 1400;
        const start = performance.now();
        function step(now) {
          const progress = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          el.textContent = Math.floor(eased * target).toString();
          if (progress < 1) requestAnimationFrame(step);
          else el.textContent = target.toString();
        }
        requestAnimationFrame(step);
        counterIO.unobserve(el);
      });
    }, { threshold: 0.6 });
    counters.forEach(el => counterIO.observe(el));
  }

  /* ---------------------------------------------------------
     13. RIPPLE BUTTON EFFECT
  --------------------------------------------------------- */
  $$('.ripple').forEach(btn => {
    btn.addEventListener('click', function (e) {
      const rect = this.getBoundingClientRect();
      const span = document.createElement('span');
      const size = Math.max(rect.width, rect.height);
      span.className = 'ripple-el';
      span.style.width = span.style.height = `${size}px`;
      span.style.left = `${e.clientX - rect.left - size / 2}px`;
      span.style.top = `${e.clientY - rect.top - size / 2}px`;
      this.appendChild(span);
      setTimeout(() => span.remove(), 650);
    });
  });

  /* ---------------------------------------------------------
     14. CONTACT FORM — sends via FormSubmit (delivers to Gmail)
  --------------------------------------------------------- */
  const form = $('#contact-form');
  const CONTACT_ENDPOINT = 'https://formsubmit.co/ajax/mohammedasmal120@gmail.com';

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const status = $('#form-status');
    const submitBtn = form.querySelector('button[type="submit"]');
    const name = $('#f-name').value.trim();
    const email = $('#f-email').value.trim();
    const message = $('#f-message').value.trim();
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    if (!name || !emailOk || !message) {
      status.textContent = 'Please fill in every field with a valid email.';
      status.className = 'text-sm mt-3 text-rose-400';
      return;
    }

    submitBtn?.setAttribute('disabled', 'true');
    status.textContent = 'Sending…';
    status.className = 'text-sm mt-3 text-txt2';

    try {
      const res = await fetch(CONTACT_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ name, email, message }),
      });

      if (!res.ok) throw new Error('Request failed');

      status.textContent = 'Message sent — thanks! I will get back to you soon.';
      status.className = 'text-sm mt-3 text-emerald-400';
      form.reset();
    } catch (err) {
      status.textContent = 'Something went wrong. Please email me directly at mohammedasmal120@gmail.com.';
      status.className = 'text-sm mt-3 text-rose-400';
    } finally {
      submitBtn?.removeAttribute('disabled');
    }
  });

  /* ---------------------------------------------------------
     15. CURRENT YEAR IN FOOTER
  --------------------------------------------------------- */
  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------------------------------------------------------
     16. SMOOTH ANCHOR SCROLL (offset for sticky nav)
  --------------------------------------------------------- */
  $$('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const id = link.getAttribute('href');
      if (id.length < 2) return;
      const target = $(id);
      if (!target) return;
      e.preventDefault();
      const offset = 76;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

})();
