// ===== AlexMedia — shared site behavior =====
document.documentElement.classList.add('js-anim');

// nav shadow on scroll
const nav = document.getElementById('nav');
if (nav) {
  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 12);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
}

// mobile menu
const toggle = document.getElementById('navToggle');
const menu = document.getElementById('mobileMenu');
if (toggle && menu) {
  toggle.addEventListener('click', () => menu.classList.toggle('open'));
  menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => menu.classList.remove('open')));
}

// scroll reveal (robust: IO + viewport check + safety fallback)
const revealEls = Array.from(document.querySelectorAll('[data-reveal]'));
if (revealEls.length) {
  const show = (el) => el.classList.add('in');
  const inView = (el) => {
    const r = el.getBoundingClientRect();
    return r.top < (window.innerHeight || document.documentElement.clientHeight) - 30 && r.bottom > 0;
  };
  const sweep = () => revealEls.forEach(el => { if (!el.classList.contains('in') && inView(el)) show(el); });

  let io = null;
  if ('IntersectionObserver' in window) {
    io = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { show(e.target); io.unobserve(e.target); } });
    }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });
    revealEls.forEach(el => io.observe(el));
  }
  sweep();
  window.addEventListener('scroll', sweep, { passive: true });
  window.addEventListener('load', sweep);
  requestAnimationFrame(sweep);
  const forceShow = () => revealEls.forEach(el => {
    el.style.transition = 'none';
    el.style.opacity = '1';
    el.style.transform = 'none';
  });
  setTimeout(forceShow, 1600);
}

// contact form validation
const form = document.getElementById('contactForm');
if (form) {
  const fail = (id, cond) => {
    const el = document.getElementById(id);
    const field = el.closest('.field');
    field.classList.toggle('err', cond);
    return cond;
  };
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const emailVal = document.getElementById('email').value.trim();
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal);
    let bad = false;
    bad = fail('name', !document.getElementById('name').value.trim()) || bad;
    bad = fail('business', !document.getElementById('business').value.trim()) || bad;
    bad = fail('email', !emailOk) || bad;
    bad = fail('service', !document.getElementById('service').value) || bad;
    bad = fail('message', !document.getElementById('message').value.trim()) || bad;
    if (bad) {
      const firstErr = form.querySelector('.field.err input, .field.err select, .field.err textarea');
      if (firstErr) firstErr.focus();
      return;
    }
    document.getElementById('formFields').style.display = 'none';
    document.getElementById('formSuccess').classList.add('show');
  });
  form.querySelectorAll('input, select, textarea').forEach(el => {
    el.addEventListener('input', () => el.closest('.field').classList.remove('err'));
  });
}
