// ========================================
// EXITBIZ — Main JS
// ========================================

// ---- LANGUAGE TOGGLE ----
let currentLang = 'ro';

function setLanguage(lang) {
  currentLang = lang;
  document.querySelectorAll('[data-ro]').forEach(el => {
    el.textContent = el.dataset[lang] || el.dataset['ro'];
  });
  const btn = document.getElementById('lang-btn');
  btn.textContent = lang === 'ro' ? 'EN' : 'RO';
  document.documentElement.lang = lang;
  // update placeholders
  const placeholders = {
    ro: { name: 'Ion Popescu', email: 'ion@firma.ro', message: 'Descrie pe scurt situația firmei tale...' },
    en: { name: 'John Smith', email: 'john@company.com', message: 'Briefly describe your company situation...' }
  };
  const p = placeholders[lang];
  const nameEl = document.getElementById('name');
  const emailEl = document.getElementById('email');
  const msgEl = document.getElementById('message');
  if (nameEl) nameEl.placeholder = p.name;
  if (emailEl) emailEl.placeholder = p.email;
  if (msgEl) msgEl.placeholder = p.message;
}

document.getElementById('lang-btn').addEventListener('click', () => {
  setLanguage(currentLang === 'ro' ? 'en' : 'ro');
});

// ---- NAV SCROLL EFFECT ----
const nav = document.querySelector('.nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 20);
}, { passive: true });

// ---- HAMBURGER MENU ----
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobile-menu');

hamburger.addEventListener('click', () => {
  const isOpen = mobileMenu.classList.toggle('open');
  hamburger.classList.toggle('open', isOpen);
  mobileMenu.style.display = isOpen ? 'flex' : 'none';
  setTimeout(() => {
    if (isOpen) mobileMenu.classList.add('open');
  }, 10);
});

// close mobile menu on link click
document.querySelectorAll('.mobile-link, .mobile-cta').forEach(link => {
  link.addEventListener('click', () => {
    mobileMenu.classList.remove('open');
    hamburger.classList.remove('open');
    setTimeout(() => { mobileMenu.style.display = 'none'; }, 250);
  });
});

// ---- SCROLL FADE-IN ----
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.step-card, .service-card, .stat-item, .cta-box').forEach((el, i) => {
  el.classList.add('fade-in');
  el.style.transitionDelay = `${i * 0.08}s`;
  observer.observe(el);
});

// ---- TOAST NOTIFICATION ----
function showToast(message, type = 'success') {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.className = `toast ${type}`;
  requestAnimationFrame(() => { toast.classList.add('show'); });
  setTimeout(() => {
    toast.classList.remove('show');
  }, 4000);
}

// ---- FORM VALIDATION & SUBMIT ----
const form = document.getElementById('contact-form');
if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    let valid = true;

    // clear previous errors
    form.querySelectorAll('.error').forEach(el => el.classList.remove('error'));

    const name = document.getElementById('name');
    const email = document.getElementById('email');

    if (!name.value.trim()) {
      name.classList.add('error');
      valid = false;
    }
    if (!email.value.trim() || !email.value.includes('@')) {
      email.classList.add('error');
      valid = false;
    }

    if (!valid) {
      const msg = currentLang === 'ro'
        ? 'Te rugăm să completezi câmpurile obligatorii.'
        : 'Please fill in the required fields.';
      showToast(msg, 'error');
      return;
    }

    const btn = form.querySelector('button[type="submit"]');
    const originalText = btn.textContent;
    btn.textContent = currentLang === 'ro' ? 'Se trimite...' : 'Sending...';
    btn.disabled = true;

    try {
      await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(new FormData(form)).toString()
      });
    } catch {
      btn.textContent = originalText;
      btn.disabled = false;
      const errMsg = currentLang === 'ro'
        ? 'A apărut o eroare. Încearcă din nou.'
        : 'Something went wrong. Please try again.';
      showToast(errMsg, 'error');
      return;
    }

    btn.textContent = originalText;
    btn.disabled = false;
    form.reset();

    const successMsg = currentLang === 'ro'
      ? '✓ Cererea a fost trimisă! Te contactăm în 24 de ore.'
      : '✓ Request sent! We\'ll get back to you within 24 hours.';
    showToast(successMsg, 'success');
  });
}

// ---- SMOOTH SCROLL FOR ANCHOR LINKS ----
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const offset = target.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top: offset, behavior: 'smooth' });
    }
  });
});

// ---- INIT ----
// Set initial display for mobile menu
document.getElementById('mobile-menu').style.display = 'none';
