/* Led-programmer (skulder; senere albue, hånd, ankel og fod) – Hjemmeøvelser-appen.
   Samme opbygning som Ryg og nakke (ryg.js viser dem): to spor ("Ondt nu" og "Forebyg" med 3 niveauer + "Klar til næste niveau?"),
   "Hvornår skal du til læge?", gode råd og smerteregel. Indlæses efter data-ryg.js. Alle navne er præfikset LED_.
   Kilder (kort), skulder: Sundhedsstyrelsen NKR for udvalgte skulderlidelser (2013) og NKR for skulderartrose (2022);
   JOSPT CPG frossen skulder (Kelley m.fl. 2013) og CPG subakromiale smerter/rotator cuff (Desmeules m.fl. 2025 / Diercks 2014);
   Holmgren m.fl. BMJ 2012 (specifik træning mindsker behov for operation); Littlewood m.fl. 2016 (selvstyret træning med belastning);
   Pieters m.fl. 2020 (systematisk review: træning er førstevalg ved skuldersmerter); NICE CKS Shoulder pain (2023). */
'use strict';

const LED_AREAS = [
  { id: 'skulder', name: 'Skulder', icon: '💪', intro: 'Slidgigt i skulderen, frossen skulder og "klemt sene" (smerter, når du løfter armen).' }
];

const LED_PAIN_RULE = {
  skulder: 'Det må gerne gøre lidt ondt eller føles stramt, mens du træner: 0–2 er fint, og 3–5 er i orden, hvis det er faldet til ro igen næste morgen. ' +
    'Gør skulderen mere ondt næste dag, eller sover du dårligere, så skru ned: færre gentagelser, lavere løft eller lettere elastik. ' +
    'Stop og kontakt læge, hvis du får snurren, føleforstyrrelser eller kraftnedsættelse i armen, eller hvis noget i "Hvornår skal du til læge?" passer på dig.'
};

const LED_PROGRAMS = [
  {
    id: 'skulder', area: 'skulder', name: 'Skulder', long: 'Skulder', icon: 'skulder', word: 'Niveau', holdLabel: 'Ondt nu', fbLabel: 'Styrke', aboutTitle: 'Gode råd om skulderen',
    intro: 'Ondt i skulderen er meget almindeligt – især efter 50 år. Øvelser er den bedste behandling for de fleste: ved slidgigt, frossen skulder og smerter, når du løfter armen.',
    tabs: { hold: ['🆘 Ondt nu', 'Når skulderen gør ondt eller er stiv'], forebyg: ['💪 Styrke', 'Når det er blevet lidt bedre'] },
    hold: {
      title: 'Ondt eller stiv skulder – de første uger',
      calm: 'Skuldersmerter er sjældent tegn på en farlig skade. Ofte er senerne irriterede, eller leddet er blevet stift. Skulderen har godt af at blive brugt – roligt og uden at presse.',
      course: 'Smerter ved løft af armen (klemt sene) bliver som regel tydeligt bedre efter 6–12 ugers træning. Frossen skulder går langsomt over af sig selv, men det kan tage 1–2 år. Øvelserne holder bevægeligheden og letter smerten undervejs. Ved slidgigt går det op og ned – træning giver mindre smerte og bedre funktion.',
      advice: [
        'Brug armen i hverdagen, så godt du kan – men undgå de bevægelser, der gør meget ondt, i de første uger.',
        'Lav de blide øvelser flere gange om dagen, kort ad gangen. Små og hyppige bevægelser hjælper mest.',
        'Varme (en varmepude eller et varmt bad) kan lindre stivhed. Nogle har mere glæde af kulde i 10–15 minutter, når det er irriteret.',
        'Smertestillende håndkøbsmedicin kan hjælpe dig til at bevæge armen og sove. Følg pakningen, og spørg apoteket eller lægen.',
        'Bær ikke tunge ting med strakt arm, og løft ikke over hovedet, før det gør mindre ondt.'
      ],
      positions: [
        'Om natten: lig på ryggen eller på den raske side med en pude i armen, så den onde arm hviler.',
        'Siddende: læg armen på en pude i skødet eller på armlænet, så skulderen ikke hænger.',
        'Undgå at ligge på den onde skulder.'
      ],
      exercises: ['skulder-h-pendul', 'skulder-h-bordglid', 'skulder-h-stok-liggende', 'skulder-h-udadrot-stok']
    },
    phases: [
      { n: 1, name: 'Niveau 1: Bevægelighed', weeks: 'Ca. uge 1–4', color: '#5b8def', goal: 'Få armen til at bevæge sig frit og vække musklerne omkring skulderen.',
        exercises: ['skulder-1-loeft-frem', 'skulder-1-isometrisk-udad', 'bryst-1-skulderblad', 'skulder-h-udadrot-stok', 'skulder-h-bordglid'],
        criteria: ['Jeg kan løfte armen frem til skulderhøjde uden smerte over 3.', 'Jeg kan presse udad mod væggen i 10 sekunder uden at få mere ondt.', 'Skulderen gør ikke mere ondt næste morgen efter træning.'] },
      { n: 2, name: 'Niveau 2: Styrke', weeks: 'Ca. uge 4–10', color: '#3aa17e', goal: 'Gør de små muskler omkring skulderen og skulderbladet stærkere.',
        exercises: ['skulder-2-udadrot-elastik', 'skulder-2-sideloeft', 'bryst-2-roning-elastik', 'skulder-1-loeft-frem', 'bryst-1-skulderblad'],
        criteria: ['Jeg kan lave 3 sæt med 12 gentagelser udadrotation med elastik.', 'Jeg kan løfte armene ud til siden med en vandflaske 12 gange uden smerte over 3.', 'Jeg kan tage en jakke på uden at det gør meget ondt.'] },
      { n: 3, name: 'Niveau 3: Over hovedet', weeks: 'Fra ca. uge 10 – og så resten af livet', color: '#e0913a', goal: 'Gør skulderen klar til at løfte over hovedet, bære og bruge armen i haven og til sport.',
        exercises: ['skulder-3-armstraek-op', 'skulder-3-vaegpres', 'bryst-2-vaegengel', 'skulder-2-udadrot-elastik', 'bryst-2-roning-elastik'],
        criteria: ['Jeg kan løfte en vandflaske op over hovedet 10 gange uden smerte over 3.', 'Jeg kan lave 10 armstrækninger mod væggen.', 'Jeg træner skulderen 2–3 gange om ugen.'] }
    ],
    everyday: [
      'Træn 2–3 gange om ugen, også når skulderen har det godt. Styrken forsvinder hurtigt igen.',
      'Sid og stå rank, med skuldrene nede og tilbage – især ved computer og telefon.',
      'Bær tasker tæt ind til kroppen, og skift arm.',
      'Hold pauser ved arbejde over hovedet (fx at hænge gardiner op eller beskære træer).',
      'Kommer smerten igen? Gå tilbage til "Ondt nu" i et par uger, og byg op igen.'
    ],
    about: [
      ['Slidgigt (artrose) i skulderen', 'Brusken i leddet er blevet tyndere. Skulderen kan være stiv og knase. Øvelser, der holder bevægeligheden og styrken, mindsker smerten for de fleste. Hvis smerten bliver meget slem trods træning, kan en operation (ny skulder) komme på tale – tal med din læge.'],
      ['Frossen skulder', 'Ledkapslen bliver betændt og stram, så armen bliver meget stiv – især når du drejer den udad og løfter den. Det kommer i faser: først mest smerte, så mest stivhed, og til sidst bliver det langsomt bedre. Blide øvelser hver dag hjælper. Pres ikke igennem smerten. Har du sukkersyge, er det ekstra almindeligt.'],
      ['Klemt sene (subakromiale smerter)', 'Det gør ondt på ydersiden af skulderen, når du løfter armen ud til siden eller op, og ofte om natten. Senerne er irriterede. Gradvis styrketræning er den bedste behandling – lige så god som operation for de fleste.'],
      ['Må det gøre ondt?', 'Ja, lidt. Det er normalt, at skulderen gør lidt ondt under træningen. Det vigtige er, at smerten er faldet til ro igen næste morgen. Se smertereglen nederst.'],
      ['Søvn', 'Mange med ondt i skulderen sover dårligt. Lig med en pude i armen, og tag evt. smertestillende om aftenen. Søvnen bliver som regel bedre, når træningen begynder at virke.']
    ],
    redFlags: {
      now: ['Du får pludselig smerter eller trykken i brystet, der stråler ud i skulderen eller armen, især med åndenød, sved eller kvalme (kan være hjertet).', 'Skulderen er gået ud af led, eller armen ser forkert ud efter et fald.', 'Du får pludselig lammelse eller føleforstyrrelser i armen sammen med skæv mund eller besvær med at tale.'],
      today: ['Skulderen er rød, varm og hævet, og du har feber eller føler dig syg.', 'Du kan pludselig ikke løfte armen efter et fald eller et tungt løft.', 'Du har så stærke smerter, at du slet ikke kan bevæge armen, selv med smertestillende.', 'Du får snurren, føleforstyrrelser eller kraftnedsættelse ned i armen og hånden, der bliver værre.'],
      weeks: ['Det er ikke blevet bedre efter 1–2 uger, trods øvelserne.', 'Skulderen bliver mere og mere stiv, så du ikke kan løfte armen eller tage tøj på.', 'Smerten er værst om natten og bliver ikke bedre af at skifte stilling.', 'Du har eller har haft kræft, eller du taber dig uden at ville det.']
    }
  }
];

const LED_PAIN_CHECK = {
  skulder: { beforeQuestion: 'Hvor ondt har du i skulderen lige nu?', afterQuestion: 'Hvor ondt har du i skulderen nu, efter øvelserne?' }
};
const LED_READY_TEXT = {
  allChecked: 'Flot! Du er klar til næste niveau. Start roligt, og hold øje med, hvordan skulderen har det næste morgen.',
  notYet: 'Ikke helt endnu – og det er helt normalt. Bliv på niveauet en uge eller to mere, og tjek igen.'
};

const LED_EXERCISES = [
  /* ================= SKULDER – ONDT NU ================= */
  {
    id: 'skulder-h-pendul', category: 'skulder', track: 'hold', level: 1, phases: [1],
    images: [{"src": "images/skulder-h-pendul/1.webp", "caption": "1. Stil dig ved et bord, og støt dig med den raske hånd. Bøj dig lidt frem.", "w": 480, "h": 573}, {"src": "images/skulder-h-pendul/2.webp", "caption": "2. Lad den onde arm hænge helt afslappet ned.", "w": 480, "h": 573}, {"src": "images/skulder-h-pendul/3.webp", "caption": "3. Sving armen roligt frem og tilbage, som et pendul. Lav også små cirkler.", "w": 480, "h": 573}], /* auto: tools/sync_images.py */
    name: 'Pendulsving',
    equipment: 'Et bord eller en stoleryg at støtte på.',
    dose: '30–60 sekunder. Gerne 3–5 gange om dagen.',
    steps: ['Stil dig ved et bord, og støt dig med den raske hånd. Bøj dig lidt frem.', 'Lad den onde arm hænge helt afslappet ned.', 'Sving armen roligt frem og tilbage, som et pendul. Lav også små cirkler.'],
    tips: ['Armen skal hænge tungt – bevægelsen kommer fra kroppen, der vugger lidt.', 'Sving kun så langt, det er rart.'],
    progression: 'Lettere: kun små sving. Sværere: lidt større cirkler, eller hold en lille vandflaske.',
    stop: LED_PAIN_RULE.skulder
  },
  {
    id: 'skulder-h-bordglid', category: 'skulder', track: 'hold', level: 1, phases: [1],
    images: [{"src": "images/skulder-h-bordglid/1.webp", "caption": "1. Sid ved et bord med hånden på et håndklæde.", "w": 480, "h": 511}, {"src": "images/skulder-h-bordglid/2.webp", "caption": "2. Glid hånden roligt frem på bordet, og bøj overkroppen med frem, til du mærker et let stræk.", "w": 480, "h": 511}, {"src": "images/skulder-h-bordglid/3.webp", "caption": "3. Hold 5 sekunder, og glid tilbage igen.", "w": 480, "h": 511}], /* auto: tools/sync_images.py */
    name: 'Glid armen frem på bordet',
    equipment: 'Et bord, en stol og et håndklæde.',
    dose: '10 gange. Hold 5 sekunder fremme. 2–3 gange om dagen.',
    steps: ['Sid ved et bord med hånden på et håndklæde.', 'Glid hånden roligt frem på bordet, og bøj overkroppen med frem, til du mærker et let stræk.', 'Hold 5 sekunder, og glid tilbage igen.'],
    tips: ['Lad bordet bære armen – skulderen skal ikke arbejde.', 'Du kan også glide ud til siden.'],
    progression: 'Sværere: glid længere frem, eller lav det stående ved en væg, hvor hånden glider op ad væggen.',
    stop: LED_PAIN_RULE.skulder
  },
  {
    id: 'skulder-h-stok-liggende', category: 'skulder', track: 'hold', level: 1, phases: [1],
    images: [{"src": "images/skulder-h-stok-liggende/1.webp", "caption": "1. Lig på ryggen med bøjede knæ. Hold stokken med begge hænder.", "w": 720, "h": 281}, {"src": "images/skulder-h-stok-liggende/2.webp", "caption": "2. Løft roligt armene op og bagud over hovedet. Den raske arm hjælper den onde.", "w": 720, "h": 281}, {"src": "images/skulder-h-stok-liggende/3.webp", "caption": "3. Gå kun så langt, det er rart, og før armene tilbage igen.", "w": 720, "h": 281}], /* auto: tools/sync_images.py */
    name: 'Armløft liggende med stok',
    equipment: 'En stok eller et kosteskaft og en måtte eller sengen.',
    dose: '10 gange. 2 gange om dagen.',
    steps: ['Lig på ryggen med bøjede knæ. Hold stokken med begge hænder.', 'Løft roligt armene op og bagud over hovedet. Den raske arm hjælper den onde.', 'Gå kun så langt, det er rart, og før armene tilbage igen.'],
    tips: ['Albuerne må gerne være lidt bøjede.', 'Lænden bliver liggende – svaj ikke.'],
    progression: 'Sværere: hold 5 sekunder i toppen, eller lav det siddende.',
    stop: LED_PAIN_RULE.skulder
  },
  {
    id: 'skulder-h-udadrot-stok', category: 'skulder', track: 'hold', level: 1, phases: [1],
    images: [{"src": "images/skulder-h-udadrot-stok/1.webp", "caption": "1. Stå eller sid med albuerne ind til siden og bøjet i en ret vinkel. Hold stokken med begge hænder.", "w": 480, "h": 528}, {"src": "images/skulder-h-udadrot-stok/2.webp", "caption": "2. Skub med den raske hånd, så den onde arms hånd drejer ud til siden. Albuen bliver ved kroppen.", "w": 480, "h": 528}, {"src": "images/skulder-h-udadrot-stok/3.webp", "caption": "3. Hold 3 sekunder, og før hånden tilbage.", "w": 480, "h": 528}], /* auto: tools/sync_images.py */
    name: 'Drej armen udad med stok',
    equipment: 'En stok eller et kosteskaft. Evt. et sammenrullet håndklæde.',
    dose: '10 gange. Hold 3 sekunder ude. 2 gange om dagen.',
    steps: ['Stå eller sid med albuerne ind til siden og bøjet i en ret vinkel. Hold stokken med begge hænder.', 'Skub med den raske hånd, så den onde arms hånd drejer ud til siden. Albuen bliver ved kroppen.', 'Hold 3 sekunder, og før hånden tilbage.'],
    tips: ['Det er den bevægelse, der bliver stiv først ved frossen skulder. Gå roligt frem.', 'Et sammenrullet håndklæde mellem albue og krop hjælper dig til at holde albuen inde.'],
    progression: 'Sværere: drej lidt længere ud, og hold 5 sekunder.',
    stop: LED_PAIN_RULE.skulder
  },
  /* ================= SKULDER – NIVEAU 1 ================= */
  {
    id: 'skulder-1-loeft-frem', category: 'skulder', track: 'forebyg', level: 1, phases: [1, 2],
    images: [{"src": "images/skulder-1-loeft-frem/1.webp", "caption": "1. Stå rank med armen ned langs siden og tommelfingeren pegende frem.", "w": 480, "h": 588}, {"src": "images/skulder-1-loeft-frem/2.webp", "caption": "2. Løft armen roligt frem og op – til skulderhøjde, eller så højt det er rart.", "w": 480, "h": 588}, {"src": "images/skulder-1-loeft-frem/3.webp", "caption": "3. Sænk den langsomt ned igen.", "w": 480, "h": 588}], /* auto: tools/sync_images.py */
    name: 'Løft armen frem',
    equipment: 'Ingen. Senere en lille vandflaske.',
    dose: '2–3 sæt med 10 gentagelser. 3 gange om ugen.',
    steps: ['Stå rank med armen ned langs siden og tommelfingeren pegende frem.', 'Løft armen roligt frem og op – til skulderhøjde, eller så højt det er rart.', 'Sænk den langsomt ned igen.'],
    tips: ['Skulderen skal ned, ikke op mod øret.', 'Langsomt ned er vigtigere end hurtigt op.'],
    progression: 'Lettere: løft kun halvt op, eller lav det liggende. Sværere: hold en vandflaske (½ liter), og løft højere.',
    stop: LED_PAIN_RULE.skulder
  },
  {
    id: 'skulder-1-isometrisk-udad', category: 'skulder', track: 'forebyg', level: 1, phases: [1],
    images: [{"src": "images/skulder-1-isometrisk-udad/1.webp", "caption": "1. Stå med siden mod væggen. Albuen er ind til kroppen og bøjet i en ret vinkel.", "w": 480, "h": 528}, {"src": "images/skulder-1-isometrisk-udad/2.webp", "caption": "2. Pres håndryggen ud mod væggen med cirka halv kraft. Armen flytter sig ikke.", "w": 480, "h": 528}, {"src": "images/skulder-1-isometrisk-udad/3.webp", "caption": "3. Hold 10 sekunder, slip, og hvil.", "w": 480, "h": 528}], /* auto: tools/sync_images.py */
    name: 'Pres udad mod væggen',
    equipment: 'En væg eller en dørkarm og evt. et foldet håndklæde.',
    dose: '5 gange. Hold 10 sekunder. Hvil 10 sekunder imellem. Hver dag.',
    steps: ['Stå med siden mod væggen. Albuen er ind til kroppen og bøjet i en ret vinkel.', 'Pres håndryggen ud mod væggen med cirka halv kraft. Armen flytter sig ikke.', 'Hold 10 sekunder, slip, og hvil.'],
    tips: ['Spændingen uden bevægelse lindrer ofte smerten.', 'Træk vejret roligt – hold ikke vejret.'],
    progression: 'Sværere: pres lidt hårdere, eller hold 20–30 sekunder.',
    stop: LED_PAIN_RULE.skulder
  },
  /* ================= SKULDER – NIVEAU 2 ================= */
  {
    id: 'skulder-2-udadrot-elastik', category: 'skulder', track: 'forebyg', level: 2, phases: [2, 3],
    images: [{"src": "images/skulder-2-udadrot-elastik/1.webp", "caption": "1. Stå med siden mod døren. Hold elastikken i hånden længst væk fra døren. Albuen er ind til kroppen og bøjet i en ret vinkel.", "w": 480, "h": 511}, {"src": "images/skulder-2-udadrot-elastik/2.webp", "caption": "2. Drej hånden roligt ud til siden mod elastikken. Albuen bliver ved kroppen.", "w": 480, "h": 511}, {"src": "images/skulder-2-udadrot-elastik/3.webp", "caption": "3. Før hånden langsomt tilbage.", "w": 480, "h": 511}], /* auto: tools/sync_images.py */
    name: 'Drej armen udad med elastik',
    equipment: 'En træningselastik bundet fast i et dørhåndtag. Evt. et sammenrullet håndklæde.',
    dose: '3 sæt med 10–15 gentagelser. 3 gange om ugen.',
    steps: ['Stå med siden mod døren. Hold elastikken i hånden længst væk fra døren. Albuen er ind til kroppen og bøjet i en ret vinkel.', 'Drej hånden roligt ud til siden mod elastikken. Albuen bliver ved kroppen.', 'Før hånden langsomt tilbage.'],
    tips: ['Et sammenrullet håndklæde mellem albue og krop hjælper.', 'Hellere en let elastik og rolige bevægelser end en hård.'],
    progression: 'Sværere: en hårdere elastik, eller stå længere fra døren.',
    stop: LED_PAIN_RULE.skulder
  },
  {
    id: 'skulder-2-sideloeft', category: 'skulder', track: 'forebyg', level: 2, phases: [2, 3],
    images: [{"src": "images/skulder-2-sideloeft/1.webp", "caption": "1. Stå rank med armene ned langs siden og tommelfingrene pegende frem.", "w": 480, "h": 495}, {"src": "images/skulder-2-sideloeft/2.webp", "caption": "2. Løft armene roligt ud til siden og lidt frem – til skulderhøjde.", "w": 480, "h": 495}, {"src": "images/skulder-2-sideloeft/3.webp", "caption": "3. Sænk dem langsomt igen.", "w": 480, "h": 495}], /* auto: tools/sync_images.py */
    name: 'Løft armene ud til siden',
    equipment: 'To små vandflasker (½ liter) eller ingenting.',
    dose: '3 sæt med 10–12 gentagelser. 3 gange om ugen.',
    steps: ['Stå rank med armene ned langs siden og tommelfingrene pegende frem.', 'Løft armene roligt ud til siden og lidt frem – til skulderhøjde.', 'Sænk dem langsomt igen.'],
    tips: ['Løft ikke højere end skuldrene.', 'Armene er lidt foran kroppen, ikke helt ude til siden – det skåner senerne.'],
    progression: 'Lettere: én arm ad gangen og uden vægt. Sværere: større flasker.',
    stop: LED_PAIN_RULE.skulder
  },
  /* ================= SKULDER – NIVEAU 3 ================= */
  {
    id: 'skulder-3-armstraek-op', category: 'skulder', track: 'forebyg', level: 3, phases: [3],
    images: [{"src": "images/skulder-3-armstraek-op/1.webp", "caption": "1. Stå rank med flaskerne i højde med skuldrene og albuerne bøjet.", "w": 480, "h": 495}, {"src": "images/skulder-3-armstraek-op/2.webp", "caption": "2. Pres armene roligt op over hovedet, til de er næsten strakte.", "w": 480, "h": 495}, {"src": "images/skulder-3-armstraek-op/3.webp", "caption": "3. Sænk langsomt ned til skulderhøjde igen.", "w": 480, "h": 495}], /* auto: tools/sync_images.py */
    name: 'Løft over hovedet',
    equipment: 'To vandflasker eller små håndvægte.',
    dose: '3 sæt med 8–12 gentagelser. 2–3 gange om ugen.',
    steps: ['Stå rank med flaskerne i højde med skuldrene og albuerne bøjet.', 'Pres armene roligt op over hovedet, til de er næsten strakte.', 'Sænk langsomt ned til skulderhøjde igen.'],
    tips: ['Spænd let i maven, så du ikke svajer i ryggen.', 'Gør det ondt i toppen? Så stop lidt før.'],
    progression: 'Lettere: én arm ad gangen, eller lav det siddende. Sværere: tungere flasker.',
    stop: LED_PAIN_RULE.skulder
  },
  {
    id: 'skulder-3-vaegpres', category: 'skulder', track: 'forebyg', level: 3, phases: [3],
    images: [{"src": "images/skulder-3-vaegpres/1.webp", "caption": "1. Stå en armlængde fra væggen, og sæt hænderne på væggen i skulderhøjde.", "w": 480, "h": 570}, {"src": "images/skulder-3-vaegpres/2.webp", "caption": "2. Bøj albuerne roligt, så brystet kommer ind mod væggen. Kroppen er lige.", "w": 480, "h": 570}, {"src": "images/skulder-3-vaegpres/3.webp", "caption": "3. Pres dig ud igen, og skub til sidst skulderbladene lidt frem.", "w": 480, "h": 570}], /* auto: tools/sync_images.py */
    name: 'Armstrækninger mod væggen',
    equipment: 'En væg.',
    dose: '3 sæt med 10 gentagelser. 2–3 gange om ugen.',
    steps: ['Stå en armlængde fra væggen, og sæt hænderne på væggen i skulderhøjde.', 'Bøj albuerne roligt, så brystet kommer ind mod væggen. Kroppen er lige.', 'Pres dig ud igen, og skub til sidst skulderbladene lidt frem.'],
    tips: ['Albuerne peger skråt ned – ikke ud til siden.', 'Jo længere fødderne er fra væggen, jo sværere.'],
    progression: 'Lettere: stå tættere på væggen. Sværere: brug en køkkenbordkant i stedet for væggen.',
    stop: LED_PAIN_RULE.skulder
  }
];
if (typeof RYG_PAIN_CHECK !== 'undefined') Object.assign(RYG_PAIN_CHECK, LED_PAIN_CHECK);
LED_PROGRAMS.forEach(p => { p.ready = LED_READY_TEXT; p.painRule = LED_PAIN_RULE[p.id]; });
