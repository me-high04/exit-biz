# ExitBiz — Note de proiect

## Ideea de business

Site destinat oamenilor care vor să **închidă, suspende sau radieze firme** din România.
Nume de lucru: **exitbiz.ro** (numele final nu e stabilit încă).
Filosofia principală: servicii accesibile și pentru **străini** — timp minim, date minime necesare.

---

## Publicul țintă

1. **Clienți singulari** — antreprenori care vor să închidă firma proprie
2. **Profesioniști (cabinete)** — contabili și avocați cu portofoliu de clienți, care vor un dashboard dedicat

---

## Servicii planificate (toate, nu doar MVP)

- Suspendare activitate
- Dizolvare voluntară
- Radiere ONRC
- Generare șabloane de documente (ex: decizie de suspendare)
- Servicii ONRC integrate
- Cabinet personal (dashboard pentru profesioniști cu mai mulți clienți)
- Abonament pentru profesioniști
- Bibliotecă cu șabloane de documente
- Contract pentru client final (formular PDF)
- PDF cu informații de pe Targetare.ro (pentru clienți singulari)

---

## Integrări planificate

- **Targetare.ro** — date despre firme (nu au API public, urmează abonament)
- **ANAF API** — date fiscale
- **ONRC** — Registrul Comerțului
- **Sisteme de plată** — Stripe sau similar (plan gratuit la început)
- **GPT / AI** — pentru SEO și GEO (optimizare pentru căutări AI: ChatGPT, Perplexity etc.)

---

## Funcționalități planificate

- Formular de contact / cerere
- Dashboard cabinet (acces client, statusul dosarelor, documente, plăți)
- Sistem de referrals (avocați/contabili trimit clienți și primesc comision)
- Sistem de abonamente pentru profesioniști
- Bilingv: română + engleză (toggle în nav)
- Autentificare cu roluri (client singular, cabinet, admin)

---

## MVP — Faza 1 (acum)

Doar landing page simplu cu:
- Prezentare servicii
- Formular de contact
- Toggle RO/EN
- Fără backend deocamdată

**Scopul:** să existe ceva online, să capteze primii clienți.

### Faza 2 (după primul venit)
- Autentificare
- Dashboard simplu pentru cabinete
- Integrare plăți (Stripe)

### Faza 3 (scalare)
- API-uri (ANAF, Targetare.ro)
- Bibliotecă șabloane
- Sistem referrals

---

## Decizii tehnice

### Stack ales
- **HTML + CSS + JS vanilla** — simplu, fără framework, potrivit pentru nivelul actual
- **Netlify** — hosting gratuit
- **Next.js** rămâne opțiunea pentru long-term când proiectul crește

### De ce nu WordPress / Webflow
Buildere nu se potrivesc pentru că proiectul are nevoie de:
- Autentificare cu roluri multiple
- Dashboard cu documente, plăți, status dosare
- Integrări API complexe

---

## Design

### Vibe
"Serios dar friendly și trustable"

### Culori
- **Accent principal:** `#1D9E75` (verde)
- **Verde închis:** `#0F6E56`
- **Verde deschis (bg):** `#E1F5EE`
- **Text principal:** `#1a1a1a`
- **Text secundar:** `#5a5a5a`
- **Background:** `#fafaf8`

### Font
- **Sora** (Google Fonts) — geometric, modern, trustworthy
- Weight-uri folosite: 300, 400, 500, 600

### Structura paginii (MVP)
1. Nav (logo, linkuri, toggle EN, CTA)
2. Hero (titlu, subtitlu, CTA buttons, carduri animate)
3. Stats bar (100% online / 7 zile / ONRC / RO+EN)
4. Cum funcționează (3 pași)
5. Servicii (4 carduri)
6. Formular de contact
7. Footer

---

## Structura fișierelor

exitbiz/
├── index.html        ← pagina principală
├── css/
│   └── style.css     ← tot stilul
├── js/
│   └── main.js       ← toggle limbă, hamburger, form, animații
└── NOTES.md          ← acest fișier

---

## Ce e implementat în JS (main.js)

- **Toggle RO/EN** — toate textele au `data-ro` și `data-en` pe element, JS le schimbă
- **Nav scroll effect** — shadow apare la scroll
- **Hamburger menu** — meniu mobil cu animație
- **Scroll fade-in** — cardurile apar la scroll cu IntersectionObserver
- **Form validation** — câmpuri obligatorii (nume, email)
- **Toast notifications** — mesaje de succes/eroare după submit
- **Smooth scroll** — pentru linkurile din nav

---

## To-do imediat

- [ ] Alege numele final al site-ului
- [ ] Înlocuit formularul cu Netlify Forms (gratuit, fără backend)
- [ ] GitHub repo ✅
- [ ] Netlify deploy ✅

## To-do viitor (Faza 2+)

- [ ] Pagină de prețuri
- [ ] Dashboard cabinet cu autentificare
- [ ] Integrare Stripe
- [ ] Pagină separată pentru profesioniști
- [ ] Sistem referrals
- [ ] Integrare Targetare.ro
- [ ] Integrare ANAF API
- [ ] SEO + GEO optimization (AI search)