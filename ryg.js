/* Ryg og nakke: programsider for Lænd, Brystryg og Nakke med to spor ("Hold – de første dage" og "Forebyg"),
   "Klar til næste fase?" og "Hvornår skal du til læge?". Bruger data-ryg.js. Indlæses før app.js. */
'use strict';
/* Samme sider bruges også til led-programmerne (data-led.js: skulder …). Felter, der kan sættes pr. program:
   word ('Fase'|'Niveau'), tabs, holdLabel, fbLabel, about (gode råd), painRule, ready. */
const RYG_ON = typeof RYG_PROGRAMS !== 'undefined';
const LED_ON = typeof LED_PROGRAMS !== 'undefined';
const ALL_PROGS = (RYG_ON ? RYG_PROGRAMS : []).concat(LED_ON ? LED_PROGRAMS : []);
const PROG_EXERCISES = (typeof RYG_EXERCISES !== 'undefined' ? RYG_EXERCISES : []).concat(typeof LED_EXERCISES !== 'undefined' ? LED_EXERCISES : []);
const KEY_RYG = 'hjo_ryg_v1', KEY_RYG_KLAR = 'hjo_ryg_klar_v1';
ALL_PROGS.forEach(p => { if (!CATEGORIES.some(c => c.id === p.id)) CATEGORIES.push({ id: p.id, name: p.name, icon: p.icon, area: p.area || 'ryg' }); });

function rygProg(id) { return ALL_PROGS.find(p => p.id === id) || null; }
const progBase = P => '#/' + ((P.area || 'ryg') === 'ryg' ? 'ryg' : 'led') + '/' + P.id;
const pWord = P => P.word || 'Fase', pword = P => pWord(P).toLowerCase();
const holdLabel = P => P.holdLabel || 'Hold – de første dage', fbLabel = P => P.fbLabel || 'Forebyg';
function isRyg(id) { return !!rygProg(id); }
function rygState(id) { const all = readJson(KEY_RYG, {}) || {}; const s = all[id] || {}; return { spor: s.spor === 'forebyg' ? 'forebyg' : 'hold', fase: [1, 2, 3].includes(s.fase) ? s.fase : 1 }; }
function rygSet(id, patch) { const all = readJson(KEY_RYG, {}) || {}; all[id] = Object.assign(rygState(id), patch); writeJson(KEY_RYG, all); }
function rygExercises(id, st) {
  const P = rygProg(id); if (!P) return [];
  st = st || rygState(id);
  const ids = st.spor === 'hold' ? P.hold.exercises : P.phases[st.fase - 1].exercises;
  const list = ids.map(x => exercises.find(e => e.id === x)).filter(Boolean);
  // egne øvelser i samme program (oprettet på redigeringssiden) kommer med i Forebyg på deres niveau
  if (st.spor === 'forebyg') exercises.forEach(e => { if (e.category === id && !PROG_EXERCISES.some(r => r.id === e.id) && (Number(e.level) || 1) === st.fase) list.push(e); });
  return list;
}
function rygLabel(id) { const s = rygState(id), P = rygProg(id); return s.spor === 'hold' ? holdLabel(P) : fbLabel(P) + ' · ' + pWord(P) + ' ' + s.fase; }
function rygPhaseSteps(P, f) {
  return '<div class="phase-steps" aria-label="' + pWord(P) + ' ' + f + ' af 3">' + P.phases.map(x => '<span class="ps' + (x.n === f ? ' cur' : x.n < f ? ' done' : '') + '" style="--pc:' + x.color + '"><b>' + x.n + '</b></span>').join('') + '</div>';
}
function exListHtml(list, prog) {
  return list.map(e => {
    const d = doneToday(e.id, prog);
    return '<a class="ex-item' + (d ? ' done' : '') + '" href="#/oevelse/' + encodeURIComponent(e.id) + '">' + thumbHtml(e) +
      '<div class="txt"><strong>' + esc(e.name) + '</strong><span>' + esc(shortDose(e.dose)) + '</span></div>' +
      (d ? '<span class="check" aria-label="Lavet i dag">✓</span>' : '<span class="check" aria-hidden="true" style="color:#8a857a">›</span>') + '</a>';
  }).join('');
}
function rygDoctorLink(id, big) {
  const P = rygProg(id);
  return '<a class="card redflag-link' + (big ? ' big' : '') + '" href="' + (P ? progBase(P) : '#/ryg/' + id) + '/laege"><span aria-hidden="true">⚠️</span><span><b>Hvornår skal du til læge?</b><small>Tegn, du skal reagere på – med det samme, i dag eller om 1–2 uger.</small></span><span class="chev" aria-hidden="true">›</span></a>';
}

function viewRyg(id) {
  const P = rygProg(id); if (!P) return viewHome();
  setHeader(P.name, '#/programmer'); setTab('prog');
  localStorage.setItem(KEY_LASTCAT, id);
  const st = rygState(id), list = rygExercises(id, st);
  let h = '<p class="lead">' + esc(P.intro) + '</p>';
  if (P.note) h += '<div class="card op-note" data-note="' + P.id + '"><p style="margin:0"><b>🏥 ' + esc(P.note) + '</b></p></div>';
  const tabs = P.tabs || { hold: ['🆘 Hold – de første dage', 'Når det lige har låst'], forebyg: ['💪 Forebyg', 'Når det er blevet bedre'] };
  h += '<div class="track-switch" role="tablist" aria-label="Vælg spor">' +
    '<button type="button" role="tab" class="track' + (st.spor === 'hold' ? ' sel' : '') + '" aria-selected="' + (st.spor === 'hold') + '" data-spor="hold"><b>' + tabs.hold[0] + '</b><span>' + tabs.hold[1] + '</span></button>' +
    '<button type="button" role="tab" class="track' + (st.spor === 'forebyg' ? ' sel' : '') + '" aria-selected="' + (st.spor === 'forebyg') + '" data-spor="forebyg"><b>' + tabs.forebyg[0] + '</b><span>' + tabs.forebyg[1] + '</span></button></div>';
  if (st.spor === 'hold') {
    h += '<div class="card calm-card"><h3>💚 ' + esc(P.hold.title) + '</h3><p>' + esc(P.hold.calm) + '</p></div>';
    h += rygDoctorLink(id, true);
    h += '<h2>Dine øvelser</h2>' + exListHtml(list, id);
  } else {
    const F = P.phases[st.fase - 1];
    h += '<div class="card phase-card" style="--pc:' + F.color + '"><div class="row-between"><b>' + esc(F.name) + '</b><span class="muted small">' + esc(F.weeks) + '</span></div>' + rygPhaseSteps(P, st.fase) +
      '<p class="small" style="margin:8px 0 0">🎯 ' + esc(F.goal) + '</p>' +
      '<details class="phase-pick"><summary>Skift ' + pword(P) + '</summary><div class="levels">' + P.phases.map(x => '<button type="button" class="lvl' + (x.n === st.fase ? ' sel' : '') + '" data-rfase="' + x.n + '"><b>' + pWord(P) + ' ' + x.n + '</b><span>' + esc(x.name.split(': ')[1] || '') + '</span></button>').join('') + '</div></details></div>';
    h += '<h2>Dine øvelser på ' + pword(P) + ' ' + st.fase + '</h2>' + exListHtml(list, id);
  }
  if (needsAfter(id) && list.some(e => doneToday(e.id, id))) h += '<button type="button" class="btn finish" id="finishBtn">✓ ' + esc(PAIN_CHECK.finishButton) + '</button>';
  if (st.spor === 'hold') {
    h += '<div class="card"><h3>👍 Det hjælper</h3><ul class="tips">' + P.hold.advice.map(x => '<li>' + esc(x) + '</li>').join('') + '</ul></div>';
    h += '<div class="card"><h3>🛋️ Stillinger, der kan lindre</h3><ul class="tips">' + P.hold.positions.map(x => '<li>' + esc(x) + '</li>').join('') + '</ul></div>';
    h += '<div class="card"><h3>📅 Hvor lang tid tager det?</h3><p style="margin:0">' + esc(P.hold.course) + '</p></div>';
    h += '<button type="button" class="btn secondary" id="toForebyg">Har du det bedre? Gå videre til ' + fbLabel(P) + ' ›</button>';
  } else {
    const F = P.phases[st.fase - 1];
    h += '<a class="card hint-card ready-card" href="' + progBase(P) + '/klar"><h3>' + (st.fase < 3 ? '🎯 Klar til ' + pword(P) + ' ' + (st.fase + 1) + '?' : '🏁 Godt gået – hold det ved lige') + '</h3><p class="small" style="margin:0">' + (st.fase < 3 ? 'Tjek de ' + F.criteria.length + ' punkter. ›' : (P.area && P.area !== 'ryg' ? 'Se punkterne for at holde det ved lige. ›' : 'Se punkterne for at holde ryggen stærk. ›')) + '</p></a>';
    h += '<div class="card"><h3>🏠 Gode vaner i hverdagen</h3><ul class="tips">' + P.everyday.map(x => '<li>' + esc(x) + '</li>').join('') + '</ul></div>';
    h += rygDoctorLink(id);
  }
  if (P.about) h += '<a class="card more-row about-link" href="' + progBase(P) + '/raad"><span class="mi" aria-hidden="true">📖</span><span><b>' + esc(P.aboutTitle || 'Gode råd') + '</b><small>Hvad er det, og hvad hjælper?</small></span><span class="chev" aria-hidden="true">›</span></a>';
  h += '<details class="card fold"><summary>⚖️ Smerteregel</summary><p>' + esc(P.painRule || RYG_PAIN_RULE) + '</p></details>';
  $app.innerHTML = h;
  hydrateMedia($app);
  $app.querySelectorAll('[data-spor]').forEach(b => b.onclick = () => { rygSet(id, { spor: b.dataset.spor }); viewRyg(id); window.scrollTo(0, 0); });
  $app.querySelectorAll('[data-rfase]').forEach(b => b.onclick = () => { const n = Number(b.dataset.rfase); if (n !== st.fase) { rygSet(id, { fase: n }); toast('Du er nu på ' + pword(P) + ' ' + n + '.'); viewRyg(id); } });
  const tf = document.getElementById('toForebyg'); if (tf) tf.onclick = () => { rygSet(id, { spor: 'forebyg' }); viewRyg(id); window.scrollTo(0, 0); };
  const fb = document.getElementById('finishBtn'); if (fb) fb.onclick = () => painAfter(id, () => checkBadges());
}

/* "Hvornår skal du til læge?" – én side pr. område */
function rygDoctorHtml(P) {
  const sec = (cls, icon, title, sub, items) => '<section class="rf rf-' + cls + '"><h3><span aria-hidden="true">' + icon + '</span> ' + title + '</h3>' + (sub ? '<p class="rf-sub">' + sub + '</p>' : '') +
    '<ul>' + items.map(x => '<li>' + esc(x) + '</li>').join('') + '</ul></section>';
  return sec('now', '🚑', 'Ring 112, eller tag på skadestuen med det samme', 'hvis du har ét af disse tegn:', P.redFlags.now) +
    sec('today', '📞', 'Kontakt din læge i dag', 'Uden for åbningstid: ring til lægevagten på 1813 <span class="rf-note">(Region Hovedstaden. I andre regioner: ring til din egen læge eller vagtlægen)</span>. Hvis:', P.redFlags.today) +
    sec('weeks', '🗓️', 'Kontakt din læge, hvis det ikke er bedre om 1–2 uger', 'eller hvis:', P.redFlags.weeks) +
    '<p class="hint">Ingen af disse? Så er det med stor sandsynlighed ufarligt. Hold dig i gang, og følg øvelserne.</p>';
}
function viewRygSub(id, sub) {
  if (!id || id === 'laege') return viewDoctorAll();
  const P = rygProg(id); if (!P) return viewHome();
  const back = '#/kategori/' + id; setTab('prog');
  let h = '';
  if (sub === 'laege') {
    setHeader('Hvornår skal du til læge?', back);
    h += '<p class="lead">' + esc(P.long) + '</p>' + rygDoctorHtml(P);
  } else if (sub === 'raad' && P.about) {
    setHeader('Gode råd: ' + P.name, back);
    h += '<p class="lead">' + esc(P.intro) + '</p>' + P.about.map(([t, x], i) => '<details class="card fold"' + (i === 0 ? ' open' : '') + '><summary>' + esc(t) + '</summary><p>' + esc(x) + '</p></details>').join('');
    h += '<div class="card"><h3>🏠 Gode vaner i hverdagen</h3><ul class="tips">' + P.everyday.map(x => '<li>' + esc(x) + '</li>').join('') + '</ul></div>' + rygDoctorLink(id);
  } else if (sub === 'klar') {
    const st = rygState(id), F = P.phases[st.fase - 1], RT = P.ready || RYG_READY_TEXT;
    setHeader(st.fase < 3 ? 'Klar til ' + pword(P) + ' ' + (st.fase + 1) + '?' : 'Hold det ved lige', back);
    const all = readJson(KEY_RYG_KLAR, {}) || {}, key = id + '-' + st.fase, chk = Array.isArray(all[key]) ? all[key] : [];
    h += '<p class="lead">Sæt kryds ved det, der passer på dig nu.</p><div class="card checklist">' +
      F.criteria.map((c, i) => '<label class="chk"><input type="checkbox" data-i="' + i + '"' + (chk[i] ? ' checked' : '') + '><span>' + esc(c) + '</span></label>').join('') + '</div>';
    const ok = F.criteria.every((_, i) => chk[i]);
    h += '<div class="card ' + (ok ? 'ready-ok' : 'hint-card') + '" id="klarRes"><p style="margin:0">' + esc(ok ? RT.allChecked : RT.notYet) + '</p></div>';
    if (ok && st.fase < 3) h += '<button type="button" class="btn" id="klarGo">Gå til ' + pword(P) + ' ' + (st.fase + 1) + ' ›</button>';
    $app.innerHTML = h;
    $app.querySelectorAll('.chk input').forEach(x => x.onchange = () => { const a = readJson(KEY_RYG_KLAR, {}) || {}; const arr = Array.isArray(a[key]) ? a[key] : []; arr[Number(x.dataset.i)] = x.checked; a[key] = arr; writeJson(KEY_RYG_KLAR, a); viewRygSub(id, 'klar'); });
    const g = document.getElementById('klarGo'); if (g) g.onclick = () => { rygSet(id, { fase: st.fase + 1 }); toast('Du er nu på ' + pword(P) + ' ' + (st.fase + 1) + '. Start roligt.'); location.hash = back; };
    return;
  } else return viewRyg(id);
  $app.innerHTML = h;
}
function viewDoctorAll() {
  setHeader('Hvornår skal du til læge?', '#/mere'); setTab('mere');
  let h = '<p class="lead">Vælg, hvor det gør ondt.</p>';
  h += ALL_PROGS.map(P => '<a class="card more-row" href="' + progBase(P) + '/laege"><span class="mi" aria-hidden="true">⚠️</span><span><b>' + esc(P.long) + '</b></span><span class="chev" aria-hidden="true">›</span></a>').join('');
  $app.innerHTML = h;
}
