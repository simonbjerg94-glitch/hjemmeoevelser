/* PT-tilstand: træning for personlige træningsklienter.
   Forside "Dagens træning", programmer (PT + Prehab), træningslog (sæt × gentagelser × kg + anstrengelse),
   dobbelt progression, fremskridt og velkomstspørgsmål. Alt gemmes kun i localStorage på telefonen – intet sendes. */
'use strict';
const PT = (() => {
  const KEY_TARGET = 'hjo_maalgruppe_v1', KEY_LOG = 'hjo_pt_log_v1', KEY_LVL = 'hjo_pt_trin_v1', KEY_ANS = 'hjo_pt_svar_v1', KEY_DRAFT = 'hjo_pt_kladde_v1', KEY_SKIP = 'hjo_pt_svar_skip_v1', KEY_PROG = 'hjo_pt_prog_v1';
  const rj = (k, f) => { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? f : v; } catch (e) { return f; } };
  const wj = (k, v) => localStorage.setItem(k, JSON.stringify(v));
  const H = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const today = () => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };

  /* ---------- tilstand ---------- */
  const simple = () => typeof isSimple === 'function' && isSimple();   // "Stor og enkel": færre valg på PT-skærmene
  const on = () => localStorage.getItem(KEY_TARGET) !== 'patient';   // PT er standard; "patient" = den gamle genoptræningsapp
  const setTarget = t => { localStorage.setItem(KEY_TARGET, t === 'patient' ? 'patient' : 'pt'); };
  const program = id => PT_PROGRAMS.find(p => p.id === id) || PT_PROGRAMS[0];
  const active = () => { const id = localStorage.getItem(KEY_PROG); return PT_PROGRAMS.some(p => p.id === id) ? id : PT_PROGRAMS[0].id; };  // dit valgte program
  const setActive = id => { if (PT_PROGRAMS.some(p => p.id === id)) localStorage.setItem(KEY_PROG, id); };
  const levelOf = pid => { const n = Number(rj(KEY_LVL, {})[pid]); return n >= 1 && n <= program(pid).levels.length ? n : 1; };
  const setLevel = (pid, n) => { const o = rj(KEY_LVL, {}); o[pid] = n; wj(KEY_LVL, o); };
  const ex = id => (typeof exercises !== 'undefined' && exercises.find(e => e.id === id)) || allDefaults().find(e => e.id === id);
  const itemName = it => it.name || (ex(it.id) || {}).name || it.id;
  const target = it => it.hold ? it.hold[0] + '–' + it.hold[1] + ' sek.' + (it.side ? ' pr. side' : '') : it.reps[0] + '–' + it.reps[1] + (it.side ? ' pr. side' : '');
  const doseText = it => it.sets + ' sæt × ' + target(it);

  /* ---------- log ---------- */
  const logAll = () => { const a = rj(KEY_LOG, []); return Array.isArray(a) ? a.filter(s => s && typeof s.dato === 'string' && Array.isArray(s.ex)) : []; };
  const saveLog = a => wj(KEY_LOG, a);
  const lastFor = id => { const a = logAll(); for (let i = a.length - 1; i >= 0; i--) { const e = a[i].ex.find(x => x.id === id); if (e) return e; } return null; };
  /* Dobbelt progression for én øvelse: næste mål ud fra sidste gang */
  function advice(it) {
    const last = lastFor(it.id), [lo, hi] = it.hold || it.reps;
    if (!last || !last.sets.length) return { goal: lo, msg: 'Første gang: find et niveau, hvor du kan lave ' + lo + '–' + hi + (it.hold ? ' sek.' : '') + ' med god teknik.' };
    const vals = last.sets.map(s => Number(s.reps) || 0), rpe = Number(last.rpe) || 0, min = Math.min(...vals);
    const step = it.hold ? 5 : 1;
    if (vals.length >= it.sets && min >= hi && rpe && rpe <= 8) return { goal: hi, top: true, msg: 'Du nåede toppen sidst (' + hi + (it.hold ? ' sek.' : '') + ' i alle sæt). Prøv den sværere variant – eller gå videre til næste trin.' };
    if (rpe >= 9) return { goal: Math.max(lo, min), msg: 'Sidst var det meget hårdt (' + rpe + '/10). Gentag samme antal, og fokusér på teknikken.' };
    return { goal: Math.min(hi, Math.max(lo, min + step)), msg: 'Sidst: ' + vals.join(' · ') + (it.hold ? ' sek.' : '') + '. Prøv ' + Math.min(hi, Math.max(lo, min + step)) + (it.hold ? ' sek.' : '') + ' i hvert sæt i dag.' };
  }
  /* Klar til næste trin, når alle øvelser i trinnet var på toppen de 2 seneste gange, trinnet blev trænet */
  function readyForNext(pid) {
    const P = program(pid), n = levelOf(pid), L = P.levels[n - 1];
    if (n >= P.levels.length) return false;
    const sess = logAll().filter(s => s.prog === pid && s.trin === n).slice(-2);
    if (sess.length < 2) return false;
    return sess.every(s => L.items.every(it => { const e = s.ex.find(x => x.id === it.id); if (!e || e.sets.length < it.sets) return false;
      const hi = (it.hold || it.reps)[1]; return e.sets.every(x => Number(x.reps) >= hi) && Number(e.rpe) > 0 && Number(e.rpe) <= 8; }));
  }
  const sessionsThisWeek = () => { const mon = mondayOf(new Date()), k = dateKey(mon); return logAll().filter(s => s.dato >= k).length; };
  const weekGoal = () => { const a = answers(); const d = a && a.dage ? Number(a.dage[0] || a.dage) : 2; return d >= 2 && d <= 4 ? d : 2; };
  const trainedToday = () => logAll().some(s => s.dato === today());
  const lastSession = () => { const a = logAll(); return a.length ? a[a.length - 1] : null; };
  function weekStreak() { // uger i træk (til og med denne eller sidste uge), hvor ugemålet blev nået
    const g = weekGoal(); let n = 0, mon = mondayOf(new Date());
    const cnt = m => { const a = dateKey(m), b = dateKey(addDays(m, 7)); return logAll().filter(s => s.dato >= a && s.dato < b).length; };
    if (cnt(mon) < g) mon = addDays(mon, -7);
    while (cnt(mon) >= g && n < 520) { n++; mon = addDays(mon, -7); }
    return n;
  }

  /* ---------- svar ---------- */
  const answers = () => { const a = rj(KEY_ANS, null); return a && typeof a === 'object' ? a : null; };
  function recommend(a) {
    a = a || {};
    const flags = (a.helbred || []).filter(x => x !== 'none');
    const fear = Number((a.frygt || [])[0] || 0), safe = Number(a.tryghed), conf = Number(a.tiltro);
    const exp = (a.erfaring || [])[0];
    let trin = exp === 'fast' && !flags.length && fear <= 1 && (isNaN(safe) || safe >= 6) ? 2 : 1;
    const notes = [];
    if (flags.length) notes.push({ k: 'flag', t: 'Tal med din træner – og evt. din læge – før du træner hårdt. Du kan godt starte roligt på Trin 1, men stop ved smerter i brystet, åndenød, der ikke går over, eller svimmelhed.' });
    if (fear >= 2 || (!isNaN(safe) && safe <= 4)) notes.push({ k: 'frygt', t: 'Det er helt normalt at være lidt usikker. Vi starter roligt: Trin 1, god tid til hver øvelse, og filmen viser præcis, hvordan du gør. Lidt ømhed dagen efter er ufarligt.' });
    if (!isNaN(conf) && conf <= 5) notes.push({ k: 'tiltro', t: 'Sæt et lille mål: ' + Math.min(2, weekGoalFrom(a)) + ' korte træninger om ugen er nok i starten. Vælg faste dage, og slå påmindelser til under Mere.' });
    const prehab = (a.smerte || []).filter(x => PT_PREHAB[x]).map(x => PT_PREHAB[x]);
    return { trin, notes, prehab, days: weekGoalFrom(a) };
  }
  const weekGoalFrom = a => { const d = a && a.dage ? Number(a.dage[0]) : 2; return d >= 2 && d <= 4 ? d : 2; };

  /* ---------- fælles ---------- */
  const chrome = () => {
    const lab = { home: on() ? 'Træning' : 'I dag', prog: on() ? 'Programmer' : 'Øvelser', uge: 'Fremgang' };
    document.querySelectorAll('.tabbar a').forEach(a => { const t = lab[a.dataset.tab]; if (!t) return; const svg = a.querySelector('svg'); a.textContent = ''; if (svg) a.appendChild(svg); a.appendChild(document.createTextNode(t)); });
    document.documentElement.classList.toggle('pt-mode', on());
  };
  const card = (href, ico, title, sub, extra) => '<a class="card more-row' + (extra || '') + '" href="' + href + '"><span class="mi" aria-hidden="true">' + ico + '</span><span><b>' + title + '</b>' + (sub ? '<small>' + sub + '</small>' : '') + '</span><span class="chev" aria-hidden="true">›</span></a>';

  /* ---------- Forside: Dagens træning ---------- */
  function toRehab() { setTarget('patient'); chrome(); toast('Appen viser nu genoptræning. Du kan skifte tilbage under Mere.'); if (location.hash === '#/' || location.hash === '') { if (typeof window.route === 'function') window.route(); } else location.hash = '#/'; }
  function home() {
    setHeader('Træning'); setTab('home');
    const now = new Date(), P = program(active()), n = levelOf(P.id), L = P.levels[n - 1], done = trainedToday();
    const draft = rj(KEY_DRAFT, null), wk = sessionsThisWeek(), g = weekGoal(), last = lastSession();
    let h = '<section class="hello"><p class="date">' + WEEKDAYS[now.getDay()].replace(/^./, c => c.toUpperCase()) + ' ' + now.getDate() + '. ' + MONTHS_LONG[now.getMonth()] + '</p><h2>' + greeting() + '! 💪</h2></section>';
    if (typeof remindBannerHtml === 'function') h += remindBannerHtml();
    if (!answers() && !localStorage.getItem(KEY_SKIP)) h += card('#/pt/velkommen', icon('clipboard'), 'Kom godt i gang', 'Svar på 9 korte spørgsmål – så finder vi dit startniveau', ' q-invite pt-invite');
    const restDay = !done && last && last.dato === dateKey(addDays(now, -1));
    h += '<div class="card now-card pt-today"><p class="now-q">Dagens træning</p>' +
      '<a class="btn start' + (done ? ' done' : '') + '" id="ptStart" href="#/pt/traening">' +
      '<span class="start-main">' + (done ? icon('check') + 'Dagens træning er lavet' : icon('play') + (draft && draft.dato === today() ? 'Fortsæt træningen' : 'Start træningen')) + '</span>' +
      '<span class="start-sub">' + H(P.name) + ' · ' + L.name + ' · ' + L.items.length + ' øvelser · ' + P.minutes + '</span></a>' +
      (done ? '<p class="now-next">Stærkt! Musklerne bliver stærkere, mens du hviler. Næste træning: i overmorgen.</p>'
        : restDay ? '<p class="now-next">Du trænede i går. En hviledag er en god idé – eller tag en rask gåtur. Du kan selvfølgelig godt træne alligevel.</p>'
        : '<p class="now-next">Første øvelse: <b>' + H(itemName(L.items[0])) + '</b></p>') + '</div>';
    if (readyForNext(P.id)) h += '<div class="card pt-levelup"><h3>🎯 Klar til ' + P.levels[n].name + '?</h3><p>Du har nået toppen i alle øvelser to gange i træk. Det er tid til mere udfordring.</p><button type="button" class="btn" id="ptLevelUp">Gå til ' + P.levels[n].name + '</button></div>';
    h += '<a class="card status-strip" href="#/uge"><span>📅 <b>' + wk + ' af ' + g + '</b> træninger denne uge</span><span>🔥 <b>' + weekStreak() + '</b> ' + (weekStreak() === 1 ? 'uge' : 'uger') + ' i træk</span><span class="chev" aria-hidden="true">›</span></a>';
    h += '<a class="btn secondary" href="#/programmer">🔄 Skift program</a>';
    if (!logAll().length) h += '<button type="button" class="card more-row pt-to-rehab" id="ptToRehab"><span class="mi" aria-hidden="true">🩹</span><span><b>Har du ondt, eller skal du genoptræne?</b><small>Skift til genoptræning: øvelser til knæ, hofte, ryg, skulder, hånd og fod</small></span><span class="chev" aria-hidden="true">›</span></button>';
    $app.innerHTML = h; if (typeof Profiles !== "undefined") Profiles.mount();
    const tr = document.getElementById('ptToRehab'); if (tr) tr.onclick = toRehab;
    if (typeof bindRemindBanner === 'function') bindRemindBanner();
    const up = document.getElementById('ptLevelUp'); if (up) up.onclick = () => { setLevel(P.id, n + 1); toast('Du er nu på ' + P.levels[n].name + '. Godt gået!'); home(); };
  }

  /* ---------- Programmer: PT øverst, Prehab (de 12 genoptræningsprogrammer) nedenunder ---------- */
  function programs() {
    viewPrograms();               // tegner Prehab-delen (de eksisterende programmer)
    setHeader('Programmer'); setTab('prog');
    let h = '<h2 class="pt-h">Træningsprogrammer</h2>';
    const ICO = { helkrop: '💪', mellem: '🏋️', avanceret: '🔥', kondition: '❤️', core: '🧘', forebyg: '🛡️' };
    PT_PROGRAMS.forEach(P => { const n = levelOf(P.id), cur = P.id === active();
      h += '<a class="card more-row pt-prog' + (cur ? ' cur' : '') + '" href="#/pt/program/' + P.id + '" data-ptprog="' + P.id + '"><span class="mi" aria-hidden="true">' + (ICO[P.id] || '💪') + '</span><span><b>' + H(P.name) + '</b><small>' + P.levels[n - 1].name + ' · ' + P.levels[n - 1].sub + ' · ' + H(P.minutes) + '</small>' + (cur ? '<span class="cur-tag">Dit program nu</span>' : '') + '</span><span class="chev" aria-hidden="true">›</span></a>'; });
    if (typeof PT_LIBRARY !== 'undefined') h += card('#/pt/bibliotek', '📚', 'Øvelsesbibliotek', 'Alle kropsvægtsøvelser – underkrop, skub, ryg, core, kondition og mobilitet', ' pt-lib-link');
    h += '<h2 class="pt-h">Ondt et sted? Genoptræning og forebyggelse</h2><p class="muted small">Øvelser til knæ, hofte, ryg, skuldre og fødder. Brug dem som opvarmning, hvis noget driller, eller efter aftale med din træner.</p>';
    $app.insertAdjacentHTML('afterbegin', '<div class="pt-progs">' + h + '</div>');
  }
  function programView(pid) {
    const P = program(pid), n = levelOf(P.id);
    setHeader(P.short, '#/programmer'); setTab('prog');
    let h = '<p class="lead">' + H(P.about) + '</p><p class="equip"><span aria-hidden="true">🧰</span> <b>Udstyr:</b> ' + H(P.equipment) + ' · ⏱️ ' + P.minutes + '</p>';
    h += '<div class="levels" role="radiogroup" aria-label="Vælg trin">' + P.levels.map(L => '<button type="button" role="radio" aria-checked="' + (L.n === n) + '" class="lvl' + (L.n === n ? ' sel' : '') + '" data-ptlvl="' + L.n + '"><b>' + L.name + '</b><span>' + L.sub + '</span></button>').join('') + '</div>';
    const L = P.levels[n - 1];
    L.items.forEach((it, i) => { const e = ex(it.id);
      h += '<a class="ex-item pt-item" href="#/oevelse/' + encodeURIComponent(it.id) + '">' + (e ? thumbHtml(e) : '') + '<div class="txt"><strong>' + (i + 1) + '. ' + H(itemName(it)) + '</strong><span>' + doseText(it) + '</span></div><span class="check" aria-hidden="true" style="color:#8a857a">›</span></a>'; });
    const isCur = P.id === active();
    h += isCur ? '<p class="pt-cur"><span class="cur-tag">Dit program nu</span></p><a class="btn start" href="#/pt/traening"><span class="start-main">' + icon('play') + 'Start ' + L.name + '</span></a>'
      : '<button type="button" class="btn start" id="ptChoose"><span class="start-main">' + icon('check') + 'Vælg som mit program</span></button>';
    h += '<div class="card hint-card"><h3>📈 Sådan bliver du stærkere</h3><p style="margin:0">Hver øvelse har et interval, fx 8–15. Start i bunden. Når du kan lave toppen i alle sæt, og det føles højst 8 ud af 10 hårdt, lægger appen op til mere næste gang. Når det sker i alle øvelser to gange i træk, er du klar til næste trin.</p></div>';
    h += '<details class="card fold stop"><summary>⚠️ Hvornår skal du skrue ned?</summary><p>' + H(PT_RULE) + '</p></details>';
    $app.innerHTML = h; hydrateMedia($app);
    $app.querySelectorAll('[data-ptlvl]').forEach(b => b.onclick = () => { setLevel(P.id, Number(b.dataset.ptlvl)); programView(pid); });
    const ch = document.getElementById('ptChoose'); if (ch) ch.onclick = () => { setActive(P.id); localStorage.removeItem(KEY_DRAFT); toast(P.name + ' er nu dit program.'); programView(pid); };
  }

  /* ---------- Træning: én øvelse ad gangen med film, sæt-log og anstrengelse ---------- */
  function draftGet(pid) {
    const n = levelOf(pid), L = program(pid).levels[n - 1];
    let d = rj(KEY_DRAFT, null);
    if (!d || d.dato !== today() || d.prog !== pid || d.trin !== n) d = { dato: today(), prog: pid, trin: n, ex: L.items.map(it => ({ id: it.id, sets: [], rpe: null })) };
    return d;
  }
  const draftSave = d => wj(KEY_DRAFT, d);
  const RPE = [[3, 'Let'], [5, 'Til at klare'], [7, 'Hårdt'], [8, 'Meget hårdt'], [10, 'Max']];
  function session(idx) {
    const pid = active(), P = program(pid), n = levelOf(pid), L = P.levels[n - 1], d = draftGet(pid);
    let i = Number(idx); if (!(i >= 0 && i < L.items.length)) i = 0;
    const it = L.items[i], e = ex(it.id), rec = d.ex[i], adv = advice(it);
    setHeader(L.name + ' · ' + (i + 1) + ' af ' + L.items.length, '#/'); setTab('home');
    const unit = it.hold ? 'sek.' : 'gentagelser';
    let h = '<div class="ex-head"><span class="badge lv' + Math.min(n, 3) + '">' + H(P.short) + ' · ' + L.name + '</span><span class="ex-pos">Øvelse ' + (i + 1) + ' af ' + L.items.length + '</span></div>';
    h += '<h2 class="ex-title">' + H(itemName(it)) + '</h2>';
    h += e && typeof figFilmHtml === 'function' ? figFilmHtml(e) : '';
    h += '<div class="dose"><span aria-hidden="true">🔁</span><span>' + doseText(it) + (it.hold ? '' : '. Roligt tempo – kvalitet før antal.') + '</span></div>';
    h += '<p class="pt-advice">💡 ' + H(adv.msg) + '</p>';
    h += '<div class="card pt-sets"><h3>Dine sæt</h3>';
    for (let s = 0; s < it.sets; s++) { const v = rec.sets[s] || {};
      h += '<div class="pt-set" data-set="' + s + '"><span class="pt-sn">Sæt ' + (s + 1) + '</span>' +
        '<label><span class="vh">' + unit + '</span><input type="number" inputmode="numeric" min="0" max="300" class="pt-reps" aria-label="Sæt ' + (s + 1) + ': ' + unit + '" placeholder="' + adv.goal + '" value="' + (v.reps != null ? H(v.reps) : '') + '"> ' + (it.hold ? 'sek.' : 'stk.') + '</label>' +
        (simple() ? '' : '<label class="pt-kg-l"><input type="number" inputmode="decimal" min="0" max="300" step="0.5" class="pt-kg" aria-label="Sæt ' + (s + 1) + ': ekstra kg (valgfrit)" placeholder="+kg" value="' + (v.kg != null ? H(v.kg) : '') + '"></label>') +
        '<button type="button" class="pt-fill" data-fill="' + s + '" aria-label="Sæt ' + (s + 1) + ': lavet som foreslået">✓ ' + adv.goal + '</button></div>';
    }
    h += (simple() ? '<p class="hint">Tryk på ✓ når et sæt er lavet – eller skriv, hvor mange du nåede.</p>' : '<p class="hint">Tryk på ✓ når et sæt er lavet som foreslået. Kg er valgfrit – kun hvis du har ekstra vægt på (fx en rygsæk).</p>') + '</div>';
    h += '<div class="card pt-rpe"><h3>Hvor hårdt var det?</h3><div class="seg pt-rpe-seg" role="radiogroup" aria-label="Anstrengelse">' + RPE.map(([v, t]) =>
      '<button type="button" role="radio" class="seg-b' + (rec.rpe === v ? ' sel' : '') + '" aria-checked="' + (rec.rpe === v) + '" data-rpe="' + v + '"><b>' + v + '</b><small>' + t + '</small></button>').join('') + '</div>' +
      '<p class="hint">' + (simple() ? 'Sigt efter 7–8: hårdt, men du kan stadig gøre det pænt.' : '0 = ingen anstrengelse, 10 = det hårdeste du kan. Sigt efter 7–8: de sidste gentagelser er hårde, men teknikken holder.') + '</p></div>';
    const last = i === L.items.length - 1;
    h += '<div class="pt-nav">' + (i > 0 ? '<a class="btn secondary" href="#/pt/traening/' + (i - 1) + '">‹ Forrige</a>' : '') +
      (last ? '<button type="button" class="btn" id="ptFinish">✓ Gem træningen</button>' : '<a class="btn" id="ptNext" href="#/pt/traening/' + (i + 1) + '">Næste: ' + H(itemName(L.items[i + 1])) + ' ›</a>') + '</div>';
    h += '<a class="btn secondary pt-howto" href="#/oevelse/' + encodeURIComponent(it.id) + '" data-ptback="' + H(it.id) + '">📋 Sådan gør du – trin for trin</a>';
    h += '<details class="card fold stop"><summary>⚠️ Det må gerne være hårdt – men ikke gøre ondt</summary><p>' + H(PT_RULE) + '</p></details>';
    $app.innerHTML = h;
    if (typeof initFigFilm === 'function') initFigFilm($app);
    const hw = $app.querySelector('[data-ptback]'); if (hw) hw.onclick = () => { try { sessionStorage.setItem('hjo_pt_back', JSON.stringify({ id: hw.dataset.ptback, hash: location.hash })); } catch (er) {} };
    const read = () => { rec.sets = [];
      $app.querySelectorAll('.pt-set').forEach(r => { const reps = r.querySelector('.pt-reps').value, kgEl = r.querySelector('.pt-kg'), kg = kgEl ? kgEl.value : null;
        if (reps !== '') { const o = { reps: Math.max(0, Math.min(300, Math.round(Number(reps)) || 0)) }; if (kg != null && kg !== '' && Number(kg) > 0) o.kg = Math.min(300, Math.round(Number(kg) * 2) / 2); rec.sets.push(o); } });
      draftSave(d); };
    $app.querySelectorAll('input').forEach(x => x.addEventListener('change', read));
    $app.querySelectorAll('[data-fill]').forEach(b => b.onclick = () => { const r = $app.querySelector('.pt-set[data-set="' + b.dataset.fill + '"] .pt-reps'); r.value = adv.goal; read(); });
    $app.querySelectorAll('[data-rpe]').forEach(b => b.onclick = () => { read(); rec.rpe = Number(b.dataset.rpe); draftSave(d); $app.querySelectorAll('[data-rpe]').forEach(x => { const s = x === b; x.classList.toggle('sel', s); x.setAttribute('aria-checked', s); }); });
    const nx = document.getElementById('ptNext'); if (nx) nx.addEventListener('click', read);
    const fin = document.getElementById('ptFinish'); if (fin) fin.onclick = () => { read(); finish(d); };
  }
  function finish(d) {
    const done = d.ex.filter(x => x.sets.length);
    if (!done.length) { toast('Skriv mindst ét sæt, før du gemmer.'); return; }
    const a = logAll().filter(s => !(s.dato === d.dato && s.prog === d.prog && s.trin === d.trin));
    a.push({ dato: d.dato, prog: d.prog, trin: d.trin, ex: done, t: Date.now() }); saveLog(a);
    localStorage.removeItem(KEY_DRAFT);
    if (typeof checkBadges === 'function') checkBadges(false);
    summary(d);
  }
  function summary(d) {
    setHeader('Godt trænet!', '#/'); setTab('home');
    const L = program(d.prog).levels[d.trin - 1], reps = d.ex.reduce((s, x) => s + x.sets.filter(() => true).reduce((t, y) => t + (Number(y.reps) || 0), 0), 0);
    let h = '<div class="card pt-summary"><h2>💪 Træningen er gemt</h2><p>' + L.name + ' · ' + d.ex.filter(x => x.sets.length).length + ' af ' + L.items.length + ' øvelser · ' + d.ex.reduce((s, x) => s + x.sets.length, 0) + ' sæt</p>';
    const tops = L.items.filter(it => { const e = d.ex.find(x => x.id === it.id); return e && e.sets.length >= it.sets && e.sets.every(s => Number(s.reps) >= (it.hold || it.reps)[1]); });
    if (tops.length) h += '<p>🎯 Toppen nået i: <b>' + tops.map(itemName).map(H).join(', ') + '</b>. Næste gang lægger appen op til mere.</p>';
    h += '<p class="muted">Træningen er kun gemt på denne telefon.</p></div><a class="btn" href="#/uge">Se dine fremskridt</a><a class="btn secondary" href="#/">Til forsiden</a>';
    $app.innerHTML = h;
    if (typeof confetti === 'function' && !prefersReducedMotion()) try { confetti(); } catch (e) { /* */ }
  }

  /* ---------- Fremskridt ---------- */
  function progress() {
    setHeader('Fremgang'); setTab('uge');
    const all = logAll(), g = weekGoal(), mon = mondayOf(new Date());
    let h = all.length ? '' : '<div class="card pt-empty"><h3>Her kan du følge med</h3><p>Når du har gemt din første træning, ser du her, hvor mange gange du har trænet, og hvordan du bliver stærkere i hver øvelse.</p><a class="btn" href="#/pt/traening">▶ Start din første træning</a></div>';
    h += '<div class="card pt-week"><h3>Denne uge</h3><p class="pt-big"><b>' + sessionsThisWeek() + '</b> af ' + g + ' træninger</p><p class="muted">🔥 ' + weekStreak() + ' ' + (weekStreak() === 1 ? 'uge' : 'uger') + ' i træk med ugemålet nået · ' + all.length + ' træninger i alt</p></div>';
    // søjler: træninger pr. uge, seneste 8 uger
    const weeks = []; for (let w = 7; w >= 0; w--) { const m = addDays(mon, -7 * w), a = dateKey(m), b = dateKey(addDays(m, 7)); weeks.push({ m, n: all.filter(s => s.dato >= a && s.dato < b).length }); }
    const mx = Math.max(g, ...weeks.map(w => w.n));
    h += '<div class="card"><h3>Træninger pr. uge</h3><svg class="pt-bars" viewBox="0 0 320 130" role="img" aria-label="Træninger pr. uge de sidste 8 uger">' +
      '<line x1="0" x2="320" y1="' + (110 - 100 * g / mx) + '" y2="' + (110 - 100 * g / mx) + '" stroke="#f08c3a" stroke-dasharray="4 4"/>' +
      weeks.map((w, i) => '<rect x="' + (i * 40 + 8) + '" y="' + (110 - 100 * w.n / mx) + '" width="24" height="' + (100 * w.n / mx) + '" rx="4" fill="#2f8a6a"/><text x="' + (i * 40 + 20) + '" y="125" font-size="13" text-anchor="middle" fill="#4f5a55">u' + weekNumber(w.m) + '</text>').join('') + '</svg><p class="hint">Den stiplede linje er dit ugemål (' + g + ').</p></div>';
    // pr. øvelse: bedste sæt og udvikling
    const ids = []; all.forEach(s => s.ex.forEach(e => { if (!ids.includes(e.id)) ids.push(e.id); }));
    if (ids.length) {
      h += '<h2>Dine øvelser</h2>';
      ids.forEach(id => {
        const hist = all.filter(s => s.ex.some(e => e.id === id)).map(s => { const e = s.ex.find(x => x.id === id); return { dato: s.dato, best: Math.max(...e.sets.map(x => Number(x.reps) || 0)), tot: e.sets.reduce((t, x) => t + (Number(x.reps) || 0), 0), kg: Math.max(0, ...e.sets.map(x => Number(x.kg) || 0)), rpe: e.rpe } });
        const it = PT_PROGRAMS.flatMap(p => p.levels.flatMap(l => l.items)).find(x => x.id === id) || { id }, hold = !!it.hold;
        const first = hist[0], lastH = hist[hist.length - 1], best = Math.max(...hist.map(x => x.best));
        const mxT = Math.max(...hist.map(x => x.tot), 1), pts = hist.slice(-10).map((x, i, a) => (a.length === 1 ? 150 : i * 300 / (a.length - 1)) + ',' + (46 - 40 * x.tot / mxT)).join(' ');
        h += '<div class="card pt-exprog" data-ptex="' + H(id) + '"><b>' + H(itemName(it)) + '</b><p class="muted small">Bedste sæt: <b>' + best + (hold ? ' sek.' : ' stk.') + '</b>' + (lastH.kg ? ' · +' + String(lastH.kg).replace('.', ',') + ' kg' : '') + ' · ' + hist.length + ' gange' +
          (hist.length > 1 ? ' · i alt ' + (lastH.tot - first.tot >= 0 ? '+' : '') + (lastH.tot - first.tot) + (hold ? ' sek.' : ' gentagelser') + ' siden første gang' : '') + '</p>' +
          '<svg viewBox="-4 0 308 50" class="pt-spark" aria-hidden="true"><polyline fill="none" stroke="#2f8a6a" stroke-width="3" points="' + pts + '"/></svg></div>';
      });
      h += '<h2>Seneste træninger</h2>';
      all.slice(-10).reverse().forEach(s => {
        const L = program(s.prog).levels[s.trin - 1] || { name: 'Trin ' + s.trin };
        h += '<div class="card pt-hist"><b>' + H(s.dato.split('-').reverse().join('/')) + ' · ' + H(L.name) + '</b><ul>' + s.ex.map(e => { const it = { id: e.id, name: (PT_PROGRAMS.flatMap(p => p.levels.flatMap(l => l.items)).find(x => x.id === e.id) || {}).name };
          return '<li>' + H(itemName(it)) + ': ' + e.sets.map(x => x.reps + (x.kg ? ' (+' + String(x.kg).replace('.', ',') + ' kg)' : '')).join(' · ') + (e.rpe ? ' – ' + e.rpe + '/10' : '') + '</li>'; }).join('') + '</ul>' +
          '<button type="button" class="btn small secondary" data-ptdel="' + s.t + '">Slet</button></div>';
      });
    } else h += '<div class="card"><p>Her kan du følge dine fremskridt, når du har gemt din første træning.</p><a class="btn" href="#/pt/traening">Start træningen</a></div>';
    h += '<a class="card more-row" href="#/maerker"><span class="mi">🏅</span><span><b>Mærker</b><small>Dine mærker og streaks</small></span><span class="chev">›</span></a>';
    h += '<p class="hint">Din træningslog gemmes kun på denne telefon og sendes ingen steder hen.</p>';
    $app.innerHTML = h;
    $app.querySelectorAll('[data-ptdel]').forEach(b => b.onclick = () => { if (!confirm('Slet denne træning?')) return; saveLog(logAll().filter(s => String(s.t) !== b.dataset.ptdel)); toast('Træningen er slettet.'); progress(); });
  }

  /* ---------- Velkomstspørgsmål ---------- */
  function questions(step) {
    const i = Number(step) || 0, Q = PT_QUESTIONS;
    if (step === 'resultat') return result();
    const q = Q[i]; if (!q) return result();
    setHeader('Kom godt i gang', i ? '#/pt/velkommen/' + (i - 1) : '#/'); setTab('home');
    const a = rj(KEY_ANS + '_kladde', {}), cur = a[q.id];
    let h = '<p class="muted small">Spørgsmål ' + (i + 1) + ' af ' + Q.length + '</p><div class="q-bar"><i style="width:' + Math.round(i / Q.length * 100) + '%"></i></div><h2 class="q-t">' + H(q.t) + '</h2>' + (q.h ? '<p class="muted">' + H(q.h) + '</p>' : '');
    if (q.type === 'scale') h += '<div class="pt-scale"><input type="range" min="' + q.min + '" max="' + q.max + '" step="1" id="ptRange" value="' + (cur != null ? cur : '') + '" aria-label="' + H(q.t) + '"><output id="ptOut">' + (cur != null ? cur : '–') + '</output><div class="pt-scale-l"><span>' + H(q.lo) + '</span><span>' + H(q.hi) + '</span></div></div>';
    else { const sel = Array.isArray(cur) ? cur : [];
      h += '<div class="pt-opts">' + q.opts.map(([k, t]) => '<button type="button" class="card pt-opt' + (sel.includes(k) ? ' sel' : '') + '" aria-pressed="' + sel.includes(k) + '" data-opt="' + k + '">' + H(t) + '</button>').join('') +
        (q.none ? '<button type="button" class="card pt-opt' + (sel.includes('none') ? ' sel' : '') + '" aria-pressed="' + sel.includes('none') + '" data-opt="none">' + H(q.none) + '</button>' : '') + '</div>'; }
    h += '<button type="button" class="btn" id="ptQNext"' + (cur == null || (Array.isArray(cur) && !cur.length) ? ' disabled' : '') + '>' + (i === Q.length - 1 ? 'Se mit forslag' : 'Næste') + '</button>';
    if (!i) h += '<button type="button" class="btn secondary" id="ptQSkip">Spring over</button><button type="button" class="card more-row pt-to-rehab" id="ptQRehab"><span class="mi" aria-hidden="true">🩹</span><span><b>Har du ondt, eller skal du genoptræne?</b><small>Vis genoptræning i stedet</small></span><span class="chev" aria-hidden="true">›</span></button>';
    h += '<p class="hint" style="text-align:center">Ingen navn. Svarene gemmes kun på denne telefon.</p>';
    $app.innerHTML = h;
    const nextB = document.getElementById('ptQNext'), setA = v => { a[q.id] = v; wj(KEY_ANS + '_kladde', a); nextB.disabled = v == null || (Array.isArray(v) && !v.length); };
    const r = document.getElementById('ptRange'); if (r) { if (cur == null) r.value = Math.round((q.min + q.max) / 2); r.oninput = () => { document.getElementById('ptOut').textContent = r.value; setA(Number(r.value)); }; }
    $app.querySelectorAll('[data-opt]').forEach(b => b.onclick = () => {
      let v = Array.isArray(a[q.id]) ? a[q.id].slice() : []; const k = b.dataset.opt;
      if (q.type === 'one' || k === 'none') v = [k]; else { v = v.filter(x => x !== 'none'); v = v.includes(k) ? v.filter(x => x !== k) : v.concat(k); }
      setA(v); $app.querySelectorAll('[data-opt]').forEach(x => { const s = v.includes(x.dataset.opt); x.classList.toggle('sel', s); x.setAttribute('aria-pressed', s); });
    });
    nextB.onclick = () => { location.hash = i === Q.length - 1 ? '#/pt/velkommen/resultat' : '#/pt/velkommen/' + (i + 1); };
    const qr = document.getElementById('ptQRehab'); if (qr) qr.onclick = () => { localStorage.setItem(KEY_SKIP, '1'); toRehab(); };
    const sk = document.getElementById('ptQSkip'); if (sk) sk.onclick = () => { localStorage.setItem(KEY_SKIP, '1'); location.hash = '#/'; };
  }
  function result() {
    const draft = rj(KEY_ANS + '_kladde', null), a = draft && Object.keys(draft).length ? draft : answers();
    if (!a) { location.hash = '#/pt/velkommen/0'; return; }
    if (draft) { wj(KEY_ANS, Object.assign({}, a, { dato: today() })); localStorage.removeItem(KEY_ANS + '_kladde'); }
    const R = recommend(a), P = program('helkrop');
    setHeader('Dit forslag', '#/'); setTab('home');
    let h = '<div class="card pt-result"><h2>Din start: ' + H(P.name) + ', ' + P.levels[R.trin - 1].name + '</h2><p>' + P.levels[R.trin - 1].items.map(itemName).map(H).join(' · ') + '</p><p><b>Ugemål:</b> ' + R.days + ' træninger om ugen.</p></div>';
    R.notes.forEach(n => { h += '<div class="card pt-note pt-note-' + n.k + '"><p style="margin:0">' + (n.k === 'flag' ? '⚠️ ' : '💬 ') + H(n.t) + '</p></div>'; });
    if (R.prehab.length) h += '<div class="card"><h3>Øvelser til det, der driller</h3><p>Lav gerne disse øvelser som opvarmning eller på hviledage:</p>' + R.prehab.map(c => { const C = CATEGORIES.find(x => x.id === c); return C ? '<a class="btn secondary small" href="#/kategori/' + c + '">' + H(C.name) + '</a>' : ''; }).join('') + '</div>';
    h += '<button type="button" class="btn" id="ptAccept">Start med ' + P.levels[R.trin - 1].name + '</button><a class="btn secondary" href="#/pt/velkommen/0">Ret mine svar</a>';
    h += '<p class="hint">Forslaget er en vejledning, ikke en lægelig vurdering. Din træner kan altid justere det.</p>';
    $app.innerHTML = h;
    document.getElementById('ptAccept').onclick = () => { setLevel(P.id, R.trin); setActive(P.id); toast('Du starter på ' + P.levels[R.trin - 1].name + '.'); location.hash = '#/'; };
  }
  /* ---------- Øvelsesbibliotek: alle kropsvægtsøvelser efter område ---------- */
  function library(gid) {
    setHeader('Øvelsesbibliotek', '#/programmer'); setTab('prog');
    const G = PT_LIBRARY.filter(g => !gid || g.id === gid);
    let h = '<p class="lead">Alle øvelser kan laves med din egen kropsvægt – højst en stol, en væg eller en sofa. Hver øvelse har en film, dosering og en lettere og sværere variant.</p>';
    h += '<div class="chips pt-lib-nav">' + PT_LIBRARY.map(g => '<a class="chip-b' + (g.id === gid ? ' sel' : '') + '" href="#/pt/bibliotek/' + g.id + '">' + g.icon + ' ' + H(g.name) + '</a>').join('') + (gid ? '<a class="chip-b" href="#/pt/bibliotek">Alle</a>' : '') + '</div>';
    G.forEach(g => {
      h += '<h2 class="pt-h" data-ptlib="' + g.id + '">' + g.icon + ' ' + H(g.name) + '</h2>';
      g.ids.forEach(id => { const e = ex(id); if (!e) return;
        h += '<a class="ex-item pt-item" href="#/oevelse/' + encodeURIComponent(id) + '" data-ptlibex="' + H(id) + '">' + thumbHtml(e) + '<div class="txt"><strong>' + H(e.name) + '</strong><span>' + H(e.dose || '') + '</span></div><span class="check" aria-hidden="true" style="color:#8a857a">›</span></a>'; });
    });
    $app.innerHTML = h; hydrateMedia($app);
  }
  function deleteAnswers() { localStorage.removeItem(KEY_ANS); localStorage.removeItem(KEY_ANS + '_kladde'); }

  function route(parts) {
    switch (parts[1]) {
      case 'traening': return session(parts[2]);
      case 'program': return programView(parts[2]);
      case 'velkommen': return questions(parts[2]);
      case 'bibliotek': return typeof PT_LIBRARY !== 'undefined' ? library(parts[2]) : home();
      default: return home();
    }
  }
  return { on, setTarget, chrome, home, programs, progress, route, recommend, advice, readyForNext, levelOf, setLevel, active, setActive, answers, deleteAnswers, logAll, KEY_LOG, KEY_ANS, KEY_TARGET, KEY_PROG };
})();
