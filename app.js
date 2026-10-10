/* Hjemmeøvelser – simpel PWA uden backend. Data gemmes kun lokalt (localStorage). */
'use strict';

const KEY_EX = 'hjo_oevelser_v2';
const KEY_LEVEL = 'hjo_niveau_v1';
const KEY_LOG = 'hjo_log_v1';
const KEY_RAAD = 'hjo_raad_laest_v1';
const KEY_GOAL = 'hjo_ugemaal_v1';
const KEY_BADGES = 'hjo_maerker_v1';
const KEY_LASTCAT = 'hjo_sidst_kat_v1';
const KEY_PAIN = 'hjo_smerte_v1';
const WEEKDAYS = ['søndag', 'mandag', 'tirsdag', 'onsdag', 'torsdag', 'fredag', 'lørdag'];
const MONTHS_LONG = ['januar', 'februar', 'marts', 'april', 'maj', 'juni', 'juli', 'august', 'september', 'oktober', 'november', 'december'];
const DAYS = ['Man', 'Tir', 'Ons', 'Tor', 'Fre', 'Lør', 'Søn'];
const MONTHS = ['jan.', 'feb.', 'mar.', 'apr.', 'maj', 'jun.', 'jul.', 'aug.', 'sep.', 'okt.', 'nov.', 'dec.'];

/* ---------- Hjælpere ---------- */
const $app = document.getElementById('app');
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const clone = o => JSON.parse(JSON.stringify(o));
function dateKey(d) {
  d = d || new Date();
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}
function mondayOf(d) {
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const wd = (x.getDay() + 6) % 7; // 0 = mandag
  x.setDate(x.getDate() - wd);
  return x;
}
function addDays(d, n) { const x = new Date(d); x.setDate(x.getDate() + n); return x; }
function weekNumber(d) {
  const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = (t.getUTCDay() + 6) % 7;
  t.setUTCDate(t.getUTCDate() - dayNum + 3);
  const firstThu = new Date(Date.UTC(t.getUTCFullYear(), 0, 4));
  return 1 + Math.round(((t - firstThu) / 86400000 - 3 + ((firstThu.getUTCDay() + 6) % 7)) / 7);
}
function toast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg; t.classList.add('show');
  clearTimeout(toast._t); toast._t = setTimeout(() => t.classList.remove('show'), 2400);
}
function slug(s) {
  return String(s).toLowerCase().replace(/æ/g, 'ae').replace(/ø/g, 'oe').replace(/å/g, 'aa')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'oevelse';
}

/* ---------- Lager ---------- */
const KEY_STD_SEEN = 'hjo_std_flettet_v1';
/* Alle standardøvelser: artrose/balance (data.js) + hælspore (data-haelspore.js). */
function allDefaults() { return DEFAULT_EXERCISES.concat(typeof HAEL_EXERCISES !== 'undefined' ? HAEL_EXERCISES : [], typeof RYG_EXERCISES !== 'undefined' ? RYG_EXERCISES : [], typeof LED_EXERCISES !== 'undefined' ? LED_EXERCISES : []); }
/* Gemte lister flettes med nye standardøvelser (fx hælsporet), uden at slettede eller rettede øvelser kommer tilbage. */
function loadExercises() {
  let arr = null;
  try {
    const raw = localStorage.getItem(KEY_EX);
    if (raw) { const a = JSON.parse(raw); if (Array.isArray(a)) arr = a.filter(x => x && typeof x === 'object' && typeof x.id === 'string'); }
  } catch (e) { /* ignorer og brug standard */ }
  if (!arr) return clone(allDefaults());
  let seen = readJson(KEY_STD_SEEN, null);
  if (!Array.isArray(seen)) seen = DEFAULT_EXERCISES.map(e => e.id); // eksisterende brugere har allerede set de 21
  const have = new Set(arr.map(e => e.id)); let added = false;
  allDefaults().forEach(d => { if (!have.has(d.id) && !seen.includes(d.id)) { arr.push(clone(d)); added = true; } });
  writeJson(KEY_STD_SEEN, allDefaults().map(e => e.id).concat(seen.filter(id => !allDefaults().some(d => d.id === id))));
  if (added) localStorage.setItem(KEY_EX, JSON.stringify(arr));
  return arr;
}
function saveExercises(list) { localStorage.setItem(KEY_EX, JSON.stringify(list)); }
function loadLog() {
  try { return JSON.parse(localStorage.getItem(KEY_LOG)) || {}; } catch (e) { return {}; }
}
function saveLog(log) { localStorage.setItem(KEY_LOG, JSON.stringify(log)); }

function loadLevels() {
  try { return JSON.parse(localStorage.getItem(KEY_LEVEL)) || {}; } catch (e) { return {}; }
}
function getLevel(cat) { const n = Number(levels[cat]); return n >= 1 && n <= 3 ? n : 1; }
function setLevel(cat, n) { levels[cat] = n; localStorage.setItem(KEY_LEVEL, JSON.stringify(levels)); }

/* Video: kun http(s)-adresser accepteres (og kun direkte videofiler). YouTube bruges ikke længere –
   øvelserne vises med tegnede tempo-film (film-engine.js). Gamle links ligger kun som videoOld i data. */
function safeUrl(u) {
  try { const x = new URL(String(u || '').trim()); return (x.protocol === 'https:' || x.protocol === 'http:') ? x.href : ''; } catch (e) { return ''; }
}

/* Dagens øvelser i et program: niveau (artrose/balance) eller fase (hælspore). */
function programExercises(cid) {
  if (cid === 'haelspore' && typeof haelPhaseExercises === 'function') return haelPhaseExercises();
  if (typeof isRyg === 'function' && isRyg(cid)) return rygExercises(cid);
  const lv = getLevel(cid); return exercises.filter(e => e.category === cid && (Number(e.level) || 1) === lv);
}
function programLevelLabel(cid) { if (typeof isRyg === 'function' && isRyg(cid)) return rygLabel(cid); return cid === 'haelspore' && typeof haelPhase === 'function' ? 'Fase ' + haelPhase() : 'Niveau ' + getLevel(cid); }
let levels = loadLevels();
let exercises = loadExercises();
let log = loadLog();

/* Øvelser, der bruges i flere programmer (fx skulderbladsklem i både Brystryg og Skulder), krydses af i det program,
   de blev lavet fra: "id@program" i loggen, når programmet ikke er øvelsens eget. Uden program = øvelsens eget. */
function doneKey(id, prog) { const e = prog ? exercises.find(x => x.id === id) : null; return e && prog !== e.category ? id + '@' + prog : id; }
function exCtx(e) { // hvilket program øvelsessiden blev åbnet fra
  let c = null; try { c = sessionStorage.getItem(KEY_GUIDE) || localStorage.getItem(KEY_LASTCAT); } catch (err) { /* ignore */ }
  return c && c !== e.category && programExercises(c).some(x => x.id === e.id) ? c : e.category;
}
function doneToday(id, prog) { return (log[dateKey()] || []).includes(doneKey(id, prog)); }
function toggleDone(id, prog) {
  const k = dateKey();
  const arr = log[k] || [];
  id = doneKey(id, prog);
  const i = arr.indexOf(id);
  if (i >= 0) arr.splice(i, 1); else arr.push(id);
  if (arr.length) log[k] = arr; else delete log[k];
  saveLog(log);
  return i < 0;
}
function countDone(k) {
  const ids = new Set(exercises.map(e => e.id)); ids.add('hael-morgenrutine');
  return (log[k] || []).filter(id => ids.has(String(id).split('@')[0])).length;
}


/* ---------- Motivation: råd, stime, ugemål, mærker ---------- */
function readJson(key, fallback) { try { const v = JSON.parse(localStorage.getItem(key)); return v == null ? fallback : v; } catch (e) { return fallback; } }
function writeJson(key, v) { localStorage.setItem(key, JSON.stringify(v)); }

function readAdvice() { const ids = new Set(GENERAL_ADVICE.map(x => x.id)); return readJson(KEY_RAAD, []).filter(id => ids.has(id)); }
function toggleAdvice(id) {
  const arr = readJson(KEY_RAAD, []); const i = arr.indexOf(id);
  if (i >= 0) arr.splice(i, 1); else arr.push(id);
  writeJson(KEY_RAAD, arr); return i < 0;
}
function advicePct() { return Math.round(readAdvice().length / GENERAL_ADVICE.length * 100); }
function nextUnreadAdvice() { const r = new Set(readAdvice()); return GENERAL_ADVICE.find(x => !r.has(x.id)); }

function getGoal() { const g = Number(readJson(KEY_GOAL, 3)); return g >= 1 && g <= 7 ? g : 3; }
function setGoal(g) { writeJson(KEY_GOAL, Math.max(1, Math.min(7, g))); }

function trainingDays() { return Object.keys(log).filter(k => countDone(k) > 0).sort(); }
function daysInWeek(mon) { let c = 0; for (let i = 0; i < 7; i++) if (countDone(dateKey(addDays(mon, i))) > 0) c++; return c; }
function currentStreak() {
  let d = new Date(); let n = 0;
  if (countDone(dateKey(d)) === 0) d = addDays(d, -1); // i dag tæller ikke imod, før dagen er gået
  while (countDone(dateKey(d)) > 0) { n++; d = addDays(d, -1); }
  return n;
}
function bestStreak() {
  const days = trainingDays(); let best = 0, run = 0, prev = null;
  days.forEach(k => {
    const [y, m, dd] = k.split('-').map(Number); const t = new Date(y, m - 1, dd);
    run = prev && Math.round((t - prev) / 86400000) === 1 ? run + 1 : 1;
    best = Math.max(best, run); prev = t;
  });
  return Math.max(best, currentStreak());
}
function anyWeekGoalReached() {
  const goal = getGoal(); const weeks = new Set(trainingDays().map(k => { const [y, m, d] = k.split('-').map(Number); return dateKey(mondayOf(new Date(y, m - 1, d))); }));
  for (const w of weeks) { const [y, m, d] = w.split('-').map(Number); if (daysInWeek(new Date(y, m - 1, d)) >= goal) return true; }
  return false;
}
function allBadges() { return (typeof HAEL_BADGES !== 'undefined' && haelUsed()) ? BADGES.concat(HAEL_BADGES) : BADGES; }
function badgeEarnedNow(id) {
  if (id.startsWith('hael-')) return typeof haelBadgeEarned === 'function' && haelBadgeEarned(id);
  const td = trainingDays().length, best = bestStreak(), maxLv = Math.max(...CATEGORIES.map(c => getLevel(c.id)));
  switch (id) {
    case 'foerste': return td >= 1;
    case 'raad1': return readAdvice().length >= 1;
    case 'stime3': return best >= 3;
    case 'stime7': return best >= 7;
    case 'ugemaal': return anyWeekGoalReached();
    case 'niveau2': return maxLv >= 2;
    case 'niveau3': return maxLv >= 3;
    case 'traening10': return td >= 10;
    case 'traening25': return td >= 25;
    case 'raadalle': return readAdvice().length >= GENERAL_ADVICE.length;
  }
  return false;
}
function badgeProgress(id) {
  if (id.startsWith('hael-')) return haelBadgeProgress(id);
  const td = trainingDays().length;
  switch (id) {
    case 'stime3': return Math.min(bestStreak(), 3) + ' af 3 dage';
    case 'stime7': return Math.min(bestStreak(), 7) + ' af 7 dage';
    case 'traening10': return Math.min(td, 10) + ' af 10';
    case 'traening25': return Math.min(td, 25) + ' af 25';
    case 'raadalle': return readAdvice().length + ' af ' + GENERAL_ADVICE.length + ' råd';
  }
  return '';
}
function earnedBadges() { return readJson(KEY_BADGES, null); }
/* Tjekker for nye mærker. Mærker gemmes, så de ikke forsvinder igen. */
function checkBadges(celebrate) {
  let store = earnedBadges();
  const first = store === null; store = store || {};
  const fresh = [];
  allBadges().forEach(b => { if (!store[b.id] && badgeEarnedNow(b.id)) { store[b.id] = dateKey(); fresh.push(b); } });
  writeJson(KEY_BADGES, store);
  if (fresh.length && celebrate !== false && !first) showCelebration(fresh);
  return fresh;
}

function prefersReducedMotion() { return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches; }
function confetti() {
  if (prefersReducedMotion()) return;
  const c = document.createElement('canvas'); c.className = 'confetti'; c.setAttribute('aria-hidden', 'true');
  document.body.appendChild(c);
  const dpr = window.devicePixelRatio || 1; c.width = innerWidth * dpr; c.height = innerHeight * dpr;
  const ctx = c.getContext('2d'); ctx.scale(dpr, dpr);
  const colors = ['#2f6f6a', '#e0a33a', '#d0702a', '#5aa36b', '#6c8fd6'];
  const parts = Array.from({ length: 110 }, () => ({
    x: innerWidth / 2 + (Math.random() - .5) * 80, y: innerHeight * .35,
    vx: (Math.random() - .5) * 9, vy: -Math.random() * 9 - 3, r: Math.random() * Math.PI,
    vr: (Math.random() - .5) * .3, w: 7 + Math.random() * 6, h: 4 + Math.random() * 4, c: colors[Math.floor(Math.random() * colors.length)]
  }));
  const start = performance.now();
  (function frame(t) {
    const el = t - start; ctx.clearRect(0, 0, innerWidth, innerHeight);
    parts.forEach(p => { p.vy += .25; p.x += p.vx; p.y += p.vy; p.r += p.vr;
      ctx.save(); ctx.globalAlpha = Math.max(0, 1 - el / 2200); ctx.translate(p.x, p.y); ctx.rotate(p.r); ctx.fillStyle = p.c; ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); ctx.restore(); });
    if (el < 2200) requestAnimationFrame(frame); else c.remove();
  })(start);
}
function showCelebration(badges) {
  const old = document.querySelector('.celebrate'); if (old) old.remove();
  document.getElementById('toast').classList.remove('show');
  const one = badges.length === 1;
  const box = document.createElement('div'); box.className = 'celebrate'; box.setAttribute('role', 'dialog'); box.setAttribute('aria-modal', 'true'); box.setAttribute('aria-labelledby', 'celTitle');
  box.innerHTML = '<div class="cel-card"><div class="cel-icons" aria-hidden="true">' + badges.map(b => '<span>' + b.icon + '</span>').join('') + '</div>' +
    '<h2 id="celTitle">' + (one ? 'Nyt mærke!' : badges.length + ' nye mærker!') + '</h2>' +
    badges.map(b => '<p class="cel-name">' + esc(b.name) + '</p>').join('') +
    '<p class="muted">' + (badges.some(b => b.id === 'raadalle') ? 'Du har læst alle de gode råd. Flot arbejde!' : 'Godt gået – bliv ved, så kommer resultaterne.') + '</p>' +
    '<button type="button" class="btn" id="celOk">Fedt! 🎉</button><a class="cel-link" href="#/maerker">Se alle mærker</a></div>';
  document.body.appendChild(box);
  const close = () => box.remove();
  box.querySelector('#celOk').onclick = close;
  box.querySelector('.cel-link').onclick = close;
  box.onclick = ev => { if (ev.target === box) close(); };
  box.querySelector('#celOk').focus();
  confetti();
}

function greeting() {
  const h = new Date().getHours();
  if (h >= 5 && h < 10) return 'God morgen';
  if (h >= 10 && h < 12) return 'God formiddag';
  if (h >= 12 && h < 18) return 'God eftermiddag';
  return 'God aften';
}
function dailyMessage() {
  const d = new Date(); const start = new Date(d.getFullYear(), 0, 0);
  const doy = Math.floor((d - start) / 86400000);
  const list = lastCategory() === 'haelspore' && typeof HAEL_DAILY_MESSAGES !== 'undefined' ? HAEL_DAILY_MESSAGES : DAILY_MESSAGES;
  return list[doy % list.length];
}
function bigRing(pct, label, sub) {
  const r = 40, c = 2 * Math.PI * r, p = Math.max(0, Math.min(pct, 100)) / 100;
  return '<svg class="bigring" viewBox="0 0 100 100" aria-hidden="true"><circle class="bg" cx="50" cy="50" r="' + r + '"/>' +
    (p > 0 ? '<circle class="fg" cx="50" cy="50" r="' + r + '" stroke-dasharray="' + (c * p) + ' ' + c + '"/>' : '') +
    '<text x="50" y="' + (sub ? 50 : 58) + '" text-anchor="middle" class="t1">' + label + '</text>' +
    (sub ? '<text x="50" y="68" text-anchor="middle" class="t2">' + sub + '</text>' : '') + '</svg>';
}
function lastCategory() { const c = localStorage.getItem(KEY_LASTCAT); return CATEGORIES.some(x => x.id === c) ? c : 'knae'; }

/* ---------- Billeder, egne fotos og video (IndexedDB) ---------- */
const MEDIA_DB = 'hjo_medier_v1', MEDIA_STORE = 'filer';
const MAX_PHOTOS = 4, MAX_VIDEO_MB = 150, MAX_EXPORT_VIDEO_MB = 25;
let _mediaDb = null;
function mediaDb() {
  if (!_mediaDb) _mediaDb = new Promise((res, rej) => {
    if (!('indexedDB' in window)) { rej(new Error('IndexedDB findes ikke')); return; }
    const r = indexedDB.open(MEDIA_DB, 1);
    r.onupgradeneeded = () => r.result.createObjectStore(MEDIA_STORE);
    r.onsuccess = () => res(r.result);
    r.onerror = () => rej(r.error);
  });
  return _mediaDb;
}
function mediaReq(mode, fn) {
  return mediaDb().then(db => new Promise((res, rej) => {
    const tx = db.transaction(MEDIA_STORE, mode); const req = fn(tx.objectStore(MEDIA_STORE));
    tx.oncomplete = () => res(req ? req.result : undefined);
    tx.onerror = () => rej(tx.error); tx.onabort = () => rej(tx.error || new Error('Afbrudt'));
  }));
}
const mediaPut = (key, blob) => mediaReq('readwrite', s => s.put(blob, key));
const mediaGet = key => mediaReq('readonly', s => s.get(key)).catch(() => undefined);
const mediaDel = key => mediaReq('readwrite', s => s.delete(key)).catch(() => undefined);
const mediaKeys = () => mediaReq('readonly', s => s.getAllKeys()).catch(() => []);
function newMediaKey(prefix) { return prefix + '-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8); }
const _mediaUrls = new Map();
function mediaUrl(key) {
  if (_mediaUrls.has(key)) return Promise.resolve(_mediaUrls.get(key));
  return mediaGet(key).then(b => { if (!b) return ''; const u = URL.createObjectURL(b); _mediaUrls.set(key, u); return u; });
}
/* Sætter src på elementer med data-media (egne fotos/videoer fra IndexedDB). */
function hydrateMedia(root) {
  (root || document).querySelectorAll('[data-media]').forEach(el => {
    const key = el.getAttribute('data-media'); el.removeAttribute('data-media');
    mediaUrl(key).then(u => { if (u) el.src = u; else el.classList.add('missing'); });
  });
}
/* Sletter filer i IndexedDB, som ingen øvelse bruger længere. */
function gcMedia() {
  const used = new Set();
  exercises.forEach(e => {
    if (Array.isArray(e.photos)) e.photos.forEach(p => p && p.key && used.add(p.key));
    if (e.ownVideo && e.ownVideo.key) used.add(e.ownVideo.key);
  });
  return mediaKeys().then(keys => Promise.all(keys.filter(k => !used.has(k)).map(k => {
    if (_mediaUrls.has(k)) { URL.revokeObjectURL(_mediaUrls.get(k)); _mediaUrls.delete(k); }
    return mediaDel(k);
  })));
}
function validImgSrc(s) { return typeof s === 'string' && /^images\/[a-z0-9-]+\/[1-4]\.(webp|jpe?g|png)$/.test(s); }
/* Billedserien for en øvelse: egne fotos > standardbilleder (fra data.js) > ingen. */
function imagesFor(e) {
  if (Array.isArray(e.photos) && e.photos.some(p => p && p.key)) {
    return e.photos.filter(p => p && p.key).slice(0, MAX_PHOTOS).map(p => ({ key: String(p.key), caption: String(p.caption || '') }));
  }
  const def = allDefaults().find(d => d.id === e.id);
  const list = def && Array.isArray(def.images) && def.images.length ? def.images : (Array.isArray(e.images) ? e.images : []);
  return list.filter(i => i && validImgSrc(i.src)).slice(0, MAX_PHOTOS)
    .map(i => ({ src: i.src, caption: String(i.caption || ''), w: Number(i.w) || 0, h: Number(i.h) || 0 }));
}
function capText(c, i) { const t = String(c || '').trim().replace(/^\d+\.\s*/, ''); return t || 'Trin ' + (i + 1); }
function imgTag(img, alt, extra) {
  const src = img.src ? 'src="' + esc(img.src) + '"' : 'data-media="' + esc(img.key) + '"';
  const wh = img.w && img.h ? ' width="' + img.w + '" height="' + img.h + '"' : '';
  return '<img ' + src + wh + ' alt="' + esc(alt) + '" decoding="async" ' + (extra || '') + '>';
}
const PH_ICON = '<svg viewBox="0 0 48 48" aria-hidden="true" class="ph-ico"><rect x="6" y="10" width="36" height="28" rx="5"/><circle cx="18" cy="21" r="4"/><path d="M8 35l11-10 8 7 5-4 8 7"/></svg>';
function placeholder(cls, label) {
  return '<div class="ph ' + (cls || '') + '" role="img" aria-label="' + esc(label || 'Billeder kommer snart') + '">' + PH_ICON +
    (label ? '<span>' + esc(label) + '</span>' : '') + '</div>';
}
function thumbHtml(e, cls) {
  const imgs = imagesFor(e);
  if (!imgs.length) return placeholder('thumb ' + (cls || ''));
  return '<span class="thumb ' + (cls || '') + '">' + imgTag(imgs[0], '', 'loading="lazy"') + '</span>';
}
/* Kategorikort: første billede fra programmets første øvelse med billeder. */
function catThumb(c) {
  const list = exercises.filter(e => e.category === c.id).sort((a, b) => (Number(a.level) || 1) - (Number(b.level) || 1));
  const e = list.find(x => imagesFor(x).length);
  return e ? thumbHtml(e, 'cat-thumb') : placeholder('thumb cat-thumb');
}
function galleryHtml(e) {
  const imgs = imagesFor(e);
  if (!imgs.length) return placeholder('hero-ph', 'Billeder til øvelsen kommer snart');
  const f = imgs[0]; let ar = f.w && f.h ? f.w / f.h : 0.75; ar = Math.max(0.62, Math.min(ar, 2.4));
  const n = imgs.length;
  let h = '<section class="gallery' + (ar > 1.3 ? ' wide' : '') + '" aria-roledescription="karrusel" aria-label="Billedserie: ' + esc(e.name) + '" style="--ar:' + ar.toFixed(3) + '">' +
    '<div class="gal-track" tabindex="0">';
  imgs.forEach((img, i) => {
    const cap = capText(img.caption, i);
    h += '<figure class="gal-slide" aria-label="Billede ' + (i + 1) + ' af ' + n + '">' +
      '<button type="button" class="gal-zoom" data-i="' + i + '" aria-label="Vis billede ' + (i + 1) + ' større">' +
      imgTag(img, 'Trin ' + (i + 1) + ' af ' + n + ': ' + cap + ' (' + e.name + ')', i === 0 ? 'loading="eager" fetchpriority="high"' : 'loading="lazy"') +
      '<span class="gal-zoomhint" aria-hidden="true">⤢</span></button>' +
      '<figcaption><span class="gal-n">' + (i + 1) + '</span><span>' + esc(cap) + '</span></figcaption></figure>';
  });
  h += '</div>';
  if (n > 1) {
    h += '<div class="gal-nav"><button type="button" class="gal-arrow gal-prev" aria-label="Forrige billede">‹</button>' +
      '<div class="gal-dots">' + imgs.map((_, i) => '<button type="button" class="gal-dot' + (i ? '' : ' on') + '" data-i="' + i + '" aria-label="Gå til billede ' + (i + 1) + '"></button>').join('') + '</div>' +
      '<span class="gal-count" aria-live="polite">1/' + n + '</span>' +
      '<button type="button" class="gal-arrow gal-next" aria-label="Næste billede">›</button></div>';
  }
  return h + '</section>';
}
function initGallery(root, e) {
  const g = root.querySelector('.gallery'); if (!g) return;
  const track = g.querySelector('.gal-track'), slides = [...g.querySelectorAll('.gal-slide')], n = slides.length;
  let cur = 0;
  const idx = () => Math.round(track.scrollLeft / (slides[0].offsetWidth + 10));
  const go = i => { i = Math.max(0, Math.min(n - 1, i)); track.scrollTo({ left: slides[i].offsetLeft - slides[0].offsetLeft, behavior: prefersReducedMotion() ? 'auto' : 'smooth' }); };
  const upd = () => {
    cur = Math.max(0, Math.min(n - 1, idx()));
    g.querySelectorAll('.gal-dot').forEach((d, i) => { d.classList.toggle('on', i === cur); d.setAttribute('aria-current', i === cur ? 'true' : 'false'); });
    const c = g.querySelector('.gal-count'); if (c) c.textContent = (cur + 1) + '/' + n;
    const p = g.querySelector('.gal-prev'), x = g.querySelector('.gal-next');
    if (p) p.disabled = cur === 0; if (x) x.disabled = cur === n - 1;
  };
  let raf = 0; track.addEventListener('scroll', () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(upd); }, { passive: true });
  g.querySelectorAll('.gal-dot').forEach(d => d.onclick = () => go(Number(d.dataset.i)));
  const p = g.querySelector('.gal-prev'), x = g.querySelector('.gal-next');
  if (p) p.onclick = () => go(cur - 1); if (x) x.onclick = () => go(cur + 1);
  track.addEventListener('keydown', ev => { if (ev.key === 'ArrowLeft') { go(cur - 1); ev.preventDefault(); } if (ev.key === 'ArrowRight') { go(cur + 1); ev.preventDefault(); } });
  g.querySelectorAll('.gal-zoom').forEach(b => b.onclick = () => openLightbox(e, Number(b.dataset.i)));
  upd();
}
function openLightbox(e, start, list) {
  closeOverlays();
  const imgs = list || imagesFor(e), n = imgs.length;
  const box = document.createElement('div'); box.className = 'lightbox'; box.setAttribute('role', 'dialog'); box.setAttribute('aria-modal', 'true'); box.setAttribute('aria-label', 'Billeder: ' + e.name);
  box.innerHTML = '<div class="lb-top"><span class="lb-count" aria-live="polite"></span><button type="button" class="lb-close">✕ Luk</button></div>' +
    '<div class="lb-track">' + imgs.map((img, i) => '<figure class="lb-slide">' + imgTag(img, 'Trin ' + (i + 1) + ': ' + capText(img.caption, i), 'loading="lazy"') +
      '<figcaption><span class="gal-n">' + (i + 1) + '</span>' + esc(capText(img.caption, i)) + '</figcaption></figure>').join('') + '</div>';
  document.body.appendChild(box); document.body.classList.add('noscroll');
  hydrateMedia(box);
  const track = box.querySelector('.lb-track'), cnt = box.querySelector('.lb-count');
  const upd = () => { const i = Math.round(track.scrollLeft / track.clientWidth); cnt.textContent = (i + 1) + '/' + n; };
  track.addEventListener('scroll', upd, { passive: true });
  requestAnimationFrame(() => { track.scrollLeft = track.clientWidth * start; upd(); });
  const close = () => { box.remove(); document.body.classList.remove('noscroll'); document.removeEventListener('keydown', onKey); };
  const onKey = ev => {
    if (ev.key === 'Escape') close();
    if (ev.key === 'ArrowRight') track.scrollBy({ left: track.clientWidth });
    if (ev.key === 'ArrowLeft') track.scrollBy({ left: -track.clientWidth });
  };
  document.addEventListener('keydown', onKey);
  box.querySelector('.lb-close').onclick = close;
  box.querySelector('.lb-close').focus();
}
function closeOverlays() {
  document.querySelectorAll('.lightbox, .modal').forEach(x => x.remove());
  document.body.classList.remove('noscroll');
}

/* Video: egen video (IndexedDB) > direkte videofil (mp4/webm). Ingen YouTube, ingen iframes, aldrig eksterne links. */
function directVideoUrl(u) { const s = safeUrl(u); return s && /\.(mp4|webm|m4v|mov)(\?|#|$)/i.test(s) ? s : ''; }
function videoHtml(e) {
  const src = e.videoSource ? '<p class="hint vsrc">Video: ' + esc(e.videoSource) + '</p>' : '';
  if (e.ownVideo && e.ownVideo.key) {
    return '<div class="video-box"><h3>🎬 Video</h3><video class="own-video" data-media="' + esc(e.ownVideo.key) + '" playsinline controls preload="metadata"></video>' +
      '<p class="hint vsrc">Egen video – virker også uden internet.</p></div>';
  }
  const direct = directVideoUrl(e.video);
  if (direct) return '<div class="video-box"><h3>🎬 Video</h3><video class="own-video" src="' + esc(direct) + '" playsinline controls preload="none"></video>' + src + '</div>';
  return '';
}
function initVideo(root) { hydrateMedia(root); }

/* ---------- Smertevurdering (kun brugerens egne tal, gemt lokalt) ---------- */
function painLog() { const a = readJson(KEY_PAIN, []); return Array.isArray(a) ? a.filter(x => x && typeof x.dato === 'string' && typeof x.program === 'string') : []; }
function painToday(prog) { return painLog().find(x => x.dato === dateKey() && x.program === prog); }
/* Felter: foer/efter (før/efter træning), morgen (hælspore: de første skridt). Et felt, der findes med værdien null, betyder "sprunget over". */
function savePain(prog, fields) {
  const a = painLog(); let r = a.find(x => x.dato === dateKey() && x.program === prog);
  if (!r) { r = { dato: dateKey(), program: prog }; a.push(r); }
  Object.assign(r, fields); writeJson(KEY_PAIN, a.slice(-400)); return r;
}
function painTexts(prog) {
  if (typeof RYG_PAIN_CHECK !== 'undefined' && RYG_PAIN_CHECK[prog]) return Object.assign({}, PAIN_CHECK, RYG_PAIN_CHECK[prog]);
  return prog === 'haelspore' && typeof HAEL_PAIN_CHECK !== 'undefined' ? Object.assign({}, PAIN_CHECK, HAEL_PAIN_CHECK) : PAIN_CHECK;
}
function painTone(v, prog) { const fb = painTexts(prog).feedback; return (fb.find(f => v <= f.max) || fb[fb.length - 1]); }
function beforeAsked(prog) { const r = painToday(prog); return !!r && 'foer' in r; }
function needsAfter(prog) { const r = painToday(prog); return !!r && 'foer' in r && !r.afsluttet; }
function openModal(html, label) {
  closeOverlays();
  const m = document.createElement('div'); m.className = 'modal'; m.setAttribute('role', 'dialog'); m.setAttribute('aria-modal', 'true'); m.setAttribute('aria-labelledby', label || 'mTitle');
  m.innerHTML = '<div class="modal-card">' + html + '</div>';
  document.body.appendChild(m); document.body.classList.add('noscroll');
  return m;
}
function closeModal(m) { m.remove(); document.body.classList.remove('noscroll'); }
function painAsk(question, onDone) {
  const tone = v => v <= 2 ? 'g' : v <= 5 ? 'y' : 'r';
  const m = openModal('<h2 id="mTitle">' + esc(question) + '</h2><p class="muted pain-hint">' + esc(PAIN_CHECK.scaleHint) + '</p>' +
    '<div class="pain-grid" role="group" aria-label="Smerte fra 0 til 10">' +
    Array.from({ length: 11 }, (_, v) => '<button type="button" class="pain-btn t-' + tone(v) + '" data-v="' + v + '" aria-label="' + v + (v === 0 ? ' – ingen smerte' : v === 10 ? ' – værst tænkelige smerte' : '') + '">' + v + '</button>').join('') +
    '</div><div class="pain-ends" aria-hidden="true"><span>0 = ingen</span><span>10 = værst tænkelige</span></div>' +
    '<button type="button" class="btn secondary" id="painSkip">' + esc(PAIN_CHECK.skipLabel) + '</button>');
  m.querySelectorAll('.pain-btn').forEach(b => b.onclick = () => { closeModal(m); onDone(Number(b.dataset.v)); });
  m.querySelector('#painSkip').onclick = () => { closeModal(m); onDone(null); };
  m.querySelector('.pain-btn').focus();
}
function painBefore(prog, then) {
  if (beforeAsked(prog)) { if (then) then(); return; }
  painAsk(painTexts(prog).beforeQuestion, v => { savePain(prog, { foer: v }); if (v !== null) toast('Tak! Smerte før træning: ' + v); if (then) then(); });
}
function painAfter(prog, then) {
  painAsk(painTexts(prog).afterQuestion, v => {
    const r = savePain(prog, { efter: v, afsluttet: true });
    if (v === null) { if (then) then(); return; }
    const f = painTone(v, prog);
    const vals = (r.foer === null || r.foer === undefined ? 'Før: ikke vurderet' : 'Før ' + r.foer) + ', efter ' + v;
    const m = openModal('<div class="pain-fb fb-' + f.tone + '"><div class="fb-icon" aria-hidden="true">' + (f.tone === 'green' ? '✓' : f.tone === 'yellow' ? '!' : '↓') + '</div>' +
      '<h2 id="mTitle">' + esc(f.title) + '</h2><p class="fb-vals">' + esc(vals) + '</p><p>' + esc(f.text) + '</p></div>' +
      '<button type="button" class="btn" id="fbOk">OK</button>');
    m.querySelector('#fbOk').onclick = () => { closeModal(m); if (location.hash.startsWith('#/kategori')) route(); if (then) then(); };
    m.querySelector('#fbOk').focus();
  });
}
function painOverviewHtml() {
  const num = v => typeof v === 'number';
  const list = painLog().filter(x => num(x.foer) || num(x.efter) || num(x.morgen)).slice(-7).reverse();
  let h = '<h2>Smerte før og efter træning</h2><div class="card pain-list">';
  if (!list.length) return h + '<p class="muted small" style="margin:0">Når du starter dagens træning, bliver du spurgt, hvor ondt du har (0–10) før og efter. Dine svar vises her.</p></div>';
  const chip = v => v === null || v === undefined ? '<span class="pchip none">–</span>' : '<span class="pchip t-' + painTone(v).tone + '">' + v + '</span>';
  list.forEach(r => {
    const [y, mo, d] = r.dato.split('-').map(Number); const c = CATEGORIES.find(x => x.id === r.program);
    h += '<div class="prow"><span class="pdate">' + d + '. ' + MONTHS[mo - 1] + '</span><span class="pprog">' + esc(c ? c.name : r.program) + '</span>' +
      '<span class="pvals">' + (num(r.morgen) ? '<small>Morgen</small>' + chip(r.morgen) : '') + (num(r.foer) || num(r.efter) ? '<small>Før</small>' + chip(r.foer) + '<small>efter</small>' + chip(r.efter) : '') + '</span></div>';
  });
  return h + '<p class="hint" style="margin:8px 0 0">0 = ingen smerte, 10 = værst tænkelige. Gemmes kun på denne telefon.</p></div>';
}

/* ---------- Visninger ---------- */
function setHeader(title, back) {
  document.getElementById('pageTitle').textContent = title;
  document.title = title === 'Hjemmeøvelser' ? title : title + ' – Hjemmeøvelser';
  const b = document.getElementById('backBtn');
  b.hidden = !back;
  b.onclick = () => { location.hash = back; };
}
const TAB_OF = { smerte: 'uge', maerker: 'uge', raad: 'mere' };
function setTab(tab) {
  tab = TAB_OF[tab] || tab;
  if (tab) document.body.classList.remove('onboarding');
  document.querySelectorAll('.tabbar a').forEach(a => { const on = a.dataset.tab === tab; a.classList.toggle('active', on); if (on) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
}

function ring(done, total) {
  const r = 30, c = 2 * Math.PI * r, p = total ? Math.min(done / total, 1) : 0;
  return '<svg class="ring" viewBox="0 0 74 74" aria-hidden="true"><circle class="bg" cx="37" cy="37" r="' + r + '"/>' +
    (p > 0 ? '<circle class="fg" cx="37" cy="37" r="' + r + '" stroke-dasharray="' + (c * p) + ' ' + c + '"/>' : '') +
    '<text x="37" y="44" text-anchor="middle">' + done + '</text></svg>';
}

/* ---------- Visning: "Stor og enkel" / "Fuld oversigt" + tekststørrelse (gemmes lokalt) ---------- */
const KEY_MODE = 'hjo_visning_v1', KEY_TEXT = 'hjo_tekst_v1', KEY_GUIDE = 'hjo_guide_v1';
function uiMode() { const m = localStorage.getItem(KEY_MODE); return m === 'enkel' || m === 'fuld' ? m : null; }
function isSimple() { return uiMode() === 'enkel'; }
function textSize() { const t = localStorage.getItem(KEY_TEXT); return ['normal', 'stor', 'xl'].includes(t) ? t : (isSimple() ? 'stor' : 'normal'); }
function applyDisplay() {
  const r = document.documentElement;
  r.classList.toggle('mode-enkel', isSimple()); r.classList.toggle('mode-fuld', !isSimple());
  ['normal', 'stor', 'xl'].forEach(x => r.classList.toggle('ts-' + x, textSize() === x));
}
function setMode(m) { localStorage.setItem(KEY_MODE, m); applyDisplay(); }
const MODE_INFO = {
  enkel: { name: 'Stor og enkel', text: 'Store bogstaver og knapper. Få valg på hver side. Appen viser dig én øvelse ad gangen, og stemmen læser op.' },
  fuld: { name: 'Fuld oversigt', text: 'Normal tekststørrelse. Mere overblik og flere oplysninger på hver side – fx statistik, mærker og genveje. Stemmen læser også op.' }
};
function modePreview(m) { // lille tegnet forhåndsvisning af hver visning
  return m === 'enkel'
    ? '<span class="pv pv-enkel" aria-hidden="true"><i class="pv-h">God dag!</i><i class="pv-big">▶ Start</i><i class="pv-l"></i><i class="pv-tabs"><b></b><b></b><b></b><b></b></i></span>'
    : '<span class="pv pv-fuld" aria-hidden="true"><i class="pv-h">God dag!</i><i class="pv-btn">▶ Start dagens træning</i><i class="pv-row"><b></b><b></b></i><i class="pv-li"></i><i class="pv-li"></i><i class="pv-li"></i><i class="pv-tabs"><b></b><b></b><b></b><b></b></i></span>';
}
function viewOnboarding(then) {
  setHeader('Velkommen'); document.body.classList.add('onboarding'); setTab('');
  let h = '<h2 class="ob-h">Velkommen til Hjemmeøvelser</h2><p class="lead">Hvordan vil du helst have appen? Tryk på det, der passer dig bedst.</p>';
  ['enkel', 'fuld'].forEach(m => {
    h += '<button type="button" class="card ob-card" data-mode="' + m + '">' + modePreview(m) + '<span class="ob-txt"><b>' + MODE_INFO[m].name + '</b><span>' + MODE_INFO[m].text + '</span></span></button>';
  });
  h += '<p class="hint" style="text-align:center">Du kan altid skifte senere under <b>☰ Mere</b>. Alt gemmes kun på denne telefon.</p>';
  $app.innerHTML = h;
  $app.querySelectorAll('[data-mode]').forEach(b => b.onclick = () => {
    setMode(b.dataset.mode);
    toast(MODE_INFO[b.dataset.mode].name + ' er valgt.');
    if (typeof Voice !== 'undefined' && Voice.WHO) viewOnboardingVoice(); else finishOnboarding();
  });
}
function finishOnboarding() {
  document.body.classList.remove('onboarding');
  if (location.hash && location.hash !== '#/' && location.hash !== '#/velkommen') route(); else { location.hash = '#/'; route(); }
}
/* Velkomst, trin 2: vælg stemme (med "Lyt"-knap) */
const VOICE_INFO = { kvinde: { icon: '👩', text: 'Rolig og venlig' }, mand: { icon: '👨', text: 'Rolig og lidt dybere' } };
function voiceChoiceHtml(cur, big) {
  return Object.keys(Voice.WHO).map(w => '<div class="card ob-voice' + (cur === w ? ' sel' : '') + '"><span class="ob-vi" aria-hidden="true">' + VOICE_INFO[w].icon + '</span>' +
    '<span class="ob-txt"><b>' + Voice.WHO[w] + '</b><span>' + VOICE_INFO[w].text + '</span></span>' +
    '<span class="ob-vb"><button type="button" class="btn small secondary" data-listen="' + w + '" aria-label="Lyt til ' + Voice.WHO[w].toLowerCase() + '">▶ Lyt</button>' +
    '<button type="button" class="btn small' + (cur === w ? ' done' : '') + '" data-who="' + w + '" aria-pressed="' + (cur === w) + '">' + (cur === w ? '✓ Valgt' : 'Vælg') + '</button></span></div>').join('');
}
function bindVoiceChoice(root, after) {
  root.querySelectorAll('[data-listen]').forEach(b => b.onclick = () => Voice.preview(b.dataset.listen));
  root.querySelectorAll('[data-who]').forEach(b => b.onclick = () => { Voice.setChoice(b.dataset.who); toast(b.dataset.who === 'fra' ? 'Stemmen er slået fra.' : Voice.WHO[b.dataset.who] + ' er valgt.'); after(b.dataset.who); });
}
function viewOnboardingVoice() {
  setHeader('Velkommen'); document.body.classList.add('onboarding'); setTab('');
  let h = '<h2 class="ob-h">Hvilken stemme vil du høre?</h2><p class="lead">Stemmen forklarer øvelserne og siger tempoet. Tryk <b>▶ Lyt</b> for at høre den.</p>';
  h += voiceChoiceHtml(null) + '<button type="button" class="btn secondary" data-who="fra">Uden stemme</button>';
  h += '<p class="hint" style="text-align:center">Du kan altid skifte under <b>☰ Mere</b> › Stemme.</p>';
  $app.innerHTML = h;
  bindVoiceChoice($app, () => finishOnboarding());
}

/* ---------- I dag (forside): én stor knap + "Hvad skal jeg gøre nu?" ---------- */
function programName(cid) { const c = CATEGORIES.find(x => x.id === cid); if (!c) return ''; return c.area === 'ryg' ? 'Ryg og nakke: ' + c.name : (c.id === 'haelspore' ? 'Hælspore' : c.name); }
function startTraining(cid) {
  localStorage.setItem(KEY_LASTCAT, cid);
  const go = () => {
    const list = programExercises(cid), next = list.find(e => !doneToday(e.id, cid));
    if (isSimple() && next) { sessionStorage.setItem(KEY_GUIDE, cid); location.hash = '#/oevelse/' + encodeURIComponent(next.id); }
    else location.hash = '#/kategori/' + cid;
  };
  if (!beforeAsked(cid)) painBefore(cid, go); else go();
}
function viewHome() {
  setHeader('Hjemmeøvelser'); setTab('home');
  const now = new Date(), cid = lastCategory(), todays = programExercises(cid);
  const doneN = todays.filter(e => doneToday(e.id, cid)).length, allDone = todays.length > 0 && doneN === todays.length;
  const next = todays.find(e => !doneToday(e.id, cid));
  let h = '<section class="hello"><p class="date">' + WEEKDAYS[now.getDay()].replace(/^./, c => c.toUpperCase()) + ' ' + now.getDate() + '. ' + MONTHS_LONG[now.getMonth()] + '</p>' +
    '<h2>' + greeting() + '! 👋</h2></section>';
  h += remindBannerHtml();
  h += '<div class="card now-card"><p class="now-q">Hvad skal jeg gøre nu?</p>' +
    '<a class="btn start' + (allDone ? ' done' : '') + '" id="startBtn" href="#/kategori/' + cid + '">' +
    '<span class="start-main">' + (allDone ? '✓ Dagens træning er lavet' : (doneN ? '▶ Fortsæt dagens træning' : '▶ Start dagens træning')) + '</span>' +
    '<span class="start-sub">' + esc(programName(cid)) + ' · ' + programLevelLabel(cid) + ' · ' + doneN + ' af ' + todays.length + ' øvelser</span></a>' +
    (allDone ? '<p class="now-next">Godt gået! Hvil dig, og træn igen i morgen eller i overmorgen.</p>' : next ? '<p class="now-next">Næste øvelse: <b>' + esc(next.name) + '</b></p>' : '') + '</div>';
  if (HAEL_ON && haelUsed() && now.getHours() < 11 && !haelRoutineDoneToday()) h += '<button type="button" class="btn routine-btn" id="homeRoutine">🌅 Morgenrutine – 2 min <small>(hælspore)</small></button>';
  h += '<a class="btn secondary" id="changeProg" href="#/programmer">🔄 Skift program</a>';
  if (!isSimple()) {
    const streak = currentStreak(), goal = getGoal(), week = daysInWeek(mondayOf(now));
    h += '<a class="card status-strip" href="#/uge"><span>' + (streak > 0 ? '🔥' : '🌱') + ' <b>' + streak + '</b> ' + (streak === 1 ? 'dag' : 'dage') + ' i træk</span><span>📅 <b>' + week + ' af ' + goal + '</b> dage denne uge</span><span class="chev" aria-hidden="true">›</span></a>';
    h += '<div class="card tip"><p class="tip-h">💬 Dagens tanke</p><p class="tip-t">' + esc(dailyMessage()) + '</p></div>';
  }
  $app.innerHTML = h;
  hydrateMedia($app); bindRemindBanner();
  const hr = document.getElementById('homeRoutine'); if (hr) hr.onclick = haelOpenRoutine;
  if (HAEL_ON) setTimeout(() => { if (location.hash === '' || location.hash === '#/' || location.hash === '#') haelMaybeAskMorning(); }, 350);
  document.getElementById('startBtn').onclick = ev => { ev.preventDefault(); if (allDone) { location.hash = '#/kategori/' + cid; return; } startTraining(cid); };
}

/* ---------- Øvelser: vælg program ---------- */
function progCard(c) {
  const cur = lastCategory() === c.id, list = programExercises(c.id), d = list.filter(e => doneToday(e.id, c.id)).length;
  return '<a class="prog-card' + (cur ? ' cur' : '') + '" href="#/kategori/' + c.id + '" data-prog="' + c.id + '">' + catThumb(c) +
    '<span class="cat-txt"><strong>' + esc(c.name) + '</strong><span class="count">' + esc(programLevelLabel(c.id)) + (d ? ' · ' + d + ' ✓' : '') + '</span>' +
    (cur ? '<span class="cur-tag">Dit program nu</span>' : '') + '</span><span class="chev" aria-hidden="true">›</span></a>';
}
/* Kropsområder: "Hvor gør det ondt?" – i Stor og enkel vises kun områderne (få, store valg); i Fuld oversigt alle programmer under hvert område */
function bodyAreas() {
  const A = [{ id: 'knae-hofte', name: 'Knæ, hofte og balance', progs: CATEGORIES.filter(c => !c.area && c.id !== 'haelspore') }];
  if (HAEL_ON) A.push({ id: 'fod', name: 'Fødder', progs: CATEGORIES.filter(c => c.id === 'haelspore') });
  if (typeof RYG_ON !== 'undefined' && RYG_ON) A.push({ id: 'ryg', name: 'Ryg og nakke', intro: RYG_AREA.intro, progs: CATEGORIES.filter(c => c.area === 'ryg') });
  if (typeof LED_AREAS !== 'undefined') LED_AREAS.forEach(a => A.push({ id: a.id, name: a.name, intro: a.intro, progs: CATEGORIES.filter(c => c.area === a.id) }));
  return A.filter(a => a.progs.length);
}
function areaCard(a) {
  const cur = a.progs.some(c => c.id === lastCategory()), href = a.progs.length === 1 ? '#/kategori/' + a.progs[0].id : '#/omraade/' + a.id;
  return '<a class="prog-card area-card' + (cur ? ' cur' : '') + '" href="' + href + '" data-area="' + a.id + '">' + catThumb(a.progs[0]) +
    '<span class="cat-txt"><strong>' + esc(a.name) + '</strong><span class="count">' + esc(a.progs.length === 1 ? (a.progs[0].name !== a.name ? a.progs[0].name + ' · ' : '') + programLevelLabel(a.progs[0].id) : a.progs.map(c => c.name).join(' · ')) + '</span>' +
    (cur ? '<span class="cur-tag">Dit program nu</span>' : '') + '</span><span class="chev" aria-hidden="true">›</span></a>';
}
function viewPrograms() {
  setHeader('Øvelser'); setTab('prog');
  const A = bodyAreas();
  let h = '';
  if (isSimple()) {
    h += '<h2 class="ob-h" style="margin-top:4px">Hvor gør det ondt?</h2><p class="lead">Tryk på det sted, du vil træne.</p>' + A.map(areaCard).join('');
  } else {
    h += '<p class="lead">Vælg det program, du vil træne.</p>';
    A.forEach(a => { h += '<h2>' + esc(a.name) + '</h2>' + (a.intro && a.progs.length > 1 ? '<p class="muted small" style="margin:-4px 0 10px">' + esc(a.intro) + '</p>' : '') + a.progs.map(progCard).join(''); });
  }
  $app.innerHTML = h;
  hydrateMedia($app);
  $app.querySelectorAll('[data-prog]').forEach(a => a.addEventListener('click', () => localStorage.setItem(KEY_LASTCAT, a.dataset.prog)));
}
function viewArea(id) {
  const a = bodyAreas().find(x => x.id === id); if (!a) return viewPrograms();
  setHeader(a.name, '#/programmer'); setTab('prog');
  let h = (a.intro ? '<p class="lead">' + esc(a.intro) + '</p>' : '<p class="lead">Vælg program.</p>') + a.progs.map(progCard).join('');
  $app.innerHTML = h;
  hydrateMedia($app);
  $app.querySelectorAll('[data-prog]').forEach(x => x.addEventListener('click', () => localStorage.setItem(KEY_LASTCAT, x.dataset.prog)));
}

/* ---------- Mere: indstillinger og alt det, man ikke bruger hver dag ---------- */
function viewMore() {
  setHeader('Mere'); setTab('mere');
  const row = (href, icon, title, sub, id) => '<a class="card more-row" href="' + href + '"' + (id ? ' id="' + id + '"' : '') + '><span class="mi" aria-hidden="true">' + icon + '</span><span><b>' + title + '</b>' + (sub ? '<small>' + sub + '</small>' : '') + '</span><span class="chev" aria-hidden="true">›</span></a>';
  const rs = typeof remindSettings === 'function' ? remindSettings() : { on: false };
  let h = '<h2>Visning</h2><div class="seg" role="radiogroup" aria-label="Visning">' + ['enkel', 'fuld'].map(m =>
    '<button type="button" role="radio" class="seg-b' + ((isSimple() ? 'enkel' : 'fuld') === m ? ' sel' : '') + '" aria-checked="' + ((isSimple() ? 'enkel' : 'fuld') === m) + '" data-mode="' + m + '"><b>' + MODE_INFO[m].name + '</b></button>').join('') + '</div>';
  h += '<h2>Tekststørrelse</h2><div class="seg three" role="radiogroup" aria-label="Tekststørrelse">' + [['normal', 'Normal'], ['stor', 'Stor'], ['xl', 'Meget stor']].map(([k, n]) =>
    '<button type="button" role="radio" class="seg-b ts-b-' + k + (textSize() === k ? ' sel' : '') + '" aria-checked="' + (textSize() === k) + '" data-ts="' + k + '"><b>' + n + '</b></button>').join('') + '</div>';
  h += '<h2>Stemme</h2><div class="card voice-card"><p style="margin:0 0 10px">En rolig dansk stemme forklarer øvelsen og siger tempoet: "Op … og ned", "Hold … 3, 2, 1". Den virker også uden internet.</p>' +
    (typeof Voice !== 'undefined' ? '<div class="seg three voice-seg" role="radiogroup" aria-label="Stemme">' + [['kvinde', 'Kvinde'], ['mand', 'Mand'], ['fra', 'Fra']].map(([k, n]) =>
      '<button type="button" role="radio" class="seg-b' + (Voice.choice() === k ? ' sel' : '') + '" aria-checked="' + (Voice.choice() === k) + '" data-vchoice="' + k + '"><b>' + n + '</b></button>').join('') + '</div>' +
      '<div class="voice-listen"><button type="button" class="btn small secondary" data-listen="kvinde">▶ Lyt: kvinde</button><button type="button" class="btn small secondary" data-listen="mand">▶ Lyt: mand</button></div>' +
      (Voice.note() ? '<p class="hint">' + Voice.note() + '</p>' : '') : '') + '</div>';
  h += '<h2>Mere i appen</h2>' +
    row('#/raad', '📖', 'Gode råd', 'Om artrose, hælspore og træning') +
    row('#/smerte', '📈', 'Min smerte', 'Graf over din smerte uge for uge') +
    row('#/maerker', '🏅', 'Mine mærker', 'Små belønninger for at holde fast') +
    row('#/paamindelser', '🔔', 'Påmindelser', rs.on ? 'Slået til · ' + rs.days.length + ' dage kl. ' + rs.time : 'Slået fra') +
    (typeof RYG_ON !== 'undefined' && RYG_ON ? row('#/ryg/laege', '⚠️', 'Hvornår skal du til læge?', (typeof LED_ON !== 'undefined' && LED_ON ? 'Ryg, nakke og ' + LED_AREAS.map(a => a.name.toLowerCase()).join(', ') : 'Ryg og nakke')) : '');
  if (HAEL_ON) h += '<h2>Hælspore</h2>' + row('#/hael/plan', '📅', '12-ugers planen') + row('#/hael/trafiklys', '🚦', 'Hvor meget må jeg gå?') + row('#/hael/skotjek', '👟', 'Skotjek') + row('#/hael/myter', '💬', 'Myter og fakta') + row('#/hael/hjaelpemidler', '🩹', 'Hjælpemidler');
  h += '<h2>Til fysioterapeuten</h2>' + row('#/rediger', '⚙️', 'Ret øvelser', 'Tilpas, tilføj, eksportér og importér');
  h += '<p class="hint" style="margin-top:18px">Alt, du skriver i appen, gemmes kun på denne telefon.</p>';
  $app.innerHTML = h;
  if (typeof Voice !== 'undefined') {
    $app.querySelectorAll('[data-listen]').forEach(b => b.onclick = () => Voice.preview(b.dataset.listen));
    $app.querySelectorAll('[data-vchoice]').forEach(b => b.onclick = () => { const c = b.dataset.vchoice; Voice.setChoice(c); toast(c === 'fra' ? 'Stemmen er slået fra.' : Voice.WHO[c] + ' er valgt.'); if (c !== 'fra') Voice.say('Stemmen er slået til.', null); const y = window.scrollY; viewMore(); window.scrollTo(0, y); });
  }
  $app.querySelectorAll('[data-mode]').forEach(b => b.onclick = () => { setMode(b.dataset.mode); toast(MODE_INFO[b.dataset.mode].name + ' er valgt.'); viewMore(); });
  $app.querySelectorAll('[data-ts]').forEach(b => b.onclick = () => { localStorage.setItem(KEY_TEXT, b.dataset.ts); applyDisplay(); viewMore(); });
}

function viewCategory(id) {
  const cat = CATEGORIES.find(c => c.id === id);
  if (!cat) return viewHome();
  if (id === 'haelspore' && HAEL_ON) return viewHael();
  if (typeof isRyg === 'function' && isRyg(id)) return viewRyg(id);
  setHeader(cat.name, '#/programmer'); setTab('prog');
  localStorage.setItem(KEY_LASTCAT, id);
  const lv = getLevel(id);
  const all = exercises.filter(e => e.category === id);
  const list = all.filter(e => (Number(e.level) || 1) === lv);
  let html = '<p class="muted small" style="margin-bottom:8px">Vælg dit niveau. Din fysioterapeut kan hjælpe dig med at finde det rigtige.</p>';
  html += '<div class="levels" role="radiogroup" aria-label="Vælg niveau">' + LEVELS.map(L =>
    '<button type="button" role="radio" aria-checked="' + (L.n === lv) + '" class="lvl' + (L.n === lv ? ' sel' : '') + '" data-lvl="' + L.n + '">' +
    '<b>' + L.name + '</b><span>' + L.sub + '</span></button>').join('') + '</div>';
  if (!list.length) html += '<div class="card">Der er ingen øvelser på dette niveau endnu.</div>';
  list.forEach(e => {
    const d = doneToday(e.id, id);
    html += '<a class="ex-item' + (d ? ' done' : '') + '" href="#/oevelse/' + encodeURIComponent(e.id) + '">' + thumbHtml(e) +
      '<div class="txt"><strong>' + esc(e.name) + '</strong><span>' + esc(shortDose(e.dose)) + '</span></div>' +
      (d ? '<span class="check" aria-label="Lavet i dag">✓</span>' : '<span class="check" aria-hidden="true" style="color:#b9b4a8">›</span>') + '</a>';
  });
  if (needsAfter(id) && list.some(e => doneToday(e.id, id))) html += '<button type="button" class="btn finish" id="finishBtn">✓ ' + esc(PAIN_CHECK.finishButton) + '</button>';
  const hasNext = all.some(e => (Number(e.level) || 1) === lv + 1);
  html += '<div class="card hint-card"><h3>' + (lv < 3 ? '🎯 Føles øvelserne lette?' : '🎯 Godt gået – du er på højeste niveau') + '</h3><p style="margin:0">' +
    (lv < 3
      ? 'Når du kan lave 3 sæt × 10–15 gentagelser med god kvalitet (knæ over 2. tå, bækkenet lige), og smerten holder sig inden for smertereglen, kan du prøve Niveau ' + (lv + 1) + '.'
      : 'Gør øvelserne sværere med langsommere tempo, flere gentagelser eller lidt ekstra vægt – helst efter aftale med din fysioterapeut.') +
    '</p>' + (lv < 3 && hasNext ? '<button type="button" class="btn secondary" id="nextLvl">Prøv Niveau ' + (lv + 1) + '</button>' : '') + '</div>';
  $app.innerHTML = html;
  hydrateMedia($app);
  const fb = document.getElementById('finishBtn'); if (fb) fb.onclick = () => painAfter(id, () => checkBadges());
  $app.querySelectorAll('[data-lvl]').forEach(b => b.onclick = () => { setLevel(id, Number(b.dataset.lvl)); viewCategory(id); checkBadges(); });
  const nb = document.getElementById('nextLvl');
  if (nb) nb.onclick = () => { setLevel(id, lv + 1); toast('Du er nu på Niveau ' + (lv + 1) + '.'); viewCategory(id); window.scrollTo(0, 0); checkBadges(); };
}
function shortDose(s) { return String(s || '').split('.')[0]; }

/* Hvor er øvelsen i dagens program? (til "Øvelse 2 af 5" og "Næste øvelse") */
function programNav(e) {
  const ctx = exCtx(e), list = programExercises(ctx), i = list.findIndex(x => x.id === e.id);
  if (i < 0) return null;
  const next = list.slice(i + 1).find(x => !doneToday(x.id, ctx)) || list.find(x => x.id !== e.id && !doneToday(x.id, ctx));
  return { i: i + 1, n: list.length, next, allDone: list.every(x => doneToday(x.id, ctx)) };
}
function viewExercise(id) {
  const e = exercises.find(x => x.id === id);
  if (!e) { location.hash = '#/'; return; }
  const ctx = exCtx(e), cat = CATEGORIES.find(c => c.id === ctx);
  setHeader(cat ? cat.name : 'Øvelse', '#/kategori/' + ctx); setTab('prog');
  const d = doneToday(e.id, ctx), lv = Number(e.level) || 1, L = LEVELS.find(x => x.n === lv) || LEVELS[0];
  const isHael = e.category === 'haelspore' && HAEL_ON, ryg = typeof isRyg === 'function' && isRyg(e.category);
  const nav = programNav(e), simple = isSimple();
  let html = '<div class="ex-head">' + (isHael
    ? '<span class="badge phase" style="--pc:' + (HAEL_PHASES[Math.min(lv, 4) - 1] || HAEL_PHASES[0]).color + '">' + (Array.isArray(e.phases) && e.phases.length ? 'Fase ' + e.phases.join(', ') : 'Fase ' + lv) + '</span>'
    : ryg ? '<span class="badge lv' + lv + '">' + (e.track === 'hold' ? holdLabel(rygProg(e.category)) : fbLabel(rygProg(e.category)) + ' · ' + pWord(rygProg(e.category)) + ' ' + (Array.isArray(e.phases) ? e.phases.join(', ') : lv)) + '</span>'
    : '<span class="badge lv' + lv + '">' + L.name + ' · ' + L.sub + '</span>') +
    (nav ? '<span class="ex-pos">Øvelse ' + nav.i + ' af ' + nav.n + '</span>' : '') + '</div>';
  html += '<h2 class="ex-title">' + esc(e.name) + '</h2>';
  const hasFilm = (typeof FigFilm !== 'undefined' && FigFilm.has(e.id)) || (typeof HAEL_TRIN_FILM !== 'undefined' && !!HAEL_TRIN_FILM[e.id]);
  if (!hasFilm && !imagesFor(e).length && !(e.photos && e.photos.length)) html += galleryHtml(e); // pladsholder
  if (typeof haelTrinFilmHtml === 'function') html += haelTrinFilmHtml(e);
  if (typeof figFilmHtml === 'function') html += figFilmHtml(e);
  html += videoHtml(e);
  if (typeof Coach !== 'undefined') html += Coach.btnHtml(e);
  html += '<div class="dose"><span aria-hidden="true">🔁</span><span>' + esc(e.dose) + '</span></div>';
  html += '<button id="doneBtn" class="btn ' + (d ? 'done' : '') + '" type="button">' + (d ? '✓ Lavet i dag – tryk for at fortryde' : 'Markér som lavet i dag') + '</button>';
  if (d && nav && nav.next) html += '<a class="btn next-btn" id="nextBtn" href="#/oevelse/' + encodeURIComponent(nav.next.id) + '">Næste øvelse: ' + esc(nav.next.name) + ' ›</a>';
  if (needsAfter(ctx) && d && !nav) html += '<button type="button" class="btn secondary" id="finishBtn">' + esc(PAIN_CHECK.finishButton) + '</button>';
  const steps = e.steps || [], first = steps.slice(0, 3), rest = steps.slice(3);
  html += '<div class="card"><h3>Sådan gør du</h3><ol class="steps">' + first.map(s => '<li>' + esc(s) + '</li>').join('') + '</ol>' +
    (rest.length ? '<details class="more-steps"><summary>Vis ' + (rest.length === 1 ? 'det sidste trin' : 'de sidste ' + rest.length + ' trin') + '</summary><ol class="steps" start="4">' + rest.map(s => '<li>' + esc(s) + '</li>').join('') + '</ol></details>' : '') + '</div>';
  if (e.equipment) html += '<p class="equip"><span aria-hidden="true">🧰</span> <b>Udstyr:</b> ' + esc(e.equipment) + '</p>';
  if (ryg) html += rygDoctorLink(isRyg(ctx) ? ctx : e.category);
  const fold = (cls, title, body, open) => '<details class="card fold ' + cls + '"' + (open ? ' open' : '') + '><summary>' + title + '</summary>' + body + '</details>';
  if (imagesFor(e).length || (e.photos && e.photos.length)) html += fold('gal-fold', '🖼️ Billeder', galleryHtml(e), !simple);
  if (e.tips && e.tips.length) html += fold('', '✅ Gør det rigtigt', '<ul class="tips">' + e.tips.map(s => '<li>' + esc(s) + '</li>').join('') + '</ul>', !simple);
  if (e.progression) html += fold('prog', '↕️ Lettere eller sværere', '<p style="margin:0">' + esc(e.progression) + '</p>', !simple);
  if (e.stop) html += fold('stop', '⚠️ Smerteregel – hvornår skal du skrue ned?', '<p>' + esc(e.stop) + '</p>', false);
  $app.innerHTML = html;
  hydrateMedia($app); initGallery($app, e); initVideo($app);
  if (typeof initHaelTrinFilm === 'function') initHaelTrinFilm($app);
  if (typeof initFigFilm === 'function') initFigFilm($app);
  if (typeof Coach !== 'undefined') Coach.bind($app, e);
  const fin = document.getElementById('finishBtn'); if (fin) fin.onclick = () => painAfter(ctx, () => checkBadges());
  document.getElementById('doneBtn').onclick = () => {
    const nowDone = toggleDone(e.id, ctx);
    toast(nowDone ? 'Godt gået! Øvelsen er krydset af.' : 'Afkrydsning fjernet.');
    const y = window.scrollY; viewExercise(id); window.scrollTo(0, y);
    if (nowDone) { const nb = document.getElementById('nextBtn'); if (nb) nb.scrollIntoView({ block: 'nearest' }); }
    if (!nowDone) return;
    const prog = programExercises(ctx);
    if (needsAfter(ctx) && prog.some(x => x.id === e.id) && prog.every(x => doneToday(x.id, ctx))) painAfter(ctx, () => { checkBadges(); if (sessionStorage.getItem(KEY_GUIDE)) { sessionStorage.removeItem(KEY_GUIDE); location.hash = '#/'; } });
    else checkBadges();
  };
  // Stor og enkel: smerte spørges kun én gang – når man trykker "Start dagens træning" (samme før-måling som i Fuld oversigt)
  if (!d && !beforeAsked(ctx) && !isSimple()) painBefore(ctx);
}

function viewWeek() {
  setHeader('Fremgang'); setTab('uge');
  const now = new Date();
  const mon = mondayOf(now);
  const todayK = dateKey(now);
  let days = 0, total = 0;
  let cells = '';
  for (let i = 0; i < 7; i++) {
    const d = addDays(mon, i), k = dateKey(d), n = countDone(k);
    if (n) { days++; total += n; }
    const future = k > todayK;
    cells += '<div class="day' + (n ? ' has' : '') + (k === todayK ? ' is-today' : '') + (future ? ' future' : '') + '">' +
      '<div class="dn">' + DAYS[i] + '</div><div class="dd">' + d.getDate() + '/' + (d.getMonth() + 1) + '</div>' +
      '<div class="mark" aria-label="' + n + ' øvelser">' + (n ? n : '') + '</div></div>';
  }
  const streak = currentStreak(), best = bestStreak(), trainedToday = countDone(dateKey()) > 0;
  const goal = getGoal(), weekN = daysInWeek(mon), weekPct = Math.min(100, Math.round(weekN / goal * 100));
  let html = '<div class="stats">' +
    '<div class="stat streak"><div class="stat-icon" aria-hidden="true">' + (streak > 0 ? '🔥' : '🌱') + '</div>' +
    '<div class="stat-num">' + streak + '</div><div class="stat-lbl">' + (streak === 1 ? 'dag i træk' : 'dage i træk') + '</div>' +
    '<div class="stat-sub">' + (streak > 0 && !trainedToday ? 'Træn i dag for at holde den' : 'Bedste: ' + best + ' ' + (best === 1 ? 'dag' : 'dage')) + '</div></div>' +
    '<div class="stat goal">' + bigRing(weekPct, weekN + '/' + goal, weekN >= goal ? 'mål nået ✓' : 'dage') +
    '<div class="stat-lbl">Ugemål: ' + weekPct + ' %</div><button type="button" class="linkbtn" id="goalEdit">Ret ugemål</button></div></div>';
  html += '<div id="goalBox" class="card goalbox" hidden><p style="margin:0 0 8px"><b>Hvor mange dage vil du træne om ugen?</b></p>' +
    '<div class="stepper"><button type="button" class="btn small secondary" id="gMinus" aria-label="Færre dage">−</button><span id="gVal">' + goal + '</span>' +
    '<button type="button" class="btn small secondary" id="gPlus" aria-label="Flere dage">+</button></div>' +
    '<p class="hint">Anbefalingen er 2–3 træninger om ugen. Lette dage og gåture kan komme oveni.</p>' +
    '<button type="button" class="btn" id="gSave">Gem ugemål</button></div>';
  html += '<div class="card"><p class="muted small" style="margin-bottom:6px">Uge ' + weekNumber(now) + ' · ' + mon.getDate() + '. ' + MONTHS[mon.getMonth()] + ' – ' + addDays(mon, 6).getDate() + '. ' + MONTHS[addDays(mon, 6).getMonth()] + '</p>' +
    '<div style="display:flex;align-items:baseline;gap:10px;margin-bottom:14px"><span class="big-number">' + days + '</span><span>af 7 dage med øvelser</span></div>' +
    '<div class="week">' + cells + '</div>' +
    '<p class="muted small" style="margin:12px 0 0">Tallet i cirklen er antal øvelser lavet den dag. I alt ' + total + ' øvelser denne uge.</p></div>';
  html += '<div class="card"><h3>' + encouragement(days) + '</h3><p class="muted small" style="margin:0">Målet er at træne 2–3 gange om ugen – eller lidt hver dag, hvis din fysioterapeut har aftalt det med dig.</p></div>';
  html += painOverviewHtml().replace('</div>', '<a class="linkbtn" href="#/smerte">Se graf og ugesammenligning ›</a></div>');
  html += '<h2>De seneste uger</h2><div class="card">';
  for (let w = 0; w < 4; w++) {
    const m = addDays(mon, -7 * w);
    let c = 0;
    for (let i = 0; i < 7; i++) if (countDone(dateKey(addDays(m, i))) > 0) c++;
    html += '<div class="weekrow"><span class="lbl">' + (w === 0 ? 'Denne uge' : 'Uge ' + weekNumber(m)) + '</span>' +
      '<span class="bar"><span style="width:' + Math.round(c / 7 * 100) + '%"></span></span><span class="n">' + c + ' dage</span></div>';
  }
  html += '</div>';
  const store = earnedBadges() || {}, BL = allBadges();
  html += '<a class="card more-row" href="#/smerte"><span class="mi" aria-hidden="true">📈</span><span><b>Min smerte</b><small>Graf og ugesammenligning</small></span><span class="chev" aria-hidden="true">›</span></a>';
  html += '<a class="card more-row" href="#/maerker"><span class="mi" aria-hidden="true">🏅</span><span><b>Mine mærker</b><small>' + BL.filter(b => store[b.id]).length + ' af ' + BL.length + '</small></span><span class="chev" aria-hidden="true">›</span></a>';
  $app.innerHTML = html;
  let g = goal;
  document.getElementById('goalEdit').onclick = () => { const b = document.getElementById('goalBox'); b.hidden = !b.hidden; if (!b.hidden) b.scrollIntoView({ block: 'nearest' }); };
  document.getElementById('gMinus').onclick = () => { g = Math.max(1, g - 1); document.getElementById('gVal').textContent = g; };
  document.getElementById('gPlus').onclick = () => { g = Math.min(7, g + 1); document.getElementById('gVal').textContent = g; };
  document.getElementById('gSave').onclick = () => { setGoal(g); toast('Ugemål gemt: ' + g + ' dage om ugen.'); viewWeek(); checkBadges(); };
}
/* ---------- Min smerte: statistik (kun egne lokale tal fra hjo_smerte_v1, inline SVG) ---------- */
const KEY_STATS_PERIOD = 'hjo_smerte_periode_v1';
const dec = n => (Math.round(n * 10) / 10).toFixed(1).replace('.', ',');
const parseKey = k => { const [y, m, d] = k.split('-').map(Number); return new Date(y, m - 1, d); };
function weekLabel(mon) { const thu = addDays(mon, 3); return 'Uge ' + weekNumber(mon) + (thu.getFullYear() !== new Date().getFullYear() ? ' (' + thu.getFullYear() + ')' : ''); }
function avg(a) { return a.length ? a.reduce((s, x) => s + x, 0) / a.length : null; }
const KEY_STATS_PROG = 'hjo_smerte_program_v1';
function statsProg() {
  const p = readJson(KEY_STATS_PROG, 'alle');
  if (p === 'alle' || !CATEGORIES.some(c => c.id === p)) return 'alle';
  const used = new Set(painLog().map(r => r.program));
  return used.has(p) && used.size > 1 ? p : 'alle'; /* vælgeren vises kun ved mindst to programmer */
}
const isNum = v => typeof v === 'number';
function statsLog() { const p = statsProg(); return painLog().filter(r => (p === 'alle' || r.program === p) && (isNum(r.foer) || isNum(r.efter) || isNum(r.morgen))); }
function painWeeks() {
  const map = new Map();
  statsLog().forEach(r => {
    const mon = mondayOf(parseKey(r.dato)), k = dateKey(mon);
    if (!map.has(k)) map.set(k, { key: k, mon, foer: [], efter: [], morgen: [], n: 0 });
    const w = map.get(k); if (isNum(r.foer) || isNum(r.efter)) w.n++;
    if (isNum(r.foer)) w.foer.push(r.foer);
    if (isNum(r.efter)) w.efter.push(r.efter);
    if (isNum(r.morgen)) w.morgen.push(r.morgen);
  });
  return [...map.values()].sort((a, b) => a.key < b.key ? -1 : 1).map(w => Object.assign(w, {
    label: weekLabel(w.mon), avgFoer: avg(w.foer), avgEfter: avg(w.efter), avgMorgen: avg(w.morgen), days: daysInWeek(w.mon)
  }));
}
function weekInfo(key) {
  const w = painWeeks().find(x => x.key === key);
  if (w) return w;
  const mon = parseKey(key);
  return { key, mon, label: weekLabel(mon), avgFoer: null, avgEfter: null, avgMorgen: null, n: 0, days: daysInWeek(mon) };
}
function hasMorning() { return statsLog().some(r => isNum(r.morgen)); }
function painChart(period) {
  const now = new Date(); const days = period === '4u' ? 28 : period === '3m' ? 91 : null;
  let pts = statsLog().sort((a, b) => a.dato < b.dato ? -1 : a.dato > b.dato ? 1 : 0);
  const end = parseKey(dateKey(now));
  let start = days ? addDays(end, -days + 1) : (pts.length ? parseKey(pts[0].dato) : addDays(end, -27));
  pts = pts.filter(r => parseKey(r.dato) >= start);
  if (!pts.length) return '<p class="muted small chart-empty">Ingen målinger i den valgte periode.</p>';
  if (end - start < 6 * 86400000) start = addDays(end, -6);
  const W = 340, H = 210, L = 30, R = 10, T = 10, B = 30, pw = W - L - R, ph = H - T - B;
  const span = Math.max(1, (end - start) / 86400000);
  const X = d => L + ((parseKey(d) - start) / 86400000) / span * pw;
  const Y = v => T + (1 - v / 10) * ph;
  let s = '<svg class="chart" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Graf over smerte før og efter træning, ' + pts.length + ' målinger">';
  s += '<rect x="' + L + '" y="' + Y(10) + '" width="' + pw + '" height="' + (Y(5.5) - Y(10)) + '" class="z-r"/>' +
    '<rect x="' + L + '" y="' + Y(5.5) + '" width="' + pw + '" height="' + (Y(2.5) - Y(5.5)) + '" class="z-y"/>' +
    '<rect x="' + L + '" y="' + Y(2.5) + '" width="' + pw + '" height="' + (Y(0) - Y(2.5)) + '" class="z-g"/>';
  [0, 2, 4, 6, 8, 10].forEach(v => { s += '<line x1="' + L + '" x2="' + (W - R) + '" y1="' + Y(v) + '" y2="' + Y(v) + '" class="grid"/><text x="' + (L - 6) + '" y="' + (Y(v) + 4) + '" class="ylab">' + v + '</text>'; });
  const ticks = [start, addDays(start, Math.round(span / 2)), end];
  ticks.forEach((d, i) => { s += '<text x="' + (L + (d - start) / 86400000 / span * pw) + '" y="' + (H - 10) + '" class="xlab" text-anchor="' + (i === 0 ? 'start' : i === 2 ? 'end' : 'middle') + '">' + d.getDate() + '. ' + MONTHS[d.getMonth()] + '</text>'; });
  const series = (field, cls) => {
    const p = pts.filter(r => typeof r[field] === 'number');
    if (!p.length) return '';
    let out = p.length > 1 ? '<polyline class="ln ' + cls + '" points="' + p.map(r => X(r.dato).toFixed(1) + ',' + Y(r[field]).toFixed(1)).join(' ') + '"/>' : '';
    p.forEach(r => { out += '<circle class="pt ' + cls + '" cx="' + X(r.dato).toFixed(1) + '" cy="' + Y(r[field]).toFixed(1) + '" r="4"><title>' + r.dato + ': ' + r[field] + '</title></circle>'; });
    return out;
  };
  const morn = pts.some(r => isNum(r.morgen));
  s += series('foer', 's-foer') + series('efter', 's-efter') + (morn ? series('morgen', 's-morgen') : '') + '</svg>';
  s += '<div class="legend"><span><i class="lg s-foer"></i>Før træning</span><span><i class="lg s-efter"></i>Efter træning</span>' + (morn ? '<span><i class="lg s-morgen"></i>Morgensmerte</span>' : '') + '</div>' +
    '<div class="legend zones"><span><i class="zg"></i>0–2</span><span><i class="zy"></i>3–5</span><span><i class="zr"></i>6–10</span></div>';
  return s;
}
function diffHtml(label, a, b) {
  if (a === null || b === null) return '<div class="cmp-row"><span class="cmp-l">' + label + '</span><span class="cmp-v">' + (a === null ? '–' : dec(a)) + ' mod ' + (b === null ? '–' : dec(b)) + '</span><span class="cmp-d none">ikke nok data</span></div>';
  const d = Math.round((a - b) * 10) / 10;
  const cls = d < 0 ? 'down' : d > 0 ? 'up' : 'same';
  const txt = d < 0 ? '↓ ' + dec(-d) + ' lavere' : d > 0 ? '↑ ' + dec(d) + ' højere' : '= uændret';
  return '<div class="cmp-row"><span class="cmp-l">' + label + '</span><span class="cmp-v"><b>' + dec(a) + '</b> mod ' + dec(b) + '</span><span class="cmp-d ' + cls + '">' + txt + '</span></div>';
}
function compareHtml(wa, wb, title) {
  return '<div class="card cmp"><h3>' + esc(title) + '</h3><p class="muted small" style="margin:0 0 6px">' + esc(wa.label) + ' mod ' + esc(wb.label) + ' (gennemsnit, 0–10)</p>' +
    (hasMorning() ? diffHtml('Morgensmerte (første skridt)', wa.avgMorgen, wb.avgMorgen) : '') +
    diffHtml('Smerte efter træning', wa.avgEfter, wb.avgEfter) + diffHtml('Smerte før træning', wa.avgFoer, wb.avgFoer) +
    '<div class="cmp-row"><span class="cmp-l">Træningsdage</span><span class="cmp-v"><b>' + wa.days + '</b> mod ' + wb.days + '</span><span class="cmp-d none"></span></div></div>';
}
function statsProgPicker() {
  const p = statsProg(), used = new Set(painLog().map(r => r.program));
  const opts = [['alle', 'Alle programmer']].concat(CATEGORIES.filter(c => used.has(c.id)).map(c => [c.id, c.name]));
  if (opts.length < 3) return '';
  return '<label for="statProg" class="sr">Program</label><select id="statProg" class="stat-prog">' + opts.map(([k, l]) => '<option value="' + k + '"' + (k === p ? ' selected' : '') + '>' + esc(l) + '</option>').join('') + '</select>';
}
function bindStatsProg() { const sp = document.getElementById('statProg'); if (sp) sp.onchange = () => { writeJson(KEY_STATS_PROG, sp.value); viewStats(); }; }
function viewStats() {
  setHeader('Min smerte', '#/uge'); setTab('smerte');
  const weeks = painWeeks();
  if (!weeks.length && statsProg() !== 'alle' && painLog().length) { writeJson(KEY_STATS_PROG, 'alle'); return viewStats(); }
  if (!weeks.length) {
    $app.innerHTML = '<div class="card empty-stats"><div class="empty-ico" aria-hidden="true">📈</div><h3>Her kommer din smerteoversigt</h3>' +
      '<p>Når du starter dagens træning, spørger appen: <i>"' + esc(PAIN_CHECK.beforeQuestion) + '"</i> – og igen, når du er færdig. ' +
      (HAEL_ON ? 'I hælsporet spørger appen også om morgensmerten: <i>"' + esc(HAEL_PAIN_CHECK.morningQuestion) + '"</i> ' : '') +
      'Dine svar fra 0 til 10 bliver til en graf her, så du kan følge udviklingen uge for uge.</p>' +
      '<p class="muted small" style="margin:0">Tallene gemmes kun på denne telefon. Du kan altid springe vurderingen over.</p></div>' +
      '<a class="btn" href="#/kategori/' + lastCategory() + '">▶ Start dagens træning</a>';
    return;
  }
  let period = readJson(KEY_STATS_PERIOD, '4u'); if (!['4u', '3m', 'alt'].includes(period)) period = '4u';
  const thisMon = mondayOf(new Date()), thisW = weekInfo(dateKey(thisMon)), lastW = weekInfo(dateKey(addDays(thisMon, -7)));
  let html = statsProgPicker() + '<div class="card"><div class="row-between"><h3 style="margin:0">Smerte over tid</h3></div>' +
    '<div class="seg" role="radiogroup" aria-label="Vælg periode">' + [['4u', '4 uger'], ['3m', '3 måneder'], ['alt', 'Alt']].map(([k, l]) =>
      '<button type="button" role="radio" aria-checked="' + (k === period) + '" class="' + (k === period ? 'sel' : '') + '" data-per="' + k + '">' + l + '</button>').join('') + '</div>' +
    painChart(period) + '</div>';
  html += compareHtml(thisW, lastW, 'Denne uge mod sidste uge');
  html += '<h2>Uge for uge</h2><div class="card wk-list">';
  weeks.slice(-10).reverse().forEach(w => {
    const bar = (v, cls) => '<span class="wbar"><span class="' + cls + '" style="width:' + (v === null ? 0 : v * 10) + '%"></span></span><b class="wnum">' + (v === null ? '–' : dec(v)) + '</b>';
    html += '<div class="wk"><div class="wk-h"><b>' + esc(w.label) + '</b><span class="muted small">' + w.days + ' træningsdage · ' + w.n + (w.n === 1 ? ' måling' : ' målinger') + '</span></div>' +
      (w.morgen.length ? '<div class="wk-r"><small>Morgen</small>' + bar(w.avgMorgen, 's-morgen') + '</div>' : '') +
      '<div class="wk-r"><small>Før</small>' + bar(w.avgFoer, 's-foer') + '</div><div class="wk-r"><small>Efter</small>' + bar(w.avgEfter, 's-efter') + '</div></div>';
  });
  html += '</div>';
  const opts = sel => weeks.slice().reverse().map(w => '<option value="' + w.key + '"' + (w.key === sel ? ' selected' : '') + '>' + esc(w.label) + '</option>').join('');
  const wA = weeks[weeks.length - 1].key, wB = (weeks[weeks.length - 2] || weeks[weeks.length - 1]).key;
  html += '<h2>Sammenlign to uger</h2><div class="card"><div class="cmp-pick"><div><label for="cmpA">Uge</label><select id="cmpA">' + opts(wA) + '</select></div>' +
    '<div><label for="cmpB">mod uge</label><select id="cmpB">' + opts(wB) + '</select></div></div><div id="cmpOut"></div></div>';
  html += '<p class="muted small">Grafen viser dine egne svar fra smertevurderingen. Tallene gemmes kun på denne telefon og deles ikke. Tal med din fysioterapeut, hvis smerten stiger over flere uger.</p>';
  $app.innerHTML = html;
  bindStatsProg();
  $app.querySelectorAll('[data-per]').forEach(b => b.onclick = () => { writeJson(KEY_STATS_PERIOD, b.dataset.per); const y = scrollY; viewStats(); scrollTo(0, y); });
  const upd = () => { const a = weekInfo(document.getElementById('cmpA').value), b = weekInfo(document.getElementById('cmpB').value);
    document.getElementById('cmpOut').innerHTML = compareHtml(a, b, a.label + ' mod ' + b.label).replace('<div class="card cmp">', '<div class="cmp inner">'); };
  document.getElementById('cmpA').onchange = upd; document.getElementById('cmpB').onchange = upd; upd();
}

function encouragement(days) {
  if (days === 0) return 'Ugen er ny – start med én øvelse i dag 💪';
  if (days < 3) return 'God start! Hver gang tæller.';
  if (days < 5) return 'Flot! Du holder en god rytme.';
  return 'Fantastisk! Du er rigtig god til at holde fast.';
}

function viewAdvice(focusId) {
  setHeader('Gode råd', '#/mere'); setTab('raad');
  const read = new Set(readAdvice()); const pct = advicePct();
  let html = (typeof adviceTabs === 'function' ? adviceTabs('artrose') : '') + '<div class="card raad-top"><b>' + (pct === 100 ? '🎉 Du har læst alle de gode råd!' : 'Du har læst ' + read.size + ' af ' + GENERAL_ADVICE.length + ' råd (' + pct + ' %)') + '</b>' +
    '<div class="bar"><span style="width:' + pct + '%"></span></div>' +
    '<p class="muted small" style="margin:8px 0 0">Læs et råd, og tryk "Jeg har læst og forstået". Følg altid de råd, din fysioterapeut har givet dig.</p></div>';
  GENERAL_ADVICE.forEach(a => {
    const r = read.has(a.id);
    html += '<div class="card advice' + (a.warn ? ' stop' : '') + (r ? ' is-read' : '') + '" id="raad-' + a.id + '"><h3>' + esc(a.title) + '</h3><p>' + esc(a.text) + '</p>' +
      '<button type="button" class="readbtn' + (r ? ' on' : '') + '" data-raad="' + a.id + '" aria-pressed="' + r + '">' +
      '<span class="box" aria-hidden="true">' + (r ? '✓' : '') + '</span>' + (r ? 'Læst og forstået' : 'Jeg har læst og forstået') + '</button></div>';
  });
  html += '<p class="muted small">Fysioterapeut Simon Bjerg Lauridsen</p>';
  $app.innerHTML = html;
  if (typeof bindAdviceTabs === 'function') bindAdviceTabs();
  $app.querySelectorAll('[data-raad]').forEach(b => b.onclick = () => {
    const id = b.dataset.raad; const nowRead = toggleAdvice(id);
    const y = window.scrollY; viewAdvice(); window.scrollTo(0, y);
    if (nowRead) {
      const nxt = nextUnreadAdvice();
      toast(nxt ? 'Godt! ' + advicePct() + ' % læst.' : 'Alle råd er læst! 🎉');
      checkBadges();
    }
  });
  if (focusId) {
    const el = document.getElementById('raad-' + focusId);
    if (el) { el.classList.add('focus'); setTimeout(() => el.scrollIntoView({ block: 'start' }), 30); }
  }
}

function viewBadges() {
  setHeader('Mine mærker', '#/uge'); setTab('maerker');
  const store = earnedBadges() || {}; const BL = allBadges(); const n = BL.filter(b => store[b.id]).length;
  let html = '<div class="card hint-card"><b>Du har ' + n + ' af ' + BL.length + ' mærker</b>' +
    '<div class="bar"><span style="width:' + Math.round(n / BL.length * 100) + '%"></span></div>' +
    '<p class="muted small" style="margin:8px 0 0">Mærker fejrer, at du holder fast. Husk: kvalitet og smertereglen går altid forud.</p></div>';
  const card = b => {
    const got = store[b.id]; let when = '';
    if (got) { const [y, m, d] = got.split('-').map(Number); when = 'Opnået ' + d + '. ' + MONTHS[m - 1] + ' ' + y; }
    const prog = got ? '' : badgeProgress(b.id);
    return '<div class="bcard' + (got ? ' got' : ' locked') + '"><div class="bicon" aria-hidden="true">' + b.icon + '</div>' +
      '<b>' + esc(b.name) + '</b><span class="small">' + (got ? esc(when) : '🔒 ' + esc(b.how)) + '</span>' +
      (prog ? '<span class="bprog">' + esc(prog) + '</span>' : '') + '</div>';
  };
  const haelB = BL.filter(b => b.id.startsWith('hael-'));
  html += '<div class="badge-grid">' + BADGES.map(card).join('') + '</div>';
  if (haelB.length) html += '<h2>🦶 Hælspore</h2><div class="badge-grid">' + haelB.map(card).join('') + '</div>';
  $app.innerHTML = html;
}

/* ---------- Redigering ---------- */
function viewEditList() {
  setHeader('Ret øvelser', '#/mere'); setTab('mere');
  let html = '<p class="muted small">Her kan fysioterapeuten tilføje, ændre og slette øvelser. Ændringer gemmes kun på denne telefon/computer.</p>';
  html += '<a class="btn" href="#/rediger/ny">＋ Tilføj ny øvelse</a>';
  CATEGORIES.forEach(c => {
    html += '<h2>' + esc(c.name) + '</h2><div class="card" style="padding:4px 16px">';
    const list = exercises.filter(e => e.category === c.id).sort((x, y) => (Number(x.level) || 1) - (Number(y.level) || 1));
    if (!list.length) html += '<p class="muted" style="margin:12px 0">Ingen øvelser.</p>';
    list.forEach(e => {
      html += '<div class="edit-item"><span class="nm"><small class="lvtag">' + (e.category === 'haelspore' ? 'F' : 'N') + (Number(e.level) || 1) + '</small> ' + esc(e.name) + (e.ownVideo && e.ownVideo.key ? ' <span title="Har egen video">🎬</span>' : safeUrl(e.video) ? ' <span title="Har video">▶</span>' : '') + (Array.isArray(e.photos) && e.photos.length ? ' <span title="Har egne fotos">📷</span>' : '') + '</span>' +
        '<a class="btn small secondary" href="#/rediger/' + encodeURIComponent(e.id) + '">Ret</a>' +
        '<button class="btn small danger" type="button" data-del="' + esc(e.id) + '">Slet</button></div>';
    });
    html += '</div>';
  });
  html += '<h2>Del et program</h2><div class="card">' +
    '<p class="small">Eksportér øvelserne (inkl. niveauer, videolinks, egne fotos og egne videoer op til ' + MAX_EXPORT_VIDEO_MB + ' MB) som en JSON-fil, og send filen til en klient. Klienten importerer den her på siden.</p>' +
    '<button class="btn" id="expBtn" type="button">⬇️ Eksportér øvelser (JSON)</button>' +
    '<label for="impFile" class="btn secondary" style="font-weight:700">⬆️ Importér øvelser fra fil</label>' +
    '<input type="file" id="impFile" accept="application/json,.json" hidden>' +
    '<p class="hint">Ved import kan du vælge at erstatte alle øvelser eller tilføje de nye til de eksisterende.</p></div>';
  html += '<button class="btn danger" id="resetBtn" type="button">Gendan standardøvelser</button>';
  html += '<button class="btn danger" id="clearLogBtn" type="button">Nulstil fremskridt (afkrydsninger, mærker, læste råd, smertemålinger, hælspore-fase)</button>';
  $app.innerHTML = html;

  $app.querySelectorAll('[data-del]').forEach(b => b.onclick = () => {
    const e = exercises.find(x => x.id === b.dataset.del);
    if (e && confirm('Slet øvelsen "' + e.name + '"?')) {
      exercises = exercises.filter(x => x.id !== e.id); saveExercises(exercises); gcMedia();
      toast('Øvelsen er slettet.'); viewEditList();
    }
  });
  document.getElementById('expBtn').onclick = exportJson;
  document.getElementById('impFile').onchange = ev => importJson(ev.target.files[0]);
  document.getElementById('resetBtn').onclick = () => {
    if (confirm('Erstat alle øvelser med standardøvelserne? Egne ændringer går tabt.')) {
      exercises = clone(allDefaults()); saveExercises(exercises); gcMedia(); toast('Standardøvelserne er gendannet.'); viewEditList();
    }
  };
  document.getElementById('clearLogBtn').onclick = () => {
    if (confirm('Slet alle afkrydsninger, mærker, læste råd og smertemålinger på denne enhed?')) { log = {}; saveLog(log); localStorage.removeItem(KEY_RAAD); localStorage.removeItem(KEY_PAIN); ['hjo_hael_fase_v1', 'hjo_hael_start_v1', 'hjo_hael_raad_v1', 'hjo_hael_klar_v1', 'hjo_hael_naaet_v1', 'hjo_hael_skotjek_v1', 'hjo_ryg_v1', 'hjo_ryg_klar_v1'].forEach(k => localStorage.removeItem(k)); writeJson(KEY_BADGES, {}); toast('Fremskridt nulstillet.'); }
  };
}

function viewEditForm(id) {
  const isNew = id === 'ny';
  const e = isNew ? { id: '', name: '', category: 'knae', level: 1, dose: '', steps: [], tips: [], progression: '', stop: PAIN_RULE, video: '', videoSource: '', photos: [], ownVideo: null }
    : exercises.find(x => x.id === id);
  if (!e) { location.hash = '#/rediger'; return; }
  setHeader(isNew ? 'Ny øvelse' : 'Ret øvelse', '#/rediger'); setTab('');
  let photos = Array.isArray(e.photos) ? e.photos.filter(p => p && p.key).map(p => ({ key: String(p.key), caption: String(p.caption || '') })) : [];
  let ownVideo = e.ownVideo && e.ownVideo.key ? Object.assign({}, e.ownVideo) : null;
  const def = allDefaults().find(d => d.id === e.id);
  const lvlOpts = (cat, cur) => cat === 'haelspore' && HAEL_ON
    ? HAEL_PHASES.map(P => '<option value="' + P.n + '"' + (P.n === cur ? ' selected' : '') + '>' + esc(P.name) + '</option>').join('')
    : LEVELS.map(L => '<option value="' + L.n + '"' + (L.n === cur ? ' selected' : '') + '>' + L.name + ' (' + L.sub.toLowerCase() + ')</option>').join('');
  let html = '<form id="exForm" autocomplete="off">' +
    '<label for="f_name">Navn på øvelsen</label><input type="text" id="f_name" required value="' + esc(e.name) + '">' +
    '<label for="f_cat">Område</label><select id="f_cat">' + CATEGORIES.map(c => '<option value="' + c.id + '"' + (c.id === e.category ? ' selected' : '') + '>' + esc(c.name) + '</option>').join('') + '</select>' +
    '<label for="f_level" id="f_level_lbl">' + (e.category === 'haelspore' ? 'Fase' : 'Niveau') + '</label><select id="f_level">' + lvlOpts(e.category, Number(e.level) || 1) + '</select>' +
    '<label for="f_equip">Udstyr (valgfrit)</label><input type="text" id="f_equip" value="' + esc(e.equipment || '') + '" placeholder="Fx en stol og et håndklæde">' +
    '<label for="f_dose">Sæt og gentagelser</label><input type="text" id="f_dose" value="' + esc(e.dose) + '" placeholder="Fx 3 sæt × 10 gentagelser">' +
    '<label for="f_steps">Sådan gør du</label><textarea id="f_steps">' + esc((e.steps || []).join('\n')) + '</textarea><div class="hint">Ét trin per linje.</div>' +
    '<label for="f_tips">Kvalitet – gør det rigtigt</label><textarea id="f_tips">' + esc((e.tips || []).join('\n')) + '</textarea><div class="hint">Ét punkt per linje.</div>' +
    '<label for="f_prog">Lettere eller sværere</label><textarea id="f_prog" style="min-height:90px">' + esc(e.progression) + '</textarea>' +
    '<label for="f_stop">Smerteregel</label><textarea id="f_stop">' + esc(e.stop) + '</textarea>' +
    (e.evidence ? '<div class="card evidence"><b>📚 Evidens (kun til fysioterapeuten)</b><p class="small" style="margin:4px 0 0">' + esc(e.evidence) + '</p></div>' : '') +
    '<fieldset class="media-ed"><legend>📷 Billeder (op til ' + MAX_PHOTOS + ')</legend><div id="photoEd"></div>' +
    '<label for="f_photo" class="btn secondary" id="photoAddLbl">＋ Tilføj egne fotos</label>' +
    '<input type="file" id="f_photo" accept="image/*" multiple hidden>' +
    '<div class="hint">Fotos skaleres ned på telefonen (ca. 900 px) og gemmes kun på denne enhed. Brug fx 1. udgangsstilling, 2. bevægelsen, 3. slutstilling.</div></fieldset>' +
    '<fieldset class="media-ed"><legend>🎬 Video</legend><div id="videoEd"></div>' +
    '<label for="f_video">Link til en videofil (valgfrit, .mp4)</label><input type="url" id="f_video" inputmode="url" placeholder="https://…/video.mp4" value="' + esc(directVideoUrl(e.video)) + '">' +
    '<div class="hint">Kun direkte videofiler (mp4/webm). YouTube-links bruges ikke – øvelserne har en tegnet tempo-film. En egen video (ovenfor) vises før linket.</div>' +
    '<label for="f_vsrc">Videokilde (vises som tekst under videoen)</label><input type="text" id="f_vsrc" placeholder="Fx Artrose Fys (dansk)" value="' + esc(e.videoSource) + '"></fieldset>' +
    '<button class="btn" type="submit" style="margin-top:20px">Gem øvelse</button>' +
    '<a class="btn secondary" href="#/rediger">Annullér</a></form>';
  $app.innerHTML = html;
  document.getElementById('f_cat').onchange = ev => {
    const c = ev.target.value, sel = document.getElementById('f_level'), cur = Math.min(Number(sel.value) || 1, c === 'haelspore' ? 4 : 3);
    sel.innerHTML = lvlOpts(c, cur); document.getElementById('f_level_lbl').textContent = c === 'haelspore' ? 'Fase' : 'Niveau';
  };

  function renderPhotos() {
    const box = document.getElementById('photoEd');
    let h = '';
    if (!photos.length) {
      const std = def ? imagesFor(def) : [];
      h = std.length
        ? '<p class="small media-note">Standardbilleder vises (' + std.length + '). Upload egne fotos for at erstatte dem.</p><div class="std-row">' + std.map((img, i) => '<span class="thumb">' + imgTag(img, capText(img.caption, i), 'loading="lazy"') + '</span>').join('') + '</div>'
        : '<p class="small media-note">Ingen billeder endnu – øvelsen viser en neutral pladsholder.</p>';
    }
    photos.forEach((p, i) => {
      h += '<div class="photo-row"><span class="thumb"><img data-media="' + esc(p.key) + '" alt="Foto ' + (i + 1) + '"></span>' +
        '<div class="photo-fields"><label class="sr" for="cap' + i + '">Billedtekst ' + (i + 1) + '</label>' +
        '<input type="text" id="cap' + i + '" data-cap="' + i + '" value="' + esc(p.caption) + '" placeholder="' + (i + 1) + '. ' + (i === 0 ? 'Udgangsstilling' : 'Bevægelsen') + '">' +
        '<div class="photo-btns"><button type="button" class="btn small secondary" data-up="' + i + '"' + (i === 0 ? ' disabled' : '') + ' aria-label="Flyt foto ' + (i + 1) + ' op">↑</button>' +
        '<button type="button" class="btn small secondary" data-down="' + i + '"' + (i === photos.length - 1 ? ' disabled' : '') + ' aria-label="Flyt foto ' + (i + 1) + ' ned">↓</button>' +
        '<button type="button" class="btn small danger" data-rm="' + i + '">Slet</button></div></div></div>';
    });
    box.innerHTML = h;
    hydrateMedia(box);
    document.getElementById('photoAddLbl').hidden = photos.length >= MAX_PHOTOS;
    box.querySelectorAll('[data-cap]').forEach(inp => inp.oninput = () => { photos[Number(inp.dataset.cap)].caption = inp.value; });
    box.querySelectorAll('[data-up]').forEach(b => b.onclick = () => { const i = Number(b.dataset.up); [photos[i - 1], photos[i]] = [photos[i], photos[i - 1]]; renderPhotos(); });
    box.querySelectorAll('[data-down]').forEach(b => b.onclick = () => { const i = Number(b.dataset.down); [photos[i + 1], photos[i]] = [photos[i], photos[i + 1]]; renderPhotos(); });
    box.querySelectorAll('[data-rm]').forEach(b => b.onclick = () => { if (confirm('Slet foto ' + (Number(b.dataset.rm) + 1) + '?')) { photos.splice(Number(b.dataset.rm), 1); renderPhotos(); } });
  }
  function renderVideo() {
    const box = document.getElementById('videoEd');
    box.innerHTML = ownVideo
      ? '<p class="small media-note">Egen video: <b>' + esc(ownVideo.name || 'video') + '</b>' + (ownVideo.size ? ' (' + dec(ownVideo.size / 1048576) + ' MB)' : '') + '</p>' +
        '<video class="own-video" data-media="' + esc(ownVideo.key) + '" playsinline controls preload="metadata"></video>' +
        '<button type="button" class="btn danger" id="vidRm">Fjern egen video</button>'
      : '<label for="f_vfile" class="btn secondary">＋ Upload egen video (mp4)</label><input type="file" id="f_vfile" accept="video/mp4,video/*" hidden>' +
        '<div class="hint">Kort video (helst under 30 sek.). Afspilles direkte i appen – også uden internet.</div>';
    hydrateMedia(box);
    const rm = document.getElementById('vidRm'); if (rm) rm.onclick = () => { ownVideo = null; renderVideo(); };
    const f = document.getElementById('f_vfile');
    if (f) f.onchange = async () => {
      const file = f.files[0]; if (!file) return;
      if (!/^video\//.test(file.type)) { toast('Vælg en videofil (mp4).'); return; }
      if (file.size > MAX_VIDEO_MB * 1048576) { toast('Videoen er for stor (max ' + MAX_VIDEO_MB + ' MB). Prøv en kortere video.'); return; }
      try {
        const key = newMediaKey('video'); await mediaPut(key, file);
        ownVideo = { key, name: file.name.slice(0, 80), type: file.type, size: file.size }; renderVideo(); toast('Videoen er tilføjet. Husk at gemme.');
      } catch (err) { toast('Videoen kunne ikke gemmes på enheden.'); }
    };
  }
  renderPhotos(); renderVideo();
  document.getElementById('f_photo').onchange = async ev => {
    const files = [...ev.target.files].slice(0, MAX_PHOTOS - photos.length); ev.target.value = '';
    for (const file of files) {
      try {
        const blob = await resizeImage(file); const key = newMediaKey('foto'); await mediaPut(key, blob);
        photos.push({ key, caption: (photos.length + 1) + '. ' + (photos.length === 0 ? 'Udgangsstilling' : '') });
      } catch (err) { toast('Et billede kunne ikke læses.'); }
    }
    renderPhotos();
    if (files.length) toast(files.length === 1 ? 'Foto tilføjet. Husk at gemme.' : files.length + ' fotos tilføjet. Husk at gemme.');
  };
  document.getElementById('exForm').onsubmit = ev => {
    ev.preventDefault();
    const lines = v => v.split('\n').map(s => s.trim()).filter(Boolean);
    const upd = Object.assign({}, isNew ? {} : e, {
      id: e.id,
      name: document.getElementById('f_name').value.trim(),
      category: document.getElementById('f_cat').value,
      level: Number(document.getElementById('f_level').value) || 1,
      dose: document.getElementById('f_dose').value.trim(),
      steps: lines(document.getElementById('f_steps').value),
      tips: lines(document.getElementById('f_tips').value),
      progression: document.getElementById('f_prog').value.trim(),
      stop: document.getElementById('f_stop').value.trim(),
      video: document.getElementById('f_video').value.trim(),
      videoSource: document.getElementById('f_vsrc').value.trim(),
      equipment: document.getElementById('f_equip').value.trim(),
      photos: photos.map(p => ({ key: p.key, caption: p.caption.trim() })),
      ownVideo: ownVideo
    });
    delete upd.illustration; delete upd.images;
    if (!upd.equipment) delete upd.equipment;
    if (!upd.name) { toast('Skriv et navn på øvelsen.'); return; }
    if (upd.video && !directVideoUrl(upd.video)) { toast('Brug et link til en videofil (.mp4) eller upload en egen video. YouTube-links bruges ikke.'); return; }
    upd.video = upd.video ? safeUrl(upd.video) : '';
    if (isNew) {
      let base = upd.category + '-' + slug(upd.name), nid = base, n = 2;
      while (exercises.some(x => x.id === nid)) nid = base + '-' + n++;
      upd.id = nid; exercises.push(upd);
    } else {
      exercises = exercises.map(x => x.id === e.id ? upd : x);
    }
    saveExercises(exercises); gcMedia();
    toast('Øvelsen er gemt.');
    location.hash = '#/rediger';
  };
}
function resizeImage(file, maxW, maxH) {
  maxW = maxW || 900; maxH = maxH || 1200;
  return new Promise((res, rej) => {
    const url = URL.createObjectURL(file); const img = new Image();
    img.onload = () => {
      const s = Math.min(1, maxW / img.naturalWidth, maxH / img.naturalHeight);
      const c = document.createElement('canvas'); c.width = Math.round(img.naturalWidth * s); c.height = Math.round(img.naturalHeight * s);
      const ctx = c.getContext('2d'); ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, c.width, c.height); ctx.drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      c.toBlob(b => b ? res(b) : rej(new Error('Kunne ikke lave JPEG')), 'image/jpeg', 0.82);
    };
    img.onerror = () => { URL.revokeObjectURL(url); rej(new Error('Billedet kunne ikke læses')); };
    img.src = url;
  });
}

/* ---------- Eksport / import ---------- */
function blobToDataUrl(b) { return new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result); r.onerror = () => rej(r.error); r.readAsDataURL(b); }); }
function dataUrlToBlob(s) {
  const m = /^data:([a-z]+\/[a-z0-9.+-]+);base64,(.*)$/i.exec(s); if (!m) return null;
  const bin = atob(m[2]); const arr = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  return new Blob([arr], { type: m[1] });
}
async function exportJson() {
  toast('Forbereder eksport …');
  let skippedVideo = 0; const out = [];
  for (const e of exercises) {
    const x = clone(e); delete x.illustration; delete x.images;
    if (Array.isArray(e.photos) && e.photos.length) {
      x.photos = [];
      for (const p of e.photos) { const b = p && p.key ? await mediaGet(p.key) : null; if (b) x.photos.push({ caption: p.caption || '', data: await blobToDataUrl(b) }); }
    } else delete x.photos;
    if (e.ownVideo && e.ownVideo.key) {
      const b = await mediaGet(e.ownVideo.key);
      if (b && b.size <= MAX_EXPORT_VIDEO_MB * 1048576) x.ownVideo = { name: e.ownVideo.name || 'video.mp4', data: await blobToDataUrl(b) };
      else { delete x.ownVideo; if (b) skippedVideo++; }
    } else delete x.ownVideo;
    out.push(x);
  }
  const data = { app: 'hjemmeoevelser', version: 3, eksporteret: new Date().toISOString(), oevelser: out };
  const json = JSON.stringify(data, null, 2);
  const name = 'hjemmeoevelser-' + dateKey() + '.json';
  if (skippedVideo) alert(skippedVideo + ' egen video er over ' + MAX_EXPORT_VIDEO_MB + ' MB og kommer ikke med i filen.');
  const file = (typeof File === 'function') ? new File([json], name, { type: 'application/json' }) : null;
  if (file && navigator.canShare && navigator.canShare({ files: [file] })) {
    navigator.share({ files: [file], title: 'Hjemmeøvelser' }).catch(() => download(json, name));
  } else {
    download(json, name);
  }
}
function download(json, name) {
  const url = URL.createObjectURL(new Blob([json], { type: 'application/json' }));
  const a = document.createElement('a'); a.href = url; a.download = name;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
  toast('Filen er gemt: ' + name);
}
function validExercise(x) {
  return x && typeof x === 'object' && typeof x.name === 'string' && x.name.trim() &&
    CATEGORIES.some(c => c.id === x.category);
}
/* Gamle felter (fx 'illustration' fra tændstiktegningerne) ignoreres. */
function normalize(x) {
  const arr = v => Array.isArray(v) ? v.map(String).map(s => s.trim()).filter(Boolean) : [];
  const n = {
    id: String(x.id || (x.category + '-' + slug(x.name))),
    name: String(x.name).trim(), category: x.category,
    level: [1, 2, 3].concat(x.category === 'haelspore' ? [4] : []).includes(Number(x.level)) ? Number(x.level) : 1,
    dose: String(x.dose || ''), steps: arr(x.steps), tips: arr(x.tips),
    progression: String(x.progression || ''),
    video: directVideoUrl(x.video), videoSource: String(x.videoSource || ''),
    stop: String(x.stop || ''), photos: [], ownVideo: null
  };
  if (typeof x.equipment === 'string' && x.equipment.trim()) n.equipment = x.equipment.trim();
  if (typeof x.evidence === 'string' && x.evidence.trim()) n.evidence = x.evidence.trim();
  if (x.videoLang === 'da' || x.videoLang === 'en') n.videoLang = x.videoLang;
  if (Array.isArray(x.phases)) { const ph = x.phases.map(Number).filter(v => [1, 2, 3, 4].includes(v)); if (ph.length) n.phases = ph; }
  if (Array.isArray(x.images)) n.images = x.images.filter(i => i && validImgSrc(i.src)).slice(0, MAX_PHOTOS).map(i => ({ src: i.src, caption: String(i.caption || '') }));
  return n;
}
async function importMedia(x, n) {
  if (Array.isArray(x.photos)) {
    for (const p of x.photos.slice(0, MAX_PHOTOS)) {
      const b = p && typeof p.data === 'string' && /^data:image\/(jpeg|png|webp);base64,/.test(p.data) ? dataUrlToBlob(p.data) : null;
      if (b) { const key = newMediaKey('foto'); await mediaPut(key, b); n.photos.push({ key, caption: String(p.caption || '') }); }
    }
  }
  const v = x.ownVideo;
  if (v && typeof v.data === 'string' && /^data:video\/(mp4|webm|quicktime|x-m4v);base64,/.test(v.data)) {
    const b = dataUrlToBlob(v.data); if (b) { const key = newMediaKey('video'); await mediaPut(key, b); n.ownVideo = { key, name: String(v.name || 'video.mp4').slice(0, 80), type: b.type, size: b.size }; }
  }
}
function importJson(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = async () => {
    let data;
    try { data = JSON.parse(reader.result); } catch (e) { alert('Filen kunne ikke læses. Er det en JSON-fil fra appen?'); return; }
    const list = Array.isArray(data) ? data : data && data.oevelser;
    if (!Array.isArray(list)) { alert('Filen indeholder ingen øvelser.'); return; }
    const raw = list.filter(validExercise);
    if (!raw.length) { alert('Ingen gyldige øvelser fundet i filen.'); return; }
    const replace = confirm('Fundet ' + raw.length + ' øvelser.\n\nOK = erstat alle nuværende øvelser\nAnnullér = tilføj dem til de nuværende');
    const good = [];
    for (const x of raw) { const n = normalize(x); try { await importMedia(x, n); } catch (err) { /* fortsæt uden medier */ } good.push(n); }
    if (replace) {
      exercises = good;
    } else {
      good.forEach(g => {
        const i = exercises.findIndex(x => x.id === g.id);
        if (i >= 0) exercises[i] = g; else exercises.push(g);
      });
    }
    saveExercises(exercises); gcMedia();
    toast(good.length + ' øvelser importeret.');
    viewEditList();
  };
  reader.readAsText(file);
}

/* ---------- Router ---------- */
function route() {
  const parts = (location.hash || '#/').replace(/^#\/?/, '').split('/').map(decodeURIComponent);
  window.scrollTo(0, 0);
  document.querySelectorAll('canvas.confetti, .celebrate, .routine').forEach(c => c.remove());
  closeOverlays();
  if (!uiMode()) return viewOnboarding();
  document.body.classList.remove('onboarding');
  switch (parts[0]) {
    case '': return viewHome();
    case 'velkommen': return viewOnboarding();
    case 'programmer': return viewPrograms();
    case 'mere': return viewMore();
    case 'ryg': case 'led': return viewRygSub(parts[1], parts[2]);
    case 'omraade': return viewArea(parts[1]);
    case 'kategori': return viewCategory(parts[1]);
    case 'oevelse': return viewExercise(parts.slice(1).join('/'));
    case 'uge': return viewWeek();
    case 'raad': return parts[1] === 'hael' && HAEL_ON ? viewHaelInfo(parts[2]) : viewAdvice(parts[1]);
    case 'maerker': return viewBadges();
    case 'smerte': return viewStats();
    case 'hael': return viewHaelSub(parts[1]);
    case 'paamindelser': return viewReminders();
    case 'rediger': return parts[1] ? viewEditForm(parts.slice(1).join('/')) : viewEditList();
    default: return viewHome();
  }
}
applyDisplay();
checkBadges(false);
window.addEventListener('hashchange', route);
window.addEventListener('storage', () => { exercises = loadExercises(); log = loadLog(); route(); });
route();
setTimeout(() => { gcMedia().catch(() => {}); }, 3000);
remindSchedule();

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
}
