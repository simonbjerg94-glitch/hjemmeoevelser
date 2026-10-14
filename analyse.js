/* v28: Gang- og squat-analyse med MediaPipe Pose (samme lokale kopi som kamera-træneren, vendor/mediapipe).
   Kamera eller en video fra telefonen – alt behandles i browseren på telefonen. Intet optages, gemmes eller sendes.
   Det er en SCREENING og ikke en diagnose. Er billedkvaliteten for dårlig, nægter analysen at vurdere.
   Test: window.__ANALYSE_FRAMES = { frames: [{ t, lm }], aspect } springer kamera/video over. */
'use strict';
const Analyse = (() => {
  const L = { sh: [11, 12], hip: [23, 24], knee: [25, 26], ank: [27, 28], heel: [29, 30], toe: [31, 32] };
  const NEED = [11, 12, 23, 24, 25, 26, 27, 28];
  const deg = r => r * 180 / Math.PI;
  const pt = (lm, i, a) => [lm[i].x * a, lm[i].y];
  const mid = (p, q) => [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2];
  const dist = (p, q) => Math.hypot(p[0] - q[0], p[1] - q[1]);
  const angle = (a, b, c) => { const v1 = [a[0] - b[0], a[1] - b[1]], v2 = [c[0] - b[0], c[1] - b[1]]; const d = (v1[0] * v2[0] + v1[1] * v2[1]) / (Math.hypot(...v1) * Math.hypot(...v2) || 1); return deg(Math.acos(Math.max(-1, Math.min(1, d)))); };
  const mean = a => a.length ? a.reduce((s, x) => s + x, 0) / a.length : 0;
  const pct = (a, p) => { const s = a.slice().sort((x, y) => x - y); return s.length ? s[Math.min(s.length - 1, Math.max(0, Math.round(p * (s.length - 1))))] : 0; };
  const smooth = (a, k) => a.map((_, i) => mean(a.slice(Math.max(0, i - k), i + k + 1)));
  const f0 = x => Math.round(x), f2 = x => Math.round(x * 100) / 100;

  /* ---------- Kvalitetstjek ---------- */
  function quality(frames, minSec) {
    const n = frames.length, dur = n > 1 ? frames[n - 1].t - frames[0].t : 0;
    const good = frames.filter(f => f.lm && NEED.every(i => f.lm[i] && (f.lm[i].visibility == null || f.lm[i].visibility > 0.5) && f.lm[i].x > 0.01 && f.lm[i].x < 0.99 && f.lm[i].y > 0.01 && f.lm[i].y < 0.995));
    const fps = dur > 0 ? n / dur : 0, share = n ? good.length / n : 0;
    const why = [];
    if (dur < minSec) why.push('Optagelsen er for kort (' + f0(dur) + ' sek.). Der skal mindst ' + minSec + ' sekunder til.');
    if (n && fps < 7) why.push('For få billeder pr. sekund (' + f0(fps) + '). Prøv i bedre lys, eller luk andre apps.');
    if (share < 0.7) why.push('Hele kroppen kunne kun ses i ' + f0(share * 100) + ' % af tiden. Hele kroppen – fra hoved til fødder – skal være i billedet hele tiden.');
    return { ok: !why.length, why, good, fps, share, dur };
  }
  function viewOf(good, a) {
    const r = good.map(f => { const lm = f.lm, sw = dist(pt(lm, 11, a), pt(lm, 12, a)), hw = dist(pt(lm, 23, a), pt(lm, 24, a)), tr = dist(mid(pt(lm, 11, a), pt(lm, 12, a)), mid(pt(lm, 23, a), pt(lm, 24, a))); return (sw + hw) / 2 / (tr || 1); });
    const m = pct(r, 0.5); return m > 0.42 ? 'front' : m < 0.24 ? 'side' : 'skraa';
  }
  const legLen = (good, a) => mean(good.map(f => mean([0, 1].map(s => dist(pt(f.lm, L.hip[s], a), pt(f.lm, L.ank[s], a))))));
  const F = (key, title, level, value, text, extra) => Object.assign({ key, title, level, value, text }, extra || {});
  const NA = (key, title, why) => F(key, title, 'na', 'Ikke målt', why);

  /* ---------- Squat ---------- */
  function squat(frames, a) {
    a = a || 1;
    const q = quality(frames, 8); if (!q.ok) return { ok: false, why: q.why, q };
    const G = q.good, view = viewOf(G, a), LL = legLen(G, a);
    if (view === 'skraa') return { ok: false, why: ['Du står skråt i forhold til kameraet. Stil dig lige forfra eller lige fra siden.'], q };
    const hy = smooth(G.map(f => mean([f.lm[23].y, f.lm[24].y])), 2), top = pct(hy, 0.1);
    const reps = []; let i = 0;
    while (i < hy.length) {
      if (hy[i] - top > 0.12 * LL) { let j = i, b = i; while (j < hy.length && hy[j] - top > 0.06 * LL) { if (hy[j] > hy[b]) b = j; j++; } reps.push(b); i = j; } else i++;
    }
    if (reps.length < 3) return { ok: false, why: ['Kameraet så kun ' + reps.length + ' squats. Lav mindst 3 rolige squats, og stå helt op imellem.'], q, view };
    const topF = G.filter((f, k) => hy[k] - top < 0.03 * LL), B = reps.map(k => G[k]);
    const at = (fr, fn) => mean(fr.map(f => fn(f.lm)));
    const knA = (lm, s) => angle(pt(lm, L.hip[s], a), pt(lm, L.knee[s], a), pt(lm, L.ank[s], a));
    const find = [];
    // Dybde
    const drop = mean(reps.map(k => hy[k] - top)) / LL, kmin = at(B, lm => Math.min(knA(lm, 0), knA(lm, 1)));
    const depth = view === 'side' ? (kmin < 95 ? 'dyb' : kmin < 125 ? 'middel' : 'lav') : (drop > 0.33 ? 'dyb' : drop > 0.2 ? 'middel' : 'lav');
    find.push(F('dybde', 'Dybde', depth === 'lav' ? 'warn' : 'ok', depth === 'dyb' ? 'Dyb' : depth === 'middel' ? 'Middel' : 'Lav', depth === 'lav' ? 'Du bøjer kun lidt i knæ og hofter. Det kan skyldes smerter, stive ankler eller svage lår- og ballemuskler.' : 'Du kommer godt ned. Hold den dybde, hvor du kan styre bevægelsen.',
      { muscles: depth === 'lav' ? 'Forsiden af låret (quadriceps) og ballerne' : '', ex: depth === 'lav' ? ['knae-1-rejse-hoej', 'knae-2-minisquat', 'ankel-1-knae-mod-vaeg'] : [], m: view === 'side' ? { knaevinkel: f0(kmin) } : { hoftefald: f2(drop) } }));
    // Knæ falder ind (valgus) – kun forfra
    if (view === 'front') {
      const med = (lm, s) => { const H = pt(lm, L.hip[s], a), K = pt(lm, L.knee[s], a), A = pt(lm, L.ank[s], a); const u = (K[1] - H[1]) / ((A[1] - H[1]) || 1e-6); const xl = H[0] + (A[0] - H[0]) * u; const midX = (pt(lm, 23, a)[0] + pt(lm, 24, a)[0]) / 2; return (K[0] - xl) * Math.sign(midX - xl) / LL; };
      const vL = at(B, lm => med(lm, 0)) - at(topF, lm => med(lm, 0)), vR = at(B, lm => med(lm, 1)) - at(topF, lm => med(lm, 1));
      const sides = [vL > 0.06 ? 'venstre' : '', vR > 0.06 ? 'højre' : ''].filter(Boolean);
      find.push(F('valgus', 'Knæene falder ind', sides.length ? 'warn' : 'ok', sides.length ? 'Ja – ' + sides.join(' og ') : 'Nej', sides.length ? 'Knæet glider ind mod midten, når du går ned (' + sides.join(' og ') + ' side). Det ses ofte ved svage hoftemuskler på ydersiden af hoften og kan belaste knæet.' : 'Knæene holder linjen over fødderne. Godt.',
        { muscles: sides.length ? 'Ydersiden af hoften (gluteus medius) og ballerne' : '', watch: sides.length ? 'Tænk "knæene peger ud over 2.–3. tå".' : '', ex: sides.length ? ['hofte-1-sideloeft-liggende', 'hofte-2-sideloeft-staaende', 'hofte-2-sidegang', 'hofte-3-sideloeft-elastik'] : [], m: { venstre: f2(vL), hoejre: f2(vR) } }));
      // Skævhed: bækkenet flytter sig til siden / hofterne i forskellig højde
      const sh = at(B, lm => { const hm = mid(pt(lm, 23, a), pt(lm, 24, a)), am = mid(pt(lm, 27, a), pt(lm, 28, a)), w = Math.abs(pt(lm, 27, a)[0] - pt(lm, 28, a)[0]) || 0.1; return (hm[0] - am[0]) / w; });
      const hd = at(B, lm => (lm[23].y - lm[24].y) / (Math.abs(pt(lm, 23, a)[0] - pt(lm, 24, a)[0]) || 0.1));
      const asym = Math.abs(sh) > 0.15 || Math.abs(hd) > 0.15;
      // Personens venstre ligger til højre i billedet, når de står forfra (x stiger mod deres venstre)
      const to = sh > 0 ? 'venstre' : 'højre';
      find.push(F('skaev', 'Skævhed', asym ? 'warn' : 'ok', asym ? 'Ja – mere vægt på ' + to + ' ben' : 'Lige', asym ? 'Du flytter vægten over på dit ' + to + ' ben, når du går ned. Det sker tit, når det andet ben gør ondt eller er svagere.' : 'Du fordeler vægten jævnt på begge ben.',
        { muscles: asym ? 'Lår og balder på det ben, du skåner' : '', watch: asym ? 'Prøv med et spejl: hold navlen midt mellem fødderne.' : '', ex: asym ? ['knae-2-trin-op', 'hofte-2-sideloeft-staaende', 'balance-3-et-ben'] : [], m: { forskydning: f2(sh), hoftehoejde: f2(hd) } }));
      find.push(NA('overkrop', 'Fremadbøjning af overkroppen', 'Måles fra siden. Optag igen fra siden for at se den.'));
      find.push(NA('haele', 'Hælene løfter sig', 'Måles fra siden.'));
    } else {
      const lean = at(B, lm => { const S = mid(pt(lm, 11, a), pt(lm, 12, a)), H = mid(pt(lm, 23, a), pt(lm, 24, a)); return deg(Math.atan2(Math.abs(S[0] - H[0]), H[1] - S[1])); });
      find.push(F('overkrop', 'Fremadbøjning af overkroppen', lean > 45 ? 'warn' : 'ok', f0(lean) + '°', lean > 45 ? 'Du læner overkroppen meget frem. Det flytter arbejdet fra lårene til ryggen og hofterne – ofte fordi anklerne er stive, eller lårene er svage.' : 'Overkroppen holder sig fint oprejst.',
        { muscles: lean > 45 ? 'Forsiden af låret; evt. stive ankler/lægge' : '', watch: lean > 45 ? 'Brystet frem og op – sæt dig, som om stolen står bag dig.' : '', ex: lean > 45 ? ['knae-2-minisquat', 'ankel-1-knae-mod-vaeg', 'hael-1-laeg-straek-boejet'] : [] }));
      const hl = lm => mean([0, 1].map(s => (lm[L.toe[s]].y - lm[L.heel[s]].y))) / LL;
      const rise = at(B, hl) - at(topF, hl);
      find.push(F('haele', 'Hælene løfter sig', rise > 0.025 ? 'warn' : 'ok', rise > 0.025 ? 'Ja' : 'Nej', rise > 0.025 ? 'Hælene slipper gulvet i bunden. Det tyder på stive ankler eller stramme lægge.' : 'Hælene bliver i gulvet. Godt.',
        { muscles: rise > 0.025 ? 'Lægmusklerne (stramhed) og ankelleddet' : '', ex: rise > 0.025 ? ['ankel-1-knae-mod-vaeg', 'hael-1-laeg-straek-strakt', 'hael-1-laeg-straek-boejet'] : [], m: { haelloeft: f2(rise) } }));
      find.push(NA('valgus', 'Knæene falder ind', 'Måles forfra. Optag igen forfra for at se den.'));
      find.push(NA('skaev', 'Skævhed', 'Måles forfra.'));
    }
    return { ok: true, kind: 'squat', view, reps: reps.length, find, q };
  }

  /* ---------- Gang ---------- */
  function gait(frames, a) {
    a = a || 1;
    const q = quality(frames, 8); if (!q.ok) return { ok: false, why: q.why, q };
    const G = q.good, view = viewOf(G, a), LL = legLen(G, a);
    if (view === 'skraa') return { ok: false, why: ['Du går skråt i forhold til kameraet. Gå lige hen imod kameraet (forfra) eller lige forbi det (fra siden).'], q };
    const t = G.map(f => f.t), find = [];
    const extrema = (s, thr) => { const e = []; for (let k = 1; k < s.length - 1; k++) { if (s[k] > thr && s[k] >= s[k - 1] && s[k] > s[k + 1]) e.push({ k, s: 1 }); if (s[k] < -thr && s[k] <= s[k - 1] && s[k] < s[k + 1]) e.push({ k, s: -1 }); }
      return e.filter((x, j) => j === 0 || x.s !== e[j - 1].s); };
    let steps;
    if (view === 'side') {
      const sep = smooth(G.map(f => (f.lm[27].x - f.lm[28].x) * a / LL), 1);
      steps = extrema(sep, 0.2);
    } else {
      const hy = smooth(G.map(f => mean([f.lm[23].y, f.lm[24].y])), 1), m = mean(hy);
      const bob = hy.map(y => (y - m) / LL), pk = []; for (let k = 1; k < bob.length - 1; k++) if (bob[k] < -0.008 && bob[k] <= bob[k - 1] && bob[k] < bob[k + 1] && (!pk.length || t[k] - t[pk[pk.length - 1]] > 0.3)) pk.push(k);
      steps = pk.map((k, j) => ({ k, s: j % 2 ? 1 : -1 }));
    }
    if (steps.length < 5) return { ok: false, why: ['Kameraet så kun ' + steps.length + ' skridt. Gå mindst 6–8 skridt i roligt tempo, så hele kroppen er i billedet.'], q, view };
    const dts = steps.slice(1).map((x, j) => t[x.k] - t[steps[j].k]);
    const cad = 60 / mean(dts);
    find.push(F('kadence', 'Skridt pr. minut', cad < 90 ? 'warn' : 'ok', f0(cad), cad < 90 ? 'Du går med ret få skridt i minuttet. Det ses ved smerter, usikkerhed eller nedsat styrke. Tempoet kan trænes op.' : 'Et almindeligt gangtempo.',
      { watch: cad < 90 ? 'Prøv korte, hurtigere skridt på dine gåture.' : '', ex: cad < 90 ? ['balance-2-tandem', 'knae-2-trin-op', 'hofte-2-sidegang'] : [] }));
    if (view === 'side') {
      const A = dts.filter((_, j) => steps[j].s > 0), B = dts.filter((_, j) => steps[j].s < 0);
      const asym = A.length && B.length ? Math.abs(mean(A) - mean(B)) / mean(dts) : 0;
      find.push(F('symmetri', 'Ens skridt', asym > 0.1 ? 'warn' : 'ok', f0((1 - asym) * 100) + ' % ens', asym > 0.1 ? 'Du står kortere tid på det ene ben end på det andet. Det er typisk, når man skåner et ben, der gør ondt eller er svagt.' : 'Skridtene er ens på begge ben.',
        { muscles: asym > 0.1 ? 'Lår, balder og læg på det ben, du skåner' : '', ex: asym > 0.1 ? ['balance-3-et-ben', 'knae-2-trin-op', 'hael-2-haeloeft-begge'] : [] }));
      const kf = [0, 1].map(s => pct(G.map(f => 180 - angle(pt(f.lm, L.hip[s], a), pt(f.lm, L.knee[s], a), pt(f.lm, L.ank[s], a))), 0.95));
      const low = Math.min(...kf);
      find.push(F('knaebøjning', 'Knæbøjning, når benet svinger frem', low < 45 ? 'warn' : 'ok', f0(kf[0]) + '° / ' + f0(kf[1]) + '°', low < 45 ? 'Knæet bøjer kun lidt, når benet svinger frem ("stivt knæ"). Det ses ved knæartrose, hævelse eller svage lårmuskler – og øger risikoen for at snuble.' : 'Knæene bøjer fint, når benet svinger frem.',
        { muscles: low < 45 ? 'Forsiden af låret og hoftebøjerne' : '', ex: low < 45 ? ['knae-1-knaestraek-siddende', 'knae-1-laarmuskel', 'knae-2-trin-op'] : [] }));
      find.push(NA('trendelenburg', 'Hoften falder (Trendelenburg)', 'Måles forfra. Gå hen imod kameraet for at se den.'));
      find.push(NA('svaj', 'Overkroppen svajer til siden', 'Måles forfra.'));
    } else {
      const tilt = smooth(G.map(f => (f.lm[23].y - f.lm[24].y) / (Math.abs(f.lm[23].x - f.lm[24].x) * a || 0.05)), 1);
      const c = mean(tilt), hiT = pct(tilt, 0.95) - c, loT = c - pct(tilt, 0.05), amp = hiT + loT;
      // tilt > 0: venstre hofte står lavest → venstre side falder, mens man står på højre ben → svag højre hofte
      const weak = hiT > loT ? 'højre' : 'venstre';
      find.push(F('trendelenburg', 'Hoften falder (Trendelenburg)', amp > 0.3 ? 'warn' : 'ok', amp > 0.3 ? 'Tegn på det – ' + weak + ' side' : 'Nej', amp > 0.3 ? 'Bækkenet falder ned til den modsatte side, når du står på dit ' + weak + ' ben. Det kan være et tegn på svage muskler på ydersiden af ' + weak + ' hofte.' : 'Bækkenet holder sig vandret, når du går.',
        { muscles: amp > 0.3 ? 'Ydersiden af ' + weak + ' hofte (gluteus medius)' : '', ex: amp > 0.3 ? ['hofte-1-sideloeft-liggende', 'hofte-2-sideloeft-staaende', 'hofte-3-sideloeft-elastik', 'balance-3-et-ben'] : [], m: { amplitude: f2(amp) } }));
      const sway = smooth(G.map(f => { const S = mid(pt(f.lm, 11, a), pt(f.lm, 12, a)), H = mid(pt(f.lm, 23, a), pt(f.lm, 24, a)), w = dist(pt(f.lm, 11, a), pt(f.lm, 12, a)) || 0.1; return (S[0] - H[0]) / w; }), 1);
      const sw = pct(sway, 0.95) - pct(sway, 0.05);
      find.push(F('svaj', 'Overkroppen svajer til siden', sw > 0.3 ? 'warn' : 'ok', sw > 0.3 ? 'Ja' : 'Nej', sw > 0.3 ? 'Du læner overkroppen ud over det ben, du står på. Det er en almindelig måde at skåne en øm eller svag hofte eller et knæ på.' : 'Overkroppen er rolig.',
        { muscles: sw > 0.3 ? 'Ydersiden af hoften og ballerne' : '', ex: sw > 0.3 ? ['hofte-2-sidegang', 'hofte-2-sideloeft-staaende'] : [], m: { svaj: f2(sw) } }));
      find.push(NA('symmetri', 'Ens skridt', 'Måles fra siden. Gå forbi kameraet for at se den.'));
      find.push(NA('knaebøjning', 'Knæbøjning', 'Måles fra siden.'));
    }
    return { ok: true, kind: 'gang', view, steps: steps.length, cadence: cad, find, q };
  }

  /* ---------- UI ---------- */
  const KIND = {
    squat: { name: 'Squat-analyse', icon: 'squat', sec: 20, front: 'Ser, om knæene falder ind, hvor dybt du kommer, og om du er skæv.', side: 'Ser dybden, hvor meget du læner overkroppen frem, og om hælene løfter sig.',
      how: 'Stå med fødderne i hoftebredde, og lav 5 rolige squats – som at sætte dig på en stol og rejse dig igen. Hold dig gerne let i en stoleryg.' },
    gang: { name: 'Gang-analyse', icon: 'walk', sec: 20, front: 'Ser, om hoften falder, og om overkroppen svajer (gå hen imod kameraet og tilbage).', side: 'Ser tempo, om skridtene er ens, og hvor meget knæet bøjer (gå forbi kameraet).',
      how: 'Gå roligt frem og tilbage 6–8 skridt hver vej i dit normale tempo – med stok eller rollator, hvis du plejer.' }
  };
  const DISC = '<p class="disclaimer" id="anDisc"><b>Vigtigt:</b> Dette er en hjælp til at se dine bevægelser – en <b>screening, ikke en diagnose</b>. Kameraet kan tage fejl. Gør det ondt, eller er du i tvivl, så spørg din fysioterapeut eller læge.</p>';
  const PRIV = '<p class="hint">' + icon('shield') + ' Billedet behandles kun på telefonen. Intet optages, gemmes eller sendes.</p>';
  function view(kind) {
    setTab('mere'); document.body.classList.remove('onboarding');
    if (!KIND[kind]) {
      setHeader('Gang- og squat-analyse', '#/mere');
      $app.innerHTML = '<h2 class="q-title">Hvordan bevæger du dig?</h2><p class="lead">Telefonens kamera ser på, hvordan du går eller bøjer knæene, og foreslår øvelser.</p>' + DISC +
        Object.keys(KIND).map(k => '<a class="card ob-choice" href="#/analyse/' + k + '" data-kind="' + k + '"><span class="oi">' + icon(KIND[k].icon) + '</span><span><b>' + KIND[k].name + '</b><span class="muted">' + KIND[k].how.split('.')[0] + '.</span></span></a>').join('') + PRIV;
      return;
    }
    const K = KIND[kind]; setHeader(K.name, '#/analyse');
    let side = 'front';
    const render = () => {
      $app.innerHTML = '<h2 class="q-title">' + K.name + '</h2>' + DISC +
        '<h3 style="margin-top:14px">1. Hvorfra skal kameraet se dig?</h3><div class="chips"><button type="button" class="chip-b' + (side === 'front' ? ' sel' : '') + '" data-v="front">Forfra</button><button type="button" class="chip-b' + (side === 'side' ? ' sel' : '') + '" data-v="side">Fra siden</button></div>' +
        '<p class="small">' + esc(K[side]) + '</p>' +
        '<div class="card"><h3>2. Sådan stiller du telefonen</h3><ul class="tips"><li>Stil telefonen op ad noget i <b>hoftehøjde</b>, ca. <b>' + (kind === 'gang' ? '3–4' : '2–3') + ' meter</b> væk' + (side === 'side' ? ', så den ser dig fra siden' : ', lige foran dig') + '.</li><li>Hele kroppen skal kunne ses – fra hoved til fødder.</li><li>Godt lys, gerne tætsiddende tøj og ingen andre i billedet.</li><li>' + esc(K.how) + '</li></ul></div>' +
        '<h3>3. Start</h3><div class="row"><button type="button" class="btn cta" id="anCam">' + icon('camera') + ' Brug kameraet</button><label class="btn secondary" id="anFileL">' + icon('upload') + ' Vælg en video<input type="file" id="anFile" accept="video/*" hidden></label></div>' + PRIV +
        '<div id="anStage"></div>';
      $app.querySelectorAll('[data-v]').forEach(b => b.onclick = () => { side = b.dataset.v; render(); });
      document.getElementById('anCam').onclick = () => run(kind, side, null);
      document.getElementById('anFile').onchange = ev => { const f = ev.target.files[0]; if (f) run(kind, side, f); };
    };
    render();
  }
  async function run(kind, side, file) {
    const K = KIND[kind], st = document.getElementById('anStage');
    if (window.__ANALYSE_FRAMES) return show(kind, window.__ANALYSE_FRAMES.frames, window.__ANALYSE_FRAMES.aspect);
    st.innerHTML = '<div class="an-stage"><video id="anVid" playsinline muted></video><canvas id="anCv"></canvas><div class="an-q" id="anQ">Indlæser …</div></div><button type="button" class="btn secondary" id="anStop">Stop og analysér</button>';
    st.scrollIntoView({ behavior: 'smooth' });
    const vid = document.getElementById('anVid'), cv = document.getElementById('anCv'), qb = document.getElementById('anQ');
    let stream = null, stop = false; const frames = [];
    document.getElementById('anStop').onclick = () => { stop = true; };
    try {
      const lmk = await Coach.getLandmarker();
      if (file) { vid.src = URL.createObjectURL(file); }
      else { stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: { ideal: 720 }, height: { ideal: 960 } }, audio: false }); vid.srcObject = stream; }
      await vid.play();
      const t0 = performance.now(); let last = -1;
      await new Promise(res => {
        const tick = () => {
          if (stop || (file ? vid.ended : (performance.now() - t0) / 1000 > K.sec)) return res();
          if (vid.currentTime !== last && vid.readyState >= 2) {
            last = vid.currentTime; const now = performance.now();
            const r = lmk.detectForVideo(vid, now), lm = r && r.landmarks && r.landmarks[0];
            frames.push({ t: file ? vid.currentTime : (now - t0) / 1000, lm: lm || null });
            drawSkel(cv, vid, lm);
            const vis = lm ? NEED.filter(i => lm[i].visibility > 0.5).length : 0;
            qb.className = 'an-q' + (vis < NEED.length ? ' bad' : '');
            qb.textContent = vis < NEED.length ? 'Hele kroppen kan ikke ses – træd lidt længere væk' : file ? 'Analyserer videoen …' : 'Godt – bliv ved (' + Math.max(0, Math.ceil(K.sec - (now - t0) / 1000)) + ' sek.)';
          }
          requestAnimationFrame(tick);
        };
        tick();
      });
    } catch (e) {
      st.innerHTML = '<div class="card stop"><h3>Kameraet kunne ikke startes</h3><p>' + (e && e.name === 'NotAllowedError' ? 'Appen fik ikke lov til at bruge kameraet. Giv lov i telefonens indstillinger, eller vælg en video.' : 'Prøv igen, eller vælg en video.') + '</p></div>';
      return;
    } finally { if (stream) stream.getTracks().forEach(t => t.stop()); }
    show(kind, frames, (vid.videoWidth || 3) / (vid.videoHeight || 4));
  }
  function drawSkel(cv, vid, lm) {
    const w = cv.width = vid.videoWidth || 300, h = cv.height = vid.videoHeight || 400, c = cv.getContext('2d'); c.clearRect(0, 0, w, h);
    if (!lm) return;
    c.lineWidth = Math.max(3, w / 120); c.strokeStyle = '#2fae6f'; c.fillStyle = '#ff8b5f';
    [[11, 12], [11, 23], [12, 24], [23, 24], [23, 25], [25, 27], [24, 26], [26, 28], [27, 29], [29, 31], [28, 30], [30, 32], [11, 13], [13, 15], [12, 14], [14, 16]].forEach(([p, q]) => { c.beginPath(); c.moveTo(lm[p].x * w, lm[p].y * h); c.lineTo(lm[q].x * w, lm[q].y * h); c.stroke(); });
    NEED.forEach(i => { c.beginPath(); c.arc(lm[i].x * w, lm[i].y * h, c.lineWidth * 1.4, 0, 7); c.fill(); });
  }
  function show(kind, frames, aspect) {
    const R = kind === 'squat' ? squat(frames, aspect) : gait(frames, aspect), K = KIND[kind];
    setHeader('Resultat', '#/analyse/' + kind);
    let h = '<h2 class="q-title" id="anResult">' + K.name + ': resultat</h2>';
    if (!R.ok) {
      h += '<div class="card stop" id="anRefuse"><h3>' + icon('alert') + ' Kameraet kan ikke vurdere dette</h3><p>Billedkvaliteten var ikke god nok til en sikker vurdering, så vi gætter ikke:</p><ul class="tips">' + R.why.map(w => '<li>' + esc(w) + '</li>').join('') + '</ul></div>' +
        '<a class="btn cta" href="#/analyse/' + kind + '">Prøv igen</a>' + DISC;
      $app.innerHTML = h; return R;
    }
    h += '<p class="lead">Set ' + (R.view === 'front' ? 'forfra' : 'fra siden') + ' · ' + (kind === 'squat' ? R.reps + ' squats' : R.steps + ' skridt') + ' · god billedkvalitet (' + Math.round(R.q.share * 100) + ' %)</p>' + DISC;
    R.find.forEach(f => {
      h += '<div class="card find ' + f.level + '" data-f="' + f.key + '"><h3>' + esc(f.title) + '<span class="lv">' + esc(f.value) + '</span></h3><p>' + esc(f.text) + '</p>' +
        (f.muscles ? '<p class="small"><b>Muligvis svage eller stramme:</b> ' + esc(f.muscles) + '</p>' : '') + (f.watch ? '<p class="small"><b>Hold øje med:</b> ' + esc(f.watch) + '</p>' : '') + '</div>';
    });
    const ids = [...new Set(R.find.flatMap(f => f.ex || []))].slice(0, 6), list = ids.map(id => exercises.find(e => e.id === id)).filter(Boolean);
    h += '<div class="card" id="anPlan"><h3>Forslag til øvelser</h3>' + (list.length ? list.map(e => '<a class="plan-ex" href="#/oevelse/' + encodeURIComponent(e.id) + '">' + thumbHtml(e) + '<span><b>' + esc(e.name) + '</b><br><span class="muted small">' + esc(e.dose || '') + '</span></span></a>').join('') +
      '<p class="small" style="margin-top:8px"><b>Dosis:</b> 3 dage om ugen i 6–8 uger. Start let – smerte op til 3 er i orden. Lav så en ny analyse og se forskellen.</p>' : '<p>Kameraet fandt ingen tydelige tegn på problemer. Bliv ved med at bevæge dig – fx dit nuværende program og daglige gåture.</p>') + '</div>';
    h += '<div class="card"><h3>Gode råd</h3><ul class="tips"><li>Gentag gerne analysen fra den anden vinkel (' + (R.view === 'front' ? 'fra siden' : 'forfra') + ') for at se det hele.</li><li>Kameraet er en hjælp, ikke et facit: lyset, tøjet og vinklen påvirker målingen.</li><li>Får du nye eller stærkere smerter, så se "Hvornår skal du til læge?".</li></ul></div>';
    $app.innerHTML = h;
    return R;
  }
  return { view, squat, gait, quality, show };
})();
