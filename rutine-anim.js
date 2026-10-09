/* Animationer til morgenrutinen (hælspore). Tegnet som inline SVG og styret af JavaScript,
   så bevægelsen følger nedtællingen præcist: samme ur, samme pause, samme start.
   Tempo hentes fra HAEL_MORNING_ROUTINE.steps[n].tempo (reps, cycleSec, holdSec, restSec, switchAfter).
   Ingen eksterne filer – virker offline. */
const RoutineAnim = (() => {
  const C = { bg: '#e9f1ef', floor: '#cdd9d5', floorLine: '#b5c4bf', bed: '#dfe5ef', bedDark: '#c3cbd9', duvet: '#f7f8fb', wood: '#8a6a4f',
    pants: '#5b636d', pantsDark: '#4a515a', skin: '#e2b592', skinDark: '#c79570', skinLight: '#efcaa9', nail: '#f7e1d2',
    teal: '#2f8a86', fascia: '#e8743b', guide: '#2f6f6a', accent: '#f2b544' };
  const NAMES = { pumps: 'Vip foden op og ned', circles: 'Fodcirkler', stretch: 'Stræk af fodsålen', toes: 'Krøl og spred tæerne' };
  const TEMPO_TXT = {
    pumps: t => 'Tempo: ' + fmt(t.cycleSec) + ' sek. pr. vip (op og ned)',
    circles: t => 'Tempo: ' + fmt(t.cycleSec) + ' sek. pr. cirkel · skift retning efter ' + (t.switchAfter || t.reps / 2),
    stretch: t => 'Hold ' + fmt(t.holdSec) + ' sek. · slip ' + fmt(t.restSec) + ' sek.',
    toes: t => 'Tempo: ' + fmt(t.cycleSec / 2) + ' sek. krøl · ' + fmt(t.cycleSec / 2) + ' sek. spred'
  };
  function fmt(n) { return String(Math.round(n * 10) / 10).replace('.', ','); }
  const cycleOf = t => t.cycleSec || ((t.holdSec || 0) + (t.restSec || 0)) || 1;
  const ease = x => x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x);
  const reduced = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Tilstand ud fra tiden (sek.) siden trinnet startede */
  function state(step, tSec) {
    const T = step.tempo || {}, reps = T.reps || 1, cyc = cycleOf(T);
    const t = Math.max(0, tSec), rep = Math.floor(t / cyc), done = rep >= reps;
    const p = done ? 0 : (t - rep * cyc) / cyc, inCyc = done ? 0 : t - rep * cyc;
    const st = { kind: step.anim, rep: Math.min(rep + 1, reps), reps, p, inCyc, done, label: '', dir: 1, setRep: 0, setReps: reps };
    if (done) { st.label = 'Godt – slap af'; return st; }
    if (step.anim === 'pumps') st.label = p < 0.5 ? 'Op ↑' : 'Ned ↓';
    else if (step.anim === 'circles') {
      const sw = T.switchAfter || Math.ceil(reps / 2); st.dir = rep < sw ? 1 : -1;
      st.setRep = rep < sw ? rep + 1 : rep - sw + 1; st.setReps = rep < sw ? sw : reps - sw;
      st.label = st.dir > 0 ? '↺ Den ene vej' : '↻ Den anden vej'; // samme retning som prikken i 'Forfra'-feltet
    } else if (step.anim === 'stretch') {
      const h = T.holdSec || 10; st.label = inCyc < h ? 'Hold ' + Math.max(1, Math.ceil(h - inCyc)) : 'Slip';
      st.hold = inCyc < h;
    } else if (step.anim === 'toes') st.label = p < 0.5 ? 'Krøl tæerne' : 'Spred tæerne';
    return st;
  }

  /* ---------- Tegninger ---------- */
  // Fod set fra siden. Anklen (leddet) ligger i (0,0), foden peger mod højre. Tæerne bøjer i grundleddet (MTP) og yderleddet.
  function footSide(cls, opts) {
    opts = opts || {};
    return '<g class="ra-foot ' + (cls || '') + '">' +
      '<path fill="' + C.skin + '" d="M-11,-8 C-13,2 -22,8 -21,17 C-20,26 -12,29 -2,29 C14,28 30,29 44,28 C52,27 56,24 56,19 L54,10 C42,6 26,0 12,-8 Z"/>' +
      '<path fill="' + C.skinDark + '" opacity=".35" d="M-2,29 C14,28 30,29 44,28 C50,27 54,25 55,22 C40,24 20,24 -6,25 C-12,25 -18,22 -20,19 C-20,25 -12,29 -2,29Z"/>' +
      '<ellipse cx="2" cy="2" rx="5.5" ry="4.5" fill="' + C.skinDark + '" opacity=".55"/>' +
      '<g class="ra-toe" transform="translate(50,17)">' +
        '<g class="ra-toe2" transform="translate(9,2)"><rect x="-6" y="-5" width="15" height="11" rx="5.5" fill="' + C.skinDark + '"/></g>' + // småtæer bagved
        '<rect x="-5" y="-4" width="17" height="12" rx="6" fill="' + C.skinDark + '"/>' +
        '<g class="ra-toe2" transform="translate(12,0)">' +
          '<rect x="-7" y="-7" width="18" height="14" rx="7" fill="' + C.skin + '"/>' +
          '<path fill="' + C.nail + '" d="M3,-7 C6,-7.2 9,-6.4 10,-4.6 L4,-4.4 Z"/>' +
        '</g>' +
        '<rect x="-6" y="-8" width="20" height="15.5" rx="7.5" fill="' + C.skin + '"/>' +                 // storetå, grundled
        '<path fill="none" stroke="' + C.skinDark + '" stroke-width="1" opacity=".5" d="M11,-6 C12.5,-2 12.5,2 11,6"/>' +
      '</g>' +
    '</g>';
  }
  /* ---------- Stor fod med led i tæerne (stræk og tæer) ----------
     Anklen i (0,0), foden peger mod højre, y nedad. Storetåen har 2 led, småtæerne 3 led.
     Tæerne er kæder af grupper (.ra-j), der hver drejes i sit led: negativ vinkel = op mod skinnebenet. */
  const BIG = { base: [49, 14], len: [17, 16], w: [16, 14.5] };
  const SMALL = { base: [46, 20], len: [11, 8, 7], w: [12, 11, 10] };
  function chain(spec, fill, cls, last) {
    let s = '', close = '';
    spec.len.forEach((L, k) => {
      const w = spec.w[k], x = k === 0 ? spec.base[0] : spec.len[k - 1], y = k === 0 ? spec.base[1] : 0;
      s += '<g class="ra-j ' + cls + '" data-x="' + x + '" data-y="' + y + '" transform="translate(' + x + ',' + y + ')">' +
        '<rect x="' + (-w * 0.5) + '" y="' + (-w / 2) + '" width="' + (L + w) + '" height="' + w + '" rx="' + (w / 2) + '" fill="' + fill + '"/>' +
        (k > 0 ? '<path fill="none" stroke="' + C.skinDark + '" stroke-width="1" opacity=".55" d="M' + (-w * 0.15) + ',' + (-w * 0.42) + ' q-2,' + (w * 0.42) + ' 0,' + (w * 0.84) + '"/>' : '') +
        (k === spec.len.length - 1 && last ? last(L, w) : '');
      close += '</g>';
    });
    return s + close;
  }
  function bigFoot(cls, opts) {
    opts = opts || {};
    const nail = (L, w) => '<path fill="' + C.nail + '" d="M' + (L * 0.25) + ',' + (-w * 0.5) + ' C' + (L * 0.6) + ',' + (-w * 0.56) + ' ' + (L + w * 0.3) + ',' + (-w * 0.42) + ' ' + (L + w * 0.42) + ',' + (-w * 0.12) + ' L' + (L * 0.35) + ',' + (-w * 0.2) + ' Z"/>';
    return '<g class="ra-foot ra-big ' + (cls || '') + '">' +
      chain(SMALL, C.skinDark, 'ra-small') +
      '<path fill="' + C.skin + '" d="M-11,-8 C-13,2 -22,8 -21,17 C-20,26 -12,29 -2,29 C14,28 30,29 44,28 C52,27 56,24 56,19 L54,7 C42,4 26,-1 12,-8 Z"/>' +
      '<path fill="' + C.skinDark + '" opacity=".35" d="M-2,29 C14,28 30,29 44,28 C50,27 54,25 55,22 C40,24 20,24 -6,25 C-12,25 -18,22 -20,19 C-20,25 -12,29 -2,29Z"/>' +
      (opts.fascia ? '<path class="ra-fascia" fill="none" stroke="' + C.fascia + '" stroke-width="2.6" stroke-linecap="round" opacity="0" d="M-12,26.5 C8,28.5 32,28.5 52,24"/>' : '') +
      '<ellipse cx="2" cy="2" rx="5.5" ry="4.5" fill="' + C.skinDark + '" opacity=".55"/>' +
      chain(BIG, C.skin, 'ra-bigt', nail) +
    '</g>';
  }
  function poseChain(g, sel, angles) {
    g.querySelectorAll(sel).forEach((j, k) => setT(j, 'translate(' + j.dataset.x + ',' + j.dataset.y + ') rotate(' + (angles[k] || 0).toFixed(2) + ')'));
  }
  function poseBig(g, ank, k, ankleDeg, big, small) {
    if (!g) return;
    setT(g, 'translate(' + ank[0] + ',' + ank[1] + ') scale(' + k + ') rotate(' + ankleDeg.toFixed(2) + ')');
    poseChain(g, '.ra-bigt', big); poseChain(g, '.ra-small', small);
  }
  // 2D-transformation: punkt p i et led → verdenskoordinater (ops anvendes som SVG-transform, venstre mod højre)
  function apply(ops, p) {
    let x = p[0], y = p[1];
    for (let n = ops.length - 1; n >= 0; n--) { const o = ops[n];
      if (o[0] === 't') { x += o[1]; y += o[2]; }
      else if (o[0] === 's') { x *= o[1]; y *= o[1]; }
      else { const r = o[1] * Math.PI / 180, c = Math.cos(r), s = Math.sin(r); const nx = x * c - y * s; y = x * s + y * c; x = nx; } }
    return [x, y];
  }
  function shinSide(x1, y1, x2, y2, cuff) {
    // Underben fra knæ (x1,y1) til ankel (x2,y2): bukseben øverst, bar hud nederst.
    const dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy), a = Math.atan2(dy, dx) * 180 / Math.PI - 90, c = cuff || 0.62;
    return '<g transform="translate(' + x1 + ',' + y1 + ') rotate(' + a.toFixed(2) + ')">' +
      '<path fill="' + C.skin + '" d="M-12,' + (L * c - 6) + ' C-14,' + (L * 0.8) + ' -11,' + (L - 8) + ' -10,' + L + ' L11,' + L + ' C12,' + (L - 10) + ' 13,' + (L * 0.8) + ' 13,' + (L * c - 6) + ' Z"/>' +
      '<path fill="' + C.skinDark + '" opacity=".3" d="M5,' + (L * c) + ' C8,' + (L * 0.8) + ' 9,' + (L - 8) + ' 9,' + L + ' L11,' + L + ' C12,' + (L - 10) + ' 13,' + (L * 0.8) + ' 13,' + (L * c) + ' Z"/>' +
      '<path fill="' + C.pants + '" d="M-19,-6 C-22,' + (L * 0.3) + ' -18,' + (L * 0.5) + ' -17,' + (L * c) + ' L18,' + (L * c) + ' C18,' + (L * 0.4) + ' 19,' + (L * 0.2) + ' 18,-8 Z"/>' +
      '<rect x="-18" y="' + (L * c - 5) + '" width="37" height="7" rx="3" fill="' + C.pantsDark + '"/>' +
      '<circle cx="0" cy="' + L + '" r="11" fill="' + C.skin + '"/>' +
    '</g>';
  }
  function bed() {
    return '<rect x="-10" y="64" width="128" height="62" rx="6" fill="' + C.bed + '"/>' +
      '<rect x="-10" y="104" width="128" height="22" rx="4" fill="' + C.bedDark + '"/>' +
      '<rect x="98" y="126" width="12" height="62" fill="' + C.wood + '"/>' +
      '<path fill="' + C.duvet + '" d="M-10,52 C20,44 60,46 92,56 L110,66 L-10,70 Z"/>';
  }
  function thigh(x1, x2, yc, h) {
    return '<path fill="' + C.pants + '" d="M' + x1 + ',' + (yc - h / 2) + ' L' + (x2 - h / 2) + ',' + (yc - h / 2 - 2) + ' A' + (h / 2) + ',' + (h / 2) + ' 0 0 1 ' + (x2 - h / 2) + ',' + (yc + h / 2) + ' L' + x1 + ',' + (yc + h / 2) + ' Z"/>';
  }
  function floor(y) { return '<rect x="0" y="' + y + '" width="320" height="' + (200 - y) + '" fill="' + C.floor + '"/><rect x="0" y="' + y + '" width="320" height="2" fill="' + C.floorLine + '"/>'; }

  const ANK1 = [168, 132]; // ankel i scene 1 og 2
  function sceneSitting(kind) {
    let s = floor(188) + bed() + thigh(-10, 150, 47, 34) + shinSide(138, 50, ANK1[0], ANK1[1], 0.6);
    if (kind === 'circles') s += '<g class="ra-inset"><rect x="236" y="8" width="76" height="80" rx="12" fill="#fff" opacity=".9"/>' +
      '<text x="274" y="24" text-anchor="middle" font-size="11" font-weight="700" fill="' + C.guide + '">Forfra</text>' +
      '<circle cx="274" cy="56" r="22" fill="none" stroke="' + C.guide + '" stroke-width="2" stroke-dasharray="4 4" opacity=".55"/>' +
      '<path class="ra-iarrow" fill="' + C.guide + '" d="M-5,-5 L6,0 L-5,5 Z"/><circle class="ra-idot" r="6" fill="' + C.accent + '" stroke="#fff" stroke-width="2"/></g>';
    if (kind === 'circles') s += '<path class="ra-guide" fill="none" stroke="' + C.guide + '" stroke-width="2" stroke-dasharray="4 5" opacity=".55"/>' +
      '<path class="ra-arrow" fill="' + C.guide + '" opacity=".8" d="M0,-6 L10,0 L0,6 Z"/>';
    s += '<g class="ra-ghost" opacity="0">' + footSide('g') + '</g>';
    s += footSide('main');
    if (kind === 'circles') s += '<circle class="ra-dot" r="5" fill="' + C.accent + '" stroke="#fff" stroke-width="2"/>';
    if (kind === 'pumps') s += '<g class="ra-arr" fill="none" stroke="' + C.guide + '" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" opacity=".7">' +
      '<path d="M262,120 A70,70 0 0 0 250,82"/><path class="up" d="M243,88 L250,80 L256,90"/>' +
      '<path d="M262,150 A70,70 0 0 1 248,184"/><path class="dn" d="M241,179 L247,187 L256,180"/></g>';
    return s;
  }
  /* Stræk: figur-4 på sengekanten. Højre ankel hviler på venstre knæ, højre hånd tager om tæerne
     (fingrene hen over tåspidserne og ind under tæerne) og trækker dem op mod skinnebenet. */
  const ANK3 = [112, 112], K3 = 1.75;
  function sceneStretch() {
    let s = '<rect x="0" y="0" width="320" height="200" fill="' + C.bed + '" opacity=".5"/>' +
      '<rect x="0" y="150" width="320" height="50" fill="' + C.duvet + '"/>' +
      '<path fill="' + C.teal + '" d="M-10,-10 L58,-10 C66,20 60,46 40,62 L-10,70 Z"/>' +                         // overkrop (t-shirt)
      '<path fill="' + C.pantsDark + '" d="M150,176 L196,170 L204,210 L156,210 Z"/>' +                             // venstre underben
      '<path fill="' + C.pants + '" d="M-10,160 C40,152 120,150 170,148 C196,147 210,160 206,178 C202,194 186,198 168,196 C110,194 40,200 -10,204 Z"/>' + // venstre lår + knæ
      '<g transform="translate(' + ANK3[0] + ',' + ANK3[1] + ') scale(' + K3 + ')">' + shinSide(-62, -64, 0, 0, 0.5) + '</g>';                   // højre underben på skrå
    s += '<path class="ra-arm2" fill="none" stroke="' + C.skinDark + '" stroke-width="27" stroke-linecap="round"/>' +
      '<path class="ra-arm" fill="none" stroke="' + C.skin + '" stroke-width="24" stroke-linecap="round"/>' +
      '<path fill="' + C.teal + '" d="M164,-12 L234,-12 L226,8 C210,14 186,12 172,4 Z"/>';                                // ærme
    s += '<g class="ra-ghost" opacity="0">' + bigFoot('g') + '</g>';
    s += bigFoot('main', { fascia: true });
    s += '<g class="ra-handb">' + handBack() + '</g><g class="ra-handf">' + handFingers() + '</g>';
    s += '<path class="ra-pull" fill="none" stroke="' + C.guide + '" stroke-width="4" stroke-linecap="round" opacity="0" d="M306,128 C314,96 304,66 276,50"/>' +
      '<path class="ra-pullh" fill="' + C.guide + '" opacity="0" d="M282,40 L266,47 L280,58 Z"/>';
    return s;
  }
  // Hånden tegnes i storetåens yderleds koordinater (x langs tåen, y nedad = tåens underside).
  // Håndfladen sidder foran tåspidsen, fingrene går ind under tæerne, tommelfingeren ligger let over tåen.
  function handBack() { // bageste finger (lidt mørkere) under grundleddet
    return '<path fill="none" stroke="' + C.skinDark + '" stroke-width="7.5" stroke-linecap="round" d="M38,6 C36,17 22,19 -6,15"/>';
  }
  function handFingers() {
    const f = (d, w, col) => '<path fill="none" stroke="' + col + '" stroke-width="' + w + '" stroke-linecap="round" d="' + d + '"/>';
    const d1 = 'M37,4 C33,13 20,13 4,11.5';
    return '<path fill="' + C.skin + '" stroke="' + C.skinDark + '" stroke-width="1" d="M26,-12 C34,-18 46,-14 47,-4 C48,6 42,11 34,10 C28,9 25,2 26,-12 Z"/>' + // håndflade foran tåspidsen
      f(d1, 8.2, C.skinDark) + f(d1, 6.6, C.skin) +
      '<ellipse cx="5.5" cy="11.2" rx="2.6" ry="2" fill="' + C.nail + '"/>' +
      f('M30,-11 C24,-14 16,-13 11,-10.5', 7, C.skinDark) + f('M30,-11 C24,-14 16,-13 11,-10.5', 5.6, C.skin);
  }
  /* Tæer: tæt på forfoden fra siden (venstre) og oppefra (højre) */
  const ANK4 = [-36, 106], K4 = 2.2;
  const TOP = { toes: [[206, 108, 26, 34, -22], [231, 98, 17, 29, -8], [251, 99, 16, 26, 5], [269, 104, 15, 23, 16], [285, 114, 14, 19, 28]] };
  function sceneToes() {
    let s = floor(170) + '<g transform="translate(' + ANK4[0] + ',' + ANK4[1] + ') scale(' + K4 + ')">' + shinSide(-6, -70, 0, 0, 0.5) + '</g>' +
      bigFoot('main') +
      '<rect x="168" y="0" width="152" height="200" fill="#f3f7f6"/><rect x="167" y="0" width="2" height="200" fill="' + C.floorLine + '"/>';
    s += '<g class="ra-top">' +
      TOP.toes.map((t, k) => '<g class="ra-ttoe" data-k="' + k + '" transform="translate(' + t[0] + ',' + t[1] + ')"><g class="ra-tt">' +
        '<rect x="' + (-t[2] / 2) + '" y="' + (-t[3]) + '" width="' + t[2] + '" height="' + (t[3] + 14) + '" rx="' + (t[2] / 2) + '" fill="' + C.skin + '" stroke="' + C.skinDark + '" stroke-width="1"/>' +
        '<ellipse class="ra-tnail" cx="0" cy="' + (-t[3] + t[2] * 0.48) + '" rx="' + (t[2] * 0.3) + '" ry="' + (t[2] * 0.26) + '" fill="' + C.nail + '"/>' +
        '<rect class="ra-tknuckle" x="' + (-t[2] / 2) + '" y="' + (-t[3]) + '" width="' + t[2] + '" height="' + (t[2] * 0.75) + '" rx="' + (t[2] / 2) + '" fill="' + C.skinDark + '" opacity="0"/>' +
        '</g></g>').join('') +
      '<path fill="' + C.skin + '" d="M188,210 C186,170 186,140 190,122 C194,104 210,100 230,100 C252,99 272,100 290,112 C302,120 304,140 300,165 C298,182 298,198 300,210 Z"/>' +
      '<path fill="' + C.skinDark + '" opacity=".25" d="M292,126 C300,146 296,180 298,210 L284,210 C290,180 294,150 292,126Z"/>' +
      '</g>';
    s += '<text x="84" y="190" text-anchor="middle" font-size="12" font-weight="700" fill="' + C.guide + '">Fra siden</text>' +
      '<text x="244" y="24" text-anchor="middle" font-size="12" font-weight="700" fill="' + C.guide + '" class="ra-toplbl">Oppefra</text>';
    return s;
  }
  function svg(kind) {
    const body = kind === 'stretch' ? sceneStretch() : kind === 'toes' ? sceneToes() : sceneSitting(kind);
    return '<svg class="ra-svg" viewBox="0 0 320 200" role="img" aria-label="' + (NAMES[kind] || 'Øvelse') + ' – tegnet animation" preserveAspectRatio="xMidYMid meet">' +
      '<rect width="320" height="200" fill="' + C.bg + '"/>' + body + '</svg>';
  }

  /* ---------- Positurer ---------- */
  const setT = (el, v) => { if (el) el.setAttribute('transform', v); };
  function poseFoot(g, ank, ankleDeg, toeDeg, toe2Deg, sx) {
    if (!g) return;
    setT(g, 'translate(' + ank[0] + ',' + ank[1] + ') rotate(' + ankleDeg.toFixed(2) + ')' + (sx && sx !== 1 ? ' scale(' + sx.toFixed(3) + ',1)' : ''));
    setT(g.querySelector('.ra-toe'), 'translate(50,17) rotate(' + (toeDeg || 0).toFixed(2) + ')');
    const t2 = g.querySelectorAll('.ra-toe2');
    if (t2[0]) setT(t2[0], 'translate(9,2) rotate(' + ((toe2Deg || 0) * 0.9).toFixed(2) + ')');
    if (t2[1]) setT(t2[1], 'translate(12,0) rotate(' + (toe2Deg || 0).toFixed(2) + ')');
  }
  const TOE_TIP = [73, 17]; // tåspids i fodens koordinater (til cirkel-sporet)
  function circlePose(theta) { // θ i radianer; tæerne tegner en cirkel: op/ned + frem/tilbage (perspektiv)
    return { a: 6 - 26 * Math.sin(theta), sx: 0.88 + 0.12 * Math.cos(theta) };
  }
  function tipOf(a, sx, ank) {
    const r = a * Math.PI / 180, x = TOE_TIP[0] * sx, y = TOE_TIP[1];
    return [ank[0] + x * Math.cos(r) - y * Math.sin(r), ank[1] + x * Math.sin(r) + y * Math.cos(r)];
  }
  function pumpAngle(p) { return 8 - 28 * Math.sin(2 * Math.PI * p); } // op (−20°) i første halvdel, ned (+36°) i anden
  function stretchAmount(inCyc, T) {
    const h = T.holdSec || 10;
    return inCyc < h ? ease(inCyc / 0.9) : 1 - ease((inCyc - h) / Math.min(1.2, T.restSec || 2));
  }
  function pose(root, step, st, still) {
    const svgEl = root.querySelector('.ra-svg'); if (!svgEl) return;
    const main = svgEl.querySelector('.ra-foot.main'), ghostWrap = svgEl.querySelector('.ra-ghost'), ghost = svgEl.querySelector('.ra-foot.g');
    const T = step.tempo || {};
    if (step.anim === 'pumps') {
      const a = still ? -20 : pumpAngle(st.p);
      poseFoot(main, ANK1, a, still ? -8 : Math.min(0, a * 0.4), 0);
      if (still) { poseFoot(ghost, ANK1, 36, 0, 0); ghostWrap.setAttribute('opacity', '.35'); }
      const up = svgEl.querySelector('.ra-arr .up'), dn = svgEl.querySelector('.ra-arr .dn');
      if (up && dn) { const isUp = still || st.p < 0.5; up.setAttribute('opacity', isUp ? 1 : 0.25); dn.setAttribute('opacity', still || !isUp ? 1 : 0.25); }
    } else if (step.anim === 'circles') {
      const dir = st.dir || 1, th = still ? Math.PI / 2 : 2 * Math.PI * st.p * dir;
      const cp = circlePose(th); poseFoot(main, ANK1, cp.a, 0, 0, cp.sx);
      const pts = []; for (let k = 0; k <= 48; k++) { const q = circlePose(k / 48 * 2 * Math.PI); pts.push(tipOf(q.a, q.sx, ANK1).map(v => v.toFixed(1)).join(',')); }
      svgEl.querySelector('.ra-guide').setAttribute('d', 'M' + pts.join(' L') + 'Z');
      const tip = tipOf(cp.a, cp.sx, ANK1), d = svgEl.querySelector('.ra-dot'); d.setAttribute('cx', tip[0].toFixed(1)); d.setAttribute('cy', tip[1].toFixed(1));
      const th2 = th + 0.35 * dir, q2 = circlePose(th2), t2 = tipOf(q2.a, q2.sx, ANK1), q3 = circlePose(th2 + 0.05 * dir), t3 = tipOf(q3.a, q3.sx, ANK1);
      const ang = Math.atan2(t3[1] - t2[1], t3[0] - t2[0]) * 180 / Math.PI;
      setT(svgEl.querySelector('.ra-arrow'), 'translate(' + t2[0].toFixed(1) + ',' + t2[1].toFixed(1) + ') rotate(' + ang.toFixed(1) + ')');
      // Forfra: tæerne tegner en cirkel (op = sin θ, til siden = cos θ)
      const ix = 274 + 22 * Math.cos(th), iy = 56 - 22 * Math.sin(th), id = svgEl.querySelector('.ra-idot'); id.setAttribute('cx', ix.toFixed(1)); id.setAttribute('cy', iy.toFixed(1));
      const ia = th + 0.75 * dir, tang = Math.atan2(-Math.cos(ia) * dir, -Math.sin(ia) * dir) * 180 / Math.PI;
      setT(svgEl.querySelector('.ra-iarrow'), 'translate(' + (274 + 22 * Math.cos(ia)).toFixed(1) + ',' + (56 - 22 * Math.sin(ia)).toFixed(1) + ') rotate(' + tang.toFixed(1) + ')');
      if (still) { const g = circlePose(-Math.PI / 2); poseFoot(ghost, ANK1, g.a, 0, 0, g.sx); ghostWrap.setAttribute('opacity', '.35'); }
    } else if (step.anim === 'stretch') {
      const s = still ? 1 : stretchAmount(st.inCyc, T);
      const a = 2 - 12 * s, big = [-48 * s + 4 * (1 - s), -18 * s], small = [-44 * s + 6 * (1 - s), -12 * s, -6 * s];
      poseBig(main, ANK3, K3, a, big, small);
      if (still) { poseBig(ghost, ANK3, K3, 2, [4, 0], [6, 0, 0]); ghostWrap.setAttribute('opacity', '.35'); }
      const fas = svgEl.querySelector('.ra-fascia'); if (fas) fas.setAttribute('opacity', (0.12 + 0.88 * s).toFixed(2));
      ['.ra-pull', '.ra-pullh'].forEach(c => svgEl.querySelector(c).setAttribute('opacity', (0.9 * s).toFixed(2)));
      // Hånden følger storetåens grundled: håndryg bag tæerne, fingre foran
      const ops = [['t', ANK3[0], ANK3[1]], ['s', K3], ['r', a], ['t', BIG.base[0], BIG.base[1]], ['r', big[0]], ['t', BIG.len[0], 0], ['r', big[1]]];
      const tf = 'translate(' + ANK3[0] + ',' + ANK3[1] + ') scale(' + K3 + ') rotate(' + a.toFixed(2) + ') translate(' + BIG.base[0] + ',' + BIG.base[1] + ') rotate(' + big[0].toFixed(2) + ') translate(' + BIG.len[0] + ',0) rotate(' + big[1].toFixed(2) + ')';
      setT(svgEl.querySelector('.ra-handf'), tf); setT(svgEl.querySelector('.ra-handb'), tf);
      const w = apply(ops, [38, -8]); // håndled → underarm op mod personen (øverst til venstre)
      const d = 'M' + w[0].toFixed(1) + ',' + w[1].toFixed(1) + ' C' + (w[0] - 14).toFixed(1) + ',' + (w[1] - 46).toFixed(1) + ' 214,26 200,-14';
      svgEl.querySelector('.ra-arm').setAttribute('d', d); svgEl.querySelector('.ra-arm2').setAttribute('d', d);
    } else if (step.anim === 'toes') {
      const v = still ? 1 : (1 - Math.cos(2 * Math.PI * st.p)) / 2; // 0 = strakt/spredt, 1 = krøllet
      const c = ease(v), sp = 1 - c;
      poseBig(main, ANK4, K4, 0, [-26 * c - 6 * sp, 95 * c - 2 * sp], [-30 * c - 6 * sp, 92 * c, 55 * c]); // klo: grundled op, yderled ned
      const topToes = (cc, spr) => svgEl.querySelectorAll('.ra-ttoe').forEach(g => {
        const t = TOP.toes[+g.dataset.k], ang = t[4] * (0.12 + 0.88 * spr);
        setT(g, 'translate(' + t[0] + ',' + t[1] + ') rotate(' + ang.toFixed(2) + ')');
        setT(g.querySelector('.ra-tt'), 'scale(' + (1 - 0.06 * cc).toFixed(3) + ',' + (1 - 0.62 * cc).toFixed(3) + ')');
        g.querySelector('.ra-tknuckle').setAttribute('opacity', (0.6 * cc).toFixed(2));
        g.querySelector('.ra-tnail').setAttribute('opacity', (1 - cc).toFixed(2));
      });
      topToes(c, sp);
      if (still) topToes(0, 1); // stillbillede: krøllet fra siden + spredt oppefra
    }
  }

  /* ---------- Markup + tekster ---------- */
  const STILL_LABEL = { pumps: 'Op og ned', toes: 'Krøl og spred' };
  function counterText(st) {
    if (st.kind === 'circles') return st.setRep + ' / ' + st.setReps;
    return st.rep + ' / ' + st.reps;
  }
  function markup(step) {
    const still = reduced(), T = step.tempo || {};
    return '<div class="r-anim' + (still ? ' still' : '') + '" data-anim="' + step.anim + '">' + svg(step.anim) +
      (still ? '<p class="r-still-note">Stillbillede (reduceret bevægelse er slået til). Den lyse fod viser den anden stilling.</p>' : '') + '</div>' +
      '<div class="r-count"><b class="r-rep" aria-live="off">' + counterText(state(step, 0)) + '</b>' +
      '<span class="r-phase">' + state(step, 0).label + '</span>' +
      '<small class="r-tempo">' + (TEMPO_TXT[step.anim] ? TEMPO_TXT[step.anim](T) : '') + '</small></div>';
  }
  function draw(root, step, tSec) {
    const st = state(step, tSec), animEl = root.querySelector('.r-anim');
    const still = !!(animEl && animEl.classList.contains('still'));
    if (animEl && (!still || !animEl.dataset.posed)) { pose(root, step, st, still); animEl.dataset.posed = '1'; }
    if (still && STILL_LABEL[st.kind] && !st.done) st.label = STILL_LABEL[st.kind]; // ingen blinkende tekst ved reduceret bevægelse
    const rep = root.querySelector('.r-rep'), ph = root.querySelector('.r-phase'), txt = counterText(st);
    if (rep && rep.textContent !== txt) { rep.textContent = txt; rep.dataset.rep = st.rep; }
    if (ph) { if (ph.textContent !== st.label) ph.textContent = st.label; const hf = st.hold ? '1' : '0'; if (ph.dataset.hold !== hf) ph.dataset.hold = hf; }
    return st;
  }

  /* ---------- Lyd (blødt klik, slået fra som standard) ---------- */
  const SOUND_KEY = 'hjo_rutine_lyd_v1'; let actx = null;
  const soundOn = () => localStorage.getItem(SOUND_KEY) === '1';
  function setSound(on) { localStorage.setItem(SOUND_KEY, on ? '1' : '0'); if (on) ensureAudio(); }
  function ensureAudio() { try { if (!actx) { const A = window.AudioContext || window.webkitAudioContext; if (A) actx = new A(); } if (actx && actx.state === 'suspended') actx.resume(); } catch (e) { actx = null; } }
  function tick(high) {
    if (!soundOn()) return; ensureAudio(); if (!actx) return;
    try { const t = actx.currentTime, o = actx.createOscillator(), g = actx.createGain();
      o.type = 'sine'; o.frequency.value = high ? 1320 : 880; g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.08, t + 0.005); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.07);
      o.connect(g).connect(actx.destination); o.start(t); o.stop(t + 0.08); } catch (e) { /* ingen lyd */ }
  }

  /* ---------- Afspilning, styret af nedtællingens ur ---------- */
  let raf = 0, cur = null;
  function start(root, step, clockMs) {
    stop(); cur = { root, step, clockMs, lastKey: '' };
    const loop = () => {
      if (!cur || !root.isConnected) { stop(); return; }
      const st = draw(root, step, clockMs() / 1000), key = st.done ? 'done' : st.rep + ':' + (st.kind === 'stretch' ? (st.hold ? 'h' : 's') : st.kind === 'pumps' || st.kind === 'toes' ? 'x' : 'x');
      if (cur.lastKey && key !== cur.lastKey && !st.done) tick(st.kind === 'stretch' ? st.hold : st.rep === 1 || (st.kind === 'circles' && st.setRep === 1));
      cur.lastKey = key;
      raf = requestAnimationFrame(loop);
    };
    loop();
  }
  function stop() { if (raf) cancelAnimationFrame(raf); raf = 0; cur = null; }
  return { markup, draw, start, stop, state, svg, pose, setSound, soundOn, reduced, TEMPO_TXT };
})();
