/* Hælspore-sporet: faser, 12-ugers plan, infosider, morgenrutine, morgensmerte, "Klar til næste fase?" og mærker.
   Indlæses efter data.js og data-haelspore.js og før app.js. Bruger hjælpefunktioner fra app.js, når funktionerne kaldes.
   Gemmer kun brugerens egne værdier lokalt (localStorage). */
'use strict';

const HAEL_ON = typeof HAEL_CATEGORY !== 'undefined';
const KEY_HAEL_FASE = 'hjo_hael_fase_v1';
const KEY_HAEL_START = 'hjo_hael_start_v1';
const KEY_HAEL_RAAD = 'hjo_hael_raad_v1';
const KEY_HAEL_KLAR = 'hjo_hael_klar_v1';
const KEY_HAEL_NAAET = 'hjo_hael_naaet_v1';
const KEY_HAEL_SKO = 'hjo_hael_skotjek_v1';
const HAEL_ROUTINE_ID = 'hael-morgenrutine';
const HAEL_ANATOMY_IMG = 'images/hael-info/anatomi.webp';

if (HAEL_ON && !CATEGORIES.some(c => c.id === HAEL_CATEGORY.id)) {
  CATEGORIES.forEach(c => { if (c.id === 'balance') c.small = false; }); // 2 × 2-gitter på forsiden
  CATEGORIES.push({ id: HAEL_CATEGORY.id, name: HAEL_CATEGORY.short || HAEL_CATEGORY.name, icon: HAEL_CATEGORY.icon, phases: true });
}

function haelUsed() { return HAEL_ON && (!!localStorage.getItem(KEY_HAEL_START) || localStorage.getItem('hjo_sidst_kat_v1') === 'haelspore'); }
function haelEnsureStart() { if (HAEL_ON && !localStorage.getItem(KEY_HAEL_START)) localStorage.setItem(KEY_HAEL_START, dateKey()); }
function haelPhase() { const n = Number(readJson(KEY_HAEL_FASE, 1)); return n >= 1 && n <= 4 ? n : 1; }
function haelSetPhase(n) { writeJson(KEY_HAEL_FASE, Math.max(1, Math.min(4, n))); }
function haelPhaseObj(n) { return HAEL_PHASES[(n || haelPhase()) - 1]; }
function haelWeekNo() {
  const s = localStorage.getItem(KEY_HAEL_START); if (!s) return 1;
  const [y, m, d] = s.split('-').map(Number); const days = Math.floor((new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()) - new Date(y, m - 1, d)) / 86400000);
  return Math.max(1, Math.floor(days / 7) + 1);
}
/* Ugekort: beregnet ud fra startdato, men aldrig en uge fra en anden fase end den aktuelle. */
function haelCurrentWeek() {
  const f = haelPhase(), n = Math.min(haelWeekNo(), HAEL_WEEKS.length);
  let w = HAEL_WEEKS[n - 1];
  if (w.phase > f) w = HAEL_WEEKS.filter(x => x.phase === f).slice(-1)[0];
  else if (w.phase < f) w = HAEL_WEEKS.find(x => x.phase === f);
  return w;
}
/* Øvelser i den aktuelle fase (rækkefølgen fra HAEL_PHASES) + egne hælspore-øvelser på samme fase. */
function haelPhaseExercises(n) {
  const f = n || haelPhase(); const ids = haelPhaseObj(f).exercises;
  const list = ids.map(id => exercises.find(e => e.id === id)).filter(Boolean);
  exercises.forEach(e => { if (e.category === 'haelspore' && !ids.includes(e.id) && !HAEL_EXERCISES.some(h => h.id === e.id) && (Number(e.level) || 1) === f) list.push(e); });
  return list;
}
function haelPhaseSteps(f, small) {
  return '<div class="phase-steps' + (small ? ' small' : '') + '" aria-label="Fase ' + f + ' af 4">' + HAEL_PHASES.map(p =>
    '<span class="ps' + (p.n === f ? ' cur' : p.n < f ? ' done' : '') + '" style="--pc:' + p.color + '">' + (small ? '' : '<b>' + p.n + '</b>') + '</span>').join('') + '</div>';
}

/* ---------- Morgensmerte ---------- */
function haelMorningValues(days) {
  const out = []; for (let i = days; i >= 1; i--) { const k = dateKey(addDays(new Date(), -i)); const r = painLog().find(x => x.dato === k && x.program === 'haelspore'); if (r && typeof r.morgen === 'number') out.push(r.morgen); }
  return out;
}
function haelMorningToday() { const r = painToday('haelspore'); return r && typeof r.morgen === 'number' ? r.morgen : null; }
function haelMorningTrend(v) {
  const prev = haelMorningValues(7).slice(-7); if (prev.length < 3) return null;
  const a = prev.reduce((s, x) => s + x, 0) / prev.length, diff = v - a;
  return Object.assign({ diff, avg: a }, HAEL_PAIN_CHECK.morningTrend.find(t => diff <= t.diffMax) || HAEL_PAIN_CHECK.morningTrend.slice(-1)[0]);
}
function haelLoadLevel(v) {
  if (v === null || v === undefined) return null;
  const t = haelMorningTrend(v), diff = t ? t.diff : 0;
  const L = HAEL_LOAD_GUIDE.levels;
  if (v >= 6 || diff >= 2) return L[2];
  if (v <= 2 || (t && diff <= 0)) return L[0];
  return L[1];
}
function haelMorningAsk(then) {
  painAsk(HAEL_PAIN_CHECK.morningQuestion, v => {
    savePain('haelspore', { morgen: v });
    if (v === null) { if (then) then(); return; }
    const t = haelMorningTrend(v), L = haelLoadLevel(v);
    const m = openModal('<h2 id="mTitle">Morgensmerte: ' + v + '</h2>' +
      (t ? '<div class="pain-fb fb-' + t.tone + ' slim"><p>' + esc(t.text) + '</p></div>' : '<p class="muted center">Når du har målt et par morgener, kan du se, om det går den rigtige vej.</p>') +
      '<div class="tl-card tl-' + L.tone + '"><b>' + esc(HAEL_LOAD_GUIDE.title) + '</b><span class="tl-label">' + esc(L.label) + '</span><p>' + esc(L.text) + '</p></div>' +
      '<button type="button" class="btn" id="mOk">OK</button>');
    m.querySelector('#mOk').onclick = () => { closeModal(m); route(); if (then) then(); };
  }, true);
}
/* Spørg om morgensmerte første gang appen åbnes på dagen, når hælsporet er i brug. */
function haelMaybeAskMorning() {
  if (!haelUsed() || document.querySelector('.modal, .celebrate, .routine')) return;
  const r = painToday('haelspore'); if (r && 'morgen' in r) return;
  haelMorningAsk();
}

/* ---------- Morgenrutine (fuldskærm, nedtælling) ---------- */
function haelRoutineDoneToday() { return (log[dateKey()] || []).includes(HAEL_ROUTINE_ID); }
function haelRoutineDays() { return Object.keys(log).filter(k => (log[k] || []).includes(HAEL_ROUTINE_ID)).length; }
function haelOpenRoutine() {
  const R = HAEL_MORNING_ROUTINE, steps = R.steps; let i = -1, left = 0, timer = null, paused = false, lock = null;
  const hasAnim = s => !!(s && s.anim && s.sec && typeof RoutineAnim !== 'undefined');
  // Ét ur pr. trin: både nedtællingen og animationen læser det, så de starter, pauser og stopper sammen.
  const clock = { acc: 0, t0: 0, running: false };
  const clockMs = () => clock.acc + (clock.running ? performance.now() - clock.t0 : 0);
  const clockStart = () => { clock.acc = 0; clock.t0 = performance.now(); clock.running = true; };
  const clockPause = () => { if (clock.running) { clock.acc = clockMs(); clock.running = false; } };
  const clockResume = () => { if (!clock.running) { clock.t0 = performance.now(); clock.running = true; } };
  const box = document.createElement('div'); box.className = 'routine'; box.setAttribute('role', 'dialog'); box.setAttribute('aria-modal', 'true'); box.setAttribute('aria-label', R.title);
  document.body.appendChild(box); document.body.classList.add('noscroll');
  try { if (navigator.wakeLock) navigator.wakeLock.request('screen').then(l => { lock = l; }).catch(() => {}); } catch (e) { /* ikke understøttet */ }
  const buzz = () => { try { if (navigator.vibrate && !prefersReducedMotion()) navigator.vibrate(150); } catch (e) { /* */ } };
  const stopAnim = () => { if (typeof RoutineAnim !== 'undefined') RoutineAnim.stop(); };
  const close = () => { clearInterval(timer); stopAnim(); if (typeof Voice !== 'undefined') Voice.cancel(); if (lock) lock.release().catch(() => {}); box.remove(); document.body.classList.remove('noscroll'); };
  const ring = (frac) => { const r = 54, c = 2 * Math.PI * r; return '<svg class="r-ring" viewBox="0 0 128 128" aria-hidden="true"><circle cx="64" cy="64" r="' + r + '" class="bg"/><circle cx="64" cy="64" r="' + r + '" class="fg" stroke-dasharray="' + (c * frac) + ' ' + c + '"/></svg>'; };
  const soundBtn = () => '<button type="button" class="r-sound" id="rSound" aria-pressed="' + RoutineAnim.soundOn() + '" aria-label="Klik-lyd i takt">' + (RoutineAnim.soundOn() ? '🔊 Lyd til' : '🔇 Lyd fra') + '</button>';
  function render() {
    stopAnim(); box.classList.remove('has-anim');
    if (i < 0) {
      box.innerHTML = '<div class="r-top"><span>🌅 ' + esc(R.title) + '</span><button type="button" class="r-close" aria-label="Luk">✕</button></div>' +
        '<div class="r-body"><p class="r-sub">' + esc(R.subtitle) + '</p><ol class="r-list">' + steps.map(s => '<li>' + esc(s.text) + (s.sec ? ' <small>(' + s.sec + ' sek.)</small>' : '') + '</li>').join('') + '</ol>' +
        '<p class="r-sub small">▶ En tegnet film viser tempoet for hver øvelse, mens tiden tæller ned. Følg foden i filmen.</p></div>' +
        '<div class="r-foot"><button type="button" class="btn r-go" id="rStart">▶ Start</button></div>';
    } else if (i >= steps.length) {
      box.innerHTML = '<div class="r-top"><span>🌅 ' + esc(R.title) + '</span><button type="button" class="r-close" aria-label="Luk">✕</button></div>' +
        '<div class="r-body center"><div class="r-done">✓</div><h2>Godt gået!</h2><p class="r-text">Morgenrutinen er lavet. Nu er foden klar til de første skridt.</p><p class="r-sub">' + esc(R.extra) + '</p></div>' +
        '<div class="r-foot"><button type="button" class="btn r-go" id="rFinish">Færdig</button></div>';
    } else {
      const s = steps[i], anim = hasAnim(s);
      const timerHtml = s.sec ? '<div class="r-timer' + (anim ? ' sm' : '') + '">' + ring(left / s.sec) + '<span class="r-sec" aria-live="off">' + left + '</span></div>' : '<div class="r-done small">👟</div>';
      box.innerHTML = '<div class="r-top"><span>Trin ' + (i + 1) + ' af ' + steps.length + '</span><span class="r-top-r">' + (anim ? soundBtn() : '') + '<button type="button" class="r-close" aria-label="Luk">✕</button></span></div>' +
        (anim
          ? '<div class="r-body center r-anim-body">' + RoutineAnim.markup(s).replace('<div class="r-count">', '<div class="r-meta">' + timerHtml + '<div class="r-count">') + '</div>' +
            '<p class="r-text sm">' + esc(s.text) + '</p>' + (paused ? '<p class="r-paused">⏸ Pause – filmen og tiden står stille</p>' : '') + '</div>'
          : '<div class="r-body center">' + timerHtml + '<p class="r-text">' + esc(s.text) + '</p></div>') +
        '<div class="r-foot">' + (s.sec ? '<button type="button" class="btn secondary r-btn" id="rPause">' + (paused ? '▶ Fortsæt' : '⏸ Pause') + '</button>' : '') +
        '<button type="button" class="btn r-go" id="rNext">' + (i === steps.length - 1 ? 'Færdig ✓' : 'Næste ›') + '</button></div>';
      if (anim) {
        box.classList.add('has-anim');
        const a = box.querySelector('.r-anim'); a.classList.toggle('paused', paused);
        if (paused) RoutineAnim.draw(box, s, clockMs() / 1000); else RoutineAnim.start(box, s, clockMs);
        const sb = box.querySelector('#rSound'); if (sb) sb.onclick = () => { RoutineAnim.setSound(!RoutineAnim.soundOn()); render(); const n = box.querySelector('#rSound'); if (n) n.focus(); };
      }
    }
    box.querySelector('.r-close').onclick = close;
    if (typeof Voice !== 'undefined') Voice.bind(box);
    if (i >= 0 && i < steps.length && !box.querySelector('.ff-say')) { const b = box.querySelector('.r-body'); if (b) b.insertAdjacentHTML('beforeend', '<p class="ff-say" hidden></p>'); }
    const st = box.querySelector('#rStart'); if (st) st.onclick = () => go(0);
    const nx = box.querySelector('#rNext'); if (nx) nx.onclick = () => go(i + 1);
    const ps = box.querySelector('#rPause'); if (ps) ps.onclick = () => { paused = !paused; if (paused) { clockPause(); if (typeof Voice !== 'undefined') Voice.cancel(); } else clockResume(); render(); };
    const fi = box.querySelector('#rFinish'); if (fi) fi.onclick = () => {
      const k = dateKey(); const arr = log[k] || []; if (!arr.includes(HAEL_ROUTINE_ID)) { arr.push(HAEL_ROUTINE_ID); log[k] = arr; saveLog(log); }
      haelEnsureStart(); close(); toast('Morgenrutinen er krydset af. 🌅'); route(); checkBadges();
    };
    const f = box.querySelector('.r-go, #rNext'); if (f && document.activeElement && document.activeElement.id !== 'rSound') f.focus();
  }
  function tickTimer() {
    if (i < 0 || i >= steps.length || !steps[i].sec) return;
    const total = steps[i].sec, el = clockMs() / 1000;
    if (el >= total) { go(i + 1); return; }
    const nl = Math.max(1, total - Math.floor(el));
    if (nl !== left) {
      left = nl; const sec = box.querySelector('.r-sec');
      if (sec) { sec.textContent = left; const fg = box.querySelector('.r-ring .fg'); if (fg) { const c = 2 * Math.PI * 54; fg.setAttribute('stroke-dasharray', (c * left / total) + ' ' + c); } }
    }
  }
  function go(n) {
    clearInterval(timer); stopAnim(); i = n; paused = false; if (i > 0) buzz();
    if (i < steps.length && steps[i].sec) { left = steps[i].sec; clockStart(); timer = setInterval(tickTimer, 100); }
    else { clock.running = false; clock.acc = 0; }
    render();
    if (typeof Voice !== 'undefined') { box._voice = null; if (i >= 0 && i < steps.length) Voice.say(steps[i].text, box, { flush: true, intro: !!hasAnim(steps[i]) }); else if (i >= steps.length) Voice.say('Godt gået! Morgenrutinen er lavet.', box, { flush: true }); }
  }
  render();
}

/* ---------- Programsiden for hælspore ---------- */
function viewHael() {
  setHeader(HAEL_CATEGORY.short || 'Hælspore', '#/programmer'); setTab('prog');
  localStorage.setItem('hjo_sidst_kat_v1', 'haelspore'); haelEnsureStart();
  const f = haelPhase(), P = haelPhaseObj(f), w = haelCurrentWeek(), list = haelPhaseExercises(f);
  const mv = haelMorningToday(), L = haelLoadLevel(mv);
  let h = '<p class="muted small" style="margin-bottom:10px">' + esc(HAEL_CATEGORY.intro) + '</p>';
  h += '<div class="card phase-card" style="--pc:' + P.color + '"><div class="row-between"><b>' + esc(P.name) + '</b><span class="muted small">' + esc(P.weeks) + '</span></div>' +
    haelPhaseSteps(f) + '<p class="small" style="margin:8px 0 0">🎯 ' + esc(P.goal) + '</p>' +
    '<details class="phase-pick"><summary>Skift fase manuelt</summary><p class="hint">Brug helst tjeklisten "Klar til næste fase?". Din fysioterapeut kan også hjælpe dig med at vælge.</p><div class="levels four">' +
    HAEL_PHASES.map(p => '<button type="button" class="lvl' + (p.n === f ? ' sel' : '') + '" data-fase="' + p.n + '"><b>Fase ' + p.n + '</b><span>' + esc(p.name.split(': ')[1] || '') + '</span></button>').join('') + '</div></details></div>';
  h += '<button type="button" class="btn routine-btn' + (haelRoutineDoneToday() ? ' done' : '') + '" id="routineBtn">' + (haelRoutineDoneToday() ? '✓ Morgenrutinen er lavet i dag' : '🌅 Morgenrutine – 2 min') + '</button>';
  h += '<a class="card tl-card tl-' + (L ? L.tone : 'none') + '" href="#/hael/trafiklys"><b>🚦 ' + esc(HAEL_LOAD_GUIDE.title) + '</b>' +
    (L ? '<span class="tl-label">Morgensmerte ' + mv + ' · ' + esc(L.label) + '</span><p>' + esc(L.text) + '</p>' : '<p>Registrér morgensmerten (de første skridt), så får du dagens trafiklys.</p>') + '</a>';
  if (mv === null) h += '<button type="button" class="btn secondary" id="morningBtn">🌡️ ' + esc(HAEL_PAIN_CHECK.morningQuestion) + '</button>';
  h += '<div class="card week-card"><div class="row-between"><h3 style="margin:0">📅 Denne uge: ' + esc(w.title) + '</h3></div><p class="muted small" style="margin:2px 0 8px">Uge ' + w.week + ' af 12 · Fase ' + w.phase + (haelWeekNo() > 12 ? ' · Du er forbi de 12 uger – fortsæt med vedligehold' : '') + '</p>' +
    '<p class="wk-lbl">Hver dag</p><ul class="tips">' + w.daily.map(x => '<li>' + esc(x) + '</li>').join('') + '</ul>' +
    (w.everyOtherDay ? '<p class="wk-lbl">Hver 2. dag</p><ul class="tips">' + w.everyOtherDay.map(x => '<li>' + esc(x) + '</li>').join('') + '</ul>' : '') +
    '<p class="wk-lbl">Gang og belastning</p><p class="small">' + esc(w.load) + '</p><p class="tip-line">💡 ' + esc(w.tip) + '</p>' +
    '<a class="linkbtn" href="#/hael/plan">Se hele 12-ugers planen ›</a></div>';
  h += '<h2>Øvelser i fase ' + f + '</h2>';
  list.forEach(e => {
    const d = doneToday(e.id);
    h += '<a class="ex-item' + (d ? ' done' : '') + '" href="#/oevelse/' + encodeURIComponent(e.id) + '">' + thumbHtml(e) +
      '<div class="txt"><strong>' + esc(e.name) + '</strong><span>' + esc(shortDose(e.dose)) + '</span></div>' +
      (d ? '<span class="check" aria-label="Lavet i dag">✓</span>' : '<span class="check" aria-hidden="true" style="color:#8a857a">›</span>') + '</a>';
  });
  if (needsAfter('haelspore') && list.some(e => doneToday(e.id))) h += '<button type="button" class="btn finish" id="finishBtn">✓ ' + esc(PAIN_CHECK.finishButton) + '</button>';
  h += '<a class="card hint-card ready-card" href="#/hael/klar"><h3>' + (f < 4 ? '🎯 Klar til fase ' + (f + 1) + '?' : '🏁 Har du nået målet?') + '</h3><p class="small" style="margin:0">Tjek kriterierne – hælen bestemmer tempoet, ikke kalenderen. ›</p></a>';
  h += '<h2>Værktøjer</h2><div class="tool-grid">' +
    '<a class="tool" href="#/raad/hael"><span>📖</span>Om hælspore</a>' +
    '<button type="button" class="tool" id="flareBtn"><span>🆘</span>Dårlig dag?</button>' +
    '<a class="tool" href="#/hael/skotjek"><span>👟</span>Skotjek</a>' +
    '<a class="tool" href="#/hael/myter"><span>💬</span>Myter og fakta</a>' +
    '<a class="tool" href="#/hael/hjaelpemidler"><span>🩹</span>Hjælpemidler</a>' +
    '<a class="tool" href="#/smerte"><span>📈</span>Min smerte</a></div>';
  $app.innerHTML = h;
  hydrateMedia($app);
  $app.querySelectorAll('[data-fase]').forEach(b => b.onclick = () => {
    const n = Number(b.dataset.fase); if (n === f) return;
    if (confirm('Skift til fase ' + n + '? ' + (n > f ? 'Gør det helst kun efter aftale med din fysioterapeut eller når tjeklisten er opfyldt.' : ''))) { haelSetPhase(n); viewHael(); }
  });
  document.getElementById('routineBtn').onclick = haelOpenRoutine;
  const mb = document.getElementById('morningBtn'); if (mb) mb.onclick = () => haelMorningAsk();
  document.getElementById('flareBtn').onclick = haelFlareModal;
  const fb = document.getElementById('finishBtn'); if (fb) fb.onclick = () => painAfter('haelspore', () => checkBadges());
}
function haelFlareModal() {
  const m = openModal('<h2 id="mTitle">🆘 ' + esc(HAEL_FLARE_PLAN.title) + '</h2><ol class="steps flare">' + HAEL_FLARE_PLAN.steps.map(s => '<li>' + esc(s) + '</li>').join('') + '</ol>' +
    '<button type="button" class="btn" id="mOk">OK</button>');
  m.querySelector('#mOk').onclick = () => closeModal(m);
}

/* ---------- Undersider: plan, klar, skotjek, myter, trafiklys, hjælpemidler ---------- */
function viewHaelSub(sub) {
  if (!HAEL_ON) { location.hash = '#/'; return; }
  const back = '#/kategori/haelspore'; setTab('prog');
  const f = haelPhase();
  let h = '';
  if (sub === 'plan') {
    setHeader('12-ugers planen', back);
    const cur = haelCurrentWeek().week;
    h += '<p class="muted small">Et typisk forløb. Du rykker kun videre til næste fase, når kriterierne er opfyldt – ellers gentager du ugen.</p>';
    HAEL_PHASES.forEach(P => {
      h += '<h2 class="ph-h" style="--pc:' + P.color + '">' + esc(P.name) + ' <small>' + esc(P.weeks) + '</small></h2>';
      HAEL_WEEKS.filter(w => w.phase === P.n).forEach(w => {
        h += '<details class="card plan-week' + (w.week === cur ? ' cur' : '') + '"' + (w.week === cur ? ' open' : '') + '><summary><b>Uge ' + w.week + '</b> · ' + esc(w.title) + (w.week === cur ? ' <span class="badge">Nu</span>' : '') + '</summary>' +
          '<p class="wk-lbl">Hver dag</p><ul class="tips">' + w.daily.map(x => '<li>' + esc(x) + '</li>').join('') + '</ul>' +
          (w.everyOtherDay ? '<p class="wk-lbl">Hver 2. dag</p><ul class="tips">' + w.everyOtherDay.map(x => '<li>' + esc(x) + '</li>').join('') + '</ul>' : '') +
          '<p class="wk-lbl">Gang og belastning</p><p class="small">' + esc(w.load) + '</p><p class="tip-line">💡 ' + esc(w.tip) + '</p></details>';
      });
    });
  } else if (sub === 'klar') {
    setHeader(f < 4 ? 'Klar til fase ' + (f + 1) + '?' : 'Har du nået målet?', back);
    const P = haelPhaseObj(f); let st = readJson(KEY_HAEL_KLAR, null);
    if (!st || st.dato !== dateKey() || st.fase !== f) st = { dato: dateKey(), fase: f, checked: [] };
    const all = st.checked.length === P.criteria.length;
    h += '<div class="card phase-card" style="--pc:' + P.color + '"><b>' + esc(P.name) + '</b>' + haelPhaseSteps(f) +
      '<p class="small" style="margin:8px 0 0">Kryds af, hvad der passer på dig i dag. Afkrydsningerne gemmes kun i dag.</p></div>';
    h += '<div class="card">' + P.criteria.map((c, i) => {
      const on = st.checked.includes(i);
      return '<button type="button" class="readbtn crit' + (on ? ' on' : '') + '" data-crit="' + i + '" aria-pressed="' + on + '"><span class="box" aria-hidden="true">' + (on ? '✓' : '') + '</span>' + esc(c) + '</button>';
    }).join('') + '</div>';
    if (all && f < 4) h += '<div class="card ready ok"><p>' + esc(HAEL_READY_TEXT.allChecked) + '</p><button type="button" class="btn" id="nextPhase">Ryk til fase ' + (f + 1) + ' ›</button></div>';
    else if (all) h += '<div class="card ready ok"><p>Flot! Du har nået målet. Hold hælen stærk med tungt hæløft 1–2 gange om ugen.</p></div>';
    else h += '<div class="card ready"><p>' + esc(HAEL_READY_TEXT.notYet) + '</p></div>';
    if (haelShouldStepBack() && f > 1) h += '<div class="card stop"><h3>Værre i en uges tid?</h3><p>' + esc(HAEL_READY_TEXT.stepBack) + '</p><button type="button" class="btn secondary" id="prevPhase">‹ Gå tilbage til fase ' + (f - 1) + '</button></div>';
    $app.innerHTML = h;
    $app.querySelectorAll('[data-crit]').forEach(b => b.onclick = () => {
      const i = Number(b.dataset.crit); const k = st.checked.indexOf(i); if (k >= 0) st.checked.splice(k, 1); else st.checked.push(i);
      writeJson(KEY_HAEL_KLAR, st); const y = scrollY; viewHaelSub('klar'); scrollTo(0, y);
    });
    const np = document.getElementById('nextPhase'); if (np) np.onclick = () => {
      haelSetPhase(f + 1); writeJson(KEY_HAEL_NAAET, Math.max(Number(readJson(KEY_HAEL_NAAET, 1)) || 1, f + 1)); localStorage.removeItem(KEY_HAEL_KLAR);
      toast('Du er nu i fase ' + (f + 1) + '. Start forsigtigt.'); location.hash = back; setTimeout(() => checkBadges(), 300);
    };
    const pp = document.getElementById('prevPhase'); if (pp) pp.onclick = () => { haelSetPhase(f - 1); toast('Du er tilbage i fase ' + (f - 1) + '. Klogt valgt.'); location.hash = back; };
    return;
  } else if (sub === 'skotjek') {
    setHeader('Skotjek', back);
    const S = HAEL_SHOE_CHECKLIST, got = readJson(KEY_HAEL_SKO, []);
    h += '<div class="card"><h3>👟 ' + esc(S.title) + '</h3><p class="muted small">Tag dine mest brugte sko frem, og kryds af.</p>' +
      S.items.map((it, i) => { const on = got.includes(i); return '<button type="button" class="readbtn crit' + (on ? ' on' : '') + '" data-sko="' + i + '" aria-pressed="' + on + '"><span class="box" aria-hidden="true">' + (on ? '✓' : '') + '</span>' + esc(it) + '</button>'; }).join('') +
      '<p class="small" style="margin:12px 0 0"><b>' + got.length + ' af ' + S.items.length + '</b> punkter opfyldt.</p></div>' +
      '<div class="card stop"><h3>Undgå</h3><ul class="tips">' + S.avoid.map(a => '<li>' + esc(a) + '</li>').join('') + '</ul></div>';
    $app.innerHTML = h;
    $app.querySelectorAll('[data-sko]').forEach(b => b.onclick = () => {
      const i = Number(b.dataset.sko), arr = readJson(KEY_HAEL_SKO, []), k = arr.indexOf(i); if (k >= 0) arr.splice(k, 1); else arr.push(i);
      writeJson(KEY_HAEL_SKO, arr); const y = scrollY; viewHaelSub('skotjek'); scrollTo(0, y); checkBadges();
    });
    return;
  } else if (sub === 'myter') {
    setHeader('Myter og fakta', back);
    h += '<p class="muted small">Tryk på et kort for at se fakta.</p>' + HAEL_MYTHS.map((m, i) =>
      '<button type="button" class="myth" data-myth="' + i + '" aria-expanded="false"><span class="m-tag">Myte</span><span class="m-text">' + esc(m.myth) + '</span><span class="m-fact" hidden><span class="m-tag fact">Fakta</span>' + esc(m.fact) + '</span><span class="m-hint">Tryk for fakta ›</span></button>').join('');
    $app.innerHTML = h;
    $app.querySelectorAll('[data-myth]').forEach(b => b.onclick = () => {
      const open = b.getAttribute('aria-expanded') !== 'true'; b.setAttribute('aria-expanded', open); b.classList.toggle('open', open);
      b.querySelector('.m-fact').hidden = !open; b.querySelector('.m-hint').textContent = open ? 'Tryk for at skjule' : 'Tryk for fakta ›';
    });
    return;
  } else if (sub === 'trafiklys') {
    setHeader('Hvor meget må jeg gå?', back);
    const mv = haelMorningToday(), L = haelLoadLevel(mv);
    h += '<p class="muted small">' + esc(HAEL_LOAD_GUIDE.intro) + '</p>';
    h += HAEL_LOAD_GUIDE.levels.map(x => '<div class="card tl-card tl-' + x.tone + (L && L.tone === x.tone ? ' cur' : '') + '"><span class="tl-label">' + esc(x.label) + (L && L.tone === x.tone ? ' · I dag' : '') + '</span><p>' + esc(x.text) + '</p></div>').join('');
    h += mv === null ? '<button type="button" class="btn" id="morningBtn">🌡️ ' + esc(HAEL_PAIN_CHECK.morningQuestion) + '</button>' : '<p class="small">Dagens morgensmerte: <b>' + mv + '</b> (0–10).</p>';
    h += '<p class="hint">' + esc(HAEL_LOAD_GUIDE.stepsHint) + '</p>';
    $app.innerHTML = h;
    const mb = document.getElementById('morningBtn'); if (mb) mb.onclick = () => haelMorningAsk();
    return;
  } else if (sub === 'hjaelpemidler') {
    setHeader('Hjælpemidler', back);
    HAEL_AIDS.forEach(a => {
      h += '<div class="card"><h3>' + esc(a.name) + '</h3><p>' + esc(a.text) + '</p><p class="small muted">Hvornår: ' + esc(a.when) + '</p>' +
        (a.video ? videoHtml({ id: a.id, video: a.video, videoSource: a.videoSource, videoLang: a.videoLang, videoAlt: a.videoAlt }) : '') + '</div>';
    });
    $app.innerHTML = h; initVideo($app);
    return;
  } else { location.hash = back; return; }
  $app.innerHTML = h;
}
/* Morgensmerten tydeligt værre (≥ 2 point over tidligere niveau) mindst 5 af de seneste 7 dage. */
function haelShouldStepBack() {
  const base = []; for (let i = 8; i <= 21; i++) { const r = painLog().find(x => x.dato === dateKey(addDays(new Date(), -i)) && x.program === 'haelspore'); if (r && typeof r.morgen === 'number') base.push(r.morgen); }
  if (base.length < 3) return false;
  const b = base.reduce((s, x) => s + x, 0) / base.length; let worse = 0;
  for (let i = 0; i < 7; i++) { const r = painLog().find(x => x.dato === dateKey(addDays(new Date(), -i)) && x.program === 'haelspore'); if (r && typeof r.morgen === 'number' && r.morgen >= b + 2) worse++; }
  return worse >= 5;
}

/* ---------- Infosider (fanen Gode råd → Hælspore) ---------- */
function haelReadInfo() { const ids = new Set(HAEL_INFO.map(x => x.id)); return readJson(KEY_HAEL_RAAD, []).filter(id => ids.has(id)); }
function viewHaelInfo(focusId) {
  setHeader('Gode råd', '#/mere'); setTab('raad');
  const read = new Set(haelReadInfo()), pct = Math.round(read.size / HAEL_INFO.length * 100);
  let h = adviceTabs('hael');
  h += '<div class="card raad-top"><b>' + (pct === 100 ? '🎉 Du har læst alt om hælspore!' : 'Du har læst ' + read.size + ' af ' + HAEL_INFO.length + ' sider om hælspore (' + pct + ' %)') + '</b>' +
    '<div class="bar"><span style="width:' + pct + '%"></span></div></div>';
  HAEL_INFO.forEach(a => {
    const r = read.has(a.id);
    h += '<div class="card advice' + (a.warn ? ' stop' : '') + (r ? ' is-read' : '') + '" id="raad-' + a.id + '"><h3>' + (a.icon ? a.icon + ' ' : '') + esc(a.title) + '</h3>' +
      (a.id === 'hael-anatomi' ? '<figure class="info-fig"><button type="button" class="info-zoom" aria-label="Vis tegningen større">' +
        '<img src="' + HAEL_ANATOMY_IMG + '" alt="Tegning af foden set fra siden: hælben, plantarfascie under foden, akillessene og lægmuskel" loading="lazy" decoding="async" width="1200" height="675"></button>' +
        '<figcaption>Foden set fra siden: hælben, plantarfascie, akillessene og lægmuskel.</figcaption></figure>' : '') +
      (a.text ? '<p>' + esc(a.text) + '</p>' : '') +
      (a.bullets ? '<ul class="tips">' + a.bullets.map(b => '<li>' + esc(b) + '</li>').join('') + '</ul>' : '') +
      (a.after ? '<p>' + esc(a.after) + '</p>' : '') +
      (a.id === 'hael-om-sporet' ? '<details class="sources"><summary>Kilder</summary><ul class="small">' + HAEL_SOURCES.map(s => '<li>' + esc(s.label) + '</li>').join('') + '</ul></details>' : '') +
      '<button type="button" class="readbtn' + (r ? ' on' : '') + '" data-hraad="' + a.id + '" aria-pressed="' + r + '"><span class="box" aria-hidden="true">' + (r ? '✓' : '') + '</span>' + (r ? 'Læst og forstået' : 'Jeg har læst og forstået') + '</button></div>';
  });
  h += '<h2>Værktøjer</h2><div class="tool-grid">' +
    '<a class="tool" href="#/hael/myter"><span>💬</span>Myter og fakta</a><a class="tool" href="#/hael/skotjek"><span>👟</span>Skotjek</a>' +
    '<button type="button" class="tool" id="flareBtn"><span>🆘</span>Dårlig dag?</button><a class="tool" href="#/hael/trafiklys"><span>🚦</span>Hvor meget må jeg gå?</a></div>';
  $app.innerHTML = h;
  bindAdviceTabs();
  document.getElementById('flareBtn').onclick = haelFlareModal;
  const z = $app.querySelector('.info-zoom'); if (z) z.onclick = () => openLightbox({ name: 'Sådan er foden bygget', photos: [], id: '_', images: [] }, 0, [{ src: HAEL_ANATOMY_IMG, caption: 'Foden set fra siden' }]);
  $app.querySelectorAll('[data-hraad]').forEach(b => b.onclick = () => {
    const id = b.dataset.hraad, arr = readJson(KEY_HAEL_RAAD, []), i = arr.indexOf(id); if (i >= 0) arr.splice(i, 1); else arr.push(id);
    writeJson(KEY_HAEL_RAAD, arr); const y = scrollY; viewHaelInfo(); scrollTo(0, y); if (i < 0) checkBadges();
  });
  if (focusId) { const el = document.getElementById('raad-' + focusId); if (el) { el.classList.add('focus'); setTimeout(() => el.scrollIntoView({ block: 'start' }), 30); } }
}
function adviceTabs(cur) {
  if (!HAEL_ON) return '';
  return '<div class="seg tabs2" role="tablist"><button type="button" role="tab" aria-selected="' + (cur === 'artrose') + '" class="' + (cur === 'artrose' ? 'sel' : '') + '" data-atab="artrose">Artrose</button>' +
    '<button type="button" role="tab" aria-selected="' + (cur === 'hael') + '" class="' + (cur === 'hael' ? 'sel' : '') + '" data-atab="hael">Hælspore</button></div>';
}
function bindAdviceTabs() { $app.querySelectorAll('[data-atab]').forEach(b => b.onclick = () => { location.hash = b.dataset.atab === 'hael' ? '#/raad/hael' : '#/raad'; }); }

/* ---------- Mærker ---------- */
function haelBadgeEarned(id) {
  const naaet = Number(readJson(KEY_HAEL_NAAET, 1)) || 1;
  switch (id) {
    case 'hael-morgen7': return haelRoutineDays() >= 7;
    case 'hael-fase2': return naaet >= 2;
    case 'hael-fase3': return naaet >= 3;
    case 'hael-fase4': return naaet >= 4;
    case 'hael-skotjek': return readJson(KEY_HAEL_SKO, []).length >= HAEL_SHOE_CHECKLIST.items.length;
    case 'hael-info': return haelReadInfo().length >= HAEL_INFO.length;
    case 'hael-morgen-lav': {
      let run = 0, best = 0;
      for (let i = 60; i >= 0; i--) { const r = painLog().find(x => x.dato === dateKey(addDays(new Date(), -i)) && x.program === 'haelspore'); if (r && typeof r.morgen === 'number' && r.morgen <= 2) { run++; best = Math.max(best, run); } else run = 0; }
      return best >= 5;
    }
  }
  return false;
}
function haelBadgeProgress(id) {
  switch (id) {
    case 'hael-morgen7': return Math.min(haelRoutineDays(), 7) + ' af 7 dage';
    case 'hael-skotjek': return readJson(KEY_HAEL_SKO, []).length + ' af ' + HAEL_SHOE_CHECKLIST.items.length;
    case 'hael-info': return haelReadInfo().length + ' af ' + HAEL_INFO.length + ' sider';
  }
  return '';
}
