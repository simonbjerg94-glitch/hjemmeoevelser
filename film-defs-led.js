/* Tempo-film til led-programmerne (skulder; senere albue, hånd, ankel, fod). Bruger FigFilm fra film-engine.js.
   Fase-teksterne bruges også af stemmen (voice.js) og intro-teksten af tools/make_voice.py. */
'use strict';
(() => {
  const FF = typeof FigFilm !== 'undefined' ? FigFilm : require('./film-engine.js');
  const { R, C, add, sub, mul, lerp, define, dirA } = FF;
  const f1 = FF.f1, P2 = FF.P2;
  const FLOOR = 420, ANK = 404, MAT = 248;
  const S = (W, H) => ({ W: W || 320, H: H || 440, floor: FLOOR, view: 'side' });
  const L = (W, H) => ({ W: W || 440, H: H || 270, floor: 252, view: 'side' });
  const FRONT = () => ({ W: 320, H: 440, floor: FLOOR, view: 'front' });
  const tag = (x, y, txt) => '<rect x="' + x + '" y="' + y + '" width="' + (txt.length * 6.6 + 16) + '" height="22" rx="11" fill="#fff" stroke="' + C.guide + '" stroke-width="1.5"/>' +
    '<text x="' + (x + 8) + '" y="' + (y + 15) + '" font-family="sans-serif" font-size="12" font-weight="700" fill="' + C.guide + '">' + txt + '</text>';
  const arcPath = (c, r, a0, a1, col) => { const p = a => [c[0] + r * Math.cos(a * Math.PI / 180), c[1] + r * Math.sin(a * Math.PI / 180)];
    return '<path fill="none" stroke="' + (col || C.guide) + '" stroke-width="2.5" stroke-dasharray="5 5" opacity=".7" d="M' + P2(p(a0)) + ' A' + r + ',' + r + ' 0 0 ' + (a1 > a0 ? 1 : 0) + ' ' + P2(p(a1)) + '"/>'; };
  const bottle = h => '<rect x="' + f1(h[0] - 6) + '" y="' + f1(h[1] - 15) + '" width="12" height="30" rx="5" fill="' + C.bottle + '" stroke="#5c94bf" stroke-width="1.5"/><rect x="' + f1(h[0] - 3) + '" y="' + f1(h[1] - 19) + '" width="6" height="5" rx="1.5" fill="#5c94bf"/>';
  const stand = (extra) => Object.assign({ hip: [150, 228], trunk: 0, nod: 0, legF: { ank: [146, ANK] }, legN: { ank: [158, ANK] } }, extra || {});
  const SH = FF.sideJoints(stand()).S; // skulderen i stående stilling, set fra siden

  /* ================= SKULDER – ONDT NU ================= */
  // Pendulsving: foroverbøjet med den raske hånd på bordet; den onde arm hænger og svinger frem og tilbage
  (() => {
    const base = sw => ({ hip: [118, 232], trunk: 58, nod: -14, legF: { ank: [92, ANK] }, legN: { ank: [160, ANK] }, sw });
    define('skulder-h-pendul', Object.assign(S(), {
      vb: [10, 70, 310, 370],
      tempo: 'Støt dig til bordet med den raske hånd, og bøj dig lidt frem. Lad den onde arm hænge afslappet, og sving den roligt frem og tilbage som et pendul. 30–60 sek.',
      poses: { mid: base(0), fwd: base(1), bck: base(-1) }, start: 'mid',
      seq: [{ to: 'fwd', d: 1.3, k: 'op', l: 'Frem', count: false }, { to: 'bck', d: 2.2, k: 'ned', l: 'Tilbage', count: false }, { to: 'fwd', d: 2.2, k: 'op', l: 'Frem', count: false }, { to: 'mid', d: 1.3, k: 'pause', l: 'Slap af', count: false }],
      still: 1.25, ghost: 'bck',
      back: () => R.counterSide(236, 330, 262, FLOOR),
      mod: P => { const J = FF.sideJoints(Object.assign({}, P, { armF: {}, armN: {} })), S0 = J.S, a = (P.sw || 0) * 20;
        P.armF = { hand: [246, 252] }; P.armN = { hand: add(S0, mul(dirA(a), 110)), straight: 1 }; return P; },
      over: (P, J) => { const S0 = J.S; return arcPath(S0, 118, 90 - 22, 90 + 22) + R.arrow(add(S0, mul(dirA(14), 126)), add(S0, mul(dirA(24), 124))) + R.arrow(add(S0, mul(dirA(-14), 126)), add(S0, mul(dirA(-24), 124))); }
    }));
  })();

  // Glid armen frem på bordet (siddende, set fra siden)
  (() => {
    const SEAT = 322, TOP = 262;
    const P = k => ({ hip: [98, SEAT - 12], trunk: 4 + k * 26, nod: -4 * k, legF: { ank: [176, ANK] }, legN: { ank: [182, ANK] }, k });
    define('skulder-h-bordglid', Object.assign(S(), {
      vb: [10, 110, 310, 330],
      tempo: 'Sid ved bordet med hånden på et håndklæde. Glid hånden roligt frem, og bøj overkroppen med (3 sek.), hold 5 sek., og glid tilbage (3 sek.). 10 gange.',
      poses: { back: P(0), fwd: P(1) }, start: 'back',
      seq: [{ to: 'fwd', d: 3, k: 'op', l: 'Glid frem', count: false }, { d: 5, k: 'hold', l: 'Hold' }, { to: 'back', d: 3, k: 'ned', l: 'Tilbage', count: false }, { d: 0.8, k: 'pause', l: 'Slap af', count: false }],
      still: 3.5, ghost: 'back',
      back: () => R.chairSide(52, 132, SEAT, FLOOR, { backH: 70 }) + '<rect x="166" y="' + TOP + '" width="160" height="10" rx="3" fill="' + C.wood + '"/><rect x="304" y="' + (TOP + 10) + '" width="9" height="' + (FLOOR - TOP - 10) + '" fill="' + C.woodDark + '"/>',
      mod: P => { const J = FF.sideJoints(Object.assign({}, P, { armF: {}, armN: {} })); P.armN = { hand: [196 + P.k * 70, TOP - 6] }; P.armF = { hand: [188 + P.k * 50, TOP - 6] }; return P; },
      under: (P) => '<rect x="' + f1(180 + P.k * 70) + '" y="' + (TOP - 4) + '" width="36" height="5" rx="2" fill="' + C.towel + '"/>',
      over: (P, J) => R.arrow([200, TOP - 26], [258, TOP - 26])
    }));
  })();

  // Armløft liggende med stok (på ryggen, set fra siden; hovedet til venstre)
  (() => {
    const HIP = [226, MAT - 16], SHP = [126, MAT - 16];
    const P = phi => ({ hip: HIP, trunkTo: SHP, curve: 0, nod: 0, chin: 0, legF: { ank: [300, MAT - 16] }, legN: { ank: [306, MAT - 16] }, phi });
    define('skulder-h-stok-liggende', Object.assign(L(), {
      vb: [0, 92, 440, 172],
      tempo: 'Lig på ryggen med bøjede knæ, og hold stokken med begge hænder. Løft armene roligt op og bagud over hovedet (3 sek.), så langt det er rart, og før dem tilbage (3 sek.). 10 gange.',
      poses: { down: P(9), up: P(150) }, start: 'down',
      seq: [{ to: 'up', d: 3, k: 'op', l: 'Op og bagud', count: false }, { d: 1.5, k: 'hold', l: 'Hold', count: false }, { to: 'down', d: 3, k: 'ned', l: 'Tilbage', count: false }, { d: 0.8, k: 'pause', l: 'Hvil', count: false }],
      still: 4, ghost: 'down',
      under: () => R.mat(40, 420, MAT) + '<rect x="62" y="' + (MAT - 22) + '" width="54" height="16" rx="8" fill="#e9e4da"/>',
      mod: P => { const S0 = FF.sideJoints(Object.assign({}, P, { armF: {}, armN: {} })).S, r = P.phi * Math.PI / 180, v = [Math.cos(r), -Math.sin(r)];
        P.armF = { hand: add(S0, add(mul(v, 104), [2, 2])), straight: 1 }; P.armN = { hand: add(S0, mul(v, 104)), straight: 1 }; return P; },
      figOpt: () => ({ front: J => { const h = J.arms.N.hd; return R.stick(add(h, [-5, -9]), add(h, [5, 9])) + '<circle cx="' + f1(h[0]) + '" cy="' + f1(h[1]) + '" r="6.2" fill="' + C.skin + '"/>'; } }),
      over: (P, J) => arcPath(J.S, 118, -15, -165)
    }));
  })();

  // Udadrotation: albuen ind til siden, underarmen peger frem (forkortet set forfra). θ = hvor meget hånden drejer ud (grader)
  const ROT_HIP = [160, 228];
  const rotArm = (S0, sx, th, o) => { o = o || {}; const el = add(S0, [sx * 3, 56]), r = th * Math.PI / 180;
    return { el, hand: add(el, [sx * Math.sin(r) * 50, -10 * Math.cos(r) - 4]) }; };
  const frontS = (P, k) => FF.frontJoints(Object.assign({}, P, { armR: {}, armL: {} })).arms[k].S;
  const elbowPads = J => ['R', 'L'].map(k => { const g = J.arms[k]; return '<circle cx="' + f1(g.el[0]) + '" cy="' + f1(g.el[1]) + '" r="7.5" fill="' + C.skinMid + '"/>'; }).join('');
  (() => {
    const P = th => ({ hip: ROT_HIP, legR: { ank: [ROT_HIP[0] - 18, ANK] }, legL: { ank: [ROT_HIP[0] + 18, ANK] }, th });
    define('skulder-h-udadrot-stok', Object.assign(FRONT(), {
      vb: [10, 40, 300, 330],
      tempo: 'Albuerne ind til siden og bøjet i en ret vinkel. Skub med den raske hånd, så den onde arms hånd drejer ud til siden (3 sek.), hold 3 sek., og før den tilbage (3 sek.). 10 gange.',
      poses: { in: P(0), out: P(55) }, start: 'in',
      seq: [{ to: 'out', d: 3, k: 'op', l: 'Drej ud', count: false }, { d: 3, k: 'hold', l: 'Hold' }, { to: 'in', d: 3, k: 'ned', l: 'Tilbage', count: false }, { d: 0.8, k: 'pause', l: 'Slap af', count: false }],
      still: 3.5, ghost: 'in',
      mod: P => { const SR = frontS(P, 'R'), SL = frontS(P, 'L'), aR = rotArm(SR, -1, P.th), elL = add(SL, [-3, 56]);
        const hL = add(aR.hand, [44, 0]); P.armR = aR; P.armL = { el: elL, hand: hL }; return P; },
      figOpt: () => ({ front: J => { const a = J.arms.R.hd, b = J.arms.L.hd; return R.stick(add(a, [-14, 0]), add(b, [16, 0])) + FF.limb(a, a, 12, 12, C.skin) + FF.limb(b, b, 12, 12, C.skin) +
        R.arrow(add(J.arms.R.el, [-26, -34]), add(J.arms.R.el, [-60, -34])) + tag(14, 44, 'Albuen ind'); } })
    }));
  })();

  /* ================= SKULDER – NIVEAU 1 ================= */
  // Løft armen frem (stående, set fra siden)
  (() => {
    const P = a => stand({ armF: { sa: a - 4, ef: 4 }, armN: { sa: a, ef: 4 } });
    define('skulder-1-loeft-frem', Object.assign(S(), {
      vb: [10, 40, 310, 380],
      tempo: 'Stå rank med tommelfingeren frem. Løft armen roligt frem og op til skulderhøjde (2 sek.), hold 1 sek., og sænk langsomt (3 sek.). 2–3 sæt × 10.',
      poses: { down: P(4), up: P(92) }, start: 'down',
      seq: [{ to: 'up', d: 2, k: 'op', l: 'Op', count: false }, { d: 1, k: 'hold', l: 'Hold', count: false }, { to: 'down', d: 3, k: 'ned', l: 'Ned', count: false }, { d: 0.8, k: 'pause', l: 'Slap af', count: false }],
      still: 2.5, ghost: 'down',
      over: (P, J) => arcPath(J.S, 124, 80, -2) + '<line x1="' + f1(J.S[0]) + '" y1="' + f1(J.S[1]) + '" x2="' + f1(J.S[0] + 150) + '" y2="' + f1(J.S[1]) + '" stroke="' + C.accent + '" stroke-width="2" stroke-dasharray="4 5" opacity=".8"/>' + tag(196, J.S[1] - 34, 'Skulderhøjde')
    }));
  })();

  // Pres udad mod væggen (isometrisk, set forfra; væggen er ved personens højre side = venstre i billedet)
  (() => {
    const P = q => ({ hip: ROT_HIP, legR: { ank: [ROT_HIP[0] - 18, ANK] }, legL: { ank: [ROT_HIP[0] + 18, ANK] }, q });
    define('skulder-1-isometrisk-udad', Object.assign(FRONT(), {
      vb: [0, 40, 300, 330],
      tempo: 'Stå med siden mod væggen, albuen ind til kroppen. Pres håndryggen ud mod væggen med cirka halv kraft – armen flytter sig ikke. Hold 10 sek., og slip. 5 gange.',
      poses: { rest: P(0), push: P(1) }, start: 'rest',
      seq: [{ to: 'push', d: 1.5, k: 'op', l: 'Pres', count: false }, { d: 10, k: 'hold', l: 'Hold' }, { to: 'rest', d: 1.5, k: 'ned', l: 'Slip', count: false }, { d: 3, k: 'pause', l: 'Hvil', count: false }],
      still: 5, ghost: null,
      back: () => '<rect x="0" y="0" width="104" height="' + FLOOR + '" fill="#d9d2c3"/><rect x="100" y="0" width="4" height="' + FLOOR + '" fill="#bfb6a3"/>',
      mod: P => { const SR = frontS(P, 'R'), SL = frontS(P, 'L'); P.armR = rotArm(SR, -1, 34); P.armL = { el: add(SL, [3, 56]), hand: add(SL, [-4, 104]) }; return P; },
      figOpt: P => ({ front: J => { const h = J.arms.R.hd, q = P.q || 0; return '<rect x="104" y="' + f1(h[1] - 10) + '" width="7" height="20" rx="2" fill="' + C.towel + '"/>' +
        (q > 0.3 ? R.arrow(add(h, [30, -26]), add(h, [-2, -26]), C.accent) + '<g opacity="' + f1(q) + '">' + tag(176, 250, 'Armen står stille') + '</g>' : ''); } })
    }));
  })();

  /* ================= SKULDER – NIVEAU 2 ================= */
  // Udadrotation med elastik (set forfra; elastikken sidder i døren til højre i billedet)
  (() => {
    const anchor = [304, 186];
    const P = th => ({ hip: ROT_HIP, legR: { ank: [ROT_HIP[0] - 18, ANK] }, legL: { ank: [ROT_HIP[0] + 18, ANK] }, th });
    define('skulder-2-udadrot-elastik', Object.assign(FRONT(), {
      vb: [10, 40, 310, 330],
      tempo: 'Albuen ind til kroppen og bøjet i en ret vinkel. Drej hånden roligt ud til siden mod elastikken (2 sek.), og før den langsomt tilbage (3 sek.). 3 sæt × 10–15.',
      poses: { in: P(-40), out: P(45) }, start: 'in',
      seq: [{ to: 'out', d: 2, k: 'op', l: 'Drej ud', count: false }, { d: 0.8, k: 'hold', l: 'Hold', count: false }, { to: 'in', d: 3, k: 'ned', l: 'Langsomt tilbage', count: false }, { d: 0.6, k: 'pause', l: 'Klar', count: false }],
      still: 2.4, ghost: 'in',
      back: () => '<rect x="294" y="40" width="40" height="' + (FLOOR - 40) + '" fill="#d9d2c3"/><rect x="294" y="40" width="4" height="' + (FLOOR - 40) + '" fill="#bfb6a3"/><rect x="292" y="180" width="14" height="10" rx="3" fill="#8a8f96"/>',
      mod: P => { const SR = frontS(P, 'R'), SL = frontS(P, 'L'); P.armR = rotArm(SR, -1, P.th); P.armL = { el: add(SL, [3, 56]), hand: add(SL, [-2, 104]) }; return P; },
      figOpt: () => ({ front: J => R.bandLine(anchor, J.arms.R.hd) + FF.limb(J.arms.R.hd, J.arms.R.hd, 12.4, 12.4, C.skin) + '<ellipse cx="' + f1(J.arms.R.el[0] + 9) + '" cy="' + f1(J.arms.R.el[1] - 4) + '" rx="6" ry="9" fill="' + C.towel + '"/>' }),
      over: (P, J) => R.arrow(add(J.arms.R.el, [10, -40]), add(J.arms.R.el, [-50, -40]))
    }));
  })();

  // Løft armene ud til siden (set forfra) med vandflasker
  (() => {
    const P = ab => ({ hip: ROT_HIP, legR: { ank: [ROT_HIP[0] - 18, ANK] }, legL: { ank: [ROT_HIP[0] + 18, ANK] }, ab });
    define('skulder-2-sideloeft', Object.assign(FRONT(), {
      vb: [0, 40, 320, 330],
      tempo: 'Stå rank med tommelfingrene frem. Løft armene roligt ud til siden og lidt frem, til skulderhøjde (2 sek.), og sænk langsomt (3 sek.). 3 sæt × 10–12.',
      poses: { down: P(10), up: P(84) }, start: 'down',
      seq: [{ to: 'up', d: 2, k: 'op', l: 'Op', count: false }, { d: 0.8, k: 'hold', l: 'Hold', count: false }, { to: 'down', d: 3, k: 'ned', l: 'Ned', count: false }, { d: 0.8, k: 'pause', l: 'Slap af', count: false }],
      still: 2.4, ghost: 'down',
      mod: P => { for (const [k, sx] of [['R', -1], ['L', 1]]) { const S0 = frontS(P, k), d = dirA(sx * P.ab); P['arm' + k] = { el: add(S0, mul(d, 57)), hand: add(S0, mul(d, 108)) }; } return P; },
      figOpt: () => ({ front: J => bottle(J.arms.R.hd) + bottle(J.arms.L.hd) }),
      over: (P, J) => '<line x1="20" x2="300" y1="' + f1(J.arms.R.S[1]) + '" y2="' + f1(J.arms.R.S[1]) + '" stroke="' + C.accent + '" stroke-width="2" stroke-dasharray="4 5" opacity=".8"/>' + tag(6, J.arms.R.S[1] + 22, 'Til skulderhøjde')
    }));
  })();

  /* ================= SKULDER – NIVEAU 3 ================= */
  // Løft over hovedet (set forfra)
  (() => {
    const P = k => ({ hip: ROT_HIP, legR: { ank: [ROT_HIP[0] - 18, ANK] }, legL: { ank: [ROT_HIP[0] + 18, ANK] }, k });
    define('skulder-3-armstraek-op', Object.assign(FRONT(), {
      vb: [0, 0, 320, 330],
      tempo: 'Stå rank med flaskerne i skulderhøjde. Pres armene roligt op over hovedet (2 sek.), og sænk langsomt (3 sek.). Spænd let i maven. 3 sæt × 8–12.',
      poses: { down: P(0), up: P(1) }, start: 'down',
      seq: [{ to: 'up', d: 2, k: 'op', l: 'Op', count: false }, { d: 0.6, k: 'hold', l: 'Hold', count: false }, { to: 'down', d: 3, k: 'ned', l: 'Ned', count: false }, { d: 0.8, k: 'pause', l: 'Slap af', count: false }],
      still: 2.3, ghost: 'down',
      mod: P => { for (const [k, sx] of [['R', -1], ['L', 1]]) { const S0 = frontS(P, k);
        const el = lerp(add(S0, [sx * 40, 34]), add(S0, [sx * 14, -54]), P.k), hd = lerp(add(S0, [sx * 36, -12]), add(S0, [sx * 18, -106]), P.k); P['arm' + k] = { el, hand: hd }; } return P; },
      figOpt: () => ({ front: J => bottle(J.arms.R.hd) + bottle(J.arms.L.hd) })
    }));
  })();

  // Armstrækninger mod væggen (set fra siden; væggen til højre)
  (() => {
    const AK = [92, ANK], WALL = 304, HAND = [WALL - 6, 150];
    const P = th => { const r = th * Math.PI / 180, d = [Math.sin(r), -Math.cos(r)], hip = add(AK, mul(d, 176));
      return { hip, trunk: th, nod: -th * 0.6, legF: { ank: add(AK, [-6, 0]) }, legN: { ank: AK }, armF: { hand: add(HAND, [-3, 4]) }, armN: { hand: HAND } }; };
    define('skulder-3-vaegpres', Object.assign(S(340), {
      vb: [20, 60, 320, 380],
      tempo: 'Stå en armlængde fra væggen med hænderne i skulderhøjde. Bøj albuerne, så brystet kommer ind mod væggen (2 sek.), og pres dig ud igen (2 sek.). Kroppen er lige. 3 sæt × 10.',
      poses: { out: P(20), in: P(31) }, start: 'out',
      seq: [{ to: 'in', d: 2, k: 'ned', l: 'Ind', count: false }, { to: 'out', d: 2, k: 'op', l: 'Pres ud', count: false }, { d: 0.8, k: 'pause', l: 'Klar', count: false }],
      still: 2, ghost: 'out',
      back: () => R.wall(WALL, 340, 0, FLOOR)
    }));
  })();

  /* ================= ALBUE (tennis- og golfalbue) =================
     Nærbilleder af underarm og hånd (set fra siden). w = håndleddets vinkel (+ = op, − = ned). */
  const CU = { W: 440, H: 270, floor: 270, view: 'custom' };
  const TY = 176, EDGE = 292;                                   // bordets overflade og kant
  const sleeveC = C.tealDark;
  // Hånd set fra siden; håndleddet i (0,0), fingrene mod +x. kind: 'flat' | 'fist' | 'weight'. palm: 'ned' | 'op'
  function handSide(kind, palm, far) {
    const s = far ? C.skinMid : C.skin, d = C.skinDark;
    if (kind === 'flat') return '<path fill="' + s + '" d="M-4,-13 C10,-15 26,-15 40,-12 C52,-11 64,-10 74,-7 C80,-5 80,3 74,4 C62,6 50,8 40,9 C26,11 10,13 -4,13 Z"/>' +
      '<path fill="none" stroke="' + d + '" stroke-width="1.3" opacity=".7" d="M42,-2 L72,-2 M42,3 L70,2"/>' +
      (palm === 'op' ? '<path fill="' + C.nail + '" opacity=".0" d=""/><path fill="' + s + '" stroke="' + d + '" stroke-width="1" d="M12,-12 C18,-22 30,-26 38,-22 C40,-19 34,-15 26,-12 Z"/>' :
        '<path fill="' + (far ? C.skinDark : C.skinMid) + '" d="M12,10 C18,18 30,22 38,18 C40,15 34,11 26,9 Z"/><path fill="' + C.nail + '" d="M70,-6 C76,-6 78,-3 77,0 L71,-1 Z"/>');
    const fist = '<path fill="' + s + '" d="M-4,-13 C8,-15 22,-16 34,-15 C46,-14 52,-8 52,0 C52,8 46,14 34,15 C22,16 8,15 -4,13 Z"/><path fill="none" stroke="' + d + '" stroke-width="1.3" opacity=".7" d="M38,-12 C44,-6 44,6 38,12 M46,-9 C49,-3 49,3 46,9"/>' +
      (palm === 'op' ? '<path fill="' + C.skinMid + '" d="M6,-15 C14,-24 26,-24 30,-16 Z"/>' : '<path fill="' + C.skinMid + '" d="M6,15 C14,24 26,24 30,16 Z"/>');
    if (kind === 'weight') return fist + '<circle cx="28" cy="0" r="13" fill="#5c646d"/><circle cx="28" cy="0" r="9.5" fill="#737c86"/><circle cx="28" cy="0" r="2.5" fill="#5c646d"/>';
    return fist;
  }
  const tagW = (txt) => txt.length * 6.6 + 16;
  // Tegner arm: mode 'table' (underarmen på bordet, hånden ud over kanten) eller 'straight' (strakt arm frem, uden bord)
  function armCU(P) {
    const st = P.mode === 'straight', E = st ? [150, 128] : [96, TY - 16], Wr = st ? [292, 128] : [EDGE + 4, TY - 16];
    let s = '';
    if (!st) s += '<rect x="0" y="' + TY + '" width="' + EDGE + '" height="' + (270 - TY) + '" fill="' + C.wood + '"/><rect x="0" y="' + TY + '" width="' + EDGE + '" height="8" fill="' + C.woodLight + '"/><rect x="' + (EDGE - 6) + '" y="' + TY + '" width="6" height="' + (270 - TY) + '" fill="' + C.woodDark + '"/>';
    if (!st && P.towel) s += '<rect x="' + (EDGE - 64) + '" y="' + (TY - 10) + '" width="66" height="12" rx="5" fill="' + C.towel + '" stroke="' + C.towelDark + '" stroke-width="1"/>';
    // overarm + ærme
    const Sh = st ? [10, 128] : [40, 20];
    s += FF.limb(Sh, E, 34, 30, C.skin) + FF.limb(Sh, FF.lerp(Sh, E, 0.55), 46, 40, sleeveC);
    if (st) s += '<rect x="-20" y="60" width="42" height="150" rx="16" fill="' + C.teal + '"/>';
    s += FF.limb(E, Wr, 30, 22, C.skin) + '<ellipse cx="' + f1(E[0] - 4) + '" cy="' + f1(E[1] + 2) + '" rx="10" ry="8" fill="' + C.skinDark + '" opacity=".35"/>';
    // smertested (ydersiden = tennis, indersiden = golf)
    if (P.spot) s += '<circle cx="' + f1(E[0] + 14) + '" cy="' + f1(E[1] + (P.spot === 'in' ? 7 : -7)) + '" r="9" fill="' + C.accent + '" opacity=".55"/>';
    s += '<g transform="translate(' + P2(Wr) + ') rotate(' + f1(-(P.w || 0)) + ') scale(1.6)">' + handSide(P.kind || 'flat', P.palm || 'ned') + '</g>';
    if (P.help) { // den anden hånd: oven på (+1) eller under (−1) den arbejdende hånd
      const r = -(P.w || 0) * Math.PI / 180, along = [Math.cos(r), Math.sin(r)], nrm = [Math.sin(r), -Math.cos(r)], side = P.help;
      const c = FF.add(Wr, FF.add(FF.mul(along, 70), FF.mul(nrm, side * 24))), a = (-(P.w || 0) + 180) + (side > 0 ? 6 : -6);
      const arm0 = FF.add(c, side > 0 ? [70, -150] : [90, 140]);
      s += FF.limb(arm0, FF.add(c, FF.mul([Math.cos(a * Math.PI / 180), Math.sin(a * Math.PI / 180)], 40)), 30, 24, C.skinMid) +
        '<g transform="translate(' + P2(c) + ') rotate(' + f1(a + 180) + ') scale(1.6,' + (side > 0 ? -1.6 : 1.6) + ') translate(-30,0)">' + handSide('flat', 'ned', true) + '</g>';
    }
    return { svg: s, Wr, E };
  }
  const cuFilm = (extra) => Object.assign({}, CU, { vb: [0, 20, 440, 240], draw: P => armCU(P).svg }, extra);
  const wristArrow = (P, up) => { const st = P.mode === 'straight', Wr = st ? [292, 128] : [EDGE + 4, TY - 16]; return arcPath(Wr, 118, up ? -8 : 8, up ? -48 : 58); };

  // Isometrisk pres – tennisalbue (håndfladen nedad, den anden hånd holder igen ovenpå)
  define('albue-h-iso-strak', cuFilm({
    tempo: 'Underarmen på bordet, håndfladen nedad. Pres hånden op mod den anden hånd, der holder igen – hånden står stille. Hold 30–45 sek. med cirka halv kraft, og slap af. 5 gange.',
    poses: { rest: { w: 0, help: 1, palm: 'ned', spot: 'out', q: 0, towel: 1 }, push: { w: 6, help: 1, palm: 'ned', spot: 'out', q: 1, towel: 1 } }, start: 'rest',
    seq: [{ to: 'push', d: 1.5, k: 'op', l: 'Pres', count: false }, { d: 30, k: 'hold', l: 'Hold' }, { to: 'rest', d: 1.5, k: 'ned', l: 'Slap af', count: false }, { d: 3, k: 'pause', l: 'Hvil', count: false }],
    still: 6, ghost: null,
    over: P => ((P.q || 0) > 0.3 ? R.arrow([EDGE + 62, TY + 30], [EDGE + 62, TY - 2], C.accent) : '') + tag(14, 30, 'Håndfladen nedad · hånden står stille') + tag(14, 228, 'Ondt på ydersiden af albuen (tennisalbue)')
  }));
  // Isometrisk pres – golfalbue (håndfladen opad)
  define('albue-h-iso-boej', cuFilm({
    tempo: 'Underarmen på bordet, håndfladen opad. Pres håndfladen op mod den anden hånd, der holder igen – hånden står stille. Hold 30–45 sek. med cirka halv kraft, og slap af. 5 gange.',
    poses: { rest: { w: 0, help: 1, palm: 'op', spot: 'in', q: 0, towel: 1 }, push: { w: 6, help: 1, palm: 'op', spot: 'in', q: 1, towel: 1 } }, start: 'rest',
    seq: [{ to: 'push', d: 1.5, k: 'op', l: 'Pres', count: false }, { d: 30, k: 'hold', l: 'Hold' }, { to: 'rest', d: 1.5, k: 'ned', l: 'Slap af', count: false }, { d: 3, k: 'pause', l: 'Hvil', count: false }],
    still: 6, ghost: null,
    over: P => ((P.q || 0) > 0.3 ? R.arrow([EDGE + 62, TY + 30], [EDGE + 62, TY - 2], C.accent) : '') + tag(14, 30, 'Håndfladen opad · hånden står stille') + tag(14, 228, 'Ondt på indersiden af albuen (golfalbue)')
  }));
  // Stræk – strakt arm, håndfladen nedad, bøj hånden ned (tennis)
  define('albue-h-straek-strak', cuFilm({
    tempo: 'Stræk armen frem med håndfladen nedad. Bøj hånden roligt ned med den anden hånd (3 sek.), til du mærker et stræk på oversiden af underarmen. Hold 30 sek., og slip. 3 gange.',
    poses: { a: { mode: 'straight', w: 0, help: 1, palm: 'ned', spot: 'out' }, b: { mode: 'straight', w: -58, help: 1, palm: 'ned', spot: 'out' } }, start: 'a',
    seq: [{ to: 'b', d: 3, k: 'ned', l: 'Bøj ned', count: false }, { d: 30, k: 'hold', l: 'Hold' }, { to: 'a', d: 2, k: 'op', l: 'Slip', count: false }, { d: 2, k: 'pause', l: 'Hvil', count: false }],
    still: 6, ghost: 'a',
    over: P => wristArrow(P, false) + tag(14, 30, 'Strakt arm · håndfladen nedad')
  }));
  // Stræk – strakt arm, håndfladen opad, bøj hånden ned/bagud (golf)
  define('albue-h-straek-boej', cuFilm({
    tempo: 'Stræk armen frem med håndfladen opad. Bøj hånden og fingrene roligt ned og bagud med den anden hånd (3 sek.), til du mærker et stræk på undersiden af underarmen. Hold 30 sek., og slip. 3 gange.',
    poses: { a: { mode: 'straight', w: 0, help: 1, palm: 'op', spot: 'in' }, b: { mode: 'straight', w: -52, help: 1, palm: 'op', spot: 'in' } }, start: 'a',
    seq: [{ to: 'b', d: 3, k: 'ned', l: 'Bøj ned', count: false }, { d: 30, k: 'hold', l: 'Hold' }, { to: 'a', d: 2, k: 'op', l: 'Slip', count: false }, { d: 2, k: 'pause', l: 'Hvil', count: false }],
    still: 6, ghost: 'a',
    over: P => wristArrow(P, false) + tag(14, 30, 'Strakt arm · håndfladen opad')
  }));
  // Løft hånden op med vægt (håndfladen nedad) – tennis
  define('albue-1-loeft-op', cuFilm({
    tempo: 'Underarmen på bordet, håndfladen nedad, en vandflaske eller lille vægt i hånden. Løft hånden op (3 sek.), og sænk den langsomt (3 sek.). 3 sæt × 15.',
    poses: { down: { w: -45, kind: 'weight', palm: 'ned', towel: 1 }, up: { w: 42, kind: 'weight', palm: 'ned', towel: 1 } }, start: 'down',
    seq: [{ to: 'up', d: 3, k: 'op', l: 'Op', count: false }, { to: 'down', d: 3, k: 'ned', l: 'Ned', count: false }, { d: 0.6, k: 'pause', l: 'Klar', count: false }],
    still: 3, ghost: 'down',
    over: P => wristArrow(P, true) + tag(14, 30, 'Håndfladen nedad')
  }));
  // Bøj hånden op med vægt (håndfladen opad) – golf
  define('albue-1-loeft-boej', cuFilm({
    tempo: 'Underarmen på bordet, håndfladen opad, en vandflaske eller lille vægt i hånden. Bøj hånden op (3 sek.), og sænk den langsomt (3 sek.). 3 sæt × 15.',
    poses: { down: { w: -45, kind: 'weight', palm: 'op', towel: 1 }, up: { w: 42, kind: 'weight', palm: 'op', towel: 1 } }, start: 'down',
    seq: [{ to: 'up', d: 3, k: 'op', l: 'Op', count: false }, { to: 'down', d: 3, k: 'ned', l: 'Ned', count: false }, { d: 0.6, k: 'pause', l: 'Klar', count: false }],
    still: 3, ghost: 'down',
    over: P => wristArrow(P, true) + tag(14, 30, 'Håndfladen opad')
  }));
  // Kun ned (excentrisk): den anden hånd løfter op, den onde hånd sænker langsomt alene – tennis
  define('albue-2-kun-ned', cuFilm({
    tempo: 'Underarmen på bordet, håndfladen nedad, vægten i hånden. Løft hånden op med hjælp fra den anden hånd, og sænk den så langsomt alene (4 sek.). 3 sæt × 15.',
    poses: { down: { w: -38, kind: 'weight', palm: 'ned', help: 0, towel: 1 }, helpDown: { w: -38, kind: 'weight', palm: 'ned', help: -1, towel: 1 }, helpUp: { w: 34, kind: 'weight', palm: 'ned', help: -1, towel: 1 }, up: { w: 34, kind: 'weight', palm: 'ned', help: 0, towel: 1 } }, start: 'down',
    seq: [{ to: 'helpDown', d: 0.6, k: 'pause', l: 'Hjælp op', count: false }, { to: 'helpUp', d: 1.5, k: 'op', l: 'Hjælp op', count: false }, { to: 'up', d: 0.6, k: 'hold', l: 'Slip hjælpen', count: false },
      { to: 'down', d: 4, k: 'ned', l: 'Langsomt ned', lin: true }, { d: 0.6, k: 'pause', l: 'Klar', count: false }],
    still: 3.2, ghost: 'down', shots: [0.6, 2.1, 5.2],
    over: (P, J, c) => (c.key === 'ned' ? arcPath([EDGE + 4, TY - 16], 118, -48, 58, C.accent) : '') + tag(14, 30, 'Den anden hånd løfter · du sænker langsomt')
  }));
  // Drej underarmen (set forfra mod knyttet hånd, flasken drejer)
  (() => {
    const c = [220, 140];
    define('albue-1-drej', Object.assign({}, CU, {
      vb: [0, 20, 440, 240],
      tempo: 'Underarmen på bordet, albuen ind til kroppen. Hold en vandflaske i den ene ende. Drej roligt håndfladen op (3 sek.), og drej den ned (3 sek.). 3 sæt × 10–15.',
      poses: { up: { a: -80 }, down: { a: 80 } }, start: 'down',
      seq: [{ to: 'up', d: 3, k: 'op', l: 'Drej op', count: false }, { to: 'down', d: 3, k: 'ned', l: 'Drej ned', count: false }, { d: 0.6, k: 'pause', l: 'Klar', count: false }],
      still: 1.5, ghost: 'down',
      back: () => '<rect x="0" y="196" width="440" height="80" fill="' + C.wood + '"/><rect x="0" y="196" width="440" height="8" fill="' + C.woodLight + '"/>',
      draw: P => { const a = P.a || 0;
        return '<ellipse cx="' + c[0] + '" cy="198" rx="40" ry="12" fill="' + C.skinDark + '" opacity=".35"/><rect x="' + (c[0] - 26) + '" y="140" width="52" height="58" rx="18" fill="' + C.skin + '"/>' +
          '<g transform="translate(' + c[0] + ' ' + c[1] + ') rotate(' + f1(a) + ')"><rect x="-13" y="-110" width="26" height="80" rx="9" fill="' + C.bottle + '" stroke="#5c94bf" stroke-width="2"/><rect x="-7" y="-122" width="14" height="13" rx="3" fill="#5c94bf"/>' +
          '<rect x="-30" y="-34" width="60" height="62" rx="22" fill="' + C.skin + '"/><path fill="none" stroke="' + C.skinDark + '" stroke-width="1.6" d="M-18,-26 L-18,20 M-4,-28 L-4,22 M10,-26 L10,20"/>' +
          '<path fill="' + C.skinMid + '" d="M-30,-6 C-40,-10 -42,6 -30,10 Z"/></g>'; },
      over: P => arcPath(c, 150, -170, -10) + tag(14, 30, 'Set forfra: hånden drejer') + tag(300, 226, (P.a || 0) < 0 ? 'Håndfladen op' : 'Håndfladen ned')
    }));
  })();
  // Vrid et håndklæde (set forfra: to knyttede hænder, håndklædet vrides)
  (() => {
    const L0 = [150, 140], R0 = [290, 140];
    const fistF = (p, a) => '<g transform="translate(' + P2(p) + ') rotate(' + f1(a) + ')"><rect x="-26" y="-30" width="52" height="60" rx="20" fill="' + C.skin + '"/><path fill="none" stroke="' + C.skinDark + '" stroke-width="1.5" d="M-14,-22 L-14,22 M0,-24 L0,24 M14,-22 L14,22"/></g>';
    define('albue-2-haandklaede-vrid', Object.assign({}, CU, {
      vb: [0, 20, 440, 240],
      tempo: 'Hold et sammenrullet håndklæde med begge hænder foran dig. Vrid roligt, som når du vrider en karklud (3 sek.), og vrid så den anden vej (3 sek.). 3 sæt × 10.',
      poses: { a: { t: -1 }, b: { t: 1 } }, start: 'a',
      seq: [{ to: 'b', d: 3, k: 'op', l: 'Vrid', count: false }, { to: 'a', d: 3, k: 'ned', l: 'Den anden vej', count: false }, { d: 0.5, k: 'pause', l: 'Klar', count: false }],
      still: 1.5, ghost: null,
      draw: P => { const t = P.t || 0; let s = '<rect x="20" y="124" width="400" height="32" rx="14" fill="' + C.towel + '" stroke="' + C.towelDark + '" stroke-width="1.5"/>';
        for (let i = 0; i < 6; i++) { const x = 172 + i * 20; s += '<path fill="none" stroke="' + C.towelDark + '" stroke-width="2" d="M' + f1(x - 8 * t) + ',126 L' + f1(x + 8 * t) + ',154"/>'; }
        s += FF.limb([110, 270], L0, 40, 34, C.skin) + FF.limb([330, 270], R0, 40, 34, C.skin) + fistF(L0, -40 * t) + fistF(R0, 40 * t);
        return s; },
      over: P => arcPath(L0, 52, -150, -30) + arcPath(R0, 52, -150, -30) + tag(14, 30, 'Set forfra')
    }));
  })();
  // Bær en tung taske (stående, set fra siden; går roligt på stedet)
  (() => {
    const P = k => stand({ legF: { th: 10 * k, kn: 22 * Math.max(0, k) }, legN: { th: -10 * k, kn: 22 * Math.max(0, -k) }, armF: { sa: 2, ef: 6 }, armN: { sa: 0, ef: 0 }, k });
    define('albue-3-baere', Object.assign(S(), {
      vb: [10, 40, 310, 380],
      tempo: 'Hold en tung indkøbspose i hånden med strakt arm. Stå rank, og gå roligt i 30–60 sek. Skift hånd. 3 gange med hver hånd.',
      poses: { a: P(-1), m: P(0), b: P(1) }, start: 'm',
      seq: [{ to: 'a', d: 0.8, k: 'op', l: 'Gå roligt', count: false }, { to: 'm', d: 0.6, k: 'op', l: 'Gå roligt', count: false }, { to: 'b', d: 0.8, k: 'op', l: 'Gå roligt', count: false }, { to: 'm', d: 0.6, k: 'op', l: 'Gå roligt', count: false }],
      still: 0, ghost: null,
      mod: P => { P.legF.ank = null; P.legN.ank = null; delete P.legF.ank; delete P.legN.ank; return P; },
      figOpt: () => ({ front: J => { const h = J.arms.N.hd; return '<path fill="#e7b75f" stroke="#b98a35" stroke-width="2" d="M' + f1(h[0] - 24) + ',' + f1(h[1] + 10) + ' L' + f1(h[0] + 24) + ',' + f1(h[1] + 10) + ' L' + f1(h[0] + 20) + ',' + f1(h[1] + 66) + ' L' + f1(h[0] - 20) + ',' + f1(h[1] + 66) + ' Z"/>' +
        '<path fill="none" stroke="#b98a35" stroke-width="3" d="M' + f1(h[0] - 12) + ',' + f1(h[1] + 12) + ' Q' + f1(h[0]) + ',' + f1(h[1] - 10) + ' ' + f1(h[0] + 12) + ',' + f1(h[1] + 12) + '"/>' + FF.limb(h, h, 12.4, 12.4, C.skin); } }),
      over: () => tag(170, 60, 'Strakt arm · rank')
    }));
  })();

  /* ================= HÅNDLED OG HÅND =================
     To nærbilleder af hånden: set fra tommelfingersiden (fingrene bøjer mod venstre) og set forfra med håndfladen mod os. */
  const HV = { W: 320, H: 400, floor: 400, view: 'custom' };
  const ik2 = (A, T, l1, l2, side) => { // to-leds IK: led-punkt mellem A og T, bøjet til side (+1/−1)
    const d = sub(T, A), D = Math.min(Math.hypot(d[0], d[1]), l1 + l2 - 0.5), u = mul(d, 1 / (Math.hypot(d[0], d[1]) || 1));
    const a = (l1 * l1 - l2 * l2 + D * D) / (2 * D), h = Math.sqrt(Math.max(0, l1 * l1 - a * a));
    return add(add(A, mul(u, a)), mul([-u[1] * side, u[0] * side], h)); };
  const sdir = a => [-Math.sin(a * Math.PI / 180), -Math.cos(a * Math.PI / 180)];   // 0 = op, + = bøjet mod håndfladen (venstre)
  const nail = (tip, a, col) => { const n = [Math.cos(a * Math.PI / 180), -Math.sin(a * Math.PI / 180)], b = sub(tip, mul(sdir(a), 7));
    return '<ellipse cx="' + f1(b[0] + n[0] * 5) + '" cy="' + f1(b[1] + n[1] * 5) + '" rx="3.2" ry="6" transform="rotate(' + f1(-a) + ' ' + f1(b[0] + n[0] * 5) + ' ' + f1(b[1] + n[1] * 5) + ')" fill="' + (col || C.nail) + '"/>'; };
  // Set fra siden. fa = [mcp, pip, dip] for fingrene, ta = [cmc, mp, ip] for tommelen (grader), ball = {r, sq}
  function handSideV(P) {
    const fa = P.fa || [0, 0, 0], ta = P.ta || [38, 10, 8];
    const Wr = [172, 300];
    let s = FF.limb([182, 440], Wr, 62, 54, C.skin) + '<rect x="130" y="384" width="110" height="30" rx="10" fill="' + C.tealDark + '"/>';
    const fingers = [{ b: [190, 204], L: [36, 22, 19], w: 18, c: C.skinDark, o: -16 }, { b: [186, 192], L: [46, 29, 22], w: 20, c: C.skinMid, o: -10 }, { b: [181, 186], L: [50, 31, 23], w: 21, c: C.skinMid, o: -5 }, { b: [174, 193], L: [46, 27, 22], w: 21, c: C.skin, o: 0 }];
    const drawF = (F, sc) => { let p = F.b, a = F.o * (1 - Math.min(1, fa[0] / 60)), r = ''; const k = sc || 1; for (let i = 0; i < 3; i++) { a += fa[i] * k; const q = add(p, mul(sdir(a), F.L[i])); r += FF.limb(p, q, F.w - i * 1.5, F.w - (i + 1) * 1.5, F.c); p = q; } return r + nail(p, a, F.c === C.skin ? C.nail : '#e9cdb9'); };
    s += drawF(fingers[0], 1.04) + drawF(fingers[1], 1.02) + drawF(fingers[2]);
    s += '<path fill="' + C.skin + '" d="M146,302 C132,272 136,232 154,198 L196,186 C200,226 200,268 198,302 Z"/>';
    s += '<path fill="none" stroke="' + C.skinDark + '" stroke-width="1.4" opacity=".55" d="M150,262 C158,250 166,246 176,246"/>';
    if (P.ball) { const r = P.ball.r || 30, sq = P.ball.sq || 0; s += '<ellipse cx="' + f1(140 + sq * 6) + '" cy="232" rx="' + f1(r * (1 - 0.18 * sq)) + '" ry="' + f1(r * (1 + 0.1 * sq)) + '" fill="' + C.ball + '" stroke="' + C.ballDark + '" stroke-width="2"/>'; }
    s += drawF(fingers[3]);
    if (P.pinch) { // tommel mod pegefinger med en lille bold imellem (set fra siden)
      const F = fingers[3]; let q = F.b, aa = 0; for (let i = 0; i < 3; i++) { aa += fa[i]; q = add(q, mul(sdir(aa), F.L[i])); }
      const r = 13, sq = P.pinch.sq || 0, ry = r * (1 - 0.3 * sq), c = add(q, [1, ry + 2]), T = add(c, [2, ry + 4]);
      const M = add([156, 282], mul(sdir(30), 42)), K = ik2(M, T, 30, 25, -1);
      s += '<ellipse cx="' + f1(c[0]) + '" cy="' + f1(c[1]) + '" rx="' + f1(r * (1 + 0.2 * sq)) + '" ry="' + f1(ry) + '" fill="' + C.ball + '" stroke="' + C.ballDark + '" stroke-width="2"/>';
      s += FF.limb([156, 282], M, 26, 23, C.skin) + FF.limb(M, K, 22, 20, C.skin, ' stroke="' + C.skinDark + '" stroke-width=".8" stroke-opacity=".5"') + FF.limb(K, T, 20, 17, C.skin, ' stroke="' + C.skinDark + '" stroke-width=".8" stroke-opacity=".5"');
      const ta2 = Math.atan2(-(T[0] - K[0]), -(T[1] - K[1])) * 180 / Math.PI; return s + nail(T, ta2);
    }
    // tommelen (forrest)
    let p = [156, 282], a = 0; const TL = [42, 30, 25], TW = [26, 22, 19];
    for (let i = 0; i < 3; i++) { a += ta[i]; const q = add(p, mul(sdir(a), TL[i])); s += FF.limb(p, q, TW[i], TW[i] - 3, C.skin) + (i ? '<circle cx="' + f1(p[0]) + '" cy="' + f1(p[1]) + '" r="' + f1(TW[i] / 2) + '" fill="' + C.skin + '" stroke="' + C.skinDark + '" stroke-width=".8" stroke-opacity=".5"/>' : ''); p = q; }
    s += nail(p, a);
    return s;
  }
  // Set forfra (håndfladen mod os, tommelen til venstre). fl = bøjning pr. finger 0–1, sp = spredning 0–1, m = tommelens rod mod håndfladen 0–1, T = tommelspidsens mål
  const FB = [[124, 206], [150, 197], [176, 199], [200, 210]], FLn = [[42, 26, 22], [46, 29, 23], [43, 27, 22], [34, 21, 18]], FW = [22, 23, 22, 19];
  const fJoints = (i, fl, sp) => { const base = [-7, -2, 3, 9][i] + (sp || 0) * [-12, -4, 5, 14][i], ang = [80, 95, 60].map(x => x * (fl || 0));
    const pts = [FB[i]]; let c = 0; for (let j = 0; j < 3; j++) { c += ang[j]; const v = FF.rot([0, -Math.cos(c * Math.PI / 180) * FLn[i][j]], base); pts.push(add(pts[j], v)); } return pts; };
  const TOPEN = [62, 214], MOPEN = [98, 262], MOPP = [126, 252];
  function handFront(P) {
    const fl = P.fl || [0, 0, 0, 0], sp = P.sp || 0;
    let s = FF.limb([160, 440], [160, 318], 66, 62, C.skin) + '<rect x="110" y="390" width="100" height="30" rx="10" fill="' + C.tealDark + '"/>';
    s += '<path fill="' + C.skin + '" d="M128,322 C114,292 108,252 112,206 C130,190 190,188 210,204 C214,244 206,292 194,322 Z"/>';
    s += '<path fill="none" stroke="' + C.skinDark + '" stroke-width="1.5" opacity=".5" d="M120,250 C134,272 150,286 158,312 M132,228 C160,224 186,226 204,236"/>';
    const J = [];
    for (let i = 3; i >= 0; i--) { const pts = fJoints(i, fl[i], sp); J[i] = pts; for (let j = 0; j < 3; j++) s += FF.limb(pts[j], pts[j + 1], FW[i] - j * 1.6, FW[i] - (j + 1) * 1.6, fl[i] > 0.4 && j > 0 ? C.skinMid : C.skin, ' stroke="' + C.skinDark + '" stroke-width="' + (fl[i] > 0.4 ? 1.4 : 0.8) + '" stroke-opacity="' + (fl[i] > 0.4 ? 0.9 : 0.45) + '"');
      if (fl[i] > 0.4) s += '<circle cx="' + f1(pts[3][0]) + '" cy="' + f1(pts[3][1]) + '" r="' + f1(FW[i] / 2 - 2) + '" fill="#ecc6a8" stroke="' + C.skinDark + '" stroke-width="1.2"/>'; }
    if (P.band === 'fingre') { const q = J.map(p => FF.lerp(p[1], p[2], 0.35)); s += '<path fill="none" stroke="' + C.band + '" stroke-width="6" stroke-linecap="round" d="M' + q.map(P2).join(' L') + '"/>'; }
    if (P.ball2) { const T = P.T, I = J[0][3], c = FF.lerp(T, I, 0.5), sq = P.ball2.sq || 0; s += '<ellipse cx="' + f1(c[0] - 4) + '" cy="' + f1(c[1]) + '" rx="' + f1(16 * (1 - 0.25 * sq)) + '" ry="' + f1(16 * (1 + 0.15 * sq)) + '" fill="' + C.ball + '" stroke="' + C.ballDark + '" stroke-width="2"/>'; }
    const M = FF.lerp(MOPEN, MOPP, P.m || 0), T = P.T || TOPEN, K = ik2(M, T, 34, 28, 1);
    const TS = ' stroke="' + C.skinDark + '" stroke-width="1.4" stroke-opacity=".85"';
    s += FF.limb([132, 300], M, 34, 26, C.skin) + FF.limb(M, K, 25, 22, C.skin, TS) + FF.limb(K, T, 22, 19, C.skin, TS) + nail(T, Math.atan2(-(T[0] - K[0]), -(T[1] - K[1])) * 180 / Math.PI);
    if (P.touch) s += '<circle cx="' + f1(T[0]) + '" cy="' + f1(T[1]) + '" r="' + f1(16 * P.touch) + '" fill="none" stroke="' + C.accent + '" stroke-width="3" opacity="' + f1(P.touch) + '"/>';
    if (P.band === 'tommel') { const a = FF.lerp(M, K, 0.7), b = FF.lerp(J[0][0], J[0][1], 0.5); s += '<path fill="none" stroke="' + C.band + '" stroke-width="6" stroke-linecap="round" d="M' + P2(add(a, [0, -7])) + ' L' + P2(add(b, [0, -7])) + ' M' + P2(add(a, [0, 7])) + ' L' + P2(add(b, [0, 7])) + '"/>'; }
    return s;
  }
  const tipFor = (i, fl) => fJoints(i, fl, 0)[3];
  const hvFilm = (draw, extra) => Object.assign({}, HV, { vb: [0, 60, 320, 340], draw }, extra);

  // Knyt og stræk hånden (set fra siden)
  const OPEN = { fa: [0, 0, 0], ta: [38, 10, 8] }, FIST = { fa: [88, 100, 62], ta: [24, 6, -75] }, HOOK = { fa: [0, 100, 75], ta: [30, 14, 10] }, TABLE = { fa: [85, 0, 0], ta: [25, 18, 12] };
  define('haand-h-knyt', hvFilm(handSideV, {
    tempo: 'Knyt hånden blødt (2 sek.), og stræk så fingrene helt ud og spred dem (2 sek.). 10 gange. Gerne flere gange om dagen.',
    poses: { open: OPEN, fist: FIST }, start: 'open',
    seq: [{ to: 'fist', d: 2, k: 'op', l: 'Knyt', count: false }, { d: 0.6, k: 'hold', l: 'Knyt', count: false }, { to: 'open', d: 2, k: 'ned', l: 'Stræk', count: false }, { d: 0.8, k: 'pause', l: 'Stræk', count: false }],
    still: 2.3, ghost: 'open',
    over: () => tag(12, 70, 'Blødt – uden at klemme')
  }));
  // Seneglid-øvelser: lige – krog – lige – knytnæve – lige – bordplade
  define('haand-h-senegled', hvFilm(handSideV, {
    tempo: 'Hold hånden lige op. Bøj fingrene til en krog, og hold 3 sek. Ret ud. Knyt hånden, og hold 3 sek. Ret ud. Bøj kun i knoerne, så fingrene er lige som en bordplade, og hold 3 sek. 5 gange.',
    poses: { open: OPEN, hook: HOOK, fist: FIST, table: TABLE }, start: 'open',
    seq: [{ to: 'hook', d: 1.5, k: 'op', l: 'Krog', count: false }, { d: 3, k: 'hold', l: 'Hold' }, { to: 'open', d: 1.5, k: 'ned', l: 'Ret ud', count: false },
      { to: 'fist', d: 1.5, k: 'op', l: 'Knytnæve', count: false }, { d: 3, k: 'hold', l: 'Hold' }, { to: 'open', d: 1.5, k: 'ned', l: 'Ret ud', count: false },
      { to: 'table', d: 1.5, k: 'op', l: 'Bordplade', count: false }, { d: 3, k: 'hold', l: 'Hold' }, { to: 'open', d: 1.5, k: 'ned', l: 'Ret ud', count: false }],
    shots: [1.4, 7.4, 13.4], still: 7.4, ghost: 'open',
    over: (P, J, c) => tag(12, 70, c && c.key === 'hold' ? 'Hold stillingen' : 'Roligt fra stilling til stilling')
  }));
  // Klem en blød bold (set fra siden)
  define('haand-2-klem-bold', hvFilm(handSideV, {
    tempo: 'Hold en blød bold eller en sammenrullet sok i hånden. Klem roligt (2 sek.), hold 3 sek., og slip langsomt (2 sek.). 3 sæt × 10.',
    poses: { rest: { fa: [48, 62, 36], ta: [22, 40, 30], ball: { r: 32, sq: 0 } }, sq: { fa: [58, 76, 44], ta: [18, 48, 36], ball: { r: 32, sq: 1 } } }, start: 'rest',
    seq: [{ to: 'sq', d: 2, k: 'op', l: 'Klem', count: false }, { d: 3, k: 'hold', l: 'Hold' }, { to: 'rest', d: 2, k: 'ned', l: 'Slip', count: false }, { d: 0.8, k: 'pause', l: 'Slap af', count: false }],
    still: 3, ghost: null,
    over: () => tag(12, 70, 'Klem med hele hånden')
  }));
  // Tommel mod hver fingerspids (set forfra)
  (() => {
    const opp = i => { const fl = [0, 0, 0, 0]; fl[i] = 0.62 + i * 0.04; return { fl, m: 0.7 + i * 0.12, T: add(tipFor(i, fl[i]), [-5, 5]), touch: 1 }; };
    define('haand-1-tommel-fingre', hvFilm(handFront, {
      tempo: 'Rør roligt spidsen af hver finger med tommelfingeren, så de danner et rundt O – pegefinger, langfinger, ringfinger og lillefinger. Åbn hånden helt. 5–10 gange.',
      poses: { open: { fl: [0, 0, 0, 0], m: 0, T: TOPEN, touch: 0 }, a: opp(0), b: opp(1), c: opp(2), d: opp(3) }, start: 'open',
      seq: [{ to: 'a', d: 1.5, k: 'op', l: 'Pegefinger', count: false }, { to: 'open', d: 1, k: 'ned', l: 'Åbn', count: false }, { to: 'b', d: 1.5, k: 'op', l: 'Langfinger', count: false }, { to: 'open', d: 1, k: 'ned', l: 'Åbn', count: false },
        { to: 'c', d: 1.5, k: 'op', l: 'Ringfinger', count: false }, { to: 'open', d: 1, k: 'ned', l: 'Åbn', count: false }, { to: 'd', d: 1.5, k: 'op', l: 'Lillefinger', count: false }, { to: 'open', d: 1.5, k: 'ned', l: 'Åbn hånden', count: false }],
      shots: [1.45, 3.95, 8.95], still: 1.45, ghost: 'open',
      over: () => tag(12, 70, 'Rundt O – ikke fladt')
    }));
  })();
  // Spred fingrene (set forfra) – uden og med elastik
  define('haand-1-spred', hvFilm(handFront, {
    tempo: 'Hold hånden op med håndfladen mod dig. Spred fingrene så meget du kan (2 sek.), hold 3 sek., og saml dem igen (2 sek.). 10 gange.',
    poses: { a: { fl: [0, 0, 0, 0], sp: 0, T: [78, 222] }, b: { fl: [0, 0, 0, 0], sp: 1, T: [52, 232] } }, start: 'a',
    seq: [{ to: 'b', d: 2, k: 'op', l: 'Spred', count: false }, { d: 3, k: 'hold', l: 'Hold' }, { to: 'a', d: 2, k: 'ned', l: 'Saml', count: false }, { d: 0.6, k: 'pause', l: 'Slap af', count: false }],
    still: 3, ghost: 'a',
    over: () => tag(12, 70, 'Spred alle fingre')
  }));
  define('haand-2-elastik-spred', hvFilm(handFront, {
    tempo: 'Sæt en elastik om fingrene. Spred fingrene ud mod elastikken (2 sek.), hold 3 sek., og saml dem langsomt (2 sek.). 3 sæt × 10.',
    poses: { a: { fl: [0.12, 0.12, 0.12, 0.12], sp: 0, T: [92, 214], band: 'fingre' }, b: { fl: [0.12, 0.12, 0.12, 0.12], sp: 1, T: [60, 226], band: 'fingre' } }, start: 'a',
    seq: [{ to: 'b', d: 2, k: 'op', l: 'Spred', count: false }, { d: 3, k: 'hold', l: 'Hold' }, { to: 'a', d: 2, k: 'ned', l: 'Saml', count: false }, { d: 0.6, k: 'pause', l: 'Slap af', count: false }],
    still: 3, ghost: null,
    over: () => tag(12, 70, 'Elastik om fingrene')
  }));
  define('haand-2-tommel-elastik', hvFilm(handFront, {
    tempo: 'Sæt en elastik om tommelfingeren og pegefingeren. Før tommelen ud til siden mod elastikken (2 sek.), hold 3 sek., og før den langsomt tilbage (3 sek.). 3 sæt × 10.',
    poses: { a: { fl: [0, 0, 0, 0], m: 0.25, T: [96, 214], band: 'tommel' }, b: { fl: [0, 0, 0, 0], m: 0, T: [46, 236], band: 'tommel' } }, start: 'a',
    seq: [{ to: 'b', d: 2, k: 'op', l: 'Ud', count: false }, { d: 3, k: 'hold', l: 'Hold' }, { to: 'a', d: 3, k: 'ned', l: 'Tilbage', count: false }, { d: 0.6, k: 'pause', l: 'Slap af', count: false }],
    still: 3, ghost: 'a',
    over: () => tag(12, 70, 'Tommelen ud til siden')
  }));
  // Knib en lille bold mellem tommel og pegefinger (set fra siden: et rundt O)
  define('haand-3-knib', hvFilm(handSideV, {
    tempo: 'Hold en lille blød bold mellem tommelen og pegefingeren, så de danner et rundt O. Knib roligt (2 sek.), hold 3 sek., og slip (2 sek.). 3 sæt × 10.',
    poses: { a: { fa: [38, 62, 40], pinch: { sq: 0 } }, b: { fa: [42, 68, 44], pinch: { sq: 1 } } }, start: 'a',
    seq: [{ to: 'b', d: 2, k: 'op', l: 'Knib', count: false }, { d: 3, k: 'hold', l: 'Hold' }, { to: 'a', d: 2, k: 'ned', l: 'Slip', count: false }, { d: 0.6, k: 'pause', l: 'Slap af', count: false }],
    still: 3, ghost: null,
    over: () => tag(12, 70, 'Rundt O – tommelen må ikke knække')
  }));
  // Bevæg håndleddet op og ned (underarmen på bordet)
  define('haand-h-haandled', cuFilm({
    tempo: 'Underarmen på bordet, hånden ud over kanten. Bøj roligt hånden op (2 sek.) og ned (2 sek.), så langt det er rart. 10 gange. Gerne flere gange om dagen.',
    poses: { up: { w: 45, palm: 'ned', towel: 1 }, down: { w: -45, palm: 'ned', towel: 1 } }, start: 'up',
    seq: [{ to: 'down', d: 2, k: 'ned', l: 'Ned', count: false }, { to: 'up', d: 2, k: 'op', l: 'Op', count: false }], shots: [0, 1, 2],
    still: 1, ghost: 'down',
    over: P => wristArrow(P, true) + wristArrow(P, false) + tag(14, 30, 'Roligt – kun så langt, det er rart')
  }));
  // Nerveglid (karpaltunnel): armen ud til siden, håndfladen op; hånden bagud + hovedet mod armen, så hånden frem + hovedet væk
  (() => {
    const P = (w, tilt) => ({ hip: ROT_HIP, legR: { ank: [ROT_HIP[0] - 18, ANK] }, legL: { ank: [ROT_HIP[0] + 18, ANK] }, headTilt: tilt, w });
    define('haand-h-nerveglid', Object.assign(FRONT(), {
      vb: [0, 40, 320, 330],
      tempo: 'Stå eller sid. Løft armen ud til siden med håndfladen opad og albuen næsten strakt. Bøj hånden bagud, og vip hovedet mod armen (2 sek.). Ret hånden, og vip hovedet væk fra armen (2 sek.). 10 gange, roligt.',
      poses: { a: P(-50, 20), b: P(20, -20) }, start: 'b',
      seq: [{ to: 'a', d: 2, k: 'op', l: 'Hånden bagud', count: false }, { to: 'b', d: 2, k: 'ned', l: 'Hovedet væk', count: false }],
      still: 2, ghost: null, shots: [0, 1.98, 3.9],
      mod: P => { const S0 = frontS(P, 'R'), d = dirA(-86); P.armR = { el: add(S0, mul(d, 57)), hand: add(S0, mul(d, 110)) }; return P; },
      figOpt: P => ({ front: J => {
        const c = [82, 300], r = 62, hd = J.arms.R.hd; // forstørret udsnit af hånden
        return '<defs><clipPath id="ngc"><circle cx="' + c[0] + '" cy="' + c[1] + '" r="' + r + '"/></clipPath></defs><circle cx="' + c[0] + '" cy="' + c[1] + '" r="' + (r + 3) + '" fill="#fff" stroke="' + C.guide + '" stroke-width="2.5"/>' +
          '<line x1="' + f1(hd[0]) + '" y1="' + f1(hd[1] + 6) + '" x2="' + c[0] + '" y2="' + (c[1] - r) + '" stroke="' + C.guide + '" stroke-width="2" stroke-dasharray="4 4"/>' + '<g clip-path="url(#ngc)"><g transform="translate(' + (c[0] + 150) + ' ' + (c[1] - 52) + ') scale(-0.5,0.5)">' + armCU({ mode: 'straight', w: P.w, palm: 'op' }).svg + '</g></g>'; } }),
      over: () => tag(150, 60, 'Håndfladen op · armen ud')
    }));
  })();

  /* ================= ANKEL ================= */
  const KF = 3, onBallA = (x, fa) => sub([x, FLOOR + 1], FF.rot([30, 15], fa)), onBallBareA = (x, fa) => sub([x, FLOOR], FF.rot([28, 16], fa));
  const footKA = (ank, fa, o) => { o = o || {}; const c = o.roll ? 1 - 0.28 * Math.abs(o.roll) : 1;
    return '<g transform="translate(' + P2(ank) + ') rotate(' + f1(fa) + ') scale(' + f1(KF * c) + ',' + KF + ')">' + FF.footSide(false, o.toe || 0, '', '') + '</g>'; };
  const shinKA = (ank, top) => FF.limb(FF.lerp(ank, top, 0.08), top, 38, 46, C.skin) + FF.limb(FF.lerp(ank, top, 0.62), top, 62, 66, C.pants) + FF.limb(FF.lerp(ank, top, 0.6), FF.lerp(ank, top, 0.68), 62, 62, C.cuff);
  const ACL = { W: 320, H: 230, floor: 230, view: 'custom' };
  const ANK_L = [204, 150], KNEE_L = [-30, 192];        // benet ligger på en pude, foden lidt højere end knæet
  const sofa = () => '<rect x="0" y="196" width="320" height="34" fill="#c9b8a6"/><rect x="0" y="196" width="320" height="6" fill="#d8c9b8"/><ellipse cx="96" cy="194" rx="92" ry="22" fill="#fff" stroke="#d3d8dc" stroke-width="2"/>';
  const toePt = (fa, loc) => add(ANK_L, FF.rot(mul(loc || [30, 6], KF), fa));
  // Vip foden op og ned med benet højt
  define('ankel-h-pump', Object.assign({}, ACL, {
    tempo: 'Læg benet højt på en pude. Træk tæerne op mod dig (1 sek.), og pres dem væk (1 sek.). Roligt i 1–2 minutter, flere gange om dagen.',
    poses: { up: { fa: -124 }, down: { fa: -62 } }, start: 'up',
    seq: [{ to: 'down', d: 1.2, k: 'ned', l: 'Pres væk', count: false }, { to: 'up', d: 1.2, k: 'op', l: 'Træk op', count: false }],
    still: 0.6, ghost: 'down', shots: [0, 0.6, 1.15],
    back: sofa, draw: P => shinKA(ANK_L, KNEE_L) + footKA(ANK_L, P.fa),
    over: P => arcPath(ANK_L, 116, -150, -55) + tag(10, 10, 'Benet højt – hævelsen pumpes væk')
  }));
  // Tegn cirkler med foden
  define('ankel-h-cirkler', Object.assign({}, ACL, {
    tempo: 'Læg benet højt på en pude. Tegn store, rolige cirkler med tæerne – 10 gange den ene vej og 10 gange den anden vej.',
    poses: { a: { fa: -122, roll: 0 }, b: { fa: -92, roll: 1 }, c: { fa: -64, roll: 0 }, d: { fa: -92, roll: -1 } }, start: 'a',
    seq: [{ to: 'b', d: 0.9, k: 'op', l: 'Rundt', count: false, lin: true }, { to: 'c', d: 0.9, k: 'op', l: 'Rundt', count: false, lin: true }, { to: 'd', d: 0.9, k: 'op', l: 'Rundt', count: false, lin: true }, { to: 'a', d: 0.9, k: 'op', l: 'Rundt', count: false, lin: true }],
    still: 0.9, ghost: 'c', shots: [0, 0.9, 1.8],
    back: sofa, draw: P => shinKA(ANK_L, KNEE_L) + footKA(ANK_L, P.fa, { roll: P.roll }),
    over: () => { const c = toePt(-93, [32, 4]); return '<ellipse cx="' + f1(c[0]) + '" cy="' + f1(c[1] - 10) + '" rx="44" ry="20" fill="none" stroke="' + C.guide + '" stroke-width="2.5" stroke-dasharray="5 5" opacity=".75"/>' + R.arrow([c[0] + 40, c[1] - 2], [c[0] + 26, c[1] + 8]) + tag(10, 10, 'Tegn store cirkler med tæerne'); }
  }));
  // Træd ned mod elastikken
  define('ankel-1-elastik-ned', Object.assign({}, ACL, {
    tempo: 'Sid med benet strakt og en elastik om forfoden. Træd foden ned mod elastikken (2 sek.), og før den langsomt tilbage (3 sek.). 3 sæt × 15.',
    poses: { up: { fa: -112 }, down: { fa: -56 } }, start: 'up',
    seq: [{ to: 'down', d: 2, k: 'ned', l: 'Træd ned', count: false }, { to: 'up', d: 3, k: 'op', l: 'Tilbage', count: false }, { d: 0.5, k: 'pause', l: 'Klar', count: false }],
    still: 2, ghost: 'up',
    back: () => '<rect x="0" y="196" width="320" height="34" fill="' + C.mat + '"/>',
    draw: P => { const b1 = toePt(P.fa, [30, 2]), b2 = toePt(P.fa, [26, 15]);
      return '<path fill="none" stroke="' + C.bandDark + '" stroke-width="6" stroke-linecap="round" d="M' + P2(b2) + ' L-10,40"/>' + shinKA(ANK_L, KNEE_L) + footKA(ANK_L, P.fa) +
        '<path fill="none" stroke="' + C.band + '" stroke-width="6" stroke-linecap="round" d="M' + P2(b1) + ' L-10,26 M' + P2(b1) + ' L' + P2(b2) + '"/>'; },
    over: () => arcPath(ANK_L, 116, -140, -50) + tag(10, 10, 'Hænderne holder elastikken')
  }));
  // Drej foden ud mod elastikken (set ovenfra)
  (() => {
    const HL = [110, 214], HR = [204, 214], S = 2.6;
    const fTop = (h, a, col) => '<g transform="translate(' + P2(h) + ') rotate(' + f1(-90 + a) + ') scale(' + S + ')"><path fill="' + col + '" stroke="#9aa3aa" stroke-width=".6" d="M0,0 c0,-5 3,-7 8,-7.5 c8,-0.5 18,-2 24,-2.5 c6,-0.4 9,3 9,10 c0,7 -3,10.4 -9,10 c-6,-0.5 -16,-2 -24,-2.5 c-5,-0.5 -8,-2.5 -8,-7.5 z"/></g>';
    const fore = (h, a) => add(h, FF.rot([0, -30 * S], a));
    define('ankel-1-elastik-ud', Object.assign({}, { W: 320, H: 300, floor: 300, view: 'custom' }, {
      tempo: 'Sid med strakte ben og en elastik om begge forfødder. Drej den onde fod ud til siden mod elastikken (2 sek.), og før den langsomt tilbage (3 sek.). Hælen bliver liggende. 3 sæt × 15.',
      poses: { a: { a: 0 }, b: { a: 28 } }, start: 'a',
      seq: [{ to: 'b', d: 2, k: 'op', l: 'Ud', count: false }, { to: 'a', d: 3, k: 'ned', l: 'Tilbage', count: false }, { d: 0.5, k: 'pause', l: 'Klar', count: false }],
      still: 2, ghost: 'a',
      back: () => '<rect x="0" y="0" width="320" height="300" fill="' + C.mat + '"/>',
      draw: P => { const a = P.a || 0, p1 = fore(HL, -4), p2 = fore(HR, a);
        const leg = h => '<rect x="' + (h[0] - 22) + '" y="' + (h[1] - 4) + '" width="44" height="40" rx="14" fill="' + C.skin + '"/><rect x="' + (h[0] - 30) + '" y="' + (h[1] + 30) + '" width="60" height="80" rx="12" fill="' + C.pants + '"/><rect x="' + (h[0] - 30) + '" y="' + (h[1] + 30) + '" width="60" height="8" fill="' + C.cuff + '"/>';
        let s = leg(HL) + leg(HR);
        s += fTop(HL, -4, '#ffffff') + fTop(HR, a, '#ffffff');
        s += '<path fill="none" stroke="' + C.band + '" stroke-width="6" stroke-linecap="round" d="M' + P2(add(p1, [0, -14])) + ' L' + P2(add(p2, [0, -14])) + ' Q' + P2(add(p2, [30, 0])) + ' ' + P2(add(p2, [0, 14])) + ' L' + P2(add(p1, [0, 14])) + ' Q' + P2(add(p1, [-30, 0])) + ' ' + P2(add(p1, [0, -14])) + '"/>';
        return s; },
      over: () => arcPath(HR, 100, -92, -58) + tag(10, 10, 'Set ovenfra · hælen ligger stille') + tag(176, 272, 'Den onde fod')
    }));
  })();
  // Vægtskift fra side til side (set bagfra ved køkkenbordet)
  (() => {
    const hx = 160, P = sh => ({ hip: [hx + sh, 224], back: true, tilt: -sh * 0.25, legR: { ank: [hx + 22, ANK] }, legL: { ank: [hx - 22, ANK] }, armR: { hand: [hx + 30 + sh * 0.3, 222] }, armL: { hand: [hx - 30 + sh * 0.3, 222] } });
    define('ankel-h-vaegtskift', Object.assign({ W: 320, H: 440, floor: FLOOR, view: 'front' }, {
      tempo: 'Stå ved køkkenbordet med fødderne i hoftebredde. Flyt roligt vægten over på den onde fod (2 sek.), hold lidt, og flyt den tilbage (2 sek.). 10 gange.',
      poses: { m: P(0), r: P(17), l: P(-12) }, start: 'm',
      seq: [{ to: 'r', d: 2, k: 'op', l: 'Over på foden', count: false }, { d: 1.5, k: 'hold', l: 'Hold' }, { to: 'l', d: 2.2, k: 'ned', l: 'Tilbage', count: false }, { to: 'm', d: 1, k: 'pause', l: 'Slap af', count: false }],
      still: 2, ghost: 'm', shots: [0, 2, 5.5],
      back: () => R.counterBack(320, 227, FLOOR),
      over: (P, J) => tag(196, 300, 'Den onde fod') + R.arrow([hx - 4, 160], [hx + 30, 160])
    }));
  })();
  // Stræk læggen med et håndklæde (langsiddende)
  (() => {
    const fl = 262, mat = fl - 4, hip = [130, mat - 15];
    const base = (pf, tr) => ({ hip, trunk: tr, nod: -6, legF: { th: 92, kn: 3, pf: 10 }, legN: { th: 92, kn: 2, pf }, armF: { hand: [hip[0] + 92 + tr, mat - 82] }, armN: { hand: [hip[0] + 96 + tr, mat - 78] } });
    define('ankel-h-haandklaede', Object.assign(L(440, 290), {
      floor: fl, vb: [0, 38, 440, 252],
      tempo: 'Sid med strakte ben og et håndklæde om forfoden. Træk roligt i håndklædet, så tæerne kommer mod dig, til du mærker et stræk i læggen. Hold 30 sek. 3 gange.',
      poses: { a: base(14, 14), b: base(-18, 20) }, start: 'a',
      seq: [{ to: 'b', d: 2, k: 'op', l: 'Træk', count: false }, { d: 30, k: 'hold', l: 'Hold' }, { to: 'a', d: 2, k: 'ned', l: 'Slip', count: false }, { d: 2, k: 'pause', l: 'Hvil', count: false }],
      still: 6, ghost: 'a',
      under: () => R.mat(30, 430, mat + 4),
      figOpt: () => ({ front: J => { const g = J.legs.N, tp = add(g.ank, FF.rot([30, 4], g.fa)), h = J.arms.N.hd;
        return '<path fill="none" stroke="' + C.towelDark + '" stroke-width="7" stroke-linecap="round" d="M' + P2(h) + ' L' + P2(add(tp, [6, -8])) + ' Q' + P2(add(tp, [16, 2])) + ' ' + P2(add(tp, [4, 12])) + '"/><path fill="none" stroke="' + C.towel + '" stroke-width="4" stroke-linecap="round" d="M' + P2(h) + ' L' + P2(add(tp, [6, -8])) + '"/>'; } }),
      over: () => tag(10, 46, 'Benet strakt · træk tæerne mod dig')
    }));
  })();
  // Knæ mod væggen (stiv ankel): hælen i gulvet, knæet frem over tæerne
  (() => {
    const wall = 262, P = (hx, hy, tr) => ({ hip: [hx, hy], trunk: tr, legN: { ank: [212, ANK] }, legF: { ank: [104, ANK], fa: 18, toe: -18 }, armF: { hand: [wall - 4, 196] }, armN: { hand: [wall - 2, 202] } });
    define('ankel-1-knae-mod-vaeg', Object.assign(S(), {
      tempo: 'Stå med den onde fod lidt fra væggen og den anden bagved. Bøj knæet frem mod væggen (2 sek.), mens hælen bliver i gulvet. Hold 2 sek., og gå tilbage. 10–15 gange. Ryk foden lidt længere væk, når det er let.',
      poses: { a: P(148, 230, 4), b: P(176, 252, 6) }, start: 'a',
      seq: [{ to: 'b', d: 2, k: 'op', l: 'Knæet frem', count: false }, { d: 2, k: 'hold', l: 'Hold' }, { to: 'a', d: 2, k: 'ned', l: 'Tilbage', count: false }, { d: 0.6, k: 'pause', l: 'Klar', count: false }],
      still: 3, ghost: 'a',
      mod: P => { const d = { th: 0 }; return P; },
      back: () => R.wall(wall + 6, 320, 0, FLOOR),
      over: (P, J) => R.arrow(add(J.legs.N.knee, [-30, -18]), add(J.legs.N.knee, [-2, -18])) + tag(8, 60, 'Hælen bliver i gulvet') +
        '<circle cx="' + f1(J.legs.N.ank[0] - 4) + '" cy="' + (FLOOR - 4) + '" r="9" fill="none" stroke="' + C.accent + '" stroke-width="3"/>'
    }));
  })();
  // Hæløft på ét ben (hånden mod væggen)
  (() => {
    const wall = 252, bx = 214;
    const P = fa => { const a = onBallBareA(bx, fa); return { hip: [a[0] + 4, a[1] - 176], trunk: 3, legN: { ank: a, fa, toe: -fa }, legF: { th: 18, kn: 48, pf: 10 }, armF: { hand: [wall - 4, 196 - (ANK - a[1])] }, armN: { hand: [wall - 2, 202 - (ANK - a[1])] } }; };
    define('ankel-2-haeloeft-et-ben', Object.assign(S(), {
      tempo: 'Stå på det onde ben med hænderne let mod væggen. Løft hælen roligt op (2 sek.), hold 1 sek., og sænk langsomt (3 sek.). 3 sæt × 10–15.',
      poses: { down: P(0), up: P(36) }, start: 'down',
      seq: [{ to: 'up', d: 2, k: 'op', l: 'Op' }, { d: 1, k: 'hold', l: 'Hold', count: false }, { to: 'down', d: 3, k: 'ned', l: 'Ned', count: false }, { d: 0.8, k: 'pause', l: 'Hvil', count: false }],
      still: 2.5, ghost: 'down',
      figOpt: () => ({ bare: true }),
      back: () => R.wall(wall + 6, 320, 0, FLOOR)
    }));
  })();
  // Stå på ét ben og ræk med den anden fod frem og tilbage (ved køkkenbordet)
  (() => {
    const P = (hy, tr, ln) => ({ hip: [150, hy], trunk: tr, legF: { ank: [150, ANK] }, legN: ln, armN: { sa: 6, ef: 18, rel: 1 } });
    const ch = P => { const sx = P.hip[0] + Math.sin((P.trunk || 0) * Math.PI / 180) * 100 + 12; P.armF = { hand: [sx, 220] }; return P; };
    define('ankel-2-et-ben-raek', Object.assign(S(), {
      vb: [0, 40, 320, 400],
      tempo: 'Stå på det onde ben med let bøjet knæ, og hold let i bordet. Ræk roligt med den anden fod frem og rør gulvet let (2 sek.), og ræk så bagud (2 sek.). 10 gange. Skift ben.',
      poses: { n: P(232, 2, { th: 8, kn: 22, pf: 0 }), f: P(240, -2, { ank: [228, ANK - 3], fa: -14 }), b: P(240, 8, { ank: [74, ANK - 3], fa: 22, toe: -22 }) }, start: 'n',
      seq: [{ to: 'f', d: 2, k: 'op', l: 'Frem', count: false, arc: { legN: 10 } }, { to: 'n', d: 1.2, k: 'ned', l: 'Tilbage', count: false }, { to: 'b', d: 2, k: 'op', l: 'Bagud', count: false, arc: { legN: 10 } }, { to: 'n', d: 1.2, k: 'ned', l: 'Tilbage', count: false }],
      still: 2, ghost: 'n', shots: [0, 2, 5.2],
      mod: ch,
      back: () => R.counterBack(320, 227, FLOOR),
      over: () => tag(8, 60, 'Standbenet: let bøjet knæ')
    }));
  })();
  // Hop fra side til side over en streg (set bagfra)
  (() => {
    const P = (x, hy, ay) => ({ hip: [x, hy], back: true, tilt: 0, legR: { ank: [x + 11, ay] }, legL: { ank: [x - 11, ay] }, armR: { hand: [x + 34, hy + 10] }, armL: { hand: [x - 34, hy + 10] } });
    define('ankel-3-sidehop', Object.assign({ W: 320, H: 440, floor: FLOOR, view: 'front' }, {
      tempo: 'Stå med samlede fødder ved siden af en streg på gulvet. Hop roligt over stregen og tilbage, og land blødt med bøjede knæ. 10–20 hop. Start med små hop.',
      repLabel: 'Hop', poses: { a: P(124, 232, ANK), up1: P(160, 208, ANK - 30), b: P(196, 232, ANK), up2: P(160, 208, ANK - 30) }, start: 'a',
      seq: [{ to: 'up1', d: 0.35, k: 'op', l: 'Hop', count: false }, { to: 'b', d: 0.35, k: 'ned', l: 'Land blødt', count: false }, { d: 0.5, k: 'pause', l: 'Land blødt', count: false },
        { to: 'up2', d: 0.35, k: 'op', l: 'Hop', count: false }, { to: 'a', d: 0.35, k: 'ned', l: 'Land blødt', count: false }, { d: 0.5, k: 'pause', l: 'Land blødt', count: false }],
      still: 0.35, ghost: 'a', shots: [0, 0.35, 0.7],
      under: () => '<path fill="' + C.accent + '" opacity=".85" d="M157,' + (FLOOR - 4) + ' L163,' + (FLOOR - 4) + ' L166,440 L154,440 Z"/>',
      over: () => tag(8, 60, 'Land blødt på forfoden')
    }));
  })();

  /* ================= FOD OG TÆER ================= */
  const FCL = { W: 320, H: 230, floor: 230, view: 'custom' }, FFL = 202;
  const floorBg = () => '<rect x="0" y="0" width="320" height="' + FFL + '" fill="' + C.wall + '"/><rect x="0" y="' + FFL + '" width="320" height="' + (230 - FFL) + '" fill="' + C.floor + '"/><rect x="0" y="' + FFL + '" width="320" height="2" fill="' + C.floorLine + '"/>';
  const FANK = [128, FFL - 16 * KF];                     // foden står fladt; anklen 48 over gulvet
  const footFlat = (toe, extra, arch) => shinKA(FANK, [FANK[0] - 18, -30]) + '<g transform="translate(' + P2(FANK) + ') scale(' + KF + ')">' + FF.footSide(false, toe || 0, extra || '', arch || '') + '</g>';
  const toeTip = (toe, d) => add(FANK, mul(add([30, 11], FF.rot([d || 11, 0], toe || 0)), KF));
  // Fod set forfra: tæerne nederst, storetåen til højre
  const TB = [[100, 22, 22], [125, 24, 25], [151, 26, 27], [178, 28, 28], [215, 40, 32]]; // [x, bredde, længde]
  function footFrontV(o) {
    const lift = o.lift || [0, 0, 0, 0, 0], sp = o.spread || 0, out = o.out || 0, by = FFL - 32;
    let g = floorBg();
    g += '<rect x="126" y="-10" width="76" height="72" fill="' + C.pants + '"/><rect x="126" y="54" width="76" height="9" fill="' + C.cuff + '"/>';
    g += '<path fill="' + C.skin + '" stroke="' + C.skinDark + '" stroke-width="1.2" d="M134,60 L196,60 C202,90 228,120 238,' + (by - 4) + ' C242,' + by + ' 240,' + (by + 8) + ' 232,' + (by + 8) + ' L94,' + (by + 8) + ' C86,' + (by + 8) + ' 84,' + by + ' 88,' + (by - 6) + ' C100,124 128,94 134,60 Z"/>';
    g += '<path fill="none" stroke="' + C.skinMid + '" stroke-width="2" opacity=".7" d="M198,96 C210,118 220,134 224,' + (by - 8) + ' M140,100 C130,120 112,136 104,' + (by - 8) + '"/>';
    TB.forEach((b, i) => {
      const h = lift[i] || 0, ang = (i - 2.6) * sp * 9 + (i === 4 ? out * 24 : 0), len = b[2] * (1 - 0.3 * h), w = b[1];
      g += '<ellipse cx="' + f1(b[0] + Math.sin(ang * Math.PI / 180) * b[2]) + '" cy="' + (FFL + 1) + '" rx="' + f1(w * 0.55) + '" ry="3" fill="#9fb0ab" opacity="' + f1(0.6 * (1 - h)) + '"/>';
      g += '<g transform="translate(' + b[0] + ',' + f1(by - 12 * h) + ') rotate(' + f1(-ang) + ')"><rect x="' + f1(-w / 2) + '" y="-4" width="' + w + '" height="' + f1(len + 4) + '" rx="' + f1(w * 0.45) + '" fill="' + C.skin + '" stroke="' + C.skinDark + '" stroke-width="1.3"/>' +
        '<rect x="' + f1(-w * 0.3) + '" y="' + f1(len * 0.25 - 4 * h) + '" width="' + f1(w * 0.6) + '" height="' + f1(len * 0.38 + 5 * h) + '" rx="' + f1(w * 0.2) + '" fill="' + C.nail + '" stroke="' + C.skinDark + '" stroke-width=".6"/></g>';
    });
    return g;
  }
  const fvFilm = (id, o) => define(id, Object.assign({}, FCL, { draw: footFrontV, back: () => '' }, o));
  // Ondt nu: tæerne op og ned (foden fladt på gulvet)
  define('fod-h-taa-op-ned', Object.assign({}, FCL, {
    tempo: 'Sid med foden fladt på gulvet. Løft alle tæerne op (2 sek.), og krøl dem roligt ned mod gulvet (2 sek.). 10–15 gange, gerne flere gange om dagen.',
    poses: { n: { toe: 0 }, up: { toe: -42 }, dn: { toe: 26 } }, start: 'n',
    seq: [{ to: 'up', d: 1.6, k: 'op', l: 'Tæerne op', count: false }, { d: 0.6, k: 'hold', l: 'Hold', count: false }, { to: 'dn', d: 2, k: 'ned', l: 'Krøl ned', count: false }, { to: 'n', d: 1, k: 'pause', l: 'Slap af', count: false }],
    still: 1.8, ghost: 'n', shots: [0, 1.8, 4.2],
    back: floorBg, draw: P => footFlat(P.toe),
    over: P => arcPath(add(FANK, [90, 33]), 46, -70, 30) + tag(10, 10, 'Hælen og forfoden bliver i gulvet')
  }));
  // Ondt nu: spred tæerne
  fvFilm('fod-h-spred', {
    tempo: 'Sid med foden fladt på gulvet. Spred tæerne så meget du kan (2 sek.), hold 3 sek., og slap af. 10 gange.',
    poses: { a: { spread: 0 }, b: { spread: 1 } }, start: 'a',
    seq: [{ to: 'b', d: 2, k: 'op', l: 'Spred', count: false }, { d: 3, k: 'hold', l: 'Hold' }, { to: 'a', d: 1.5, k: 'ned', l: 'Slap af', count: false }, { d: 0.6, k: 'pause', l: 'Hvil', count: false }],
    still: 3, ghost: 'a',
    over: () => R.arrow([80, 216], [56, 216]) + R.arrow([248, 216], [272, 216]) + tag(10, 10, 'Set forfra · spred tæerne som en vifte')
  });
  // Niveau 1: tå-yoga (storetåen op, de små ned – og omvendt)
  fvFilm('fod-1-taa-yoga', {
    tempo: 'Løft storetåen, mens de små tæer bliver i gulvet (hold 3 sek.). Skift: pres storetåen ned, og løft de små tæer (hold 3 sek.). 10 gange.',
    poses: { n: { lift: [0, 0, 0, 0, 0] }, big: { lift: [0, 0, 0, 0, 1] }, small: { lift: [1, 1, 1, 1, 0] } }, start: 'n',
    seq: [{ to: 'big', d: 1.2, k: 'op', l: 'Storetåen op', count: false }, { d: 3, k: 'hold', l: 'Hold' }, { to: 'n', d: 0.8, k: 'ned', l: 'Ned', count: false },
      { to: 'small', d: 1.2, k: 'op', l: 'De små tæer op', count: false }, { d: 3, k: 'hold', l: 'Hold' }, { to: 'n', d: 0.8, k: 'ned', l: 'Ned', count: false }],
    still: 2, ghost: 'n', shots: [0, 2, 7],
    over: (P, J, c) => tag(10, 10, 'Set forfra') + ((P.lift || [])[4] > 0.5 ? R.arrow([215, 140], [215, 110]) : (P.lift || [])[0] > 0.5 ? R.arrow([138, 140], [138, 110]) : '')
  });
  // Niveau 1: storetåen ud mod de andre tæers modsatte side
  fvFilm('fod-1-storetaa-ud', {
    tempo: 'Sid med foden fladt på gulvet. Før storetåen væk fra de andre tæer, ind mod den anden fod (2 sek.). Hold 3 sek., og slap af. 10 gange. Hjælp gerne med en finger i starten.',
    poses: { a: { out: 0 }, b: { out: 1 } }, start: 'a',
    seq: [{ to: 'b', d: 2, k: 'op', l: 'Storetåen ud', count: false }, { d: 3, k: 'hold', l: 'Hold' }, { to: 'a', d: 1.5, k: 'ned', l: 'Slap af', count: false }, { d: 0.6, k: 'pause', l: 'Hvil', count: false }],
    still: 3, ghost: 'a',
    over: () => R.arrow([240, 216], [270, 216]) + tag(10, 10, 'Set forfra · storetåen væk fra de andre')
  });
  // Niveau 1: kort fod (hvælv svangen uden at krølle tæerne)
  define('fod-1-kort-fod', Object.assign({}, FCL, {
    tempo: 'Sid eller stå med foden fladt. Træk forfoden mod hælen, så svangen løfter sig – uden at krølle tæerne (2 sek.). Hold 5 sek., og slap af. 10 gange.',
    poses: { a: { s: 0 }, b: { s: 1 } }, start: 'a',
    seq: [{ to: 'b', d: 2, k: 'op', l: 'Løft svangen', count: false }, { d: 5, k: 'hold', l: 'Hold' }, { to: 'a', d: 1.5, k: 'ned', l: 'Slap af', count: false }, { d: 0.8, k: 'pause', l: 'Hvil', count: false }],
    still: 4, ghost: 'a',
    back: floorBg,
    draw: P => { const s = P.s || 0;
      const cut = '<path fill="' + C.floor + '" d="M-4,16.6 C2,' + f1(16.4 - 3.6 * s) + ' 14,' + f1(16 - 3.8 * s) + ' 22,16.6 Z"/>' +
        '<path fill="none" stroke="#e8663c" stroke-width="1" opacity="' + f1(s) + '" d="M-3,' + f1(16.3 - 0.4 * s) + ' C2,' + f1(15.6 - 3.6 * s) + ' 14,' + f1(15.2 - 3.8 * s) + ' 21,16.2"/>';
      return footFlat(0, '', cut); },
    over: () => R.arrow([FANK[0] + 26, FFL + 22], [FANK[0] + 26, FFL - 2]) + tag(10, 10, 'Svangen løfter sig · tæerne er lige')
  }));
  // Niveau 2: pres storetåen ned mod elastikken
  define('fod-2-taa-elastik', Object.assign({}, FCL, {
    tempo: 'Sid med foden i gulvet og en elastik om storetåen. Hold elastikken op med hånden. Pres storetåen ned mod gulvet (2 sek.), og lad den langsomt komme op (3 sek.). 3 sæt × 10–15.',
    poses: { up: { toe: -34 }, dn: { toe: 4 } }, start: 'up',
    seq: [{ to: 'dn', d: 2, k: 'ned', l: 'Pres ned', count: false }, { to: 'up', d: 3, k: 'op', l: 'Langsomt op', count: false }, { d: 0.5, k: 'pause', l: 'Klar', count: false }],
    still: 2, ghost: 'up',
    back: floorBg,
    draw: P => { const tp = toeTip(P.toe, 6); return footFlat(P.toe) + '<path fill="none" stroke="' + C.band + '" stroke-width="6" stroke-linecap="round" d="M' + P2(add(tp, [-6, 0])) + ' L' + f1(tp[0] - 30) + ',-10 M' + P2(add(tp, [6, 0])) + ' L' + f1(tp[0] - 14) + ',-10"/>'; },
    over: () => arcPath(add(FANK, [90, 33]), 46, -60, 10) + tag(10, 10, 'Hånden holder elastikken')
  }));
  // Niveau 2: saml en bold op med tæerne
  define('fod-2-kugle', Object.assign({}, FCL, {
    tempo: 'Sid med en lille, blød bold (eller en sok) foran tæerne. Grib den med tæerne (1 sek.), løft foden lidt, og hold 3 sek. Sæt ned, og slip. 10 gange.',
    poses: { n: { toe: 0, lift: 0 }, grab: { toe: 34, lift: 0 }, up: { toe: 34, lift: 1 } }, start: 'n',
    seq: [{ to: 'grab', d: 1.2, k: 'op', l: 'Grib', count: false }, { to: 'up', d: 1.2, k: 'op', l: 'Løft', count: false }, { d: 3, k: 'hold', l: 'Hold' }, { to: 'grab', d: 1.2, k: 'ned', l: 'Ned', count: false }, { to: 'n', d: 1, k: 'pause', l: 'Slip', count: false }],
    still: 4, ghost: 'n', shots: [0, 1.2, 4],
    back: floorBg,
    draw: P => { const L = 22 * (P.lift || 0), base = '<g transform="translate(0,' + f1(-L) + ')">' + footFlat(P.toe) + '</g>';
      const tp = add(toeTip(P.toe, 11), [0, -L]), bx = 30 * KF + FANK[0] + 30, br = 13;
      const ballP = P.lift > 0.02 || P.toe > 25 ? [tp[0] - 4, tp[1] + 6] : [bx, FFL - br];
      const ball = '<circle cx="' + f1(Math.max(ballP[0], 0)) + '" cy="' + f1(Math.min(ballP[1], FFL - br)) + '" r="' + br + '" fill="' + C.ball + '" stroke="' + C.ballDark + '" stroke-width="2"/>';
      return ball + base; },
    over: () => tag(10, 10, 'Tæerne griber bolden')
  }));
  // Niveau 3: gå på tæerne på stedet (ved køkkenbordet)
  (() => {
    const bx = 170;
    const P = side => { const a = onBallBareA(bx, 34), up = { th: 18, kn: 46, pf: 18 };
      const st = { ank: a, fa: 34, toe: -34 }; return { hip: [a[0] + 2, a[1] - 176], trunk: 2, legN: side ? st : up, legF: side ? up : Object.assign({}, st, { ank: [a[0] - 6, a[1]] }), armN: { sa: 6, ef: 20, rel: 1 } }; };
    define('fod-3-taagang', Object.assign(S(), {
      tempo: 'Stå på tæerne, og hold let i bordet. Gå roligt på stedet på forfødderne – hælene bliver oppe. 20–30 skridt. Sænk hælene, og hvil.',
      repLabel: 'Skridt', poses: { a: P(1), b: P(0) }, start: 'a',
      seq: [{ to: 'b', d: 0.8, k: 'op', l: 'Skridt', count: false }, { to: 'a', d: 0.8, k: 'op', l: 'Skridt', count: false }],
      still: 0.4, ghost: 'b', shots: [0, 0.4, 0.8],
      mod: P => { const sx = P.hip[0] + Math.sin((P.trunk || 0) * Math.PI / 180) * 100 + 12; P.armF = { hand: [sx, 220] }; return P; },
      figOpt: () => ({ bare: true }),
      back: () => R.counterBack(320, 227, FLOOR),
      over: () => tag(8, 60, 'Hælene bliver oppe')
    }));
  })();
})();
