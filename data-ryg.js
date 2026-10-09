/* Ryg og nakke: Lænd, Brystryg (øvre ryg) og Nakke – Hjemmeøvelser-appen.
   Generelt program. Ingen klientdata. Indlæses efter data.js. Alle navne er præfikset RYG_.
   Hvert delprogram har to spor:
   - "Hold – de første dage": blide bevægelser mod smerte og stivhed, råd, aflastende stillinger, forventet forløb.
   - "Forebyg": 3 faser med gradvis styrke og bevægelighed + "Klar til næste fase?".
   Kilder (kort): Sundhedsstyrelsen NKR lænderygsmerter (2016) og nakkesmerter (2016); NICE NG59 (2016, opd. 2020);
   JOSPT CPG lændesmerter (George m.fl. 2021) og nakkesmerter (Blanpied m.fl. 2017); Lancet-serien om lændesmerter (2018);
   Cochrane: træning forebygger nye episoder med lændesmerter (Steffens 2016, Shiri 2018). Brystryggen har mindre forskning –
   øvelserne bygger på de samme principper (bevægelse, gradvis styrke, ro på). */
'use strict';

const RYG_AREA = {
  id: 'ryg', name: 'Ryg og nakke', icon: 'ryg',
  intro: 'Vælg det sted, det gør ondt. Hvert program har to dele: "Hold – de første dage", når ryggen eller nakken lige har låst, og "Forebyg", når det er blevet bedre.'
};

/* Smerteregel for ryg og nakke */
const RYG_PAIN_RULE =
  'Det må gerne gøre lidt ondt eller føles stramt, mens du laver øvelserne: 0–2 er fint, og 3–5 er i orden, hvis det er faldet til ro igen næste dag. ' +
  'Gør det mere ondt næste dag, så skru ned: færre gentagelser, mindre bevægelse eller et lettere spor. ' +
  'Stop og kontakt læge, hvis smerten stråler længere ned i benet eller armen, hvis du får snurren, følelsesløshed eller kraftnedsættelse, eller hvis noget af det i "Hvornår skal du til læge?" passer på dig.';

const RYG_PAIN_CHECK = {
  laend: { beforeQuestion: 'Hvor ondt har du i lænden lige nu?', afterQuestion: 'Hvor ondt har du i lænden nu, efter øvelserne?' },
  bryst: { beforeQuestion: 'Hvor ondt har du mellem skulderbladene lige nu?', afterQuestion: 'Hvor ondt har du mellem skulderbladene nu, efter øvelserne?' },
  nakke: { beforeQuestion: 'Hvor ondt har du i nakken lige nu?', afterQuestion: 'Hvor ondt har du i nakken nu, efter øvelserne?' }
};

/* ---------- De tre delprogrammer ---------- */
const RYG_PROGRAMS = [
  {
    id: 'laend', name: 'Lænd', long: 'Lænd (lænderyg)', icon: 'laend',
    intro: 'Ondt i lænden er meget almindeligt og sjældent farligt. De fleste har det meget bedre efter få dage til få uger.',
    hold: {
      title: 'Hold i lænden – de første dage',
      calm: 'Et "hold i ryggen" gør ondt, men det er næsten aldrig tegn på skade. Ryggen er stærk. Smerten skyldes oftest, at muskler og led er irriterede og spændte.',
      course: 'De fleste har det tydeligt bedre efter 1–2 uger og er helt ovre det efter 4–6 uger. Det er normalt, at det går op og ned undervejs.',
      advice: [
        'Hold dig i gang. Gå små ture flere gange om dagen, også selvom det gør lidt ondt. Sengeleje gør det værre.',
        'Varme hjælper mange: en varmepude, et varmt bad eller en varm bruser på lænden i 15–20 minutter.',
        'Skift stilling tit. Sid ikke stille mere end 20–30 minutter ad gangen.',
        'Smertestillende håndkøbsmedicin kan hjælpe dig til at bevæge dig. Følg pakningen, og spørg apoteket eller lægen.',
        'Tag ikke tunge løft de første dage, men gør gerne almindelige ting i hjemmet i roligt tempo.'
      ],
      positions: [
        'På ryggen med underbenene på en stol eller sofa (se øvelsen "Hvilestilling").',
        'På siden med en pude mellem knæene.',
        'På maven med en pude under maven, hvis det føles godt.'
      ],
      exercises: ['laend-h-knaevip', 'laend-h-baekkenvip', 'laend-h-kat-ko', 'laend-h-hvilestilling']
    },
    phases: [
      { n: 1, name: 'Fase 1: Kom i gang', weeks: 'Ca. uge 1–3', color: '#5b8def', goal: 'Bevæg dig frit igen og vågn op i de dybe mavemuskler og ballerne.',
        exercises: ['laend-1-bro', 'laend-1-dead-bug', 'laend-h-kat-ko', 'laend-h-knaevip'],
        criteria: ['Jeg kan gå 20 minutter uden at få mere ondt bagefter.', 'Jeg kan lave broen 10 gange uden smerte over 3.', 'Jeg kan tage strømper på uden stor besvær.'] },
      { n: 2, name: 'Fase 2: Styrke', weeks: 'Ca. uge 3–8', color: '#3aa17e', goal: 'Byg styrke i ryg, mave og baller, og lær at bøje dig med ret ryg.',
        exercises: ['laend-1-bro', 'laend-2-fuglehund', 'laend-2-sideplanke-knae', 'laend-2-hoftehaengsel', 'laend-1-dead-bug'],
        criteria: ['Jeg kan lave fuglehund 10 gange til hver side med rolig ryg.', 'Jeg kan holde sideplanken på knæ i 20 sekunder til hver side.', 'Smerten er højst 2 i hverdagen.'] },
      { n: 3, name: 'Fase 3: Hverdag og løft', weeks: 'Fra ca. uge 8 – og så resten af livet', color: '#e0913a', goal: 'Gør ryggen klar til løft, havearbejde og sport – og hold den stærk.',
        exercises: ['laend-3-loefteteknik', 'laend-2-hoftehaengsel', 'laend-2-fuglehund', 'laend-2-sideplanke-knae', 'laend-1-bro'],
        criteria: ['Jeg kan løfte en indkøbspose fra gulvet uden at få ondt bagefter.', 'Jeg træner 2–3 gange om ugen.', 'Jeg ved, hvad jeg gør, hvis det kommer igen.'] }
    ],
    everyday: [
      'Løft tæt ind til kroppen, bøj i hofter og knæ, og drej med fødderne – ikke med ryggen.',
      'Bevæg dig hver dag: 30 minutters gang, cykling eller svømning er god rygmedicin.',
      'Rejs dig og gå lidt hver halve time, når du sidder meget.',
      'Sov nok. Dårlig søvn og stress gør ryggen mere følsom.',
      'Kommer det igen? Så start på "Hold – de første dage", og byg op igen. Det går som regel hurtigere anden gang.'
    ],
    redFlags: {
      now: ['Du mister følelsen i skridtet, ved endetarmen eller på indersiden af lårene ("ridebukse-område").', 'Du kan ikke tisse, eller du kan ikke holde på tis eller afføring.', 'Du får pludselig lammelse eller meget svage ben.', 'Rygsmerten kom efter et alvorligt fald eller en ulykke.'],
      today: ['Smerten stråler ned under knæet og bliver værre, eller du får snurren eller følelsesløshed i benet eller foden.', 'Du har feber og har det dårligt samtidig med rygsmerten.', 'Smerten er så stærk, at du slet ikke kan bevæge dig, selv med smertestillende.'],
      weeks: ['Det er ikke blevet bedre efter 1–2 uger.', 'Du har eller har haft kræft.', 'Du taber dig uden at ville det.', 'Smerten er værst om natten og i hvile og bliver ikke bedre af at skifte stilling.', 'Du er over 65 og har knogleskørhed eller tager binyrebarkhormon (prednisolon).']
    }
  },
  {
    id: 'bryst', name: 'Brystryg', long: 'Brystryg (øvre ryg, mellem skulderbladene)', icon: 'bryst',
    intro: 'Ondt mellem skulderbladene kommer ofte af stivhed, meget stillesiddende arbejde eller en "forkert" bevægelse. Det går som regel over af sig selv.',
    hold: {
      title: 'Hold mellem skulderbladene – de første dage',
      calm: 'Et hold mellem skulderbladene kan gøre så ondt, at det er svært at trække vejret dybt. Det er ubehageligt, men oftest ufarligt. Små rolige bevægelser og varme hjælper.',
      course: 'De fleste har det bedre efter få dage og er ovre det efter 1–3 uger.',
      advice: [
        'Bevæg dig roligt. Gå ture, og lad armene svinge.',
        'Varme på ryggen: en varmepude eller et varmt bad i 15–20 minutter.',
        'Træk vejret roligt og dybt ned i maven og ud i siderne – også selvom det strammer lidt.',
        'Hold pause fra skærmen hver halve time. Rul skuldrene, og kig op.',
        'Smertestillende håndkøbsmedicin kan hjælpe dig til at bevæge dig. Følg pakningen.'
      ],
      positions: [
        'På ryggen med et sammenrullet håndklæde på langs under ryggen og armene ud til siden.',
        'Siddende med ryggen godt støttet og en lille pude i lænden.',
        'På siden med en pude foran brystet til den øverste arm.'
      ],
      exercises: ['bryst-h-skulderrul', 'bryst-h-ribben', 'bryst-h-kat-ko', 'bryst-h-aaben-bog']
    },
    phases: [
      { n: 1, name: 'Fase 1: Bevægelighed', weeks: 'Ca. uge 1–3', color: '#5b8def', goal: 'Få brystryggen til at bevæge sig frit igen.',
        exercises: ['bryst-1-straek-stol', 'bryst-1-skulderblad', 'bryst-h-aaben-bog', 'bryst-h-kat-ko'],
        criteria: ['Jeg kan dreje mig og kigge bagud uden stor smerte.', 'Jeg kan trække vejret dybt uden at det stikker.', 'Smerten er højst 3 i hverdagen.'] },
      { n: 2, name: 'Fase 2: Styrke', weeks: 'Ca. uge 3–8', color: '#3aa17e', goal: 'Styrk musklerne mellem skulderbladene, så du lettere kan sidde og stå rank.',
        exercises: ['bryst-2-roning-elastik', 'bryst-2-vaegengel', 'bryst-1-skulderblad', 'bryst-1-straek-stol'],
        criteria: ['Jeg kan lave 3 × 12 roninger med elastik uden smerte over 2.', 'Jeg kan lave 10 vægengle med armene mod væggen.', 'Jeg holder pauser fra skærmen.'] },
      { n: 3, name: 'Fase 3: Stærk og rank', weeks: 'Fra ca. uge 8', color: '#e0913a', goal: 'Hold ryggen stærk med lidt tungere øvelser 2–3 gange om ugen.',
        exercises: ['bryst-3-roning-foroverboejet', 'bryst-2-roning-elastik', 'bryst-2-vaegengel', 'bryst-h-aaben-bog'],
        criteria: ['Jeg træner 2–3 gange om ugen.', 'Jeg kan bære indkøb og arbejde i haven uden at få ondt bagefter.'] }
    ],
    everyday: [
      'Hav skærmen i øjenhøjde, og sid helt inde på stolen med støtte i ryggen.',
      'Rejs dig hver halve time. Rul skuldrene, og stræk armene op.',
      'Bær tasker skiftevis i begge hænder, eller brug en rygsæk med begge stropper.',
      'Gå, cykel eller svøm – og lad armene arbejde med.'
    ],
    redFlags: {
      now: ['Du har trykken, smerte eller tyngde i brystet, eller smerten stråler ud i armen, halsen eller kæben.', 'Du bliver pludselig forpustet, svimmel eller får koldsved.', 'Du får pludselig en meget stærk, rivende smerte i ryggen.', 'Smerten kom efter et alvorligt fald eller en ulykke.'],
      today: ['Du har feber, hoste eller det gør ondt at trække vejret.', 'Du får snurren, følelsesløshed eller svaghed i begge ben.', 'Smerten er meget stærk og bliver ikke bedre af at skifte stilling.'],
      weeks: ['Det er ikke blevet bedre efter 1–2 uger.', 'Du har eller har haft kræft.', 'Du taber dig uden at ville det.', 'Smerten er værst om natten og i hvile.', 'Du har knogleskørhed eller tager binyrebarkhormon (prednisolon).']
    }
  },
  {
    id: 'nakke', name: 'Nakke', long: 'Nakke', icon: 'nakke',
    intro: 'Ondt i nakken eller en stiv nakke er meget almindeligt og næsten altid ufarligt. Rolige bevægelser hjælper bedre end at holde nakken stille.',
    hold: {
      title: 'Hold i nakken – de første dage',
      calm: 'Et hold i nakken (fx når du vågner) gør ondt og kan gøre det svært at dreje hovedet. Det er ikke farligt. Nakken bliver bedre af at blive brugt – stille og roligt.',
      course: 'De fleste har det bedre efter få dage og er ovre det efter 1–2 uger. Det kan godt være lidt stift i nogle uger.',
      advice: [
        'Bevæg nakken roligt i alle retninger flere gange om dagen – kun så langt, det er rart.',
        'Varme på nakken og skuldrene: en varmepude, et varmt halstørklæde eller et varmt bad.',
        'Brug ikke halskrave. Den gør nakken stivere.',
        'Hold pauser fra mobil og skærm. Løft skærmen op i øjenhøjde.',
        'Smertestillende håndkøbsmedicin kan hjælpe dig til at bevæge dig. Følg pakningen.'
      ],
      positions: [
        'På ryggen med en lav pude, der kun fylder ud under nakken.',
        'På siden med en pude, der holder hovedet lige (ikke for høj).',
        'Siddende i en stol med høj ryg, så hovedet kan hvile.'
      ],
      exercises: ['nakke-h-hagetilbage', 'nakke-h-skulderrul', 'nakke-h-drej', 'nakke-h-sideboej']
    },
    phases: [
      { n: 1, name: 'Fase 1: Bevægelse og dybe muskler', weeks: 'Ca. uge 1–3', color: '#5b8def', goal: 'Bevæg nakken frit igen, og vågn op i de dybe nakkemuskler.',
        exercises: ['nakke-1-dyb-nakkeboejer', 'nakke-1-isometrisk', 'nakke-h-hagetilbage', 'nakke-h-drej'],
        criteria: ['Jeg kan dreje hovedet næsten lige meget til begge sider.', 'Jeg kan holde det lille nik i 10 sekunder 10 gange.', 'Smerten er højst 3 i hverdagen.'] },
      { n: 2, name: 'Fase 2: Styrke', weeks: 'Ca. uge 3–8', color: '#3aa17e', goal: 'Styrk nakke og skuldre, så nakken holder til hverdagen.',
        exercises: ['nakke-2-hovedloeft', 'nakke-2-roning-elastik', 'nakke-1-isometrisk', 'nakke-h-skulderrul'],
        criteria: ['Jeg kan løfte hovedet med hagen inde og holde 5 sekunder 10 gange.', 'Jeg kan lave 3 × 12 roninger med elastik.', 'Jeg holder pauser fra skærmen.'] },
      { n: 3, name: 'Fase 3: Stærk nakke', weeks: 'Fra ca. uge 8', color: '#e0913a', goal: 'Hold nakke og skuldre stærke 2–3 gange om ugen.',
        exercises: ['nakke-3-y-loeft', 'nakke-2-roning-elastik', 'nakke-2-hovedloeft', 'nakke-1-isometrisk'],
        criteria: ['Jeg træner 2–3 gange om ugen.', 'Jeg kan arbejde ved skærm eller i haven en hel dag uden at få ondt bagefter.'] }
    ],
    everyday: [
      'Hav skærmen i øjenhøjde, og hold mobilen op foran ansigtet i stedet for at kigge ned.',
      'Hold en lille pause hver halve time: rul skuldrene, og lav 5 × "hagen tilbage".',
      'Sov med en pude, der holder hovedet lige.',
      'Bevæg dig hver dag – gåture er også godt for nakken.'
    ],
    redFlags: {
      now: ['Du får pludselig den værste hovedpine, du nogensinde har haft.', 'Du bliver svimmel, ser dobbelt, har svært ved at tale eller synke, eller det ene ansigt eller den ene arm bliver slap.', 'Nakkesmerten kom efter et fald, et slag mod hovedet eller en trafikulykke.', 'Du får pludselig svaghed eller følelsesløshed i begge arme eller begge ben.'],
      today: ['Du har feber og en stiv nakke, så du ikke kan bøje hagen ned mod brystet.', 'Smerten stråler ud i armen og bliver værre, eller du får snurren, følelsesløshed eller svaghed i armen eller hånden.', 'Du bliver usikker på benene eller klodset med hænderne.'],
      weeks: ['Det er ikke blevet bedre efter 1–2 uger.', 'Du har eller har haft kræft.', 'Du taber dig uden at ville det.', 'Smerten er værst om natten og i hvile.', 'Du har leddegigt i forvejen.']
    }
  }
];

const RYG_READY_TEXT = {
  allChecked: 'Flot! Du er klar til næste fase. Start roligt, og hold øje med, hvordan ryggen har det næste dag.',
  notYet: 'Ikke helt endnu – og det er helt normalt. Bliv i fasen en uge mere, og tjek igen.'
};

/* ---------- Øvelserne ---------- */
const RYG_EXERCISES = [
  /* ================= LÆND – HOLD ================= */
  {
    id: 'laend-h-knaevip', category: 'laend', track: 'hold', level: 1, phases: [1],
    images: [{"src": "images/laend-h-knaevip/1.webp", "caption": "1. Lig på ryggen med bøjede knæ og fødderne i underlaget.", "w": 720, "h": 315}, {"src": "images/laend-h-knaevip/2.webp", "caption": "2. Lad knæene falde roligt til den ene side – kun så langt, det er rart.", "w": 720, "h": 315}, {"src": "images/laend-h-knaevip/3.webp", "caption": "3. Før dem tilbage til midten og over til den anden side.", "w": 720, "h": 315}], /* auto: tools/sync_images.py */
    name: 'Knævip liggende',
    equipment: 'En måtte, sengen eller et tæppe på gulvet.',
    dose: '10 gange til hver side. Gerne 2–3 gange om dagen.',
    steps: ['Lig på ryggen med bøjede knæ og fødderne i underlaget.', 'Lad knæene falde roligt til den ene side – kun så langt, det er rart.', 'Før dem tilbage til midten og over til den anden side.'],
    tips: ['Skuldrene bliver liggende.', 'Træk vejret roligt hele tiden.'],
    progression: 'Lettere: mindre bevægelse. Sværere: lad knæene gå lidt længere ned, og hold 3 sekunder i hver side.',
    stop: RYG_PAIN_RULE
  },
  {
    id: 'laend-h-baekkenvip', category: 'laend', track: 'hold', level: 1, phases: [1],
    images: [{"src": "images/laend-h-baekkenvip/1.webp", "caption": "1. Lig på ryggen med bøjede knæ.", "w": 720, "h": 270}, {"src": "images/laend-h-baekkenvip/2.webp", "caption": "2. Pres lænden blidt ned mod underlaget ved at vippe bækkenet. Hold 3 sekunder.", "w": 720, "h": 270}, {"src": "images/laend-h-baekkenvip/3.webp", "caption": "3. Slip, så lænden får en lille svaj igen.", "w": 720, "h": 270}], /* auto: tools/sync_images.py */
    name: 'Bækkenvip liggende',
    equipment: 'En måtte eller sengen.',
    dose: '10 gange. Hold 3 sekunder. 2–3 gange om dagen.',
    steps: ['Lig på ryggen med bøjede knæ.', 'Pres lænden blidt ned mod underlaget ved at vippe bækkenet. Hold 3 sekunder.', 'Slip, så lænden får en lille svaj igen.'],
    tips: ['Det er en lille bevægelse. Du må ikke presse hårdt.', 'Hold vejret ikke – træk vejret roligt.'],
    progression: 'Sværere: lav den siddende på en stol eller stående med ryggen mod en væg.',
    stop: RYG_PAIN_RULE
  },
  {
    id: 'laend-h-kat-ko', category: 'laend', track: 'hold', level: 1, phases: [1],
    images: [{"src": "images/laend-h-kat-ko/1.webp", "caption": "1. Stå på alle fire med hænderne under skuldrene og knæene under hofterne.", "w": 720, "h": 360}, {"src": "images/laend-h-kat-ko/2.webp", "caption": "2. Rund ryggen langsomt op som en kat, og kig ned mod knæene.", "w": 720, "h": 360}, {"src": "images/laend-h-kat-ko/3.webp", "caption": "3. Lad ryggen synke let ned, og kig lidt frem.", "w": 720, "h": 360}], /* auto: tools/sync_images.py */
    name: 'Kat og ko på alle fire',
    equipment: 'En måtte eller et tæppe. Evt. en pude under knæene.',
    dose: '10 gange i roligt tempo. 1–2 gange om dagen.',
    steps: ['Stå på alle fire med hænderne under skuldrene og knæene under hofterne.', 'Rund ryggen langsomt op som en kat, og kig ned mod knæene.', 'Lad ryggen synke let ned, og kig lidt frem.'],
    tips: ['Kun så langt, det er rart.', 'Gør ondt i knæene? Læg en pude under.'],
    progression: 'Lettere: lav bevægelsen siddende på en stol med hænderne på knæene.',
    stop: RYG_PAIN_RULE
  },
  {
    id: 'laend-h-hvilestilling', category: 'laend', track: 'hold', level: 1, phases: [1],
    images: [{"src": "images/laend-h-hvilestilling/1.webp", "caption": "1. Lig på ryggen på gulvet eller sengen.", "w": 720, "h": 324}, {"src": "images/laend-h-hvilestilling/2.webp", "caption": "2. Læg underbenene op på en stol eller sofa, så hofter og knæ er bøjet ca. 90 grader.", "w": 720, "h": 324}], /* auto: tools/sync_images.py */
    name: 'Hvilestilling med benene på en stol',
    equipment: 'En stol, sofa eller nogle puder.',
    dose: '2–5 minutter, når lænden er øm. Så ofte du har brug for det.',
    steps: ['Lig på ryggen på gulvet eller sengen.', 'Læg underbenene op på en stol eller sofa, så hofter og knæ er bøjet ca. 90 grader.', 'Træk vejret roligt: ind i 4 sekunder, ud i 6 sekunder.'],
    tips: ['Læg en lille pude under hovedet.', 'Mærk, hvordan lænden slapper af og bliver tung.'],
    progression: 'Når det føles bedre, så skift til knævip og kat og ko.',
    stop: RYG_PAIN_RULE
  },
  /* ================= LÆND – FOREBYG ================= */
  {
    id: 'laend-1-bro', category: 'laend', track: 'forebyg', level: 1, phases: [1, 2, 3],
    images: [{"src": "images/laend-1-bro/1.webp", "caption": "1. Lig på ryggen med bøjede knæ og fødderne i underlaget.", "w": 720, "h": 396}, {"src": "images/laend-1-bro/2.webp", "caption": "2. Spænd let i maven og ballerne, og løft hoften, til du er lige fra skuldre til knæ.", "w": 720, "h": 396}, {"src": "images/laend-1-bro/3.webp", "caption": "3. Hold 3 sekunder, og sænk roligt.", "w": 720, "h": 396}], /* auto: tools/sync_images.py */
    name: 'Broen',
    equipment: 'En måtte eller sengen.',
    dose: '2–3 sæt × 10 gentagelser. 2 sek. op, hold 3 sek., 2 sek. ned.',
    steps: ['Lig på ryggen med bøjede knæ og fødderne i underlaget.', 'Spænd let i maven og ballerne, og løft hoften, til du er lige fra skuldre til knæ.', 'Hold 3 sekunder, og sænk roligt.'],
    tips: ['Løft ikke for højt – du skal ikke svaje i lænden.', 'Pres hælene i underlaget.'],
    progression: 'Lettere: løft kun lidt. Sværere: hold 10 sekunder, eller lav broen på ét ben.',
    stop: RYG_PAIN_RULE
  },
  {
    id: 'laend-1-dead-bug', category: 'laend', track: 'forebyg', level: 1, phases: [1, 2],
    images: [{"src": "images/laend-1-dead-bug/1.webp", "caption": "1. Lig på ryggen. Løft knæene op over hofterne og armene op mod loftet.", "w": 720, "h": 396}, {"src": "images/laend-1-dead-bug/2.webp", "caption": "2. Stræk langsomt det ene ben og den modsatte arm ud, mens lænden bliver i underlaget.", "w": 720, "h": 396}, {"src": "images/laend-1-dead-bug/3.webp", "caption": "3. Kom tilbage, og skift side.", "w": 720, "h": 396}], /* auto: tools/sync_images.py */
    name: 'Rygliggende arm- og benstræk ("død bille")',
    equipment: 'En måtte eller sengen.',
    dose: '2 sæt × 6–10 til hver side. Langsomt.',
    steps: ['Lig på ryggen. Løft knæene op over hofterne og armene op mod loftet.', 'Stræk langsomt det ene ben og den modsatte arm ud, mens lænden bliver i underlaget.', 'Kom tilbage, og skift side.'],
    tips: ['Lænden må ikke slippe underlaget.', 'Træk vejret ud, når du strækker.'],
    progression: 'Lettere: flyt kun benet (armene bliver oppe), eller sæt hælen i underlaget. Sværere: stræk længere ud og langsommere.',
    stop: RYG_PAIN_RULE
  },
  {
    id: 'laend-2-fuglehund', category: 'laend', track: 'forebyg', level: 2, phases: [2, 3],
    images: [{"src": "images/laend-2-fuglehund/1.webp", "caption": "1. Stå på alle fire med ret ryg.", "w": 720, "h": 327}, {"src": "images/laend-2-fuglehund/2.webp", "caption": "2. Stræk den ene arm frem og det modsatte ben bagud, så de er i linje med ryggen. Hold 5 sekunder.", "w": 720, "h": 327}, {"src": "images/laend-2-fuglehund/3.webp", "caption": "3. Sæt ned, og skift side.", "w": 720, "h": 327}], /* auto: tools/sync_images.py */
    name: 'Fuglehund på alle fire',
    equipment: 'En måtte. Evt. en pude under knæene.',
    dose: '2–3 sæt × 6–10 til hver side. Hold 5 sekunder.',
    steps: ['Stå på alle fire med ret ryg.', 'Stræk den ene arm frem og det modsatte ben bagud, så de er i linje med ryggen. Hold 5 sekunder.', 'Sæt ned, og skift side.'],
    tips: ['Ryggen skal være helt rolig – forestil dig et glas vand på lænden.', 'Løft ikke benet højere end hoften.'],
    progression: 'Lettere: stræk kun benet eller kun armen. Sværere: hold 10 sekunder.',
    stop: RYG_PAIN_RULE
  },
  {
    id: 'laend-2-sideplanke-knae', category: 'laend', track: 'forebyg', level: 2, phases: [2, 3],
    images: [{"src": "images/laend-2-sideplanke-knae/1.webp", "caption": "1. Lig på siden på underarmen med albuen under skulderen og knæene bøjet.", "w": 720, "h": 360}, {"src": "images/laend-2-sideplanke-knae/2.webp", "caption": "2. Løft hoften, så du er lige fra knæ til skulder.", "w": 720, "h": 360}, {"src": "images/laend-2-sideplanke-knae/3.webp", "caption": "3. Hold, og sænk roligt. Skift side.", "w": 720, "h": 360}], /* auto: tools/sync_images.py */
    name: 'Sideplanke på knæ',
    equipment: 'En måtte.',
    dose: '3–5 gange til hver side. Hold 10–20 sekunder.',
    steps: ['Lig på siden på underarmen med albuen under skulderen og knæene bøjet.', 'Løft hoften, så du er lige fra knæ til skulder.', 'Hold, og sænk roligt. Skift side.'],
    tips: ['Kig lige frem, og hold hovedet i forlængelse af ryggen.', 'Den øverste hånd kan hvile på hoften.'],
    progression: 'Lettere: hold kortere tid. Sværere: hold 30 sekunder, eller stræk benene.',
    stop: RYG_PAIN_RULE
  },
  {
    id: 'laend-2-hoftehaengsel', category: 'laend', track: 'forebyg', level: 2, phases: [2, 3],
    images: [{"src": "images/laend-2-hoftehaengsel/1.webp", "caption": "1. Hold et kosteskaft langs ryggen, så det rører baghoved, skulderblade og haleben.", "w": 480, "h": 660}, {"src": "images/laend-2-hoftehaengsel/2.webp", "caption": "2. Bøj i hofterne, og skub numsen bagud. Knæene bøjer lidt.", "w": 480, "h": 660}, {"src": "images/laend-2-hoftehaengsel/3.webp", "caption": "3. Rejs dig igen. Skaftet skal røre de tre steder hele vejen.", "w": 480, "h": 660}], /* auto: tools/sync_images.py */
    name: 'Bøj i hofterne med ret ryg (med kosteskaft)',
    equipment: 'Et kosteskaft.',
    dose: '2–3 sæt × 10. Ca. 2–3 sek. ned, 2 sek. op.',
    steps: ['Hold et kosteskaft langs ryggen, så det rører baghoved, skulderblade og haleben.', 'Bøj i hofterne, og skub numsen bagud. Knæene bøjer lidt.', 'Rejs dig igen. Skaftet skal røre de tre steder hele vejen.'],
    tips: ['Det er sådan, du skal bøje dig, når du løfter.', 'Bøj kun så langt, du kan holde ryggen ret.'],
    progression: 'Sværere: hold en lille vægt eller vandflaske i hænderne uden kosteskaftet.',
    stop: RYG_PAIN_RULE
  },
  {
    id: 'laend-3-loefteteknik', category: 'laend', track: 'forebyg', level: 3, phases: [3],
    images: [{"src": "images/laend-3-loefteteknik/1.webp", "caption": "1. Stå tæt ved kassen med fødderne i hoftebredde.", "w": 480, "h": 660}, {"src": "images/laend-3-loefteteknik/2.webp", "caption": "2. Bøj i hofter og knæ med ret ryg, og tag godt fat.", "w": 480, "h": 660}, {"src": "images/laend-3-loefteteknik/3.webp", "caption": "3. Rejs dig med kassen tæt ind til kroppen. Sæt den ned på samme måde.", "w": 480, "h": 660}], /* auto: tools/sync_images.py */
    name: 'Løft en kasse fra gulvet',
    equipment: 'En kasse eller indkøbspose med lidt vægt (start med 2–5 kg).',
    dose: '2–3 sæt × 8–10. Langsomt ned og op.',
    steps: ['Stå tæt ved kassen med fødderne i hoftebredde.', 'Bøj i hofter og knæ med ret ryg, og tag godt fat.', 'Rejs dig med kassen tæt ind til kroppen. Sæt den ned på samme måde.'],
    tips: ['Drej med fødderne, ikke med ryggen.', 'Spænd let i maven, før du løfter.'],
    progression: 'Sværere: lidt mere vægt hver eller hver anden uge.',
    stop: RYG_PAIN_RULE
  },
  /* ================= BRYSTRYG – HOLD ================= */
  {
    id: 'bryst-h-skulderrul', category: 'bryst', track: 'hold', level: 1, phases: [1],
    images: [{"src": "images/bryst-h-skulderrul/1.webp", "caption": "1. Sid godt på stolen med armene hængende.", "w": 480, "h": 544}, {"src": "images/bryst-h-skulderrul/2.webp", "caption": "2. Løft skuldrene op mod ørerne.", "w": 480, "h": 544}, {"src": "images/bryst-h-skulderrul/3.webp", "caption": "3. Rul dem tilbage og ned i en stor, rolig cirkel.", "w": 480, "h": 544}], /* auto: tools/sync_images.py */
    name: 'Skulderrul siddende',
    equipment: 'En stol.',
    dose: '10 gange. Flere gange om dagen.',
    steps: ['Sid godt på stolen med armene hængende.', 'Løft skuldrene op mod ørerne.', 'Rul dem tilbage og ned i en stor, rolig cirkel.'],
    tips: ['Træk vejret ind, når skuldrene går op, og ud, når de går ned.'],
    progression: 'Rul også den anden vej 10 gange.',
    stop: RYG_PAIN_RULE
  },
  {
    id: 'bryst-h-ribben', category: 'bryst', track: 'hold', level: 1, phases: [1],
    images: [{"src": "images/bryst-h-ribben/1.webp", "caption": "1. Sid ret, og læg hænderne på siden af de nederste ribben.", "w": 480, "h": 549}, {"src": "images/bryst-h-ribben/2.webp", "caption": "2. Træk vejret ind gennem næsen, så ribbenene skubber hænderne ud.", "w": 480, "h": 549}], /* auto: tools/sync_images.py */
    name: 'Vejrtrækning ud i ribbenene',
    equipment: 'En stol.',
    dose: '6–8 rolige vejrtrækninger. 2–3 gange om dagen.',
    steps: ['Sid ret, og læg hænderne på siden af de nederste ribben.', 'Træk vejret ind gennem næsen, så ribbenene skubber hænderne ud.', 'Pust langsomt ud gennem munden.'],
    tips: ['Skuldrene skal ikke op.', 'Det er normalt, at det strammer lidt mellem skulderbladene.'],
    progression: 'Sværere: læg den ene hånd bag på ryggen, og træk vejret ud mod hånden.',
    stop: RYG_PAIN_RULE
  },
  {
    id: 'bryst-h-kat-ko', category: 'bryst', track: 'hold', level: 1, phases: [1],
    images: [{"src": "images/bryst-h-kat-ko/1.webp", "caption": "1. Stå på alle fire med hænderne under skuldrene.", "w": 720, "h": 360}, {"src": "images/bryst-h-kat-ko/2.webp", "caption": "2. Rund ryggen op mellem skulderbladene, og kig ned.", "w": 720, "h": 360}, {"src": "images/bryst-h-kat-ko/3.webp", "caption": "3. Lad brystet synke let ned, og kig lidt frem.", "w": 720, "h": 360}], /* auto: tools/sync_images.py */
    name: 'Kat og ko for øvre ryg',
    equipment: 'En måtte eller et tæppe.',
    dose: '10 gange i roligt tempo. 1–2 gange om dagen.',
    steps: ['Stå på alle fire med hænderne under skuldrene.', 'Rund ryggen op mellem skulderbladene, og kig ned.', 'Lad brystet synke let ned, og kig lidt frem.'],
    tips: ['Kun så langt, det er rart.'],
    progression: 'Lettere: lav den siddende med hænderne på knæene.',
    stop: RYG_PAIN_RULE
  },
  {
    id: 'bryst-h-aaben-bog', category: 'bryst', track: 'hold', level: 1, phases: [1],
    images: [{"src": "images/bryst-h-aaben-bog/1.webp", "caption": "1. Lig på siden med bøjede knæ og armene strakt frem foran dig.", "w": 720, "h": 414}, {"src": "images/bryst-h-aaben-bog/2.webp", "caption": "2. Før den øverste arm i en stor bue op og over til den anden side, og kig efter hånden.", "w": 720, "h": 414}, {"src": "images/bryst-h-aaben-bog/3.webp", "caption": "3. Hold, og før armen tilbage. Skift side.", "w": 720, "h": 414}], /* auto: tools/sync_images.py */
    name: 'Åben bog liggende på siden',
    equipment: 'En måtte og en pude under hovedet.',
    dose: '8–10 gange til hver side. Hold 3 sekunder.',
    steps: ['Lig på siden med bøjede knæ og armene strakt frem foran dig.', 'Før den øverste arm i en stor bue op og over til den anden side, og kig efter hånden.', 'Hold, og før armen tilbage. Skift side.'],
    tips: ['Knæene bliver liggende sammen.', 'Armen må gerne bøjes lidt.'],
    progression: 'Sværere: hold 10 sekunder, og træk vejret dybt ind i den åbne stilling.',
    stop: RYG_PAIN_RULE
  },
  /* ================= BRYSTRYG – FOREBYG ================= */
  {
    id: 'bryst-1-straek-stol', category: 'bryst', track: 'forebyg', level: 1, phases: [1, 2],
    images: [{"src": "images/bryst-1-straek-stol/1.webp", "caption": "1. Sid helt inde på stolen, og læg hænderne bag hovedet.", "w": 480, "h": 544}, {"src": "images/bryst-1-straek-stol/2.webp", "caption": "2. Læn dig roligt tilbage over stoleryggen, og kig let op.", "w": 480, "h": 544}, {"src": "images/bryst-1-straek-stol/3.webp", "caption": "3. Hold, og kom op igen.", "w": 480, "h": 544}], /* auto: tools/sync_images.py */
    name: 'Stræk over stoleryggen',
    equipment: 'En stol med lav ryg.',
    dose: '8–10 gange. Hold 3 sekunder.',
    steps: ['Sid helt inde på stolen, og læg hænderne bag hovedet.', 'Læn dig roligt tilbage over stoleryggen, og kig let op.', 'Hold, og kom op igen.'],
    tips: ['Bevægelsen sker i den øvre ryg – ikke i lænden.', 'Har du en høj stoleryg? Brug et sammenrullet håndklæde bag ryggen.'],
    progression: 'Sværere: flyt stoleryggen/håndklædet lidt op eller ned for at strække flere steder.',
    stop: RYG_PAIN_RULE
  },
  {
    id: 'bryst-1-skulderblad', category: 'bryst', track: 'forebyg', level: 1, phases: [1, 2],
    images: [{"src": "images/bryst-1-skulderblad/1.webp", "caption": "1. Stå eller sid ret med armene ned langs siden.", "w": 480, "h": 651}, {"src": "images/bryst-1-skulderblad/2.webp", "caption": "2. Træk skulderbladene sammen og lidt ned.", "w": 480, "h": 651}, {"src": "images/bryst-1-skulderblad/3.webp", "caption": "3. Hold 5 sekunder, og slip.", "w": 480, "h": 651}], /* auto: tools/sync_images.py */
    name: 'Skulderbladsklem',
    equipment: 'Ingen.',
    dose: '10 gange. Hold 5 sekunder. Gerne flere gange om dagen.',
    steps: ['Stå eller sid ret med armene ned langs siden.', 'Træk skulderbladene sammen og lidt ned.', 'Hold 5 sekunder, og slip.'],
    tips: ['Skuldrene må ikke op mod ørerne.', 'God at lave i pauser fra skærmen.'],
    progression: 'Sværere: lav den med armene i "W" foran dig.',
    stop: RYG_PAIN_RULE
  },
  {
    id: 'bryst-2-roning-elastik', category: 'bryst', track: 'forebyg', level: 2, phases: [2, 3],
    images: [{"src": "images/bryst-2-roning-elastik/1.webp", "caption": "1. Sæt elastikken fast i brysthøjde, og stil dig med armene strakt frem.", "w": 480, "h": 557}, {"src": "images/bryst-2-roning-elastik/2.webp", "caption": "2. Træk albuerne tilbage langs kroppen, og klem skulderbladene sammen.", "w": 480, "h": 557}, {"src": "images/bryst-2-roning-elastik/3.webp", "caption": "3. Slip langsomt frem igen.", "w": 480, "h": 557}], /* auto: tools/sync_images.py */
    name: 'Roning med elastik',
    equipment: 'En træningselastik og et dørhåndtag eller en fast stolpe.',
    dose: '2–3 sæt × 10–12. 2 sek. træk, hold 2 sek., 3 sek. tilbage.',
    steps: ['Sæt elastikken fast i brysthøjde, og stil dig med armene strakt frem.', 'Træk albuerne tilbage langs kroppen, og klem skulderbladene sammen.', 'Slip langsomt frem igen.'],
    tips: ['Stå rank, og hold skuldrene nede.', 'Luk døren, så den ikke kan gå op.'],
    progression: 'Lettere: blødere elastik. Sværere: hårdere elastik eller et skridt længere tilbage.',
    stop: RYG_PAIN_RULE
  },
  {
    id: 'bryst-2-vaegengel', category: 'bryst', track: 'forebyg', level: 2, phases: [2, 3],
    images: [{"src": "images/bryst-2-vaegengel/1.webp", "caption": "1. Stå med ryggen og baghovedet mod væggen og fødderne lidt fremme.", "w": 480, "h": 615}, {"src": "images/bryst-2-vaegengel/2.webp", "caption": "2. Læg armene mod væggen i et \"W\" med albuerne bøjet.", "w": 480, "h": 615}, {"src": "images/bryst-2-vaegengel/3.webp", "caption": "3. Glid langsomt armene op og ned igen uden at svaje i lænden.", "w": 480, "h": 615}], /* auto: tools/sync_images.py */
    name: 'Vægengle',
    equipment: 'En væg.',
    dose: '8–10 gange. 3 sek. op, 3 sek. ned.',
    steps: ['Stå med ryggen og baghovedet mod væggen og fødderne lidt fremme.', 'Læg armene mod væggen i et "W" med albuerne bøjet.', 'Glid langsomt armene op og ned igen uden at svaje i lænden.'],
    tips: ['Det er ok, hvis hænderne ikke kan røre væggen helt.', 'Kun så højt, du kan uden at ryggen slipper væggen.'],
    progression: 'Lettere: lav den liggende på ryggen på gulvet. Sværere: hold 3 sekunder øverst.',
    stop: RYG_PAIN_RULE
  },
  {
    id: 'bryst-3-roning-foroverboejet', category: 'bryst', track: 'forebyg', level: 3, phases: [3],
    images: [{"src": "images/bryst-3-roning-foroverboejet/1.webp", "caption": "1. Støt den ene hånd på et bord, og bøj i hofterne med ret ryg.", "w": 480, "h": 588}, {"src": "images/bryst-3-roning-foroverboejet/2.webp", "caption": "2. Træk flasken op mod hoften med albuen tæt ind til kroppen.", "w": 480, "h": 588}, {"src": "images/bryst-3-roning-foroverboejet/3.webp", "caption": "3. Sænk langsomt. Skift arm efter et sæt.", "w": 480, "h": 588}], /* auto: tools/sync_images.py */
    name: 'Foroverbøjet roning med vandflaske',
    equipment: 'En vandflaske eller håndvægt (1–3 kg) og et bord.',
    dose: '2–3 sæt × 10 pr. arm.',
    steps: ['Støt den ene hånd på et bord, og bøj i hofterne med ret ryg.', 'Træk flasken op mod hoften med albuen tæt ind til kroppen.', 'Sænk langsomt. Skift arm efter et sæt.'],
    tips: ['Ryggen skal være ret og rolig.', 'Klem skulderbladet ind mod midten i toppen.'],
    progression: 'Sværere: lidt tungere vægt.',
    stop: RYG_PAIN_RULE
  },
  /* ================= NAKKE – HOLD ================= */
  {
    id: 'nakke-h-hagetilbage', category: 'nakke', track: 'hold', level: 1, phases: [1],
    images: [{"src": "images/nakke-h-hagetilbage/1.webp", "caption": "1. Sid ret, og kig lige frem.", "w": 720, "h": 670}, {"src": "images/nakke-h-hagetilbage/2.webp", "caption": "2. Skub hagen roligt lige tilbage, som om du vil lave en dobbelthage.", "w": 720, "h": 670}, {"src": "images/nakke-h-hagetilbage/3.webp", "caption": "3. Hold 3 sekunder, og slip.", "w": 720, "h": 670}], /* auto: tools/sync_images.py */
    name: 'Hagen tilbage',
    equipment: 'En stol.',
    dose: '10 gange. Hold 3 sekunder. Flere gange om dagen.',
    steps: ['Sid ret, og kig lige frem.', 'Skub hagen roligt lige tilbage, som om du vil lave en dobbelthage.', 'Hold 3 sekunder, og slip.'],
    tips: ['Hovedet skal ikke bøjes ned – kun skubbes tilbage.', 'Det må gerne stramme lidt i nakken.'],
    progression: 'Sværere: lav den liggende på ryggen, og pres baghovedet let ned.',
    stop: RYG_PAIN_RULE
  },
  {
    id: 'nakke-h-skulderrul', category: 'nakke', track: 'hold', level: 1, phases: [1],
    images: [{"src": "images/nakke-h-skulderrul/1.webp", "caption": "1. Sid godt på stolen med armene hængende.", "w": 480, "h": 544}, {"src": "images/nakke-h-skulderrul/2.webp", "caption": "2. Løft skuldrene op mod ørerne.", "w": 480, "h": 544}, {"src": "images/nakke-h-skulderrul/3.webp", "caption": "3. Rul dem tilbage og ned i en stor, rolig cirkel.", "w": 480, "h": 544}], /* auto: tools/sync_images.py */
    name: 'Skulderrul siddende',
    equipment: 'En stol.',
    dose: '10 gange. Flere gange om dagen.',
    steps: ['Sid godt på stolen med armene hængende.', 'Løft skuldrene op mod ørerne.', 'Rul dem tilbage og ned i en stor, rolig cirkel.'],
    tips: ['Træk vejret ind, når skuldrene går op, og ud, når de går ned.'],
    progression: 'Rul også den anden vej 10 gange.',
    stop: RYG_PAIN_RULE
  },
  {
    id: 'nakke-h-drej', category: 'nakke', track: 'hold', level: 1, phases: [1],
    images: [{"src": "images/nakke-h-drej/1.webp", "caption": "1. Sid ret med skuldrene nede.", "w": 480, "h": 514}, {"src": "images/nakke-h-drej/2.webp", "caption": "2. Drej roligt hovedet til den ene side, så langt det er rart. Hold 2 sekunder.", "w": 480, "h": 514}, {"src": "images/nakke-h-drej/3.webp", "caption": "3. Drej tilbage og over til den anden side.", "w": 480, "h": 514}], /* auto: tools/sync_images.py */
    name: 'Drej hovedet roligt',
    equipment: 'En stol.',
    dose: '5–10 gange til hver side. Flere gange om dagen.',
    steps: ['Sid ret med skuldrene nede.', 'Drej roligt hovedet til den ene side, så langt det er rart. Hold 2 sekunder.', 'Drej tilbage og over til den anden side.'],
    tips: ['Lad hagen være i samme højde hele tiden.', 'Bevægelsen bliver større, efterhånden som nakken bliver bedre.'],
    progression: 'Sværere: hold 5 sekunder i hver side.',
    stop: RYG_PAIN_RULE
  },
  {
    id: 'nakke-h-sideboej', category: 'nakke', track: 'hold', level: 1, phases: [1],
    images: [{"src": "images/nakke-h-sideboej/1.webp", "caption": "1. Sid ret med skuldrene nede.", "w": 480, "h": 514}, {"src": "images/nakke-h-sideboej/2.webp", "caption": "2. Før roligt øret ned mod skulderen, til du mærker et let stræk.", "w": 480, "h": 514}, {"src": "images/nakke-h-sideboej/3.webp", "caption": "3. Hold 5 sekunder, og kom op igen. Skift side.", "w": 480, "h": 514}], /* auto: tools/sync_images.py */
    name: 'Øret mod skulderen',
    equipment: 'En stol.',
    dose: '5 gange til hver side. Hold 5 sekunder.',
    steps: ['Sid ret med skuldrene nede.', 'Før roligt øret ned mod skulderen, til du mærker et let stræk.', 'Hold 5 sekunder, og kom op igen. Skift side.'],
    tips: ['Skulderen skal ikke op og møde øret.', 'Hold eventuelt fast i stolesædet for at holde skulderen nede.'],
    progression: 'Sværere: hold 15–20 sekunder.',
    stop: RYG_PAIN_RULE
  },
  /* ================= NAKKE – FOREBYG ================= */
  {
    id: 'nakke-1-dyb-nakkeboejer', category: 'nakke', track: 'forebyg', level: 1, phases: [1],
    images: [{"src": "images/nakke-1-dyb-nakkeboejer/1.webp", "caption": "1. Lig på ryggen med bøjede knæ og et lille håndklæde under hovedet.", "w": 720, "h": 480}, {"src": "images/nakke-1-dyb-nakkeboejer/2.webp", "caption": "2. Lav et lille \"ja-nik\" med hagen ind mod halsen. Baghovedet bliver liggende.", "w": 720, "h": 480}, {"src": "images/nakke-1-dyb-nakkeboejer/3.webp", "caption": "3. Hold 10 sekunder, og slip.", "w": 720, "h": 480}], /* auto: tools/sync_images.py */
    name: 'Det lille nik liggende',
    equipment: 'En måtte eller sengen og et lille håndklæde.',
    dose: '10 gange. Hold 10 sekunder. 1–2 gange om dagen.',
    steps: ['Lig på ryggen med bøjede knæ og et lille håndklæde under hovedet.', 'Lav et lille "ja-nik" med hagen ind mod halsen. Baghovedet bliver liggende.', 'Hold 10 sekunder, og slip.'],
    tips: ['Det er en meget lille bevægelse.', 'Musklerne foran på halsen må ikke spænde hårdt.'],
    progression: 'Sværere: gå videre til "Nik og løft hovedet".',
    stop: RYG_PAIN_RULE
  },
  {
    id: 'nakke-1-isometrisk', category: 'nakke', track: 'forebyg', level: 1, phases: [1, 2, 3],
    images: [{"src": "images/nakke-1-isometrisk/1.webp", "caption": "1. Sid ret, og læg hånden mod panden.", "w": 480, "h": 480}, {"src": "images/nakke-1-isometrisk/2.webp", "caption": "2. Pres hovedet let frem mod hånden uden at bevæge det.", "w": 480, "h": 480}, {"src": "images/nakke-1-isometrisk/3.webp", "caption": "3. Hold, slip, og hvil. Gør det også bagud og til begge sider.", "w": 480, "h": 480}], /* auto: tools/sync_images.py */
    name: 'Pres hovedet mod hånden',
    equipment: 'En stol.',
    dose: '5 gange i hver retning. Hold 8 sekunder med ca. halv kraft.',
    steps: ['Sid ret, og læg hånden mod panden.', 'Pres hovedet let frem mod hånden uden at bevæge det.', 'Hold, slip, og hvil. Gør det også bagud og til begge sider.'],
    tips: ['Hovedet må ikke bevæge sig.', 'Brug kun halv kraft – det skal ikke gøre ondt.'],
    progression: 'Sværere: hold 15 sekunder.',
    stop: RYG_PAIN_RULE
  },
  {
    id: 'nakke-2-hovedloeft', category: 'nakke', track: 'forebyg', level: 2, phases: [2, 3],
    images: [{"src": "images/nakke-2-hovedloeft/1.webp", "caption": "1. Lig på ryggen med bøjede knæ.", "w": 720, "h": 480}, {"src": "images/nakke-2-hovedloeft/2.webp", "caption": "2. Lav det lille nik, og løft så hovedet 1–2 cm op med hagen inde.", "w": 720, "h": 480}, {"src": "images/nakke-2-hovedloeft/3.webp", "caption": "3. Hold 5 sekunder, og læg hovedet roligt ned.", "w": 720, "h": 480}], /* auto: tools/sync_images.py */
    name: 'Nik og løft hovedet',
    equipment: 'En måtte eller sengen.',
    dose: '5–10 gange. Hold 5 sekunder.',
    steps: ['Lig på ryggen med bøjede knæ.', 'Lav det lille nik, og løft så hovedet 1–2 cm op med hagen inde.', 'Hold 5 sekunder, og læg hovedet roligt ned.'],
    tips: ['Hagen skal blive inde hele tiden.', 'Stop, hvis du ryster meget eller holder vejret.'],
    progression: 'Sværere: hold 10 sekunder.',
    stop: RYG_PAIN_RULE
  },
  {
    id: 'nakke-2-roning-elastik', category: 'nakke', track: 'forebyg', level: 2, phases: [2, 3],
    images: [{"src": "images/nakke-2-roning-elastik/1.webp", "caption": "1. Sæt elastikken fast i brysthøjde, og stil dig med armene strakt frem.", "w": 480, "h": 557}, {"src": "images/nakke-2-roning-elastik/2.webp", "caption": "2. Træk albuerne tilbage langs kroppen, og klem skulderbladene sammen.", "w": 480, "h": 557}, {"src": "images/nakke-2-roning-elastik/3.webp", "caption": "3. Slip langsomt frem igen.", "w": 480, "h": 557}], /* auto: tools/sync_images.py */
    name: 'Roning med elastik',
    equipment: 'En træningselastik og et dørhåndtag eller en fast stolpe.',
    dose: '2–3 sæt × 10–12. 2 sek. træk, hold 2 sek., 3 sek. tilbage.',
    steps: ['Sæt elastikken fast i brysthøjde, og stil dig med armene strakt frem.', 'Træk albuerne tilbage langs kroppen, og klem skulderbladene sammen.', 'Slip langsomt frem igen.'],
    tips: ['Hold skuldrene nede og hagen let inde.'],
    progression: 'Lettere: blødere elastik. Sværere: hårdere elastik.',
    stop: RYG_PAIN_RULE
  },
  {
    id: 'nakke-3-y-loeft', category: 'nakke', track: 'forebyg', level: 3, phases: [3],
    images: [{"src": "images/nakke-3-y-loeft/1.webp", "caption": "1. Bøj let i hofterne med ret ryg og hagen inde.", "w": 480, "h": 604}, {"src": "images/nakke-3-y-loeft/2.webp", "caption": "2. Løft armene frem og op i et \"Y\" med tommelfingrene op.", "w": 480, "h": 604}, {"src": "images/nakke-3-y-loeft/3.webp", "caption": "3. Hold 2 sekunder, og sænk langsomt.", "w": 480, "h": 604}], /* auto: tools/sync_images.py */
    name: 'Y-løft foroverbøjet',
    equipment: 'Ingen. Senere små vandflasker (0,5 kg).',
    dose: '2–3 sæt × 8–10. 2 sek. op, hold 2 sek., 2 sek. ned.',
    steps: ['Bøj let i hofterne med ret ryg og hagen inde.', 'Løft armene frem og op i et "Y" med tommelfingrene op.', 'Hold 2 sekunder, og sænk langsomt.'],
    tips: ['Skuldrene skal ned og tilbage – ikke op mod ørerne.', 'Løft kun så højt, du kan uden smerte.'],
    progression: 'Lettere: løft kun til skulderhøjde. Sværere: små vandflasker i hænderne.',
    stop: RYG_PAIN_RULE
  }
];
