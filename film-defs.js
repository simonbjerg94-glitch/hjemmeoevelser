/* Tempo-film til alle øvelser (bruger FigFilm fra film-engine.js). Én film = stillinger + tempo + rekvisitter.
   Tempoet følger dosis-teksten. Hvor der ikke står et tempo, bruges ca. 2 sek. op og 2–3 sek. ned. */
'use strict';
(() => {
  const FF = typeof FigFilm !== 'undefined' ? FigFilm : require('./film-engine.js');
  const { R, C, rot, add, sub, define } = FF;
  const FLOOR = 420, ANK = 404;                       // stående: anklen 16 over gulvet
  const SHOE_BALL = [30, 15];
  const onBall = (ballX, fa, floor) => sub([ballX, (floor || FLOOR) + 1], rot(SHOE_BALL, fa)); // ankel, når fodballen står på gulvet og hælen er løftet
  const standHip = (x, ankX) => [x, ANK - 177];
  const armsDown = (hip, tr) => ({ armF: { sa: 6 + (tr || 0) * 0.4, ef: 10 }, armN: { sa: 2 + (tr || 0) * 0.4, ef: 12 } });
  const crossed = { armF: { sa: 22, ef: 164, rel: 1 }, armN: { sa: 16, ef: 170, rel: 1 } };
  const S = (W, H) => ({ W: W || 320, H: H || 440, floor: FLOOR, view: 'side' });

  /* ================= KNÆ ================= */
  // 1) Spænd lårmusklen (siddende på måtte, håndklæde under knæet). Hold 5 sek.
  (() => {
    const fl = 262, mat = fl - 4, hip = [150, mat - 15];
    const base = (th, kn, pf) => ({ hip, trunk: -18, legF: { th: 92, kn: 3, pf: 18 }, legN: { th, kn, pf }, armF: { hand: [hip[0] - 46, mat - 4] }, armN: { hand: [hip[0] - 40, mat - 3] } });
    define('knae-1-laarmuskel', Object.assign(S(440, 290), {
      floor: fl, vb: [0, 38, 440, 252], tempo: 'Spænd og hold 5 sek. · slap af. Pres knæhasen ned i håndklædet, og træk tæerne op.',
      poses: { rest: base(100, 22, 22), press: base(97, 4, -12) }, start: 'rest',
      seq: [{ to: 'press', d: 1, k: 'op', l: 'Spænd' }, { d: 5, k: 'hold', l: 'Hold' }, { to: 'rest', d: 1.5, k: 'ned', l: 'Slap af' }, { d: 1, k: 'pause', l: 'Hvil' }],
      still: 3, ghost: 'rest',
      under: () => R.mat(40, 420, mat + 4),
      figOpt: (P, c) => ({ tense: c.key === 'hold' || (c.key === 'op' && c.u > 0.5) ? 'N' : null, behindTorso: () => R.towelRoll([hip[0] + 86, mat - 11], 11) }),
      over: (P, J, c) => (c.key === 'hold' || c.key === 'op') ? R.arrow(add(J.legs.N.knee, [0, -46]), add(J.legs.N.knee, [0, -20])) : ''
    }));
  })();

  // Rejse/sætte sig: fælles stillinger
  function sitStand(id, o) {
    const seat = o.seat, x0 = 52, x1 = 132, hipSit = [98, seat - 12], ankF = o.ankF, ankN = o.ankN || o.ankF;
    const arms = o.arms;
    const P = (hip, trunk, a, lf, ln) => Object.assign({ hip, trunk, nod: -trunk * 0.4, legF: lf || { ank: ankF }, legN: ln || { ank: ankN, fa: o.faN || 0 } }, a);
    const standX = o.standX || ankF[0] - 2;
    const poses = {
      sit: P(hipSit, 4, arms.sit),
      lean: P([hipSit[0] + 10, hipSit[1] + 1], 36, arms.lean),
      lift: P([hipSit[0] + 38, hipSit[1] - 24], 40, arms.lift),
      stand: P(standHip(standX), 2, arms.stand)
    };
    if (o.standLegs) Object.assign(poses.stand, o.standLegs);
    define(id, Object.assign(S(), {
      tempo: o.tempo, poses, start: 'sit',
      seq: [{ to: 'lean', d: 0.7, k: 'op', l: 'Op', lin: true }, { to: 'lift', d: 0.7, k: 'op', l: 'Op', lin: true }, { to: 'stand', d: 0.9, k: 'op', l: 'Op' },
        { d: 1, k: 'hold', l: 'Stå' },
        { to: 'lift', d: 1.5, k: 'ned', l: 'Ned' }, { to: 'sit', d: 1.5, k: 'ned', l: 'Ned' }, { d: 1, k: 'pause', l: 'Hvil' }],
      still: 3, ghost: 'sit',
      back: () => R.chairSide(x0, x1, seat, FLOOR, { arms: o.armrest }),
      over: o.armrest ? () => '' : null
    }));
  }
  sitStand('knae-1-rejse-hoej', { seat: 304, armrest: true, ankF: [166, ANK], ankN: [170, ANK], tempo: 'Ca. 2–3 sek. op · 3 sek. ned (tæl til 3). Hænderne hjælper kun lidt.',
    arms: { sit: { armF: { hand: [126, 266] }, armN: { hand: [130, 267] } }, lean: { armF: { hand: [126, 266] }, armN: { hand: [130, 267] } },
      lift: { armF: { hand: [128, 266] }, armN: { hand: [132, 267] } }, stand: armsDown() } });
  sitStand('knae-2-rejse-uden-arme', { seat: 322, armrest: false, ankF: [162, ANK], ankN: [166, ANK], tempo: 'Ca. 2 sek. op · 3 sek. ned (tæl til 3). Armene over kors.',
    arms: { sit: crossed, lean: crossed, lift: crossed, stand: crossed } });
  sitStand('knae-3-rejse-et-ben', { seat: 322, armrest: false, ankF: [158, ANK], ankN: [232, ANK - 2], faN: -24, standX: 166, tempo: 'Ca. 2 sek. op · 3 sek. ned. Det forreste ben hviler bare på hælen – kraften kommer fra det bagerste ben.',
    arms: { sit: crossed, lean: crossed, lift: crossed, stand: crossed } });

  // 3) Knæstræk siddende: Op 2 · hold 3 · ned 2
  (() => {
    const seat = 322, hip = [98, seat - 12];
    const P = (kn, pf) => Object.assign({ hip, trunk: 2, legF: { ank: [176, ANK] }, legN: { th: 86, kn, pf } }, { armF: { hand: [128, seat - 6] }, armN: { hand: [134, seat - 8] } });
    define('knae-1-knaestraek-siddende', Object.assign(S(), {
      tempo: '2 sek. op · hold 3 sek. med tæerne trukket op · 2 sek. ned.',
      poses: { down: P(80, 0), up: P(0, -10) }, start: 'down',
      seq: [{ to: 'up', d: 2, k: 'op', l: 'Op' }, { d: 3, k: 'hold', l: 'Hold' }, { to: 'down', d: 2, k: 'ned', l: 'Ned' }, { d: 1, k: 'pause', l: 'Hvil' }],
      still: 3.5, ghost: 'down',
      back: () => R.chairSide(52, 132, seat, FLOOR),
      figOpt: (P, c) => ({ tense: c.key === 'hold' ? 'N' : null })
    }));
  })();
  // 5) Trin op: fod op · 2 sek. op · ned med samme ben først
  (() => {
    const top = 378, sA = top - 16, railY = x => 287 - 0.47 * x;
    const P = (hip, trunk, lf, ln) => ({ hip, trunk, legF: lf, legN: ln, armF: { sa: 6, ef: 12, rel: 1 } });
    define('knae-2-trin-op', Object.assign(S(), {
      tempo: 'Fod op · ca. 2 sek. op · 2–3 sek. ned med samme ben først. Hold i gelænderet.',
      poses: {
        start: P(standHip(110), 2, { ank: [106, ANK] }, { ank: [114, ANK] }),
        footUp: P([118, 228], 6, { ank: [106, ANK] }, { ank: [204, sA] }),
        mid: P([168, 206], 12, { ank: onBall(140, 28), fa: 28 }, { ank: [204, sA] }),
        top: P([200, sA - 176], 2, { ank: [192, sA] }, { ank: [206, sA] }),
        down1: P([166, 214], 10, { ank: [192, sA] }, { ank: [120, ANK] })
      }, start: 'start',
      seq: [{ to: 'footUp', d: 1.2, k: 'op', l: 'Fod op', arc: { legN: 34 } }, { to: 'mid', d: 1.2, k: 'op', l: 'Op' }, { to: 'top', d: 0.9, k: 'op', l: 'Op', arc: { legF: 26 } },
        { d: 0.8, k: 'hold', l: 'Stå' }, { to: 'down1', d: 1.6, k: 'ned', l: 'Ned', arc: { legN: 16 } }, { to: 'start', d: 1, k: 'ned', l: 'Ned', arc: { legF: 22 } }, { d: 0.6, k: 'pause', l: 'Hvil' }],
      still: 4, ghost: 'start',
      mod: P => { const sx = P.hip[0] + Math.sin(P.trunk * Math.PI / 180) * 100 + 32; P.armN = { hand: [sx, railY(sx) - 3] }; return P; },
      back: () => R.rail(0, railY(0), 320, railY(320), [[296, railY(296), top]]),
      under: () => R.stepSide(176, 320, top, FLOOR)
    }));
  })();

  // 6) Minisquat ved køkkenbordet: 2–3 sek. ned · 2 sek. op
  (() => {
    const hands = { armF: { hand: [206, 219] }, armN: { hand: [210, 220] } };
    define('knae-2-minisquat', Object.assign(S(), {
      tempo: 'Ca. 2–3 sek. ned · 2 sek. op. Bagdelen bagud, som mod en høj barstol.',
      poses: {
        up: Object.assign({ hip: standHip(150), trunk: 3, legF: { ank: [148, ANK] }, legN: { ank: [154, ANK] } }, hands),
        down: Object.assign({ hip: [124, 262], trunk: 28, nod: -14, legF: { ank: [148, ANK] }, legN: { ank: [154, ANK] } }, hands)
      }, start: 'up',
      seq: [{ to: 'down', d: 2.5, k: 'ned', l: 'Ned' }, { to: 'up', d: 2, k: 'op', l: 'Op' }, { d: 0.8, k: 'pause', l: 'Stå' }],
      still: 2.4, ghost: 'up',
      back: () => R.counterSide(202, 330, 227, FLOOR)
    }));
  })();

  // 8) Udfaldsskridt frem: skridt frem · 2 sek. ned · 2 sek. op · tilbage
  (() => {
    const P = (hip, trunk, lf, ln) => ({ hip, trunk, legF: lf, legN: ln, armN: { sa: 4, ef: 14, rel: 1 } });
    define('knae-3-udfald-frem', Object.assign(S(), {
      tempo: 'Skridt frem · ca. 2 sek. ned · 2 sek. op · træd tilbage. Hold let i køkkenbordet.',
      poses: {
        stand: P(standHip(70), 2, { ank: [66, ANK] }, { ank: [74, ANK] }),
        step: P([146, 247], 2, { ank: [66, ANK] }, { ank: [226, ANK] }),
        down: P([146, 300], 3, { ank: onBall(96, 52), fa: 52 }, { ank: [226, ANK] })
      }, start: 'stand',
      seq: [{ to: 'step', d: 1.2, k: 'op', l: 'Skridt frem', arc: { legN: 24 } }, { to: 'down', d: 2, k: 'ned', l: 'Ned' }, { to: 'step', d: 2, k: 'op', l: 'Op' },
        { to: 'stand', d: 1.2, k: 'ned', l: 'Tilbage', arc: { legN: 20 } }, { d: 0.6, k: 'pause', l: 'Hvil' }],
      still: 3.2, ghost: 'stand',
      mod: P => { const sx = P.hip[0] + Math.sin(P.trunk * Math.PI / 180) * 100 + 14; P.armF = { hand: [sx, 220] }; return P; },
      back: () => R.counterBack(320, 227, FLOOR)
    }));
  })();

  // 9) Trin ned: 3 sek. ned · rør let med hælen · 2 sek. op
  (() => {
    const top = 378, sA = top - 16, railY = x => 112 + 0.375 * x;
    const P = (hip, trunk, ln) => ({ hip, trunk, nod: -trunk * 0.5, legF: { ank: [166, sA] }, legN: ln, armF: { sa: 6, ef: 14, rel: 1 } });
    define('knae-3-trin-ned', Object.assign(S(), {
      tempo: 'Ca. 3 sek. ned · rør gulvet let med hælen · 2 sek. op. Hold i gelænderet.',
      poses: {
        up: P([168, sA - 176], 2, { th: 14, kn: 22, pf: 6 }),
        down: P([140, 248], 16, { ank: [212, ANK - 3], fa: -20 })
      }, start: 'up',
      seq: [{ to: 'down', d: 3, k: 'ned', l: 'Ned' }, { d: 0.6, k: 'hold', l: 'Rør let', count: false }, { to: 'up', d: 2, k: 'op', l: 'Op' }, { d: 0.7, k: 'pause', l: 'Hvil' }],
      still: 3.2, ghost: 'up',
      mod: P => { const sx = P.hip[0] + Math.sin(P.trunk * Math.PI / 180) * 100 + 20 + 0.8 * (P.hip[1] - 186); P.armN = { hand: [sx, railY(sx) - 3] }; return P; },
      back: () => R.stepSide(-10, 60, top - 84, FLOOR) + R.stepSide(-10, 120, top - 42, FLOOR) + R.rail(0, railY(0), 320, railY(320), [[40, railY(40), top - 84]]),
      under: () => R.stepSide(-10, 196, top, FLOOR)
    }));
  })();
  /* ================= HOFTE ================= */
  const L = (W, H) => ({ W: W || 440, H: H || 270, floor: 252, view: 'side' });
  const deg = r => r * 180 / Math.PI;
  // Broen (begge ben / ét ben)
  function bridge(id, one, o) {
    const mat = 248, sh = [96, mat - 16], ankF = [314, mat - 16], ankN = [322, mat - 16];
    const P = hip => ({ hip, trunkTo: sh, nod: 0, legF: { ank: ankF }, legN: { ank: ankN }, armF: { hand: [196, mat - 7] }, armN: { hand: [204, mat - 6] } });
    define(id, Object.assign(L(), {
      vb: [0, 22, 440, 242], tempo: o.tempo, poses: { down: P([196, mat - 16]), up: P([200, mat - 76]) }, start: 'down',
      seq: [{ to: 'up', d: 2, k: 'op', l: 'Op' }, { d: o.hold, k: 'hold', l: 'Hold' }, { to: 'down', d: 2, k: 'ned', l: 'Ned' }, { d: 1, k: 'pause', l: 'Hvil' }],
      still: 2 + o.hold / 2, ghost: 'down',
      mod: one ? P => { const J = FF.sideJoints(P), k = J.legs.F.knee, th = deg(Math.atan2(k[0] - P.hip[0], k[1] - P.hip[1])); P.legN = { th: th - 2, kn: 2, pf: 18 }; return P; } : null,
      under: () => R.mat(20, 425, mat + 4)
    }));
  }
  bridge('hofte-1-broen', false, { hold: 3, tempo: '2 sek. op · hold 3 sek. i toppen · 2 sek. ned. Spænd ballerne – lige linje fra skuldre til knæ.' });
  bridge('hofte-3-broen-et-ben', true, { hold: 2.5, tempo: '2 sek. op · hold 2–3 sek. · 2 sek. ned. Det strakte ben følger låret.' });

  // Sideløft liggende (set forfra, figuren ligger på højre side; øverste ben løftes)
  (() => {
    const mat = 236, hip = [214, mat - 27];
    const P = ab => ({ hip, legR: { ab: 2 }, legL: { ab }, armR: { hand: add(hip, [-30, -196]), side: 1, flat: 1 }, armL: { hand: add(hip, [30, -4]), flat: 1 } });
    // posen er tegnet stående og drejes −90° om hoften (hovedet til venstre)
    const toLocal = p => p; // hænderne angives i den stående (ikke-drejede) figurs koordinater
    define('hofte-1-sideloeft-liggende', Object.assign(L(440, 270), {
      floor: mat + 4, view: 'front', rot: [-90, hip[0], hip[1]], vb: [0, 50, 440, 215],
      tempo: 'Ca. 2 sek. op · 2–3 sek. ned. Strakt knæ, tæerne peger frem.',
      poses: { down: P(3), up: P(32) }, start: 'down',
      seq: [{ to: 'up', d: 2, k: 'op', l: 'Op' }, { d: 0.5, k: 'hold', l: 'Hold', count: false }, { to: 'down', d: 2.5, k: 'ned', l: 'Ned' }, { d: 0.8, k: 'pause', l: 'Hvil' }],
      still: 2.2, ghost: 'down',
      under: () => R.mat(10, 430, mat + 4) + '<ellipse cx="' + (hip[0] - 158) + '" cy="' + (mat - 12) + '" rx="34" ry="12" fill="#f4efe6" stroke="#d9d0c2" stroke-width="2"/>'
    }));
  })();

  // Benet bagud stående (front mod køkkenbordet)
  (() => {
    const hands = { armF: { hand: [206, 219] }, armN: { hand: [210, 220] } };
    const P = th => Object.assign({ hip: standHip(150), trunk: 4, legF: { ank: [150, ANK] }, legN: { th, kn: th < -5 ? 3 : 1, pf: th < -5 ? 14 : 0 } }, hands);
    define('hofte-1-benet-bagud', Object.assign(S(), {
      tempo: 'Ca. 2 sek. bagud · 2 sek. tilbage. Strakt knæ, spænd ballen – ingen svaj i lænden.',
      poses: { a: P(0), b: P(-24) }, start: 'a',
      seq: [{ to: 'b', d: 2, k: 'op', l: 'Bagud' }, { d: 0.6, k: 'hold', l: 'Hold', count: false }, { to: 'a', d: 2, k: 'ned', l: 'Tilbage' }, { d: 0.6, k: 'pause', l: 'Hvil' }],
      still: 2.3, ghost: 'a',
      back: () => R.counterSide(202, 330, 227, FLOOR)
    }));
  })();

  // Hoftehængsel med kosteskaft
  (() => {
    const P = (hip, trunk) => ({ hip, trunk, nod: -trunk * 0.1, legF: { ank: [150, ANK] }, legN: { ank: [154, ANK] } });
    define('hofte-2-hoftehaengsel', Object.assign(S(), {
      tempo: 'Ca. 2–3 sek. ned · 2 sek. op. Skaftet rører baghoved, skulderblade og haleben hele vejen.',
      poses: { up: P([152, 231], 0), down: P([116, 244], 56) }, start: 'up',
      seq: [{ to: 'down', d: 2.5, k: 'ned', l: 'Ned' }, { d: 0.5, k: 'hold', l: 'Stræk', count: false }, { to: 'up', d: 2, k: 'op', l: 'Op' }, { d: 0.7, k: 'pause', l: 'Stå' }],
      still: 2.7, ghost: 'up',
      mod: P => { const J = FF.sideJoints(P); P.armN = { hand: J.W(-24, 126), elbowFwd: 1 }; P.armF = { hand: J.W(-26, 4) }; return P; },
      figOpt: () => ({ behindTorso: J => R.stick(J.W(-23, -26), J.W(-23, 168)) })
    }));
  })();

  // Set bagfra ved køkkenbordet: sideløft, sideløft med elastik, sidegang
  const BACK = () => ({ W: 320, H: 440, floor: FLOOR, view: 'front' });
  const counterB = () => R.counterBack(320, 227, FLOOR);
  function sideLift(id, band, o) {
    const hx = 160;
    const P = (ab, sh) => ({ hip: [hx - sh, 224], back: true, tilt: -sh * 0.25, legR: { ank: [hx + 14, ANK] }, legL: { ab }, armR: { hand: [hx + 30 + sh * 0.5, 224] }, armL: { hand: [hx - 30 + sh * 0.5, 224] } });  // bagfra: personens højre side er til højre i billedet
    define(id, Object.assign(BACK(), {
      tempo: o.tempo, poses: { a: P(1, 0), b: P(30, 5) }, start: 'a',
      seq: o.seq, still: o.still, ghost: 'a',
      back: counterB,
      figOpt: band ? () => ({ overLegs: J => { const a = J.legs.R.ank, b = J.legs.L.ank, y = -10; return R.bandLine(add(a, [0, y]), add(b, [0, y])) + '<ellipse cx="' + FF.f1(a[0]) + '" cy="' + FF.f1(a[1] + y) + '" rx="10" ry="3.5" fill="none" stroke="' + C.band + '" stroke-width="4"/><ellipse cx="' + FF.f1(b[0]) + '" cy="' + FF.f1(b[1] + y) + '" rx="10" ry="3.5" fill="none" stroke="' + C.band + '" stroke-width="4"/>'; } }) : null
    }));
  }
  sideLift('hofte-2-sideloeft-staaende', false, { tempo: 'Ca. 2 sek. ud · 2–3 sek. ind. Strakt knæ, tæerne frem, rank overkrop. (Set bagfra.)', still: 2.2,
    seq: [{ to: 'b', d: 2, k: 'op', l: 'Ud' }, { d: 0.4, k: 'hold', l: 'Hold', count: false }, { to: 'a', d: 2.5, k: 'ned', l: 'Ind' }, { d: 0.6, k: 'pause', l: 'Hvil' }] });
  sideLift('hofte-3-sideloeft-elastik', true, { tempo: 'Ca. 2 sek. ud mod elastikken · hold et øjeblik · 3 sek. ind (tæl til 3). (Set bagfra.)', still: 2.5,
    seq: [{ to: 'b', d: 2, k: 'op', l: 'Ud' }, { d: 1, k: 'hold', l: 'Hold' }, { to: 'a', d: 3, k: 'ned', l: 'Ind' }, { d: 0.6, k: 'pause', l: 'Hvil' }] });

  (() => {
    const y = 236, wd = 30, step = 34;
    const P = (hx, lx, rx) => ({ hip: [hx, y], back: true, legR: { ank: [rx, ANK] }, legL: { ank: [lx, ANK] }, armR: { hand: [hx + 30, 224] }, armL: { hand: [hx - 30, 224] } });
    // bagfra: personens venstre ben er til venstre i billedet
    const poses = {}, seq = [];
    let lx = 110 - wd / 2, rx = 110 + wd / 2;
    poses.s0 = P(110, lx, rx);
    let n = 0;
    for (let i = 0; i < 3; i++) { // til højre
      rx += step + 6; poses['o' + n] = P((lx + rx) / 2, lx, rx); seq.push({ to: 'o' + n, d: 0.9, k: 'op', l: 'Skridt til højre', count: false, arc: { legR: 14 } });
      lx += step + 6; poses['i' + n] = P((lx + rx) / 2, lx, rx); seq.push({ to: 'i' + n, d: 0.9, k: 'op', l: 'Skridt til højre', count: false, arc: { legL: 12 } }); n++;
    }
    for (let i = 0; i < 3; i++) { // tilbage til venstre
      lx -= step + 6; poses['o' + n] = P((lx + rx) / 2, lx, rx); seq.push({ to: 'o' + n, d: 0.9, k: 'ned', l: 'Skridt til venstre', count: false, arc: { legL: 14 } });
      rx -= step + 6; poses['i' + n] = P((lx + rx) / 2, lx, rx); seq.push({ to: 'i' + n, d: 0.9, k: 'ned', l: 'Skridt til venstre', count: false, arc: { legR: 12 } }); n++;
    }
    poses['i' + (n - 1)] = poses.s0;
    define('hofte-2-sidegang', Object.assign(BACK(), {
      tempo: 'Roligt: træd ud til siden, før den anden fod efter. Let bøjede knæ. (Set bagfra – filmen viser 3 skridt hver vej.)',
      repLabel: 'Runde', poses, start: 's0', seq, still: 0.85, ghost: 's0', back: counterB
    }));
  })();

  // Udfaldsskridt bagud
  (() => {
    const P = (hip, trunk, lf, ln) => ({ hip, trunk, legF: lf, legN: ln, armN: { sa: 4, ef: 14, rel: 1 } });
    define('hofte-3-udfald-bagud', Object.assign(S(), {
      tempo: 'Skridt bagud · ca. 2 sek. ned · 2 sek. op gennem forreste hæl · tilbage til start.',
      poses: {
        stand: P(standHip(222), 2, { ank: [226, ANK] }, { ank: [218, ANK] }),
        step: P([160, 247], 3, { ank: [226, ANK] }, { ank: onBall(96, 30), fa: 30 }),
        down: P([146, 300], 3, { ank: [226, ANK] }, { ank: onBall(96, 52), fa: 52 })
      }, start: 'stand',
      seq: [{ to: 'step', d: 1.2, k: 'op', l: 'Skridt bagud', arc: { legN: 22 } }, { to: 'down', d: 2, k: 'ned', l: 'Ned' }, { to: 'step', d: 2, k: 'op', l: 'Op' },
        { to: 'stand', d: 1.2, k: 'op', l: 'Frem', arc: { legN: 22 } }, { d: 0.6, k: 'pause', l: 'Hvil' }],
      still: 3.2, ghost: 'stand',
      mod: P => { const sx = P.hip[0] + Math.sin(P.trunk * Math.PI / 180) * 100 + 14; P.armF = { hand: [sx, 220] }; return P; },
      back: () => R.counterBack(320, 227, FLOOR)
    }));
  })();
  /* ================= BALANCE ================= */
  const sway = (P, c, amp) => { if (c.key === 'hold') { const w = Math.sin(c.x * 2 * Math.PI / 2.6) * amp * Math.min(1, c.u * 8, (1 - c.u) * 8); P.hip = [P.hip[0] + w, P.hip[1]]; if (P.tilt != null) P.tilt = (P.tilt || 0) + w * 0.4; else P.trunk = (P.trunk || 0) + w * 0.5; } return P; };
  // Samlede fødder (set bagfra), hænderne lige over bordkanten
  (() => {
    const hx = 160;
    const P = (w, hy) => ({ hip: [hx, 224], back: true, tilt: 0, legR: { ank: [hx + w, ANK] }, legL: { ank: [hx - w, ANK] }, armR: { hand: [hx + 30, 224 - hy] }, armL: { hand: [hx - 30, 224 - hy] } });
    define('balance-1-samlede-foedder', Object.assign(BACK(), {
      tempo: 'Stil fødderne helt sammen, og stå stille i 20–30 sek. Hænderne lige over bordkanten. (Set bagfra.)',
      poses: { a: P(15, 0), b: P(6.5, 10) }, start: 'a',
      seq: [{ to: 'b', d: 1.5, k: 'op', l: 'Stil dig', count: false, arc: { legR: 8 } }, { d: 20, k: 'hold', l: 'Hold' }, { to: 'a', d: 1.5, k: 'ned', l: 'Slap af', count: false }, { d: 1, k: 'pause', l: 'Hvil' }],
      still: 8, ghost: 'a', mod: (P, c) => sway(P, c, 1.6), back: counterB
    }));
  })();
  // Tandemstand (set fra siden, køkkenbordet bagved) + lille indsat billede set ovenfra
  const counterHand = P => { const sx = P.hip[0] + Math.sin((P.trunk || 0) * Math.PI / 180) * 100 + 12; P.armF = { hand: [sx, 220] }; return P; };
  function footTop(x, y, col, stroke) { // fod/sko set ovenfra, tæerne mod højre; x = hælens bagkant
    return '<path fill="' + col + '" stroke="' + stroke + '" stroke-width="1.3" d="M' + x + ',' + y + ' c0,-5 3,-7 8,-7.5 c8,-0.5 18,-2 24,-2.5 c6,-0.4 9,3 9,10 c0,7 -3,10.4 -9,10 c-6,-0.5 -16,-2 -24,-2.5 c-5,-0.5 -8,-2.5 -8,-7.5 z"/>';
  }
  (() => {
    const x0 = 116, FL = 59, hy = ANK - 175;
    const P = (fx, nx) => ({ hip: [(fx + nx) / 2, hy], trunk: 1, hipOffF: [fx > nx ? 11 : fx < nx ? -11 : 0, 0], hipOffN: [nx > fx ? 11 : nx < fx ? -11 : 0, 0],
      legF: { ank: [fx, ANK] }, legN: { ank: [nx, ANK] }, armN: { sa: 6, ef: 18, rel: 1 } });
    define('balance-2-tandem', Object.assign(S(), {
      tempo: 'Hæl mod tå: den forreste hæl rører den bageste fods tæer. Stå stille i 20–30 sek. Skift så, så den anden fod er forrest. Hold let i bordet.',
      poses: { n: P(x0, x0), a: P(x0, x0 + FL), b: P(x0 + FL, x0) }, start: 'n',
      seq: [{ to: 'a', d: 1.5, k: 'op', l: 'Stil dig', count: false, arc: { legN: 16 } }, { d: 20, k: 'hold', l: 'Hold' }, { to: 'n', d: 1.5, k: 'ned', l: 'Skift fod', count: false, arc: { legN: 12 } },
        { to: 'b', d: 1.5, k: 'op', l: 'Skift fod', count: false, arc: { legF: 16 } }, { d: 20, k: 'hold', l: 'Hold' }, { to: 'n', d: 1.5, k: 'ned', l: 'Slap af', count: false, arc: { legF: 12 } }, { d: 1, k: 'pause', l: 'Hvil' }],
      shots: [0, 1.5, 11, 25.5, 35], still: 8, ghost: 'n',
      mod: (P, c) => counterHand(sway(P, c, 1.4)),
      back: () => R.counterBack(320, 227, FLOOR),
      over: (P, J) => { // indsat: fødderne set ovenfra
        const ox = 14, oy = 14, s = 0.62, ax = x => ox + 8 + (x - x0 + 15) * s;
        const fF = J.legs.F.ank[0], fN = J.legs.N.ank[0];
        let g = '<rect x="' + ox + '" y="' + oy + '" width="112" height="70" rx="10" fill="#fff" stroke="' + C.guide + '" stroke-width="2"/>' +
          '<text x="' + (ox + 56) + '" y="' + (oy + 15) + '" text-anchor="middle" font-family="sans-serif" font-size="11" font-weight="700" fill="' + C.guide + '">Set ovenfra</text>' +
          '<line x1="' + (ox + 8) + '" y1="' + (oy + 44) + '" x2="' + (ox + 104) + '" y2="' + (oy + 44) + '" stroke="' + C.guide + '" stroke-width="1" stroke-dasharray="3 3" opacity=".5"/>';
        // bagfra/forfra i dybden: det fjerne ben lidt længere væk (opad), når fødderne står side om side
        const sideBySide = Math.abs(fF - fN) < 30, k = 1 - Math.min(1, Math.abs(fF - fN) / 30);
        const yF = oy + 44 - 10 * k, yN = oy + 44 + 10 * k;
        g += '<g transform="translate(' + FF.f1(ax(fF) - 8) + ',0) scale(' + s + ',' + s + ') translate(0,' + FF.f1(yF / s - yF) + ')">' + '' + '</g>';
        g += footTop(FF.f1(ax(fF) - 9), FF.f1(yF), '#d5dadd', '#9aa3aa') + footTop(FF.f1(ax(fN) - 9), FF.f1(yN), '#ffffff', '#9aa3aa');
        return g;
      }
    }));
  })();
  // Stå på ét ben: foden løftes kun lidt (5–10 cm) lige bag standbenets ankel. Skift ben.
  (() => {
    const P = (lf, ln) => ({ hip: standHip(150), trunk: 1, legF: lf, legN: ln, armN: { sa: 6, ef: 18, rel: 1 } });
    const down = k => ({ th: 0, kn: 1, pf: 0 }), up = { th: 15, kn: 42, pf: -4 };
    define('balance-3-et-ben', Object.assign(S(), {
      tempo: 'Løft den ene fod lidt fra gulvet (5–10 cm), og stå i op til 30 sek. Standbenet er strakt. Hold let i bordet. Skift ben.',
      poses: { n: P(down(), down()), a: P(down(), up), b: P(up, down()) }, start: 'n',
      seq: [{ to: 'a', d: 1.2, k: 'op', l: 'Løft foden', count: false }, { d: 20, k: 'hold', l: 'Hold' }, { to: 'n', d: 1.2, k: 'ned', l: 'Sæt ned', count: false }, { d: 0.8, k: 'pause', l: 'Skift ben', count: false },
        { to: 'b', d: 1.2, k: 'op', l: 'Løft foden', count: false }, { d: 20, k: 'hold', l: 'Hold' }, { to: 'n', d: 1.2, k: 'ned', l: 'Sæt ned', count: false }, { d: 0.8, k: 'pause', l: 'Hvil' }],
      shots: [0, 1.2, 11, 34], still: 8, ghost: 'n',
      mod: (P, c) => counterHand(sway(P, c, 1.4)),
      back: () => R.counterBack(320, 227, FLOOR)
    }));
  })();
  /* ================= HÆLSPORE ================= */
  const K = 3; // nærbilleder: foden i 3× størrelse
  const BALL_BARE = [28, 16];
  const onBallBare = (ballX, fa, floor) => sub([ballX, floor || FLOOR], rot(BALL_BARE, fa));
  const footK = (ank, fa, toe, extra, arch) => '<g transform="translate(' + FF.P2(ank) + ') rotate(' + FF.f1(fa) + ') scale(' + K + ')">' + FF.footSide(false, toe, extra, arch) + '</g>';
  const shinK = (ank, top, cuffK) => FF.limb(FF.lerp(ank, top, 0.08), top, 38, 46, C.skin) + FF.limb(FF.lerp(ank, top, cuffK || 0.72), top, 62, 66, C.pants) + FF.limb(FF.lerp(ank, top, (cuffK || 0.72) - 0.02), FF.lerp(ank, top, (cuffK || 0.72) + 0.07), 62, 62, C.cuff);
  const CLOSE = (H) => ({ W: 320, H: H || 230, floor: H || 230, view: 'custom' });
  const bg2 = (W, H, y) => '<rect x="0" y="' + y + '" width="' + W + '" height="' + (H - y) + '" fill="' + C.floor + '"/><rect x="0" y="' + y + '" width="' + W + '" height="2" fill="' + C.floorLine + '"/>';

  // 1) Stræk fodsålen (nærbillede som i morgenrutinen): foden over knæet, hånden bøjer tæerne op
  (() => {
    const ank = [96, 124];
    const hand = s => '<g><path fill="' + C.skin + '" d="M9,-6 L24,-30 L33,-25 L18,-2 Z"/>' + // underarm
      '<path fill="' + C.skin + '" stroke="' + C.skinDark + '" stroke-width=".5" d="M6,-4.5 C6,-8 9,-9.5 13,-9.5 L15.5,-9.5 C18.5,-9.5 20,-7 19.6,-3 L19,3.5 C18.6,7 15.5,8 13.5,7 L9,6.4 C7.5,6.2 7.4,4.8 8.6,4.6 L14,4.8 L14.4,-3.6 Z"/>' +
      '<path fill="none" stroke="' + C.skinDark + '" stroke-width=".45" d="M16.5,-3 L16.2,5 M14.4,-3.4 L17.4,-3.4"/></g>';
    const P = s => ({ s });
    define('hael-1-fascie-straek', Object.assign(CLOSE(230), {
      tempo: 'Bøj tæerne op mod skinnebenet (ca. 1–2 sek.) · hold 10 sek. · slip langsomt. 10 gentagelser. Mærk svangen stram som en guitarstreng.',
      poses: { a: P(0), b: P(1) }, start: 'a',
      seq: [{ to: 'b', d: 1.5, k: 'op', l: 'Bøj tæerne', count: false }, { d: 10, k: 'hold', l: 'Hold' }, { to: 'a', d: 1.5, k: 'ned', l: 'Slip', count: false }, { d: 0.6, k: 'pause', l: 'Hvil', count: false }],
      still: 6, ghost: 'a',
      draw: P => {
        const s = P.s, fa = -6 * s;
        let g = '<rect x="0" y="168" width="320" height="62" fill="' + C.pantsDark + '"/><rect x="0" y="168" width="320" height="10" fill="#525a63"/>'; // det andet ben (låret) under foden
        g += shinK(ank, [-20, 6], 0.7);
        const arch = '<path fill="none" stroke="#e8663c" stroke-width="2" stroke-linecap="round" opacity="' + FF.f1(Math.max(0, s - 0.25) * 1.3) + '" d="M-9,16.4 C0,15.8 14,14.6 29,15.6"/>' +
          '<path fill="' + C.skin + '" stroke="' + C.skinDark + '" stroke-width=".5" d="M2,15.5 C2,19 4,22 7,22 C10,22 11.5,19 11,16 Z"/>'; // den anden hånds finger under svangen
        g += footK(ank, fa, -66 * s, hand(s), arch);
        return g;
      },
      over: (P, J, c) => c.key === 'op' || c.key === 'hold' ? '<path fill="none" stroke="' + C.guide + '" stroke-width="4" stroke-linecap="round" d="M276,128 C290,100 280,74 258,58"/><path fill="' + C.guide + '" d="M250,52 L266,50 L262,66 Z"/>' : ''
    }));
  })();

  // 2) Rul foden over en bold (nærbillede)
  (() => {
    const fl = 205, r = 30, bx = 170, by = fl - r;
    const P = c => ({ c });
    define('hael-1-rul-under-foden', Object.assign(CLOSE(230), {
      tempo: 'Rul roligt frem og tilbage fra hælen til forfoden (ca. 2 sek. hver vej) i 1–2 minutter. Tryk, så det føles behageligt.',
      repLabel: 'Runde', poses: { heel: P(-5), fore: P(25) }, start: 'heel',
      seq: [{ to: 'fore', d: 2, k: 'op', l: 'Mod tæerne', count: false }, { to: 'heel', d: 2, k: 'ned', l: 'Mod hælen', count: false }],
      still: 1, ghost: 'heel',
      draw: P => {
        const ank = [bx - P.c * K, by - r - 16 * K + 3], rotA = -(P.c * K) / r * 57.3;
        let g = bg2(320, 230, fl);
        g += '<g transform="translate(' + bx + ',' + by + ') rotate(' + FF.f1(rotA) + ')"><circle r="' + r + '" fill="' + C.ball + '"/><path fill="none" stroke="#f7f9ef" stroke-width="4" d="M' + (-r) + ',-8 C-10,-14 10,14 ' + r + ',8 M-14,' + (-r + 4) + ' C-4,-8 -2,8 -12,' + (r - 4) + '"/><circle r="' + r + '" fill="none" stroke="' + C.ballDark + '" stroke-width="2"/></g>';
        g += shinK(ank, [ank[0] - 14, -20], 0.62) + footK(ank, 0, 0);
        return g;
      }
    }));
  })();

  // Lægstræk mod væg (strakt / bøjet knæ), bare fødder
  function calf(id, bent, tempo) {
    const wall = 252, frontA = [198, ANK];
    const hands = (sh) => ({ armF: { hand: [wall - 4, 148 + sh] }, armN: { hand: [wall - 2, 154 + sh] } });
    const backX = bent ? 150 : 104;
    const poses = {
      stand: Object.assign({ hip: standHip(196), trunk: 6, legF: { ank: frontA }, legN: { ank: [200, ANK] } }, hands(-30)),
      step: Object.assign({ hip: [bent ? 178 : 160, bent ? 232 : 238], trunk: bent ? 6 : 12, legF: { ank: frontA }, legN: { ank: [backX, ANK] } }, hands(-10)),
      lean: Object.assign(bent ? { hip: [180, 254], trunk: 6, legF: { ank: frontA }, legN: { ank: [backX, ANK], kneeBack: 0 } } : { hip: [176, 240], trunk: 20, legF: { ank: frontA }, legN: { ank: [backX, ANK] } }, hands(0))
    };
    define(id, Object.assign(S(), {
      tempo, poses, start: 'stand',
      seq: [{ to: 'step', d: 1.2, k: 'op', l: 'Fod bagud', count: false, arc: { legN: 20 } }, { to: 'lean', d: 1.5, k: 'op', l: bent ? 'Bøj knæene' : 'Læn frem', count: false }, { d: 30, k: 'hold', l: 'Hold' },
        { to: 'step', d: 1.5, k: 'ned', l: 'Slip', count: false }, { to: 'stand', d: 1.2, k: 'ned', l: 'Fod frem', count: false, arc: { legN: 18 } }, { d: 0.8, k: 'pause', l: 'Hvil', count: false }],
      still: 12, ghost: 'stand',
      figOpt: (P, c) => ({ bare: true, tenseCalf: c.key === 'hold' ? 'N' : null }),
      back: () => R.wall(wall + 6, 320, 0, FLOOR)
    }));
  }
  calf('hael-1-laeg-straek-strakt', false, 'Stort skridt bagud · bøj det forreste knæ, og skub hoften frem · hold 30 sek. Bagerste knæ strakt, hælen i gulvet.');
  calf('hael-1-laeg-straek-boejet', true, 'Lille skridt bagud · bøj begge knæ, hælen bliver i gulvet · hold 30 sek. Strækket mærkes dybt nede ved hælen.');

  // 5) Pres foden mod væggen (isometrisk), siddende med strakte ben
  (() => {
    const fl = 262, mat = fl - 4, hip = [128, mat - 15], th = 89;
    const legEnd = FF.add(hip, FF.mul(FF.dirA(th), 178)), wall = legEnd[0] + 16.5;
    const P = pf => ({ hip, trunk: -18, legF: { th: th + 1, kn: 0, pf: pf - 2 }, legN: { th, kn: 0, pf }, armF: { hand: [hip[0] - 46, mat - 4] }, armN: { hand: [hip[0] - 40, mat - 3] } });
    define('hael-1-isometrisk-pres', Object.assign(S(440, 290), {
      floor: fl, vb: [0, 38, 440, 252],
      tempo: 'Pres forfoden mod væggen med ca. halv kraft – foden flytter sig ikke · hold 30–45 sek. · slap af. 1 minuts pause mellem gentagelserne.',
      poses: { a: P(0), b: P(3) }, start: 'a',
      seq: [{ to: 'b', d: 1, k: 'op', l: 'Pres', count: false }, { d: 30, k: 'hold', l: 'Hold' }, { to: 'a', d: 1.5, k: 'ned', l: 'Slap af', count: false }, { d: 2.5, k: 'pause', l: 'Pause', count: false }],
      still: 10, ghost: null,
      figOpt: (P, c) => ({ bare: true, tenseCalf: c.key === 'hold' || c.key === 'op' ? 'N' : null }),
      back: () => R.wall(wall, 440, 0, fl),
      under: () => R.mat(30, wall, mat + 4),
      over: (P, J, c) => {
        if (c.key !== 'hold' && c.key !== 'op') return '';
        const y = J.legs.N.ank[1] - 30, pulse = 3 * Math.sin((c.x || 0) * 5);
        return R.arrow([wall - 40 + pulse, y], [wall - 6 + pulse * 0.3, y]) + R.arrow([wall - 40 + pulse, y + 14], [wall - 6 + pulse * 0.3, y + 14]);
      }
    }));
  })();

  // 6) Krøl håndklædet med tæerne (nærbillede)
  (() => {
    const fl = 205, ank = [104, fl - 16 * K - 4];
    const poses = { r: { toe: 0, pull: 0 } }, seq = [];
    for (let i = 1; i <= 4; i++) {
      poses['e' + i] = { toe: -24, pull: (i - 1) * 16 }; poses['c' + i] = { toe: 52, pull: i * 16 };
      seq.push({ to: 'e' + i, d: 0.8, k: 'op', l: 'Spred og ræk ud', count: false }, { to: 'c' + i, d: 1, k: 'ned', l: 'Krøl', count: false });
    }
    seq.push({ to: 'r', d: 1.6, k: 'pause', l: 'Glat ud', count: false });
    define('hael-2-haandklaede-kroel', Object.assign(CLOSE(230), {
      tempo: 'Ræk tæerne frem og spred dem · krøl dem og træk håndklædet ind under foden (ca. 1 sek. hver). Hælen bliver i gulvet. 10–15 gange.',
      repLabel: 'Runde', poses, start: 'r', seq, still: 6.5, ghost: null,
      draw: P => {
        let g = bg2(320, 230, fl);
        const off = P.pull % 18, bunch = Math.min(24, P.pull * 0.38);
        g += '<rect x="20" y="' + (fl - 8) + '" width="300" height="9" rx="3" fill="' + C.towel + '"/>';
        for (let x = 30 - off + 18; x < 320; x += 18) g += '<rect x="' + FF.f1(x) + '" y="' + (fl - 8) + '" width="3" height="9" fill="' + C.towelMid + '"/>';
        g += shinK(ank, [ank[0] - 10, -20], 0.6) + footK(ank, 0, P.toe);
        if (bunch > 0.5) { // håndklædet samles i folder under svangen
          const x0 = 112, w = 74; // folderne bliver synlige ved svangen (indersiden af foden)
          g += '<path fill="' + C.towelMid + '" stroke="' + C.towelDark + '" stroke-width="1.2" d="M' + x0 + ',' + (fl - 4) + ' C' + (x0 + 6) + ',' + FF.f1(fl - 4 - bunch) + ' ' + (x0 + 20) + ',' + FF.f1(fl - 4 - bunch) + ' ' + (x0 + 26) + ',' + (fl - 6) +
            ' C' + (x0 + 32) + ',' + FF.f1(fl - 4 - bunch * 0.9) + ' ' + (x0 + 46) + ',' + FF.f1(fl - 4 - bunch * 0.9) + ' ' + (x0 + 52) + ',' + (fl - 6) + ' C' + (x0 + 58) + ',' + FF.f1(fl - 4 - bunch * 0.5) + ' ' + (x0 + 66) + ',' + FF.f1(fl - 4 - bunch * 0.5) + ' ' + (x0 + w) + ',' + (fl - 4) + ' Z"/>';
        }
        return g;
      }
    }));
  })();

  // 7) Hæløft på begge ben (gulv), hænderne let mod væggen: 3 op · hold 2 · 3 ned
  (() => {
    const wall = 252, bx = 214;
    const P = fa => { const a = onBallBare(bx, fa), b = onBallBare(bx - 6, fa); return { hip: [a[0] + 4, a[1] - 176], trunk: 3, legF: { ank: b, fa, toe: -fa }, legN: { ank: a, fa, toe: -fa }, armF: { hand: [wall - 4, 196 - (ANK - a[1])] }, armN: { hand: [wall - 2, 202 - (ANK - a[1])] } }; };
    define('hael-2-haeloeft-begge', Object.assign(S(), {
      tempo: '3 sek. op · hold 2 sek. · 3 sek. ned. Så højt du kan, og helt ned til gulvet igen.',
      poses: { down: P(0), up: P(40) }, start: 'down',
      seq: [{ to: 'up', d: 3, k: 'op', l: 'Op' }, { d: 2, k: 'hold', l: 'Hold' }, { to: 'down', d: 3, k: 'ned', l: 'Ned' }, { d: 1, k: 'pause', l: 'Hvil', count: false }],
      still: 4, ghost: 'down',
      figOpt: () => ({ bare: true }),
      back: () => R.wall(wall + 6, 320, 0, FLOOR)
    }));
  })();

  // 8) Små hop på stedet (med sko)
  (() => {
    const bx = 196;
    const P = (fa, lift, bend) => { const a = sub(onBall(bx, fa), [0, lift]), b = sub(onBall(bx - 6, fa), [0, lift]); return { hip: [a[0] + 2, a[1] - 177 + bend], trunk: 3, legF: { ank: b, fa }, legN: { ank: a, fa }, armF: { sa: 12, ef: 50, rel: 1 }, armN: { sa: 8, ef: 54, rel: 1 } }; };
    define('hael-4-smaa-hop', Object.assign(S(), {
      tempo: 'Små, rytmiske hop på forfødderne (ca. 2 hop i sekundet). Knæene næsten strakte, land blødt. 10–20 hop pr. sæt.',
      repLabel: 'Hop', poses: { land: P(14, 0, 4), air: P(26, 16, 0) }, start: 'land',
      seq: [{ to: 'air', d: 0.24, k: 'op', l: 'Hop', count: false }, { to: 'land', d: 0.24, k: 'ned', l: 'Hop', count: false }, { d: 0.06, k: 'ned', l: 'Hop', count: false }],
      still: 0.23, ghost: 'land', shots: [0, 0.12, 0.23, 0.36],
      under: (P, J) => { const h = Math.max(0, ANK - 4 - J.legs.N.ank[1]); return '<ellipse cx="' + (bx + 10) + '" cy="' + (FLOOR + 2) + '" rx="' + FF.f1(46 - h * 0.9) + '" ry="5" fill="#9fb0ab" opacity="' + FF.f1(0.6 - h * 0.012) + '"/>'; }
    }));
  })();
})();
