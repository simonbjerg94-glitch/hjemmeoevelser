/* Tempo-film til PT-programmet (kropsvægt, uden udstyr). Bruger FigFilm fra film-engine.js.
   Figuren ses fra siden med hovedet mod højre. Fase-teksterne bruges også af stemmen. */
'use strict';
(() => {
  const FF = typeof FigFilm !== 'undefined' ? FigFilm : require('./film-engine.js');
  const { R, C, add, sub, mul, lerp, define } = FF;
  const G = 250;                                   // gulvet (måttens overflade)
  const L = () => ({ W: 440, H: 270, floor: 252, view: 'side' });
  const rad = d => d * Math.PI / 180;
  const along = (p, b, d) => add(p, [Math.cos(rad(b)) * d, -Math.sin(rad(b)) * d]); // b = kroppens vinkel over vandret
  const mat = () => R.mat(20, 430, G + 2);
  // Lige krop fra en støtte (tæer eller knæ). base = ankel (tæer) eller knæ; legLen = afstand fra base til hofte.
  function body(base, b, legLen, knee, ank, fa, arms) {
    const hip = along(base, b, legLen);
    const P = { hip, trunk: 90 - b, nod: -4, curve: 0,
      legF: { knee: add(knee || lerp(hip, base, 88 / 178), [-3, 2]), ank: add(ank || base, [-3, 1]), fa },
      legN: { knee: knee || lerp(hip, base, 88 / 178), ank: ank || base, fa } };
    const S = FF.sideJoints(Object.assign({}, P, { armF: {}, armN: {} })).S;
    Object.assign(P, arms(S));
    return P;
  }
  const handsAt = x => () => ({ armF: { hand: [x - 4, G - 5] }, armN: { hand: [x, G - 5] } }); // albuerne bøjer bagud mod fødderne

  // Armstrækninger på knæene
  (() => {
    const K = [150, G - 9], A = [64, G - 16], HX = 324;
    const P = b => body(K, b, 88, K, A, 186, handsAt(HX));
    define('pt-armstraek-knae', Object.assign(L(), {
      vb: [20, 60, 420, 200],
      tempo: 'Knæene i gulvet, hænderne lidt bredere end skuldrene. Lige linje fra knæ til hoved. Sænk brystet mod gulvet (2 sek.), og pres op igen (1 sek.).',
      poses: { up: P(34), down: P(24) }, start: 'up',
      seq: [{ to: 'down', d: 2, k: 'ned', l: 'Ned' }, { to: 'up', d: 1, k: 'op', l: 'Pres op' }, { d: 0.8, k: 'pause', l: 'Klar', count: false }],
      still: 1.9, ghost: 'up', under: mat
    }));
  })();

  // Armstrækninger på tæerne
  (() => {
    const A = [60, G - 40], HX = 322;
    const P = b => body(A, b, 178, null, null, 55, handsAt(HX));
    define('pt-armstraek', Object.assign(L(), {
      vb: [10, 60, 430, 200],
      tempo: 'På tæerne med hænderne under skuldrene. Hele kroppen er lige som en planke. Sænk brystet næsten til gulvet (2 sek.), og pres op igen (1 sek.).',
      poses: { up: P(15), down: P(9.5) }, start: 'up',
      seq: [{ to: 'down', d: 2, k: 'ned', l: 'Ned' }, { to: 'up', d: 1, k: 'op', l: 'Pres op' }, { d: 0.8, k: 'pause', l: 'Klar', count: false }],
      still: 1.9, ghost: 'up', under: mat
    }));
  })();

  // Planke på underarmene (hold)
  (() => {
    const A = [60, G - 40];
    const arms = S => ({ armF: { el: [S[0] - 4, G - 6], hand: [S[0] + 46, G - 6] }, armN: { el: [S[0], G - 6], hand: [S[0] + 50, G - 6] } });
    const P = (b, sag) => { const p = body(A, b, 178, null, null, 55, arms); p.curve = sag || 0; return p; };
    // nede: knæene i gulvet og hoften lav
    const down = (() => { const K = [150, G - 9], Ak = [64, G - 16]; return body(K, 16, 88, K, Ak, 186, arms); })();
    define('pt-planke', Object.assign(L(), {
      vb: [10, 80, 430, 180],
      tempo: 'Underarmene i gulvet med albuerne under skuldrene. Løft hoften, så kroppen er lige fra hæle til hoved. Spænd i maven og ballerne, og træk vejret roligt. Sænk knæene, når tiden er gået.',
      poses: { down, up: P(5.5) }, start: 'down',
      seq: [{ to: 'up', d: 2, k: 'op', l: 'Løft hoften', count: false }, { d: 20, k: 'hold', l: 'Hold' }, { to: 'down', d: 2, k: 'ned', l: 'Sænk', count: false }, { d: 3, k: 'pause', l: 'Hvil', count: false }],
      repLabel: 'Planke', still: 8, ghost: 'down', under: mat
    }));
  })();
})();

/* ================= v33: flere PT-øvelser (kropsvægt) + nye genoptræningsfilm ================= */
(() => {
  const FF = typeof FigFilm !== 'undefined' ? FigFilm : require('./film-engine.js');
  const { R, C, add, sub, mul, lerp, define } = FF;
  const FLOOR = 420, ANK = 404;
  const S = (W, H) => ({ W: W || 320, H: H || 440, floor: FLOOR, view: 'side' });
  const W2 = () => ({ W: 400, H: 440, floor: FLOOR, view: 'side' });
  const rep = (dn, up, l1, l2, extra) => [{ to: 'down', d: dn, k: 'ned', l: l1 || 'Ned' }, { to: 'up', d: up, k: 'op', l: l2 || 'Op' }].concat(extra || [{ d: 0.6, k: 'pause', l: 'Klar', count: false }]);
  const armsFwd = (a, e) => ({ armF: { sa: a, ef: e || 0 }, armN: { sa: a - 4, ef: e || 0 } });
  const chairR = (x0, x1, seat) => R.chairSide(x0, x1, seat, FLOOR);

  // Squat (kropsvægt, armene frem som modvægt)
  (() => {
    const P = (hip, trunk, a) => Object.assign({ hip, trunk, nod: -trunk * 0.4, legF: { ank: [146, ANK] }, legN: { ank: [154, ANK] } }, armsFwd(a, 4));
    define('pt-squat', Object.assign(S(), {
      tempo: 'Fødderne lidt bredere end hofterne. Sæt dig ned og bagud, som mod en lav stol (2–3 sek.), så dybt du kan med ret ryg og hælene i gulvet. Pres op igen (1–2 sek.).',
      poses: { up: P([150, 229], 2, 10), down: P([92, 318], 40, 84) }, start: 'up',
      seq: rep(2.5, 1.5), still: 2.4, ghost: 'up'
    }));
  })();

  // Bulgarsk split squat: bagerste fod på en stol
  (() => {
    const seat = 330, back = { ank: [80, seat - 14], fa: 196 };
    const P = (hip, trunk) => ({ hip, trunk, nod: -trunk * 0.3, legF: Object.assign({}, back), legN: { ank: [200, ANK] }, armF: { sa: 4, ef: 70 }, armN: { sa: 0, ef: 74 } });
    define('pt-split-squat', Object.assign(W2(), {
      tempo: 'Bagerste fod på en stol, forreste fod et godt skridt frem. Sænk dig lodret ned, til det bagerste knæ næsten rører gulvet (2–3 sek.), og pres op gennem forreste hæl (1–2 sek.).',
      poses: { up: P([150, 240], 6), down: P([140, 304], 12) }, start: 'up',
      seq: rep(2.5, 1.5), still: 2.4, ghost: 'up',
      back: () => chairR(10, 96, seat)
    }));
  })();

  // Vægsiddende (isometrisk). Bruges i PT, knæ og senesmerter.
  (() => {
    const WALL = 56;
    const P = (hip, ank) => ({ hip, trunk: 0, nod: 0, legF: { ank: add(ank, [-6, 0]) }, legN: { ank }, armF: { sa: 4, ef: 8 }, armN: { sa: 0, ef: 10 } });
    define('pt-vaegsid', Object.assign(S(), {
      vb: [0, 60, 320, 380],
      tempo: 'Ryggen mod væggen, fødderne et godt stykke frem. Glid ned, til knæene er bøjet ca. 90° (eller så langt, det er rart), og hold stille. Træk vejret roligt. Glid op igen.',
      poses: { up: P([WALL + 26, 229], [170, ANK]), down: P([WALL + 26, 312], [176, ANK]) }, start: 'up',
      seq: [{ to: 'down', d: 2.5, k: 'ned', l: 'Glid ned', count: false }, { d: 30, k: 'hold', l: 'Hold' }, { to: 'up', d: 2, k: 'op', l: 'Op', count: false }, { d: 3, k: 'pause', l: 'Pause', count: false }],
      repLabel: 'Hold', still: 10, ghost: 'up',
      back: () => R.wall(0, WALL, 0, FLOOR)
    }));
  })();

  // Dødløft på ét ben (uden vægt)
  (() => {
    const P = (hip, trunk, th) => ({ hip, trunk, nod: -trunk * 0.5, legN: { ank: [164, ANK] }, legF: { th, kn: 4, pf: 10 }, armF: { sa: 2, ef: 2 }, armN: { sa: -2, ef: 2 } });
    define('pt-etben-doedloeft', Object.assign(W2(), {
      tempo: 'Stå på ét ben med let bøjet knæ. Bøj frem i hoften med ret ryg, mens det andet ben går lige bagud (2–3 sek.), til kroppen er næsten vandret. Rejs dig igen (2 sek.).',
      poses: { up: P([166, 229], 2, -2), down: P([152, 236], 68, -64) }, start: 'up',
      seq: rep(2.5, 2), still: 2.4, ghost: 'up'
    }));
  })();

  // Squat-hop med blød landing
  (() => {
    const P = (hip, trunk, ay, fa, a) => Object.assign({ hip, trunk, nod: -trunk * 0.4, legF: { ank: [146, ay], fa }, legN: { ank: [154, ay], fa } }, armsFwd(a, 6));
    define('pt-squat-hop', Object.assign(S(), {
      tempo: 'Lav en halv squat, og hop lige op. Land blødt på forfoden med bøjede knæ, der peger frem over tæerne. Stå stille et øjeblik, før næste hop.',
      poses: { up: P([150, 229], 2, ANK, 0, 6), down: P([112, 290], 30, ANK, 0, 60), air: P([150, 186], 2, ANK - 42, 26, -20) }, start: 'up',
      seq: [{ to: 'down', d: 0.9, k: 'ned', l: 'Ned', count: false }, { to: 'air', d: 0.35, k: 'op', l: 'Hop' }, { to: 'down', d: 0.45, k: 'ned', l: 'Land blødt', count: false }, { d: 0.7, k: 'hold', l: 'Stå stille', count: false }, { to: 'up', d: 0.8, k: 'op', l: 'Op', count: false }, { d: 0.6, k: 'pause', l: 'Klar', count: false }],
      still: 1.2, ghost: 'up'
    }));
  })();

  // Høje knæløft på stedet
  (() => {
    const st = { th: 1, kn: 1, pf: 0 }, lift = { th: 84, kn: 98, pf: 0 };
    const P = (f, n, sw) => ({ hip: [152, 230], trunk: 2, legF: f, legN: n, armF: { sa: 36 * sw, ef: 80 }, armN: { sa: -36 * sw, ef: 80 } });
    define('pt-knaeloeft', Object.assign(S(), {
      tempo: 'Løft knæene skiftevis op til hoftehøjde, og sving armene med. Start i gå-tempo, og sæt farten op, når du er varm. Rank ryg.',
      poses: { a: P(lift, st, -1), b: P(st, lift, 1), m: P(st, st, 0) }, start: 'm',
      seq: [{ to: 'a', d: 0.5, k: 'op', l: 'Op', count: false }, { to: 'm', d: 0.4, k: 'ned', l: 'Skift', count: false }, { to: 'b', d: 0.5, k: 'op', l: 'Op' }, { to: 'm', d: 0.4, k: 'ned', l: 'Skift', count: false }],
      still: 0.5, ghost: 'm'
    }));
  })();

  // Dips på en stol
  (() => {
    const seat = 322, HX = 104;
    const P = (hip, ank) => ({ hip, trunk: -4, nod: 4, legF: { ank: add(ank, [-6, 0]) }, legN: { ank }, armF: { hand: [HX - 4, seat - 2] }, armN: { hand: [HX, seat - 2] } });
    define('pt-dips', Object.assign(S(), {
      tempo: 'Hænderne på kanten af en stabil stol, fødderne fremme. Bøj albuerne bagud, og sænk hoften (2 sek.), til overarmene er næsten vandrette. Pres op igen (1 sek.). Hold skuldrene nede.',
      poses: { up: P([HX + 22, seat - 18], [250, ANK]), down: P([HX + 26, seat + 32], [252, ANK]) }, start: 'up',
      seq: rep(2, 1), still: 1.9, ghost: 'up',
      back: () => chairR(20, HX + 4, seat)
    }));
  })();

  // Armstrækninger med hænderne på en stol (skrå)
  (() => {
    const seat = 300, HX = 270, A = [44, FLOOR - 40];
    const P = b => { const r = b * Math.PI / 180, d = [Math.cos(r), -Math.sin(r)], hip = add(A, mul(d, 178));
      return { hip, trunk: 90 - b, nod: -4, legF: { knee: add(lerp(hip, A, 88 / 178), [-3, 2]), ank: add(A, [-3, 1]), fa: 55 }, legN: { knee: lerp(hip, A, 88 / 178), ank: A, fa: 55 },
        armF: { hand: [HX - 4, seat - 4] }, armN: { hand: [HX, seat - 4] } }; };
    define('pt-armstraek-hoej', Object.assign(W2(), {
      vb: [0, 120, 400, 320],
      tempo: 'Hænderne på kanten af en stabil stol (eller bordet), kroppen lige fra hæle til hoved. Sænk brystet mod kanten (2 sek.), og pres op igen (1 sek.).',
      poses: { up: P(41), down: P(30) }, start: 'up',
      seq: rep(2, 1), still: 1.9, ghost: 'up',
      back: () => '<rect x="' + (HX - 10) + '" y="' + (seat - 4) + '" width="86" height="10" rx="3" fill="' + C.wood + '"/><rect x="' + (HX - 6) + '" y="' + seat + '" width="7" height="' + (FLOOR - seat) + '" fill="' + C.woodDark + '"/><rect x="' + (HX + 64) + '" y="' + seat + '" width="7" height="' + (FLOOR - seat) + '" fill="' + C.woodDark + '"/>'
    }));
  })();

  // Hoftebøjerstræk på knæ
  (() => {
    const K = [104, FLOOR - 9], A = [24, FLOOR - 16];
    const P = (hip, trunk) => ({ hip, trunk, nod: 0, legF: { knee: K, ank: A, fa: 186 }, legN: { ank: [238, ANK] }, armF: { hand: [216, 300] }, armN: { hand: [222, 302] } });
    define('pt-hoftebojer', Object.assign(W2(), {
      vb: [0, 120, 400, 320],
      tempo: 'Sæt det ene knæ i gulvet (læg en pude under), den anden fod fremme. Spænd ballen på det bagerste ben, og skub hoften lidt frem, til du mærker strækket foran på låret. Hold 30 sek., og skift side.',
      poses: { a: P([112, 330], 0), b: P([138, 334], -4) }, start: 'a',
      seq: [{ to: 'b', d: 2.5, k: 'op', l: 'Hoften frem', count: false }, { d: 20, k: 'hold', l: 'Hold' }, { to: 'a', d: 2, k: 'ned', l: 'Slip', count: false }, { d: 2, k: 'pause', l: 'Pause', count: false }],
      repLabel: 'Stræk', still: 8, ghost: 'a',
      under: () => '<ellipse cx="' + K[0] + '" cy="' + (FLOOR - 2) + '" rx="26" ry="7" fill="' + C.towel + '"/>'
    }));
  })();

  // Excentrisk hælsænk på trappe (Alfredson): op på to ben, ned på ét
  (() => {
    const T = FLOOR - 44, bx = 224, WALL = 296, rot = FF.rot; // forfoden på trinnets kant (bx), hælen hænger frit ud over kanten
    const ankAt = (x, fa) => sub([x, T], rot([24, 16], fa));
    const P = (fa, lift) => { const a = ankAt(bx, fa), b = ankAt(bx - 6, lift ? 10 : fa);
      return { hip: [a[0] - 2, a[1] - 176], trunk: 3, legN: { ank: a, fa }, legF: lift ? { th: 14, kn: 70, pf: 10 } : { ank: b, fa }, armF: { hand: [WALL - 6, 196] }, armN: { hand: [WALL - 4, 200] } }; };
    define('ankel-3-alfredson', Object.assign(S(), {
      tempo: 'Stå med forfoden på kanten af et trin og en hånd på væggen. Gå op på tæerne på begge ben (1 sek.). Løft det raske ben, og sænk langsomt hælen under trinnet på det onde ben (3 sek.). Sæt den raske fod ned igen.',
      poses: { down: P(-18, true), up: P(26, false), top1: P(26, true) }, start: 'up',
      seq: [{ to: 'top1', d: 0.8, k: 'hold', l: 'Løft det raske ben', count: false }, { to: 'down', d: 3, k: 'ned', l: 'Langsomt ned' }, { to: 'up', d: 1.2, k: 'op', l: 'Op på begge', count: false }, { d: 0.6, k: 'pause', l: 'Klar', count: false }],
      still: 2.6, ghost: 'up', shots: [0.4, 2.6, 4.4],
      back: () => R.wall(WALL, 320, 0, FLOOR),
      under: () => R.stepSide(bx - 8, WALL, T, FLOOR),
      figOpt: () => ({ tenseCalf: 'N' }),
      over: (P, J) => { const a = J.legs.N.ank, y = a[1] + 30; return R.arrow([a[0] - 22, y - 26], [a[0] - 22, y + 4], C.accent); }
    }));
  })();
})();

/* ---- v33 batch 2: på gulvet + forfra ---- */
(() => {
  const FF = typeof FigFilm !== 'undefined' ? FigFilm : require('./film-engine.js');
  const { R, C, add, sub, mul, lerp, define } = FF;
  const G = 250, FLOOR = 420, ANK = 404;
  const L = () => ({ W: 440, H: 270, floor: 252, view: 'side' });
  const mat = () => R.mat(10, 430, G + 2);
  const rad = d => d * Math.PI / 180;
  // Liggende på maven (hovedet til højre). lift = brystets løft i grader, legUp = fødderne løftet (px)
  const PH = [196, G - 15];
  const prone = (lift, legUp, arms) => { const P = { hip: PH, trunk: 90 - (lift || 0), nod: -12 - (lift || 0) * 0.3, chin: 7, curve: 0,
      legF: { knee: [106, G - 13 - (legUp || 0) * 0.4], ank: [20, G - 13 - (legUp || 0)], fa: 80 }, legN: { knee: [110, G - 12 - (legUp || 0) * 0.4], ank: [24, G - 12 - (legUp || 0)], fa: 80 } };
    const Sh = FF.sideJoints(Object.assign({}, P, { armF: {}, armN: {} })).S; return Object.assign(P, arms(Sh)); };
  // Hovedet tegnes oven på den nærmeste arm, så det kan ses (ellers dækker armen det helt)
  const headOver = () => ({ front: J => '<g transform="translate(' + FF.P2(J.head) + ') rotate(' + FF.f1(J.headA) + ')">' + FF.headSide() + '</g>' });

  // Rygløft liggende (superman, let)
  (() => {
    const arms = up => Sh => ({ armF: { hand: [Sh[0] + 104, G - 8 - up], straight: 1 }, armN: { hand: [Sh[0] + 108, G - 7 - up], straight: 1 } });
    define('pt-rygloeft', Object.assign(L(), {
      vb: [0, 110, 440, 160],
      tempo: 'Lig på maven med armene strakt frem. Løft arme, bryst og ben et par centimeter fra gulvet (2 sek.), hold 2 sek. med blikket ned, og sænk roligt (2 sek.).',
      poses: { down: prone(0, 0, arms(0)), up: prone(12, 14, arms(30)) }, start: 'down',
      seq: [{ to: 'up', d: 2, k: 'op', l: 'Løft' }, { d: 2, k: 'hold', l: 'Hold', count: false }, { to: 'down', d: 2, k: 'ned', l: 'Sænk', count: false }, { d: 1, k: 'pause', l: 'Hvil', count: false }],
      still: 3, ghost: 'down', under: mat, figOpt: headOver
    }));
  })();

  // Y-løft liggende på maven (armene i et Y, tommelfingrene op)
  (() => {
    const arms = up => Sh => ({ armF: { hand: [Sh[0] + 100, G - 10 - up], straight: 1 }, armN: { hand: [Sh[0] + 104, G - 9 - up], straight: 1 } });
    define('pt-ytl', Object.assign(L(), {
      vb: [0, 110, 440, 160],
      tempo: 'Lig på maven med panden på et håndklæde og armene skråt frem i et Y, tommelfingrene op. Træk skulderbladene ned og sammen, og løft armene lidt (2 sek.). Hold 3 sek., og sænk (2 sek.).',
      poses: { down: prone(0, 0, arms(0)), up: prone(2, 0, arms(26)) }, start: 'down',
      seq: [{ to: 'up', d: 2, k: 'op', l: 'Løft armene' }, { d: 3, k: 'hold', l: 'Hold', count: false }, { to: 'down', d: 2, k: 'ned', l: 'Sænk', count: false }, { d: 1, k: 'pause', l: 'Hvil', count: false }],
      still: 3, ghost: 'down', under: mat, figOpt: headOver
    }));
  })();

  // Armpres på maven (McKenzie): hoften bliver i gulvet, armene presser brystet op
  (() => {
    let hand, handF;
    const down = prone(0, 0, Sh => { handF = [Sh[0] + 14, G - 6]; hand = [Sh[0] + 18, G - 5]; return { armF: { hand: handF, el: [Sh[0] - 12, Sh[1] - 40] }, armN: { hand, el: [Sh[0] - 8, Sh[1] - 42] } }; });
    const up = prone(30, 0, Sh => ({ armF: { hand: handF, el: add(lerp(Sh, handF, 0.52), [-4, 0]) }, armN: { hand, el: add(lerp(Sh, hand, 0.52), [-4, 0]) } }));
    up.curve = -6;
    define('laend-h-armpres', Object.assign(L(), {
      vb: [0, 80, 440, 190],
      tempo: 'Lig på maven med hænderne under skuldrene. Pres overkroppen op med armene, mens hoften og lænden bliver helt afslappede i gulvet (2 sek.). Hold 1–2 sek. i toppen, og sænk roligt (2 sek.). Gå kun så højt, det føles rart.',
      poses: { down, up }, start: 'down',
      seq: [{ to: 'up', d: 2, k: 'op', l: 'Pres op' }, { d: 1.5, k: 'hold', l: 'Hold', count: false }, { to: 'down', d: 2, k: 'ned', l: 'Sænk', count: false }, { d: 1, k: 'pause', l: 'Slap af', count: false }],
      still: 2.6, ghost: 'down', under: mat
    }));
  })();

  // Bjergbestiger (langsom): fra planke på hænderne, skiftevis knæ frem mod brystet
  (() => {
    const A = [60, G - 40], HX = 322, b = 15;
    const base = () => { const hip = add(A, [Math.cos(rad(b)) * 178, -Math.sin(rad(b)) * 178]);
      return { hip, trunk: 90 - b, nod: -4, legF: { knee: lerp(hip, add(A, [-3, 1]), 0.5), ank: add(A, [-3, 1]), fa: 55 }, legN: { knee: lerp(hip, A, 0.5), ank: A, fa: 55 },
        armF: { hand: [HX - 4, G - 5], straight: 1 }, armN: { hand: [HX, G - 5], straight: 1 } }; };
    const drive = k => { const P = base(); P.hip = add(P.hip, [0, -6]); P[k] = { knee: add(P.hip, [62, 36]), ank: add(P.hip, [-2, 64]), fa: 70 }; return P; };
    define('pt-bjergbestiger', Object.assign(L(), {
      vb: [10, 60, 430, 200],
      tempo: 'Start i planke på hænderne med skuldrene over hænderne. Træk skiftevis det ene knæ frem mod brystet og tilbage igen. Hoften er lav og rolig. Start langsomt, og sæt tempoet op, når teknikken sidder.',
      poses: { m: base(), a: drive('legN'), b: drive('legF') }, start: 'm',
      seq: [{ to: 'a', d: 0.7, k: 'op', l: 'Knæ frem' }, { to: 'm', d: 0.6, k: 'ned', l: 'Tilbage', count: false }, { to: 'b', d: 0.7, k: 'op', l: 'Knæ frem' }, { to: 'm', d: 0.6, k: 'ned', l: 'Tilbage', count: false }],
      still: 0.7, ghost: 'm', under: mat
    }));
  })();

  // Nordic hamstring: på knæ med fødderne fastholdt under sofaen, fald langsomt frem
  (() => {
    const K = [150, G - 9], A = [66, G - 16];
    const P = (b, arms) => { const r = rad(b), hip = add(K, [Math.cos(r) * 88, -Math.sin(r) * 88]);
      return Object.assign({ hip, trunk: 90 - b, nod: -(90 - b) * 0.3, legF: { knee: add(K, [-3, 1]), ank: add(A, [-3, 1]), fa: 186 }, legN: { knee: K, ank: A, fa: 186 } }, arms); };
    const ready = { armF: { sa: 30, ef: 100, rel: 1 }, armN: { sa: 26, ef: 104, rel: 1 } }, catchA = { armF: { sa: 8, ef: 4, rel: 1 }, armN: { sa: 4, ef: 4, rel: 1 } };
    define('pt-nordic', Object.assign(L(), {
      vb: [10, 20, 430, 240],
      tempo: 'Sæt dig på knæ med en pude under, og få hælene holdt fast (fx under sofaen). Lige linje fra knæ til hoved. Fald langsomt frem, og brems med baglårene så længe, du kan (3–5 sek.). Tag fra med hænderne, og skub dig op igen.',
      poses: { up: P(86, ready), low: P(40, ready), down: P(22, catchA) }, start: 'up',
      seq: [{ to: 'low', d: 4, k: 'ned', l: 'Langsomt frem' }, { to: 'down', d: 0.8, k: 'ned', l: 'Tag fra', count: false }, { to: 'up', d: 2, k: 'op', l: 'Skub op', count: false }, { d: 1.5, k: 'pause', l: 'Hvil', count: false }],
      still: 2.8, ghost: 'up',
      under: () => mat() + '<ellipse cx="' + K[0] + '" cy="' + (G - 2) + '" rx="28" ry="7" fill="' + C.towel + '"/>',
      back: () => '<rect x="-10" y="' + (G - 58) + '" width="96" height="40" rx="10" fill="#8f9fb3"/><rect x="-10" y="' + (G - 96) + '" width="40" height="80" rx="10" fill="#7d8ea3"/><rect x="74" y="' + (G - 22) + '" width="8" height="24" fill="#5f6b78"/>'
    }));
  })();

  // Liggende på ryggen (hovedet til venstre): hælglid og strakt benløft
  const SH = [126, G - 16], HP = [226, G - 16];
  const sup = (lf, ln) => ({ hip: HP, trunkTo: SH, curve: 0, nod: 0, legF: lf, legN: ln, armF: { hand: [206, G - 7], straight: 1 }, armN: { hand: [214, G - 6], straight: 1 } });
  const straight = (a, off) => { const d = [Math.cos(rad(a)), -Math.sin(rad(a))], h = add(HP, off || [0, 0]); return { knee: add(h, mul(d, 88)), ank: add(h, mul(d, 178)), fa: -90 + a }; };
  define('op-h-haelglid', Object.assign(L(), {
    vb: [0, 80, 440, 190],
    tempo: 'Lig på ryggen med benene strakt. Lad hælen glide langsomt op mod numsen, så knæet bøjer (3 sek.), så langt det er rart. Hold 2 sek., og lad hælen glide ud igen (3 sek.).',
    poses: { out: sup(straight(0, [4, 0]), straight(0)), in: sup(straight(0, [4, 0]), { ank: [300, G - 14], fa: 0 }) }, start: 'out',
    seq: [{ to: 'in', d: 3, k: 'op', l: 'Bøj knæet' }, { d: 2, k: 'hold', l: 'Hold', count: false }, { to: 'out', d: 3, k: 'ned', l: 'Stræk ud', count: false }, { d: 1, k: 'pause', l: 'Hvil', count: false }],
    still: 3.5, ghost: 'out', under: mat
  }));
  define('op-h-strakt-benloeft', Object.assign(L(), {
    vb: [0, 40, 440, 230],
    tempo: 'Lig på ryggen med det raske ben bøjet. Spænd lårmusklen på det strakte ben, så knæet er helt strakt, og løft benet til samme højde som det bøjede knæ (2 sek.). Hold 2 sek., og sænk langsomt (2 sek.).',
    poses: { down: sup({ ank: [318, G - 16] }, straight(0)), up: sup({ ank: [318, G - 16] }, straight(36)) }, start: 'down',
    seq: [{ to: 'up', d: 2, k: 'op', l: 'Løft' }, { d: 2, k: 'hold', l: 'Hold', count: false }, { to: 'down', d: 2, k: 'ned', l: 'Sænk', count: false }, { d: 1.2, k: 'pause', l: 'Hvil', count: false }],
    still: 2.6, ghost: 'down', under: mat
  }));

  // Sprællemand (forfra)
  (() => {
    const hx = 160, F = () => ({ W: 320, H: 440, floor: FLOOR, view: 'front' });
    const P = (w, up, y) => ({ hip: [hx, 224 - (y || 0)], tilt: 0, legR: { ank: [hx - w, ANK - (y || 0)] }, legL: { ank: [hx + w, ANK - (y || 0)] },
      armR: up ? { hand: [hx - 50, 40 - (y || 0)], side: -1, flat: 0.2 } : { hand: [hx - 34, 300], side: -1, flat: 0.3 }, armL: up ? { hand: [hx + 50, 40 - (y || 0)], side: 1, flat: 0.2 } : { hand: [hx + 34, 300], side: 1, flat: 0.3 } });
    define('pt-spraellemand', Object.assign(F(), {
      tempo: 'Hop fødderne ud til siden, mens armene går op over hovedet, og hop samlet igen. Land blødt på forfoden. Lettere: tag et skridt ud til siden i stedet for at hoppe.',
      poses: { in: P(14, false), out: P(62, true) }, start: 'in',
      seq: [{ to: 'out', d: 0.45, k: 'op', l: 'Ud' }, { to: 'in', d: 0.45, k: 'ned', l: 'Ind', count: false }],
      still: 0.45, ghost: 'in'
    }));
  })();

  // Isometrisk hofteabduktion stående mod væggen (bagfra): det ydre ben presser ud mod væggen
  (() => {
    const hx = 150, WALL = 192, F = () => ({ W: 320, H: 440, floor: FLOOR, view: 'front' });
    // Det inderste knæ rører væggen og presser ud (isometrisk – næsten ingen bevægelse); hånden let mod væggen
    const P = (kx, sh) => ({ hip: [hx - sh, 224], back: true, tilt: -sh * 0.2, legL: { ank: [hx - 16, ANK] }, legR: { knee: [kx, 314], ank: [hx + 20, ANK] }, armR: { hand: [WALL - 7, 196] }, armL: { hand: [hx - 34, 300], flat: 0.3 } });
    define('sene-h-iso-hofte', Object.assign(F(), {
      tempo: 'Stå med siden mod væggen og det onde ben inderst. Bøj det inderste knæ lidt, og pres ydersiden af knæet ud mod væggen med ca. halv kraft. Hold 30–45 sek. uden at læne overkroppen. Slip roligt.',
      poses: { a: P(WALL - 15, 0), b: P(WALL - 12, 1.5) }, start: 'a',
      seq: [{ to: 'b', d: 1.5, k: 'op', l: 'Pres ud', count: false }, { d: 30, k: 'hold', l: 'Hold' }, { to: 'a', d: 1.5, k: 'ned', l: 'Slip', count: false }, { d: 3, k: 'pause', l: 'Pause', count: false }],
      repLabel: 'Hold', still: 10, ghost: null,
      back: () => R.wall(WALL, 320, 0, FLOOR),
      over: (P, J) => { const k = J.legs.R.knee, y = k[1] - 40; return R.arrow([WALL - 52, y], [WALL - 3, y], C.accent) +
        '<circle cx="' + FF.f1(WALL - 1) + '" cy="' + FF.f1(k[1]) + '" r="7" fill="none" stroke="' + C.accent + '" stroke-width="3"/>'; }
    }));
  })();
})();

/* ---- v33: Copenhagen adduktion, kort vægtstang (knæet på en stol) – samme geometri som sideplanken på knæ ---- */
(() => {
  const FF = typeof FigFilm !== 'undefined' ? FigFilm : require('./film-engine.js');
  const { R, C, add, sub, define } = FF;
  const MAT = 248, f1 = FF.f1;
  const SEAT = MAT - 58, K = [318, SEAT - 6], EL = MAT - 8, TH = 88;
  const rotP = (p, ang, c) => { const r = ang * Math.PI / 180, d = sub(p, c); return add(c, [d[0] * Math.cos(r) - d[1] * Math.sin(r), d[0] * Math.sin(r) + d[1] * Math.cos(r)]); };
  const SHY = EL - 56;
  const geo = P => {
    const Dx = Math.sqrt(Math.max(1, 182 * 182 - (K[1] - SHY) ** 2)), Sw0 = [K[0] - Dx, SHY];
    const aTop = Math.atan2(K[1] - SHY, Dx) * 180 / Math.PI, a = 22 + (aTop - 22) * P.lift, ar = a * Math.PI / 180;
    const hipW = [K[0] - TH * Math.cos(ar), K[1] - TH * Math.sin(ar)], ang = a - 90;
    const v = sub(Sw0, hipW), beta = Math.atan2(v[0], -v[1]) * 180 / Math.PI, tilt = beta - ang;
    const toL = w => rotP(w, -ang, hipW);
    // øverste ben: knæet på bænken og underbenet hviler på sædet · nederste ben: strakt, løftes op mod bænken
    const foot = [K[0] + 50, MAT - 9 - P.lift * (MAT - 9 - SEAT - 20)], lowKnee = add(FF.lerp(hipW, foot, 0.5), [0, 3]);
    const Q = { hip: hipW, tilt, legL: { knee: toL([K[0] + 4, K[1] - 2]), ank: toL([K[0] + 80, K[1] - 4]) }, legR: { knee: toL(lowKnee), ank: toL(foot) }, armL: { hand: toL(add(hipW, [-6, -30])), side: 1, flat: 0.6 }, headTilt: 0 };
    const Jl = FF.frontJoints(Object.assign({}, Q, { armR: {} })), SR = rotP(Jl.arms.R.S, ang, hipW);
    Q.armR = { el: toL([SR[0] + 2, EL]), hand: toL([SR[0] + 30, EL + 3]) };
    return { Q, ang, hipW };
  };
  define('pt-copenhagen', Object.assign({ W: 440, H: 270, floor: 252, view: 'custom' }, {
    vb: [0, 40, 440, 220],
    tempo: 'Lig på siden på underarmen med det øverste knæ på en stol. Løft hoften og det nederste ben, så du er lige fra knæ til skulder, og mærk det på indersiden af det øverste lår (2 sek.). Hold 3–5 sek., og sænk roligt (2 sek.).',
    poses: { down: { lift: 0 }, up: { lift: 1 } }, start: 'down',
    seq: [{ to: 'up', d: 2, k: 'op', l: 'Løft' }, { d: 4, k: 'hold', l: 'Hold', count: false }, { to: 'down', d: 2, k: 'ned', l: 'Sænk', count: false }, { d: 2, k: 'pause', l: 'Hvil', count: false }],
    still: 4, ghost: 'down',
    draw: P => { const g = geo(P); return '<g transform="rotate(' + f1(g.ang) + ' ' + f1(g.hipW[0]) + ' ' + f1(g.hipW[1]) + ')">' + FF.frontFig(g.Q, {}).svg + '</g>'; },
    under: () => R.mat(20, 430, MAT + 4),
    back: () => '<rect x="296" y="' + SEAT + '" width="104" height="12" rx="3" fill="' + C.wood + '"/>' +
      '<rect x="302" y="' + (SEAT + 12) + '" width="8" height="' + (MAT + 4 - SEAT - 12) + '" fill="' + C.woodDark + '"/><rect x="386" y="' + (SEAT + 12) + '" width="8" height="' + (MAT + 4 - SEAT - 12) + '" fill="' + C.woodDark + '"/>'
  }));
  // Samme film bruges af genoptræningsøvelser med samme bevægelse
  const copy = (id, src) => define(id, Object.assign({}, FF.FILMS[src]));
  copy('knae-2-vaegsid', 'pt-vaegsid');
  copy('skulder-2-ytl', 'pt-ytl');
})();
