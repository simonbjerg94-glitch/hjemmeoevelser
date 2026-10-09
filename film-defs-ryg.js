/* Tempo-film til Ryg og nakke (lænd, brystryg, nakke). Bruger FigFilm fra film-engine.js.
   Samme figur som de andre film. Fase-teksterne bruges også af stemmen (voice.js). */
'use strict';
(() => {
  const FF = typeof FigFilm !== 'undefined' ? FigFilm : require('./film-engine.js');
  const { R, C, rot, add, sub, mul, lerp, define, FILMS } = FF;
  const FLOOR = 420, ANK = 404, MAT = 248;
  const S = (W, H) => ({ W: W || 320, H: H || 440, floor: FLOOR, view: 'side' });
  const L = (W, H) => ({ W: W || 440, H: H || 270, floor: 252, view: 'side' });
  const FRONT = () => ({ W: 320, H: 440, floor: FLOOR, view: 'front' });
  const f1 = FF.f1, P2 = FF.P2;
  const copy = (id, src, extra) => { const F = Object.assign({}, FILMS[src], extra || {}); define(id, F); };
  const tag = (x, y, txt) => '<rect x="' + x + '" y="' + y + '" width="' + (txt.length * 6.6 + 16) + '" height="22" rx="11" fill="#fff" stroke="' + C.guide + '" stroke-width="1.5"/>' +
    '<text x="' + (x + 8) + '" y="' + (y + 15) + '" font-family="sans-serif" font-size="12" font-weight="700" fill="' + C.guide + '">' + txt + '</text>';
  const matTop = (x0, y0, x1, y1) => '<rect x="' + x0 + '" y="' + y0 + '" width="' + (x1 - x0) + '" height="' + (y1 - y0) + '" rx="14" fill="' + C.mat + '" opacity=".55"/>';
  const dash = (pts) => '<path fill="none" stroke="' + C.guide + '" stroke-width="2.5" stroke-dasharray="5 5" stroke-linecap="round" opacity=".7" d="M' + pts.map(P2).join(' L') + '"/>';
  const arc = (c, r, a0, a1) => { const p = a => [c[0] + r * Math.cos(a * Math.PI / 180), c[1] + r * Math.sin(a * Math.PI / 180)]; return '<path fill="none" stroke="' + C.guide + '" stroke-width="2.5" stroke-dasharray="5 5" opacity=".7" d="M' + P2(p(a0)) + ' A' + r + ',' + r + ' 0 0 ' + (a1 > a0 ? 1 : 0) + ' ' + P2(p(a1)) + '"/>'; };
  const stool = (x0, x1, top) => '<rect x="' + x0 + '" y="' + top + '" width="' + (x1 - x0) + '" height="10" rx="3" fill="' + C.wood + '"/>' +
    '<rect x="' + (x0 + 4) + '" y="' + (top + 10) + '" width="7" height="' + (MAT - top - 10) + '" fill="' + C.woodDark + '"/><rect x="' + (x1 - 11) + '" y="' + (top + 10) + '" width="7" height="' + (MAT - top - 10) + '" fill="' + C.woodDark + '"/>';

  /* ---------- fælles stillinger ---------- */
  // Liggende på ryggen (set fra siden, hovedet til venstre), knæene bøjet og fødderne i gulvet
  const SUP_HIP = [226, MAT - 16], SUP_SH = [126, MAT - 16];
  const supine = (extra) => Object.assign({ hip: SUP_HIP, trunkTo: SUP_SH, curve: 0, nod: 0, chin: 0, legF: { ank: [318, MAT - 16] }, legN: { ank: [326, MAT - 16] }, armF: { hand: [206, MAT - 7], straight: 1 }, armN: { hand: [214, MAT - 6], straight: 1 } }, extra || {});
  // På alle fire (set fra siden, hovedet til højre)
  const Q_HIP = [150, MAT - 98];
  const quad = (extra) => Object.assign({ hip: Q_HIP, trunk: 90, nod: 0, curve: 0,
    legF: { th: -2, kn: 90, pf: 84 }, legN: { th: 2, kn: 92, pf: 84 }, armF: { hand: [246, MAT - 7], straight: 1 }, armN: { hand: [254, MAT - 6], straight: 1 } }, extra || {});
  // Siddende på stol (set fra siden)
  const SEAT = 322, SIT_HIP = [98, SEAT - 12];
  const sit = (extra) => Object.assign({ hip: SIT_HIP, trunk: 2, nod: 0, chin: 0, curve: 0, shrug: [0, 0], legF: { ank: [172, ANK] }, legN: { ank: [178, ANK] }, armF: { sa: 6, ef: 40 }, armN: { sa: 4, ef: 44 } }, extra || {});
  const chair = (o) => () => R.chairSide(52, 132, SEAT, FLOOR, o);
  // Siddende set forfra: lårene peger mod os (forkortet)
  const FS_HIP = [160, 300];
  const sitFront = (extra) => Object.assign({ hip: FS_HIP, headTilt: 0, headTurn: 0, breath: 0, legR: { knee: [146, 334], ank: [142, ANK] }, legL: { knee: [174, 334], ank: [178, ANK] },
    armR: { hand: [130, 318] }, armL: { hand: [190, 318] } }, extra || {});
  const kneeCaps = J => ['R', 'L'].map(k => { const g = J.legs[k]; return '<ellipse cx="' + f1(g.knee[0]) + '" cy="' + f1(g.knee[1] - 4) + '" rx="15" ry="13" fill="#68707a"/><ellipse cx="' + f1(g.knee[0] - 2) + '" cy="' + f1(g.knee[1] - 8) + '" rx="7" ry="5" fill="#8a929b"/>'; }).join('');
  const chairFront = () => '<rect x="104" y="200" width="112" height="112" rx="8" fill="' + C.wood + '"/><rect x="100" y="304" width="120" height="14" rx="4" fill="' + C.woodDark + '"/>' +
    '<rect x="106" y="318" width="8" height="102" fill="' + C.woodDark + '"/><rect x="206" y="318" width="8" height="102" fill="' + C.woodDark + '"/>';
  const UP_VB = [20, 90, 280, 290];
  // Forstørrelse af hoved og nakke (små bevægelser): lys figur = udgangsstilling, mørk = nu. Centreret om udgangsstillingens hoved.
  const headInset = (o) => (P, J) => {
    const h0 = FF.sideFig(o.neutral).J.head, [cx, cy] = o.c, r = o.r, s = o.s, id = 'zi-' + o.id;
    const view = (Q, op) => '<g opacity="' + op + '" transform="translate(' + cx + ' ' + cy + ') scale(' + s + ') translate(' + f1(-h0[0] - (o.dx || 0)) + ' ' + f1(-h0[1] - (o.dy || 0)) + ')">' + FF.sideFig(Q, {}).svg + '</g>';
    return '<line x1="' + f1(J.head[0]) + '" y1="' + f1(J.head[1]) + '" x2="' + cx + '" y2="' + cy + '" stroke="' + C.guide + '" stroke-width="1.5" stroke-dasharray="3 4" opacity=".6"/>' +
      '<defs><clipPath id="' + id + '"><circle cx="' + cx + '" cy="' + cy + '" r="' + r + '"/></clipPath></defs><circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="#f7f8f7"/>' +
      '<g clip-path="url(#' + id + ')">' + (o.floor != null ? (() => { const y = cy + s * (o.floor - h0[1] - (o.dy || 0)); return '<rect x="' + (cx - r) + '" y="' + f1(y) + '" width="' + 2 * r + '" height="' + r + '" fill="' + C.towel + '"/><line x1="' + (cx - r) + '" x2="' + (cx + r) + '" y1="' + f1(y) + '" y2="' + f1(y) + '" stroke="' + C.towelDark + '" stroke-width="2"/>'; })() : '') + view(o.neutral, 0.28) + view(P, 1) + (o.arrow ? o.arrow(P, J) : '') + '</g>' +
      '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="none" stroke="' + C.guide + '" stroke-width="2.5"/>' + tag(cx - 38, cy + r - 8, 'Forstørret');
  }; // beskåret til overkroppen (nakkeøvelser)

  /* ================= LÆND ================= */
  // Knævip liggende – set fra siden og lidt oppefra; knæene vipper mod dig og væk fra dig
  (() => {
    const H = SUP_HIP, KX = 56, KUP = 74, AX = 100, ZX = 0.18, ZY = 0.42;           // 3D: knæ 56 frem og 74 op; fødderne 100 frem
    const pr = (x, up, z) => [H[0] + x + z * ZX, H[1] - up + z * ZY];                 // enkel skrå projektion (z = mod kameraet)
    const P = deg => { const r = deg * Math.PI / 180, leg = zl => ({ knee: pr(KX, KUP * Math.cos(r), KUP * Math.sin(r) + zl), ank: pr(AX, 0, zl), fa: 0 });
      return supine({ phi: deg, hipOffF: [-10 * ZX, -10 * ZY], hipOffN: [10 * ZX, 10 * ZY], legF: leg(-10), legN: leg(10), armF: { hand: [196, MAT - 9], straight: 1 }, armN: { hand: [204, MAT - 4], straight: 1 } }); };
    define('laend-h-knaevip', Object.assign(L(), {
      vb: [20, 90, 400, 175],
      tempo: 'Lig på ryggen med bøjede knæ og fødderne i underlaget. Lad knæene falde roligt til den ene side og så til den anden – kun så langt, det er rart. 10 gange til hver side.',
      poses: { mid: P(0), a: P(52), b: P(-48) }, start: 'mid',
      seq: [{ to: 'a', d: 3, k: 'op', l: 'Til den ene side', count: false }, { d: 1, k: 'hold', l: 'Slap af', count: false }, { to: 'mid', d: 2, k: 'ned', l: 'Tilbage', count: false },
        { to: 'b', d: 3, k: 'op', l: 'Til den anden side', count: false }, { d: 1, k: 'hold', l: 'Slap af', count: false }, { to: 'mid', d: 2, k: 'ned', l: 'Tilbage', count: false }],
      still: 3.2, ghost: 'mid',
      under: () => '<path fill="' + C.mat + '" opacity=".75" d="M34,' + (MAT - 10) + ' L418,' + (MAT - 10) + ' L436,' + (MAT + 12) + ' L18,' + (MAT + 12) + ' Z"/>' +
        '<rect x="70" y="' + (MAT - 30) + '" width="64" height="18" rx="9" fill="#ffffff" stroke="#d3d8dc" stroke-width="2"/>',
      over: (P, J, c) => { const k = J.legs.N.knee, d = (P.phi || 0); if (Math.abs(d) < 6) return '';
        const to = d > 0 ? add(k, [10, 26]) : add(k, [-6, -22]); return R.arrow(add(k, d > 0 ? [-6, -10] : [2, 10]), to, C.accent); }
    }));
  })();

  // Bækkenvip liggende
  define('laend-h-baekkenvip', Object.assign(L(), {
    vb: [20, 110, 400, 150],
    tempo: 'Lig på ryggen med bøjede knæ. Pres lænden blidt ned mod underlaget (vip bækkenet), hold 3 sek., og slip igen. 10 gange.',
    poses: { arch: supine({ curve: -7 }), flat: supine({ curve: 1.5 }) }, start: 'arch',
    seq: [{ to: 'flat', d: 2, k: 'op', l: 'Pres lænden ned', count: false }, { d: 3, k: 'hold', l: 'Hold' }, { to: 'arch', d: 2, k: 'ned', l: 'Slip', count: false }, { d: 1, k: 'pause', l: 'Hvil', count: false }],
    still: 3.5, ghost: 'arch',
    under: () => R.mat(40, 425, MAT + 4),
    over: (P, J, c) => (c.key === 'op' || c.key === 'hold') ? R.arrow(J.W(0, 26), add(J.W(0, 26), [0, 18]), C.accent) : ''
  }));

  // Kat-ko på alle fire (bruges i både lænd og brystryg)
  define('laend-h-kat-ko', Object.assign(L(), {
    vb: [20, 60, 400, 200],
    tempo: 'På alle fire: rund ryggen langsomt op som en kat (3 sek.), og lad den så synke let ned (3 sek.). 10 gange i roligt tempo.',
    poses: { mid: quad({ nod: 10 }), cat: quad({ curve: 28, nod: 38 }), cow: quad({ curve: -15, nod: -24 }) }, start: 'mid',
    seq: [{ to: 'cat', d: 3, k: 'op', l: 'Rund ryggen', count: false }, { d: 1, k: 'hold', l: 'Hold', count: false }, { to: 'cow', d: 3, k: 'ned', l: 'Svaj let', count: false }, { d: 1, k: 'hold', l: 'Hold', count: false }, { to: 'mid', d: 1.5, k: 'pause', l: 'Tilbage', count: false }],
    still: 3.5, ghost: 'mid', under: () => R.mat(40, 425, MAT + 4), figOpt: () => ({ bare: true })
  }));
  copy('bryst-h-kat-ko', 'laend-h-kat-ko', { tempo: 'På alle fire: rund ryggen op mellem skulderbladene (3 sek.), og lad brystet synke let ned (3 sek.). 10 gange i roligt tempo.' });

  // Hvilestilling: på ryggen med underbenene på en stol
  (() => {
    const P = (b) => supine({ curve: -1 - b * 2.5, legF: { th: 178, kn: 90, pf: 0 }, legN: { th: 182, kn: 92, pf: 0 }, armF: { hand: [178, MAT - 33 - b * 3] }, armN: { hand: [190, MAT - 33 - b * 3] } });
    define('laend-h-hvilestilling', Object.assign(L(), {
      vb: [20, 80, 400, 180],
      tempo: 'Lig på ryggen med underbenene på en stol eller sofa (90° i hofter og knæ). Træk vejret roligt: ind i 4 sek., ud i 6 sek. Bliv liggende 2–5 minutter.',
      poses: { ud: P(0), ind: P(1) }, start: 'ud',
      seq: [{ to: 'ind', d: 4, k: 'op', l: 'Ånd ind', lin: true }, { to: 'ud', d: 6, k: 'ned', l: 'Ånd ud', lin: true }],
      repLabel: 'Vejrtrækning', still: 4, ghost: null,
      under: () => R.mat(40, 425, MAT + 4), back: () => stool(282, 372, 156)
    }));
  })();

  // Broen
  copy('laend-1-bro', 'hofte-1-broen', { tempo: '2 sek. op · hold 3 sek. · 2 sek. ned. Spænd let i maven og ballerne. Lige linje fra skuldre til knæ – ikke svaj i lænden.' });

  // Dead bug (modificeret): modsat arm og ben strækkes ud
  (() => {
    const base = { th: 180, kn: 90, pf: 0 }, up = { sa: 180, ef: 0 };
    const P = (lf, ln, af, an) => supine({ curve: 1.5, legF: lf, legN: ln, armF: af, armN: an });
    define('laend-1-dead-bug', Object.assign(L(), {
      vb: [20, 40, 400, 220],
      tempo: 'Lig på ryggen, knæ og arme i vejret. Stræk langsomt det ene ben og den modsatte arm ud (3 sek.), og kom tilbage (3 sek.). Lænden bliver i gulvet. 6–10 til hver side.',
      poses: { start: P(base, base, up, up), a: P(base, { th: 104, kn: 8, pf: 0 }, { sa: -96, ef: 0 }, up), b: P({ th: 104, kn: 8, pf: 0 }, base, up, { sa: -96, ef: 0 }) }, start: 'start',
      seq: [{ to: 'a', d: 3, k: 'op', l: 'Stræk ud', count: false }, { d: 1, k: 'hold', l: 'Hold', count: false }, { to: 'start', d: 3, k: 'ned', l: 'Tilbage', count: false },
        { to: 'b', d: 3, k: 'op', l: 'Stræk ud', count: false }, { d: 1, k: 'hold', l: 'Hold', count: false }, { to: 'start', d: 3, k: 'ned', l: 'Tilbage', count: false }],
      still: 3.3, ghost: 'start', under: () => R.mat(40, 425, MAT + 4)
    }));
  })();

  // Fuglehund: modsat arm og ben strækkes ud på alle fire
  (() => {
    const armOut = { hand: [Q_HIP[0] + 212, Q_HIP[1] - 4], straight: 1 }, legOut = { th: -88, kn: 0, pf: 2 };
    define('laend-2-fuglehund', Object.assign(L(), {
      vb: [0, 60, 440, 200],
      tempo: 'På alle fire: stræk den ene arm frem og det modsatte ben bagud (2 sek.), hold 5 sek. med ryggen helt rolig, og sæt ned (2 sek.). Skift side. 6–10 til hver side.',
      poses: { mid: quad({ nod: 8 }), a: quad({ nod: 2, armN: armOut, legF: legOut }), b: quad({ nod: 2, armF: armOut, legN: legOut }) }, start: 'mid',
      seq: [{ to: 'a', d: 2, k: 'op', l: 'Stræk ud', count: false }, { d: 5, k: 'hold', l: 'Hold' }, { to: 'mid', d: 2, k: 'ned', l: 'Sæt ned', count: false },
        { to: 'b', d: 2, k: 'op', l: 'Stræk ud', count: false }, { d: 5, k: 'hold', l: 'Hold' }, { to: 'mid', d: 2, k: 'ned', l: 'Sæt ned', count: false }],
      still: 4, ghost: 'mid', under: () => R.mat(20, 430, MAT + 4), figOpt: () => ({ bare: true })
    }));
  })();

  // Sideplanke på knæ og underarm (set forfra, figuren ligger på højre side). Albuen står lige under skulderen; kun hoften løftes.
  (() => {
    const K = [304, MAT - 10], SH = MAT - 64, TH = 88;
    const rotP = (p, ang, c) => { c = c || K; const r = ang * Math.PI / 180, d = sub(p, c); return add(c, [d[0] * Math.cos(r) - d[1] * Math.sin(r), d[0] * Math.sin(r) + d[1] * Math.cos(r)]); };
    const D = Math.sqrt(182 * 182 - (K[1] - SH) ** 2), Sw0 = [K[0] - D, SH];           // skulderens plads (fast)
    const P = lift => ({ lift });
    const geo = P => {
      const aUp = Math.atan2(K[1] - SH, D) * 180 / Math.PI, a = 4 + (aUp - 4) * P.lift, ar = a * Math.PI / 180;
      const hipW = [K[0] - TH * Math.cos(ar), K[1] - TH * Math.sin(ar)], ang = a - 90;
      const v = sub(Sw0, hipW), beta = Math.atan2(v[0], -v[1]) * 180 / Math.PI, tilt = beta - ang;
      const toL = w => rotP(w, -ang, hipW);
      const Q = { hip: hipW, tilt, legR: { knee: toL([K[0] - 2, K[1] + 2]) }, legL: { knee: toL([K[0] + 4, K[1] - 4]) }, armL: { hand: toL(add(hipW, [-6, -30])), side: 1, flat: 0.6 }, headTilt: 0 };
      const Jl = FF.frontJoints(Object.assign({}, Q, { armR: {} })), SR = rotP(Jl.arms.R.S, ang, hipW);
      Q.armR = { el: toL([SR[0] + 2, MAT - 8]), hand: toL([SR[0] + 30, MAT - 5]) };
      return { Q, ang, hipW };
    };
    define('laend-2-sideplanke-knae', Object.assign({ W: 440, H: 270, floor: 252, view: 'custom' }, {
      vb: [0, 40, 440, 220],
      tempo: 'Lig på siden på underarmen med albuen lige under skulderen og knæene bøjet. Løft hoften, så du er lige fra knæ til skulder (2 sek.), hold 10 sek., og sænk roligt. 3–5 gange til hver side.',
      poses: { down: P(0), up: P(1) }, start: 'down',
      seq: [{ to: 'up', d: 2, k: 'op', l: 'Løft hoften', count: false }, { d: 10, k: 'hold', l: 'Hold' }, { to: 'down', d: 2, k: 'ned', l: 'Sænk', count: false }, { d: 2, k: 'pause', l: 'Hvil', count: false }],
      still: 6, ghost: 'down',
      draw: P => { const g = geo(P); return '<g transform="rotate(' + f1(g.ang) + ' ' + f1(g.hipW[0]) + ' ' + f1(g.hipW[1]) + ')">' + FF.frontFig(g.Q, {}).svg + '</g>'; },
      under: () => R.mat(20, 430, MAT + 4),
      over: (P, J, c) => c.key === 'op' ? (() => { const g = geo(P); return R.arrow(add(g.hipW, [0, 4]), add(g.hipW, [0, -22]), C.accent); })() : ''
    }));
  })();

  // Hoftehængsel (løfteteknik uden vægt)
  copy('laend-2-hoftehaengsel', 'hofte-2-hoftehaengsel', { tempo: 'Ca. 2–3 sek. ned · 2 sek. op. Bøj i hofterne med ret ryg – skaftet rører baghoved, skulderblade og haleben hele vejen.' });

  // Løft en kasse fra gulvet
  (() => {
    const P = (hip, trunk, kneeBack) => ({ hip, trunk, nod: -trunk * 0.35, legF: { ank: [150, ANK] }, legN: { ank: [154, ANK] } });
    define('laend-3-loefteteknik', Object.assign(S(), {
      tempo: 'Stå tæt ved kassen. Bøj i hofter og knæ med ret ryg (3 sek.), tag fat, og rejs dig med kassen tæt ind til kroppen (3 sek.). Sæt den ned på samme måde. 8–10 gange.',
      poses: { up: P([150, 232], 4), down: P([106, 300], 44) }, start: 'up',
      seq: [{ to: 'down', d: 3, k: 'ned', l: 'Bøj ned', count: false }, { d: 1, k: 'hold', l: 'Tag fat', count: false }, { to: 'up', d: 3, k: 'op', l: 'Rejs dig', count: false }, { d: 1.5, k: 'hold', l: 'Stå', count: false },
        { to: 'down', d: 3, k: 'ned', l: 'Sæt ned', count: false }, { d: 1, k: 'pause', l: 'Slip', count: false }, { to: 'up', d: 3, k: 'op', l: 'Rejs dig', count: false }],
      still: 3.2, ghost: 'up',
      mod: (P, c) => { const J = FF.sideJoints(Object.assign({}, P, { armF: {}, armN: {} })), kd = Math.max(0, Math.min(1, (P.hip[1] - 232) / 68));
        const carry = c.i >= 2 && c.i <= 4, grip = [200, ANK - 24];
        const hand = carry ? lerp(add(J.S, [34, 92]), grip, kd) : lerp(add(J.S, [8, 106]), grip, kd);
        P.armN = { hand }; P.armF = { hand: add(hand, [-5, -2]) }; P._box = carry ? add(hand, [4, 18]) : [204, ANK - 6]; return P; },
      under: (P) => { const b = P._box || [204, ANK - 6]; return ''; },
      figOpt: P => ({ front: () => { const b = P._box; return '<rect x="' + f1(b[0] - 26) + '" y="' + f1(b[1] - 22) + '" width="52" height="40" rx="3" fill="#c9a36b" stroke="#a37e4a" stroke-width="2"/><path stroke="#a37e4a" stroke-width="2" d="M' + f1(b[0] - 26) + ',' + f1(b[1] - 8) + ' h52"/>'; } })
    }));
  })();

  /* ================= BRYSTRYG ================= */
  // Skulderrul siddende (bruges også i nakke)
  define('bryst-h-skulderrul', Object.assign(S(), {
    vb: [10, 100, 300, 340],
    tempo: 'Sid godt på stolen. Løft skuldrene op mod ørerne, rul dem tilbage og ned i en stor, rolig cirkel (ca. 4 sek. pr. omgang). 10 gange.',
    poses: { n: sit(), up: sit({ shrug: [1, 17] }), back: sit({ shrug: [-14, 7] }), down: sit({ shrug: [-5, -4] }) }, start: 'n',
    seq: [{ to: 'up', d: 1.3, k: 'op', l: 'Op', count: false }, { to: 'back', d: 1.3, k: 'hold', l: 'Tilbage', count: false }, { to: 'down', d: 1.2, k: 'ned', l: 'Ned', count: false }, { to: 'n', d: 0.8, k: 'pause', l: 'Slap af', count: false }],
    still: 1.3, ghost: 'n', back: chair(),
    over: (P, J) => '<ellipse cx="' + f1(J.S[0] - 3) + '" cy="' + f1(J.S[1] - 4) + '" rx="13" ry="14" fill="none" stroke="' + C.guide + '" stroke-width="2.5" stroke-dasharray="4 4" opacity=".75"/>'
  }));
  copy('nakke-h-skulderrul', 'bryst-h-skulderrul');

  // Ribbensvejrtrækning siddende (set forfra)
  (() => {
    const P = b => sitFront({ breath: b, armR: { hand: [131 - b * 3, 252], side: -1, flat: 0.5 }, armL: { hand: [189 + b * 3, 252], side: 1, flat: 0.5 } });
    define('bryst-h-ribben', Object.assign(FRONT(), {
      vb: [20, 110, 280, 320],
      tempo: 'Sid ret, og læg hænderne på siden af de nederste ribben. Træk vejret ind gennem næsen, så ribbenene skubber hænderne ud (4 sek.), og pust langsomt ud (6 sek.). 6–8 gange.',
      poses: { ud: P(0), ind: P(1) }, start: 'ud',
      seq: [{ to: 'ind', d: 4, k: 'op', l: 'Ånd ind', lin: true }, { to: 'ud', d: 6, k: 'ned', l: 'Ånd ud', lin: true }],
      repLabel: 'Vejrtrækning', still: 4, ghost: 'ud', back: chairFront, figOpt: () => ({ overLegs: kneeCaps }),
      over: (P, J) => P.breath > 0.15 ? R.arrow([116, 236], [104 - P.breath * 6, 236], C.accent) + R.arrow([204, 236], [216 + P.breath * 6, 236], C.accent) : ''
    }));
  })();

  // Åben bog – liggende på siden, set forfra og lidt fra fodenden. Den øverste arm åbner som en bog, brystet drejer med.
  (() => {
    const Hw = [262, 176], ZX = 0.5, ZY = 0.36;                     // z (mod kameraet) → skærm
    const toL = w => [Hw[0] - (w[1] - Hw[1]), Hw[1] + (w[0] - Hw[0])];  // verden → figurens stående koordinater (drejet −90°)
    const pr = (base, z, up) => [base[0] + z * ZX, base[1] + z * ZY - up];
    const Stop = [Hw[0] - 100, Hw[1] - 20], Sbot = [Hw[0] - 100, Hw[1] + 20], LA = 104;
    const P = (th, turn) => ({ th, turn, hip: Hw });
    const fig = P => {
      const r = P.th * Math.PI / 180, hand = pr(Stop, LA * Math.cos(r), LA * Math.sin(r) * 0.95);
      const hTop = [Hw[0] + 2, Hw[1] - 14], hBot = [Hw[0] + 2, Hw[1] + 14];
      const kTop = pr(hTop, 80, 0), kBot = pr(hBot, 80, 0);
      const Q = { hip: Hw, tilt: 0, headTurn: P.turn, breath: 0,
        legL: { knee: toL(kTop), ank: toL([kTop[0] + 78, kTop[1] + 4]) }, legR: { knee: toL(kBot), ank: toL([kBot[0] + 78, kBot[1] + 4]) },
        armL: { hand: toL(hand), el: toL(lerp(Stop, hand, 0.52)) }, armR: { hand: toL(pr(Sbot, LA, 0)), el: toL(pr(Sbot, LA * 0.52, 0)) } };
      return Q;
    };
    define('bryst-h-aaben-bog', Object.assign({ W: 440, H: 270, floor: 270, view: 'custom' }, {
      vb: [20, 30, 400, 230],
      tempo: 'Lig på siden med bøjede knæ oven på hinanden og armene strakt frem. Før den øverste arm i en stor bue op og over til den anden side, så brystet drejer med, og kig efter hånden (3 sek.). Hold 3 sek., og kom tilbage. 8–10 til hver side.',
      poses: { closed: P(4, 0), mid: P(90, -0.5), open: P(172, -1) }, start: 'closed',
      seq: [{ to: 'mid', d: 1.5, k: 'op', l: 'Åbn', count: false, lin: true }, { to: 'open', d: 1.5, k: 'op', l: 'Åbn', count: false }, { d: 3, k: 'hold', l: 'Hold' }, { to: 'mid', d: 1.5, k: 'ned', l: 'Luk', count: false, lin: true }, { to: 'closed', d: 1.5, k: 'ned', l: 'Luk', count: false }, { d: 1, k: 'pause', l: 'Hvil', count: false }],
      still: 4.5, ghost: 'closed',
      draw: P => '<g transform="rotate(-90 ' + Hw[0] + ' ' + Hw[1] + ')">' + FF.frontFig(fig(P), {}).svg + '</g>',
      back: () => '<path fill="' + C.mat + '" opacity=".75" d="M40,' + (Hw[1] + 4) + ' L400,' + (Hw[1] + 4) + ' L436,' + (Hw[1] + 62) + ' L76,' + (Hw[1] + 62) + ' Z"/>' +
        '<ellipse cx="' + (Hw[0] - 168) + '" cy="' + (Hw[1] + 18) + '" rx="34" ry="13" fill="#fff" stroke="#d3d8dc" stroke-width="2"/>',
      under: () => { const pts = []; for (let a = 0; a <= 180; a += 10) { const r = a * Math.PI / 180; pts.push(pr(Stop, LA * Math.cos(r), LA * Math.sin(r) * 0.95)); } return dash(pts); },
      over: (P, J, c) => (c.key === 'op' || c.key === 'ned') ? (() => { const r = P.th * Math.PI / 180, h = pr(Stop, LA * Math.cos(r), LA * Math.sin(r) * 0.95), d = c.key === 'op' ? 1 : -1, r2 = (P.th + d * 22) * Math.PI / 180; return R.arrow(h, pr(Stop, LA * Math.cos(r2), LA * Math.sin(r2) * 0.95), C.accent); })() : ''
    }));
  })();

  // Stræk over stoleryggen
  (() => {
    const P = (trunk, curve) => sit({ trunk, curve, nod: -trunk * 0.3 });
    define('bryst-1-straek-stol', Object.assign(S(), {
      vb: [10, 100, 300, 340],
      tempo: 'Sid helt inde på stolen, hænderne bag hovedet. Læn dig roligt tilbage over stoleryggen (3 sek.), hold 3 sek., og kom op igen. 8–10 gange.',
      poses: { up: P(4, 0), back: P(-20, -9) }, start: 'up',
      seq: [{ to: 'back', d: 3, k: 'ned', l: 'Læn dig tilbage', count: false }, { d: 3, k: 'hold', l: 'Hold' }, { to: 'up', d: 3, k: 'op', l: 'Op igen', count: false }, { d: 1, k: 'pause', l: 'Hvil', count: false }],
      still: 4.5, ghost: 'up', back: chair({ backH: 74 }),
      mod: P => { const J = FF.sideJoints(Object.assign({}, P, { armF: {}, armN: {} })), u = J.u, n = J.n, head = add(J.W(5, 132), [0, 0]);
        P.armN = { hand: add(head, add(mul(n, -16), mul(u, 6))), elbowFwd: 1 }; P.armF = { hand: add(head, add(mul(n, -18), mul(u, 4))), elbowFwd: 1 }; return P; }
    }));
  })();

  // Skulderbladsklem (set bagfra)
  (() => {
    const hx = 160;
    const P = q => ({ hip: [hx, 227], back: true, legR: { ank: [hx + 16, ANK] }, legL: { ank: [hx - 16, ANK] }, sq: q,
      armR: { hand: [hx + 36 - q * 5, 236 - q * 4], side: 1, flat: 0.8 }, armL: { hand: [hx - 36 + q * 5, 236 - q * 4], side: -1, flat: 0.8 } });
    define('bryst-1-skulderblad', Object.assign(FRONT(), {
      vb: [20, 60, 280, 380],
      tempo: 'Stå eller sid ret med armene ned langs siden. Træk skulderbladene sammen og lidt ned (2 sek.), hold 5 sek., og slip. 10 gange. (Set bagfra.)',
      poses: { a: P(0), b: P(1) }, start: 'a',
      seq: [{ to: 'b', d: 2, k: 'op', l: 'Klem', count: false }, { d: 5, k: 'hold', l: 'Hold' }, { to: 'a', d: 2, k: 'ned', l: 'Slip', count: false }, { d: 1, k: 'pause', l: 'Hvil', count: false }],
      still: 4, ghost: 'a',
      figOpt: P => ({ blades: J => { const q = P.sq || 0; let s = '';
        for (const sx of [-1, 1]) { const x0 = sx * (9 - q * 5); s += '<path fill="#1b5a57" stroke="#7fc4bf" stroke-width="1.5" opacity="' + f1(0.55 + q * 0.4) + '" d="M' + P2(J.W(x0, 90)) + ' L' + P2(J.W(x0 + sx * 15, 88)) + ' L' + P2(J.W(x0 + sx * 3, 58)) + ' Z"/>'; }
        return s; }, front: J => (P.sq || 0) > 0.3 ? R.arrow(J.W(-46, 70), J.W(-20, 72), C.accent) + R.arrow(J.W(46, 70), J.W(20, 72), C.accent) : '' })
    }));
  })();

  // Roning med elastik (bruges også i nakke)
  (() => {
    const hip = [140, 228], anchor = [296, 262];
    const P = (hand) => ({ hip, trunk: 2, nod: 0, legF: { ank: [136, ANK] }, legN: { ank: [150, ANK] }, armF: { hand: add(hand, [-4, -2]) }, armN: { hand } });
    define('bryst-2-roning-elastik', Object.assign(S(), {
      vb: [10, 80, 310, 360],
      tempo: 'Elastikken sidder fast i et dørhåndtag. Træk albuerne tilbage langs kroppen, og klem skulderbladene sammen (2 sek.), hold 2 sek., og slip langsomt (3 sek.). 2–3 sæt × 10–12.',
      poses: { out: P([252, 262]), in: P([176, 268]) }, start: 'out',
      seq: [{ to: 'in', d: 2, k: 'op', l: 'Træk', count: false }, { d: 2, k: 'hold', l: 'Hold' }, { to: 'out', d: 3, k: 'ned', l: 'Slip langsomt', count: false }, { d: 0.6, k: 'pause', l: 'Klar', count: false }],
      still: 3, ghost: 'out',
      back: () => '<rect x="292" y="40" width="40" height="' + (FLOOR - 40) + '" fill="#d9d2c3"/><rect x="292" y="40" width="4" height="' + (FLOOR - 40) + '" fill="#bfb6a3"/><rect x="288" y="256" width="14" height="10" rx="3" fill="#8a8f96"/>',
      figOpt: () => ({ front: J => R.bandLine(anchor, J.arms.N.hd) }),
      under: (P, J) => R.bandLine(anchor, J.arms.F.hd)
    }));
  })();
  copy('nakke-2-roning-elastik', 'bryst-2-roning-elastik');

  // Vægengle (set forfra, ryggen mod væggen)
  (() => {
    const hx = 160, hy = 227;
    const P = (hR, hL) => ({ hip: [hx, hy], legR: { ank: [hx - 18, ANK] }, legL: { ank: [hx + 18, ANK] }, armR: { hand: hR, side: 1, flat: 1 }, armL: { hand: hL, side: -1, flat: 1 } });
    define('bryst-2-vaegengel', Object.assign(FRONT(), {
      vb: [0, 20, 320, 410],
      tempo: 'Stå med ryggen og baghovedet mod væggen. Arme og albuer mod væggen i "W". Glid langsomt armene op (3 sek.) og ned igen (3 sek.) uden at ryggen svajer. 8–10 gange.',
      poses: { w: P([96, 98], [224, 98]), y: P([118, 30], [202, 30]) }, start: 'w',
      seq: [{ to: 'y', d: 3, k: 'op', l: 'Op', count: false }, { d: 1, k: 'hold', l: 'Hold', count: false }, { to: 'w', d: 3, k: 'ned', l: 'Ned', count: false }, { d: 1, k: 'pause', l: 'Slap af', count: false }],
      still: 3.5, ghost: 'w',
      back: () => '<rect x="0" y="0" width="320" height="' + FLOOR + '" fill="#e8e4da"/>'
    }));
  })();

  // Foroverbøjet roning med vandflaske
  (() => {
    const P = (k) => ({ hip: [122, 231], trunk: 50, nod: -12, legF: { ank: [150, ANK], kneeBack: 0 }, legN: { ank: [156, ANK] }, k });
    define('bryst-3-roning-foroverboejet', Object.assign(S(), {
      vb: [10, 60, 310, 380],
      tempo: 'Bøj i hofterne med ret ryg, og støt den ene hånd på et bord. Træk flasken op mod hoften med albuen tæt ind (2 sek.), og sænk langsomt (3 sek.). 2–3 sæt × 10 pr. arm.',
      poses: { down: P(0), up: P(1) }, start: 'down',
      seq: [{ to: 'up', d: 2, k: 'op', l: 'Træk op', count: false }, { d: 1, k: 'hold', l: 'Hold', count: false }, { to: 'down', d: 3, k: 'ned', l: 'Sænk', count: false }, { d: 0.6, k: 'pause', l: 'Klar', count: false }],
      still: 2.5, ghost: 'down',
      back: () => R.counterSide(250, 330, 262, FLOOR),
      mod: P => { const J = FF.sideJoints(Object.assign({}, P, { armF: {}, armN: {} })), S0 = J.S;
        P.armF = { hand: [252, 256] }; P.armN = { hand: lerp(add(S0, [4, 104]), add(S0, [-22, 52]), P.k) }; return P; },
      figOpt: () => ({ front: J => { const h = J.arms.N.hd; return '<rect x="' + f1(h[0] - 7) + '" y="' + f1(h[1] - 4) + '" width="14" height="34" rx="5" fill="#8fc3e8" stroke="#5c94bf" stroke-width="1.5"/>'; } })
    }));
  })();

  /* ================= NAKKE ================= */
  // Hagen tilbage (siddende, set fra siden)
  define('nakke-h-hagetilbage', Object.assign(S(), {
    vb: [20, 90, 260, 260],
    tempo: 'Sid ret, og kig lige frem. Skub hagen roligt lige tilbage, som om du vil lave en dobbelthage (2 sek.), hold 3 sek., og slip. 10 gange.',
    poses: { n: sit({ nod: -2 }), in: sit({ chin: 13, nod: 6 }) }, start: 'n',
    seq: [{ to: 'in', d: 2, k: 'op', l: 'Hagen tilbage', count: false }, { d: 3, k: 'hold', l: 'Hold' }, { to: 'n', d: 2, k: 'ned', l: 'Slip', count: false }, { d: 1, k: 'pause', l: 'Hvil', count: false }],
    still: 3.5, ghost: null, back: chair(), vb: [20, 90, 290, 270],
    over: (P, J, c) => { const ins = headInset({ id: 'hage', neutral: sit({ nod: -2 }), c: [232, 160], r: 62, s: 2.3, dy: 14,
        arrow: () => R.arrow([262, 182], [234, 182], C.accent) })(P, J); return ins + ((c.key === 'op' || c.key === 'hold') ? R.arrow(add(J.head, [36, 14]), add(J.head, [16, 14]), C.accent) : ''); }
  }));

  // Drej hovedet (set forfra)
  define('nakke-h-drej', Object.assign(FRONT(), {
    vb: [20, 80, 280, 300],
    tempo: 'Sid ret. Drej roligt hovedet til den ene side, så langt det er rart (3 sek.), hold 2 sek., og drej tilbage. Så til den anden side. 5–10 gange til hver side.',
    poses: { n: sitFront(), a: sitFront({ headTurn: -1 }), b: sitFront({ headTurn: 1 }) }, start: 'n',
    seq: [{ to: 'a', d: 3, k: 'op', l: 'Drej til siden', count: false }, { d: 2, k: 'hold', l: 'Hold', count: false }, { to: 'n', d: 2, k: 'ned', l: 'Tilbage', count: false },
      { to: 'b', d: 3, k: 'op', l: 'Drej til den anden side', count: false }, { d: 2, k: 'hold', l: 'Hold', count: false }, { to: 'n', d: 2, k: 'ned', l: 'Tilbage', count: false }],
    still: 3.5, ghost: null, back: chairFront, figOpt: () => ({ overLegs: kneeCaps }),
    over: (P, J, c) => Math.abs(P.headTurn || 0) > 0.3 ? R.arrow(add(J.head, [-P.headTurn * 8, -40]), add(J.head, [P.headTurn * 22, -40]), C.accent) : ''
  }));

  // Sidebøj nakken (set forfra)
  define('nakke-h-sideboej', Object.assign(FRONT(), {
    vb: [20, 80, 280, 300],
    tempo: 'Sid ret med skuldrene nede. Før roligt øret ned mod skulderen (3 sek.), hold 5 sek., og kom op igen. Så til den anden side. 5 gange til hver side.',
    poses: { n: sitFront(), a: sitFront({ headTilt: -22 }), b: sitFront({ headTilt: 22 }) }, start: 'n',
    seq: [{ to: 'a', d: 3, k: 'op', l: 'Øret mod skulderen', count: false }, { d: 5, k: 'hold', l: 'Hold' }, { to: 'n', d: 2, k: 'ned', l: 'Op igen', count: false },
      { to: 'b', d: 3, k: 'op', l: 'Øret mod den anden skulder', count: false }, { d: 5, k: 'hold', l: 'Hold' }, { to: 'n', d: 2, k: 'ned', l: 'Op igen', count: false }],
    still: 5, ghost: 'n', back: chairFront, figOpt: () => ({ overLegs: kneeCaps })
  }));

  // Isometrisk nakke: hånden mod panden
  define('nakke-1-isometrisk', Object.assign(S(), {
    vb: [20, 90, 260, 260],
    tempo: 'Sid ret. Læg hånden mod panden, og pres hovedet let frem mod hånden uden at bevæge det (ca. halv kraft). Hold 8 sek., slip, og hvil. 5 gange. Gør det også bagud og til siderne.',
    poses: { n: sit({ nod: -2 }), p: sit({ nod: -2 }) }, start: 'n',
    seq: [{ to: 'p', d: 1, k: 'op', l: 'Pres', count: false }, { d: 8, k: 'hold', l: 'Hold' }, { to: 'n', d: 1, k: 'ned', l: 'Slip', count: false }, { d: 3, k: 'pause', l: 'Hvil', count: false }],
    still: 5, ghost: null, back: chair(),
    mod: (P, c) => { const J = FF.sideJoints(Object.assign({}, P, { armF: {}, armN: {} })); const hd = FF.sideFig(Object.assign({}, P, { armF: {}, armN: {} })).J.head; P.armN = { hand: add(hd, [17, -10]), el: add(J.S, [46, 14]) }; return P; },
    over: (P, J, c) => (c.key === 'hold' || c.key === 'op') ? R.arrow(add(J.head, [-34, -2]), add(J.head, [-14, -2]), C.accent) + R.arrow(add(J.head, [58, -10]), add(J.head, [38, -10]), C.guide) : ''
  }));

  // Dyb nakkebøjer liggende: lille nik og hold
  (() => {
    const P = (nod, chin) => supine({ nod, chin }), P0 = P;
    const big = (id, o) => define(id, Object.assign(L(), {
      vb: [30, 40, 330, 220],
      over: (P, J) => headInset({ id, neutral: P0(0, 0), c: [128, 108], r: 64, s: 2.3, dx: 14, dy: -6, floor: MAT - 14, arrow: o.arrow })(P, J),
      tempo: o.tempo, poses: { n: P(0, 0), in: P(o.nod, o.chin) }, start: 'n',
      seq: [{ to: 'in', d: 2, k: 'op', l: o.l, count: false }, { d: o.hold, k: 'hold', l: 'Hold' }, { to: 'n', d: 2, k: 'ned', l: 'Slip', count: false }, { d: 2, k: 'pause', l: 'Hvil', count: false }],
      still: 2 + o.hold / 2, ghost: 'n', under: () => R.mat(40, 425, MAT + 4) + '<rect x="70" y="' + (MAT - 14) + '" width="54" height="10" rx="5" fill="' + C.towel + '" stroke="' + C.towelDark + '"/>'
    }));
    big('nakke-1-dyb-nakkeboejer', { nod: 14, chin: 2, hold: 10, l: 'Lille nik', arrow: () => arc([128, 108], 34, -130, -70), tempo: 'Lig på ryggen med et lille håndklæde under hovedet. Lav et lille "ja-nik" med hagen ind mod halsen – baghovedet bliver liggende (2 sek.). Hold 10 sek. 10 gange.' });
    big('nakke-2-hovedloeft', { nod: 16, chin: -8, hold: 5, l: 'Nik og løft', arrow: () => R.arrow([96, 150], [96, 118], C.accent), tempo: 'Lig på ryggen. Lav det lille nik, og løft så hovedet 1–2 cm fra underlaget med hagen inde (2 sek.). Hold 5 sek., og læg det roligt ned. 5–10 gange.' });
  })();

  // Y-løft foroverbøjet
  (() => {
    const P = (sa) => ({ hip: [126, 244], trunk: 45, nod: -8, chin: 3, legF: { ank: [150, ANK] }, legN: { ank: [156, ANK] }, armF: { sa: sa - 4, ef: 0 }, armN: { sa, ef: 0 } });
    define('nakke-3-y-loeft', Object.assign(S(), {
      vb: [10, 50, 310, 390],
      tempo: 'Bøj let i hofterne med ret ryg og hagen inde. Løft armene frem og op i et "Y" med tommelfingrene op (2 sek.), hold 2 sek., og sænk langsomt (2 sek.). 2–3 sæt × 8–10.',
      poses: { down: P(6), up: P(140) }, start: 'down',
      seq: [{ to: 'up', d: 2, k: 'op', l: 'Løft', count: false }, { d: 2, k: 'hold', l: 'Hold', count: false }, { to: 'down', d: 2, k: 'ned', l: 'Sænk', count: false }, { d: 0.8, k: 'pause', l: 'Hvil', count: false }],
      still: 3, ghost: 'down'
    }));
  })();
})();
