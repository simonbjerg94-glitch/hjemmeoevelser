/* v34: flere tempo-film til PT (kropsvægt, uden udstyr). Bruger FigFilm fra film-engine.js.
   Figuren ses fra siden med hovedet mod højre (eller forfra). Fase-teksterne bruges også af stemmen. */
'use strict';
(() => {
  const FF = typeof FigFilm !== 'undefined' ? FigFilm : require('./film-engine.js');
  const { R, C, add, sub, mul, lerp, define, FILMS } = FF;
  const f1 = FF.f1, P2 = FF.P2;
  const FLOOR = 420, ANK = 404, G = 250, MAT = 248;
  const S = (W, H) => ({ W: W || 320, H: H || 440, floor: FLOOR, view: 'side' });
  const W2 = () => ({ W: 400, H: 440, floor: FLOOR, view: 'side' });
  const L = () => ({ W: 440, H: 270, floor: 252, view: 'side' });
  const FRONT = () => ({ W: 320, H: 440, floor: FLOOR, view: 'front' });
  const rad = d => d * Math.PI / 180;
  const unit = v => { const n = Math.hypot(v[0], v[1]) || 1; return [v[0] / n, v[1] / n]; };
  const rotV = (v, d) => { const r = rad(d); return [v[0] * Math.cos(r) - v[1] * Math.sin(r), v[0] * Math.sin(r) + v[1] * Math.cos(r)]; };
  const mat = () => R.mat(10, 430, G + 2);
  const copy = (id, src, extra) => define(id, Object.assign({}, FILMS[src], extra || {}));
  const rep = (dn, up, l1, l2) => [{ to: 'down', d: dn, k: 'ned', l: l1 || 'Ned' }, { to: 'up', d: up, k: 'op', l: l2 || 'Op' }, { d: 0.6, k: 'pause', l: 'Klar', count: false }];
  // Gør alle led eksplicitte (knæ/ankel og albue/hånd), så stillinger med forskellige parametre kan blandes uden at filmen hopper
  const fix = P => { const J = FF.sideJoints(P), o = Object.assign({}, P);
    for (const k of ['F', 'N']) { const g = J.legs[k]; o['leg' + k] = { knee: g.knee, ank: g.ank, fa: g.fa }; o['arm' + k] = { hand: J.arms[k].hd, el: J.arms[k].el }; }
    return o; };
  const fixF = P => { const J = FF.frontJoints(P), o = Object.assign({}, P);
    for (const k of ['R', 'L']) { o['leg' + k] = { knee: J.legs[k].knee, ank: J.legs[k].ank }; o['arm' + k] = { hand: J.arms[k].hd, el: J.arms[k].el }; }
    return o; };
  // Lige krop fra fødderne (A = ankel på tæerne) til skuldrene S: hoften ligger 178 fra anklen på linjen
  const straightBody = (A, Sx, Sy, fa, extra) => { const u = unit(sub([Sx, Sy], A)), hip = add(A, mul(u, 178)), b = Math.atan2(-(Sy - A[1]), Sx - A[0]) * 180 / Math.PI;
    return Object.assign({ hip, trunk: 90 - b, nod: -4, curve: 0, legF: { knee: add(lerp(hip, A, 0.5), [-3, 2]), ank: add(A, [-3, 1]), fa }, legN: { knee: lerp(hip, A, 0.5), ank: A, fa } }, extra || {}); };
  const Sof = P => FF.sideJoints(Object.assign({}, P, { armF: {}, armN: {} })).S;
  const headOver = () => ({ front: J => '<g transform="translate(' + P2(J.head) + ') rotate(' + f1(J.headA) + ')">' + FF.headSide() + '</g>' });
  // Liggende på maven (hovedet til højre)
  const PH = [196, G - 15];
  const prone = (lift, legUp, arms) => { const P = { hip: PH, trunk: 90 - (lift || 0), nod: -12 - (lift || 0) * 0.3, chin: 7, curve: 0,
      legF: { knee: [106, G - 13 - (legUp || 0) * 0.4], ank: [20, G - 13 - (legUp || 0)], fa: 80 }, legN: { knee: [110, G - 12 - (legUp || 0) * 0.4], ank: [24, G - 12 - (legUp || 0)], fa: 80 } };
    return Object.assign(P, arms(Sof(P))); };
  // Liggende på ryggen (hovedet til venstre)
  const SUP_HIP = [226, MAT - 16], SUP_SH = [126, MAT - 16];
  const supine = extra => Object.assign({ hip: SUP_HIP, trunkTo: SUP_SH, curve: 0, nod: 0, chin: 0, legF: { ank: [318, MAT - 16] }, legN: { ank: [326, MAT - 16] }, armF: { hand: [206, MAT - 7], straight: 1 }, armN: { hand: [214, MAT - 6], straight: 1 } }, extra || {});
  // På alle fire
  const Q_HIP = [150, MAT - 98];
  const quad = extra => Object.assign({ hip: Q_HIP, trunk: 90, nod: 0, curve: 0, legF: { th: -2, kn: 90, pf: 84 }, legN: { th: 2, kn: 92, pf: 84 }, armF: { hand: [246, MAT - 7], straight: 1 }, armN: { hand: [254, MAT - 6], straight: 1 } }, extra || {});
  const stool = (x0, x1, top, floor) => '<rect x="' + x0 + '" y="' + top + '" width="' + (x1 - x0) + '" height="10" rx="3" fill="' + C.wood + '"/>' +
    '<rect x="' + (x0 + 4) + '" y="' + (top + 10) + '" width="7" height="' + (floor - top - 10) + '" fill="' + C.woodDark + '"/><rect x="' + (x1 - 11) + '" y="' + (top + 10) + '" width="7" height="' + (floor - top - 10) + '" fill="' + C.woodDark + '"/>';

  /* ================= UNDERKROP ================= */
  // Gående udfald (på stedet): skiftevis højre og venstre ben frem
  (() => {
    const stand = fix({ hip: [176, 229], trunk: 2, legF: { ank: [172, ANK] }, legN: { ank: [180, ANK] }, armF: { sa: 6, ef: 30 }, armN: { sa: 2, ef: 34 } });
    const lunge = front => fix({ hip: [186, 302], trunk: 4, nod: -2, ['leg' + front]: { ank: [262, ANK] }, ['leg' + (front === 'N' ? 'F' : 'N')]: { ank: [118, ANK - 12], fa: 50 }, armF: { sa: 6, ef: 30 }, armN: { sa: 2, ef: 34 } });
    define('pt-udfald-gaaende', Object.assign(W2(), {
      tempo: 'Tag et langt skridt frem, og sænk dig lodret ned, til begge knæ er bøjet ca. 90° (2 sek.). Pres op gennem forreste hæl, og saml benene (1–2 sek.). Skift ben hver gang.',
      poses: { m: stand, a: lunge('N'), b: lunge('F') }, start: 'm',
      seq: [{ to: 'a', d: 2, k: 'ned', l: 'Frem og ned' }, { to: 'm', d: 1.5, k: 'op', l: 'Op og saml', count: false }, { to: 'b', d: 2, k: 'ned', l: 'Frem og ned' }, { to: 'm', d: 1.5, k: 'op', l: 'Op og saml', count: false }],
      still: 2, ghost: 'm'
    }));
  })();

  // Sideudfald (forfra): sæt dig ned i det ene ben, det andet er strakt
  (() => {
    const AR = [84, ANK], AL = [236, ANK];
    const P = (hx, hy, tilt) => fixF({ hip: [hx, hy], tilt: tilt || 0, legR: { ank: AR }, legL: { ank: AL }, armR: { hand: [hx - 10, hy - 52] }, armL: { hand: [hx + 10, hy - 52] } });
    define('pt-sideudfald', Object.assign(FRONT(), {
      tempo: 'Stå bredt med tæerne fremad. Sæt dig ned og bagud i det ene ben, mens det andet ben er strakt (2 sek.). Pres tilbage til midten (1 sek.), og skift side.',
      poses: { m: P(160, 236), r: P(116, 300, 4), l: P(204, 300, -4) }, start: 'm',
      seq: [{ to: 'r', d: 2, k: 'ned', l: 'Ned til siden' }, { to: 'm', d: 1.2, k: 'op', l: 'Midten', count: false }, { to: 'l', d: 2, k: 'ned', l: 'Ned til siden' }, { to: 'm', d: 1.2, k: 'op', l: 'Midten', count: false }],
      still: 2, ghost: 'm'
    }));
  })();

  // Bro med marchering: hoften oppe, løft skiftevis det ene knæ
  (() => {
    const sh = [96, MAT - 16], aF = [314, MAT - 16], aN = [322, MAT - 16];
    const base = (hip, lift) => { const P = { hip, trunkTo: sh, nod: 0, legF: { ank: aF }, legN: { ank: aN }, armF: { hand: [196, MAT - 7] }, armN: { hand: [204, MAT - 6] } };
      const o = fix(P); if (lift) o['leg' + lift] = { knee: add(hip, [52, -70]), ank: add(hip, [118, -54]), fa: -10 }; return o; };
    const UP = [200, MAT - 76];
    define('pt-bro-march', Object.assign(L(), {
      vb: [0, 22, 440, 242],
      tempo: 'Lig på ryggen med bøjede knæ. Løft hoften op i en bro (2 sek.). Løft skiftevis det ene knæ op mod brystet uden at hoften falder eller drejer (1 sek. op, 1 sek. ned). Sænk hoften til sidst.',
      poses: { down: base([196, MAT - 16]), up: base(UP), a: base(UP, 'N'), b: base(UP, 'F') }, start: 'down',
      seq: [{ to: 'up', d: 2, k: 'op', l: 'Hoften op', count: false }, { to: 'a', d: 1, k: 'op', l: 'Knæet op' }, { to: 'up', d: 1, k: 'ned', l: 'Ned', count: false }, { to: 'b', d: 1, k: 'op', l: 'Knæet op' }, { to: 'up', d: 1, k: 'ned', l: 'Ned', count: false }, { to: 'down', d: 2, k: 'ned', l: 'Sænk hoften', count: false }, { d: 1, k: 'pause', l: 'Hvil', count: false }],
      still: 2.5, ghost: 'down', under: () => R.mat(20, 425, MAT + 4)
    }));
  })();

  // Hoftestød med skuldrene på sofaen
  (() => {
    const SH = [100, 302], A = [278, ANK];
    const P = hip => fix({ hip, trunkTo: SH, nod: -4, legF: { ank: add(A, [-6, 0]) }, legN: { ank: A }, armF: { hand: [70, 312] }, armN: { hand: [78, 314] } });
    define('pt-hoftestod', Object.assign(S(), {
      vb: [0, 150, 320, 290],
      tempo: 'Læn den øverste del af ryggen mod kanten af en sofa, fødderne i gulvet. Pres hoften op, til kroppen er vandret fra skuldre til knæ, og klem ballerne (2 sek.). Hold 2 sek., og sænk roligt (2 sek.).',
      poses: { down: P([178, 372]), up: P([198, 306]) }, start: 'down',
      seq: [{ to: 'up', d: 2, k: 'op', l: 'Op' }, { d: 2, k: 'hold', l: 'Klem', count: false }, { to: 'down', d: 2, k: 'ned', l: 'Ned', count: false }, { d: 0.8, k: 'pause', l: 'Klar', count: false }],
      still: 2.6, ghost: 'down',
      back: () => '<rect x="-20" y="230" width="62" height="190" rx="14" fill="#7d8ea3"/><rect x="-20" y="310" width="130" height="110" rx="12" fill="#8f9fb3"/><rect x="-20" y="408" width="130" height="12" fill="#5f6b78"/>'
    }));
  })();

  // Bro med hælene på en stol (baglår)
  (() => {
    const top = 196, A = [334, top - 14];
    const P = hip => fix({ hip, trunkTo: [110, MAT - 16], nod: 0, legF: { ank: add(A, [-6, 0]), fa: -14 }, legN: { ank: A, fa: -14 }, armF: { hand: [196, MAT - 7] }, armN: { hand: [204, MAT - 6] } });
    define('pt-baglaarsbro-stol', Object.assign(L(), {
      vb: [0, 60, 440, 200],
      tempo: 'Lig på ryggen med hælene på sædet af en stol og let bøjede knæ. Pres hælene ned i stolen, og løft hoften (2 sek.). Hold 2 sek., og sænk roligt (2 sek.). Du mærker det bag på lårene.',
      poses: { down: P([212, MAT - 16]), up: P([222, MAT - 62]) }, start: 'down',
      seq: [{ to: 'up', d: 2, k: 'op', l: 'Op' }, { d: 2, k: 'hold', l: 'Hold', count: false }, { to: 'down', d: 2, k: 'ned', l: 'Ned', count: false }, { d: 0.8, k: 'pause', l: 'Klar', count: false }],
      still: 2.6, ghost: 'down', under: () => R.mat(20, 300, MAT + 4), back: () => stool(300, 400, top, 252)
    }));
  })();

  // Benspark bagud på alle fire (balde)
  (() => {
    const kick = { th: -92, kn: 88, pf: 0 };
    define('pt-firfod-benspark', Object.assign(L(), {
      vb: [0, 30, 440, 230],
      tempo: 'På alle fire med hænderne under skuldrene. Løft det ene ben bagud med bøjet knæ, så foden peger mod loftet (2 sek.). Ryggen er rolig og lige. Sænk igen (2 sek.). Skift ben efter sættet.',
      poses: { down: quad({ nod: 6 }), up: quad({ nod: 4, legF: kick }) }, start: 'down',
      seq: [{ to: 'up', d: 2, k: 'op', l: 'Benet op' }, { d: 0.8, k: 'hold', l: 'Klem', count: false }, { to: 'down', d: 2, k: 'ned', l: 'Ned', count: false }, { d: 0.5, k: 'pause', l: 'Klar', count: false }],
      still: 2.4, ghost: 'down', under: () => R.mat(20, 430, MAT + 4)
    }));
  })();

  /* ================= OVERKROP – SKUB ================= */
  // Langsomme (negative) armstrækninger: samme bevægelse som armstrækninger på tæerne, men 4–5 sek. ned
  copy('pt-armstraek-negativ', 'pt-armstraek', {
    tempo: 'På tæerne med hænderne under skuldrene og kroppen lige. Sænk dig så langsomt du kan, 4–5 sek., helt ned. Kom op igen på den måde, du kan – gerne via knæene.',
    seq: [{ to: 'down', d: 4.5, k: 'ned', l: 'Langsomt ned' }, { to: 'up', d: 1.5, k: 'op', l: 'Op', count: false }, { d: 1, k: 'pause', l: 'Klar', count: false }],
    still: 3
  });

  // Pike-armstrækninger (hoften højt – skuldrene arbejder)
  (() => {
    const A = [96, G - 14], HX = 316;
    const P = (hip, S) => fix({ hip, trunkTo: S, nod: 20, legF: { ank: add(A, [-3, 1]), fa: 40 }, legN: { ank: A, fa: 40 }, armF: { hand: [HX - 4, G - 5] }, armN: { hand: [HX, G - 5] } });
    define('pt-pike', Object.assign(L(), {
      vb: [10, 0, 430, 260],
      tempo: 'Start i en omvendt V: hænderne i gulvet, hoften højt og benene så strakte som muligt. Bøj albuerne, og sænk toppen af hovedet mod gulvet foran hænderne (2 sek.). Pres op igen (1 sek.).',
      poses: { up: P([212, 108], [296, 170]), down: P([222, 128], [316, 196]) }, start: 'up',
      seq: rep(2, 1), still: 1.9, ghost: 'up', under: mat
    }));
  })();

  // Armstrækninger med fødderne på en stol
  (() => {
    const top = 168, A = [64, top - 18], HX = 334;
    const P = (Sx, Sy) => straightBody(A, Sx, Sy, 60, { armF: { hand: [HX - 4, G - 5] }, armN: { hand: [HX, G - 5] } });
    define('pt-armstraek-fodder-hoej', Object.assign(L(), {
      vb: [0, 60, 440, 200],
      tempo: 'Fødderne på sædet af en stol, hænderne i gulvet under skuldrene og kroppen helt lige. Sænk brystet mod gulvet (2 sek.), og pres op igen (1 sek.).',
      poses: { up: P(322, 140), down: P(330, 196) }, start: 'up',
      seq: rep(2, 1), still: 1.9, ghost: 'up', under: () => R.mat(110, 430, G + 2), back: () => stool(14, 112, top, 252)
    }));
  })();

  // Planke op og ned: fra underarme til hænder og tilbage
  (() => {
    const A = [60, G - 40];
    const fore = (S, dx) => ({ el: [S[0] - 2 + dx, G - 6], hand: [S[0] + 48 + dx, G - 6] }), handUp = (S, dx) => ({ el: lerp([S[0] + 6 + dx, G - 5], S, 0.5), hand: [S[0] + 6 + dx, G - 5] });
    const low = straightBody(A, 300, G - 60, 55), lowS = Sof(low), high = straightBody(A, 312, G - 112, 55), highS = Sof(high);
    const lo = Object.assign({}, low, { armF: fore(lowS, -4), armN: fore(lowS, 0) });
    const mid = Object.assign({}, straightBody(A, 306, G - 86, 55)), midS = Sof(mid); mid.armN = handUp(midS, 0); mid.armF = fore(midS, -4);
    const hi = Object.assign({}, high, { armF: handUp(highS, -4), armN: handUp(highS, 0) });
    define('pt-planke-op-ned', Object.assign(L(), {
      vb: [10, 60, 430, 200],
      tempo: 'Start i planke på underarmene. Sæt den ene hånd i gulvet og så den anden, så du kommer op på hænderne (2 sek.). Gå ned på underarmene igen én arm ad gangen (2 sek.). Hoften er rolig.',
      poses: { lo, mid, hi }, start: 'lo',
      seq: [{ to: 'mid', d: 1, k: 'op', l: 'Hånd' }, { to: 'hi', d: 1, k: 'op', l: 'Hånd', count: false }, { to: 'mid', d: 1, k: 'ned', l: 'Albue', count: false }, { to: 'lo', d: 1, k: 'ned', l: 'Albue', count: false }, { d: 0.6, k: 'pause', l: 'Klar', count: false }],
      still: 2, ghost: 'lo', under: mat
    }));
  })();

  /* ================= RYG OG TRÆK (uden udstyr) ================= */
  // Roning under et bord: træk brystet op mod bordkanten
  (() => {
    const EDGE = [150, 112], heelY = G - 14;
    const P = (Sx, Sy) => { const ang = Math.asin((heelY - Sy) / 278), u = [Math.cos(ang), Math.sin(ang)], hip = add([Sx, Sy], mul(u, 100)), A = add([Sx, Sy], mul(u, 278));
      return { hip, trunkTo: [Sx, Sy], nod: 6, curve: 0, legF: { knee: add(lerp(hip, A, 0.5), [3, -2]), ank: add(A, [3, -1]), fa: -90 }, legN: { knee: lerp(hip, A, 0.5), ank: A, fa: -90 },
        armF: { hand: add(EDGE, [-4, 0]), el: [Sx + 30, Sy + 10] }, armN: { hand: EDGE, el: [Sx + 34, Sy + 12] } }; };
    const lowP = (() => { const p = P(144, 222); const S = Sof(p); p.armF.el = lerp(S, p.armF.hand, 0.52); p.armN.el = lerp(S, p.armN.hand, 0.52); return p; })();
    define('pt-bordroning', Object.assign(L(), {
      vb: [0, 60, 440, 200],
      tempo: 'Lig på ryggen under et solidt bord, og tag fat i bordkanten. Hælene i gulvet og kroppen lige. Træk brystet op mod bordkanten (2 sek.), og sænk roligt, til armene er strakte (2 sek.). Lettere: bøj knæene.',
      poses: { down: lowP, up: P(160, 150) }, start: 'down',
      seq: [{ to: 'up', d: 2, k: 'op', l: 'Træk op' }, { d: 0.6, k: 'hold', l: 'Klem', count: false }, { to: 'down', d: 2, k: 'ned', l: 'Ned', count: false }, { d: 0.6, k: 'pause', l: 'Klar', count: false }],
      still: 2.3, ghost: 'down', under: () => R.mat(110, 430, G + 2),
      back: () => '<rect x="-10" y="' + (EDGE[1] - 6) + '" width="' + (EDGE[0] + 18) + '" height="12" rx="3" fill="' + C.wood + '"/><rect x="6" y="' + (EDGE[1] + 6) + '" width="9" height="' + (252 - EDGE[1] - 6) + '" fill="' + C.woodDark + '"/>'
    }));
  })();

  // Roning med håndklæde om dørhåndtaget: læn dig tilbage, og træk dig ind mod døren
  (() => {
    const DOOR = 282, HANDLE = [DOOR - 6, 300], A = [204, ANK];
    const P = lean => { const r = rad(lean), hip = [A[0] - Math.sin(r) * 176, A[1] - Math.cos(r) * 176];
      const p = { hip, trunk: -lean, nod: lean * 0.6, legF: { ank: add(A, [-6, 0]) }, legN: { ank: A } }, Sh = Sof(p), d = sub(HANDLE, Sh), n = Math.hypot(d[0], d[1]);
      const hd = n > 104 ? add(Sh, mul(unit(d), 104)) : add(Sh, [Math.max(30, n - 50), 26]);
      p.armF = { hand: add(hd, [-3, 2]) }; p.armN = { hand: hd }; return fix(p); };
    const towel = (P, J) => '<path fill="none" stroke="' + C.towelDark + '" stroke-width="6" stroke-linecap="round" d="M' + P2(J.arms.N.hd) + ' L' + P2(HANDLE) + '"/><circle cx="' + HANDLE[0] + '" cy="' + HANDLE[1] + '" r="5" fill="#9aa3a8"/>';
    define('pt-haandklaede-roning', Object.assign(S(), {
      tempo: 'Læg et håndklæde om håndtaget på en lukket dør (der åbner væk fra dig), og hold i begge ender. Gå tæt på døren, og læn dig tilbage med strakte arme. Træk dig ind mod døren (2 sek.), og læn dig roligt tilbage (2 sek.).',
      poses: { out: P(20), in: P(6) }, start: 'out',
      seq: [{ to: 'in', d: 2, k: 'op', l: 'Træk' }, { d: 0.6, k: 'hold', l: 'Klem', count: false }, { to: 'out', d: 2, k: 'ned', l: 'Tilbage', count: false }, { d: 0.6, k: 'pause', l: 'Klar', count: false }],
      still: 2.3, ghost: 'out',
      back: () => '<rect x="' + DOOR + '" y="40" width="60" height="380" fill="#c9b293"/><rect x="' + DOOR + '" y="40" width="4" height="380" fill="#a88d6b"/>',
      over: towel
    }));
  })();

  // W-løft liggende på maven
  (() => {
    const arms = up => Sh => ({ armF: { el: [Sh[0] - 4, G - 12 - up * 0.7], hand: [Sh[0] + 40, G - 24 - up] }, armN: { el: [Sh[0], G - 11 - up * 0.7], hand: [Sh[0] + 44, G - 23 - up] } });
    define('pt-w-loeft', Object.assign(L(), {
      vb: [0, 110, 440, 160],
      tempo: 'Lig på maven med panden på et håndklæde. Bøj albuerne, så armene danner et W. Træk skulderbladene ned og sammen, og løft armene lidt fra gulvet (2 sek.). Hold 3 sek., og sænk (2 sek.).',
      poses: { down: prone(0, 0, arms(0)), up: prone(3, 0, arms(24)) }, start: 'down',
      seq: [{ to: 'up', d: 2, k: 'op', l: 'Løft' }, { d: 3, k: 'hold', l: 'Hold', count: false }, { to: 'down', d: 2, k: 'ned', l: 'Sænk', count: false }, { d: 1, k: 'pause', l: 'Hvil', count: false }],
      still: 3, ghost: 'down', under: mat, figOpt: headOver
    }));
  })();

  // Svømmer liggende på maven: armene fører fra Y frem til siden ned mod hofterne og tilbage
  (() => {
    const arm = (dx, dy) => Sh => ({ armF: { hand: [Sh[0] + dx - 4, G - 10 - dy], straight: 1 }, armN: { hand: [Sh[0] + dx, G - 9 - dy], straight: 1 } });
    const P = (dx, dy) => prone(3, 0, arm(dx, dy));
    define('pt-svoemmer', Object.assign(L(), {
      vb: [0, 110, 440, 160],
      tempo: 'Lig på maven med armene strakt frem, og løft dem lidt fra gulvet. Før armene i en stor bue ud til siden og ned mod hofterne (2 sek.), og tilbage frem igen (2 sek.). Brystet bliver let løftet, blikket ned.',
      poses: { front: P(104, 24), side: P(14, 30), back: P(-96, 22) }, start: 'front',
      seq: [{ to: 'side', d: 1, k: 'ned', l: 'Ud til siden', count: false }, { to: 'back', d: 1, k: 'ned', l: 'Ned til hofterne' }, { to: 'side', d: 1, k: 'op', l: 'Ud til siden', count: false }, { to: 'front', d: 1, k: 'op', l: 'Frem', count: false }, { d: 0.6, k: 'pause', l: 'Klar', count: false }],
      still: 2, ghost: 'front', under: mat, figOpt: headOver
    }));
  })();

  /* ================= CORE ================= */
  // Hul krop (hollow hold)
  (() => {
    const straight = (a, off) => { const d = [Math.cos(rad(a)), -Math.sin(rad(a))], h = add(SUP_HIP, off || [0, 0]); return { knee: add(h, mul(d, 88)), ank: add(h, mul(d, 178)), fa: -90 + a }; };
    const rest = fix(supine({}));
    const hold = Object.assign({}, rest, { trunkTo: [132, MAT - 40], nod: 22, curve: 4, legF: straight(16, [4, 0]), legN: straight(16), armF: { hand: [262, MAT - 72], el: [210, MAT - 56] }, armN: { hand: [268, MAT - 70], el: [216, MAT - 54] } });
    define('pt-hul-krop', Object.assign(L(), {
      vb: [0, 60, 440, 200],
      tempo: 'Lig på ryggen. Pres lænden ned i gulvet, løft hoved og skuldre lidt, og stræk benene skråt op med armene frem mod fødderne. Hold, og træk vejret roligt. Lettere: bøjede knæ.',
      poses: { rest, hold }, start: 'rest',
      seq: [{ to: 'hold', d: 2, k: 'op', l: 'Løft', count: false }, { d: 20, k: 'hold', l: 'Hold' }, { to: 'rest', d: 2, k: 'ned', l: 'Slap af', count: false }, { d: 3, k: 'pause', l: 'Hvil', count: false }],
      repLabel: 'Hold', still: 8, ghost: 'rest', under: () => R.mat(20, 425, MAT + 4)
    }));
  })();

  // Omvendt crunch: knæene rulles op mod brystet, så hoften løfter sig lidt
  (() => {
    const P = (hip, th, kn) => supine({ hip, trunkTo: SUP_SH, curve: 1.5, legF: { th: th - 2, kn, pf: 0 }, legN: { th, kn, pf: 0 } });
    define('pt-omvendt-crunch', Object.assign(L(), {
      vb: [20, 40, 400, 220],
      tempo: 'Lig på ryggen med knæene bøjet i vejret og armene langs siden. Rul knæene op mod brystet, så hoften løfter sig lidt fra gulvet (2 sek.). Sænk langsomt tilbage (3 sek.) uden at fødderne rører gulvet.',
      poses: { down: P(SUP_HIP, 180, 90), up: P([220, MAT - 30], 212, 104) }, start: 'down',
      seq: [{ to: 'up', d: 2, k: 'op', l: 'Rul op' }, { to: 'down', d: 3, k: 'ned', l: 'Langsomt ned', count: false }, { d: 0.6, k: 'pause', l: 'Klar', count: false }],
      still: 2, ghost: 'down', under: () => R.mat(40, 425, MAT + 4)
    }));
  })();

  // Planke med skulderklap
  (() => {
    const A = [60, G - 40], base = straightBody(A, 316, G - 112, 55), Sh = Sof(base);
    const down = (dx) => ({ hand: [Sh[0] + 6 + dx, G - 5], el: lerp([Sh[0] + 6 + dx, G - 5], Sh, 0.5) });
    const tap = { hand: add(Sh, [8, 14]), el: add(Sh, [26, 46]) };
    const m = Object.assign({}, base, { armF: down(-4), armN: down(0) });
    define('pt-skulderklap', Object.assign(L(), {
      vb: [10, 60, 430, 200],
      tempo: 'Planke på hænderne med fødderne lidt fra hinanden. Løft den ene hånd, og klap den modsatte skulder (1 sek.). Sæt hånden ned, og skift. Hoften må ikke vippe.',
      poses: { m, a: Object.assign({}, m, { armN: tap }), b: Object.assign({}, m, { armF: tap }) }, start: 'm',
      seq: [{ to: 'a', d: 0.8, k: 'op', l: 'Klap' }, { to: 'm', d: 0.8, k: 'ned', l: 'Ned', count: false }, { to: 'b', d: 0.8, k: 'op', l: 'Klap' }, { to: 'm', d: 0.8, k: 'ned', l: 'Ned', count: false }],
      still: 0.8, ghost: 'm', under: mat
    }));
  })();

  // Sideplanke på fødderne (set forfra, figuren ligger på højre side). Samme geometri som sideplanken på knæ, men lige ben
  (() => {
    const FEET = [380, MAT - 12], SH = MAT - 64, TH = 178;
    const rotP = (p, ang, c) => { const r = ang * Math.PI / 180, d = sub(p, c); return add(c, [d[0] * Math.cos(r) - d[1] * Math.sin(r), d[0] * Math.sin(r) + d[1] * Math.cos(r)]); };
    const D = Math.sqrt(278 * 278 - (FEET[1] - SH) ** 2), Sw0 = [FEET[0] - D, SH];
    const geo = P => {
      const aUp = Math.atan2(FEET[1] - SH, D) * 180 / Math.PI, a = 3 + (aUp - 3) * P.lift, ar = a * Math.PI / 180;
      const hipW = [FEET[0] - TH * Math.cos(ar), FEET[1] - TH * Math.sin(ar)], ang = a - 90;
      const v = sub(Sw0, hipW), beta = Math.atan2(v[0], -v[1]) * 180 / Math.PI, tilt = beta - ang;
      const toL = w => rotP(w, -ang, hipW);
      const kR = lerp(hipW, add(FEET, [0, 4]), 0.5), kL = lerp(hipW, add(FEET, [6, -8]), 0.5);
      const Q = { hip: hipW, tilt, legR: { knee: toL(kR), ank: toL(add(FEET, [0, 4])) }, legL: { knee: toL(kL), ank: toL(add(FEET, [6, -8])) }, armL: { hand: toL(add(hipW, [-6, -30])), side: 1, flat: 0.6 }, headTilt: 0 };
      const Jl = FF.frontJoints(Object.assign({}, Q, { armR: {} })), SR = rotP(Jl.arms.R.S, ang, hipW);
      Q.armR = { el: toL([SR[0] + 2, MAT - 8]), hand: toL([SR[0] + 30, MAT - 5]) };
      return { Q, ang, hipW };
    };
    define('pt-sideplanke', Object.assign({ W: 440, H: 270, floor: 252, view: 'custom' }, {
      vb: [0, 40, 440, 220],
      tempo: 'Lig på siden på underarmen med albuen lige under skulderen og benene strakte. Løft hoften, så du er lige fra fødder til skulder (2 sek.), og hold. Træk vejret roligt. Sænk, og skift side.',
      poses: { down: { lift: 0 }, up: { lift: 1 } }, start: 'down',
      seq: [{ to: 'up', d: 2, k: 'op', l: 'Løft hoften', count: false }, { d: 15, k: 'hold', l: 'Hold' }, { to: 'down', d: 2, k: 'ned', l: 'Sænk', count: false }, { d: 2, k: 'pause', l: 'Hvil', count: false }],
      repLabel: 'Hold', still: 6, ghost: 'down',
      draw: P => { const g = geo(P); return '<g transform="rotate(' + f1(g.ang) + ' ' + f1(g.hipW[0]) + ' ' + f1(g.hipW[1]) + ')">' + FF.frontFig(g.Q, {}).svg + '</g>'; },
      under: () => R.mat(20, 430, MAT + 4)
    }));
  })();

  // Planke på underarmene med skiftevis benløft
  (() => {
    const A = [60, G - 40], base = straightBody(A, 300, G - 60, 55), Sh = Sof(base);
    const arms = { armF: { el: [Sh[0] - 6, G - 6], hand: [Sh[0] + 44, G - 6] }, armN: { el: [Sh[0] - 2, G - 6], hand: [Sh[0] + 48, G - 6] } };
    const m = Object.assign({}, base, arms);
    const lift = k => { const g = m['leg' + k], d = sub(g.ank, m.hip), a = add(m.hip, rotV(d, 9)); return Object.assign({}, m, { ['leg' + k]: { knee: lerp(m.hip, a, 0.5), ank: a, fa: g.fa } }); };
    define('pt-planke-benloeft', Object.assign(L(), {
      vb: [10, 60, 430, 200],
      tempo: 'Planke på underarmene med kroppen lige. Løft det ene strakte ben lidt (2 sek.), hold 2 sek., og sæt ned. Skift ben. Hoften må ikke dreje eller falde.',
      poses: { m, a: lift('N'), b: lift('F') }, start: 'm',
      seq: [{ to: 'a', d: 1.5, k: 'op', l: 'Benet op' }, { d: 1.5, k: 'hold', l: 'Hold', count: false }, { to: 'm', d: 1.2, k: 'ned', l: 'Ned', count: false }, { to: 'b', d: 1.5, k: 'op', l: 'Benet op' }, { d: 1.5, k: 'hold', l: 'Hold', count: false }, { to: 'm', d: 1.2, k: 'ned', l: 'Ned', count: false }],
      still: 2, ghost: 'm', under: mat
    }));
  })();

  /* ================= KONDITION OG HOP ================= */
  // Burpee (uden armstrækning): ned i squat, fødderne bagud i planke, frem igen og hop
  (() => {
    const X = 290, HX = 352, AP = [96, 398];
    const stand = fix({ hip: [X, 229], trunk: 2, legF: { ank: [X - 4, ANK] }, legN: { ank: [X + 4, ANK] }, armF: { sa: 4, ef: 10 }, armN: { sa: 0, ef: 12 } });
    const squat = fix({ hip: [X - 34, 336], trunk: 56, nod: -20, legF: { ank: [X - 4, ANK] }, legN: { ank: [X + 4, ANK] }, armF: { hand: [HX - 4, 413] }, armN: { hand: [HX, 413] } });
    const plank = fix(straightBody(AP, HX - 6, 300, 52, { armF: { hand: [HX - 4, 413], straight: 1 }, armN: { hand: [HX, 413], straight: 1 } }));
    const jump = fix({ hip: [X, 196], trunk: 2, legF: { ank: [X - 6, 368], fa: 30 }, legN: { ank: [X + 2, 368], fa: 30 }, armF: { sa: 164, ef: 4 }, armN: { sa: 168, ef: 4 } });
    define('pt-burpee', Object.assign(S(440, 440), {
      tempo: 'Sæt dig ned i squat, og sæt hænderne i gulvet. Hop eller træd fødderne bagud til planke. Hop eller træd frem igen, rejs dig, og hop op med armene over hovedet. Land blødt. Lettere: træd i stedet for at hoppe.',
      poses: { stand, squat, plank, jump }, start: 'stand',
      seq: [{ to: 'squat', d: 0.8, k: 'ned', l: 'Ned' }, { to: 'plank', d: 0.6, k: 'ned', l: 'Bagud', count: false }, { d: 0.3, k: 'hold', l: 'Planke', count: false }, { to: 'squat', d: 0.6, k: 'op', l: 'Frem', count: false }, { to: 'jump', d: 0.5, k: 'op', l: 'Hop' }, { to: 'stand', d: 0.5, k: 'ned', l: 'Land blødt', count: false }, { d: 0.6, k: 'pause', l: 'Klar', count: false }],
      still: 1.6, ghost: 'stand', shots: [0.6, 1.6, 2.6]
    }));
  })();

  // Skøjtehop (forfra): hop til siden, land på ét ben, det andet krydser bagud
  (() => {
    const P = (hx, hy, aR, aL, side) => fixF({ hip: [hx, hy], tilt: side * 6, legR: { ank: aR }, legL: { ank: aL },
      armR: { hand: [hx - 40 + side * 50, hy + 20 - Math.abs(side) * 30] }, armL: { hand: [hx + 40 + side * 50, hy + 20 - Math.abs(side) * 30] } });
    define('pt-skoejtehop', Object.assign(FRONT(), {
      tempo: 'Hop til siden, og land blødt på ét ben med bøjet knæ, mens det andet ben krydser bagud. Hop tilbage til den anden side. Lettere: træd til siden i stedet for at hoppe.',
      poses: { r: P(108, 252, [98, ANK], [146, 380], 1), m: P(160, 206, [146, 380], [174, 380], 0), l: P(212, 252, [174, 380], [222, ANK], -1) }, start: 'r',
      seq: [{ to: 'm', d: 0.35, k: 'op', l: 'Hop', count: false }, { to: 'l', d: 0.35, k: 'ned', l: 'Land' }, { d: 0.35, k: 'hold', l: 'Stå', count: false }, { to: 'm', d: 0.35, k: 'op', l: 'Hop', count: false }, { to: 'r', d: 0.35, k: 'ned', l: 'Land' }, { d: 0.35, k: 'hold', l: 'Stå', count: false }],
      still: 0.7, ghost: 'm'
    }));
  })();

  // Hælspark på stedet (løb med hælene op mod numsen)
  (() => {
    const st = { th: 2, kn: 2, pf: 0 }, kick = { th: 8, kn: 128, pf: 10 };
    const P = (f, n, sw) => ({ hip: [152, 230], trunk: 4, legF: f, legN: n, armF: { sa: 34 * sw, ef: 84 }, armN: { sa: -34 * sw, ef: 84 } });
    define('pt-haelspark', Object.assign(S(), {
      tempo: 'Løb let på stedet, og spark skiftevis hælene op mod numsen. Land på forfoden, og sving armene med. Start roligt, og sæt farten op, når du er varm.',
      poses: { a: P(kick, st, -1), b: P(st, kick, 1), m: P(st, st, 0) }, start: 'm',
      seq: [{ to: 'a', d: 0.35, k: 'op', l: 'Hæl op', count: false }, { to: 'm', d: 0.3, k: 'ned', l: 'Skift', count: false }, { to: 'b', d: 0.35, k: 'op', l: 'Hæl op' }, { to: 'm', d: 0.3, k: 'ned', l: 'Skift', count: false }],
      still: 0.35, ghost: 'm'
    }));
  })();

  // Udfaldshop: skift ben i luften
  (() => {
    const lunge = front => fix({ hip: [176, 300], trunk: 4, ['leg' + front]: { ank: [252, ANK] }, ['leg' + (front === 'N' ? 'F' : 'N')]: { ank: [108, ANK - 12], fa: 50 }, armF: { sa: front === 'N' ? 30 : -30, ef: 70 }, armN: { sa: front === 'N' ? -30 : 30, ef: 70 } });
    const air = fix({ hip: [180, 210], trunk: 2, legF: { ank: [160, 372], fa: 30 }, legN: { ank: [196, 372], fa: 30 }, armF: { sa: 0, ef: 70 }, armN: { sa: 0, ef: 70 } });
    define('pt-udfaldshop', Object.assign(W2(), {
      tempo: 'Start i et udfald. Hop op, skift ben i luften, og land blødt i et udfald med det andet ben foran. Lettere: træd benene skiftevis bagud i stedet for at hoppe.',
      poses: { a: lunge('N'), air, b: lunge('F') }, start: 'a',
      seq: [{ to: 'air', d: 0.4, k: 'op', l: 'Hop', count: false }, { to: 'b', d: 0.4, k: 'ned', l: 'Land' }, { d: 0.6, k: 'hold', l: 'Stå', count: false }, { to: 'air', d: 0.4, k: 'op', l: 'Hop', count: false }, { to: 'a', d: 0.4, k: 'ned', l: 'Land' }, { d: 0.6, k: 'hold', l: 'Stå', count: false }],
      still: 0.8, ghost: 'air'
    }));
  })();

  /* ================= MOBILITET ================= */
  // Nedadgående hund: fra planke på hænderne til omvendt V
  (() => {
    const A = [96, G - 14], HX = 322;
    const plank = fix(straightBody([90, G - 40], HX - 6, G - 112, 55, { armF: { hand: [HX - 4, G - 5], straight: 1 }, armN: { hand: [HX, G - 5], straight: 1 } }));
    const dog = fix({ hip: [204, 102], trunk: Math.atan2(HX - 26 - 204, -(186 - 102)) * 180 / Math.PI, nod: 30, legF: { ank: add(A, [-3, 1]), fa: 14 }, legN: { ank: A, fa: 14 }, armF: { hand: [HX - 4, G - 5], straight: 1 }, armN: { hand: [HX, G - 5], straight: 1 } });
    define('pt-hund', Object.assign(L(), {
      vb: [10, 0, 430, 260],
      tempo: 'Start i planke på hænderne. Skub hoften op og bagud til en omvendt V, og pres hælene mod gulvet (2 sek.). Hold, og træk vejret roligt. Bøj gerne knæene lidt. Kom tilbage til planke (2 sek.).',
      poses: { plank, dog }, start: 'plank',
      seq: [{ to: 'dog', d: 2, k: 'op', l: 'Hoften op', count: false }, { d: 15, k: 'hold', l: 'Hold' }, { to: 'plank', d: 2, k: 'ned', l: 'Tilbage', count: false }, { d: 1.5, k: 'pause', l: 'Hvil', count: false }],
      repLabel: 'Hold', still: 6, ghost: 'plank', under: mat
    }));
  })();

  // Verdens bedste stræk: dybt udfald, hænderne i gulvet, den ene arm drejes op mod loftet
  (() => {
    const FA = [262, ANK], BA = [66, ANK - 12];
    const base = (handF) => { const p = { hip: [172, 334], trunk: 66, nod: -20, legN: { ank: FA }, legF: { ank: BA, fa: 54 } }, Sh = Sof(p);
      p.armN = { hand: [236, 413] }; p.armF = handF(Sh); return fix(p); };
    const down = base(() => ({ hand: [228, 413] })), up = base(Sh => ({ hand: add(Sh, [8, -112]), straight: 1 }));
    define('pt-verdens-bedste', Object.assign(W2(), {
      tempo: 'Tag et langt udfald frem, og sæt begge hænder i gulvet på indersiden af forreste fod. Drej overkroppen, og løft den ene arm op mod loftet med blikket efter hånden (2 sek.). Hold 2 sek., og sæt hånden ned igen (2 sek.).',
      poses: { down, up }, start: 'down',
      seq: [{ to: 'up', d: 2, k: 'op', l: 'Armen op' }, { d: 2, k: 'hold', l: 'Hold', count: false }, { to: 'down', d: 2, k: 'ned', l: 'Ned', count: false }, { d: 1, k: 'pause', l: 'Pust ud', count: false }],
      still: 3, ghost: 'down'
    }));
  })();

  // Baglårsstræk med hælen på en stol
  (() => {
    const seat = 324, A = [294, seat - 16];
    const P = (trunk, hip, hand) => fix({ hip, trunk, nod: -trunk * 0.5, legF: { ank: A, fa: -34 }, legN: { ank: [134, ANK] }, armF: { hand: add(hand, [-4, 2]) }, armN: { hand } });
    define('pt-baglaar-straek-stol', Object.assign(S(380, 440), {
      tempo: 'Stil hælen op på en lav stol med strakt knæ. Hold ryggen ret, og bøj frem i hoften, til du mærker et stræk bag på låret (2 sek.). Hold 30 sek., og skift ben.',
      poses: { up: P(2, [138, 224], [196, 300]), lean: P(34, [130, 230], [226, 300]) }, start: 'up',
      seq: [{ to: 'lean', d: 2.5, k: 'ned', l: 'Bøj frem', count: false }, { d: 20, k: 'hold', l: 'Hold' }, { to: 'up', d: 2, k: 'op', l: 'Op', count: false }, { d: 2, k: 'pause', l: 'Pause', count: false }],
      repLabel: 'Stræk', still: 8, ghost: 'up',
      back: () => stool(262, 352, seat, FLOOR)
    }));
  })();

  // Dyb squat (hold) – albuerne presser knæene let ud
  (() => {
    const stand = fix({ hip: [150, 229], trunk: 2, legF: { ank: [146, ANK] }, legN: { ank: [154, ANK] }, armF: { sa: 4, ef: 8 }, armN: { sa: 0, ef: 10 } });
    const deep = fix({ hip: [104, 356], trunk: 34, nod: -14, legF: { ank: [146, ANK] }, legN: { ank: [154, ANK] }, armF: { hand: [196, 312] }, armN: { hand: [200, 314] } });
    define('pt-dyb-squat', Object.assign(S(), {
      tempo: 'Stå med fødderne lidt bredere end hofterne. Sæt dig helt ned i en dyb squat med hælene i gulvet, og hold hænderne samlet foran brystet, mens albuerne skubber knæene let ud. Hold, og træk vejret roligt. Rejs dig roligt.',
      poses: { stand, deep }, start: 'stand',
      seq: [{ to: 'deep', d: 3, k: 'ned', l: 'Ned', count: false }, { d: 20, k: 'hold', l: 'Hold' }, { to: 'stand', d: 2.5, k: 'op', l: 'Op', count: false }, { d: 2, k: 'pause', l: 'Pause', count: false }],
      repLabel: 'Hold', still: 10, ghost: 'stand'
    }));
  })();

  // Brystsræk i døråbningen: underarmen mod dørkarmen, tag et lille skridt frem
  (() => {
    const POST = 124, HAND = [POST + 2, 86], EL = [POST + 6, 138];
    const P = (hip, trunk, fn) => fix({ hip, trunk, nod: -2, legF: { ank: [150, ANK] }, legN: { ank: [fn, ANK] }, armN: { el: EL, hand: HAND }, armF: { sa: 4, ef: 10 } });
    define('pt-bryst-doer', Object.assign(S(), {
      tempo: 'Stå i en døråbning, og læg underarmen mod dørkarmen med albuen i skulderhøjde. Tag et lille skridt frem, til du mærker et stræk foran i brystet og skulderen (2 sek.). Hold 30 sek., og skift side.',
      poses: { a: P([150, 229], 0, 156), b: P([170, 232], 6, 206) }, start: 'a',
      seq: [{ to: 'b', d: 2.5, k: 'op', l: 'Skridt frem', count: false }, { d: 20, k: 'hold', l: 'Hold' }, { to: 'a', d: 2, k: 'ned', l: 'Tilbage', count: false }, { d: 2, k: 'pause', l: 'Pause', count: false }],
      repLabel: 'Stræk', still: 8, ghost: 'a',
      back: () => '<rect x="' + (POST - 14) + '" y="20" width="16" height="400" fill="#c9b293"/><rect x="' + (POST - 14) + '" y="20" width="3" height="400" fill="#a88d6b"/>'
    }));
  })();
})();
