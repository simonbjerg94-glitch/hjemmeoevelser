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
  const handsAt = x => () => ({ armF: { hand: [x - 4, G - 5], elbowFwd: 1 }, armN: { hand: [x, G - 5], elbowFwd: 1 } });

  // Armstrækninger på knæene
  (() => {
    const K = [150, G - 9], A = [64, G - 16], HX = 316;
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
