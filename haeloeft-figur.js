/* Tegnet figur til "Hæløft på trappetrin" (begge ben / ét ben med rygsæk). Set fra siden, flad vektorstil.
   Bruges både til billederne (tools/render_haeloeft.py) og til tempo-filmen på øvelsessiden.
   Anatomi: fodballen står på trinnets kant (kanten lige under fodballen), hælen hænger frit i luften bag kanten,
   bevægelsen sker i anklen, knæet er strakt, kroppen står lodret over fodballen (let fremad).
   Tæerne ligger strakt op over et sammenrullet håndklæde på kanten af trinnet ("windlass"). */
const HaelTrin = (() => {
  const C = { bg: '#eef1f0', floor: '#cfd8d5', step: '#c4ccd2', stepTop: '#98a3ab', stepNose: '#98a3ab',
    rail: '#8a6a4f', railDark: '#6f5440', skin: '#e2b592', skinMid: '#d6a782', skinDark: '#c08b66', nail: '#f7e1d2',
    teal: '#2f8a86', tealDark: '#256f6c', pants: '#5b636d', pantsDark: '#474e57', hair: '#b4b9be', hairDark: '#8d9399',
    towel: '#a9cde0', towelMid: '#8db8cf', towelDark: '#5f93ad', pack: '#34406b', packDark: '#263055', guide: '#2f6f6a', accent: '#f2b544' };
  const W = 300, H = 480, EDGE = 132, STEP = 404, FLOOR = 470;
  const MTP = [EDGE + 2, STEP];                 // fodballen (grundleddet) lige over trinnets kant
  const L_SHANK = 92, L_THIGH = 90, L_TRUNK = 108, L_UP = 60, L_FORE = 58;
  const ANK_L = [-30, -17];                      // anklen i fodens koordinater (fodballen i 0,0)
  const HEEL_L = [-40, 0];
  const TOWEL = [MTP[0] + 17.5, STEP - 6.5], TOWEL_R = 6.5;
  const TOE_ABS = -41;                           // tæernes vinkel (de ligger op over håndklædet)
  const ang = d => d * Math.PI / 180;
  const rot = (p, d) => { const r = ang(d), c = Math.cos(r), s = Math.sin(r); return [p[0] * c - p[1] * s, p[0] * s + p[1] * c]; };
  const add = (a, b) => [a[0] + b[0], a[1] + b[1]], sub = (a, b) => [a[0] - b[0], a[1] - b[1]];
  const lerp = (a, b, k) => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k];
  const f1 = n => n.toFixed(1);
  const footAngle = t => -10 + 50 * t;            // −10° (hælen lidt under trinnet) → +40° (stejlt på fodballen)
  function limb(p1, p2, w1, w2, col) {
    const dx = p2[0] - p1[0], dy = p2[1] - p1[1], L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L;
    return '<path fill="' + col + '" d="M' + f1(p1[0] + nx * w1 / 2) + ',' + f1(p1[1] + ny * w1 / 2) + ' L' + f1(p2[0] + nx * w2 / 2) + ',' + f1(p2[1] + ny * w2 / 2) +
      ' L' + f1(p2[0] - nx * w2 / 2) + ',' + f1(p2[1] - ny * w2 / 2) + ' L' + f1(p1[0] - nx * w1 / 2) + ',' + f1(p1[1] - ny * w1 / 2) + 'Z"/>' +
      '<circle cx="' + f1(p1[0]) + '" cy="' + f1(p1[1]) + '" r="' + f1(w1 / 2) + '" fill="' + col + '"/><circle cx="' + f1(p2[0]) + '" cy="' + f1(p2[1]) + '" r="' + f1(w2 / 2) + '" fill="' + col + '"/>';
  }
  function band(p1, p2, w, col) {
    const dx = p2[0] - p1[0], dy = p2[1] - p1[1], L = Math.hypot(dx, dy) || 1, nx = -dy / L * w / 2, ny = dx / L * w / 2;
    return '<path fill="' + col + '" d="M' + f1(p1[0] + nx) + ',' + f1(p1[1] + ny) + ' L' + f1(p2[0] + nx) + ',' + f1(p2[1] + ny) + ' L' + f1(p2[0] - nx) + ',' + f1(p2[1] - ny) + ' L' + f1(p1[0] - nx) + ',' + f1(p1[1] - ny) + 'Z"/>';
  }
  /* Fod set fra indersiden: hæl, svang, fodballe, tæer. Fodballen i (0,0), foden peger mod højre, y nedad. */
  function footBody(col, mid, dark) {
    return '<path fill="' + col + '" d="M-34,-31 C-37,-22 -42,-14 -42.5,-7 C-43,-2 -40,1 -35,1 C-28,1.2 -22,0.6 -16,-0.2 C-10,-0.8 -4,0.8 1,1 C4.5,1 6,-2 5.5,-5 L4,-9.5 C-4,-11 -13,-15 -20,-22 C-23,-25 -24,-28 -24,-31 Z"/>' +
      '<path fill="' + mid + '" d="M-33,-0.6 C-26,-0.4 -20,-1.4 -15,-2.6 C-10,-3.8 -5,-2.2 0,-1 C-5,-4.8 -12,-6.4 -18,-5.8 C-25,-5 -30,-3 -33,-0.6 Z"/>' + // svangen
      '<path fill="' + dark + '" opacity=".45" d="M-42.5,-7 C-43,-2 -40,1 -35,1 C-37,-1 -39,-4 -39.5,-8 Z"/>' +                                       // hælens skygge
      '<ellipse cx="-29" cy="-17" rx="4" ry="3.6" fill="' + dark + '" opacity=".55"/>';                                                                   // ankelknoen
  }
  function toe(col, dark, rel) { // storetå (forrest) + småtæer bagved; grundleddet ved fodballen, undersiden flugter med sålen
    return '<g transform="translate(1,-4.5) rotate(' + f1(rel) + ')">' +
      '<path fill="' + dark + '" d="M-2,-4.5 L11,-3.6 C14.5,-3.4 15.6,-0.6 14.2,1.6 L-2,2.4 Z"/>' +
      '<path fill="' + col + '" d="M-3,-2.6 L13,-2.2 C17,-2.1 19.2,0 19,2 C18.8,4 17,4.8 14.5,4.8 L-3,4.8 Z"/>' +
      '<path fill="' + C.nail + '" d="M13.2,-2.1 C16.4,-2 18.4,-0.8 18.9,0.8 L13.6,0.6 Z"/>' +
      '<path fill="none" stroke="' + dark + '" stroke-width=".7" opacity=".6" d="M9,-2.2 q-0.8,3.5 0,7"/></g>';
  }
  function foot(mtp, fa, toeRel, col, mid, dark) {
    return '<g transform="translate(' + f1(mtp[0]) + ',' + f1(mtp[1]) + ') rotate(' + f1(fa) + ')">' + footBody(col, mid, dark) + toe(col, mid, toeRel) + '</g>';
  }
  function towel() { // sammenrullet håndklæde (cylinder med spiral-ende) på kanten af trinnet
    const c = TOWEL, r = TOWEL_R, dx = 7, dy = -4;
    return '<g>' +
      '<circle cx="' + f1(c[0] + dx) + '" cy="' + f1(c[1] + dy) + '" r="' + r + '" fill="' + C.towelMid + '"/>' +
      '<path fill="' + C.towelMid + '" d="M' + f1(c[0]) + ',' + f1(c[1] - r) + ' L' + f1(c[0] + dx) + ',' + f1(c[1] + dy - r) + ' L' + f1(c[0] + dx) + ',' + f1(c[1] + dy + r) + ' L' + f1(c[0]) + ',' + f1(c[1] + r) + ' Z"/>' +
      '<circle cx="' + f1(c[0]) + '" cy="' + f1(c[1]) + '" r="' + r + '" fill="' + C.towel + '" stroke="' + C.towelDark + '" stroke-width=".9"/>' +
      '<path fill="none" stroke="' + C.towelDark + '" stroke-width=".9" stroke-linecap="round" d="M' + f1(c[0] + 0.6) + ',' + f1(c[1]) + ' a1.6,1.6 0 1 0 -1.6,1.6 a3.2,3.2 0 1 0 3.2,-3.2 a4.8,4.8 0 1 0 -4.8,4.8"/>' +
      '</g>';
  }
  function ik(a, b, l1, l2, bendSign) {
    const dx = b[0] - a[0], dy = b[1] - a[1], d = Math.min(Math.hypot(dx, dy), l1 + l2 - 0.5);
    const base = Math.atan2(dy, dx), cosA = (l1 * l1 + d * d - l2 * l2) / (2 * l1 * d), A = Math.acos(Math.max(-1, Math.min(1, cosA)));
    const r = base + bendSign * A; return [a[0] + l1 * Math.cos(r), a[1] + l1 * Math.sin(r)];
  }
  /* Ledpositioner. t = 0 (start, hælen lidt under trinnet) … 1 (top, højt på fodballen). Hoften lodret over fodballen. */
  function joints(t) {
    const fa = footAngle(t), ankle = add(MTP, rot(ANK_L, fa));
    const hipX = MTP[0] + 2, L = L_SHANK + L_THIGH, dx = hipX - ankle[0], hip = [hipX, ankle[1] - Math.sqrt(L * L - dx * dx)];
    const knee = lerp(ankle, hip, L_SHANK / L);
    const lean = 2, sh = add(hip, rot([0, -L_TRUNK], lean)), neck = add(sh, rot([2, -10], lean)), head = add(sh, rot([5, -34], lean));
    return { fa, ankle, knee, hip, sh, neck, head, lean };
  }
  const HAND = (() => { const j = joints(0); return [j.sh[0] + 52, j.sh[1] + 66]; })();
  const railY = x => HAND[1] - 0.5 * (x - HAND[0]) + 3;

  let uid = 0;
  function scene(o) {
    o = o || {};
    const body = world(o);
    if (o.inset === false) return body;
    // Forstørrelse: fodballen på trinnets kant, hælen fri i luften, tæerne over håndklædet
    const id = 'htc' + (++uid), cx = 226, cy = 292, r = 70, k = 1.5, fx = MTP[0] - 9, fy = STEP - 9;
    return body +
      '<circle cx="' + f1(fx) + '" cy="' + f1(fy) + '" r="' + f1(r / k) + '" fill="none" stroke="' + C.guide + '" stroke-width="1.6" opacity=".75"/>' +
      '<line x1="' + f1(fx + 30) + '" y1="' + f1(fy - 20) + '" x2="' + f1(cx - 54) + '" y2="' + f1(cy + 38) + '" stroke="' + C.guide + '" stroke-width="1.4" opacity=".6"/>' +
      '<defs><clipPath id="' + id + '"><circle cx="' + cx + '" cy="' + cy + '" r="' + r + '"/></clipPath></defs>' +
      '<g clip-path="url(#' + id + ')"><g transform="translate(' + cx + ',' + cy + ') scale(' + k + ') translate(' + (-fx) + ',' + (-fy) + ')">' + world(Object.assign({}, o, { arrow: false })) + '</g></g>' +
      '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="none" stroke="' + C.guide + '" stroke-width="3"/>';
  }
  function world(o) {
    const t = Math.max(0, Math.min(1, o.t || 0)), one = !!o.oneLeg, j = joints(t);
    let s = '<rect width="' + W + '" height="' + H + '" fill="' + C.bg + '"/>';
    s += '<rect x="0" y="' + FLOOR + '" width="' + W + '" height="' + (H - FLOOR) + '" fill="' + C.floor + '"/>';
    s += '<rect x="' + EDGE + '" y="' + STEP + '" width="' + (W - EDGE) + '" height="' + (H - STEP) + '" fill="' + C.step + '"/>' +
      '<rect x="' + EDGE + '" y="' + STEP + '" width="' + (W - EDGE) + '" height="2.5" fill="' + C.stepTop + '"/><rect x="' + EDGE + '" y="' + STEP + '" width="2.5" height="' + (H - STEP) + '" fill="' + C.stepNose + '"/>';
    s += '<rect x="240" y="' + (STEP - 44) + '" width="' + (W - 240) + '" height="44" fill="' + C.step + '"/><rect x="240" y="' + (STEP - 44) + '" width="' + (W - 240) + '" height="2.5" fill="' + C.stepTop + '"/><rect x="240" y="' + (STEP - 44) + '" width="2.5" height="44" fill="' + C.stepNose + '"/>';
    s += '<line x1="' + (EDGE - 70) + '" y1="' + STEP + '" x2="' + EDGE + '" y2="' + STEP + '" stroke="' + C.guide + '" stroke-width="1.2" stroke-dasharray="4 4" opacity=".55"/>';
    s += '<line x1="20" y1="' + f1(railY(20)) + '" x2="' + W + '" y2="' + f1(railY(W)) + '" stroke="' + C.rail + '" stroke-width="7" stroke-linecap="round"/>' +
      '<line x1="266" y1="' + f1(railY(266)) + '" x2="266" y2="' + (STEP - 44) + '" stroke="' + C.railDark + '" stroke-width="5"/>';
    s += towel();
    if (one) {
      // Frit ben: låret næsten lodret (let frem), knæet bøjet ca. 90°, underbenet vandret bagud, foden afslappet.
      const k2 = add(j.hip, rot([0, L_THIGH - 4], 3)), a2 = add(k2, rot([-(L_SHANK - 6), 0], 6));
      const cuff2 = lerp(k2, a2, 0.74);
      s += limb(lerp(k2, a2, 0.7), a2, 12.5, 11.5, C.skin);
      const fa2 = 90 + 6 + 22, m2 = sub(a2, rot(ANK_L, fa2));
      s += foot(m2, fa2, 10, C.skin, C.skinMid, C.skinDark);
      s += limb(j.hip, k2, 31, 25, C.pantsDark) + limb(k2, cuff2, 25, 20, C.pantsDark) + band(lerp(k2, a2, 0.71), cuff2, 21, '#3b4149');
    } else {
      const off = [4, -1], m2 = add(MTP, off), an2 = add(j.ankle, off), kn2 = add(j.knee, off), hp2 = add(j.hip, off);
      s += limb(lerp(kn2, an2, 0.72), an2, 12.5, 11.5, C.skinMid) + foot(m2, j.fa, TOE_ABS + 3 - j.fa, C.skinMid, C.skinDark, '#a87956') +
        limb(hp2, kn2, 31, 25, C.pantsDark) + limb(kn2, lerp(kn2, an2, 0.78), 25, 20, C.pantsDark);
    }
    // Standbenet
    const cuff = lerp(j.knee, j.ankle, 0.78);
    s += limb(lerp(j.knee, j.ankle, 0.72), j.ankle, 13, 12, C.skin);
    s += foot(MTP, j.fa, TOE_ABS - j.fa, C.skin, C.skinMid, C.skinDark);
    s += limb(j.hip, j.knee, 33, 26, C.pants) + limb(j.knee, cuff, 26, 21, C.pants) + band(lerp(j.knee, j.ankle, 0.73), cuff, 22, C.pantsDark);
    // Overkrop
    const back = rot([-1, 0], j.lean), fwd = rot([1, 0], j.lean);
    const P = (base, side, d) => add(base, [side[0] * d, side[1] * d]);
    const waist = add(j.hip, rot([0, -14], j.lean));
    s += '<path fill="' + C.pants + '" d="M' + f1(P(j.hip, back, 19)[0]) + ',' + f1(P(j.hip, back, 19)[1] + 10) + ' L' + f1(P(waist, back, 18)[0]) + ',' + f1(P(waist, back, 18)[1]) +
      ' L' + f1(P(waist, fwd, 16)[0]) + ',' + f1(P(waist, fwd, 16)[1]) + ' L' + f1(P(j.hip, fwd, 17)[0]) + ',' + f1(P(j.hip, fwd, 17)[1] + 12) + ' Z"/>';
    if (one) {
      const mid = add(j.hip, rot([-22, -66], j.lean));
      s += '<g transform="translate(' + f1(mid[0]) + ',' + f1(mid[1]) + ') rotate(' + j.lean + ')"><rect x="-17" y="-34" width="32" height="68" rx="10" fill="' + C.pack + '"/>' +
        '<rect x="-15" y="4" width="26" height="22" rx="6" fill="' + C.packDark + '"/><rect x="-12" y="-30" width="24" height="10" rx="4" fill="' + C.packDark + '"/></g>';
    }
    s += '<path fill="' + C.teal + '" d="M' + f1(P(waist, back, 19)[0]) + ',' + f1(P(waist, back, 19)[1] + 6) + ' C' + f1(P(j.sh, back, 22)[0]) + ',' + f1(P(j.sh, back, 22)[1] + 50) + ' ' +
      f1(P(j.sh, back, 20)[0]) + ',' + f1(P(j.sh, back, 20)[1] + 6) + ' ' + f1(P(j.sh, back, 12)[0]) + ',' + f1(P(j.sh, back, 12)[1] - 4) +
      ' L' + f1(P(j.sh, fwd, 8)[0]) + ',' + f1(P(j.sh, fwd, 8)[1] - 6) + ' C' + f1(P(j.sh, fwd, 22)[0]) + ',' + f1(P(j.sh, fwd, 22)[1] + 18) + ' ' +
      f1(P(waist, fwd, 22)[0]) + ',' + f1(P(waist, fwd, 22)[1] - 40) + ' ' + f1(P(waist, fwd, 18)[0]) + ',' + f1(P(waist, fwd, 18)[1] + 6) + ' Z"/>';
    if (one) { const a = add(j.sh, rot([-2, -4], j.lean)), b = add(j.hip, rot([4, -40], j.lean));
      s += '<path fill="none" stroke="' + C.packDark + '" stroke-width="6" stroke-linecap="round" d="M' + f1(a[0] - 12) + ',' + f1(a[1] + 2) + ' C' + f1(a[0] + 4) + ',' + f1(a[1] - 6) + ' ' + f1(b[0] + 10) + ',' + f1(b[1] - 30) + ' ' + f1(b[0]) + ',' + f1(b[1]) + '"/>'; }
    s += limb(j.neck, add(j.neck, rot([0, -14], j.lean)), 13, 13, C.skin);
    const hd = j.head;
    s += '<g transform="translate(' + f1(hd[0]) + ',' + f1(hd[1]) + ')">' +
      '<path fill="' + C.skin + '" d="M-13,-6 C-13,-20 0,-25 10,-20 C17,-16 19,-8 18,-2 L22,4 C22,6 20,7 18,7 C18,12 16,17 10,19 C2,22 -8,18 -12,10 Z"/>' +
      '<circle cx="11" cy="-3" r="1.4" fill="#3b3f45"/><path fill="none" stroke="' + C.skinDark + '" stroke-width="1.2" stroke-linecap="round" d="M12,11 q3,1.5 5,0"/>' +
      '<path fill="' + C.hair + '" d="M-17,6 C-22,-12 -12,-28 4,-27 C16,-26 22,-18 20,-8 C15,-14 8,-16 2,-14 C0,-6 -3,2 -6,12 C-10,14 -15,12 -17,6 Z"/>' +
      '<path fill="none" stroke="' + C.hairDark + '" stroke-width="1.3" opacity=".8" d="M-12,-14 C-6,-22 6,-24 14,-18 M-14,0 C-12,-8 -8,-12 -2,-14"/>' +
      '<ellipse cx="-2" cy="2" rx="3.5" ry="5" fill="' + C.skinDark + '" opacity=".5"/></g>';
    const shA = add(j.sh, rot([6, 6], j.lean)), el = ik(shA, HAND, L_UP, L_FORE, 1);
    s += limb(shA, el, 17, 14, C.skin) + limb(el, HAND, 14, 11, C.skin);
    const m = lerp(shA, el, 0.42);
    s += '<path fill="' + C.tealDark + '" d="M' + f1(shA[0] - 12) + ',' + f1(shA[1] - 8) + ' C' + f1(shA[0] + 4) + ',' + f1(shA[1] - 14) + ' ' + f1(shA[0] + 16) + ',' + f1(shA[1] - 4) + ' ' + f1(shA[0] + 14) + ',' + f1(shA[1] + 12) +
      ' L' + f1(m[0] + 7) + ',' + f1(m[1] + 6) + ' L' + f1(m[0] - 8) + ',' + f1(m[1] - 4) + ' Z"/>';
    s += '<g transform="translate(' + f1(HAND[0]) + ',' + f1(HAND[1]) + ') rotate(-27)"><rect x="-6" y="-7" width="17" height="13" rx="6" fill="' + C.skin + '"/><rect x="2" y="-1" width="9" height="8" rx="4" fill="' + C.skinMid + '"/></g>';
    if (o.arrow) {
      const heel = add(MTP, rot(HEEL_L, j.fa)), up = o.arrow === 'up';
      const x = heel[0] - 16, y1 = up ? heel[1] + 34 : heel[1] - 34, y2 = up ? heel[1] + 4 : heel[1] - 4;
      s += '<path fill="none" stroke="' + C.guide + '" stroke-width="4" stroke-linecap="round" d="M' + f1(x) + ',' + f1(y1) + ' L' + f1(x) + ',' + f1(y2) + '"/>' +
        '<path fill="' + C.guide + '" d="M' + f1(x - 8) + ',' + f1(y2 + (up ? 4 : -4)) + ' L' + f1(x) + ',' + f1(y2 + (up ? -8 : 8)) + ' L' + f1(x + 8) + ',' + f1(y2 + (up ? 4 : -4)) + ' Z"/>';
    }
    return s;
  }
  function svg(o) {
    return '<svg class="ht-svg" viewBox="0 0 ' + W + ' ' + H + '" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="' + (o && o.oneLeg ? 'Hæløft på ét ben på trappetrin' : 'Hæløft på begge ben på trappetrin') + '">' + scene(o) + '</svg>';
  }
  const TEMPO = { up: 3, hold: 2, down: 3 };
  function phaseAt(sec) {
    const cyc = TEMPO.up + TEMPO.hold + TEMPO.down, x = ((sec % cyc) + cyc) % cyc;
    const e = v => v * v * (3 - 2 * v);
    if (x < TEMPO.up) return { t: e(x / TEMPO.up), label: 'Op · ' + (TEMPO.up - Math.floor(x)), key: 'op' };
    if (x < TEMPO.up + TEMPO.hold) return { t: 1, label: 'Hold · ' + (TEMPO.up + TEMPO.hold - Math.floor(x)), key: 'hold' };
    return { t: 1 - e((x - TEMPO.up - TEMPO.hold) / TEMPO.down), label: 'Ned · ' + (cyc - Math.floor(x)), key: 'ned' };
  }
  return { svg, scene, joints, phaseAt, TEMPO, W, H, MTP, EDGE, STEP };
})();
if (typeof module !== 'undefined') module.exports = HaelTrin;


/* ---------- Lille tempo-film på øvelsessiden (3 sek. op · 2 sek. hold · 3 sek. ned) ---------- */
const HAEL_TRIN_FILM = { 'hael-2-haeloeft-trin-begge': { oneLeg: false }, 'hael-3-tungt-haeloeft-et-ben': { oneLeg: true } };
function haelTrinFilmHtml(e) {
  const cfg = HAEL_TRIN_FILM[e.id]; if (!cfg) return '';
  const still = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  return '<div class="card ht-film" data-ex="' + e.id + '"><h3>🎬 Tempo-film</h3>' +
    '<p class="muted small" style="margin:0 0 8px">' + HaelTrin.TEMPO.up + ' sek. op · ' + HaelTrin.TEMPO.hold + ' sek. hold · ' + HaelTrin.TEMPO.down + ' sek. ned. Følg hælen i dit eget tempo.</p>' +
    '<div class="ht-stage">' + HaelTrin.svg({ t: still ? 1 : 0, oneLeg: cfg.oneLeg, arrow: still ? 'up' : false }) + '</div>' +
    (still ? '<p class="hint">Stillbillede (reduceret bevægelse er slået til): toppen af bevægelsen.</p>'
      : '<div class="ht-row"><button type="button" class="btn secondary ht-play" aria-pressed="false">▶ Afspil i tempo</button><span class="ht-phase" aria-live="off"></span></div>') + '</div>';
}
function initHaelTrinFilm(root) {
  const box = root.querySelector('.ht-film'); if (!box) return;
  const btn = box.querySelector('.ht-play'); if (!btn) return;
  const cfg = HAEL_TRIN_FILM[box.dataset.ex], stage = box.querySelector('.ht-stage'), ph = box.querySelector('.ht-phase');
  let raf = 0, t0 = 0, acc = 0, last = 0;
  const frame = now => {
    if (!box.isConnected) { cancelAnimationFrame(raf); return; }
    const sec = acc + (now - t0) / 1000, st = HaelTrin.phaseAt(sec);
    if (now - last > 33) { stage.innerHTML = HaelTrin.svg({ t: st.t, oneLeg: cfg.oneLeg }); last = now; }
    if (ph.textContent !== st.label) { ph.textContent = st.label; ph.dataset.key = st.key; }
    raf = requestAnimationFrame(frame);
  };
  btn.onclick = () => {
    const on = btn.getAttribute('aria-pressed') !== 'true';
    btn.setAttribute('aria-pressed', on); btn.textContent = on ? '⏸ Pause' : '▶ Afspil i tempo';
    if (on) { t0 = performance.now(); raf = requestAnimationFrame(frame); }
    else { cancelAnimationFrame(raf); acc += (performance.now() - t0) / 1000; }
  };
}
