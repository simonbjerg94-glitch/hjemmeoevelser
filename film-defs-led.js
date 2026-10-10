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
})();
