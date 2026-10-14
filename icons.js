/* v28: ikoner i Lucide-stil (inline SVG, stroke) + tegnede kropsikoner til områderne og kropskortet i spørgeskemaet. */
'use strict';
const ICON_PATHS = {
  home: '<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z"/>',
  list: '<path d="M8 6h13M8 12h13M8 18h13"/><circle cx="3.5" cy="6" r="1"/><circle cx="3.5" cy="12" r="1"/><circle cx="3.5" cy="18" r="1"/>',
  chart: '<path d="M3 3v18h18"/><path d="m7 15 4-4 3 3 5-6"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  play: '<path d="M7 4.5v15l12-7.5z" fill="currentColor"/>', check: '<path d="m5 12.5 4.5 4.5L19 7"/>', x: '<path d="M6 6l12 12M18 6 6 18"/>',
  camera: '<path d="M3 8a2 2 0 0 1 2-2h2.5L9 4h6l1.5 2H19a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><circle cx="12" cy="13" r="3.5"/>',
  video: '<rect x="3" y="6" width="13" height="12" rx="2"/><path d="m16 10 5-3v10l-5-3"/>', upload: '<path d="M12 16V4M7 9l5-5 5 5"/><path d="M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3"/>',
  left: '<path d="m15 18-6-6 6-6"/>', right: '<path d="m9 18 6-6-6-6"/>', clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  clipboard: '<rect x="6" y="4" width="12" height="17" rx="2"/><path d="M9 4h6v3H9zM9 12h6M9 16h4"/>', zap: '<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>',
  skip: '<path d="M5 5l9 7-9 7zM18 5v14"/>', trash: '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>', edit: '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="m14 6 4 4"/>',
  alert: '<path d="M12 3 2 20h20z"/><path d="M12 10v4M12 17v.5"/>', shield: '<path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z"/><path d="m9 12 2 2 4-4"/>',
  walk: '<circle cx="13" cy="4" r="2"/><path d="m9 21 3-7 3 3v4M7 12l3-4 4 1 2 4 3 1M10 8l-2 6"/>', squat: '<circle cx="12" cy="4" r="2"/><path d="M12 6v6l-4 2 2 6M12 12l4 2-2 6M8 9h8"/>',
  heart: '<path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10z"/>', book: '<path d="M4 5a2 2 0 0 1 2-2h14v16H6a2 2 0 0 0-2 2z"/><path d="M4 19V5"/>',
  bell: '<path d="M6 16V11a6 6 0 1 1 12 0v5l2 2H4z"/><path d="M10 20a2 2 0 0 0 4 0"/>', award: '<circle cx="12" cy="9" r="6"/><path d="m8.5 14-1.5 7 5-3 5 3-1.5-7"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9 7 7M17 17l2.1 2.1M4.9 19.1 7 17M17 7l2.1-2.1"/>', volume: '<path d="M11 5 6 9H3v6h3l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/>'
};
function icon(n, cls) { return '<svg class="ic ' + (cls || '') + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (ICON_PATHS[n] || '') + '</svg>'; }

/* Krop set forfra/bagfra (viewBox 0 0 100 210). Regionerne bruges både i ikoner og i det klikbare kropskort. */
const BODY_REGIONS = {
  nakke: { name: 'Nakke', both: true, d: 'M44,27 h12 v9 h-12z' },
  skulder_v: { name: 'Venstre skulder', side: 'front', c: [69, 41, 7] }, skulder_h: { name: 'Højre skulder', side: 'front', c: [31, 41, 7] },
  albue_v: { name: 'Venstre albue', side: 'front', c: [77, 80, 5.5] }, albue_h: { name: 'Højre albue', side: 'front', c: [23, 80, 5.5] },
  haand_v: { name: 'Venstre hånd', side: 'front', c: [83, 113, 6.5] }, haand_h: { name: 'Højre hånd', side: 'front', c: [17, 113, 6.5] },
  hofte_v: { name: 'Venstre hofte', side: 'front', c: [61, 103, 7] }, hofte_h: { name: 'Højre hofte', side: 'front', c: [39, 103, 7] },
  knae_v: { name: 'Venstre knæ', side: 'front', c: [59, 146, 6.5] }, knae_h: { name: 'Højre knæ', side: 'front', c: [41, 146, 6.5] },
  ankel_v: { name: 'Venstre ankel', side: 'front', c: [58, 186, 5] }, ankel_h: { name: 'Højre ankel', side: 'front', c: [42, 186, 5] },
  fod_v: { name: 'Venstre fod/tæer', side: 'front', d: 'M55,193 h11 a4,4 0 0 1 0,8 h-11z' }, fod_h: { name: 'Højre fod/tæer', side: 'front', d: 'M45,193 h-11 a4,4 0 0 0 0,8 h11z' },
  brystryg: { name: 'Øvre ryg', side: 'back', d: 'M38,40 h24 v24 h-24z' }, laend: { name: 'Lænd', side: 'back', d: 'M38,68 h24 v22 h-24z' },
  hael_v: { name: 'Venstre hæl', side: 'back', c: [42, 197, 4.5] }, hael_h: { name: 'Højre hæl', side: 'back', c: [58, 197, 4.5] }
};
/* Bagfra er venstre/højre spejlvendt: personens venstre side er til venstre i billedet */
function bodySilhouette() {
  const limb = (pts, w) => '<path d="M' + pts.map(p => p.join(',')).join(' L') + '" fill="none" stroke="#b9cfc1" stroke-width="' + (w + 3) + '" stroke-linecap="round" stroke-linejoin="round"/>' +
    '<path d="M' + pts.map(p => p.join(',')).join(' L') + '" fill="none" stroke="#f6faf7" stroke-width="' + w + '" stroke-linecap="round" stroke-linejoin="round"/>';
  return limb([[31, 42], [23, 80], [17, 112]], 10) + limb([[69, 42], [77, 80], [83, 112]], 10) + limb([[41, 102], [41, 146], [42, 190]], 14) + limb([[59, 102], [59, 146], [58, 190]], 14) +
    '<path class="sil" d="M33,36 Q50,30 67,36 L70,46 L66,96 Q61,108 50,108 Q39,108 34,96 L30,46 Z"/><rect class="sil" x="44" y="24" width="12" height="13" rx="4"/><circle class="sil" cx="50" cy="15" r="11"/>';
}
function regionShape(id, r, cls, side) {
  let c = r.c;
  if (c && side === 'back') c = [100 - c[0], c[1], c[2]];
  const a = 'class="' + cls + '" data-rg="' + id + '"';
  return c ? '<circle ' + a + ' cx="' + c[0] + '" cy="' + c[1] + '" r="' + c[2] + '"/>' : '<path ' + a + ' d="' + r.d + '"/>';
}
function bodySvg(side, sel, opts) {
  opts = opts || {};
  let g = '<svg viewBox="0 0 100 210" role="img" aria-label="Kroppen set ' + (side === 'back' ? 'bagfra' : 'forfra') + '">' + bodySilhouette();
  if (side === 'back') g += '<path d="M50,38 V100" stroke="#b9cfc1" stroke-width="1.5" stroke-dasharray="2 2"/>';
  Object.keys(BODY_REGIONS).forEach(id => {
    const r = BODY_REGIONS[id]; if (!(r.both || r.side === side || (opts.mirror && r.side === 'front' && /^(skulder|albue|haand|hofte|knae|ankel)/.test(id)))) return;
    if (opts.only && !opts.only.includes(id)) { if (!opts.showAll) return; }
    g += regionShape(id, r, 'rg' + (sel && sel.includes(id) ? ' sel' : ''), side);
  });
  return g + '</svg>';
}
/* Lille ikon til et område/en gruppe: silhuet med de berørte steder i varm farve */
const AREA_ICON_REGIONS = {
  'knae-hofte': ['hofte_v', 'hofte_h', 'knae_v', 'knae_h'], knae: ['knae_v', 'knae_h'], hofte: ['hofte_v', 'hofte_h'], balance: ['ankel_v', 'ankel_h', 'fod_v', 'fod_h'],
  ryg: ['nakke', 'brystryg', 'laend'], laend: ['laend'], bryst: ['brystryg'], nakke: ['nakke'],
  skulder: ['skulder_v', 'skulder_h'], albue: ['albue_v', 'albue_h'], haand: ['haand_v', 'haand_h'], ankel: ['ankel_v', 'ankel_h'], fod: ['fod_v', 'fod_h', 'hael_v', 'hael_h'], haelspore: ['hael_v', 'hael_h'],
  ben: ['hofte_v', 'hofte_h', 'knae_v', 'knae_h', 'ankel_v', 'ankel_h', 'fod_v', 'fod_h'], arm: ['skulder_v', 'skulder_h', 'albue_v', 'albue_h', 'haand_v', 'haand_h']
};
function bodyIcon(id) {
  const sel = AREA_ICON_REGIONS[id] || [];
  const back = sel.some(r => BODY_REGIONS[r] && BODY_REGIONS[r].side === 'back') && !sel.some(r => BODY_REGIONS[r] && BODY_REGIONS[r].side === 'front');
  const side = back ? 'back' : 'front';
  let g = '<span class="body-ic" aria-hidden="true"><svg viewBox="0 0 100 210">' + bodySilhouette();
  sel.forEach(r => { const R = BODY_REGIONS[r]; if (!R) return; if (R.side && R.side !== side && !(id === 'fod' || id === 'haelspore')) return;
    let s = regionShape(r, R, '', R.side === 'back' && side === 'front' ? 'front' : side).replace('class=""', 'fill="#ff8b5f" stroke="#d9532c" stroke-width="2"'); g += s; });
  return g + '</svg></span>';
}
