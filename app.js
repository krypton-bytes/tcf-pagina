/* ============================================
   TCF — Interactividad, reveals, parallax, tweaks
   ============================================ */

// === Monitor Block A — entrance + breathing + mouse parallax ===
(function () {
  const wrapper = document.querySelector('.kustek-desktop-wrapper');
  const img     = document.querySelector('.kustek-desktop-img');
  const glow    = document.querySelector('.kustek-desktop-glow');
  if (!wrapper || !img) return;

  // Scroll entrance
  const monitorIO = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      monitorIO.unobserve(entry.target);
      wrapper.classList.add('monitor-visible');
      setTimeout(() => {
        img.classList.add('monitor-breathing');
        if (glow) glow.classList.add('glow-breathing');
      }, 1000);
    });
  }, { threshold: 0.2 });
  monitorIO.observe(wrapper);

  // Mouse parallax tilt
  wrapper.addEventListener('mousemove', (e) => {
    const rect = wrapper.getBoundingClientRect();
    const dx = (e.clientX - rect.left - rect.width  / 2) / (rect.width  / 2);
    const dy = (e.clientY - rect.top  - rect.height / 2) / (rect.height / 2);
    img.style.animationPlayState = 'paused';
    img.style.transition = 'transform 0.15s ease-out';
    img.style.transform  = `perspective(1200px) rotateX(${-dy * 4}deg) rotateY(${dx * 4}deg)`;
  });
  wrapper.addEventListener('mouseleave', () => {
    img.style.transition = '';
    img.style.transform  = '';
    img.style.animationPlayState = 'running';
  });
})();

// === Navbar scroll ===
const nav = document.getElementById('nav');
const onScroll = () => {
  if (window.scrollY > 40) nav.classList.add('scrolled');
  else nav.classList.remove('scrolled');

  // Parallax hero video
  const hv = document.getElementById('heroVideo');
  if (hv) {
    const y = Math.min(window.scrollY * 0.25, 200);
    hv.style.transform = `scale(1.05) translateY(${y}px)`;
  }

  // Parallax phones
  document.querySelectorAll('[data-parallax]').forEach(el => {
    const factor = parseFloat(el.dataset.parallax);
    const rect = el.getBoundingClientRect();
    const mid = window.innerHeight / 2;
    const delta = (rect.top - mid) * factor;
    el.style.setProperty('--parallax', delta + 'px');
  });
};
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// === Reveal on intersect ===
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('in-view');
      // counter
      if (e.target.classList.contains('hero-stats')) animateCounters();
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

document.querySelectorAll('.reveal, .section-head, .hero-stats, .gold-line').forEach(el => io.observe(el));

// Animate gold lines when section-head reveals
const lineObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('in-view'); });
}, { threshold: 0.2 });
document.querySelectorAll('.gold-line').forEach(l => lineObserver.observe(l));

// === Counter animation ===
let countersAnimated = false;
function animateCounters() {
  if (countersAnimated) return;
  countersAnimated = true;
  document.querySelectorAll('[data-count]').forEach((num, index) => {
    const target = parseInt(num.dataset.count, 10);
    const val    = num.querySelector('.val');
    if (!val) return;
    const dur    = 1800;
    const delay  = index * 80; // stagger each stat by 80ms
    setTimeout(() => {
      const start = performance.now();
      const tick = (now) => {
        const p      = Math.min((now - start) / dur, 1);
        // Cubic ease-out: fast start, slow finish — very satisfying
        const eased  = 1 - Math.pow(1 - p, 3);
        val.textContent = Math.round(eased * target);
        if (p < 1) requestAnimationFrame(tick);
        else val.textContent = target;
      };
      requestAnimationFrame(tick);
    }, delay);
  });
}

// Observe hero-stats for counter trigger
const statsEl = document.querySelector('.hero-stats');
if (statsEl) io.observe(statsEl);

// === Form → WhatsApp ===
window.enviarWhatsApp = function(e) {
  e.preventDefault();
  const f = e.target;
  const d = new FormData(f);
  const msg = `Buen día, me comunico desde el sitio web de TCF:\n\n` +
    `• Nombre: ${d.get('nombre') || '—'}\n` +
    `• Email: ${d.get('email') || '—'}\n` +
    `• Mensaje: ${d.get('mensaje') || '—'}`;
  const url = `https://api.whatsapp.com/send?phone=525641603095&text=${encodeURIComponent(msg)}`;
  window.open(url, '_blank', 'noopener');
  return false;
};

// === Year ===
const y = document.getElementById('year');
if (y) y.textContent = new Date().getFullYear();

// === Nav toggle (mobile) ===
const navToggle = document.getElementById('navToggle');
if (navToggle) navToggle.addEventListener('click', () => {
  const links = document.querySelector('.nav-links');
  links.style.display = links.style.display === 'flex' ? '' : 'flex';
  links.style.flexDirection = 'column';
  links.style.position = 'absolute';
  links.style.top = '100%';
  links.style.left = 0;
  links.style.right = 0;
  links.style.background = 'rgba(10,10,10,0.96)';
  links.style.padding = '20px var(--gutter)';
  links.style.gap = '20px';
});

// =====================================================
// TWEAKS panel — edit mode protocol
// =====================================================
const tweakPanel = document.getElementById('tweaksPanel');
const closeTweaks = document.getElementById('closeTweaks');

// Apply a state
function applyTweaks(s) {
  document.documentElement.style.setProperty('--gold', s.gold);
  document.documentElement.style.setProperty('--gold-bright', shift(s.gold, 18));
  document.documentElement.style.setProperty('--gold-deep', shift(s.gold, -40));
  document.documentElement.style.setProperty('--black', s.baseBlack);
  document.body.style.background = s.baseBlack;
  document.documentElement.style.setProperty('--font-display', `"${s.displayFont}", Impact, sans-serif`);

  // grain opacity via ::before
  const grainStyle = document.getElementById('grainStyle') || (() => {
    const st = document.createElement('style'); st.id = 'grainStyle'; document.head.appendChild(st); return st;
  })();
  grainStyle.textContent = `body::before { opacity: ${s.grain} !important; }`;

  // video brightness
  const hv = document.getElementById('heroVideo');
  if (hv) hv.style.filter = `saturate(0.6) contrast(1.08) brightness(${s.heroBright})`;

  // UI controls reflect
  document.getElementById('tw-gold').value = s.gold;
  document.getElementById('tw-grain').value = s.grain;
  document.getElementById('tw-grain-val').textContent = (+s.grain).toFixed(2);
  document.getElementById('tw-video-bright').value = s.heroBright;
  document.getElementById('tw-vd-val').textContent = (+s.heroBright).toFixed(2);

  document.querySelectorAll('#tw-base button').forEach(b => b.classList.toggle('active', b.dataset.black === s.baseBlack));
  document.querySelectorAll('#tw-display button').forEach(b => b.classList.toggle('active', b.dataset.font === s.displayFont));
}

function shift(hex, pct) {
  const n = parseInt(hex.replace('#',''), 16);
  let r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  const amt = Math.round(2.55 * pct);
  r = Math.max(0, Math.min(255, r + amt));
  g = Math.max(0, Math.min(255, g + amt));
  b = Math.max(0, Math.min(255, b + amt));
  return '#' + ((r<<16)|(g<<8)|b).toString(16).padStart(6,'0');
}

// Current state (clone defaults)
let state = Object.assign({}, TWEAK_DEFAULTS);
applyTweaks(state);

// Persist partial changes via postMessage
function persist(partial) {
  Object.assign(state, partial);
  applyTweaks(state);
  window.parent.postMessage({ type: '__edit_mode_set_keys', edits: partial }, '*');
}

// Wire controls
document.getElementById('tw-gold').addEventListener('input', e => persist({ gold: e.target.value }));
document.getElementById('tw-grain').addEventListener('input', e => persist({ grain: +e.target.value }));
document.getElementById('tw-video-bright').addEventListener('input', e => persist({ heroBright: +e.target.value }));

document.querySelectorAll('#tw-base button').forEach(b => b.addEventListener('click', () => persist({ baseBlack: b.dataset.black })));
document.querySelectorAll('#tw-display button').forEach(b => b.addEventListener('click', () => persist({ displayFont: b.dataset.font })));

// Edit mode listener — register BEFORE announcing
window.addEventListener('message', (e) => {
  const t = e.data && e.data.type;
  if (t === '__activate_edit_mode') tweakPanel.classList.add('open');
  if (t === '__deactivate_edit_mode') tweakPanel.classList.remove('open');
});

if (closeTweaks) closeTweaks.addEventListener('click', () => tweakPanel.classList.remove('open'));

// Announce availability
window.parent.postMessage({ type: '__edit_mode_available' }, '*');

// === Phone entrance + badge stagger ===
function animatePhoneEntrance(img) {
  img.classList.add('phone-entering');
  setTimeout(() => {
    img.classList.remove('phone-entering');
    img.classList.add('phone-floating');
  }, 900);
}

// Desktop diagram phone
const phoneImg = document.querySelector('.kustek-phone-center img');
const phoneCenterEl = document.querySelector('.kustek-phone-center');
if (phoneImg && phoneCenterEl) {
  const phoneObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      phoneObserver.unobserve(entry.target);
      animatePhoneEntrance(phoneImg);
      phoneCenterEl.classList.add('glow-pulsing');
      const leftBadges = document.querySelectorAll('.kustek-mobile-features-left .mobile-feature');
      const rightBadges = document.querySelectorAll('.kustek-mobile-features-right .mobile-feature');
      leftBadges.forEach((badge, i) => {
        setTimeout(() => {
          badge.style.opacity = '1';
          badge.style.transform = 'translateX(0)';
        }, i * 150);
      });
      rightBadges.forEach((badge, i) => {
        setTimeout(() => {
          badge.style.opacity = '1';
          badge.style.transform = 'translateX(0)';
        }, i * 150);
      });
    });
  }, { threshold: 0.3 });
  phoneObserver.observe(phoneCenterEl);
}

// === CTA final — entrance animations ===
(function () {
  const cta = document.querySelector('.kustek-final-cta');
  if (!cta) return;
  const diamond = cta.querySelector('.cta-diamond');
  const lines   = cta.querySelectorAll('.cta-line');
  const left    = cta.querySelector('.cta-left');
  const right   = cta.querySelector('.cta-right');
  const trust   = cta.querySelector('.cta-trust');
  const ctaIO = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      ctaIO.unobserve(entry.target);
      if (diamond) diamond.classList.add('visible');
      setTimeout(() => lines.forEach(l => l.classList.add('visible')), 100);
      if (left)  left.classList.add('visible');
      if (right) right.classList.add('visible');
      if (trust) trust.classList.add('visible');
    });
  }, { threshold: 0.15 });
  ctaIO.observe(cta);
})();

// Mobile/tablet preview phone
const mobilePreviewImg = document.querySelector('.kustek-mobile-phone-preview img');
const mobilePreviewEl = document.querySelector('.kustek-mobile-phone-preview');
if (mobilePreviewImg && mobilePreviewEl) {
  const mobilePhoneObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      mobilePhoneObserver.unobserve(entry.target);
      animatePhoneEntrance(mobilePreviewImg);
    });
  }, { threshold: 0.3 });
  mobilePhoneObserver.observe(mobilePreviewEl);
}
