/* Kamera-træner: regler og tælle-logik (ren logik, ingen kamera og ingen DOM – testes i tools/test_coach.js).
   Input: 33 kropspunkter (MediaPipe Pose Landmarker), normaliseret 0–1 i billedet (y nedad) med "visibility".
   Tre slags regler:
   - reps:     følger én målt værdi (fx knævinkel) fra "rest" til "goal" og tilbage = 1 gentagelse. Giver korte råd.
   - hold:     tæller sekunder, mens man er i stillingen (fx står på ét ben). Tjekker, at man bliver i den.
   - presence: kameraet kan IKKE bedømme bevægelsen pålideligt (små nik, liggende, fødder tæt på). Tjekker kun, at man
               er i billedet og bevæger sig/er stille, tæller tid og opmuntrer. Det står ærligt på skærmen. */
'use strict';
const CoachRules = (() => {
  const LM = { nose: 0, earL: 7, earR: 8, shL: 11, shR: 12, elL: 13, elR: 14, wrL: 15, wrR: 16, hipL: 23, hipR: 24, knL: 25, knR: 26, anL: 27, anR: 28, heL: 29, heR: 30, toL: 31, toR: 32 };
  const SIDE = { L: { sh: 11, el: 13, wr: 15, hip: 23, kn: 25, an: 27, he: 29, to: 31, ear: 7 }, R: { sh: 12, el: 14, wr: 16, hip: 24, kn: 26, an: 28, he: 30, to: 32, ear: 8 } };
  const vis = p => (p && p.visibility != null ? p.visibility : 1);
  const d2 = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
  const mid = (a, b) => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2, visibility: Math.min(vis(a), vis(b)) });
  function ang(a, b, c) { // vinkel ved b (grader, 0–180)
    const v1 = [a.x - b.x, a.y - b.y], v2 = [c.x - b.x, c.y - b.y];
    const n = Math.hypot(...v1) * Math.hypot(...v2); if (!n) return 180;
    return Math.acos(Math.max(-1, Math.min(1, (v1[0] * v2[0] + v1[1] * v2[1]) / n))) * 180 / Math.PI;
  }
  const vAng = (u, v) => { const n = Math.hypot(...u) * Math.hypot(...v); return n ? Math.acos(Math.max(-1, Math.min(1, (u[0] * v[0] + u[1] * v[1]) / n))) * 180 / Math.PI : 0; };
  const sideVis = (lm, s, keys) => Math.min(...keys.map(k => vis(lm[SIDE[s][k]])));
  /* Vælg side: 'auto' = den side, kameraet ser bedst. 'min'/'max' = mindste/største af begge sider. */
  function perSide(lm, keys, f, how) {
    const vL = sideVis(lm, 'L', keys), vR = sideVis(lm, 'R', keys);
    if (how === 'min' || how === 'max') {
      const vals = []; if (vL > 0.4) vals.push(f(SIDE.L)); if (vR > 0.4) vals.push(f(SIDE.R));
      if (!vals.length) return null; return how === 'min' ? Math.min(...vals) : Math.max(...vals);
    }
    const s = vL >= vR ? 'L' : 'R'; if (Math.max(vL, vR) < 0.4) return null;
    return f(SIDE[s]);
  }
  const P = (lm, i) => lm[i];
  const legLen = lm => { const a = (d2(lm[23], lm[27]) + d2(lm[24], lm[28])) / 2; return a || 0.4; };
  const shW = lm => d2(lm[11], lm[12]) || 0.1;
  /* Kroppens midterlinje (fra midt mellem skuldrene ned til midt mellem hofterne). Bruger kun synlige sider. */
  function axis(lm) {
    const pick = (a, b) => vis(lm[a]) > 0.4 && vis(lm[b]) > 0.4 ? mid(lm[a], lm[b]) : (vis(lm[a]) >= vis(lm[b]) ? lm[a] : lm[b]);
    const S = pick(11, 12), H = pick(23, 24); return [H.x - S.x, H.y - S.y];
  }

  /* ---------- Målinger ---------- */
  const METRICS = {
    knee: { keys: ['hip', 'kn', 'an'], f: (lm, s) => ang(lm[s.hip], lm[s.kn], lm[s.an]) },
    hip: { keys: ['sh', 'hip', 'kn'], f: (lm, s) => ang(lm[s.sh], lm[s.hip], lm[s.kn]) },
    elbow: { keys: ['sh', 'el', 'wr'], f: (lm, s) => ang(lm[s.sh], lm[s.el], lm[s.wr]) },
    armRaise: { keys: ['hip', 'sh', 'wr'], f: (lm, s) => ang(lm[s.hip], lm[s.sh], lm[s.wr]) },      // armen i forhold til kroppen
    shoulderAbd: { keys: ['hip', 'sh', 'el'], f: (lm, s) => { const a = axis(lm); return vAng(a, [lm[s.el].x - lm[s.sh].x, lm[s.el].y - lm[s.sh].y]); } },   // armen ud fra kroppens midterlinje
    legSwing: { keys: ['sh', 'hip', 'an'], f: (lm, s) => vAng(axis(lm), [lm[s.an].x - lm[s.hip].x, lm[s.an].y - lm[s.hip].y]) }, // benet ud fra kroppens midterlinje
    trunkLean: { keys: ['sh', 'hip'], f: (lm, s) => vAng([lm[s.sh].x - lm[s.hip].x, lm[s.sh].y - lm[s.hip].y], [0, -1]) },
    headTurn: { whole: true, need: [0, 7, 8], f: lm => { const m = mid(lm[7], lm[8]), e = Math.abs(lm[7].x - lm[8].x) || 0.01; return Math.abs(lm[0].x - m.x) / e; } },
    headTilt: { whole: true, need: [7, 8], f: lm => { const a = Math.atan2(lm[7].y - lm[8].y, lm[7].x - lm[8].x) * 180 / Math.PI; let t = Math.abs(a); if (t > 90) t = 180 - t; return t; } },
    ankleGap: { whole: true, need: [11, 12, 27, 28], f: lm => Math.abs(lm[27].x - lm[28].x) / shW(lm) },
    footLift: { whole: true, need: [23, 24, 27, 28], f: lm => Math.abs(lm[27].y - lm[28].y) / legLen(lm) },
    stance: { whole: true, need: [23, 24, 27, 28], f: lm => Math.abs(lm[27].x - lm[28].x) / legLen(lm) },
    ankleY: { whole: true, need: [23, 24, 27, 28], f: lm => ((lm[27].y + lm[28].y) / 2) / legLen(lm) },     // til hæløft (mod basislinje)
    hipY: { whole: true, need: [23, 24, 27, 28], f: lm => ((lm[23].y + lm[24].y) / 2) / legLen(lm) }        // til trin og hop
  };
  function metric(lm, name, side) {
    const M = METRICS[name]; if (!M || !lm) return null;
    if (M.whole) { if (M.need.some(i => !lm[i] || vis(lm[i]) < 0.4)) return null; return M.f(lm); }
    return perSide(lm, M.keys, s => M.f(lm, s), side || 'auto');
  }

  /* ---------- Regler pr. øvelse ----------
     view: 'side' | 'front' | 'lying' | 'close'  (hvordan telefonen skal stå)
     reps: metric, side, rest, goal  (+ base: 'max'|'min' = måles mod en glidende basislinje, fx hæløft)
           holdTop (sek. i toppen), minRep (sek.; hurtigere = "Langsommere"), shallow (råd ved for lille bevægelse), form { metric, max, cue } */
  const R = {
    sitStand: { type: 'reps', view: 'side', metric: 'knee', side: 'auto', rest: 100, goal: 160, minRep: 2, shallow: 'Rejs dig helt op', form: { metric: 'trunkLean', max: 55, cue: 'Hold ryggen lige' } },
    kneeExt: { type: 'reps', view: 'side', metric: 'knee', side: 'max', rest: 100, goal: 160, minRep: 2, holdTop: 1, shallow: 'Stræk knæet helt ud' },
    squat: { type: 'reps', view: 'side', metric: 'knee', side: 'min', rest: 170, goal: 140, minRep: 2, shallow: 'Bøj lidt mere', form: { metric: 'trunkLean', max: 45, cue: 'Hold ryggen lige' } },
    lunge: { type: 'reps', view: 'side', metric: 'knee', side: 'min', rest: 165, goal: 115, minRep: 2, shallow: 'Gå lidt dybere', form: { metric: 'trunkLean', max: 30, cue: 'Hold ryggen lige' } },
    stepUp: { type: 'reps', view: 'side', metric: 'hipY', base: 'max', rest: 0, goal: 0.12, minRep: 1.5, shallow: 'Løft lidt højere' },
    stepDown: { type: 'reps', view: 'side', metric: 'hipY', base: 'min', rest: 0, goal: 0.08, minRep: 1.5, shallow: 'Bøj lidt mere' },
    bridge: { type: 'reps', view: 'lying', metric: 'hip', side: 'auto', rest: 135, goal: 162, holdTop: 3, minRep: 2, shallow: 'Løft lidt højere' },
    sideLift: { type: 'reps', view: 'front', metric: 'legSwing', side: 'max', rest: 6, goal: 20, minRep: 1.5, shallow: 'Løft lidt højere' },
    legBack: { type: 'reps', view: 'side', metric: 'legSwing', side: 'max', rest: 5, goal: 15, minRep: 1.5, shallow: 'Løft lidt højere', form: { metric: 'trunkLean', max: 25, cue: 'Hold ryggen lige' } },
    hinge: { type: 'reps', view: 'side', metric: 'hip', side: 'auto', rest: 168, goal: 125, minRep: 2, shallow: 'Bøj lidt mere i hofterne' },
    lift: { type: 'reps', view: 'side', metric: 'knee', side: 'min', rest: 165, goal: 115, minRep: 2, shallow: 'Bøj i knæene' },
    heelRaise: { type: 'reps', view: 'side', metric: 'ankleY', base: 'max', rest: 0, goal: 0.035, minRep: 3, holdTop: 1, shallow: 'Løft lidt højere' },
    hop: { type: 'reps', view: 'side', metric: 'hipY', base: 'max', rest: 0, goal: 0.03, minRep: 0 },
    birdDog: { type: 'reps', view: 'side', metric: 'hip', side: 'max', rest: 105, goal: 155, holdTop: 4, minRep: 2, shallow: 'Stræk benet helt ud' },
    row: { type: 'reps', view: 'side', metric: 'elbow', side: 'min', rest: 155, goal: 95, holdTop: 1, minRep: 2, shallow: 'Træk lidt længere' },
    wallAngel: { type: 'reps', view: 'front', metric: 'shoulderAbd', side: 'min', rest: 100, goal: 145, minRep: 3, shallow: 'Løft armene lidt højere' },
    yRaise: { type: 'reps', view: 'side', metric: 'armRaise', side: 'max', rest: 45, goal: 115, holdTop: 1, minRep: 2, shallow: 'Løft armene lidt højere' },
    headTurn: { type: 'reps', view: 'front', metric: 'headTurn', rest: 0.12, goal: 0.4, minRep: 2, shallow: 'Drej lidt mere' },
    headTilt: { type: 'reps', view: 'front', metric: 'headTilt', rest: 5, goal: 16, holdTop: 3, minRep: 2, shallow: 'Bøj lidt mere' },
    feetTogether: { type: 'hold', view: 'front', seconds: 30, rest: 10, cond: { metric: 'ankleGap', max: 0.7 }, lost: 'Saml fødderne' },
    tandem: { type: 'hold', view: 'front', seconds: 30, rest: 10, cond: { metric: 'ankleGap', max: 0.5 }, lost: 'Sæt foden foran den anden' },
    oneLeg: { type: 'hold', view: 'front', seconds: 30, rest: 10, cond: { metric: 'footLift', min: 0.05 }, lost: 'Løft foden igen' },
    calfStretch: { type: 'hold', view: 'side', seconds: 30, rest: 10, cond: { metric: 'stance', min: 0.25 }, lost: 'Sæt foden tilbage' },
    sidePlank: { type: 'hold', view: 'front', seconds: 15, rest: 10, cond: { metric: 'hip', min: 150 }, lost: 'Løft hoften igen' },
    neckIso: { type: 'hold', view: 'front', seconds: 8, rest: 5, still: true, lost: 'Hold hovedet helt stille' },
    armFwd: { type: 'reps', view: 'side', metric: 'armRaise', side: 'max', rest: 25, goal: 80, holdTop: 1, minRep: 2, shallow: 'Løft armen lidt højere', form: { metric: 'trunkLean', max: 20, cue: 'Stå rank' } },
    armSide: { type: 'reps', view: 'front', metric: 'shoulderAbd', side: 'min', rest: 20, goal: 75, minRep: 2, shallow: 'Løft armene lidt højere' },
    press: { type: 'reps', view: 'front', metric: 'shoulderAbd', side: 'min', rest: 95, goal: 150, minRep: 2, shallow: 'Pres armene helt op' },
    wallPush: { type: 'reps', view: 'side', metric: 'elbow', side: 'min', rest: 155, goal: 110, minRep: 2, shallow: 'Bøj albuerne lidt mere' },
    shoulderIso: { type: 'hold', view: 'front', seconds: 10, rest: 10, still: true, lost: 'Hold armen stille' },
    presence: { type: 'presence', view: 'side', seconds: 60 }
  };
  const pres = (view, seconds, what) => Object.assign({}, R.presence, { view, seconds, what });
  const RULES = {
    'knae-1-laarmuskel': pres('lying', 60, 'den lille spænding i låret'),
    'knae-1-rejse-hoej': R.sitStand, 'knae-1-knaestraek-siddende': R.kneeExt, 'knae-2-rejse-uden-arme': R.sitStand,
    'knae-2-trin-op': R.stepUp, 'knae-2-minisquat': R.squat, 'knae-3-rejse-et-ben': R.sitStand, 'knae-3-udfald-frem': R.lunge, 'knae-3-trin-ned': R.stepDown,
    'hofte-1-broen': R.bridge, 'hofte-1-sideloeft-liggende': Object.assign({}, R.sideLift, { view: 'lying', rest: 8, goal: 25 }), 'hofte-1-benet-bagud': R.legBack,
    'hofte-2-hoftehaengsel': R.hinge, 'hofte-2-sideloeft-staaende': R.sideLift, 'hofte-2-sidegang': pres('front', 90, 'skridtene til siden'),
    'hofte-3-broen-et-ben': R.bridge, 'hofte-3-sideloeft-elastik': R.sideLift, 'hofte-3-udfald-bagud': R.lunge,
    'balance-1-samlede-foedder': R.feetTogether, 'balance-2-tandem': R.tandem, 'balance-3-et-ben': R.oneLeg,
    'hael-1-fascie-straek': pres('close', 100, 'strækket af fodsålen'), 'hael-1-rul-under-foden': pres('close', 90, 'rulningen under foden'),
    'hael-1-laeg-straek-strakt': R.calfStretch, 'hael-1-laeg-straek-boejet': R.calfStretch, 'hael-1-isometrisk-pres': pres('side', 45, 'presset mod væggen'),
    'hael-2-haandklaede-kroel': pres('close', 60, 'tæerne'), 'hael-2-haeloeft-begge': R.heelRaise, 'hael-2-haeloeft-trin-begge': R.heelRaise,
    'hael-3-tungt-haeloeft-et-ben': R.heelRaise, 'hael-4-smaa-hop': R.hop,
    'laend-h-knaevip': pres('lying', 120, 'knævippet'), 'laend-h-baekkenvip': pres('lying', 90, 'det lille vip i bækkenet'), 'laend-h-kat-ko': pres('side', 90, 'rygbøjningen'),
    'laend-h-hvilestilling': pres('lying', 180, 'hvilestillingen'), 'laend-1-bro': R.bridge, 'laend-1-dead-bug': pres('lying', 90, 'arm- og benstrækket liggende'),
    'laend-2-fuglehund': R.birdDog, 'laend-2-sideplanke-knae': R.sidePlank, 'laend-2-hoftehaengsel': R.hinge, 'laend-3-loefteteknik': R.lift,
    'bryst-h-skulderrul': pres('front', 60, 'skulderrullet'), 'bryst-h-ribben': pres('front', 60, 'vejrtrækningen'), 'bryst-h-kat-ko': pres('side', 90, 'rygbøjningen'),
    'bryst-h-aaben-bog': pres('lying', 120, 'armbuen liggende på siden'), 'bryst-1-straek-stol': pres('side', 60, 'strækket over stoleryggen'), 'bryst-1-skulderblad': pres('front', 60, 'klemmet mellem skulderbladene'),
    'bryst-2-roning-elastik': R.row, 'bryst-2-vaegengel': R.wallAngel, 'bryst-3-roning-foroverboejet': R.row,
    'nakke-h-hagetilbage': pres('side', 60, 'den lille bevægelse med hagen'), 'nakke-h-skulderrul': pres('front', 60, 'skulderrullet'),
    'nakke-h-drej': R.headTurn, 'nakke-h-sideboej': R.headTilt, 'nakke-1-dyb-nakkeboejer': pres('lying', 120, 'det lille nik'),
    'nakke-1-isometrisk': R.neckIso, 'nakke-2-hovedloeft': pres('lying', 90, 'det lille løft af hovedet'), 'nakke-2-roning-elastik': R.row, 'nakke-3-y-loeft': R.yRaise,
    'skulder-h-pendul': pres('side', 60, 'pendulsvinget'), 'skulder-h-bordglid': pres('side', 90, 'glidet frem på bordet'),
    'skulder-h-stok-liggende': pres('lying', 90, 'armløftet med stokken'), 'skulder-h-udadrot-stok': pres('front', 90, 'drejningen af armen udad'),
    'skulder-1-loeft-frem': R.armFwd, 'skulder-1-isometrisk-udad': R.shoulderIso, 'skulder-2-udadrot-elastik': pres('front', 90, 'drejningen af armen udad mod elastikken'),
    'skulder-2-sideloeft': R.armSide, 'skulder-3-armstraek-op': R.press, 'skulder-3-vaegpres': R.wallPush,
    // Albue: håndleddets små bevægelser kan kameraet ikke bedømme pålideligt → tilstedeværelse + tid
    'albue-h-iso-strak': pres('front', 180, 'presset med hånden'), 'albue-h-iso-boej': pres('front', 180, 'presset med håndfladen'),
    'albue-h-straek-strak': pres('front', 90, 'strækket af underarmen'), 'albue-h-straek-boej': pres('front', 90, 'strækket af underarmen'),
    'albue-1-loeft-op': pres('front', 120, 'løftet med hånden'), 'albue-1-loeft-boej': pres('front', 120, 'løftet med hånden'),
    'albue-1-drej': pres('front', 120, 'drejningen af underarmen'), 'albue-2-kun-ned': pres('front', 150, 'den langsomme sænkning'),
    'albue-2-haandklaede-vrid': pres('front', 90, 'vridet med håndklædet'), 'albue-3-baere': pres('side', 60, 'turen med posen'),
    // Hånd: fingrenes bevægelser er for små til kroppens skelet → tilstedeværelse + tid
    'haand-h-knyt': pres('front', 60, 'fingrenes bevægelse'), 'haand-h-senegled': pres('front', 90, 'fingrenes stillinger'),
    'haand-h-nerveglid': pres('front', 60, 'bevægelsen af hånd og hoved'), 'haand-h-haandled': pres('front', 60, 'håndleddets bevægelse'),
    'haand-1-tommel-fingre': pres('front', 90, 'tommelen mod fingerspidserne'), 'haand-1-spred': pres('front', 60, 'fingrenes spredning'),
    'haand-2-klem-bold': pres('front', 120, 'klemmet om bolden'), 'haand-2-elastik-spred': pres('front', 90, 'fingrenes spredning mod elastikken'),
    'haand-2-tommel-elastik': pres('front', 90, 'tommelen mod elastikken'), 'haand-3-knib': pres('front', 90, 'knibet med tommel og pegefinger')
  };
  const CATEGORY_DEFAULT = { knae: 'side', hofte: 'side', balance: 'front', haelspore: 'side', laend: 'lying', bryst: 'front', nakke: 'front', skulder: 'front', albue: 'front', haand: 'front' };
  function ruleFor(e) {
    const id = typeof e === 'string' ? e : e.id;
    return RULES[id] || pres(CATEGORY_DEFAULT[(e && e.category) || ''] || 'side', 60, 'øvelsen');
  }
  const SETUP = {
    side: 'Stil telefonen på gulvet eller en stol ca. 2 meter væk, så den ser dig fra siden. Hele kroppen skal kunne ses.',
    front: 'Stil telefonen på gulvet eller en stol ca. 2 meter væk, så den ser dig forfra. Hele kroppen skal kunne ses.',
    lying: 'Læg dig på måtten, og stil telefonen på gulvet ca. 2 meter væk ved siden af dig, så den ser dig fra siden.',
    close: 'Stil telefonen ca. 1,5 meter væk, så den kan se dig og dine fødder.'
  };
  const VIEW_NAME = { side: 'fra siden', front: 'forfra', lying: 'fra siden (liggende)', close: 'tæt på' };

  const ENCOURAGE = ['Godt, fortsæt', 'Flot, bliv ved i roligt tempo', 'Husk at trække vejret roligt'];
  const PHRASES = ['Jeg kan se dig. Vi starter', 'Jeg kan ikke se dig. Sørg for, at hele kroppen er i billedet', 'Langsommere', 'Hold', 'Hold lidt længere', 'Halvvejs',
    'Godt klaret', 'Slip og hvil', 'Klar. Hold igen', 'Bliv i stillingen', 'Prøv at holde dig helt stille', 'Godt', 'Flot', 'Kameraet er slukket'].concat(ENCOURAGE);
  Object.values(R).forEach(r => { if (r.shallow) PHRASES.push(r.shallow); if (r.form) PHRASES.push(r.form.cue); if (r.lost) PHRASES.push(r.lost); });

  /* ---------- Tællere ----------
     update(lm, t) med t i sekunder. Returnerer status til skærmen; .say = tekst der skal siges (eller null). */
  function makeTracker(rule) {
    const st = { reps: 0, holdSec: 0, timeSec: 0, present: false, lastSeen: -1, missSaid: -99, cueAt: {}, saidStart: false, t0: null, motion: 0, prev: null, prevT: null, hist: [] };
    const cool = (key, t, gap) => { if (t - (st.cueAt[key] ?? -99) < gap) return false; st.cueAt[key] = t; return true; };
    const speak = [];
    const sayIt = (txt, key, t, gap) => { if (cool(key || txt, t, gap || 3)) speak.push(txt); };
    function presence(lm) {
      if (!lm || lm.length < 33) return false;
      if (rule.type === 'presence') return lm.filter(p => vis(p) > 0.5).length >= 8;
      return [11, 12, 23, 24].filter(i => vis(lm[i]) > 0.5).length >= 3;
    }
    function motionOf(lm, t) { // gennemsnitlig bevægelse af synlige punkter (skulderbredder pr. sek.)
      if (st.prev && st.prevT != null && t > st.prevT) {
        let s = 0, n = 0; for (let i = 0; i < 33; i++) if (vis(lm[i]) > 0.5 && vis(st.prev[i]) > 0.5) { s += d2(lm[i], st.prev[i]); n++; }
        const m = n ? s / n / (t - st.prevT) / shW(lm) : 0; st.motion = st.motion * 0.8 + m * 0.2;
      }
      st.prev = lm.map(p => ({ x: p.x, y: p.y, visibility: vis(p) })); st.prevT = t;
      return st.motion;
    }
    // reps
    const R1 = { phase: 'rest', peak: 0, tStart: null, tTop: null, v: null, base: null };
    function baseline(v, t) { // glidende basislinje (10 sek.)
      st.hist.push([t, v]); while (st.hist.length && t - st.hist[0][0] > 10) st.hist.shift();
      const vals = st.hist.map(h => h[1]); return rule.base === 'max' ? Math.max(...vals) : Math.min(...vals);
    }
    function stepReps(lm, t) {
      let v = metric(lm, rule.metric, rule.side); if (v == null) return;
      if (rule.base) { const b = baseline(v, t); v = rule.base === 'max' ? b - v : v - b; }
      R1.v = R1.v == null ? v : R1.v * 0.5 + v * 0.5;
      const p = (R1.v - rule.rest) / (rule.goal - rule.rest); R1.p = p;
      if (R1.phase === 'rest') {
        if (p > 0.25 && R1.tStart == null) R1.tStart = t;
        if (p > R1.peak) R1.peak = p;
        if (p >= 1) { R1.phase = 'top'; R1.tTop = t; if (rule.holdTop) sayIt('Hold', 'hold', t, 1); }
        else if (p < 0.2 && R1.peak > 0.5) { if (rule.shallow) sayIt(rule.shallow, 'shallow', t, 4); R1.peak = 0; R1.tStart = null; }
        else if (p < 0.2) { R1.peak = Math.max(0, p); R1.tStart = null; }
      } else if (p < 0.3) {
        st.reps++; const dur = t - (R1.tStart ?? R1.tTop), top = t - R1.tTop;
        if (rule.minRep && dur < rule.minRep) sayIt('Langsommere', 'slow', t, 5);
        else if (rule.holdTop && top < rule.holdTop * 0.6) sayIt('Hold lidt længere', 'holdlonger', t, 6);
        else speak.push(String(st.reps));
        R1.phase = 'rest'; R1.peak = 0; R1.tStart = null;
      }
      if (rule.form) { const f = metric(lm, rule.form.metric, 'auto'); if (f != null && f > rule.form.max) { st.formBad = (st.formBad || 0) + 1; if (st.formBad > 5) sayIt(rule.form.cue, 'form', t, 6); } else st.formBad = 0; }
    }
    // hold
    const H1 = { phase: 'wait', restLeft: 0, lostAt: null, lastT: null, spokenN: null };
    function inPos(lm) {
      if (rule.still) return st.motion < 0.35;
      if (!rule.cond) return true;
      const v = metric(lm, rule.cond.metric, 'auto'); if (v == null) return false;
      return (rule.cond.min == null || v >= rule.cond.min) && (rule.cond.max == null || v <= rule.cond.max);
    }
    function stepHold(lm, t) {
      const dt = H1.lastT == null ? 0 : Math.min(0.5, t - H1.lastT); H1.lastT = t;
      const ok = inPos(lm);
      if (H1.phase === 'rest') { H1.restLeft -= dt; if (H1.restLeft <= 0) { H1.phase = 'wait'; sayIt('Klar. Hold igen', 'again', t, 1); } return; }
      if (H1.phase === 'wait') { if (ok) { H1.phase = 'hold'; st.holdSec = 0; H1.spokenN = null; sayIt('Hold', 'hold', t, 1); } return; }
      if (ok) { H1.lostAt = null; st.holdSec += dt; }
      else { if (H1.lostAt == null) H1.lostAt = t; if (t - H1.lostAt > 0.7) { if (rule.lost) sayIt(rule.lost, 'lost', t, 4); } }
      const left = Math.ceil(rule.seconds - st.holdSec);
      if (left <= 3 && left >= 1 && left !== H1.spokenN) { H1.spokenN = left; speak.push(String(left)); }
      else if (rule.seconds >= 20 && st.holdSec >= rule.seconds / 2 && !H1.half) { H1.half = true; sayIt('Halvvejs', 'half', t, 2); }
      if (st.holdSec >= rule.seconds) { st.reps++; H1.half = false; H1.phase = 'rest'; H1.restLeft = rule.rest || 5; speak.push(st.reps >= 3 ? 'Godt klaret' : 'Slip og hvil'); }
    }
    // presence
    function stepPresence(lm, t, dt) {
      st.timeSec += dt;
      const k = Math.floor(st.timeSec / 20);
      if (k > 0 && k !== st.encK && st.timeSec < rule.seconds) { st.encK = k; speak.push(ENCOURAGE[(k - 1) % ENCOURAGE.length]); }
      if (st.timeSec >= rule.seconds && !st.doneSaid) { st.doneSaid = true; speak.push('Godt klaret'); }
    }
    function update(lm, t) {
      speak.length = 0;
      const dt = st.lastT == null ? 0 : Math.min(0.5, Math.max(0, t - st.lastT)); st.lastT = t;
      const present = presence(lm);
      if (!present) {
        if (st.present) st.lostSince = t;
        st.present = false;
        if (t - (st.lostSince ?? t) > 2 || st.lastSeen < 0) { if (t > 1.5) sayIt('Jeg kan ikke se dig. Sørg for, at hele kroppen er i billedet', 'miss', t, 12); }
        return status(false);
      }
      if (!st.present && !st.saidStart) { st.saidStart = true; speak.push('Jeg kan se dig. Vi starter'); }
      st.present = true; st.lastSeen = t;
      motionOf(lm, t);
      if (rule.type === 'reps') stepReps(lm, t);
      else if (rule.type === 'hold') stepHold(lm, t);
      else stepPresence(lm, t, dt);
      return status(true);
    }
    function status(present) {
      const s = { present, reps: st.reps, type: rule.type, say: speak.length ? speak[speak.length - 1] : null, sayAll: speak.slice() };
      if (rule.type === 'reps') { s.progress = R1.p == null ? 0 : Math.max(0, Math.min(1.2, R1.p)); s.phase = R1.phase; s.value = R1.v; }
      if (rule.type === 'hold') { s.holdSec = st.holdSec; s.phase = H1.phase; s.restLeft = Math.max(0, H1.restLeft); s.target = rule.seconds; }
      if (rule.type === 'presence') { s.timeSec = st.timeSec; s.target = rule.seconds; }
      s.motion = st.motion; s.moving = st.motion > 0.35;
      return s;
    }
    return { update, rule, state: st };
  }
  /* Skelet til tegning (par af punkter) */
  const BONES = [[11, 12], [11, 13], [13, 15], [12, 14], [14, 16], [11, 23], [12, 24], [23, 24], [23, 25], [25, 27], [24, 26], [26, 28], [27, 29], [29, 31], [27, 31], [28, 30], [30, 32], [28, 32], [7, 0], [8, 0]];
  return { LM, METRICS, metric, ang, RULES, R, ruleFor, makeTracker, SETUP, VIEW_NAME, PHRASES, BONES, ENCOURAGE };
})();
if (typeof module !== 'undefined') module.exports = CoachRules;
