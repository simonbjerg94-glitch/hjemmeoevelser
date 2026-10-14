/* v29: Velkomst-spørgsmål (grundige / hurtige / spring over) → 3 forslag til program.
   Spørgsmålene er Simons egne to skemaer ("Spørgeskema – Smerter og behandling" med 47 spørgsmål og den hurtige med 12),
   tilpasset til app: ét spørgsmål pr. skærm, valgknapper, skydere 0–10 (skal røres – ingen standardværdi), kropskort og valgfri fritekst.
   Navn spørges der IKKE om. Svarene gemmes kun i localStorage på telefonen (hjo_svar_v1) og kan rettes/slettes under Mere › Mine svar. Intet sendes. */
'use strict';
const KEY_SVAR = 'hjo_svar_v1';
const REGION_PROG = { nakke: 'nakke', brystryg: 'bryst', laend: 'laend', skulder: 'skulder', albue: 'albue', haand: 'haand', hofte: 'hofte', knae: 'knae', ankel: 'ankel', fod: 'fod', hael: 'haelspore' };
const regBase = r => r.replace(/_(v|h)$/, '');
const S10 = (id, t, ends, extra) => Object.assign({ id, t, type: 'slider', min: 0, max: 10, ends }, extra || {});
const ONE = (id, t, opts, extra) => Object.assign({ id, t, type: 'one', opts }, extra || {});
const MULTI = (id, t, opts, extra) => Object.assign({ id, t, type: 'multi', opts }, extra || {});
const TXT = (id, t, extra) => Object.assign({ id, t, type: 'text', opt: true }, extra || {});
const hasReg = (a, ...b) => (a.omraade || []).some(r => b.includes(regBase(r)));
const RYG = a => hasReg(a, 'laend', 'brystryg', 'nakke');
const PAIN = ['0 Ingen smerter', '10 Værst tænkelige'];
/* Røde flag: tier 'now' = ring 112 / skadestue nu; 'today' = kontakt læge i dag; 'soon' = læge inden for 1–2 uger */
const FLAGS = [
  { id: 'feber', t: 'Feber', tier: 'today' },
  { id: 'vaegt', t: 'Uforklarligt vægttab', tier: 'soon' },
  { id: 'almen', t: 'Markant forværring af mit almene helbred', tier: 'today' },
  { id: 'svag', t: 'Pludselig kraftløshed i en arm eller et ben', tier: 'now' },
  { id: 'cauda', t: 'Følelsesløshed i skridtet/sædet, eller svært ved at holde på vandet eller afføringen', tier: 'now', show: RYG },
  { id: 'tiltag', t: 'Ny eller tiltagende muskelsvaghed', tier: 'soon' },
  { id: 'foele', t: 'Ændret følesans (fx følelsesløshed, der breder sig)', tier: 'soon' }
];
const FLAG_Q = ['flag_almen', 'flag_nerve', 'flag'];
const FREE = { free: true };
const MAAL = ['At få færre smerter', 'At kunne bevæge mig bedre', 'At vende tilbage til træning eller sport', 'At kunne klare hverdagen uden begrænsninger', 'Andet'];
const omraade = (no, sec) => ({ id: 'omraade', no, sec, t: 'Hvor på kroppen oplever du smerter?', help: 'Tryk på de steder, hvor du har ondt. Du kan vælge flere.', type: 'body' });
const primaer = (no, sec) => ({ id: 'primaer', no, sec, t: 'Hvor gør det mest ondt?', help: 'Det sted, vi starter med.', type: 'primary', show: a => new Set((a.omraade || []).map(regBase)).size > 1 });
const VARIGHED = ['Under 1 uge', '1–4 uger', '1–3 måneder', 'Over 3 måneder'];
const sec = (s, list) => list.map(q => Object.assign({ sec: s }, q));
const Q_SETS = {
  grundig: {
    name: 'Spørgeskema – Smerter og behandling', short: 'Grundige spørgsmål', n: 47, time: '5–10 minutter',
    intro: 'For at kunne hjælpe dig bedst muligt vil jeg gerne vide lidt mere om dine smerter, din hverdag og dine ønsker til behandlingen. Besvar spørgsmålene så godt du kan. Der er ingen rigtige eller forkerte svar.',
    end: { h: 'Tak for dine svar!', p: 'Dine svar hjælper med at forstå din situation og tilrettelægge et forløb, der passer bedst muligt til dine behov og mål.' },
    qs: [
      ...sec('Generelle oplysninger', [
        ONE('alder', 'Alder', ['Under 30', '30–49', '50–59', '60–69', '70–79', '80 eller ældre'], { opt: true, help: 'Valgfrit.' }),
        ONE('arbejde', 'Beskæftigelse', ['Arbejder mest siddende', 'Arbejder mest stående eller fysisk', 'Studerende', 'Pensionist', 'Sygemeldt', 'Uden for arbejdsmarkedet', 'Andet'], { opt: true, help: 'Arbejde eller studie. Valgfrit.' })]),
      ...sec('Hvor har du smerter?', [
        omraade(1), primaer(1),
        ONE('spredning', 'Er smerterne samlet ét sted, eller spreder de sig til andre områder?', ['Samlet ét sted', 'Spreder sig til andre områder'], FREE, { no: 2 }),
        ONE('flere', 'Har du smerter flere steder på kroppen?', ['Nej', 'Ja'])]),
      ...sec('Hvornår begyndte smerterne?', [
        ONE('varighed', 'Hvor længe har du haft smerterne?', VARIGHED),
        ONE('start', 'Opstod smerterne pludseligt eller gradvist?', ['Pludseligt', 'Gradvist', 'Ved ikke']),
        ONE('udloest', 'Var der en bestemt hændelse, skade eller aktivitet, der udløste dem?', ['Nej', 'Ja', 'Ved ikke'], FREE),
        ONE('tidligere', 'Har du tidligere haft samme type smerter?', ['Nej', 'Ja', 'Ved ikke'])]),
      ...sec('Hvordan føles smerterne?', [
        MULTI('karakter', 'Beskriv smerterne', ['Murrende', 'Stikkende', 'Jagende', 'Brændende', 'Ømme eller spændte', 'Andet'], Object.assign({ help: 'Vælg gerne flere.' }, FREE)),
        ONE('konstant', 'Er smerterne konstante, eller kommer de og går?', ['Konstante', 'Kommer og går']),
        MULTI('nerve', 'Oplever du prikken, snurren, følelsesløshed eller nedsat kraft?', ['Prikken', 'Snurren', 'Følelsesløshed', 'Nedsat kraft', 'Nej, ingen af delene'])]),
      ...sec('Hvor kraftige er smerterne?', [
        S10('smerte_nu', 'Hvor kraftige er smerterne lige nu?', PAIN, { help: '0 = ingen smerter, 10 = værst tænkelige smerter. Træk i skyderen.' }),
        S10('smerte_vaerst', 'Hvor kraftige er smerterne, når de er værst?', PAIN),
        S10('smerte_mindst', 'Hvor kraftige er smerterne, når de er mindst?', PAIN),
        ONE('udvikling', 'Hvordan har smerterne udviklet sig siden starten?', ['Bedre', 'Værre', 'Uændrede', 'Svingende'])]),
      ...sec('Hvad gør smerterne værre?', [
        MULTI('vaerre', 'Hvilke bevægelser eller aktiviteter forværrer dine smerter?', ['At gå', 'Trapper', 'At sidde længe', 'At stå længe', 'At bøje mig', 'At løfte eller bære', 'Arme over hovedet', 'At gribe', 'Løb eller hop', 'Andet'], FREE),
        ONE('hvornaar', 'Kommer smerterne med det samme, eller først efter noget tid?', ['Med det samme', 'Først efter noget tid', 'Det er forskelligt']),
        ONE('varer', 'Hvor længe varer smerterne efter en aktivitet, der provokerer dem?', ['Få minutter', 'Under en time', 'Nogle timer', 'Til dagen efter', 'Flere dage']),
        ONE('dagen_efter', 'Oplever du flere smerter senere på dagen eller dagen efter fysisk aktivitet?', ['Nej', 'Nogle gange', 'Ja, ofte'])]),
      ...sec('Hvad hjælper på smerterne?', [
        TXT('lindrer', 'Hvad får dine smerter til at aftage?', { help: 'Skriv med dine egne ord (valgfrit).' }),
        MULTI('hvile', 'Hjælper det at hvile, bevæge sig eller skifte stilling?', ['Hvile', 'Bevæge mig', 'Skifte stilling', 'Intet af det']),
        MULTI('bedre', 'Har du oplevet lindring ved eksempelvis varme, kulde, massage eller smertestillende medicin?', ['Varme', 'Kulde', 'Massage', 'Smertestillende medicin', 'Andet', 'Intet af det'])]),
      ...sec('Smerter i løbet af dagen', [
        MULTI('tidspunkt', 'Hvornår er dine smerter typisk værst?', ['Morgen', 'Formiddag', 'Eftermiddag', 'Aften', 'Nat', 'Ingen bestemt tid']),
        ONE('morgen', 'Oplever du stivhed om morgenen? Hvis ja, hvor længe varer den?', ['Nej', 'Ja, under 30 minutter', 'Ja, 30–60 minutter', 'Ja, over 1 time']),
        ONE('soevn_smerte', 'Påvirker smerterne din søvn?', ['Nej', 'Ja, svært ved at falde i søvn', 'Ja, jeg vågner af smerterne', 'Begge dele'])]),
      ...sec('Hvordan påvirker smerterne din hverdag?', [
        MULTI('svaert', 'Hvilke aktiviteter har du svært ved at udføre på grund af smerterne?', ['Gå længere ture', 'Gå på trapper', 'Rejse mig fra en stol', 'Stå længe', 'Sidde længe', 'Løfte eller bære', 'Arme over hovedet', 'Gribe og åbne ting', 'Sove', 'Ingen af delene'], FREE),
        MULTI('paavirker', 'Påvirker smerterne dit arbejde, din fritid eller din træning?', ['Arbejde', 'Fritid', 'Træning', 'Ingen af delene']),
        ONE('stoppet', 'Er der aktiviteter eller bevægelser, du helt er stoppet med på grund af smerterne?', ['Nej', 'Ja'], FREE)]),
      ...sec('Tidligere behandling', [
        MULTI('behandling', 'Har du tidligere søgt behandling for disse smerter? Hvis ja, hvilken?', ['Nej', 'Fysioterapi', 'Kiropraktor', 'Læge', 'Indsprøjtning', 'Operation', 'Andet'], FREE),
        ONE('oevelser_foer', 'Har du prøvet øvelser eller andre tiltag for at mindske smerterne?', ['Nej', 'Ja, øvelser', 'Ja, andre tiltag', 'Ja, begge dele'], FREE),
        TXT('effekt', 'Hvad har tidligere hjulpet, og hvad har ikke haft effekt?'),
        ONE('scanning', 'Har du fået foretaget scanninger eller andre undersøgelser i forbindelse med smerterne?', ['Nej', 'Ja, røntgen', 'Ja, scanning (MR, CT eller ultralyd)', 'Ja, andet'], Object.assign({ help: 'Hvis ja: skriv gerne resultatet.' }, FREE))]),
      ...sec('Helbred og livsstil', [
        MULTI('sygdom', 'Har du andre sygdomme, tidligere skader eller operationer, der kan være relevante?', ['Andre sygdomme', 'Tidligere skader', 'Operationer', 'Nej'], FREE),
        ONE('medicin', 'Tager du medicin, som kan have betydning for dine smerter eller behandlingen?', ['Nej', 'Ja', 'Ved ikke'], FREE),
        ONE('soevn', 'Hvordan vil du beskrive din søvn generelt?', ['God', 'Nogenlunde', 'Dårlig']),
        ONE('aktiv', 'Hvordan vil du beskrive dit aktivitetsniveau?', ['Meget lavt', 'Lavt', 'Moderat', 'Højt', 'Meget højt']),
        ONE('stress', 'Oplever du stress eller andre belastninger i hverdagen, som du tænker kan påvirke dine smerter?', ['Nej', 'Lidt', 'Ja, meget'], FREE)]),
      ...sec('Dine tanker om smerterne', [
        TXT('aarsag', 'Hvad tror du selv, dine smerter skyldes?'),
        ONE('bekymring', 'Er der noget ved dine smerter, som bekymrer dig?', ['Nej', 'Ja'], FREE),
        S10('frygt', 'Er du nervøs for, at bestemte bevægelser eller aktiviteter kan forværre din skade?', ['0 Slet ikke', '10 Meget nervøs'], { key: 'fear' })]),
      ...sec('Dine mål og forventninger', [
        ONE('maal', 'Hvad er dit vigtigste mål med behandlingen?', MAAL, FREE),
        TXT('aktiviteter', 'Hvilke aktiviteter vil du gerne kunne vende tilbage til?'),
        TXT('forventer', 'Hvad forventer du af behandlingen?'),
        ONE('tid', 'Hvor meget tid har du til hjemmeøvelser?', ['5–10 min dagligt', '10–20 min dagligt', '20–30 min dagligt', 'Et par gange om ugen', 'Ved ikke endnu']),
        S10('tiltro', 'Hvor sikker er du på, at du kan lave dine øvelser fast de næste 6 uger?', ['0 Slet ikke sikker', '10 Helt sikker'], { key: 'confidence', no: null, help: 'Et ekstra spørgsmål fra appen – det hjælper med at gøre starten passende.' })]),
      ...sec('Supplerende helbredsoplysninger', [
        { id: 'flag_almen', t: 'Har du for nylig oplevet feber, uforklarligt vægttab eller en markant forværring af dit almene helbred?', type: 'flags', flags: ['feber', 'vaegt', 'almen'] },
        { id: 'flag_nerve', t: 'Har du oplevet ny eller tiltagende muskelsvaghed eller ændret følesans?', type: 'flags', flags: ['svag', 'cauda', 'tiltag', 'foele'] },
        TXT('andre_symptomer', 'Er der andre symptomer eller helbredsoplysninger, du mener, kan være vigtige for behandlingen?')]),
      ...sec('Er der andet, jeg bør vide?', [
        TXT('andet', 'Er der noget, du gerne vil fortælle, som ikke er blevet dækket af spørgsmålene?')])
    ]
  },
  hurtig: {
    name: 'Hjælp os med at forstå dine smerter', short: 'Hurtige og simple spørgsmål', emoji: '🩺', n: 12, time: '3–5 minutter',
    intro: 'Vi vil gerne hjælpe dig med at få færre smerter og mere bevægelsesfrihed. Dine svar hjælper os med at vælge øvelser og tilpasse træningen til netop dig, så du hverken laver for meget eller for lidt. Det tager kun 3–5 minutter.',
    end: { h: 'Hvad sker der nu?', list: ['Appen foreslår tre programmer ud fra dine svar: Skånsom start, Anbefalet og Mere udfordrende.', 'Du vælger det, der føles rigtigt – du kan altid skifte.', 'Du kan rette dine svar når som helst under Mere › Mine svar.', 'Bliver det værre, eller får du nye symptomer, så kontakt din læge.'] },
    qs: [
      omraade(1, ''), primaer(1, ''),
      ONE('varighed', 'Hvor længe har du haft smerterne?', VARIGHED),
      ONE('start', 'Hvordan startede smerterne?', ['Pludseligt (fx en skade)', 'Gradvist over tid', 'Ved ikke']),
      S10('smerte_nu', 'Hvor ondt gør det lige nu?', PAIN, { help: 'Træk i skyderen.' }),
      S10('smerte_vaerst', 'Hvor ondt gør det, når det er værst?', PAIN, { no: 4 }),
      MULTI('vaerre', 'Hvad gør dine smerter værre?', ['At gå', 'Trapper', 'At sidde længe', 'At stå længe', 'At bøje mig', 'At løfte eller bære', 'Arme over hovedet', 'Træning eller sport', 'Andet'], FREE),
      MULTI('bedre', 'Hvad hjælper på dine smerter?', ['Hvile', 'Bevægelse', 'Varme', 'Massage', 'Bestemte stillinger', 'Intet af det'], FREE),
      ONE('reaktion', 'Hvordan reagerer dine smerter på aktivitet?', ['Bliver bedre, når jeg bevæger mig', 'Bliver værre under aktivitet', 'Bliver værre efter aktivitet eller dagen efter', 'Ingen tydelig forskel']),
      MULTI('svaert', 'Hvad begrænser smerterne dig i?', ['Arbejde', 'Søvn', 'Gåture', 'Træning', 'Hverdagen', 'Ingen af delene'], FREE),
      MULTI('behandling', 'Har du tidligere forsøgt at behandle smerterne?', ['Nej', 'Fysioterapi', 'Øvelser selv', 'Smertestillende', 'Læge', 'Andet'], Object.assign({ help: 'Skriv gerne, hvad der har hjulpet, og hvad der ikke har.' }, FREE)),
      MULTI('helbred', 'Er der noget andet ved dit helbred, vi bør vide?', ['Sygdomme', 'Operationer', 'Medicin', 'Andre usædvanlige symptomer', 'Nej'], FREE),
      { id: 'flag', no: null, sec: 'Sikkerhedstjek', t: 'Har du noget af dette lige nu?', help: 'Sæt kryds ved alt, der passer. Det er vigtigt for din sikkerhed.', type: 'flags', flags: ['svag', 'cauda', 'tiltag', 'foele', 'feber', 'vaegt'] },
      ONE('maal', 'Hvad er dit vigtigste mål?', MAAL, FREE),
      ONE('tid', 'Hvor meget tid har du til øvelser?', ['5 min om dagen', '10 min om dagen', '15–20 min om dagen', '2–3 gange om ugen', 'Ved ikke endnu'])
    ]
  }
};
/* Nummerér efter Simons skema: hvert spørgsmål får sit nummer (no); delte skærme (4a/4b, primær) beholder nummeret. */
(function () {
  for (const k in Q_SETS) { let n = 0, sameNext = false;
    Q_SETS[k].qs.forEach(q => { if ('no' in q && q.no === null) return; if (q.type === 'primary' || (q.no != null && q.no === n)) { q.no = n; return; } if (k === 'grundig' && q.sec === 'Generelle oplysninger') { q.no = null; return; } q.no = ++n; });
  }
})();
const QS = (() => {
  const load = () => readJson(KEY_SVAR, null);
  const save = s => writeJson(KEY_SVAR, s);
  function visible(set, a) { return Q_SETS[set].qs.filter(q => !q.show || q.show(a)); }
  function flagsFor(a, q) { return FLAGS.filter(f => (!q || !q.flags || q.flags.includes(f.id)) && (!f.show || f.show(a))); }
  function hitsOf(a) { const ids = new Set(FLAG_Q.flatMap(k => a[k] || [])); return FLAGS.filter(f => ids.has(f.id)); }
  function shell(title, body) {
    setHeader(title); setTab(''); document.body.classList.add('onboarding');
    $app.innerHTML = body;
  }
  /* --- Velkomst: tre valg --- */
  function choice(fromMore) {
    const c = (k, ic, t, s) => '<button type="button" class="card ob-choice" data-qset="' + k + '"><span class="oi">' + icon(ic) + '</span><span><b>' + t + '</b><span class="muted">' + s + '</span></span></button>';
    shell('Velkommen', '<h2 class="ob-h">Skal vi finde de rigtige øvelser til dig?</h2><p class="lead">Svar på nogle spørgsmål, så foreslår appen tre programmer, du kan vælge imellem.</p>' +
      c('grundig', 'clipboard', Q_SETS.grundig.short, Q_SETS.grundig.n + ' spørgsmål · ' + Q_SETS.grundig.time + ' · det bedste forslag') +
      c('hurtig', 'zap', Q_SETS.hurtig.short, Q_SETS.hurtig.n + ' spørgsmål · ' + Q_SETS.hurtig.time) +
      c('skip', 'skip', 'Spring over', 'Vælg selv dit program – du kan svare senere under Mere') +
      '<p class="hint" style="text-align:center">' + icon('shield') + ' Dine svar bliver kun gemt på din telefon. Vi spørger ikke om dit navn.</p>');
    $app.querySelectorAll('[data-qset]').forEach(b => b.onclick = () => {
      const k = b.dataset.qset;
      if (k === 'skip') { localStorage.setItem(KEY_SVAR + '_skip', '1'); document.body.classList.remove('onboarding'); if (fromMore) location.hash = '#/mere'; else finishOnboarding(); return; }
      const old = load(); save({ set: k, a: old && old.set === k ? old.a : {}, i: 0, done: false }); intro(k);
    });
  }
  function intro(k) {
    const S = Q_SETS[k];
    shell(S.short, '<div class="q-wrap"><h2 class="q-title" id="qIntro">' + (S.emoji ? S.emoji + ' ' : '') + esc(S.name) + '</h2><p class="lead">' + esc(S.intro) + '</p>' +
      '<p class="muted">' + icon('clock') + ' ' + S.n + ' spørgsmål · ' + esc(S.time) + '</p><p class="hint">' + icon('shield') + ' Dine svar bliver kun gemt på din telefon.</p>' +
      '<div class="q-nav"><button type="button" class="btn cta" id="qGo">Start ' + icon('right') + '</button></div></div>');
    document.getElementById('qGo').onclick = () => ask(0);
  }
  function endScreen(s) {
    const E = Q_SETS[s.set].end;
    shell(Q_SETS[s.set].short, '<div class="q-wrap"><h2 class="q-title" id="qEnd">' + esc(E.h) + '</h2>' + (E.p ? '<p class="lead">' + esc(E.p) + '</p>' : '') +
      (E.list ? '<ul class="tips">' + E.list.map(t => '<li>' + esc(t) + '</li>').join('') + '</ul>' : '') +
      '<p class="hint">' + icon('shield') + ' Dine svar bliver kun gemt på din telefon.</p><div class="q-nav"><button type="button" class="btn secondary" id="qBack" style="flex:0 0 34%">' + icon('left') + ' Tilbage</button><button type="button" class="btn cta" id="qSee">Se mine forslag ' + icon('right') + '</button></div></div>');
    document.getElementById('qSee').onclick = result;
    document.getElementById('qBack').onclick = () => ask(visible(s.set, s.a).length - 1);
  }
  /* --- Ét spørgsmål pr. skærm --- */
  function ask(i) {
    const s = load(); if (!s) return choice();
    const list = visible(s.set, s.a); if (i >= list.length) { s.done = Date.now(); save(s); return endScreen(s); }
    s.i = i; save(s);
    const q = list[i], v = s.a[q.id];
    location.hash !== '#/spoergsmaal' && history.replaceState(null, '', '#/spoergsmaal');
    let body = '<div class="q-wrap" data-q="' + q.id + '"><div class="q-prog">' + list.map((x, j) => '<i class="' + (j <= i ? 'on' : '') + '"></i>').join('').slice(0, 99999) + '</div>' +
      '<div class="q-step">' + [q.no ? 'Spørgsmål ' + q.no + ' af ' + Q_SETS[s.set].n : '', q.sec].filter(Boolean).join(' · ') + '</div><h2 class="q-title">' + esc(q.t) + '</h2>' + (q.help ? '<p class="q-help">' + esc(q.help) + '</p>' : '');
    if (q.type === 'one' || q.type === 'multi') body += '<div class="chips' + (q.opts.length > 4 || q.opts.some(o => o.length > 22) ? ' col' : '') + '">' + q.opts.map(o => '<button type="button" class="chip-b' + ((q.type === 'one' ? v === o : (v || []).includes(o)) ? ' sel' : '') + '" data-o="' + esc(o) + '" aria-pressed="' + (q.type === 'one' ? v === o : (v || []).includes(o)) + '">' + esc(o) + '</button>').join('') + '</div>';
    if (q.type === 'slider') body += '<div class="q-slider"><div class="val" id="qVal">' + (v == null ? '–' : v) + '</div><input type="range" id="qRange" min="' + q.min + '" max="' + q.max + '" step="1" value="' + (v == null ? 5 : v) + '"' + (v == null ? ' class="unset"' : '') + ' aria-label="' + esc(q.t) + '"><div class="ends"><span>' + esc(q.ends[0]) + '</span><span>' + esc(q.ends[1]) + '</span></div></div>';
    if (q.type === 'body') body += '<div class="bodymap"><figure>' + bodySvg('front', v || []) + '<figcaption>Forfra</figcaption></figure><figure>' + bodySvg('back', v || []) + '<figcaption>Bagfra</figcaption></figure></div><p class="bm-list" id="bmList"></p>';
    if (q.type === 'primary') { const opts = [...new Set((s.a.omraade || []).map(regBase))]; body += '<div class="chips col">' + opts.map(o => '<button type="button" class="chip-b' + (v === o ? ' sel' : '') + '" data-o="' + o + '">' + esc(regName(o)) + '</button>').join('') + '</div>'; }
    if (q.type === 'text') body += '<textarea id="qText" class="q-text" rows="4" placeholder="Skriv her (valgfrit)">' + esc(v || '') + '</textarea>';
    if (q.free) body += '<textarea id="qFree" class="q-text" rows="2" placeholder="Skriv gerne mere (valgfrit)">' + esc(s.a[q.id + '_txt'] || '') + '</textarea>';
    if (q.type === 'flags') body += '<div class="chips col">' + flagsFor(s.a, q).map(f => '<button type="button" class="chip-b' + ((v || []).includes(f.id) ? ' sel' : '') + '" data-o="' + f.id + '">' + esc(f.t) + '</button>').join('') +
      '<button type="button" class="chip-b' + (Array.isArray(v) && !v.length ? ' sel' : '') + '" data-o="__none">Nej, ingen af dem</button></div>';
    body += '<div class="q-nav">' + (i > 0 ? '<button type="button" class="btn secondary" id="qBack" style="flex:0 0 34%">' + icon('left') + ' Tilbage</button>' : '') +
      '<button type="button" class="btn cta" id="qNext"' + (q.opt || answered(q, v) ? '' : ' disabled') + '>' + (q.opt && !answered(q, v) && q.type !== 'text' ? 'Spring over' : 'Næste') + ' ' + icon('right') + '</button></div>' +
      '<p class="hint" style="text-align:center"><a href="#/" id="qLater">Gem og fortsæt senere</a></p></div>';
    shell(Q_SETS[s.set].short, body);
    const set = val => { const s2 = load(); s2.a[q.id] = val; save(s2); const nb = document.getElementById('qNext'); if (nb) { nb.disabled = !q.opt && !answered(q, val); if (q.opt && q.type !== 'text') nb.firstChild.textContent = answered(q, val) ? 'Næste ' : 'Spring over '; } };
    const tx = document.getElementById('qText'); if (tx) tx.oninput = () => set(tx.value.trim() ? tx.value : null);
    const fr = document.getElementById('qFree'); if (fr) fr.oninput = () => { const s2 = load(); if (fr.value.trim()) s2.a[q.id + '_txt'] = fr.value; else delete s2.a[q.id + '_txt']; save(s2); };
    const bm = () => { const l = document.getElementById('bmList'); if (l) { const r = load().a.omraade || []; l.textContent = r.length ? r.map(x => BODY_REGIONS[x].name).join(' · ') : 'Tryk på kroppen'; } };
    if (q.type === 'body') { bm(); $app.querySelectorAll('.bodymap [data-rg]').forEach(el => el.addEventListener('click', () => {
      const cur = new Set(load().a.omraade || []), id = el.dataset.rg; cur.has(id) ? cur.delete(id) : cur.add(id); set([...cur]);
      $app.querySelectorAll('.bodymap [data-rg="' + id + '"]').forEach(x => x.classList.toggle('sel', cur.has(id))); bm(); })); }
    $app.querySelectorAll('.chips [data-o]').forEach(b => b.onclick = () => {
      const o = b.dataset.o;
      if (q.type === 'one' || q.type === 'primary') { set(o); $app.querySelectorAll('.chips [data-o]').forEach(x => { x.classList.toggle('sel', x === b); x.setAttribute('aria-pressed', x === b); }); return; }
      let cur = (load().a[q.id] || []).slice();
      const EXCL = /^(Ingen af|Intet af|Nej$|Ingen bestemt tid)/;
      if (o === '__none' || EXCL.test(o)) cur = o === '__none' ? [] : [o];
      else { cur = cur.filter(x => !EXCL.test(x)); cur.includes(o) ? cur = cur.filter(x => x !== o) : cur.push(o); }
      set(cur);
      $app.querySelectorAll('.chips [data-o]').forEach(x => { const on = x.dataset.o === '__none' ? !cur.length : cur.includes(x.dataset.o); x.classList.toggle('sel', on); x.setAttribute('aria-pressed', on); });
    });
    const r = document.getElementById('qRange'); if (r) { const upd = () => { document.getElementById('qVal').textContent = r.value; set(Number(r.value)); }; r.oninput = upd; r.onchange = upd; r.onclick = upd; r.addEventListener('input', () => r.classList.remove('unset')); r.addEventListener('click', () => r.classList.remove('unset')); }
    const nb = document.getElementById('qNext'); nb.onclick = () => {
      const s3 = load();
      if (q.type === 'flags') { const hit = flagsFor(s3.a, q).filter(f => (s3.a[q.id] || []).includes(f.id)); if (hit.length) return flagScreen(hit, () => ask(i + 1)); }
      ask(i + 1);
    };
    const bb = document.getElementById('qBack'); if (bb) bb.onclick = () => ask(i - 1);
    document.getElementById('qLater').onclick = () => document.body.classList.remove('onboarding');
  }
  function answered(q, v) { if (q.type === 'text') return v != null && v !== ''; if (q.type === 'flags') return Array.isArray(v); if (q.type === 'multi' || q.type === 'body') return Array.isArray(v) && v.length > 0; return v != null && v !== ''; }
  function regName(b) { return { nakke: 'Nakke', brystryg: 'Øvre ryg', laend: 'Lænd', skulder: 'Skulder', albue: 'Albue', haand: 'Hånd og håndled', hofte: 'Hofte', knae: 'Knæ', ankel: 'Ankel', fod: 'Fod og tæer', hael: 'Hæl' }[b] || b; }
  /* --- Røde flag: vis "Hvornår skal du til læge?" med det samme --- */
  function flagBoxes(hit) {
    const now = hit.filter(f => f.tier === 'now'), today = hit.filter(f => f.tier === 'today'), soon = hit.filter(f => f.tier === 'soon');
    let h = '';
    if (now.length) h += '<div class="flag-box now"><h3>' + icon('alert') + ' Ring 112, eller tag på skadestuen nu</h3><ul>' + now.map(f => '<li>' + esc(f.t) + '</li>').join('') + '</ul><p>Vent ikke med øvelserne – få hjælp først.</p></div>';
    if (today.length) h += '<div class="flag-box soon"><h3>Kontakt din læge i dag</h3><ul>' + today.map(f => '<li>' + esc(f.t) + '</li>').join('') + '</ul><p>Uden for åbningstid: ring 1813 (Region Hovedstaden. I andre regioner: ring til din egen læge eller vagtlægen).</p></div>';
    if (soon.length) h += '<div class="flag-box soon"><h3>Tal med din læge inden for 1–2 uger</h3><ul>' + soon.map(f => '<li>' + esc(f.t) + '</li>').join('') + '</ul><p>Du må gerne lave de skånsomme øvelser i mellemtiden, hvis de ikke gør det værre.</p></div>';
    return h;
  }
  function flagScreen(hit, next) {
    shell('Vigtigt', '<h2 class="q-title" id="flagScreen">Hvornår skal du til læge?</h2><p class="lead">Det, du har svaret, skal en læge se på.</p>' + flagBoxes(hit) +
      '<a class="card redflag-link" href="#/ryg/laege"><span aria-hidden="true">⚠️</span><span><b>Læs mere: Hvornår skal du til læge?</b><small>For hvert område i kroppen</small></span><span class="chev">›</span></a>' +
      '<button type="button" class="btn secondary" id="flagGo">Jeg har forstået – fortsæt spørgsmålene</button>');
    document.getElementById('flagGo').onclick = next;
  }
  /* --- Forslag: tre programmer --- */
  function planList(pid, step) {
    if (typeof isRyg === 'function' && isRyg(pid)) return rygExercises(pid, { spor: step === 0 ? 'hold' : 'forebyg', fase: Math.max(1, step) });
    if (pid === 'haelspore' && typeof haelPhaseExercises === 'function') return haelPhaseExercises(Math.max(1, step));
    return exercises.filter(e => e.category === pid && (Number(e.level) || 1) === Math.max(1, step));
  }
  function applyPlan(pid, step) {
    localStorage.setItem(KEY_LASTCAT, pid);
    if (typeof isRyg === 'function' && isRyg(pid)) rygSet(pid, { spor: step === 0 ? 'hold' : 'forebyg', fase: Math.max(1, step) });
    else if (pid === 'haelspore' && typeof haelSetPhase === 'function') haelSetPhase(Math.max(1, step));
    else setLevel(pid, Math.max(1, step));
  }
  const num = (v, d) => v == null ? d : Number(v);
  function profile(a) {
    const reg = a.primaer || regBase((a.omraade || [])[0] || 'knae'), pid = REGION_PROG[reg] || 'knae';
    const pain = num(a.smerte_nu, 4), fear = num(a.frygt, 3), conf = num(a.tiltro, 6);
    const acute = ['Under 1 uge', '1–4 uger'].includes(a.varighed) && !/^Gradvist/.test(a.start || '');
    const ai = ['Meget lavt', 'Lavt', 'Moderat', 'Højt', 'Meget højt'].indexOf(a.aktiv), act = ai < 0 ? 2 : [0, 1, 2, 3, 3][ai];
    const old = ['70–79', '80 eller ældre'].includes(a.alder), falls = false, hard = (a.svaert || []).filter(x => x !== 'Ingen af delene').length;
    const flare = /efter aktivitet|værre under/.test(a.reaktion || '') || a.dagen_efter === 'Ja, ofte' || ['Til dagen efter', 'Flere dage'].includes(a.varer);
    const hasHold = typeof isRyg === 'function' && isRyg(pid);
    let rec = 1;
    if (acute || pain >= 7 || (flare && pain >= 5)) rec = hasHold ? 0 : 1;
    else if (pain <= 3 && act >= 2 && conf >= 7 && hard <= 2) rec = 2;
    if (rec === 2 && (old && act < 3)) rec = 1;
    const hit = hitsOf(a);
    return { reg, pid, pain, fear, conf, acute, act, old, falls, hard, flare, rec, hasHold, hit, minLv: hasHold ? 0 : 1 };
  }
  function plans(a) {
    const p = profile(a), lo = Math.max(p.minLv, p.rec - 1), hi = Math.min(3, p.rec + 1);
    const days = /gange om ugen|par gange/.test(a.tid || '') ? '2–3' : '3', tid = a.tid && a.tid !== 'Ved ikke endnu' ? a.tid.replace(' dagligt', ' om dagen') : '10–20 min om dagen';
    const P = [
      { k: 'skaansom', name: 'Skånsom start', step: p.rec === lo ? lo : lo, dose: 'Halvdelen af gentagelserne og kun 2 sæt. 3 dage om ugen. Smerte op til 3 er i orden.', note: 'God, hvis du er usikker, har ondt nu eller lige er startet.' },
      { k: 'anbefalet', name: 'Anbefalet', step: p.rec, dose: 'Som beskrevet ved hver øvelse. ' + days + ' dage om ugen' + (/om dagen/.test(tid) ? ', ca. ' + tid : '') + '.', note: 'Passer bedst til dine svar.' },
      { k: 'udfordrende', name: 'Mere udfordrende', step: hi, dose: 'Fuld dosis, 4–5 dage om ugen + en rask gåtur på 20–30 minutter de fleste dage.', note: 'Hvis du har det godt med at træne og vil hurtigere frem.' }
    ];
    if (P[0].step === P[1].step && p.rec === lo) P[0].lighter = true;
    if (P[2].step === P[1].step) P[2].harder = true;
    const adv = [];
    if (p.fear >= 6) adv.push('Det er trygt at bevæge sig. Lidt ondt under træning betyder ikke, at du skader dig – kroppen bliver stærkere af at blive brugt.');
    if (p.conf <= 4) adv.push('Start småt: vælg 2–3 øvelser og en fast tid på dagen, fx efter morgenkaffen. Sæt kryds i appen – det hjælper at se fremgangen.');
    if (p.flare) adv.push('Dine smerter blusser op efter aktivitet: start lavt, og øg kun, når kroppen har det fint dagen efter.');
    if (p.acute) adv.push('Nye gener bliver ofte meget bedre over få uger. Hold dig i gang, og brug de skånsomme øvelser.');
    if (a.soevn === 'Dårlig' || /vågner|Begge/.test(a.soevn_smerte || '')) adv.push('Dårlig søvn gør smerter værre. Faste sengetider og lidt bevægelse i løbet af dagen hjælper.');
    if (a.stress === 'Ja, meget') adv.push('Stress kan gøre smerter værre. Små pauser, gåture og god søvn hjælper – og tal gerne med din læge, hvis det fylder meget.');
    if (p.act <= 1) adv.push('Prøv at gå en lille tur hver dag – start med 5–10 minutter og byg langsomt op.');
    adv.push('Smertereglen: 0–2 er fint, 3–5 er i orden, hvis det er faldet til ro næste morgen. Ellers skru ned.');
    return { p, P, adv };
  }
  function stepLabel(pid, step) {
    if (typeof isRyg === 'function' && isRyg(pid)) { const P = rygProg(pid); return step === 0 ? holdLabel(P) : fbLabel(P) + ' · ' + pWord(P) + ' ' + step; }
    return pid === 'haelspore' ? 'Fase ' + Math.max(1, step) : 'Niveau ' + Math.max(1, step);
  }
  function result() {
    const s = load(); if (!s || !s.a) return choice();
    const { p, P, adv } = plans(s.a), cat = CATEGORIES.find(c => c.id === p.pid);
    let h = '<h2 class="q-title" id="qResult">Tre forslag til dig</h2><p class="lead">Ud fra dine svar om <b>' + esc(regName(p.reg).toLowerCase()) + '</b>. Vælg det, der føles rigtigt – du kan altid skifte.</p>';
    if (p.hit.length) h += flagBoxes(p.hit);
    P.forEach((x, i) => {
      const list = planList(p.pid, x.step).slice(0, 5);
      h += '<div class="card plan-card' + (i === 1 ? ' rec' : '') + '" data-plan="' + x.k + '"><span class="plan-tag">' + (i === 1 ? '★ ' : '') + x.name + '</span>' +
        '<h3 style="margin-top:8px">' + esc(cat ? cat.name : p.pid) + ' · ' + esc(stepLabel(p.pid, x.step)) + '</h3><p class="muted small">' + esc(x.note) + '</p>' +
        list.map(e => '<a class="plan-ex" href="#/oevelse/' + encodeURIComponent(e.id) + '">' + thumbHtml(e) + '<span><b>' + esc(e.name) + '</b><br><span class="muted small">' + esc(x.lighter ? 'Halv dosis: ' + e.dose : e.dose) + '</span></span></a>').join('') +
        '<p class="small" style="margin-top:8px"><b>Dosis:</b> ' + esc(x.dose) + '</p><button type="button" class="btn' + (i === 1 ? ' cta' : ' secondary') + '" data-choose="' + i + '">' + icon('check') + ' Vælg ' + x.name.toLowerCase() + '</button></div>';
    });
    h += '<div class="card"><h3>Gode råd til dig</h3><ul class="tips">' + adv.map(t => '<li>' + esc(t) + '</li>').join('') + '</ul></div>';
    h += '<p class="hint">Forslaget bygger på dine egne svar og erstatter ikke en undersøgelse. Svarene ligger kun på denne telefon (Mere › Mine svar).</p>';
    shell('Dine forslag', h);
    $app.querySelectorAll('[data-choose]').forEach(b => b.onclick = () => {
      const x = P[Number(b.dataset.choose)]; applyPlan(p.pid, x.step);
      const s2 = load(); s2.valgt = { plan: x.k, pid: p.pid, step: x.step, at: Date.now() }; save(s2);
      document.body.classList.remove('onboarding'); toast(x.name + ' er valgt.'); location.hash = '#/'; if (typeof route === 'function') route();
    });
  }
  /* --- Mere › Mine svar: se, ret og slet --- */
  function mine() {
    setHeader('Mine svar', '#/mere'); setTab('mere'); document.body.classList.remove('onboarding');
    const s = load();
    let h = '<p class="lead">' + icon('shield') + ' Svarene gemmes kun på denne telefon. Intet sendes, og vi kender ikke dit navn.</p>';
    if (!s) h += '<div class="card"><p>Du har ikke svaret på spørgsmålene endnu.</p><button type="button" class="btn cta" id="qStart">Svar på spørgsmålene</button></div>';
    else {
      const list = visible(s.set, s.a);
      h += '<div class="card"><p><b>' + esc(Q_SETS[s.set].short) + '</b> · ' + Object.keys(s.a).length + ' svar' + (s.done ? '' : ' (ikke færdig)') + '</p>' +
        '<div class="row"><button type="button" class="btn cta" id="qRes">Se mine forslag</button><button type="button" class="btn secondary" id="qStart">Start forfra / skift</button></div></div>';
      h += list.map((q, i) => '<a class="card more-row" href="#/spoergsmaal/' + i + '" data-edit="' + i + '"><span class="mi">' + icon('edit') + '</span><span><b>' + esc(q.t) + '</b><small>' + esc(showVal(q, s.a)) + '</small></span><span class="chev">›</span></a>').join('');
      h += '<button type="button" class="btn danger" id="qDel">' + icon('trash') + ' Slet alle mine svar</button>';
    }
    $app.innerHTML = h;
    const st = document.getElementById('qStart'); if (st) st.onclick = () => choice(true);
    const rs = document.getElementById('qRes'); if (rs) rs.onclick = () => (load().done ? result() : ask(load().i || 0));
    const dl = document.getElementById('qDel'); if (dl) dl.onclick = () => { if (confirm('Slet alle dine svar på denne telefon?')) { localStorage.removeItem(KEY_SVAR); toast('Dine svar er slettet.'); mine(); } };
  }
  function showVal(q, a) {
    const v = a[q.id]; if (v == null) return 'Ikke besvaret';
    if (q.type === 'body') return v.map(x => BODY_REGIONS[x] ? BODY_REGIONS[x].name : x).join(', ') || '–';
    if (q.type === 'primary') return regName(v);
    if (q.type === 'flags') return v.length ? v.map(id => (FLAGS.find(f => f.id === id) || {}).t).join('; ') : 'Ingen';
    const t = a[q.id + '_txt'] ? ' – ' + a[q.id + '_txt'] : '';
    return (Array.isArray(v) ? v.join(', ') : String(v)) + t;
  }
  function routeQ(parts) {
    if (parts[1] === 'resultat') return result();
    if (parts[1] === 'valg') return choice(true);
    const s = load(); if (!s) return choice(true);
    return ask(parts[1] != null && parts[1] !== '' ? Number(parts[1]) : (s.i || 0));
  }
  return { choice, intro, endScreen, ask, result, mine, routeQ, plans, profile, planList, Q_SETS, FLAGS, load };
})();
