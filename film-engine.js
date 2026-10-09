/* Figur-animationsmotor til tempo-film (flad vektor, ingen video, ingen internet).
   Samme figur som i haeloeft-figur.js: kvinde ~60 år, grå hår, petrol t-shirt, grå bukser, hvide sko.
   En film = nogle navngivne stillinger (poses) + en sekvens (tempo) + rekvisitter. Ledene beregnes med
   simpel kinematik: hofte → knæ → ankel (IK, så fødderne står fast), skulder → albue → hånd.
   Set fra siden vender figuren mod højre (+x). Vinkler for lemmer: 0 = lodret ned, + = fremad. */
'use strict';
const FigFilm = (() => {
  const C = { bg: '#eef1f0', floor: '#cfd8d5', floorLine: '#b7c2be',
    skin: '#e2b592', skinMid: '#d6a782', skinDark: '#c08b66', nail: '#f7e1d2',
    teal: '#2f8a86', tealDark: '#256f6c', tealFar: '#24706d', pants: '#5b636d', pantsDark: '#474e57', cuff: '#3b4149',
    hair: '#b4b9be', hairDark: '#8d9399', shoe: '#f4f5f6', shoeMid: '#dfe3e6', sole: '#b9c0c6', shoeFar: '#d5dadd',
    wood: '#8a6a4f', woodDark: '#6f5440', woodLight: '#a3825f', step: '#c4ccd2', stepTop: '#98a3ab',
    counter: '#dfe4e2', counterTop: '#b89c78', counterLine: '#c3cbc8', mat: '#9cc7c1', matDark: '#7fb0a9',
    towel: '#a9cde0', towelMid: '#8db8cf', towelDark: '#5f93ad', band: '#e0584f', bandDark: '#b8433c',
    wall: '#dde3e1', wallLine: '#c4ccc9', stick: '#b5895a', guide: '#2f6f6a', accent: '#f2b544', ball: '#c9e265', ballDark: '#a8c24a', bottle: '#bfe3ef' };
  const L = { shank: 90, thigh: 88, trunk: 100, up: 58, fore: 54, ankH: 15 };
  const rad = d => d * Math.PI / 180, deg = r => r * 180 / Math.PI;
  const rot = (p, d) => { const r = rad(d), c = Math.cos(r), s = Math.sin(r); return [p[0] * c - p[1] * s, p[0] * s + p[1] * c]; };
  const add = (a, b) => [a[0] + b[0], a[1] + b[1]], sub = (a, b) => [a[0] - b[0], a[1] - b[1]], mul = (a, k) => [a[0] * k, a[1] * k];
  const lerp = (a, b, k) => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k];
  const len = a => Math.hypot(a[0], a[1]);
  const dirA = a => [Math.sin(rad(a)), Math.cos(rad(a))];          // lem-vinkel → enhedsvektor (0 = ned, + = frem/højre)
  const f1 = n => (Math.round(n * 10) / 10).toString();
  const P2 = p => f1(p[0]) + ',' + f1(p[1]);

  /* ---------- tegne-hjælpere ---------- */
  function limb(p1, p2, w1, w2, col, extra) {
    const d = sub(p2, p1), Ln = len(d) || 1, n = [-d[1] / Ln, d[0] / Ln];
    return '<path fill="' + col + '"' + (extra || '') + ' d="M' + P2(add(p1, mul(n, w1 / 2))) + ' L' + P2(add(p2, mul(n, w2 / 2))) + ' L' + P2(sub(p2, mul(n, w2 / 2))) + ' L' + P2(sub(p1, mul(n, w1 / 2))) + 'Z"/>' +
      '<circle cx="' + f1(p1[0]) + '" cy="' + f1(p1[1]) + '" r="' + f1(w1 / 2) + '" fill="' + col + '"/><circle cx="' + f1(p2[0]) + '" cy="' + f1(p2[1]) + '" r="' + f1(w2 / 2) + '" fill="' + col + '"/>';
  }
  function band(p1, p2, w, col) {
    const d = sub(p2, p1), Ln = len(d) || 1, n = [-d[1] / Ln * w / 2, d[0] / Ln * w / 2];
    return '<path fill="' + col + '" d="M' + P2(add(p1, n)) + ' L' + P2(add(p2, n)) + ' L' + P2(sub(p2, n)) + ' L' + P2(sub(p1, n)) + 'Z"/>';
  }
  function ik(a, b, l1, l2, side) { // side = +1: albue/knæ på venstre side af a→b (skærm), -1: højre
    const d = sub(b, a), D = Math.max(1e-3, Math.min(len(d), l1 + l2 - 0.01));
    const base = Math.atan2(d[1], d[0]), cosA = (l1 * l1 + D * D - l2 * l2) / (2 * l1 * D), A = Math.acos(Math.max(-1, Math.min(1, cosA)));
    const r = base - side * A; return [a[0] + l1 * Math.cos(r), a[1] + l1 * Math.sin(r)];
  }
  const tg = (p, a, inner) => '<g transform="translate(' + P2(p) + ')' + (a ? ' rotate(' + f1(a) + ')' : '') + '">' + inner + '</g>';

  /* Sko set fra siden (anklen i 0,0, tæerne mod +x). */
  function shoeSide(far) {
    const up = far ? C.shoeFar : C.shoe, mid = far ? '#c6cdd1' : C.shoeMid;
    return '<path fill="' + up + '" stroke="#b3bcc3" stroke-width="1.2" d="M-14,-6 C-15,4 -15,12 -13,15 L38,15 C44,15 45,10 41,7 C35,3 26,1 18,-2 C12,-5 9,-11 4,-11 L-9,-11 Z"/>' +
      '<path fill="' + mid + '" d="M18,-2 C24,0 30,2 36,5 L34,8 C28,6 22,4 16,2 Z"/>' +
      '<rect x="-15" y="12.5" width="58" height="4" rx="2" fill="' + (far ? '#a9b1b7' : C.sole) + '"/>';
  }
  /* Bar fod set fra siden (anklen i 0,0). toe = tæernes vinkel i forhold til foden (− = bøjet op). */
  function footSide(far, toe, extra, arch) {
    const s = far ? C.skinMid : C.skin, m = far ? C.skinDark : C.skinMid, dk = far ? '#a87956' : C.skinDark;
    return '<path fill="' + s + '" d="M-6,-12 C-8,-4 -14,2 -14.5,8 C-15,13 -12,16 -7,16 C0,16.2 8,15.4 16,15 C22,14.8 26,15.6 30,15.6 C33,15.6 34.5,13 34,10 L32.5,6.5 C24,5 14,2 7,-4 C4,-7 3,-10 3,-12 Z"/>' +
      '<path fill="' + m + '" d="M-5,15.4 C2,15.6 8,14.6 13,13.4 C18,12.2 23,13.8 28,15 C23,11.2 16,9.6 10,10.2 C3,11 -2,13 -5,15.4 Z"/>' +
      '<ellipse cx="0" cy="0" rx="3.6" ry="3.2" fill="' + dk + '" opacity=".5"/>' +
      '<g transform="translate(30,11) rotate(' + f1(toe || 0) + ')"><path fill="' + s + '" d="M-3,-4 L8,-3.4 C11.5,-3.2 12.6,-0.6 12.2,1.4 C11.8,3.6 10,4.6 7.5,4.6 L-3,4.6 Z"/>' +
      '<path fill="' + C.nail + '" d="M7.6,-3.3 C10,-3.1 11.8,-2 12.2,-0.4 L8,-0.4 Z"/>' + (extra || '') + '</g>' + (arch || '');
  }
  /* Sko/fod set forfra eller bagfra (anklen i 0,0). */
  function shoeFront(back, bare, side) {
    if (bare) return '<path fill="' + C.skin + '" d="M-8,-8 L8,-8 C10,2 13,10 12,15 L-12,15 C-13,10 -10,2 -8,-8 Z"/>';
    if (back) return '<path fill="' + C.shoe + '" stroke="#b3bcc3" stroke-width="1.2" d="M-10,-5 C-11,4 -12,10 -11,14 L11,14 C12,10 11,4 10,-5 Z"/><rect x="-12" y="12" width="24" height="4.5" rx="2" fill="' + C.sole + '"/><path fill="' + C.shoeMid + '" d="M-4,-4 L4,-4 L3,6 L-3,6 Z"/>';
    return '<path fill="' + C.shoe + '" stroke="#b3bcc3" stroke-width="1.2" d="M-10,-6 C-11,2 -13,8 -13,13 C-13,16 13,16 13,13 C13,8 11,2 10,-6 Z"/><rect x="-13.5" y="13" width="27" height="4" rx="2" fill="' + C.sole + '"/>' +
      '<path fill="' + C.shoeMid + '" d="M-5,0 L5,0 L6,8 L-6,8 Z"/><path stroke="' + C.sole + '" stroke-width="1" d="M-4,3 L4,3 M-4.5,5.5 L4.5,5.5"/>';
  }
  /* Hoved set fra siden (fra haeloeft-figur.js). */
  function headSide() {
    return '<path fill="' + C.skin + '" d="M-13,-6 C-13,-20 0,-25 10,-20 C17,-16 19,-8 18,-2 L22,4 C22,6 20,7 18,7 C18,12 16,17 10,19 C2,22 -8,18 -12,10 Z"/>' +
      '<circle cx="11" cy="-3" r="1.4" fill="#3b3f45"/><path fill="none" stroke="' + C.skinDark + '" stroke-width="1.2" stroke-linecap="round" d="M12,11 q3,1.5 5,0"/>' +
      '<path fill="' + C.hair + '" d="M-17,6 C-22,-12 -12,-28 4,-27 C16,-26 22,-18 20,-8 C15,-14 8,-16 2,-14 C0,-6 -3,2 -6,12 C-10,14 -15,12 -17,6 Z"/>' +
      '<path fill="none" stroke="' + C.hairDark + '" stroke-width="1.3" opacity=".8" d="M-12,-14 C-6,-22 6,-24 14,-18 M-14,0 C-12,-8 -8,-12 -2,-14"/>' +
      '<ellipse cx="-2" cy="2" rx="3.5" ry="5" fill="' + C.skinDark + '" opacity=".5"/>';
  }
  function headFront(back, turn) {
    if (turn && !back) { // hovedet drejet: ansigtet flyttes mod den side, man kigger til (−1 … 1)
      const tx = turn * 11, e = turn * 2.5;
      return '<ellipse cx="0" cy="1" rx="' + f1(16 - Math.abs(turn) * 1.5) + '" ry="20" fill="' + C.skin + '"/>' +
        '<ellipse cx="' + f1(-turn * 15) + '" cy="3" rx="' + f1(2 + Math.abs(turn) * 2.5) + '" ry="5" fill="' + C.skinDark + '" opacity=".55"/>' +
        '<path fill="' + C.hair + '" d="M-20,10 C-25,-12 -13,-27 0,-27 C13,-27 25,-12 20,10 C18,4 17,-4 15,-9 C8,-14 -2,-15 -10,-11 C-14,-6 -17,2 -20,10 Z" transform="translate(' + f1(-turn * 3) + ',0)"/>' +
        '<circle cx="' + f1(-6 + tx - e) + '" cy="0" r="1.5" fill="#3b3f45"/><circle cx="' + f1(6 + tx + e * 0.3) + '" cy="0" r="1.5" fill="#3b3f45"/>' +
        '<path fill="none" stroke="' + C.skinDark + '" stroke-width="1.3" stroke-linecap="round" d="M' + f1(-4 + tx) + ',10 q4,2.5 8,0 M' + f1(tx) + ',2 L' + f1(tx + turn * 4 - 1.5) + ',6.5 L' + f1(tx + 1) + ',6.8"/>';
    }
    if (back) return '<ellipse cx="0" cy="0" rx="17" ry="21" fill="' + C.skin + '"/><path fill="' + C.hair + '" d="M-20,8 C-24,-14 -12,-27 0,-27 C12,-27 24,-14 20,8 C16,14 10,16 0,16 C-10,16 -16,14 -20,8 Z"/>' +
      '<path fill="none" stroke="' + C.hairDark + '" stroke-width="1.3" opacity=".7" d="M-10,-20 C-6,-8 -8,4 -12,12 M8,-21 C6,-8 9,4 12,12 M0,-26 L0,14"/>';
    return '<ellipse cx="0" cy="1" rx="16" ry="20" fill="' + C.skin + '"/>' +
      '<path fill="' + C.hair + '" d="M-20,10 C-25,-12 -13,-27 0,-27 C13,-27 25,-12 20,10 C18,4 17,-4 15,-9 C8,-14 -2,-15 -10,-11 C-14,-6 -17,2 -20,10 Z"/>' +
      '<circle cx="-6" cy="0" r="1.5" fill="#3b3f45"/><circle cx="6" cy="0" r="1.5" fill="#3b3f45"/>' +
      '<path fill="none" stroke="' + C.skinDark + '" stroke-width="1.3" stroke-linecap="round" d="M-4,10 q4,2.5 8,0 M0,2 L-1.5,6.5 L1,6.8"/>';
  }
  function hand(p, far) { return '<circle cx="' + f1(p[0]) + '" cy="' + f1(p[1]) + '" r="6.2" fill="' + (far ? C.skinMid : C.skin) + '"/>'; }

  /* ---------- figur set fra siden ---------- */
  function sideJoints(P) {
    const H = P.hip, a = P.trunkTo ? deg(Math.atan2(P.trunkTo[0] - H[0], -(P.trunkTo[1] - H[1]))) : (P.trunk || 0);
    const u = [Math.sin(rad(a)), -Math.cos(rad(a))], n = [Math.cos(rad(a)), Math.sin(rad(a))];
    const cv = P.curve || 0; // + = rund ryg (bue bagud), − = svaj/stræk (bue fremad); hofte og skuldre ligger fast
    const W = (x, y) => add(H, add(mul(n, x - cv * Math.sin(Math.PI * Math.max(0, Math.min(1, y / L.trunk)))), mul(u, y)));
    const sh = P.shrug || [0, 0];
    const S = add(W(1, L.trunk), add(mul(n, sh[0]), mul(u, sh[1])));
    const J = { H, a, u, n, W, S, legs: {}, arms: {} };
    for (const k of ['F', 'N']) {
      const s = P['leg' + k] || {};
      let knee, ank, fa;
      const Hk = P['hipOff' + k] ? add(H, P['hipOff' + k]) : H;
      if (s.knee && s.ank) { knee = s.knee; ank = s.ank; fa = s.fa || 0; }
      else if (s.ank) { ank = s.ank; knee = ik(Hk, ank, L.thigh, L.shank, s.kneeBack ? -1 : 1); fa = s.fa || 0; }
      else { const th = s.th || 0, kn = s.kn || 0; knee = add(Hk, mul(dirA(th), L.thigh)); ank = add(knee, mul(dirA(th - kn), L.shank)); fa = (s.pf || 0) - (th - kn); if (s.fa != null) fa = s.fa; }
      J.legs[k] = { hip: Hk, knee, ank, fa, toe: s.toe || 0, lift: s };
    }
    for (const k of ['F', 'N']) {
      const s = P['arm' + k] || {};
      let el, hd;
      if (s.hand && s.el) { hd = s.hand; el = s.el; }
      else if (s.hand && s.straight) { hd = s.hand; el = lerp(S, hd, L.up / (L.up + L.fore)); }
      else if (s.hand) { hd = s.hand; el = ik(S, hd, L.up, L.fore, s.elbowFwd ? 1 : -1); }
      else { const sa = (s.sa != null ? s.sa : 4) + (s.rel ? a : 0), ef = s.ef != null ? s.ef : 8; el = add(S, mul(dirA(sa), L.up)); hd = add(el, mul(dirA(sa + ef), L.fore)); }
      J.arms[k] = { el, hd };
    }
    return J;
  }
  function sideFig(P, o) {
    o = o || {};
    const J = sideJoints(P), bare = !!o.bare;
    let s = '';
    const leg = (k, far) => {
      const g = J.legs[k], pc = far ? C.pantsDark : C.pants;
      let r = '';
      const cuffK = bare ? 0.74 : 0.9, cuff = lerp(g.knee, g.ank, cuffK);
      if (bare) r += limb(lerp(g.knee, g.ank, 0.7), g.ank, 13, 11, far ? C.skinMid : C.skin);
      r += tg(g.ank, g.fa, bare ? footSide(far, g.toe) : shoeSide(far));
      r += limb(g.hip, g.knee, far ? 32 : 33, 25, pc) + limb(g.knee, cuff, 25, bare ? 20 : 19, pc);
      r += band(lerp(g.knee, g.ank, cuffK - 0.05), cuff, bare ? 21 : 20, far ? '#363c43' : C.cuff);
      if (o.tenseCalf === k) { const d = sub(g.ank, g.knee), bn = mul(rot(mul(d, 1 / (len(d) || 1)), 90), 7); r += '<path fill="none" stroke="' + C.accent + '" stroke-width="3" stroke-linecap="round" d="M' + P2(add(lerp(g.knee, g.ank, 0.2), bn)) + ' Q' + P2(add(lerp(g.knee, g.ank, 0.4), mul(bn, 1.25))) + ' ' + P2(add(lerp(g.knee, g.ank, 0.62), mul(bn, 0.8))) + '"/>'; }
      if (o.tense === k) r += '<path fill="none" stroke="#7e8792" stroke-width="2.4" stroke-linecap="round" opacity=".9" d="M' + P2(lerp(J.H, g.knee, 0.3)) + ' Q' + P2(add(lerp(J.H, g.knee, 0.6), mul(J.n, -0))) + ' ' + P2(lerp(J.H, g.knee, 0.85)) + '"/>';
      return r;
    };
    const arm = (k, far) => {
      const g = J.arms[k], sk = far ? C.skinMid : C.skin;
      let r = limb(J.S, g.el, 15, 12, sk) + limb(g.el, g.hd, 12, 9.5, sk) + hand(g.hd, far);
      const sl = lerp(J.S, g.el, 0.5);
      r += limb(add(J.S, mul(J.u, 3)), sl, 22, 17, far ? C.tealFar : C.tealDark);
      return r;
    };
    s += arm('F', true) + leg('F', true);
    if (o.behindTorso) s += o.behindTorso(J);
    // overkrop: bukser + t-shirt
    const W = J.W;
    s += '<path fill="' + C.pants + '" d="M' + P2(W(-15, 22)) + ' C' + P2(W(-21, 10)) + ' ' + P2(W(-22, -6)) + ' ' + P2(W(-14, -14)) + ' L' + P2(W(12, -12)) + ' C' + P2(W(17, -6)) + ' ' + P2(W(16, 10)) + ' ' + P2(W(14, 22)) + ' Z"/>';
    s += '<path fill="' + C.teal + '" d="M' + P2(W(-16, 16)) + ' C' + P2(W(-19, 40)) + ' ' + P2(W(-19, 70)) + ' ' + P2(W(-14, 96)) + ' C' + P2(W(-10, 104)) + ' ' + P2(W(6, 107)) + ' ' + P2(W(12, 99)) +
      ' C' + P2(W(18, 88)) + ' ' + P2(W(21, 66)) + ' ' + P2(W(17, 52)) + ' C' + P2(W(16, 40)) + ' ' + P2(W(15, 28)) + ' ' + P2(W(15, 16)) + ' Z"/>';
    s += leg('N', false);
    if (o.overLegs) s += o.overLegs(J);
    // hals + hoved
    const ch = P.chin || 0, hu = P.headUp || 0; // hagen trukket tilbage (px) / hovedet løftet (px)
    const neck0 = W(2, L.trunk - 4), neck1 = add(W(3 - ch * 0.7, L.trunk + 12), mul(J.u, hu * 0.5));
    s += limb(neck0, neck1, 13, 12, C.skin);
    J.head = add(W(5 - ch, L.trunk + 32), mul(J.u, hu)); J.headA = J.a + (P.nod || 0);
    s += tg(J.head, J.headA, headSide());
    s += arm('N', false);
    if (o.front) s += o.front(J);
    return { svg: s, J };
  }

  /* ---------- figur set forfra / bagfra ---------- */
  function frontJoints(P) {
    const H = P.hip, a = P.tilt || 0, u = rot([0, -1], a), n = rot([1, 0], a);
    const W = (x, y) => add(H, add(mul(n, x), mul(u, y)));
    const J = { H, a, u, n, W, legs: {}, arms: {} };
    // R = personens højre ben (til venstre i billedet set forfra), L = venstre
    for (const k of ['R', 'L']) {
      const sx = (k === 'R' ? -1 : 1) * (P.back ? -1 : 1), hj = W(sx * 13, -4), s = P['leg' + k] || {};
      if (s.knee) { J.legs[k] = { hj, knee: s.knee, ank: s.ank || s.knee, sx, kneeOnly: !s.ank, foot: s.foot }; continue; }
      let ank = s.ank;
      if (!ank) { const ab = (s.ab || 0) * sx; ank = add(hj, mul(dirA(ab + a), L.thigh + L.shank)); }
      const d = sub(ank, hj), D = len(d), full = L.thigh + L.shank;
      let knee = lerp(hj, ank, L.thigh / full);
      if (D < full - 0.5) { const bulge = Math.sqrt(Math.max(0, L.thigh * L.thigh - (D * L.thigh / full) ** 2)) * 0.35; knee = add(knee, mul([d[1] / D * -sx, -d[0] / D * -sx], -bulge)); }
      J.legs[k] = { hj, knee, ank, sx, foot: s.foot };
    }
    J.S = {};
    for (const k of ['R', 'L']) {
      const sx = (k === 'R' ? -1 : 1) * (P.back ? -1 : 1), S = W(sx * 21, L.trunk - 6), s = P['arm' + k] || {};
      let el, hd;
      if (s.hand && s.el) { hd = s.hand; el = s.el; }
      else if (s.hand) { hd = s.hand; const e0 = ik(S, hd, L.up, L.fore, s.side || (sx > 0 ? 1 : -1)), base = lerp(S, hd, L.up / (L.up + L.fore)); el = add(base, mul(sub(e0, base), s.flat != null ? s.flat : 0.3)); } // albuen bøjer bagud (i dybden) – vises forkortet
      else { const ab = (s.ab != null ? s.ab : 8) * sx; el = add(S, mul(dirA(ab + a), L.up)); hd = add(el, mul(dirA(ab * 0.6 + a), L.fore)); }
      J.arms[k] = { S, el, hd };
    }
    return J;
  }
  function frontFig(P, o) {
    o = o || {};
    const J = frontJoints(P), back = !!P.back, W = J.W;
    let s = '';
    const leg = k => {
      const g = J.legs[k];
      let r = '';
      if (g.kneeOnly) return limb(g.hj, g.knee, 30, 25, C.pants) + '<circle cx="' + f1(g.knee[0]) + '" cy="' + f1(g.knee[1]) + '" r="12.5" fill="' + C.pantsDark + '"/>';
      const cuff = lerp(g.knee, g.ank, 0.9);
      r += tg(g.ank, 0, shoeFront(back, o.bare));
      r += limb(g.hj, g.knee, 30, 23, C.pants) + limb(g.knee, cuff, 23, 18, C.pants) + band(lerp(g.knee, g.ank, 0.85), cuff, 19, C.cuff);
      return r;
    };
    const arm = k => {
      const g = J.arms[k];
      return limb(g.S, g.el, 15, 12, C.skin) + limb(g.el, g.hd, 12, 9.5, C.skin) + hand(g.hd) + limb(g.S, lerp(g.S, g.el, 0.48), 22, 18, C.tealDark);
    };
    s += leg('R') + leg('L');
    if (o.overLegs) s += o.overLegs(J);
    s += '<path fill="' + C.pants + '" d="M' + P2(W(-24, 20)) + ' L' + P2(W(24, 20)) + ' C' + P2(W(27, 6)) + ' ' + P2(W(27, -6)) + ' ' + P2(W(24, -12)) + ' L' + P2(W(3, -12)) + ' L' + P2(W(0, -6)) + ' L' + P2(W(-3, -12)) + ' L' + P2(W(-24, -12)) + ' C' + P2(W(-27, -6)) + ' ' + P2(W(-27, 6)) + ' ' + P2(W(-24, 20)) + ' Z"/>';
    const bw = 1 + (P.breath || 0) * 0.1, Wb = (x, y) => W(x * (y > 25 && y < 95 ? 1 + (bw - 1) * Math.sin(Math.PI * (y - 25) / 70) : 1), y); // vejrtrækning: ribbenene udvider sig
    s += '<path fill="' + C.teal + '" d="M' + P2(W(-24, 14)) + ' C' + P2(Wb(-22, 40)) + ' ' + P2(Wb(-25, 70)) + ' ' + P2(W(-27, 92)) + ' C' + P2(W(-24, 103)) + ' ' + P2(W(-12, 105)) + ' ' + P2(W(0, 105)) +
      ' C' + P2(W(12, 105)) + ' ' + P2(W(24, 103)) + ' ' + P2(W(27, 92)) + ' C' + P2(Wb(25, 70)) + ' ' + P2(Wb(22, 40)) + ' ' + P2(W(24, 14)) + ' Z"/>';
    if (o.blades) s += o.blades(J);
    if (!back) s += '<path fill="' + C.skin + '" d="M' + P2(W(-8, 104)) + ' Q' + P2(W(0, 94)) + ' ' + P2(W(8, 104)) + ' Z"/>';
    const ht = (P.headTilt || 0) * (back ? -1 : 1), nb = W(0, L.trunk - 2), hA = J.a + ht; // hovedet vippes om nakkens rod
    J.head = add(nb, rot([0, -34], hA)); J.headA = hA;
    s += limb(nb, add(nb, rot([0, -14], hA)), 13, 12, C.skin);
    s += tg(J.head, hA, headFront(back, P.headTurn || 0));
    s += arm('R') + arm('L');
    if (o.front) s += o.front(J);
    return { svg: s, J };
  }

  /* ---------- rekvisitter ---------- */
  const R = {
    floor: (W, H, y) => '<rect x="0" y="' + y + '" width="' + W + '" height="' + (H - y) + '" fill="' + C.floor + '"/><rect x="0" y="' + y + '" width="' + W + '" height="2" fill="' + C.floorLine + '"/>',
    chairSide(x0, x1, seat, floor, o) { // sædet fra x0 (bag) til x1 (for); ryglæn ved x0
      o = o || {};
      let s = '';
      const legW = 6;
      s += '<rect x="' + (x0 + 2) + '" y="' + seat + '" width="' + legW + '" height="' + (floor - seat) + '" fill="' + C.woodDark + '"/>';
      s += '<rect x="' + (x1 - legW - 2) + '" y="' + seat + '" width="' + legW + '" height="' + (floor - seat) + '" fill="' + C.woodDark + '"/>';
      s += '<rect x="' + (x0 + 4) + '" y="' + (floor - 34) + '" width="' + (x1 - x0 - 8) + '" height="5" fill="' + C.woodDark + '"/>';
      s += '<rect x="' + (x0 - 2) + '" y="' + (seat - (o.backH || 92)) + '" width="9" height="' + ((o.backH || 92) + 4) + '" rx="3" fill="' + C.wood + '"/>';
      s += '<rect x="' + (x0 - 2) + '" y="' + (seat - (o.backH || 92)) + '" width="9" height="24" rx="3" fill="' + C.woodLight + '"/>';
      s += '<rect x="' + (x0 - 2) + '" y="' + (seat - 4) + '" width="' + (x1 - x0 + 4) + '" height="9" rx="3" fill="' + C.wood + '"/>';
      if (o.arms) s += '<rect x="' + (x0 + 2) + '" y="' + (seat - 36) + '" width="' + (x1 - x0 - 4) + '" height="7" rx="3" fill="' + C.wood + '"/><rect x="' + (x1 - 12) + '" y="' + (seat - 36) + '" width="6" height="36" fill="' + C.wood + '"/>';
      return s;
    },
    chairArmFront(x0, x1, seat) { return '<rect x="' + (x0 + 2) + '" y="' + (seat - 36) + '" width="' + (x1 - x0 - 4) + '" height="7" rx="3" fill="' + C.wood + '"/><rect x="' + (x1 - 12) + '" y="' + (seat - 36) + '" width="6" height="36" fill="' + C.wood + '"/>'; },
    counterSide(x0, x1, top, floor) { // køkkenbord set fra siden (ender i x0)
      return '<rect x="' + x0 + '" y="' + top + '" width="' + (x1 - x0) + '" height="' + (floor - top) + '" fill="' + C.counter + '"/>' +
        '<rect x="' + (x0 + 6) + '" y="' + (floor - 12) + '" width="' + (x1 - x0 - 6) + '" height="12" fill="' + C.counterLine + '"/>' +
        '<rect x="' + (x0 - 6) + '" y="' + (top - 8) + '" width="' + (x1 - x0 + 6) + '" height="10" rx="2" fill="' + C.counterTop + '"/>';
    },
    counterBack(W, top, floor, h) { // køkkenbord i baggrunden (personen står langs eller foran det)
      let s = '<rect x="0" y="' + top + '" width="' + W + '" height="' + (floor - top) + '" fill="' + C.counter + '"/>';
      for (let x = 0; x < W; x += 80) s += '<rect x="' + (x + 4) + '" y="' + (top + 14) + '" width="72" height="' + (floor - top - 28) + '" rx="3" fill="none" stroke="' + C.counterLine + '" stroke-width="2"/><rect x="' + (x + 30) + '" y="' + (top + 22) + '" width="20" height="4" rx="2" fill="' + C.counterLine + '"/>';
      return s + '<rect x="0" y="' + (top - 9) + '" width="' + W + '" height="10" fill="' + C.counterTop + '"/>';
    },
    stepSide(x0, x1, top, floor) {
      return '<rect x="' + x0 + '" y="' + top + '" width="' + (x1 - x0) + '" height="' + (floor - top) + '" fill="' + C.step + '"/><rect x="' + x0 + '" y="' + top + '" width="' + (x1 - x0) + '" height="3" fill="' + C.stepTop + '"/><rect x="' + x0 + '" y="' + top + '" width="3" height="' + (floor - top) + '" fill="' + C.stepTop + '"/>';
    },
    rail(x0, y0, x1, y1, posts) {
      let s = '<line x1="' + x0 + '" y1="' + y0 + '" x2="' + x1 + '" y2="' + y1 + '" stroke="' + C.wood + '" stroke-width="7" stroke-linecap="round"/>';
      (posts || []).forEach(p => { s += '<line x1="' + p[0] + '" y1="' + p[1] + '" x2="' + p[0] + '" y2="' + p[2] + '" stroke="' + C.woodDark + '" stroke-width="5"/>'; });
      return s;
    },
    mat: (x0, x1, y) => '<rect x="' + x0 + '" y="' + (y - 6) + '" width="' + (x1 - x0) + '" height="8" rx="4" fill="' + C.mat + '"/><rect x="' + x0 + '" y="' + (y - 1) + '" width="' + (x1 - x0) + '" height="3" rx="1.5" fill="' + C.matDark + '"/>',
    towelRoll(c, r) {
      return '<circle cx="' + f1(c[0] + r * 0.9) + '" cy="' + f1(c[1] - r * 0.55) + '" r="' + r + '" fill="' + C.towelMid + '"/>' +
        '<path fill="' + C.towelMid + '" d="M' + P2([c[0], c[1] - r]) + ' L' + P2([c[0] + r * 0.9, c[1] - r * 1.55]) + ' L' + P2([c[0] + r * 0.9, c[1] + r * 0.45]) + ' L' + P2([c[0], c[1] + r]) + ' Z"/>' +
        '<circle cx="' + f1(c[0]) + '" cy="' + f1(c[1]) + '" r="' + r + '" fill="' + C.towel + '" stroke="' + C.towelDark + '" stroke-width="1"/>' +
        '<path fill="none" stroke="' + C.towelDark + '" stroke-width="1.1" stroke-linecap="round" d="M' + f1(c[0] + r * 0.12) + ',' + f1(c[1]) + ' a' + f1(r * 0.25) + ',' + f1(r * 0.25) + ' 0 1 0 ' + f1(-r * 0.25) + ',' + f1(r * 0.25) + ' a' + f1(r * 0.5) + ',' + f1(r * 0.5) + ' 0 1 0 ' + f1(r * 0.5) + ',' + f1(-r * 0.5) + ' a' + f1(r * 0.75) + ',' + f1(r * 0.75) + ' 0 1 0 ' + f1(-r * 0.75) + ',' + f1(r * 0.75) + '"/>';
    },
    wall: (x, W, top, floor) => '<rect x="' + x + '" y="' + top + '" width="' + (W - x) + '" height="' + (floor - top) + '" fill="' + C.wall + '"/><rect x="' + x + '" y="' + top + '" width="3" height="' + (floor - top) + '" fill="' + C.wallLine + '"/>',
    stick: (a, b) => '<line x1="' + f1(a[0]) + '" y1="' + f1(a[1]) + '" x2="' + f1(b[0]) + '" y2="' + f1(b[1]) + '" stroke="' + C.stick + '" stroke-width="6" stroke-linecap="round"/>',
    bandLine: (a, b) => '<path fill="none" stroke="' + C.band + '" stroke-width="5" stroke-linecap="round" d="M' + P2(a) + ' L' + P2(b) + '"/>',
    arrow(a, b, col) { // pil fra a til b
      const d = sub(b, a), Ln = len(d) || 1, u = mul(d, 1 / Ln), n = [-u[1], u[0]], tip = b, back = sub(b, mul(u, 11));
      return '<path fill="none" stroke="' + (col || C.guide) + '" stroke-width="4" stroke-linecap="round" d="M' + P2(a) + ' L' + P2(back) + '"/>' +
        '<path fill="' + (col || C.guide) + '" d="M' + P2(add(back, mul(n, 8))) + ' L' + P2(tip) + ' L' + P2(sub(back, mul(n, 8))) + ' Z"/>';
    }
  };

  /* ---------- tidslinje ---------- */
  const ease = u => u * u * (3 - 2 * u);
  function interp(a, b, k) {
    if (typeof a === 'number' && typeof b === 'number') return a + (b - a) * k;
    if (Array.isArray(a) && Array.isArray(b)) return a.map((v, i) => interp(v, b[i], k));
    if (a && b && typeof a === 'object' && typeof b === 'object') { const o = {}; for (const key of new Set([...Object.keys(a), ...Object.keys(b)])) o[key] = key in a && key in b ? interp(a[key], b[key], k) : (key in b ? b[key] : a[key]); return o; }
    return k < 0.5 ? a : b;
  }
  const FILMS = {};
  function cycleLen(F) { return F.seq.reduce((s, x) => s + x.d, 0); }
  /* Tilstand til tiden sec (sekunder siden start). Returnerer pose, fase-tekst, gentagelse. */
  function stateAt(F, sec) {
    const cyc = cycleLen(F), rep = Math.floor(sec / cyc) + 1, x = ((sec % cyc) + cyc) % cyc;
    let t = 0, i = 0, cur = F.seq[F.seq.length - 1].to || F.start;
    // find slutposen for sekvensen (startpose for første trin)
    let prevPose = F.start;
    for (const st of F.seq) if (st.to) prevPose = st.to;
    let from = prevPose;
    for (i = 0; i < F.seq.length; i++) {
      const st = F.seq[i];
      if (x < t + st.d || i === F.seq.length - 1) {
        const u = Math.max(0, Math.min(1, (x - t) / st.d));
        const target = st.to || from;
        const k = st.lin ? u : ease(u);
        let P = interp(F.poses[from], F.poses[target], k);
        // samlet nedtælling for trin med samme tekst
        let g0 = i, g1 = i;
        while (g0 > 0 && F.seq[g0 - 1].l === st.l) g0--;
        while (g1 < F.seq.length - 1 && F.seq[g1 + 1].l === st.l) g1++;
        let gEnd = 0; for (let j = 0; j <= g1; j++) gEnd += F.seq[j].d;
        const left = Math.max(1, Math.ceil(gEnd - x - 1e-6));
        const ctx = { x, u, k, i, key: st.k, rep, sec, from, to: target, step: st };
        if (st.arc) for (const leg in st.arc) { const g = P[leg]; if (g && g.ank) P[leg] = Object.assign({}, g, { ank: [g.ank[0], g.ank[1] - st.arc[leg] * Math.sin(Math.PI * k)] }); }
        if (F.mod) P = F.mod(P, ctx) || P;
        return { P, label: st.l + (st.count === false ? '' : ' · ' + left), key: st.k, rep, ctx, repText: (F.repLabel || 'Gentagelse') + ' ' + rep };
      }
      t += st.d; if (st.to) from = st.to;
    }
  }
  function frame(F, P, ctx, ghost) {
    const o = Object.assign({}, F.figOpt ? F.figOpt(P, ctx || {}) : {});
    const fig = F.view === 'custom' ? { svg: F.draw(P, ctx || {}), J: {} } : F.view === 'side' ? sideFig(P, o) : frontFig(P, o);
    return fig;
  }
  function svgFor(id, sec, opts) {
    const F = FILMS[id]; if (!F) return '';
    opts = opts || {};
    const still = sec == null;
    const st = stateAt(F, still ? F.still : sec);
    const ctx = st.ctx;
    const fig = frame(F, st.P, ctx);
    let s = '<rect width="' + F.W + '" height="' + F.H + '" fill="' + C.bg + '"/>';
    if (F.back) s += F.back(st.P, fig.J, ctx);
    s += R.floor(F.W, F.H, F.floor);
    if (F.under) s += F.under(st.P, fig.J, ctx);
    const rotg = x => F.rot ? '<g transform="rotate(' + F.rot[0] + ' ' + F.rot[1] + ' ' + F.rot[2] + ')">' + x + '</g>' : x;
    if (still && F.ghost) { let gp = JSON.parse(JSON.stringify(F.poses[F.ghost])); if (F.mod) gp = F.mod(gp, { key: 'ghost', u: 0, k: 0 }) || gp; const g = frame(F, gp, { key: 'ghost' }); s += '<g opacity=".28">' + rotg(g.svg) + '</g>'; }
    s += rotg(fig.svg);
    if (F.over) s += F.over(st.P, fig.J, ctx);
    if (still && F.stillArrow) s += F.stillArrow(st.P, fig.J);
    return '<svg class="ff-svg" viewBox="' + (F.vb || [0, 0, F.W, F.H]).join(' ') + '" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="' + (F.aria || 'Tegnet film af øvelsen') + '">' + s + '</svg>';
  }
  function define(id, F) { F.id = id; FILMS[id] = F; }
  return { footSide, shoeSide, C, L, R, rot, add, sub, mul, lerp, dirA, ik, sideFig, frontFig, sideJoints, frontJoints, define, FILMS, has: id => !!FILMS[id], svg: svgFor, state: (id, sec) => stateAt(FILMS[id], sec), cycleLen: id => cycleLen(FILMS[id]), headSide, P2, f1, limb };
})();
if (typeof module !== 'undefined') module.exports = FigFilm;

/* ---------- Film-kort på øvelsessiden (samme kort som tempo-filmen til hæløft) ---------- */
function figFilmHtml(e) {
  if (typeof FigFilm === 'undefined' || !FigFilm.has(e.id)) return '';
  if (typeof HAEL_TRIN_FILM !== 'undefined' && HAEL_TRIN_FILM[e.id]) return '';
  const F = FigFilm.FILMS[e.id];
  const still = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const vb = typeof Voice !== 'undefined' ? Voice.btnHtml() : '';
  return '<div class="card ht-film ff-film' + (F.W > F.H ? ' ff-land' : '') + '" data-ex="' + e.id + '" data-name="' + String(e.name || '').replace(/"/g, '&quot;') + '"><h3>🎬 Tempo-film</h3>' +
    '<div class="ht-stage ff-stage">' + FigFilm.svg(e.id, null) + '</div>' +
    (still ? '<p class="hint">Stillbillede (reduceret bevægelse er slået til). Den lyse figur viser startstillingen.</p>'
      : '<div class="ht-row"><button type="button" class="btn ht-play" aria-pressed="false">▶ Afspil filmen</button><span class="ht-phase" aria-live="off"></span><span class="ff-rep" aria-live="off"></span></div>' +
        '<p class="ff-say" hidden></p><div class="ff-tools">' + vb + '</div>') +
    '<p class="muted small ff-tempo">' + F.tempo + '</p></div>';
}
function initFigFilm(root) {
  const box = root.querySelector('.ff-film'); if (!box) return;
  const btn = box.querySelector('.ht-play'); if (!btn) return;
  const id = box.dataset.ex, stage = box.querySelector('.ht-stage'), ph = box.querySelector('.ht-phase'), rep = box.querySelector('.ff-rep');
  let raf = 0, t0 = 0, acc = 0, last = 0;
  const frame = now => {
    if (!box.isConnected) { cancelAnimationFrame(raf); if (typeof Voice !== 'undefined') Voice.cancel(); return; }
    const sec = acc + (now - t0) / 1000, st = FigFilm.state(id, sec);
    if (now - last > 33) { stage.innerHTML = FigFilm.svg(id, sec); last = now; }
    if (ph.textContent !== st.label) { ph.textContent = st.label; ph.dataset.key = st.key; if (typeof Voice !== 'undefined') Voice.cue(box, st.label, st.key); }
    if (rep.textContent !== st.repText) rep.textContent = st.repText;
    raf = requestAnimationFrame(frame);
  };
  let introDone = false;
  if (typeof Voice !== 'undefined') Voice.bind(box);
  btn.onclick = () => {
    const on = btn.getAttribute('aria-pressed') !== 'true';
    btn.setAttribute('aria-pressed', on); btn.textContent = on ? '⏸ Pause' : '▶ Afspil filmen';
    if (on) {
      const go = () => { if (btn.getAttribute('aria-pressed') !== 'true' || !box.isConnected) return; t0 = performance.now(); raf = requestAnimationFrame(frame); };
      if (!introDone && typeof Voice !== 'undefined' && Voice.enabled() && Voice.available()) { // kort introduktion, før tempoet starter
        introDone = true; ph.textContent = 'Lyt …';
        Voice.say((box.dataset.name ? box.dataset.name + '. ' : '') + FigFilm.FILMS[id].tempo.replace(/\s*\((Set [^)]*)\)/g, ''), box, { flush: true, intro: true, onend: go });
      } else { introDone = true; go(); }
    } else { cancelAnimationFrame(raf); acc += t0 ? (performance.now() - t0) / 1000 : 0; t0 = 0; if (typeof Voice !== 'undefined') Voice.reset(box); }
  };
}
