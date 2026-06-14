// ========================================
// EXITBIZ — Main JS
// ========================================

// ---- DARK MODE ----
(function () {
  const saved = localStorage.getItem('theme');
  if (saved === 'dark') document.documentElement.setAttribute('data-theme', 'dark');

  window.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('theme-btn');
    if (!btn) return;
    btn.textContent = document.documentElement.getAttribute('data-theme') === 'dark' ? '☀️' : '🌙';
    btn.addEventListener('click', () => {
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      if (isDark) {
        document.documentElement.removeAttribute('data-theme');
        localStorage.setItem('theme', 'light');
        btn.textContent = '🌙';
      } else {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
        btn.textContent = '☀️';
      }
    });
  });
})();

// ---- LANGUAGE TOGGLE ----
let currentLang = localStorage.getItem('lang') || 'ro';

function setLanguage(lang, save = true) {
  currentLang = lang;
  document.querySelectorAll('[data-ro]').forEach(el => {
    el.textContent = el.dataset[lang] || el.dataset['ro'];
  });
  document.documentElement.lang = lang;
  if (save) localStorage.setItem('lang', lang);

  // Update active state on lang buttons
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.remove('active');
    if (btn.dataset.lang === lang) btn.classList.add('active');
  });

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

// Aplică limba salvată la încărcarea paginii
function initLang() {
  if (currentLang !== 'ro') setLanguage(currentLang, false);

  // Set active class on loaded buttons
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.remove('active');
    if (btn.dataset.lang === currentLang) btn.classList.add('active');
  });

  // Attach click listeners
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      setLanguage(btn.dataset.lang);
    });
  });

  // Show language popup on first visit
  checkLangPopup();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initLang);
} else {
  initLang();
}

// ---- LANGUAGE SELECTION POPUP (first visit) ----
function selectLangPopup(lang) {
  const overlay = document.getElementById('lang-popup-overlay');
  if (overlay) overlay.classList.add('hidden');
  setLanguage(lang);
}

function checkLangPopup() {
  // Show popup only if user has never chosen a language
  if (!localStorage.getItem('lang')) {
    const overlay = document.getElementById('lang-popup-overlay');
    if (overlay) {
      setTimeout(() => overlay.classList.remove('hidden'), 600);
    }
  }
}

// ---- CUI MOBILE WRAPPER ----
function verificaFirmaMobile() {
  const input = document.getElementById('cui-input-mobile');
  if (input) {
    document.getElementById('cui-input').value = input.value;
    verificaFirma();
  }
}

// ---- NAV SCROLL EFFECT ----
const nav = document.querySelector('.nav');
if (nav) {
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 20);
  }, { passive: true });
}

// ---- HAMBURGER MENU ----
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobile-menu');

if (hamburger && mobileMenu) hamburger.addEventListener('click', () => {
  const isOpen = mobileMenu.classList.toggle('open');
  hamburger.classList.toggle('open', isOpen);
  mobileMenu.style.display = isOpen ? 'flex' : 'none';
  setTimeout(() => {
    if (isOpen) mobileMenu.classList.add('open');
  }, 10);
});

// close mobile menu on link click
if (hamburger && mobileMenu) {
  document.querySelectorAll('.mobile-link, .mobile-cta').forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.remove('open');
      hamburger.classList.remove('open');
      setTimeout(() => { mobileMenu.style.display = 'none'; }, 250);
    });
  });
}

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

// ---- COOKIE BANNER ----
(function () {
  const banner = document.getElementById('cookie-banner');
  if (!banner) return;
  if (!localStorage.getItem('cookie-consent')) {
    setTimeout(() => banner.classList.add('visible'), 600);
  } else {
    banner.classList.add('hidden');
  }
  document.getElementById('cookie-accept').addEventListener('click', () => {
    localStorage.setItem('cookie-consent', 'all');
    banner.classList.remove('visible');
    setTimeout(() => banner.classList.add('hidden'), 350);
  });
  document.getElementById('cookie-decline').addEventListener('click', () => {
    localStorage.setItem('cookie-consent', 'essential');
    banner.classList.remove('visible');
    setTimeout(() => banner.classList.add('hidden'), 350);
  });
})();

// ---- CUI FIRMA LOOKUP ----
function inchideModal() {
  document.getElementById('cui-modal').classList.remove('open');
}

function getProcedura(denumire) {
  const d = (denumire || '').toUpperCase();
  if (/\bPFA\b|\bII\b|\bIF\b/.test(d)) {
    return { tip: 'Radiere PFA', link: 'servicii/radiere-pfa.html', desc: 'Procedură simplificată pentru PFA, II sau IF.' };
  }
  if (/\bSA\b|\bRA\b|\bSNC\b|\bSCS\b/.test(d)) {
    return { tip: 'SRL cu Lichidator', link: 'servicii/srl-cu-lichidator.html', desc: 'Procedură de lichidare cu lichidator autorizat.' };
  }
  if (/\bSRL\b/.test(d)) {
    return { tip: 'Închidere SRL', link: 'servicii/inchidere-srl.html', desc: 'Dizolvare și radiere pentru SRL.' };
  }
  return { tip: 'Analiză Preliminară', link: 'servicii/analiza-preliminara.html', desc: 'Evaluăm situația firmei și stabilim procedura potrivită.' };
}

async function verificaFirma() {
  const cuiInput = document.getElementById('cui-input');
  const cui = (cuiInput?.value || '').replace(/[^0-9]/g, '');

  if (!cui || cui.length < 2) {
    cuiInput?.focus();
    return;
  }

  const modal = document.getElementById('cui-modal');
  const body = document.getElementById('cui-modal-body');
  if (!modal || !body) return;

  modal.classList.add('open');
  body.innerHTML = `
    <div class="cui-modal-icon" style="animation: pulse 1s infinite">🔍</div>
    <h3>Se verifică CUI ${cui}...</h3>
    <p style="color:var(--text-secondary);font-size:14px">Interogăm baza de date ANAF</p>`;

  try {
    const res = await fetch(`/.netlify/functions/firma-info?cui=${cui}`);
    const data = await res.json();
    // ANAF v8: date_generale e nested în found[0]
    const raw = data?.found?.[0];
    const firma = raw?.date_generale ?? raw;

    if (!firma || !firma.denumire) {
      body.innerHTML = `
        <div class="cui-modal-icon">❌</div>
        <h3>Firma nu a fost găsită</h3>
        <p>CUI-ul <strong>${cui}</strong> nu există în baza de date ANAF sau este invalid.</p>
        <button class="btn-ghost" onclick="inchideModal()" style="width:100%;justify-content:center;margin-top:0.5rem">Încearcă din nou</button>`;
      return;
    }

    const procedura = getProcedura(firma.denumire);
    const stareColor = (firma.stare || '').includes('ACTIV') ? 'var(--green)' : '#e53e3e';
    const tvaStatus = firma.scpTVA ? '✓ Plătitor TVA' : '✗ Neplătitor TVA';

    body.innerHTML = `
      <div style="text-align:left;width:100%">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:1.25rem;flex-wrap:wrap;gap:8px;">
          <h3 style="margin:0;font-size:18px;font-weight:500">${firma.denumire}</h3>
          <span style="font-size:12px;font-weight:600;padding:3px 10px;border-radius:99px;background:${stareColor}22;color:${stareColor}">${firma.stare || '—'}</span>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:1.25rem;">
          <div style="background:var(--bg-surface);border-radius:8px;padding:10px 12px;">
            <div style="font-size:11px;color:var(--text-muted);margin-bottom:3px;">CUI</div>
            <div style="font-size:14px;font-weight:500;">RO${firma.cui}</div>
          </div>
          <div style="background:var(--bg-surface);border-radius:8px;padding:10px 12px;">
            <div style="font-size:11px;color:var(--text-muted);margin-bottom:3px;">TVA</div>
            <div style="font-size:14px;font-weight:500;">${tvaStatus}</div>
          </div>
          <div style="background:var(--bg-surface);border-radius:8px;padding:10px 12px;grid-column:1/-1;">
            <div style="font-size:11px;color:var(--text-muted);margin-bottom:3px;">Adresă</div>
            <div style="font-size:13px;">${firma.adresa || '—'}</div>
          </div>
        </div>
        <div style="background:var(--green-light);border:1px solid var(--green);border-radius:10px;padding:14px;margin-bottom:1.25rem;">
          <div style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;color:var(--green);margin-bottom:6px;">Procedură recomandată</div>
          <div style="font-size:16px;font-weight:600;color:var(--green-dark);margin-bottom:4px;">${procedura.tip}</div>
          <div style="font-size:13px;color:var(--text-secondary);">${procedura.desc}</div>
        </div>
        <a href="${procedura.link}" class="btn-primary btn-full" style="justify-content:center;margin-bottom:8px">Află mai multe →</a>
        <button data-tally-open="b5zx50" data-tally-layout="modal" data-tally-width="500" class="btn-ghost btn-full" style="justify-content:center" onclick="inchideModal()">Contactează-ne direct</button>
      </div>`;

    if (window.Tally) window.Tally.loadEmbeds();
  } catch {
    body.innerHTML = `
      <div class="cui-modal-icon">⚠️</div>
      <h3>Eroare de conexiune</h3>
      <p>Nu am putut verifica firma. Încearcă din nou sau contactează-ne direct.</p>
      <button class="btn-ghost" onclick="inchideModal()" style="width:100%;justify-content:center;margin-top:0.5rem">Închide</button>`;
  }
}

// Close modal on overlay click
document.getElementById('cui-modal')?.addEventListener('click', function(e) {
  if (e.target === this) inchideModal();
});

// Enter key in CUI input
document.getElementById('cui-input')?.addEventListener('keydown', function(e) {
  if (e.key === 'Enter') verificaFirma();
});

// ---- INIT ----
// Set initial display for mobile menu
document.getElementById('mobile-menu').style.display = 'none';

// ---- WHATSAPP QUALIFIER POPUP ----
(function () {
  var POPUP_ID = 'wa-qualify-popup';

  function injectPopup() {
    if (document.getElementById(POPUP_ID)) return;
    var el = document.createElement('div');
    el.id = POPUP_ID;
    el.innerHTML = [
      '<div id="wa-qualify-overlay">',
      '<div id="wa-qualify-box">',
      '<button id="wa-qualify-close" aria-label="Închide">✕</button>',
      '<div id="wa-qualify-wa-icon"><svg fill="#25D366" width="32" height="32" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg></div>',
      '<h3 id="wa-qualify-title">Câteva întrebări rapide</h3>',
      '<p id="wa-qualify-sub">Completează mai jos și te conectăm cu specialistul potrivit.</p>',
      '<form id="wa-qualify-form">',
      '<div class="wa-q-block">',
      '<label class="wa-q-label">1. Aveți o firmă pe care doriți să o închiideți?</label>',
      '<div class="wa-q-opts">',
      '<label class="wa-q-opt"><input type="radio" name="firma" value="Da, vreau să o închid"> Da, vreau să o închid</label>',
      '<label class="wa-q-opt"><input type="radio" name="firma" value="Nu știu sigur, vreau mai multe informații"> Nu știu sigur, vreau informații</label>',
      '</div>',
      '</div>',
      '<div class="wa-q-block">',
      '<label class="wa-q-label">2. Ce tip de firmă / procedură aveți în vedere?</label>',
      '<div class="wa-q-opts">',
      '<label class="wa-q-opt"><input type="radio" name="procedura" value="Radiere PFA / II / IF"> Radiere PFA / II / IF</label>',
      '<label class="wa-q-opt"><input type="radio" name="procedura" value="Închidere SRL (dizolvare + radiere)"> Închidere SRL</label>',
      '<label class="wa-q-opt"><input type="radio" name="procedura" value="Suspendare firmă"> Suspendare firmă</label>',
      '<label class="wa-q-opt"><input type="radio" name="procedura" value="Nu știu, vreau o analiză"> Nu știu, vreau o analiză</label>',
      '</div>',
      '</div>',
      '<div class="wa-q-block">',
      '<label class="wa-q-label">3. Știți când a fost depus ultimul bilanț anual?</label>',
      '<div class="wa-q-opts">',
      '<label class="wa-q-opt"><input type="radio" name="bilant" value="Da, este depus la zi"> Da, este la zi</label>',
      '<label class="wa-q-opt"><input type="radio" name="bilant" value="Nu știu / Nu sunt sigur"> Nu știu / Nu sunt sigur</label>',
      '<label class="wa-q-opt"><input type="radio" name="bilant" value="Nu a fost depus (restanță)"> Nu a fost depus (restanță)</label>',
      '</div>',
      '</div>',
      '<div id="wa-qualify-err"></div>',
      '<button type="submit" id="wa-qualify-submit">',
      '<svg fill="currentColor" width="20" height="20" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>',
      'Continuă pe WhatsApp →',
      '</button>',
      '</form>',
      '</div>',
      '</div>'
    ].join('');
    document.body.appendChild(el);

    document.getElementById('wa-qualify-close').addEventListener('click', closeWaPopup);
    document.getElementById('wa-qualify-overlay').addEventListener('click', function(e) {
      if (e.target === this) closeWaPopup();
    });
    document.getElementById('wa-qualify-form').addEventListener('submit', function(e) {
      e.preventDefault();
      submitWaPopup();
    });
  }

  function openWaPopup() {
    injectPopup();
    document.getElementById('wa-qualify-overlay').classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeWaPopup() {
    var overlay = document.getElementById('wa-qualify-overlay');
    if (overlay) {
      overlay.classList.remove('open');
      document.body.style.overflow = '';
    }
  }

  function submitWaPopup() {
    var form = document.getElementById('wa-qualify-form');
    var errEl = document.getElementById('wa-qualify-err');
    var firma = (form.querySelector('input[name="firma"]:checked') || {}).value;
    var procedura = (form.querySelector('input[name="procedura"]:checked') || {}).value;
    var bilant = (form.querySelector('input[name="bilant"]:checked') || {}).value;

    if (!firma || !procedura || !bilant) {
      errEl.textContent = 'Te rugăm să răspunzi la toate întrebările.';
      return;
    }
    errEl.textContent = '';

    var msg = 'Bună ziua! Am câteva întrebări despre serviciile ExitBiz:\n\n';
    msg += '1. Firmă: ' + firma + '\n';
    msg += '2. Procedură: ' + procedura + '\n';
    msg += '3. Bilanț: ' + bilant + '\n\n';
    msg += 'Doresc mai multe informații și un sfat personalizat.';

    closeWaPopup();
    window.open('https://wa.me/40772129941?text=' + encodeURIComponent(msg), '_blank');
  }

  document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.whatsapp-btn').forEach(function(btn) {
      btn.addEventListener('click', function(e) {
        e.preventDefault();
        openWaPopup();
      });
    });
  });
})();
