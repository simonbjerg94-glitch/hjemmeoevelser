/* Ryg og nakke: programsider for Lænd, Brystryg og Nakke med to spor ("Hold – de første dage" og "Forebyg"),
   "Klar til næste fase?" og "Hvornår skal du til læge?". Bruger data-ryg.js. Indlæses før app.js. */
'use strict';
const RYG_ON = typeof RYG_PROGRAMS !== 'undefined';
const KEY_RYG = 'hjo_ryg_v1', KEY_RYG_KLAR = 'hjo_ryg_klar_v1';
if (RYG_ON) RYG_PROGRAMS.forEach(p => { if (!CATEGORIES.some(c => c.id === p.id)) CATEGORIES.push({ id: p.id, name: p.name, icon: p.icon, area: 'ryg' }); });

function rygProg(id) { return RYG_ON ? RYG_PROGRAMS.find(p => p.id === id) : null; }
function isRyg(id) { return !!rygProg(id); }
function rygState(id) { const all = readJson(KEY_RYG, {}) || {}; const s = all[id] || {}; return { spor: s.spor === 'forebyg' ? 'forebyg' : 'hold', fase: [1, 2, 3].includes(s.fase) ? s.fase : 1 }; }
function rygSet(id, patch) { const all = readJson(KEY_RYG, {}) || {}; all[id] = Object.assign(rygState(id), patch); writeJson(KEY_RYG, all); }
function rygExercises(id, st) {
  const P = rygProg(id); if (!P) return [];
  st = st || rygState(id);
  const ids = st.spor === 'hold' ? P.hold.exercises : P.phases[st.fase - 1].exercises;
  const list = ids.map(x => exercises.find(e => e.id === x)).filter(Boolean);
  // egne øvelser i samme program (oprettet på redigeringssiden) kommer med i Forebyg på deres niveau
  if (st.spor === 'forebyg') exercises.forEach(e => { if (e.category === id && !RYG_EXERCISES.some(r => r.id === e.id) && (Number(e.level) || 1) === st.fase) list.push(e); });
  return list;
}
function rygLabel(id) { const s = rygState(id); return s.spor === 'hold' ? 'Hold – de første dage' : 'Forebyg · Fase ' + s.fase; }
function rygPhaseSteps(P, f) {
  return '<div class="phase-steps" aria-label="Fase ' + f + ' af 3">' + P.phases.map(x => '<span class="ps' + (x.n === f ? ' cur' : x.n < f ? ' done' : '') + '" style="--pc:' + x.color + '"><b>' + x.n + '</b></span>').join('') + '</div>';
}
function exListHtml(list) {
  return list.map(e => {
    const d = doneToday(e.id);
    return '<a class="ex-item' + (d ? ' done' : '') + '" href="#/oevelse/' + encodeURIComponent(e.id) + '">' + thumbHtml(e) +
      '<div class="txt"><strong>' + esc(e.name) + '</strong><span>' + esc(shortDose(e.dose)) + '</span></div>' +
      (d ? '<span class="check" aria-label="Lavet i dag">✓</span>' : '<span class="check" aria-hidden="true" style="color:#b9b4a8">›</span>') + '</a>';
  }).join('');
}
function rygDoctorLink(id, big) {
  return '<a class="card redflag-link' + (big ? ' big' : '') + '" href="#/ryg/' + id + '/laege"><span aria-hidden="true">⚠️</span><span><b>Hvornår skal du til læge?</b><small>Tegn, du skal reagere på – med det samme, i dag eller om 1–2 uger.</small></span><span class="chev" aria-hidden="true">›</span></a>';
}

function viewRyg(id) {
  const P = rygProg(id); if (!P) return viewHome();
  setHeader(P.name, '#/programmer'); setTab('prog');
  localStorage.setItem(KEY_LASTCAT, id);
  const st = rygState(id), list = rygExercises(id, st);
  let h = '<p class="lead">' + esc(P.intro) + '</p>';
  h += '<div class="track-switch" role="tablist" aria-label="Vælg spor">' +
    '<button type="button" role="tab" class="track' + (st.spor === 'hold' ? ' sel' : '') + '" aria-selected="' + (st.spor === 'hold') + '" data-spor="hold"><b>🆘 Hold – de første dage</b><span>Når det lige har låst</span></button>' +
    '<button type="button" role="tab" class="track' + (st.spor === 'forebyg' ? ' sel' : '') + '" aria-selected="' + (st.spor === 'forebyg') + '" data-spor="forebyg"><b>💪 Forebyg</b><span>Når det er blevet bedre</span></button></div>';
  if (st.spor === 'hold') {
    h += '<div class="card calm-card"><h3>💚 ' + esc(P.hold.title) + '</h3><p>' + esc(P.hold.calm) + '</p></div>';
    h += rygDoctorLink(id, true);
    h += '<h2>Dine øvelser</h2>' + exListHtml(list);
  } else {
    const F = P.phases[st.fase - 1];
    h += '<div class="card phase-card" style="--pc:' + F.color + '"><div class="row-between"><b>' + esc(F.name) + '</b><span class="muted small">' + esc(F.weeks) + '</span></div>' + rygPhaseSteps(P, st.fase) +
      '<p class="small" style="margin:8px 0 0">🎯 ' + esc(F.goal) + '</p>' +
      '<details class="phase-pick"><summary>Skift fase</summary><div class="levels">' + P.phases.map(x => '<button type="button" class="lvl' + (x.n === st.fase ? ' sel' : '') + '" data-rfase="' + x.n + '"><b>Fase ' + x.n + '</b><span>' + esc(x.name.split(': ')[1] || '') + '</span></button>').join('') + '</div></details></div>';
    h += '<h2>Dine øvelser i fase ' + st.fase + '</h2>' + exListHtml(list);
  }
  if (needsAfter(id) && list.some(e => doneToday(e.id))) h += '<button type="button" class="btn finish" id="finishBtn">✓ ' + esc(PAIN_CHECK.finishButton) + '</button>';
  if (st.spor === 'hold') {
    h += '<div class="card"><h3>👍 Det hjælper</h3><ul class="tips">' + P.hold.advice.map(x => '<li>' + esc(x) + '</li>').join('') + '</ul></div>';
    h += '<div class="card"><h3>🛋️ Stillinger, der kan lindre</h3><ul class="tips">' + P.hold.positions.map(x => '<li>' + esc(x) + '</li>').join('') + '</ul></div>';
    h += '<div class="card"><h3>📅 Hvor lang tid tager det?</h3><p style="margin:0">' + esc(P.hold.course) + '</p></div>';
    h += '<button type="button" class="btn secondary" id="toForebyg">Har du det bedre? Gå videre til Forebyg ›</button>';
  } else {
    const F = P.phases[st.fase - 1];
    h += '<a class="card hint-card ready-card" href="#/ryg/' + id + '/klar"><h3>' + (st.fase < 3 ? '🎯 Klar til fase ' + (st.fase + 1) + '?' : '🏁 Godt gået – hold det ved lige') + '</h3><p class="small" style="margin:0">' + (st.fase < 3 ? 'Tjek de ' + F.criteria.length + ' punkter. ›' : 'Se punkterne for at holde ryggen stærk. ›') + '</p></a>';
    h += '<div class="card"><h3>🏠 Gode vaner i hverdagen</h3><ul class="tips">' + P.everyday.map(x => '<li>' + esc(x) + '</li>').join('') + '</ul></div>';
    h += rygDoctorLink(id);
  }
  h += '<details class="card fold"><summary>⚖️ Smerteregel</summary><p>' + esc(RYG_PAIN_RULE) + '</p></details>';
  $app.innerHTML = h;
  hydrateMedia($app);
  $app.querySelectorAll('[data-spor]').forEach(b => b.onclick = () => { rygSet(id, { spor: b.dataset.spor }); viewRyg(id); window.scrollTo(0, 0); });
  $app.querySelectorAll('[data-rfase]').forEach(b => b.onclick = () => { const n = Number(b.dataset.rfase); if (n !== st.fase) { rygSet(id, { fase: n }); toast('Du er nu i fase ' + n + '.'); viewRyg(id); } });
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
  } else if (sub === 'klar') {
    const st = rygState(id), F = P.phases[st.fase - 1];
    setHeader(st.fase < 3 ? 'Klar til fase ' + (st.fase + 1) + '?' : 'Hold det ved lige', back);
    const all = readJson(KEY_RYG_KLAR, {}) || {}, key = id + '-' + st.fase, chk = Array.isArray(all[key]) ? all[key] : [];
    h += '<p class="lead">Sæt kryds ved det, der passer på dig nu.</p><div class="card checklist">' +
      F.criteria.map((c, i) => '<label class="chk"><input type="checkbox" data-i="' + i + '"' + (chk[i] ? ' checked' : '') + '><span>' + esc(c) + '</span></label>').join('') + '</div>';
    const ok = F.criteria.every((_, i) => chk[i]);
    h += '<div class="card ' + (ok ? 'ready-ok' : 'hint-card') + '" id="klarRes"><p style="margin:0">' + esc(ok ? RYG_READY_TEXT.allChecked : RYG_READY_TEXT.notYet) + '</p></div>';
    if (ok && st.fase < 3) h += '<button type="button" class="btn" id="klarGo">Gå til fase ' + (st.fase + 1) + ' ›</button>';
    $app.innerHTML = h;
    $app.querySelectorAll('.chk input').forEach(x => x.onchange = () => { const a = readJson(KEY_RYG_KLAR, {}) || {}; const arr = Array.isArray(a[key]) ? a[key] : []; arr[Number(x.dataset.i)] = x.checked; a[key] = arr; writeJson(KEY_RYG_KLAR, a); viewRygSub(id, 'klar'); });
    const g = document.getElementById('klarGo'); if (g) g.onclick = () => { rygSet(id, { fase: st.fase + 1 }); toast('Du er nu i fase ' + (st.fase + 1) + '. Start roligt.'); location.hash = back; };
    return;
  } else return viewRyg(id);
  $app.innerHTML = h;
}
function viewDoctorAll() {
  setHeader('Hvornår skal du til læge?', '#/mere'); setTab('mere');
  let h = '<p class="lead">Vælg, hvor det gør ondt.</p>';
  h += RYG_PROGRAMS.map(P => '<a class="card more-row" href="#/ryg/' + P.id + '/laege"><span class="mi" aria-hidden="true">⚠️</span><span><b>' + esc(P.long) + '</b></span><span class="chev" aria-hidden="true">›</span></a>').join('');
  $app.innerHTML = h;
}
