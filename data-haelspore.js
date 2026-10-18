/* Træningsspor: Hælspore / hælsmerter (plantar fasciitis) – Hjemmeøvelser-appen.
   Generelt program. Ingen klientdata og ingen helbredsoplysninger om konkrete personer.
   Indlæses EFTER data.js (bruger ingen globale navne derfra, men lægger sig ved siden af).
   Alle navne er præfikset HAEL_ for ikke at kollidere med data.js/app.js.
   Kilder: se HAEL_SOURCES nederst og tools/haelspore-integration.md.
   De gamle videolinks (tjekket 8. okt. 2026) ligger kun som videoOld/videoAltOld og vises ikke.
   Appen viser i stedet tegnede tempo-film (film-engine.js / film-defs.js / haeloeft-figur.js). */
'use strict';

const HAEL_CATEGORY = {
  id: 'haelspore',
  name: 'Hælspore / hælsmerter',
  short: 'Hælspore',
  icon: 'hael',
  intro: 'Et 12-ugers program til smerter under hælen (plantar fasciitis, også kaldet hælspore). ' +
    'Du starter blidt og bygger gradvist op til tung styrketræning og gåture eller løb igen. ' +
    'Du rykker først videre, når din fod er klar, ikke kun fordi ugerne er gået.'
};

/* ---------- Smerteregel for hælsmerter ---------- */
const HAEL_PAIN_RULE =
  'Smerte ved de første skridt om morgenen eller efter at have siddet stille er helt normalt ved hælspore. Det er ikke et tegn på, at du gør skade. ' +
  'Under øvelserne må det gerne gøre lidt ondt: 0–2 er fint, og 3–5 er i orden, så længe smerten er faldet til ro igen inden for et døgn. ' +
  'Brug morgensmerten som dit "termometer": Er de første skridt næste morgen tydeligt værre end normalt (2 point eller mere på skalaen 0–10), eller gør det mere ondt hele næste dag, så skru ned næste gang (færre sæt, mindre vægt eller et trin tilbage). ' +
  'Stop og kontakt læge eller fysioterapeut ved skarp, jagende smerte, hævelse, snurren eller følelsesløshed i foden, eller smerter, der tager til i hvile og om natten.';

const HAEL_PAIN_CHECK = {
  morningQuestion: 'Hvor ondt gjorde de første skridt i morges?',
  beforeQuestion: 'Hvor ondt har du i hælen lige nu?',
  afterQuestion: 'Hvor ondt har du i hælen nu, efter træningen?',
  scaleHint: '0 = ingen smerte, 10 = værst tænkelige smerte',
  feedback: [
    { max: 2, tone: 'green', title: 'Super!',
      text: 'Lav smerte. Din fod klarer belastningen fint. Fortsæt planen.' },
    { max: 5, tone: 'yellow', title: 'Okay',
      text: 'Smerte på 3–5 er i orden. Tjek de første skridt i morgen tidlig: Hvis de ikke er værre end normalt, så fortsæt.' },
    { max: 10, tone: 'red', title: 'Lad os justere',
      text: 'Det var mere, end din hæl bryder sig om lige nu. Det er ikke farligt, men skru ned næste gang: færre sæt, mindre vægt eller gå et trin tilbage i programmet. Brug cykel eller svømning i stedet for lange gåture et par dage.' }
  ],
  /* Feedback på morgensmerten sammenlignet med de seneste dages gennemsnit (beregnes lokalt). */
  morningTrend: [
    { diffMax: -1, tone: 'green', text: 'Morgensmerten er på vej ned. Godt gået!' },
    { diffMax: 1, tone: 'green', text: 'Morgensmerten er stabil. Fortsæt som planlagt.' },
    { diffMax: 10, tone: 'yellow', text: 'De første skridt var værre end normalt i dag. Tag en lettere dag: færre skridt, kun stræk og stille pres-øvelsen, og prøv igen i morgen.' }
  ]
};

/* ---------- Faser ---------- */
const HAEL_PHASES = [
  {
    n: 1, name: 'Fase 1: Ro på hælen', weeks: 'Uge 1–2 (gerne længere)', color: '#5b8def',
    goal: 'Dæmp smerten, aflast hælen og lær morgenrutinen.',
    focus: [
      'Morgenrutine: stræk fodsålen, inden du står ud af sengen',
      'Blid udstrækning af fodsål og læg flere gange dagligt',
      'Isometrisk øvelse (pres uden bevægelse) mod smerte',
      'Aflastning: gode sko, indlæg eller hælkop, evt. tape, færre lange gåture på hårdt underlag',
      'Hold formen ved lige med cykling eller svømning'
    ],
    exercises: ['hael-1-fascie-straek', 'hael-1-laeg-straek-strakt', 'hael-1-laeg-straek-boejet', 'hael-1-isometrisk-pres', 'hael-1-rul-under-foden'],
    criteria: [
      'De første skridt om morgenen er højst 5 ud af 10 og ikke længere stigende',
      'Du kan gå 15–20 minutter i hverdagen, og smerten er faldet til ro igen næste morgen',
      'Du kan lave 10 rolige hæløft på begge ben (med støtte) med højst 4 ud af 10 i smerte',
      'Du har brugt morgenrutinen de fleste dage i mindst en uge'
    ]
  },
  {
    n: 2, name: 'Fase 2: Opbygning', weeks: 'Uge 3–5', color: '#2a9d8f',
    goal: 'Begynd at styrke læg og fod, mens du fortsætter med at strække.',
    focus: [
      'Hæløft på begge ben, langsomt og kontrolleret, hver 2. dag',
      'Styrk de små muskler i foden (håndklædekrøl)',
      'Fra uge 4–5: hæløft med håndklæde under tæerne på et trappetrin, begge ben',
      'Fortsæt morgenrutine og stræk dagligt',
      'Øg gåturene lidt ad gangen, når morgensmerten tillader det'
    ],
    exercises: ['hael-1-fascie-straek', 'hael-1-laeg-straek-strakt', 'hael-1-laeg-straek-boejet', 'hael-2-kort-fod', 'hael-2-haeloeft-begge', 'hael-2-haeloeft-trin-begge', 'hael-2-taa-yoga', 'hael-2-isometrisk-haeloeft'],
    criteria: [
      'Du kan lave 3 × 15 langsomme hæløft på begge ben med håndklæde på trin med højst 3–4 ud af 10 i smerte',
      'De første skridt om morgenen er højst 3 ud af 10, eller tydeligt bedre end i starten',
      'Du kan gå 30 minutter uden at smerten stiger over 4, og den er faldet til ro næste morgen',
      'Du kan stå på ét ben og løfte hælen 10 gange (med støtte) uden skarp smerte'
    ]
  },
  {
    n: 3, name: 'Fase 3: Tung styrke', weeks: 'Uge 6–9', color: '#e9a23b',
    goal: 'Tung, langsom styrketræning på ét ben gør plantarfascien og lægmusklen stærke og robuste.',
    focus: [
      'Tungt hæløft på ét ben med håndklæde under tæerne på trappetrin, hver 2. dag',
      'Gør det gradvist tungere: 3 × 12 → 4 × 10 med rygsæk → 5 × 8 med mere vægt',
      'Stræk fortsat om morgenen og efter behov',
      'Længere gåture: øg med ca. 10 % om ugen, så længe morgensmerten er stabil'
    ],
    exercises: ['hael-1-fascie-straek', 'hael-1-laeg-straek-strakt', 'hael-1-laeg-straek-boejet', 'hael-3-tungt-haeloeft-et-ben', 'hael-3-soleus-haeloeft', 'hael-2-kort-fod', 'hael-2-haandklaede-kroel', 'hael-2-isometrisk-haeloeft'],
    criteria: [
      'Du kan lave 5 × 8 tunge hæløft på ét ben med rygsæk, og morgensmerten bliver ikke værre dagen efter',
      'Du kan lave 20–25 hæløft på ét ben (uden vægt) på det dårlige ben, næsten lige så mange som på det gode',
      'De første skridt om morgenen er 0–2 ud af 10',
      'Du kan gå 45–60 minutter i rask tempo uden at smerten stiger over 3',
      'Du kan hoppe 10 små hop på begge ben uden smerte (kun hvis du vil tilbage til løb eller sport)'
    ]
  },
  {
    n: 4, name: 'Fase 4: Tilbage til livet', weeks: 'Uge 10–12 og frem', color: '#e76f51',
    goal: 'Tilbage til lange gåture, løb eller sport, og hold hælen stærk, så smerten ikke kommer igen.',
    focus: [
      'Tungt hæløft 2 gange om ugen (vedligehold)',
      'Små hop (kun hvis du skal løbe eller dyrke sport)',
      'Gå-/løbeprogram i små trin',
      'Fortsæt mindst 4 uger, efter at du er tilfreds, og hold derefter 1–2 styrketræninger om ugen'
    ],
    exercises: ['hael-3-tungt-haeloeft-et-ben', 'hael-3-soleus-haeloeft', 'hael-4-smaa-hop', 'hael-1-laeg-straek-strakt', 'hael-1-fascie-straek'],
    criteria: [
      'Du kan gå så langt, som du har brug for i hverdagen, uden at det gør ondt dagen efter',
      'Løbere: 30 minutters roligt løb 3 gange om ugen uden at morgensmerten stiger',
      'Du har en vedligeholdelsesplan: tungt hæløft 1–2 gange om ugen'
    ]
  }
];

/* ---------- Øvelser ----------
   Felter som i data.js (id, category, name, dose, steps, tips, progression, stop, images, video, videoSource),
   plus: phases (hvilke faser øvelsen bruges i), level (= første fase, 1–4), equipment, videoLang, videoAlt (reservevideoer, også tjekket),
   videoNote (hvad videoen viser, hvis den afviger lidt fra teksten), evidence (kort note til fysioterapeuten). */
const HAEL_EXERCISES = [
  {
    id: 'hael-1-fascie-straek', category: 'haelspore', level: 1, phases: [1, 2, 3, 4],
    images: [{"src": "images/hael-1-fascie-straek/1.webp", "caption": "1. Sid på sengekanten, og læg den ømme fod over knæet", "w": 848, "h": 1440}, {"src": "images/hael-1-fascie-straek/2.webp", "caption": "2. Bøj tæerne op mod dig, til du mærker et stræk i fodsålen", "w": 838, "h": 1440}, {"src": "images/hael-1-fascie-straek/3.webp", "caption": "3. Mærk svangen: den skal føles stram. Hold 10 sekunder", "w": 848, "h": 1440}], /* auto: tools/sync_images.py */
    name: 'Stræk fodsålen siddende',
    equipment: 'Ingen. En stol eller sengekanten.',
    dose: '10 gentagelser × hold 10 sekunder. 3 gange om dagen. Altid før de første skridt om morgenen og før du rejser dig efter at have siddet længe.',
    steps: [
      'Sid på sengekanten eller en stol. Læg den ømme fod over det andet knæ.',
      'Tag fat om tæerne med hånden, og bøj dem op mod skinnebenet, til du mærker et stræk i fodsålen.',
      'Mærk med den anden hånd under svangen: Fodsålen skal føles stram som en guitarstreng.',
      'Hold i 10 sekunder, og slip så langsomt. Gentag 10 gange.'
    ],
    tips: [
      'Træk især i storetåen. Det strammer fodsålen mest.',
      'Bøj også anklen lidt op, så strækker du læggen med.',
      'Kan du ikke nå foden? Brug et håndklæde om forfoden, mens benet er strakt.'
    ],
    progression: 'Lettere: hold 5 sekunder, eller brug håndklædet. Sværere: lav strækket stående med tæerne oppe ad en væg (vægstræk).',
    stop: HAEL_PAIN_RULE,
    videoOld: 'https://www.youtube.com/watch?v=l5zCe0AdQks',
    videoSourceOld: 'OrthoIndy (engelsk, ortopædisk klinik): "Seated Plantar Fascia Stretch" (0:29)',
    videoLang: 'en',
    videoAltOld: [
      { url: 'https://www.youtube.com/watch?v=1cpTwhAdBa0', source: 'Krop+fysik / Mediegruppen (dansk): "Ondt i hælen? Her får du øvelser for svangsene-smerter" (1:23). Viser først fascie-strækket og derefter hæløft på trin.', lang: 'da' },
      { url: 'https://www.youtube.com/watch?v=rlAjIXb-8BM', source: 'NHS Ayrshire & Arran (engelsk): "Plantar Fascia Towel stretch" (0:47). Den lette variant med håndklæde.', lang: 'en' },
      { url: 'https://www.youtube.com/watch?v=ex82U6NvBZM', source: 'NHS Ayrshire & Arran (engelsk): "Plantar Fascia Wall Stretch" (0:48). Den svære variant ved væg.', lang: 'en' }
    ],
    evidence: 'DiGiovanni 2003/2006 (JBJS): plantarfascie-specifikt stræk 10 × 10 s, 3 gange dagligt, før første skridt. JOSPT CPG 2023: grad A for fascie- og lægstræk. CPG\'ens oversigt fandt fasciestræk bedre end lægstræk alene.'
  },
  {
    id: 'hael-1-rul-under-foden', category: 'haelspore', level: 1, phases: [1, 2],
    images: [{"src": "images/hael-1-rul-under-foden/1.webp", "caption": "1. Sid på en stol med foden på en frossen flaske eller en bold", "w": 844, "h": 1440}, {"src": "images/hael-1-rul-under-foden/2.webp", "caption": "2. Rul langsomt frem og tilbage fra hæl til forfod", "w": 844, "h": 1440}, {"src": "images/hael-1-rul-under-foden/3.webp", "caption": "3. En tennisbold eller massagebold virker også", "w": 846, "h": 1440}], /* auto: tools/sync_images.py */
    name: 'Valgfri lindring: rul foden over en bold eller en frossen flaske',
    equipment: 'En tennisbold, massagebold eller en frossen vandflaske (0,5 l) og et viskestykke.',
    dose: '1–2 minutter ad gangen, 1–3 gange om dagen efter behov. Med frossen flaske: højst 10 minutter.',
    steps: [
      'Sid på en stol med foden på en bold eller en frossen flaske.',
      'Rul langsomt frem og tilbage fra hælen til forfoden.',
      'Tryk så meget, at det føles behageligt. Det må gerne kildre eller trykke, men ikke gøre rigtig ondt.',
      'Hold en pause, hvis det bliver for koldt eller for ømt.'
    ],
    tips: [
      'Den frosne flaske er dejlig efter en lang dag på benene.',
      'Læg et tyndt viskestykke om flasken, hvis kulden er for skarp.',
      'Det lindrer, men det helbreder ikke alene. Det er træningen og strækkene, der gør forskellen.'
    ],
    progression: 'Brug den, når du har brug for det. Mange bruger den mindre, når de når fase 3.',
    stop: HAEL_PAIN_RULE + ' Undlad is, hvis du har nedsat følesans eller dårligt blodomløb i fødderne (fx ved sukkersyge).',
    videoOld: 'https://www.youtube.com/watch?v=OYtepvZJApU',
    videoSourceOld: 'Danske Fodterapeuter (dansk): "Fodøvelse nr. 1: Massér din svang" (2:43)',
    videoLang: 'da',
    videoAltOld: [
      { url: 'https://www.youtube.com/watch?v=bWkMZcca-KU', source: 'NHS Ayrshire & Arran (engelsk): "Plantar Fascia Cold Therapy" (0:44). Viser frossen flaske.', lang: 'en' }
    ],
    evidence: 'Valgfri lindring. Ingen forsøg viser, at selvmassage med bold alene ændrer forløbet (CPG 2023 grad A for manuel terapi gælder behandlerudført behandling). Brug den, hvis den letter, men den erstatter ikke stræk og styrke.'
  },
  {
    id: 'hael-1-laeg-straek-strakt', category: 'haelspore', level: 1, phases: [1, 2, 3, 4],
    images: [{"src": "images/hael-1-laeg-straek-strakt/1.webp", "caption": "1. Hænderne mod væggen, den ømme fod et stort skridt bagud", "w": 900, "h": 1017}, {"src": "images/hael-1-laeg-straek-strakt/2.webp", "caption": "2. Bøj det forreste knæ, hold det bagerste strakt og hælen i gulvet", "w": 900, "h": 1017}], /* auto: tools/sync_images.py */
    name: 'Lægstræk mod væg, strakt knæ',
    equipment: 'En væg.',
    dose: '3 gentagelser × hold 30 sekunder på hvert ben. 2–3 gange om dagen.',
    steps: [
      'Stå med hænderne mod en væg. Sæt den ømme fod et stort skridt bagud.',
      'Begge fødder peger lige frem mod væggen. Hælen på det bagerste ben bliver i gulvet.',
      'Bøj det forreste knæ, og skub hoften frem mod væggen. Hold det bagerste knæ strakt.',
      'Mærk et stræk i læggen. Hold i 30 sekunder.'
    ],
    tips: [
      'Hælen skal blive i gulvet hele tiden.',
      'Drej ikke foden udad.',
      'Stræk begge ben. Stramme lægge belaster fodsålen.'
    ],
    progression: 'Sværere: stå med forfoden på et trappetrin og lad hælen synke ned (kun når det ikke gør ondt i hælen).',
    stop: HAEL_PAIN_RULE,
    videoOld: 'https://www.youtube.com/watch?v=DcnlrEs986s',
    videoSourceOld: 'NHS inform (engelsk): "Calf Muscle Stretch (gastrocnemius)" (1:05)',
    videoLang: 'en',
    videoAltOld: [
      { url: 'https://www.youtube.com/watch?v=2_2GMXTc1BE', source: 'NHS Ayrshire & Arran (engelsk): "Plantar Fascia Standing Calf Stretch (gastrocnemius and soleus muscles)" (1:18). Viser både strakt og bøjet knæ.', lang: 'en' }
    ],
    evidence: 'JOSPT CPG 2023: grad A for gastrocnemius-/soleus-stræk. Nedsat dorsalfleksion i anklen er en risikofaktor (CPG 2014, grad B).'
  },
  {
    id: 'hael-1-laeg-straek-boejet', category: 'haelspore', level: 1, phases: [1, 2, 3, 4],
    images: [{"src": "images/hael-1-laeg-straek-boejet/1.webp", "caption": "1. Hænderne mod væggen, den ømme fod et lille skridt bagud", "w": 900, "h": 1016}, {"src": "images/hael-1-laeg-straek-boejet/2.webp", "caption": "2. Bøj begge knæ, hold hælen nede, og mærk strækket lavt i læggen", "w": 900, "h": 1016}], /* auto: tools/sync_images.py */
    name: 'Lægstræk mod væg, bøjet knæ',
    equipment: 'En væg.',
    dose: '3 gentagelser × hold 30 sekunder på hvert ben. 2–3 gange om dagen. Lav den lige efter lægstrækket med strakt knæ.',
    steps: [
      'Stå med hænderne mod en væg. Sæt den ømme fod et lille skridt bagud.',
      'Hold hælen i gulvet, og bøj begge knæ, så det bagerste knæ peger frem mod væggen.',
      'Mærk et stræk dybt nede i læggen, tæt på hælen.',
      'Hold i 30 sekunder.'
    ],
    tips: [
      'Skridtet er kortere end ved lægstrækket med strakt knæ.',
      'Strækket mærkes lavere i læggen. Det er den dybe lægmuskel og akillessenen.',
      'Hælen skal blive i gulvet.'
    ],
    progression: 'Sværere: lav strækket med forfoden på et trappetrin og bøjet knæ.',
    stop: HAEL_PAIN_RULE,
    videoOld: 'https://www.youtube.com/watch?v=Ms7hJlBN3gA',
    videoSourceOld: 'NHS inform (engelsk): "Calf Muscle Stretch (soleus)" (0:57)',
    videoLang: 'en',
    videoAltOld: [],
    evidence: 'JOSPT CPG 2023: grad A for gastrocnemius-/soleus-stræk.'
  },
  {
    id: 'hael-1-isometrisk-pres', category: 'haelspore', level: 1, phases: [1, 2],
    images: [{"src": "images/hael-1-isometrisk-pres/1.webp", "caption": "1. Sid med benet strakt og fodsålen mod væggen", "w": 900, "h": 1440}, {"src": "images/hael-1-isometrisk-pres/2.webp", "caption": "2. Pres forfoden mod væggen med halv kraft. Hold 30–45 sekunder", "w": 792, "h": 1440}, {"src": "images/hael-1-isometrisk-pres/3.webp", "caption": "3. Sværere: stå og hold hælene lidt løftet i 30–45 sekunder", "w": 850, "h": 1440}], /* auto: tools/sync_images.py */
    name: 'Pres foden mod væggen (stille pres)',
    equipment: 'En væg, en seng eller gulvet. Evt. en pude under knæet.',
    dose: '5 gentagelser × hold 30–45 sekunder. 1 minuts pause imellem. 1–2 gange om dagen. Kan også bruges på dårlige dage i senere faser.',
    steps: [
      'Sid eller lig med benene strakt og fodsålerne mod en væg.',
      'Pres forfoden ind mod væggen, som om du træder på en speeder. Foden flytter sig ikke.',
      'Pres med ca. halv kraft, så det føles som et tydeligt arbejde i læggen.',
      'Hold i 30–45 sekunder, og slap så helt af.'
    ],
    tips: [
      'Træk vejret roligt. Hold ikke vejret.',
      'Mange oplever, at hælen gør mindre ondt i et stykke tid efter.',
      'Start blidt, og pres hårdere, efterhånden som det føles godt.'
    ],
    progression: 'Sværere: stå med begge hænder mod en væg og løft hælene et par centimeter fra gulvet. Hold 30–45 sekunder. Næste trin er "Hæløft på begge ben".',
    stop: HAEL_PAIN_RULE,
    videoOld: 'https://www.youtube.com/watch?v=i9j-o0NDxFI',
    videoSourceOld: 'NHS Ayrshire & Arran (engelsk): "Seated Isometric Holds Plantarflexion" (1:14)',
    videoLang: 'en',
    videoAltOld: [],
    evidence: 'Trin 0 på stigen: blid belastning, når hælen er mest øm. Inspireret af isometrisk træning ved senesmerter, hvor den smertelindrende effekt er usikker. Ikke selvstændigt testet ved plantar fasciitis (svag evidens). CPG 2023: styrketræning af fod/ankel anbefales.'
  },
  {
    id: 'hael-2-haandklaede-kroel', category: 'haelspore', level: 2, phases: [2, 3],
    images: [{"src": "images/hael-2-haandklaede-kroel/1.webp", "caption": "1. Sid med den bare fod på et håndklæde", "w": 850, "h": 1440}, {"src": "images/hael-2-haandklaede-kroel/2.webp", "caption": "2. Krøl tæerne, og træk håndklædet ind under foden", "w": 846, "h": 1440}, {"src": "images/hael-2-haandklaede-kroel/3.webp", "caption": "3. Spred tæerne, og grib efter mere. Hælen bliver nede", "w": 852, "h": 1440}], /* auto: tools/sync_images.py */
    name: 'Krøl håndklædet med tæerne',
    equipment: 'Et lille håndklæde på et glat gulv. En stol.',
    dose: '3 sæt × 15 gentagelser. Hver 2. dag, eller dagligt hvis det føles godt. Når det er let: læg 1–2 kg (fx en pose ris) på enden af håndklædet.',
    steps: [
      'Sid på en stol med ret ryg og knæet bøjet ca. 90 grader. Sæt den bare fod på et håndklæde.',
      'Hold hælen i gulvet. Krøl tæerne og træk håndklædet ind under foden.',
      'Spred tæerne, og ræk ud efter mere håndklæde. Gentag, til håndklædet er samlet.',
      'Glat håndklædet ud igen og start forfra.'
    ],
    tips: [
      'Det er de små muskler i fodsålen, der arbejder. De støtter svangen.',
      'Hold hælen stille i gulvet hele tiden.',
      'Lav øvelsen med begge fødder.'
    ],
    progression: 'Sværere: læg en lille vægt (fx en dåse) på den yderste ende af håndklædet, eller lav øvelsen stående.',
    stop: HAEL_PAIN_RULE + ' Får du krampe i foden, så hold pause og stræk tæerne.',
    videoOld: 'https://www.youtube.com/watch?v=1RZXwuxXb4Y',
    videoSourceOld: 'NHS Ayrshire & Arran (engelsk): "Plantar Fascia Intrinsic Towel Strengthening Exercise" (0:58)',
    videoLang: 'en',
    videoAltOld: [],
    evidence: 'Kamonseki 2016 (RCT): håndklædekrøl 3 × 15 med 1–2 kg + kort fod + stræk virkede, men ikke bedre end stræk alene. JOSPT CPG 2023 anbefaler styrketræning af fod/ankel. Ingen styrkeform er vist bedst.'
  },
  {
    id: 'hael-2-haeloeft-begge', category: 'haelspore', level: 2, phases: [2],
    images: [{"src": "images/hael-2-haeloeft-begge/1.webp", "caption": "1. Stå med fødderne i hoftebredde, og hold let i væggen", "w": 850, "h": 1440}, {"src": "images/hael-2-haeloeft-begge/2.webp", "caption": "2. Løft hælene langsomt så højt, du kan. Hold 2 sekunder", "w": 828, "h": 1440}, {"src": "images/hael-2-haeloeft-begge/3.webp", "caption": "3. Sænk langsomt ned igen på 3 sekunder", "w": 852, "h": 1440}], /* auto: tools/sync_images.py */
    name: 'Hæløft på begge ben',
    equipment: 'En væg eller et køkkenbord at holde i.',
    dose: '3 sæt × 12–15 gentagelser. Tempo: 3 sekunder op, hold 2 sekunder, 3 sekunder ned. 2 minutters pause mellem sæt. Hver 2. dag.',
    steps: [
      'Stå med fødderne i hoftebredde og hænderne let mod en væg.',
      'Løft langsomt hælene så højt, du kan (3 sekunder).',
      'Hold i toppen i 2 sekunder.',
      'Sænk langsomt hælene ned til gulvet (3 sekunder).'
    ],
    tips: [
      'Tænk "langsomt og tungt", ikke hurtigt.',
      'Løft lige op over storetåen. Lad ikke anklerne falde udad.',
      'Hold kun let i væggen for balancen.'
    ],
    progression: 'Når 3 × 15 er let, så gå videre til "Hæløft med håndklæde på trappetrin".',
    stop: HAEL_PAIN_RULE,
    videoOld: 'https://www.youtube.com/watch?v=A_npfqG65vs',
    videoSourceOld: 'NHS Ayrshire & Arran (engelsk): "Plantar Fascia Standing Heel Raises" (0:54)',
    videoLang: 'en',
    videoAltOld: [],
    evidence: 'Forstadie til tung styrketræning (Rathleff 2015). JOSPT CPG 2023: grad B for styrketræning.'
  },
  {
    id: 'hael-2-haeloeft-trin-begge', category: 'haelspore', level: 2, phases: [2, 3],
    images: [{"src": "images/hael-2-haeloeft-trin-begge/1.webp", "caption": "1. Fodballerne på kanten af trinnet, tæerne oppe på det sammenrullede håndklæde, hælene fri i luften (lidt under trinnet)", "w": 900, "h": 1440}, {"src": "images/hael-2-haeloeft-trin-begge/2.webp", "caption": "2. Løft hælene langsomt så højt, du kan, og hold 2 sekunder. Sænk derefter langsomt, til hælene er lidt under kanten", "w": 900, "h": 1440}], /* auto: tools/sync_images.py */
    name: 'Hæløft med håndklæde på trappetrin, begge ben',
    equipment: 'Et trappetrin (eller en tyk bog) og et sammenrullet håndklæde. Gelænder eller væg at holde i.',
    dose: '3 sæt × 12 gentagelser. Tempo: 3 sekunder op, hold 2 sekunder, 3 sekunder ned. 2 minutters pause mellem sæt. Hver 2. dag.',
    steps: [
      'Rul et håndklæde sammen, og læg det på kanten af trappetrinnet.',
      'Stil dig med forfødderne på trinnet og tæerne oppe på håndklædet, så tæerne er bøjet opad. Hælene er fri ud over kanten.',
      'Hold i gelænderet. Løft hælene langsomt så højt, du kan (3 sekunder), og hold 2 sekunder.',
      'Sænk langsomt (3 sekunder), til hælene er lidt under trinnets kant.'
    ],
    tips: [
      'Håndklædet bøjer tæerne opad. Det strammer fodsålen, så den bliver trænet direkte.',
      'Tilpas håndklædets tykkelse, så tæerne er bøjet godt op i toppen.',
      'Gå ikke dybere ned end behageligt.'
    ],
    progression: 'Når 3 × 15 er let, og du opfylder kriterierne for fase 3, så gå videre til "Tungt hæløft på ét ben".',
    stop: HAEL_PAIN_RULE,
    videoOld: 'https://www.youtube.com/watch?v=deChRToNNpQ',
    videoSourceOld: 'Sahva Ottobock Care (dansk tekst): "Hælløft med håndklæde – god til at styrke lægmusklerne" (0:37)',
    videoLang: 'da',
    videoAltOld: [
      { url: 'https://www.youtube.com/watch?v=PkMHAzaipVg', source: 'Rehab My Patient (engelsk): "Towel Raises for Plantar Fasciitis Both Legs" (0:50). Viser øvelsen på gulvet.', lang: 'en' }
    ],
    evidence: 'Rathleff 2015 (Scand J Med Sci Sports): hæløft med håndklæde under tæerne (spillemekanismen / "windlass").'
  },
  {
    id: 'hael-3-tungt-haeloeft-et-ben', category: 'haelspore', level: 3, phases: [3, 4],
    images: [{"src": "images/hael-3-tungt-haeloeft-et-ben/1.webp", "caption": "1. Rygsæk på. Fodballen på den ømme fod på kanten af trinnet, tæerne på håndklædet og hælen fri i luften. Det andet ben er løftet bagud", "w": 900, "h": 1440}, {"src": "images/hael-3-tungt-haeloeft-et-ben/2.webp", "caption": "2. Løft hælen langsomt (3 sek.), og hold 2 sekunder i toppen. Sænk langsomt (3 sek.), til hælen er lidt under kanten", "w": 900, "h": 1440}], /* auto: tools/sync_images.py */
    name: 'Tungt hæløft på ét ben med håndklæde (Rathleff-øvelsen)',
    equipment: 'Trappetrin, sammenrullet håndklæde, gelænder. En rygsæk med bøger eller vandflasker som ekstra vægt.',
    dose: 'Hver 2. dag. Uge 1–2: 3 sæt × 12 (så tungt, at 12 er det maksimale). Uge 3–4: 4 sæt × 10 med rygsæk. Derefter 5 sæt × 8 – læg mere i rygsækken, når 8 bliver for let. Tempo: 3 sek. op, hold 2 sek., 3 sek. ned. 2 minutters pause mellem sæt.',
    steps: [
      'Læg det sammenrullede håndklæde på kanten af trinnet. Stil den ømme fod med tæerne oppe på håndklædet og hælen fri.',
      'Løft det andet ben fra trinnet. Hold i gelænderet for balancen.',
      'Løft hælen langsomt så højt, du kan (3 sekunder), og hold 2 sekunder i toppen.',
      'Sænk langsomt (3 sekunder), til hælen er lidt under trinnets kant. Gentag.'
    ],
    tips: [
      'Det skal være tungt: De sidste 2 gentagelser i hvert sæt skal være hårde.',
      'Brug gelænderet til balance, ikke til at hjælpe dig op.',
      'Lav også øvelsen på det gode ben, så du kan sammenligne.'
    ],
    progression: 'Lettere: tilbage til begge ben på trinnet eller færre sæt. Sværere: mere vægt i rygsækken (hold dig til 8 gentagelser). Bliv ved hver 2. dag, til du er tilfreds, og derefter mindst 4 uger mere. Herefter 1–2 gange om ugen som vedligehold.',
    stop: HAEL_PAIN_RULE,
    videoOld: 'https://www.youtube.com/watch?v=jozP0FhDPz8',
    videoSourceOld: 'Krop+fysik / Forlaget Mediegruppen (dansk): "Øvelse mod hælspore (fasciitis plantaris)" (0:58)',
    videoLang: 'da',
    videoAltOld: [
      { url: 'https://www.youtube.com/watch?v=ja_y_Pi1oK0', source: 'The Irish Physios (engelsk): "Plantar Fasciitis Exercises | Rathleff Protocol" (0:38). Ét ben på trin med håndklæde.', lang: 'en' },
      { url: 'https://www.youtube.com/watch?v=GHgEgPGiExU', source: 'NHS Ayrshire & Arran (engelsk): "Plantar Fascia Loading Exercise (High Load Exercise)" (1:04). Samme øvelse på gulvet, uden trin.', lang: 'en' }
    ],
    evidence: 'Rathleff 2015: 3 × 12RM → 4 × 10RM (rygsæk efter 2 uger) → 5 × 8RM (efter 4 uger), hver 2. dag i 3 mdr. Bedre FFI efter 3 mdr. end stræk alene, ingen forskel efter 6–12 mdr. Riel 2019: selvdoseret ≤ 8RM lige så godt. Riel 2023 (BJSM): råd + hælkop gav lige så godt resultat med og uden hæløft, så øvelsen er et godt tilbud, men ikke et must.'
  },
  {
    id: 'hael-2-kort-fod', category: 'haelspore', level: 2, phases: [2, 3],
    images: [{"src": "images/hael-2-kort-fod/1.webp", "caption": "1. Sid på en stol med den bare fod fladt på gulvet og knæet over anklen.", "w": 720, "h": 518}, {"src": "images/hael-2-kort-fod/2.webp", "caption": "2. Træk fodballen langsomt hen mod hælen, så svangen løfter sig som en lille kuppel. Tæerne bliver lange og afslappede.", "w": 720, "h": 518}, {"src": "images/hael-2-kort-fod/3.webp", "caption": "3. Hælen og fodballen bliver i gulvet. Krøl ikke tæerne.", "w": 720, "h": 518}], /* auto: tools/sync_images.py */
    name: 'Kort fod (løft svangen)',
    equipment: 'Bare fødder og en stol. Senere stående.',
    dose: '10 gentagelser × hold 5–10 sekunder. 1–2 gange dagligt. Byg op til 3 × 1 minut i alt.',
    steps: [
      'Sid på en stol med den bare fod fladt på gulvet og knæet over anklen.',
      'Træk fodballen langsomt hen mod hælen, så svangen løfter sig som en lille kuppel. Tæerne bliver lange og afslappede.',
      'Hælen og fodballen bliver i gulvet. Krøl ikke tæerne.',
      'Hold 5–10 sekunder, og slip langsomt.'
    ],
    tips: [
      'Bevægelsen er lille. Tænk "gør foden kortere" uden at bøje tæerne.',
      'Kig efter: der kommer luft under svangen.',
      'Det er de små muskler under foden, der arbejder.'
    ],
    progression: 'Siddende → stående på begge ben → stående på ét ben → på ét ben med let knæbøj.',
    stop: HAEL_PAIN_RULE + ' Får du krampe i foden, så hold pause og stræk tæerne.',
    videoLang: 'da',
    evidence: 'Kamonseki 2016 (RCT): kort fod 3 × 1 min sammen med stræk forbedrede smerte og funktion, men ikke mere end stræk alene. JOSPT CPG 2023 anbefaler styrketræning af fod/ankel (svag-moderat evidens).'
  },
  {
    id: 'hael-2-taa-yoga', category: 'haelspore', level: 2, phases: [2],
    images: [{"src": "images/hael-2-taa-yoga/1.webp", "caption": "1. Sid på en stol med den bare fod fladt på gulvet.", "w": 720, "h": 518}, {"src": "images/hael-2-taa-yoga/2.webp", "caption": "2. Løft storetåen, mens de fire små tæer presser ned i gulvet. Hold 3 sekunder.", "w": 720, "h": 518}, {"src": "images/hael-2-taa-yoga/3.webp", "caption": "3. Skift: pres storetåen ned, og løft de fire små tæer. Hold 3 sekunder.", "w": 720, "h": 518}], /* auto: tools/sync_images.py */
    name: 'Tå-yoga (storetå og små tæer skiftevis)',
    equipment: 'Bare fødder og en stol.',
    dose: '2–3 sæt × 10 skift. Hold hver stilling 3 sekunder. Dagligt eller hver 2. dag.',
    steps: [
      'Sid på en stol med den bare fod fladt på gulvet.',
      'Løft storetåen, mens de fire små tæer presser ned i gulvet. Hold 3 sekunder.',
      'Skift: pres storetåen ned, og løft de fire små tæer. Hold 3 sekunder.',
      'Skift roligt frem og tilbage. Foden og anklen bliver stille.'
    ],
    tips: [
      'Det er svært i starten. Hjælp gerne med en finger.',
      'Øvelsen træner kontrol over tæerne og de små fodmuskler.',
      'Lav den med begge fødder.'
    ],
    progression: 'Sværere: stående på begge ben, derefter på ét ben.',
    stop: HAEL_PAIN_RULE,
    videoLang: 'da',
    evidence: 'Supplement til fodstyrke. Tå-styrke stiger med 8 ugers fodøvelser (FRAMES, Clin Biomech 2026), men tå-yoga er ikke testet alene ved plantar fasciitis (svag evidens). Valgfri.'
  },
  {
    id: 'hael-2-isometrisk-haeloeft', category: 'haelspore', level: 2, phases: [2, 3, 4],
    images: [{"src": "images/hael-2-isometrisk-haeloeft/1.webp", "caption": "1. Stå med fødderne i hoftebredde og hænderne let mod en væg.", "w": 480, "h": 660}, {"src": "images/hael-2-isometrisk-haeloeft/2.webp", "caption": "2. Løft hælene ca. 3–5 centimeter fra gulvet.", "w": 480, "h": 660}, {"src": "images/hael-2-isometrisk-haeloeft/3.webp", "caption": "3. Hold stille i 30–45 sekunder. Træk vejret roligt.", "w": 480, "h": 660}], /* auto: tools/sync_images.py */
    name: 'Hold hælene oppe (til dårlige dage)',
    equipment: 'En væg eller et køkkenbord at holde i.',
    dose: '5 gentagelser × hold 30–45 sekunder. 1 minuts pause. Bruges i stedet for hæløft på dage med gul eller rød morgensmerte.',
    steps: [
      'Stå med fødderne i hoftebredde og hænderne let mod en væg.',
      'Løft hælene ca. 3–5 centimeter fra gulvet.',
      'Hold stille i 30–45 sekunder. Træk vejret roligt.',
      'Sænk langsomt, og hold 1 minuts pause.'
    ],
    tips: [
      'Ingen bevægelse. Musklerne arbejder, mens foden står stille.',
      'Smerten må gerne være op til 3–4 af 10 og skal være faldet igen næste morgen.',
      'Hold vægten over storetåen.'
    ],
    progression: 'Lettere: "Pres foden mod væggen" siddende. Sværere: på ét ben. Når morgensmerten er grøn igen, så tilbage til de tunge hæløft.',
    stop: HAEL_PAIN_RULE,
    videoLang: 'da',
    evidence: 'Holder belastningen i gang på dårlige dage, i stedet for at holde helt pause (belastningsstyring, Morrissey 2021). Selve den isometriske øvelse er ikke testet ved plantar fasciitis (svag evidens).'
  },
  {
    id: 'hael-3-soleus-haeloeft', category: 'haelspore', level: 3, phases: [3, 4],
    images: [{"src": "images/hael-3-soleus-haeloeft/1.webp", "caption": "1. Stå med fødderne i hoftebredde og hænderne let mod en væg.", "w": 480, "h": 660}, {"src": "images/hael-3-soleus-haeloeft/2.webp", "caption": "2. Bøj knæene ca. 20–30 grader, og hold dem bøjede hele tiden.", "w": 480, "h": 660}, {"src": "images/hael-3-soleus-haeloeft/3.webp", "caption": "3. Løft hælene langsomt så højt, du kan (3 sekunder), og hold 2 sekunder.", "w": 480, "h": 660}], /* auto: tools/sync_images.py */
    name: 'Hæløft med bøjede knæ (dyb lægmuskel)',
    equipment: 'En væg eller et køkkenbord. Senere et trappetrin og en rygsæk.',
    dose: '3 sæt × 12–15 gentagelser. Tempo: 3 sekunder op, hold 2 sekunder, 3 sekunder ned. Hver 2. dag sammen med det tunge hæløft.',
    steps: [
      'Stå med fødderne i hoftebredde og hænderne let mod en væg.',
      'Bøj knæene ca. 20–30 grader, og hold dem bøjede hele tiden.',
      'Løft hælene langsomt så højt, du kan (3 sekunder), og hold 2 sekunder.',
      'Sænk langsomt (3 sekunder). Knæene bliver bøjede.'
    ],
    tips: [
      'Med bøjede knæ arbejder den dybe lægmuskel (soleus), som hæfter på hælen.',
      'Knæene må ikke strække sig, når du går op.',
      'Mærkes det mest dybt i læggen, gør du det rigtigt.'
    ],
    progression: 'Begge ben → ét ben → ét ben med rygsæk → på trappetrin med håndklæde under tæerne.',
    stop: HAEL_PAIN_RULE,
    videoLang: 'da',
    evidence: 'Supplement til Rathleff-hæløftet, så både gastrocnemius og soleus trænes. JOSPT CPG 2023 anbefaler styrketræning af fod/ankel. Ingen styrkeform er vist bedst (svag evidens for netop denne).'
  },
  {
    id: 'hael-4-smaa-hop', category: 'haelspore', level: 4, phases: [4],
    images: [{"src": "images/hael-4-smaa-hop/1.webp", "caption": "1. Stå med let bøjede knæ og fødderne i hoftebredde", "w": 850, "h": 1440}, {"src": "images/hael-4-smaa-hop/2.webp", "caption": "2. Hop små, rytmiske hop på forfødderne, som en springbold", "w": 842, "h": 1440}, {"src": "images/hael-4-smaa-hop/3.webp", "caption": "3. Land blødt og stille på forfødderne", "w": 854, "h": 1440}], /* auto: tools/sync_images.py */
    name: 'Små hop på stedet (kun før løb og sport)',
    equipment: 'Gode sko og et fast, men ikke hårdt underlag (fx træ- eller gummigulv).',
    dose: '3–5 sæt × 10–20 små hop, 2–3 gange om ugen før løb. Start med begge ben. Senere: ét ben ad gangen.',
    steps: [
      'Stå med fødderne i hoftebredde og let bøjede knæ.',
      'Hop små, rytmiske hop på forfødderne, som en springbold.',
      'Knæene er næsten strakte. Arbejdet kommer fra anklerne.',
      'Land blødt og stille. Hælene rører kun let ved gulvet.'
    ],
    tips: [
      'Lave og hurtige hop er bedre end høje hop.',
      'Kun hvis du skal løbe, hoppe eller dyrke sport. Ellers kan du springe den over.',
      'Lav øvelsen, før du er træt, fx som opvarmning.'
    ],
    progression: 'Begge ben → skiftevis → ét ben → små hop frem og tilbage og fra side til side. Øg kun, hvis morgensmerten er stabil.',
    stop: HAEL_PAIN_RULE + ' Hop kun, når du kan lave 20 hæløft på ét ben og gå 45 minutter uden smerte.',
    videoOld: 'https://www.youtube.com/watch?v=EjwLFHvrHss',
    videoSourceOld: 'The Irish Physio TV (engelsk, fysioterapeut): "Pogo Hops | Exercise Demonstration" (0:23)',
    videoLang: 'en',
    videoAltOld: [],
    evidence: 'Klinisk praksis for gradvis tilbagevenden til løb (stød-/springbelastning). Ikke specifikt testet ved plantar fasciitis.'
  }
];

/* ---------- Hjælpemidler (ikke øvelser; tapevideoen er fjernet, teksten forklarer) ---------- */
const HAEL_AIDS = [
  {
    id: 'hael-tape', name: 'Tape af foden (Low-Dye)',
    text: 'Tape kan aflaste fodsålen og lindre smerten i de første uger. Bedst sammen med stræk og øvelser. Brug ikke-elastisk sportstape (zinkoxid-tape). Få gerne en fysioterapeut til at vise dig teknikken første gang. Tag tapen af, hvis huden klør, bliver rød eller får vabler.',
    when: 'Fase 1–2, i dagtimerne og ved længere gåture.',
    videoOld: 'https://www.youtube.com/watch?v=qMZkYH_uo_Y',
    videoSourceOld: 'NHS Lanarkshire (engelsk): "Plantar Fascia Taping" (3:14)',
    videoLang: 'en',
    videoAltOld: [
      { url: 'https://www.youtube.com/watch?v=V5hFp---T1U', source: 'PhysioMSK (engelsk): "Taping for Plantar Fasciitis – Low Dye Taping Technique" (4:00)', lang: 'en' }
    ],
    evidence: 'JOSPT CPG 2023: grad A (kortsigtet, sammen med anden behandling). Morrissey 2021: en del af kernebehandlingen.'
  },
  {
    id: 'hael-indlaeg', name: 'Hælkop eller blødt indlæg',
    text: 'En blød hælkop (silikone) eller et støddæmpende indlæg kan gøre det rarere at gå. Billige, færdige indlæg virker for de fleste lige så godt som dyre, specialfremstillede. Brug dem sammen med øvelserne, ikke i stedet for.',
    when: 'Fra start og så længe, de hjælper.',
    video: '', videoSource: '',
    evidence: 'CPG 2023: kan bruges sammen med anden behandling (grad C), men ikke som eneste behandling (grad B). Rathleff 2015 og Riel 2023 brugte gel-/silikonehælkop til alle.'
  },
  {
    id: 'hael-natskinne', name: 'Natskinne',
    text: 'En natskinne holder foden bøjet op om natten, så fodsål og læg ikke bliver så stramme. Den kan dæmpe de første skridt om morgenen, men mange synes, den er ubehagelig at sove med, og den gør ikke forløbet kortere. Overvej den kun, hvis morgensmerterne bliver ved trods 4–6 ugers træning, og tal med din fysioterapeut først.',
    when: 'Kun ved vedvarende morgensmerter, i 1–3 måneder.',
    video: '', videoSource: '',
    evidence: 'CPG 2023: grad A for 1–3 mdr. ved konsekvent første-skridt-smerte. Lægehåndbogen: ingen dokumenteret effekt på varigheden. Indgår ikke i Morrisseys kernebehandling.'
  }
];

/* ---------- Uge-for-uge-program (typisk forløb, 12 uger) ----------
   Ugen viser et forslag. Appen bør altid tjekke fasens kriterier, før den foreslår næste fase. */
const HAEL_WEEKS = [
  { week: 1, phase: 1, title: 'Kom i gang – ro på hælen',
    daily: ['Morgenrutine før første skridt', 'Fascie-stræk 3 × om dagen', 'Lægstræk (strakt og bøjet knæ) 2–3 × om dagen', 'Stille pres mod væggen 5 × 30 sek. 1–2 × om dagen', 'Rul under foden efter behov'],
    load: 'Skær ned på lange gåture og lang tids stående på hårdt gulv. Cykel eller svøm i stedet, hvis du vil holde formen.',
    tip: 'Find dine bedste sko frem, og gå ikke barfodet på hårde gulve.' },
  { week: 2, phase: 1, title: 'Find rytmen',
    daily: ['Morgenrutine', 'Fascie-stræk 3 × om dagen', 'Lægstræk 2–3 × om dagen', 'Stille pres mod væggen 5 × 45 sek.'],
    load: 'Gå korte ture på 10–20 minutter i gode sko, hvis morgensmerten tillader det.',
    tip: 'Tjek "Klar til fase 2?" sidst på ugen. Er du ikke klar, så bliv i fase 1 en uge mere. Det er helt normalt.' },
  { week: 3, phase: 2, title: 'Styrke starter',
    daily: ['Morgenrutine', 'Fascie- og lægstræk 2 × om dagen'],
    everyOtherDay: ['Hæløft på begge ben 3 × 12', 'Krøl håndklædet 3 × 10'],
    load: 'Gåture 20–30 minutter, hvis smerten er faldet til ro næste morgen.',
    tip: 'Styrketræning hver 2. dag. Dagene imellem er hviledage for styrken, men ikke for strækkene.' },
  { week: 4, phase: 2, title: 'Lidt mere',
    daily: ['Morgenrutine', 'Fascie- og lægstræk 2 × om dagen'],
    everyOtherDay: ['Hæløft på begge ben 3 × 15', 'Krøl håndklædet 3 × 15', 'Prøv hæløft med håndklæde på trin, begge ben: 2 × 12'],
    load: 'Øg gåturene med højst 10 % fra sidste uge.',
    tip: 'Langsomt tempo: 3 sek. op, 2 sek. hold, 3 sek. ned.' },
  { week: 5, phase: 2, title: 'Håndklæde og trappetrin',
    daily: ['Morgenrutine', 'Fascie- og lægstræk'],
    everyOtherDay: ['Hæløft med håndklæde på trin, begge ben: 3 × 12–15', 'Krøl håndklædet 3 × 15'],
    load: 'Gåture op til 30 minutter.',
    tip: 'Tjek "Klar til fase 3?". Opfylder du ikke kriterierne endnu, så gentag uge 5.' },
  { week: 6, phase: 3, title: 'Tung styrke på ét ben',
    daily: ['Morgenrutine', 'Fascie- og lægstræk 1–2 × om dagen'],
    everyOtherDay: ['Tungt hæløft på ét ben: 3 × 12 (uden vægt)'],
    load: 'Gåture 30–40 minutter.',
    tip: 'Det må gerne være hårdt i læggen. Hælen må gerne mærkes lidt, så længe morgensmerten ikke stiger.' },
  { week: 7, phase: 3, title: 'Lidt tungere',
    daily: ['Morgenrutine', 'Stræk efter behov'],
    everyOtherDay: ['Tungt hæløft på ét ben: 3 × 12. Kan du tage flere end 12, så tag en let rygsæk på'],
    load: 'Øg gåturene med ca. 10 %.',
    tip: 'Lav også øvelsen på det gode ben. Målet er, at begge ben er lige stærke.' },
  { week: 8, phase: 3, title: 'Rygsæk på',
    daily: ['Morgenrutine', 'Stræk efter behov'],
    everyOtherDay: ['Tungt hæløft på ét ben med rygsæk: 4 × 10'],
    load: 'Gåture 40–50 minutter, også på lidt ujævnt underlag.',
    tip: 'Fyld bøger eller vandflasker i rygsækken. Læg mere i, når 10 bliver let.' },
  { week: 9, phase: 3, title: 'Tungt og langsomt',
    daily: ['Morgenrutine', 'Stræk efter behov'],
    everyOtherDay: ['Tungt hæløft på ét ben med rygsæk: 5 × 8'],
    load: 'Gåture op til 60 minutter.',
    tip: 'Tjek "Klar til fase 4?". Hvis ikke helt endnu, så fortsæt fase 3, og tjek igen om en uge.' },
  { week: 10, phase: 4, title: 'Tilbage til aktivitet',
    daily: ['Stræk om morgenen'],
    everyOtherDay: ['Tungt hæløft 5 × 8 (2–3 × om ugen)', 'Løbere: små hop 3 × 10 på begge ben'],
    load: 'Gå så meget, du har lyst. Løbere: gå/løb 1 min løb + 2 min gang × 8–10, hver 2. dag.',
    tip: 'Morgensmerten er stadig dit termometer. Er den stabil, så må du gerne øge.' },
  { week: 11, phase: 4, title: 'Mere løb og leg',
    daily: ['Stræk om morgenen'],
    everyOtherDay: ['Tungt hæløft 5 × 8 (2 × om ugen)', 'Løbere: små hop 3 × 15, også skiftevis ben'],
    load: 'Løbere: 2 min løb + 1 min gang × 8–10, hver 2. dag.',
    tip: 'Øg kun én ting ad gangen: enten længere, hurtigere eller oftere.' },
  { week: 12, phase: 4, title: 'Hold hælen stærk',
    daily: ['Stræk om morgenen, hvis det føles godt'],
    everyOtherDay: ['Tungt hæløft 5 × 8 (1–2 × om ugen som vedligehold)', 'Løbere: små hop på ét ben 3 × 10'],
    load: 'Løbere: 20–30 minutters roligt løb 3 × om ugen. Øg med højst 10 % om ugen.',
    tip: 'Fortsæt det tunge hæløft 1–2 gange om ugen i mindst 4 uger mere. Det mindsker risikoen for, at smerten kommer igen.' }
];

/* ---------- Infosider (letforståeligt dansk) ---------- */
const HAEL_INFO = [
  { id: 'hvad-er-det', icon: '🦶', title: 'Hvad er hælspore?',
    text: 'Hælspore er det, de fleste kalder smerter under hælen. Det rigtige navn er plantar fasciitis. Det er en overbelastning af fodsålens bindevævsplade (plantarfascien) der, hvor den sidder fast på hælbenet. Det er ikke en farlig tilstand, men den kan gøre rigtig ondt og drille længe.',
    bullets: [
      'Typisk: smerte under hælen, især på indersiden',
      'Værst ved de første skridt om morgenen eller efter at have siddet stille',
      'Bliver ofte lidt bedre, når du er kommet i gang, men værre igen efter lang tids gang eller stående arbejde',
      'Rammer oftest personer mellem 40 og 60 år, både kvinder og mænd'
    ] },
  { id: 'roentgen', icon: '🦴', title: 'Er det knoglesporen, der gør ondt?',
    text: 'Som regel ikke. En "hælspore" på et røntgenbillede er en lille knoglekant på hælbenet. Den ses hos mange mennesker, der slet ikke har ondt, og mange med hælsmerter har ingen spore. Sporen ændrer heller ikke, hvordan det går dig, og den skal ikke fjernes. Smerten kommer fra den overbelastede plantarfascie og vævet omkring den. Derfor er det belastningen, du skal arbejde med, ikke knoglen.',
    bullets: [
      'Du behøver som regel ikke røntgen eller scanning for at få stillet diagnosen',
      'En spore på røntgen betyder ikke, at du ikke kan blive smertefri'
    ] },
  { id: 'anatomi', icon: '🧩', title: 'Sådan er foden bygget',
    text: 'Fire dele arbejder sammen, hver gang du går:',
    bullets: [
      'Hælbenet: den store knogle bagerst i foden, som du lander på',
      'Plantarfascien: et stærkt, fladt bånd af bindevæv under foden. Det går fra hælbenet frem til tæerne og holder svangen oppe som strengen på en bue',
      'Akillessenen: den tykke sene bag på hælen, som forbinder læggen med hælbenet',
      'Lægmusklen: den store muskel bag på underbenet. Når den er stram eller svag, belaster det plantarfascien mere',
      'Når du løfter hælen og går op på tæerne, strammes plantarfascien som et spil, der rulles op (spillemekanismen eller "windlass"). Derfor bruger øvelserne et håndklæde under tæerne: så får fascien træning direkte'
    ] },
  { id: 'aarsager', icon: '📈', title: 'Hvorfor får man det?',
    text: 'Plantarfascien bliver irriteret, når den får mere belastning, end den er vant til. Ofte er der en udløsende årsag, fx nye sko, en lang vandretur, mere løb eller et nyt arbejde med meget stående.',
    bullets: [
      'Pludselig mere gang, løb eller stående arbejde, især på hårdt underlag',
      'Stramme lægge og stive ankler (foden kan ikke bøje så meget opad)',
      'Overvægt',
      'Flade, slidte eller dårligt støddæmpende sko, og meget barfodsgang på hårde gulve',
      'Hulfod eller platfod kan spille ind',
      'Alder mellem 40 og 60 år'
    ] },
  { id: 'forloeb', icon: '⏳', title: 'Hvor lang tid tager det?',
    text: 'Hælspore går over hos de fleste, men det kræver tålmodighed. Mange mærker bedring inden for 6–12 uger med øvelser og gode råd, og de fleste er meget bedre inden for 6–12 måneder. Hos nogle tager det 1–2 år, især hvis det har stået på længe, eller hvis begge fødder gør ondt. Jo tidligere du begynder at aflaste og træne, jo bedre.',
    bullets: [
      'Det går sjældent lige op: gode og dårlige perioder er normalt',
      'Følg din morgensmerte over uger, ikke dage. Se din graf i statistikken',
      'Tung styrketræning kan give hurtigere bedring i de første 3 måneder'
    ] },
  { id: 'hvad-virker', icon: '✅', title: 'Hvad virker?',
    text: 'Det, der har den bedste dokumentation, er det, du selv kan gøre hjemme. Brug det sammen:',
    bullets: [
      'Viden om tilstanden og belastningsstyring (det, du læser her)',
      'Udstrækning af fodsålen og læggen hver dag',
      'Styrketræning af læg og fod, gradvist tungere',
      'Tape i de første uger',
      'Gode sko og evt. hælkop eller blødt indlæg sammen med øvelserne',
      'Vægttab ved overvægt',
      'Hjælper det ikke efter 6–12 uger, kan en fysioterapeut eller læge tilbyde andre behandlinger, fx trykbølgebehandling, specialindlæg eller i sjældne tilfælde en indsprøjtning'
    ] },
  { id: 'hverdag', icon: '👟', title: 'Gode råd i hverdagen',
    text: 'Små ændringer i hverdagen kan gøre en stor forskel for hælen:',
    bullets: [
      'Sko: brug sko med blød, støddæmpende sål, god pasform og en hæl, der er lidt højere end forfoden. Også indendørs',
      'Undgå at gå barfodet på hårde gulve, og undgå flade klipklappere, slidte sko og høje hæle',
      'Indlæg: en blød hælkop eller et støddæmpende indlæg kan aflaste. Billige virker ofte lige så godt som dyre',
      'Morgenstræk: stræk fodsålen, før du står ud af sengen, og før du rejser dig efter at have siddet længe',
      'Aflastning: del lange gåture op i kortere, skift stilling, hvis du står meget, og hold pauser. Cykling og svømning er fine alternativer',
      'Is: rul foden på en frossen flaske i højst 10 minutter efter en lang dag. Det lindrer, men helbreder ikke',
      'Vægt: ved overvægt aflaster et vægttab hælen ved hvert eneste skridt',
      'Tape: kan lindre de første uger. Bed din fysioterapeut om at vise dig, hvordan'
    ] },
  { id: 'smerteregel', icon: '🌡️', title: 'Smerte og træning', warn: true,
    text: HAEL_PAIN_RULE },
  { id: 'virker-ikke', icon: '🚫', title: 'Det kan du springe over',
    bullets: [
      'Total hvile i lang tid. Foden skal belastes, bare klogt og gradvist',
      'Ultralydsbehandling: tilføjer ingen effekt til udstrækning',
      'Indlæg alene uden øvelser: hjælper sjældent nok alene',
      'Dyre specialsko eller gadgets med store løfter',
      'Gentagne binyrebarkhormon-indsprøjtninger: virker kun kortvarigt og kan øge risikoen for, at fascien går i stykker',
      'Operation af knoglesporen: er sjældent nødvendig, og sporen er sjældent årsagen'
    ] },
  { id: 'roede-flag', icon: '⚠️', title: 'Hvornår skal du søge hjælp?', warn: true,
    text: 'Kontakt din læge (uden for åbningstid: lægevagten eller 1813 i Region Hovedstaden), hvis du har:',
    bullets: [
      'Pludselig, kraftig smerte efter et fald, et vrid eller et "knæk", eller du ikke kan støtte på foden',
      'Hævelse, rødme og varme i hælen, især med feber',
      'Snurren, prikken, brændende smerte eller følelsesløshed i foden',
      'Smerter, der er værst om natten eller i hvile og bliver værre',
      'Smerter i begge hæle samtidig sammen med stive eller hævede led andre steder eller morgenstivhed i ryggen',
      'Sukkersyge og fodsmerter, sår eller nedsat følesans',
      'Ømhed over hele hælbenet, når du klemmer på siderne (kan være et træthedsbrud)'
    ],
    after: 'Kontakt også en fysioterapeut eller læge, hvis du ikke mærker bedring efter 6–8 ugers træning, eller hvis smerten bliver ved med at blive værre.' },
  { id: 'om-sporet', icon: 'ℹ️', title: 'Om programmet',
    text: 'Programmet bygger på den amerikanske fysioterapiguideline for hælsmerter (JOSPT 2023), danske studier af tung styrketræning (Rathleff m.fl.) og råd fra sundhed.dk og NHS. Det er et generelt program og erstatter ikke en undersøgelse hos fysioterapeut eller læge. Er du i tvivl, om det er hælspore, så få det undersøgt.' }
];

/* ---------- Ekstra brugervenlige funktioner ---------- */

/* 1) Morgenrutine på 2 minutter – i sengen, før første skridt. Tidsangivelser i sekunder (til nedtælling). */
const HAEL_MORNING_ROUTINE = {
  title: 'Morgenrutine på 2 minutter',
  subtitle: 'Lav den, mens du sidder på sengekanten, før du tager de første skridt.',
  steps: [
    /* tempo kan rettes her: reps = antal gentagelser, cycleSec = sekunder pr. bevægelse,
       holdSec/restSec = hold og slip (kun stræk). Summen skal passe med sec. */
    { sec: 20, text: 'Vip foden op og ned 20 gange. Det vækker læggen og fodsålen.',
      anim: 'pumps', tempo: { reps: 20, cycleSec: 1 } },
    { sec: 20, text: 'Tegn store, rolige cirkler med foden, 5 gange hver vej.',
      anim: 'circles', tempo: { reps: 10, cycleSec: 2, switchAfter: 5 } },
    { sec: 60, text: 'Stræk fodsålen: læg foden over knæet, og bøj tæerne op mod dig. Hold 10 sekunder, slip. Gentag 5 gange.',
      anim: 'stretch', tempo: { reps: 5, cycleSec: 12, holdSec: 10, restSec: 2 } },
    { sec: 20, text: 'Krøl og spred tæerne 10 gange.',
      anim: 'toes', tempo: { reps: 10, cycleSec: 2 } },
    { sec: 0, text: 'Tag sko eller gode hjemmesko på, før du går ud på det hårde gulv.' }
  ],
  extra: 'Har du siddet stille længe i løbet af dagen? Så lav 5 hurtige fodsålestræk, før du rejser dig.'
};

/* 2) "Klar til næste fase?"-tjeklister genbruger HAEL_PHASES[n].criteria.
      Regel: alle punkter skal kunne krydses af. Ellers foreslår appen at blive i fasen en uge mere. */
const HAEL_READY_TEXT = {
  allChecked: 'Flot! Du er klar til næste fase. Start forsigtigt, og hold øje med morgensmerten de første dage.',
  notYet: 'Ikke helt endnu, og det er helt normalt. Bliv i denne fase en uge mere, og tjek igen. Hælen bestemmer tempoet, ikke kalenderen.',
  stepBack: 'Er det blevet værre i en uges tid? Så gå gerne en fase tilbage i 1–2 uger. Det er ikke et nederlag. Det er klog træning.'
};

/* 3) Skotjekliste */
const HAEL_SHOE_CHECKLIST = {
  title: 'Skotjek: Er dine sko hælvenlige?',
  items: [
    'Sålen er blød og støddæmpende under hælen',
    'Hælen er lidt højere end forfoden (ikke helt flad)',
    'Skoen sidder fast om hælen og kan snøres eller lukkes',
    'Hælkappen er fast og falder ikke sammen, når du klemmer på den',
    'Skoen kan bøjes ved tæerne, men ikke på midten',
    'Sålen er ikke slidt skæv eller flad',
    'Der er plads til tæerne, og der er plads til en hælkop eller et indlæg',
    'Du har også gode sko eller hjemmesko til indendørs brug'
  ],
  avoid: ['Klipklappere og løse slippers', 'Helt flade, bløde sko uden støtte', 'Høje hæle', 'Barfodsgang på hårde gulve', 'Gamle løbesko (over ca. 600–800 km)']
};

/* 4) Daglig skridt- og belastningsguide – trafiklys styret af morgensmerten */
const HAEL_LOAD_GUIDE = {
  title: 'Hvor meget må jeg gå i dag?',
  intro: 'Brug morgensmerten (de første skridt) til at vælge dagens belastning.',
  levels: [
    { tone: 'green', label: 'Grøn: 0–2, eller som de seneste dage',
      text: 'Fortsæt planen. Du må gerne øge din gåtur eller dit skridttal med ca. 10 % i forhold til sidste uge.' },
    { tone: 'yellow', label: 'Gul: 3–5, eller lidt værre end normalt',
      text: 'Hold samme niveau som i går. Del gåturen op i flere korte ture. Brug gode sko hele dagen.' },
    { tone: 'red', label: 'Rød: 6 eller mere, eller tydeligt værre end normalt',
      text: 'Let dag: skær gang og stående med 20–30 %. Lav kun morgenrutine, stræk og stille pres mod væggen. Cykel eller svøm, hvis du vil røre dig. Prøv igen i morgen.' }
  ],
  stepsHint: 'Har du en skridttæller på telefonen? Find dit normale skridttal en almindelig dag, og øg med højst 10 % om ugen.'
};

/* 5) Plan for en dårlig dag (opblussen) */
const HAEL_FLARE_PLAN = {
  title: 'Dårlig dag? Sådan gør du',
  steps: [
    'Bliv rolig. En dårlig dag betyder ikke, at det går den forkerte vej.',
    'Gå et trin ned: kun stræk og stille pres mod væggen i dag.',
    'Brug dine bedste sko, og evt. tape eller hælkop.',
    'Rul foden på en frossen flaske i 5–10 minutter.',
    'Del dagens gang op i korte ture, og sæt dig, når du kan.',
    'Prøv dit normale program igen, når morgensmerten er tilbage på dit normale niveau, typisk efter 1–3 dage.'
  ]
};

/* 6) Myter og fakta (kort quiz/kort-visning) */
const HAEL_MYTHS = [
  { myth: 'Knoglesporen stikker i foden og giver smerten.', fact: 'Nej. Mange har en spore uden at have ondt. Smerten kommer fra den overbelastede plantarfascie.' },
  { myth: 'Jeg skal holde helt op med at gå, til det er væk.', fact: 'Nej. Foden har brug for belastning, men i en mængde, den kan tåle. Brug trafiklyset.' },
  { myth: 'Det gør ondt, så jeg ødelægger noget.', fact: 'Smerte ved hælspore er et signal om, at hælen er overfølsom, ikke at du laver skade. Brug smertereglen.' },
  { myth: 'Dyre specialindlæg er nødvendige.', fact: 'Billige, færdige indlæg eller en hælkop virker ofte lige så godt, især sammen med øvelser.' },
  { myth: 'Hælspore går aldrig over.', fact: 'De fleste bliver gode igen. Det kræver tålmodighed, men du kan selv gøre meget.' }
];

/* 7) Dagens tanke for hælsporet */
const HAEL_DAILY_MESSAGES = [
  'De første skridt om morgenen er dit bedste termometer. Følg dem over uger, ikke dage.',
  'Stræk fodsålen, før du står op. Så bliver de første skridt nemmere.',
  'Gode sko er medicin for hælen, også indendørs.',
  'Tung og langsom styrketræning gør plantarfascien stærkere.',
  'En dårlig dag er ikke et tilbageslag. Skru lidt ned, og prøv igen i morgen.',
  'Hæløft med håndklæde under tæerne træner fodsålen direkte.',
  'Hælsporen på røntgen er sjældent årsagen til smerten.',
  'Øg din gåtur med højst 10 % om ugen.',
  'Cykling og svømning holder formen ved lige uden at belaste hælen.',
  'Hælen bestemmer tempoet, ikke kalenderen.',
  'Tålmodighed betaler sig: de fleste bliver gode igen.',
  'Har du siddet længe? 5 hurtige fodsålestræk, før du rejser dig.'
];

/* 8) Mærker for hælsporet */
const HAEL_BADGES = [
  { id: 'hael-morgen7', icon: '🌅', name: 'Morgenrutine 7 dage', how: 'Lav morgenrutinen 7 dage.' },
  { id: 'hael-fase2', icon: '📈', name: 'Fase 2 nået', how: 'Opfyld kriterierne for fase 1, og ryk videre.' },
  { id: 'hael-fase3', icon: '💪', name: 'Fase 3 nået', how: 'Klar til tung styrke på ét ben.' },
  { id: 'hael-fase4', icon: '🏃', name: 'Fase 4 nået', how: 'Klar til at vende tilbage til aktivitet.' },
  { id: 'hael-skotjek', icon: '👟', name: 'Skotjek', how: 'Gennemfør skotjeklisten.' },
  { id: 'hael-info', icon: '🎓', name: 'Hælekspert', how: 'Læs alle infosiderne om hælspore.' },
  { id: 'hael-morgen-lav', icon: '☀️', name: 'Gode morgener', how: 'Morgensmerten på 0–2 fem dage i træk.' }
];

/* ---------- Kilder ---------- */
const HAEL_SOURCES = [
  { label: 'Koc TA m.fl. Heel Pain – Plantar Fasciitis: Revision 2023. JOSPT 2023;53(12):CPG1–CPG39', url: 'https://www.jospt.org/doi/10.2519/jospt.2023.0303' },
  { label: 'Rathleff MS m.fl. High-load strength training improves outcome in patients with plantar fasciitis. Scand J Med Sci Sports 2015', url: 'https://onlinelibrary.wiley.com/doi/10.1111/sms.12313' },
  { label: 'DiGiovanni BF m.fl. Tissue-specific plantar fascia-stretching exercise enhances outcomes in patients with chronic heel pain. JBJS 2003', url: 'https://pubmed.ncbi.nlm.nih.gov/12851352/' },
  { label: 'Riel H m.fl. Corticosteroid injection plus exercise or exercise alone vs patient advice and heel cup (plantar fasciopati). BJSM 2023', url: 'https://bjsm.bmj.com/content/57/18/1180' },
  { label: 'Morrissey D m.fl. Management of plantar heel pain: a best practice guide. BJSM 2021', url: 'https://bjsm.bmj.com/content/55/19/1106' },
  { label: 'Hansen L m.fl. Long-term prognosis of plantar fasciitis: 5- to 15-year follow-up. OJSM 2018', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC5844527/' },
  { label: 'sundhed.dk, Patienthåndbogen: Plantar fasciitis og hælspore', url: 'https://www.sundhed.dk/borger/patienthaandbogen/knogler-muskler-og-led/sygdomme/laeg-ankel-fod/plantar-fasciitis-og-haelspore/' },
  { label: 'sundhed.dk, Lægehåndbogen: Hælsporesyndrom (fasciitis plantaris)', url: 'https://www.sundhed.dk/sundhedsfaglig/laegehaandbogen/fysmed-og-rehab/tilstande-og-sygdomme/laeg-ankel-og-fod/plantar-fasciitis/' },
  { label: 'Kamonseki DH m.fl. Effect of stretching with and without muscle strengthening exercises for the foot and hip in patients with plantar fasciitis: a randomized controlled single-blind clinical trial. Man Ther 2016', url: 'https://pubmed.ncbi.nlm.nih.gov/27083390/' },
  { label: 'Thong-On S m.fl. Effects of strengthening and stretching exercises on the temporospatial gait parameters in patients with plantar fasciitis. J Exerc Rehabil 2019', url: 'https://pubmed.ncbi.nlm.nih.gov/30899745/' },
  { label: 'NHS: Plantar fasciitis og Heel pain', url: 'https://www.nhs.uk/conditions/plantar-fasciitis/' }
];

/* Stabile id'er til infosiderne (bruges til "læst og forstået"), som i data.js. */
HAEL_INFO.forEach(a => { a.id = 'hael-' + a.id; });
