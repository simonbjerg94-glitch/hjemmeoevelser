/* Standardøvelser, tegninger og gode råd til Hjemmeøvelser ved knæ- og hofteartrose.
   Ingen klientdata gemmes her – kun generelle øvelser. */
'use strict';

const CATEGORIES = [
  { id: 'knae', name: 'Knæartrose', icon: 'knae' },
  { id: 'hofte', name: 'Hofteartrose', icon: 'hofte' },
  { id: 'balance', name: 'Balance og gang', icon: 'balance', small: true }
];

const LEVELS = [
  { n: 1, name: 'Niveau 1', sub: 'Let' },
  { n: 2, name: 'Niveau 2', sub: 'Middel' },
  { n: 3, name: 'Niveau 3', sub: 'Svær' }
];

const PAIN_RULE =
  'Brug smerteskalaen 0–10 (0 = ingen smerte, 10 = værst tænkelige). ' +
  '0–2: fint. 3–5: acceptabelt, hvis smerten er faldet til ro igen næste dag. ' +
  'Over 5, eller mere smerte eller hævelse næste dag: skru ned næste gang (færre gentagelser, mindre bevægeudslag eller et lettere niveau). ' +
  'Stop og kontakt din fysioterapeut ved skarp, jagende smerte, eller hvis det ikke falder til ro.';
const BALANCE_RULE = PAIN_RULE + ' Lav altid balanceøvelser med noget fast at holde i inden for rækkevidde. Stop ved svimmelhed.';

const DEFAULT_EXERCISES = [
  /* ================= KNÆARTROSE ================= */
  {
    id: 'knae-1-laarmuskel', category: 'knae', level: 1,
    images: [{"src": "images/knae-1-laarmuskel/1.webp", "caption": "1. Sid med benene strakt og et sammenrullet håndklæde under knæet", "w": 900, "h": 506}, {"src": "images/knae-1-laarmuskel/2.webp", "caption": "2. Træk tæerne op, og pres knæhasen ned i håndklædet i 5 sekunder", "w": 900, "h": 506}], /* auto: tools/sync_images.py */
    name: 'Spænd lårmusklen (knæstræk med håndklæde)',
    dose: '2–3 sæt × 10 gentagelser. Hold hver spænding i 5 sekunder.',
    steps: [
      'Sid eller lig med benene strakt. Læg et sammenrullet håndklæde under knæet.',
      'Træk tæerne op mod dig.',
      'Pres knæhasen ned mod håndklædet, så lårmusklen strammes og knæet strækkes helt ud.',
      'Hold i 5 sekunder, og slap så helt af.'
    ],
    tips: [
      'Mærk med hånden på låret, at musklen bliver hård.',
      'Træk vejret roligt – hold ikke vejret.',
      'Træn begge ben, også det "gode".'
    ],
    progression: 'Lettere: hold kun 2–3 sekunder. Sværere: løft hælen lidt fra underlaget, mens du spænder – eller gå videre til "Knæstræk siddende".',
    stop: PAIN_RULE,
    videoOld: 'https://www.youtube.com/watch?v=YpPj59jANJE', videoSourceOld: 'Patient Exercises (engelsk): "Quad Set with Towel Under Knee"'
  },
  {
    id: 'knae-1-rejse-hoej', category: 'knae', level: 1,
    images: [{"src": "images/knae-1-rejse-hoej/1.webp", "caption": "1. Sid fremme på stolen med fødderne i gulvet (gerne lidt bag knæene)", "w": 900, "h": 506}, {"src": "images/knae-1-rejse-hoej/2.webp", "caption": "2. Læn dig frem, næsen over tæerne", "w": 830, "h": 1440}, {"src": "images/knae-1-rejse-hoej/3.webp", "caption": "3. Rejs dig helt op", "w": 848, "h": 1440}], /* auto: tools/sync_images.py */
    name: 'Rejse og sætte sig fra høj stol',
    dose: '2–3 sæt × 10 gentagelser.',
    steps: [
      'Sid fremme på en høj, stabil stol med armlæn (læg evt. en ekstra pude i sædet).',
      'Sæt fødderne i hoftebredde, lidt bag knæene.',
      'Læn overkroppen frem ("næsen over tæerne"), og rejs dig op til du står helt oprejst. Brug armene så lidt som muligt.',
      'Sæt dig langsomt og kontrolleret ned igen.'
    ],
    tips: [
      'Knæene skal pege i retning af 2. tå – lad dem ikke falde ind mod hinanden.',
      'Fordel vægten ligeligt på begge ben.',
      'Tæl gerne til 3 på vejen ned.'
    ],
    progression: 'Lettere: højere sæde, og brug armene mere. Sværere: lavere stol og mindre hjælp fra armene – næste trin er Niveau 2.',
    stop: PAIN_RULE,
    videoOld: 'https://www.youtube.com/watch?v=1HESRTfudm4', videoSourceOld: 'MedBridge (engelsk): "Sit to Stand with Armchair"'
  },
  {
    id: 'knae-1-knaestraek-siddende', category: 'knae', level: 1,
    images: [{"src": "images/knae-1-knaestraek-siddende/1.webp", "caption": "1. Sid godt tilbage på stolen med rank ryg", "w": 756, "h": 1440}, {"src": "images/knae-1-knaestraek-siddende/2.webp", "caption": "2. Stræk knæet, og træk tæerne op mod dig", "w": 904, "h": 1440}, {"src": "images/knae-1-knaestraek-siddende/3.webp", "caption": "3. Sænk foden langsomt ned igen", "w": 882, "h": 1440}], /* auto: tools/sync_images.py */
    name: 'Knæstræk siddende',
    dose: '2–3 sæt × 10–15 gentagelser på hvert ben.',
    steps: [
      'Sid godt tilbage på en stol med rank ryg.',
      'Stræk det ene knæ, til benet er vandret, og træk tæerne op mod dig.',
      'Hold 2–3 sekunder med lårmusklen spændt.',
      'Sænk langsomt foden ned igen. Skift ben efter et sæt.'
    ],
    tips: [
      'Rolig bevægelse – sving ikke benet.',
      'Hold hofte, knæ og fod på linje (knæet peger lige frem).',
      'Kan laves foran fjernsynet eller ved spisebordet.'
    ],
    progression: 'Lettere: stræk kun halvt op. Sværere: hold 5 sekunder i toppen, eller brug en vægtmanchet om anklen.',
    stop: PAIN_RULE,
    videoOld: 'https://www.youtube.com/watch?v=HB0hHrXwImI', videoSourceOld: 'The Rotherham NHS Foundation Trust (engelsk): "Seated knee extension"'
  },
  {
    id: 'knae-2-rejse-uden-arme', category: 'knae', level: 2,
    images: [{"src": "images/knae-2-rejse-uden-arme/1.webp", "caption": "1. Sid fremme med armene krydset over brystet", "w": 848, "h": 1440}, {"src": "images/knae-2-rejse-uden-arme/2.webp", "caption": "2. Læn dig frem, næsen over tæerne", "w": 842, "h": 1440}, {"src": "images/knae-2-rejse-uden-arme/3.webp", "caption": "3. Rejs dig helt op, og sæt dig langsomt ned igen", "w": 850, "h": 1440}], /* auto: tools/sync_images.py */
    name: 'Rejse og sætte sig uden armstøtte',
    dose: '2–3 sæt × 10–15 gentagelser.',
    steps: [
      'Sid fremme på en almindelig spisebordsstol. Fødderne i hoftebredde, lidt bag knæene.',
      'Kryds armene over brystet.',
      'Læn dig frem, og rejs dig op til du står helt oprejst.',
      'Sæt dig langsomt ned igen – tæl til 3 på vejen ned.'
    ],
    tips: [
      'Knæet over 2. tå – lad ikke knæene falde indad.',
      'Lige meget vægt på begge ben.',
      'Kvalitet før hastighed.'
    ],
    progression: 'Lettere: brug armene eller en højere stol (Niveau 1). Sværere: lavere stol, langsommere tempo eller pause lige over sædet – næste trin er "Rejse og sætte sig på ét ben".',
    stop: PAIN_RULE,
    videoOld: 'https://www.youtube.com/watch?v=29WFLqHgYZ0', videoSourceOld: 'NHS inform (engelsk): "Sit to stand"'
  },
  {
    id: 'knae-2-trin-op', category: 'knae', level: 2,
    images: [{"src": "images/knae-2-trin-op/1.webp", "caption": "1. Stå foran trinnet, og hold fast i gelænderet", "w": 848, "h": 1440}, {"src": "images/knae-2-trin-op/2.webp", "caption": "2. Sæt hele foden op på trinnet", "w": 844, "h": 1440}, {"src": "images/knae-2-trin-op/3.webp", "caption": "3. Pres op, til du står på trinnet med strakt ben", "w": 850, "h": 1440}], /* auto: tools/sync_images.py */
    name: 'Trin op på trappetrin',
    dose: '2–3 sæt × 10 gentagelser på hvert ben.',
    steps: [
      'Stil dig foran nederste trappetrin, og hold fast i gelænderet.',
      'Sæt hele den ene fod op på trinnet.',
      'Pres op gennem hele foden, til du står på trinnet med strakt ben.',
      'Gå langsomt ned igen med det samme ben først. Skift ben efter et sæt.'
    ],
    tips: [
      'Knæet over 2. tå – lad det ikke falde indad.',
      'Hold bækkenet lige – hoften må ikke falde ud til siden.',
      'Overkroppen er rank og let foroverbøjet.'
    ],
    progression: 'Lettere: lavere trin (fx et trinbræt på 10 cm). Sværere: højere trin, langsommere ned, eller uden at holde fast.',
    stop: PAIN_RULE,
    videoOld: 'https://www.youtube.com/watch?v=F7OFOPb7ghQ', videoSourceOld: 'Smertefribevægelse (dansk): "Step up – Knæ- og hofteøvelse"'
  },
  {
    id: 'knae-2-minisquat', category: 'knae', level: 2,
    images: [{"src": "images/knae-2-minisquat/1.webp", "caption": "1. Stå ved køkkenbordet med fødderne i hoftebredde", "w": 838, "h": 1440}, {"src": "images/knae-2-minisquat/2.webp", "caption": "2. Skub bagdelen bagud, og bøj knæene lidt", "w": 844, "h": 1440}, {"src": "images/knae-2-minisquat/3.webp", "caption": "3. Rejs dig op igen gennem hele foden", "w": 838, "h": 1440}], /* auto: tools/sync_images.py */
    name: 'Minisquat ved køkkenbordet',
    dose: '2–3 sæt × 10–15 gentagelser.',
    steps: [
      'Stå med front mod køkkenbordet, og hold let fast. Fødderne i hoftebredde.',
      'Skub bagdelen bagud, og bøj knæene lidt – som om du skal sætte dig på en høj barstol.',
      'Gå kun så langt ned, at du kan holde god kontrol.',
      'Rejs dig op igen ved at presse gennem hele foden.'
    ],
    tips: [
      'Knæene peger over 2. tå – hofte, knæ og fod på en lodret linje.',
      'Vægten fordelt på hele foden (både hæl og forfod).',
      'Hold ryggen rank og blikket fremad.'
    ],
    progression: 'Lettere: bøj mindre i knæene, og hold mere fast. Sværere: gå lidt dybere, langsommere tempo eller mindre støtte.',
    stop: PAIN_RULE,
    videoOld: 'https://www.youtube.com/watch?v=Ubh9yjgBR8s', videoSourceOld: 'Physical Therapy First (engelsk): "Knee – Mini Squats With Chair Support"'
  },
  {
    id: 'knae-3-rejse-et-ben', category: 'knae', level: 3,
    images: [{"src": "images/knae-3-rejse-et-ben/1.webp", "caption": "1. Sid fremme med det ene ben lidt frem og vægten på det bagerste", "w": 900, "h": 506}, {"src": "images/knae-3-rejse-et-ben/2.webp", "caption": "2. Læn dig frem, og rejs dig med kraft fra det bagerste ben", "w": 836, "h": 1440}, {"src": "images/knae-3-rejse-et-ben/3.webp", "caption": "3. Stå oprejst, og sæt dig langsomt ned igen", "w": 846, "h": 1440}], /* auto: tools/sync_images.py */
    name: 'Rejse og sætte sig på ét ben',
    dose: '2–3 sæt × 6–10 gentagelser på hvert ben.',
    steps: [
      'Sid fremme på en stol. Sæt det ene ben lidt frem med hælen i gulvet, så det kun hviler.',
      'Hav vægten på det bagerste ben.',
      'Læn dig frem, og rejs dig op – primært med kraft fra det bagerste ben.',
      'Sæt dig langsomt ned igen. Skift ben efter et sæt.'
    ],
    tips: [
      'Knæet over 2. tå på det ben, der arbejder.',
      'Hold bækkenet lige – læn dig ikke over mod det aflastede ben.',
      'Ingen fart – rejs og sæt dig i roligt tempo.'
    ],
    progression: 'Lettere: lad det forreste ben hjælpe lidt, brug en højere stol eller en hånd på armlænet. Sværere: lavere stol, eller løft det forreste ben helt fra gulvet.',
    stop: PAIN_RULE,
    videoOld: 'https://www.youtube.com/watch?v=jeO7bINj1Fw', videoSourceOld: 'Advantage Physiotherapy (engelsk): "Single Leg Sit to Stand"'
  },
  {
    id: 'knae-3-udfald-frem', category: 'knae', level: 3,
    images: [{"src": "images/knae-3-udfald-frem/1.webp", "caption": "1. Stå ved køkkenbordet, og hold fast", "w": 844, "h": 1440}, {"src": "images/knae-3-udfald-frem/2.webp", "caption": "2. Tag et langt skridt frem", "w": 842, "h": 1440}, {"src": "images/knae-3-udfald-frem/3.webp", "caption": "3. Bøj begge knæ, og sænk dig lodret ned", "w": 846, "h": 1440}], /* auto: tools/sync_images.py */
    name: 'Udfaldsskridt fremad',
    dose: '2–3 sæt × 8–10 gentagelser på hvert ben.',
    steps: [
      'Stå ved siden af køkkenbordet eller en stoleryg, så du kan holde fast.',
      'Tag et langt skridt frem.',
      'Bøj begge knæ, og sænk dig lodret ned, så langt det føles godt.',
      'Pres fra med det forreste ben, og træd tilbage til start. Skift ben.'
    ],
    tips: [
      'Forreste knæ over 2. tå og omtrent over anklen.',
      'Overkroppen er rank, og bækkenet holdes lige.',
      'Langsom og kontrolleret bevægelse.'
    ],
    progression: 'Lettere: kortere skridt, gå mindre dybt og hold fast. Sværere: dybere, langsommere, eller uden støtte.',
    stop: PAIN_RULE,
    videoOld: 'https://www.youtube.com/watch?v=V1n7ZWElYkw', videoSourceOld: 'The Rotherham NHS Foundation Trust (engelsk): "Forward lunges"'
  },
  {
    id: 'knae-3-trin-ned', category: 'knae', level: 3,
    images: [{"src": "images/knae-3-trin-ned/1.webp", "caption": "1. Stå på det nederste trin, og hold fast i gelænderet", "w": 900, "h": 506}, {"src": "images/knae-3-trin-ned/2.webp", "caption": "2. Bøj langsomt standbenet, og før den anden fod frem og ned, til hælen rører gulvet let. Stræk standbenet op igen", "w": 900, "h": 506}], /* auto: tools/sync_images.py */
    name: 'Trin ned fra trappetrin',
    dose: '2–3 sæt × 8–10 gentagelser på hvert ben.',
    steps: [
      'Stå på nederste trappetrin, og hold fast i gelænderet.',
      'Bøj langsomt knæet på standbenet, og før den anden fod frem og ned mod gulvet.',
      'Rør gulvet let med hælen – uden at lægge vægt på den.',
      'Stræk standbenet og kom op igen. Skift ben efter et sæt.'
    ],
    tips: [
      'Knæet på standbenet over 2. tå – lad det ikke falde indad.',
      'Hold bækkenet lige.',
      'Tæl til 3 på vejen ned.'
    ],
    progression: 'Lettere: lavere trin (fx et trinbræt). Sværere: højere trin, eller uden at holde fast.',
    stop: PAIN_RULE,
    videoOld: 'https://www.youtube.com/watch?v=B3CjUyMouBA', videoSourceOld: 'E3 Rehab (engelsk): "Forward Step Down"'
  },

  /* ================= HOFTEARTROSE ================= */
  {
    id: 'hofte-1-broen', category: 'hofte', level: 1,
    images: [{"src": "images/hofte-1-broen/1.webp", "caption": "1. Lig på ryggen med bøjede knæ og fødderne i gulvet", "w": 900, "h": 506}, {"src": "images/hofte-1-broen/2.webp", "caption": "2. Spænd ballerne, og løft bagdelen til en lige linje fra skuldre til knæ", "w": 900, "h": 506}], /* auto: tools/sync_images.py */
    name: 'Broen',
    dose: '2–3 sæt × 10–15 gentagelser. Hold 3 sekunder i toppen.',
    steps: [
      'Lig på ryggen med bøjede knæ og fødderne i gulvet i hoftebredde.',
      'Armene ligger langs siden.',
      'Spænd ballerne, og løft bagdelen, til der er en lige linje fra skuldre til knæ.',
      'Hold 3 sekunder, og sænk langsomt ned igen.'
    ],
    tips: [
      'Knæene peger lige frem – lad dem ikke falde ind eller ud.',
      'Pres ned gennem hælene.',
      'Løft ikke højere end at du undgår at svaje i lænden.'
    ],
    progression: 'Lettere: løft kun lidt. Sværere: hold 5–10 sekunder i toppen – næste trin er "Broen på ét ben".',
    stop: PAIN_RULE,
    videoOld: 'https://www.youtube.com/watch?v=TNlAiAJwqqA', videoSourceOld: 'NHS University Hospitals Plymouth Physiotherapy (engelsk): "Hip bridging"'
  },
  {
    id: 'hofte-1-sideloeft-liggende', category: 'hofte', level: 1,
    images: [{"src": "images/hofte-1-sideloeft-liggende/1.webp", "caption": "1. Lig på siden med hovedet på armen og det øverste ben strakt", "w": 900, "h": 506}, {"src": "images/hofte-1-sideloeft-liggende/2.webp", "caption": "2. Løft det øverste ben op og en anelse bagud, og sænk det langsomt", "w": 900, "h": 506}], /* auto: tools/sync_images.py */
    name: 'Sideløft liggende',
    dose: '2–3 sæt × 10–15 gentagelser på hver side.',
    steps: [
      'Lig på siden med hovedet på armen eller en pude. Bøj det nederste ben for støtte.',
      'Det øverste ben er strakt i forlængelse af kroppen.',
      'Løft det øverste ben op og en anelse bagud. Tæerne peger frem eller let nedad.',
      'Sænk benet langsomt ned igen.'
    ],
    tips: [
      'Bækkenet må ikke rulle bagover – læg evt. den øverste hånd på hoften.',
      'Undgå at svaje i lænden.',
      'Løft kun så højt, at du kan holde god kontrol.'
    ],
    progression: 'Lettere: løft mindre, eller lav det med bøjet knæ. Sværere: hold 3 sekunder i toppen, eller brug en vægtmanchet om anklen – næste trin er sideløft stående.',
    stop: PAIN_RULE,
    videoOld: 'https://www.youtube.com/watch?v=Nci4WqRZmv8', videoSourceOld: 'Team Danmark (dansk): "Hofteøvelse 2: Sideliggende abduktion"'
  },
  {
    id: 'hofte-1-benet-bagud', category: 'hofte', level: 1,
    images: [{"src": "images/hofte-1-benet-bagud/1.webp", "caption": "1. Stå med front mod køkkenbordet, og hold fast", "w": 900, "h": 1017}, {"src": "images/hofte-1-benet-bagud/2.webp", "caption": "2. Før benet bagud med strakt knæ uden at svaje i lænden", "w": 900, "h": 1017}], /* auto: tools/sync_images.py */
    name: 'Benet bagud stående',
    dose: '2–3 sæt × 10–15 gentagelser på hvert ben.',
    steps: [
      'Stå med front mod køkkenbordet eller en stoleryg, og hold fast.',
      'Før det ene ben roligt bagud med strakt knæ.',
      'Spænd ballen – uden at svaje i lænden eller læne dig frem.',
      'Før benet tilbage. Skift ben efter et sæt.'
    ],
    tips: [
      'Overkroppen er rank – kun benet bevæger sig.',
      'Hold bækkenet lige.',
      'Det er en lille bevægelse – kvalitet før højde.'
    ],
    progression: 'Lettere: mindre bevægelse. Sværere: elastik om anklerne eller en vægtmanchet.',
    stop: PAIN_RULE,
    videoOld: 'https://www.youtube.com/watch?v=OaUMKUEoFQ4', videoSourceOld: 'NHS inform (engelsk): "Standing hip extension"'
  },
  {
    id: 'hofte-2-hoftehaengsel', category: 'hofte', level: 2,
    images: [{"src": "images/hofte-2-hoftehaengsel/1.webp", "caption": "1. Stå med let bøjede knæ og kosteskaftet langs ryggen", "w": 846, "h": 1440}, {"src": "images/hofte-2-hoftehaengsel/2.webp", "caption": "2. Skub bagdelen bagud, og bøj i hofterne med rank ryg", "w": 842, "h": 1440}, {"src": "images/hofte-2-hoftehaengsel/3.webp", "caption": "3. Skub hofterne frem, og rejs dig op", "w": 846, "h": 1440}], /* auto: tools/sync_images.py */
    name: 'Hoftehængsel (bøj i hofterne med rank ryg)',
    dose: '2–3 sæt × 10–12 gentagelser.',
    steps: [
      'Stå med fødderne i hoftebredde og let bøjede knæ.',
      'Hold et kosteskaft langs ryggen, så det rører baghovedet, ryggen mellem skulderbladene og halebenet (eller hav hænderne på hofterne).',
      'Skub bagdelen bagud, og bøj fremover i hofterne med rank ryg, til du mærker et stræk bag på lårene.',
      'Rejs dig op ved at skubbe hofterne frem og spænde ballerne.'
    ],
    tips: [
      'Ryggen er lige – kosteskaftet skal bevare kontakten tre steder.',
      'Knæene er let bøjede og peger over 2. tå.',
      'Vægten fordelt på hele foden.'
    ],
    progression: 'Lettere: bøj mindre frem, eller stå en lille skridtlængde fra en væg og skub bagdelen ind mod væggen. Sværere: hold en lille vægt (fx en vandflaske), eller lav det på ét ben med støtte.',
    stop: PAIN_RULE,
    videoOld: 'https://www.youtube.com/watch?v=2W_gXhut5S8', videoSourceOld: 'Hinge Health (engelsk): "How to Do a Hip Hinge"'
  },
  {
    id: 'hofte-2-sideloeft-staaende', category: 'hofte', level: 2,
    images: [{"src": "images/hofte-2-sideloeft-staaende/1.webp", "caption": "1. Stå ret op, og hold fast i stoleryggen", "w": 900, "h": 1020}, {"src": "images/hofte-2-sideloeft-staaende/2.webp", "caption": "2. Løft benet ud til siden med strakt knæ og tæerne frem", "w": 900, "h": 1020}], /* auto: tools/sync_images.py */
    name: 'Sideløft stående',
    dose: '2–3 sæt × 10–15 gentagelser på hvert ben.',
    steps: [
      'Stå ret op, og hold fast i køkkenbordet eller en stoleryg.',
      'Løft det ene ben ud til siden med strakt knæ og tæerne pegende frem.',
      'Løft kun så højt, at overkroppen kan blive rank.',
      'Sænk benet langsomt ind igen. Skift ben efter et sæt.'
    ],
    tips: [
      'Læn dig ikke over til siden – hold bækkenet lige.',
      'Standbenets knæ er let bøjet og peger over 2. tå.',
      'Træner både benet, der løftes, og stabiliteten i standbenet.'
    ],
    progression: 'Lettere: mindre løft, og hold fast med begge hænder. Sværere: elastik om anklerne (Niveau 3) eller mindre støtte.',
    stop: PAIN_RULE,
    videoOld: 'https://www.youtube.com/watch?v=Tmcs0DCyRPA', videoSourceOld: 'Team Danmark (dansk): "Hofteøvelse 5: Stående abduktion"'
  },
  {
    id: 'hofte-2-sidegang', category: 'hofte', level: 2,
    images: [{"src": "images/hofte-2-sidegang/1.webp", "caption": "1. Stå ved køkkenbordet med let bøjede knæ", "w": 848, "h": 1440}, {"src": "images/hofte-2-sidegang/2.webp", "caption": "2. Tag et skridt til siden", "w": 846, "h": 1440}, {"src": "images/hofte-2-sidegang/3.webp", "caption": "3. Før den anden fod efter", "w": 852, "h": 1440}], /* auto: tools/sync_images.py */
    name: 'Sidelæns gang langs køkkenbordet',
    dose: '2–3 sæt × 10 skridt hver vej.',
    steps: [
      'Stå med front mod køkkenbordet med let bøjede knæ. Hold let fast.',
      'Tag et skridt til siden, og før den anden fod efter.',
      'Gå 10 skridt til den ene side.',
      'Gå tilbage igen til den anden side.'
    ],
    tips: [
      'Tæerne peger frem, og knæene over 2. tå.',
      'Hold bækkenet vandret – vip ikke overkroppen fra side til side.',
      'Løft fødderne – slæb dem ikke.'
    ],
    progression: 'Lettere: små skridt, og hold mere fast. Sværere: bøj lidt mere i knæene, eller brug en elastik om anklerne.',
    stop: PAIN_RULE,
    videoOld: 'https://www.youtube.com/watch?v=arUBoAxSLVA', videoSourceOld: 'Balance Builders by Doug Weiss (engelsk): "Side-step exercise"'
  },
  {
    id: 'hofte-3-broen-et-ben', category: 'hofte', level: 3,
    images: [{"src": "images/hofte-3-broen-et-ben/1.webp", "caption": "1. Lig på ryggen, og stræk det ene ben", "w": 900, "h": 506}, {"src": "images/hofte-3-broen-et-ben/2.webp", "caption": "2. Løft bagdelen med det andet ben, til kroppen er lige fra skulder til knæ", "w": 900, "h": 506}], /* auto: tools/sync_images.py */
    name: 'Broen på ét ben',
    dose: '2–3 sæt × 8–10 gentagelser på hvert ben.',
    steps: [
      'Lig på ryggen med bøjede knæ og fødderne i gulvet.',
      'Stræk det ene knæ, så benet er i forlængelse af låret.',
      'Løft bagdelen med det andet ben, til kroppen er lige fra skulder til knæ.',
      'Hold 2–3 sekunder, og sænk langsomt. Skift ben efter et sæt.'
    ],
    tips: [
      'Bækkenet skal være vandret – lad det ikke tippe til siden.',
      'Knæet på standbenet peger lige frem.',
      'Pres ned gennem hælen.'
    ],
    progression: 'Lettere: almindelig broen (Niveau 1), eller løft med begge ben og løft det ene ben i toppen. Sværere: hold længere i toppen.',
    stop: PAIN_RULE,
    videoOld: 'https://www.youtube.com/watch?v=fUOB9VcyvYo', videoSourceOld: 'Hinge Health (engelsk): "How to Do a Single-Leg Bridge"'
  },
  {
    id: 'hofte-3-sideloeft-elastik', category: 'hofte', level: 3,
    images: [{"src": "images/hofte-3-sideloeft-elastik/1.webp", "caption": "1. Stå med elastikken om anklerne, og hold let fast", "w": 900, "h": 1017}, {"src": "images/hofte-3-sideloeft-elastik/2.webp", "caption": "2. Løft benet ud til siden mod modstanden, og før det langsomt ind", "w": 900, "h": 1017}], /* auto: tools/sync_images.py */
    name: 'Sideløft stående med elastik',
    dose: '2–3 sæt × 10–15 gentagelser på hvert ben.',
    steps: [
      'Sæt en træningselastik om anklerne. Stå ved køkkenbordet, og hold let fast.',
      'Løft det ene ben ud til siden mod modstanden med strakt knæ og tæerne frem.',
      'Hold et øjeblik yderst.',
      'Før benet langsomt ind igen (tæl til 3). Skift ben efter et sæt.'
    ],
    tips: [
      'Overkroppen er rank, og bækkenet lige.',
      'Standbenets knæ er let bøjet over 2. tå.',
      'Langsomt tilbage – lad ikke elastikken trække benet ind.'
    ],
    progression: 'Lettere: let elastik eller ingen elastik (Niveau 2). Sværere: stærkere elastik, eller mindre støtte.',
    stop: PAIN_RULE,
    videoOld: 'https://www.youtube.com/watch?v=lX2D8tkOYcs', videoSourceOld: 'Ask Doctor Jo (engelsk): "Standing Hip Abduction with Resistive Band"'
  },
  {
    id: 'hofte-3-udfald-bagud', category: 'hofte', level: 3,
    images: [{"src": "images/hofte-3-udfald-bagud/1.webp", "caption": "1. Stå ved køkkenbordet, og hold fast", "w": 828, "h": 1440}, {"src": "images/hofte-3-udfald-bagud/2.webp", "caption": "2. Tag et langt skridt bagud", "w": 844, "h": 1440}, {"src": "images/hofte-3-udfald-bagud/3.webp", "caption": "3. Sænk det bagerste knæ mod gulvet, og pres op igen", "w": 874, "h": 1440}], /* auto: tools/sync_images.py */
    name: 'Udfaldsskridt bagud',
    dose: '2–3 sæt × 8–10 gentagelser på hvert ben.',
    steps: [
      'Stå ved siden af køkkenbordet eller en stoleryg, så du kan holde fast.',
      'Tag et langt skridt bagud.',
      'Sænk det bagerste knæ mod gulvet, så det forreste knæ bøjes.',
      'Pres op gennem den forreste hæl, og før benet frem til start. Skift ben.'
    ],
    tips: [
      'Forreste knæ over 2. tå.',
      'Overkroppen rank, og bækkenet lige.',
      'Gå kun så dybt ned, at du kan holde kontrollen.'
    ],
    progression: 'Lettere: kortere skridt og mindre dybt. Sværere: dybere, langsommere, eller uden støtte.',
    stop: PAIN_RULE,
    videoOld: 'https://www.youtube.com/watch?v=TOQZJhhcjvE', videoSourceOld: 'The Rotherham NHS Foundation Trust (engelsk): "Reverse lunge"'
  },

  /* ================= BALANCE OG GANG ================= */
  {
    id: 'balance-1-samlede-foedder', category: 'balance', level: 1,
    images: [{"src": "images/balance-1-samlede-foedder/1.webp", "caption": "1. Stå med samlede fødder og hænderne ved bordkanten", "w": 900, "h": 1016}, {"src": "images/balance-1-samlede-foedder/2.webp", "caption": "2. Stå stille med blikket fremad, og slip bordet, når du føler dig sikker", "w": 900, "h": 1016}], /* auto: tools/sync_images.py */
    name: 'Stå med samlede fødder',
    dose: '3 gange × 20–30 sekunder.',
    steps: [
      'Stå ved køkkenbordet med hænderne lige over bordkanten.',
      'Sæt fødderne helt sammen.',
      'Stå stille med blikket fremad.',
      'Slip bordet, når du føler dig sikker – men hold hænderne tæt på.'
    ],
    tips: [
      'Stå rank med vægten fordelt på begge fødder.',
      'Hav altid noget fast at gribe fat i.',
      'Træk vejret roligt.'
    ],
    progression: 'Lettere: fødderne lidt fra hinanden, og hold fast. Sværere: drej hovedet fra side til side – næste trin er Niveau 2.',
    stop: BALANCE_RULE,
    videoOld: 'https://www.youtube.com/watch?v=AOcQoURMnP4', videoSourceOld: 'CafePhysio (engelsk): "Standing Balance – Feet Together"'
  },
  {
    id: 'balance-2-tandem', category: 'balance', level: 2,
    images: [{"src": "images/balance-2-tandem/1.webp", "caption": "1. Stå ved køkkenbordet, og hold let fast", "w": 900, "h": 1016}, {"src": "images/balance-2-tandem/2.webp", "caption": "2. Sæt den ene fod lige foran den anden, så hælen rører tæerne (set oppefra)", "w": 900, "h": 506}], /* auto: tools/sync_images.py */
    name: 'Tandemstand (hæl mod tå)',
    dose: '3 gange × 20–30 sekunder med hver fod forrest.',
    steps: [
      'Stå ved køkkenbordet, og hold let fast.',
      'Sæt den ene fod lige foran den anden, så hælen rører tæerne på den bagerste fod.',
      'Stå stille i 20–30 sekunder. Skift, så den anden fod er forrest.',
      'Når det er let: gå langsomt langs bordet med hæl mod tå.'
    ],
    tips: [
      'Blikket fremad – ikke ned på fødderne.',
      'Hav altid noget fast at gribe fat i.',
      'Stå rank med let bøjede knæ.'
    ],
    progression: 'Lettere: sæt foden lidt til siden (halv tandemstand). Sværere: slip bordet, eller gå hæl mod tå langs bordet.',
    stop: BALANCE_RULE,
    videoOld: 'https://www.youtube.com/watch?v=ra7tzlPxnsQ', videoSourceOld: 'Ask Doctor Jo (engelsk): "Tandem Stance"'
  },
  {
    id: 'balance-3-et-ben', category: 'balance', level: 3,
    images: [{"src": "images/balance-3-et-ben/1.webp", "caption": "1. Stå ved køkkenbordet, og hold let fast", "w": 900, "h": 1019}, {"src": "images/balance-3-et-ben/2.webp", "caption": "2. Løft den ene fod, og stå på ét ben i op til 30 sekunder", "w": 900, "h": 1020}], /* auto: tools/sync_images.py */
    name: 'Stå på ét ben',
    dose: '3 gange × 20–30 sekunder på hvert ben.',
    steps: [
      'Stå ved køkkenbordet, og hold let fast.',
      'Løft den ene fod lidt fra gulvet.',
      'Stå på ét ben i op til 30 sekunder. Slip bordet, hvis du kan.',
      'Skift ben.'
    ],
    tips: [
      'Hold bækkenet vandret – lad ikke hoften falde ud til siden.',
      'Standknæet er let bøjet og peger over 2. tå.',
      'Hav altid noget fast at gribe fat i.'
    ],
    progression: 'Lettere: hold fast, eller lad tåspidsen røre gulvet. Sværere: stå på en pude, drej hovedet, eller sving det frie ben langsomt frem og tilbage.',
    stop: BALANCE_RULE,
    videoOld: 'https://www.youtube.com/watch?v=QT5d4tTXW6U', videoSourceOld: 'National Institute on Aging (engelsk): "Stand on One Foot Balance Exercise for Older Adults"'
  }
];

/* ---------- Smertevurdering før og efter træning ----------
   Teksterne kan rettes her. Feedback vælges ud fra smerten EFTER træningen (0–10). */
const PAIN_CHECK = {
  beforeQuestion: 'Hvor ondt har du lige nu?',
  afterQuestion: 'Hvor ondt har du nu, efter træningen?',
  scaleHint: '0 = ingen smerte, 10 = værst tænkelige smerte',
  skipLabel: 'Spring over',
  finishButton: 'Færdig med træningen – hvor ondt har du nu?',
  feedback: [
    { max: 2, tone: 'green', title: 'Super!',
      text: 'Smerten er lav. Sådan skal det være – bliv ved med det gode arbejde.' },
    { max: 5, tone: 'yellow', title: 'Okay',
      text: 'Smerte på 3–5 er i orden under træning. Husk, at smerten gerne skal være faldet til ro igen i morgen. Er den ikke det, så skru lidt ned næste gang.' },
    { max: 10, tone: 'red', title: 'Lad os justere',
      text: 'Det gjorde mere ondt, end det bør. Det er ikke farligt, men næste gang skal du skrue ned: færre gentagelser, mindre bevægeudslag eller et lettere niveau. Kontakt din fysioterapeut, hvis smerten ikke falder til ro.' }
  ]
};

const GENERAL_ADVICE = [
  { title: 'Hvad er artrose?', text: 'Artrose (slidgigt) er en sygdom i hele leddet – ikke bare "slid". Brusken bliver tyndere, og knoglen, ledkapslen og musklerne omkring leddet ændrer sig. Leddet prøver hele tiden at reparere sig selv. Typiske tegn er smerter ved belastning, kortvarig stivhed om morgenen eller efter hvile, og at leddet bevæger sig mindre. Symptomerne svinger, og røntgenbilledet siger ikke meget om, hvor ondt det gør, eller hvad du kan.' },
  { title: 'Træning er førstevalget', text: 'Danske og internationale retningslinjer anbefaler patientuddannelse, træning og vægttab (ved overvægt) som første behandling ved knæ- og hofteartrose. Træning mindsker smerter og forbedrer funktionen. Træn 2–3 gange om ugen i mindst 6 uger, før du vurderer effekten – og gerne med vejledning fra en fysioterapeut i starten.' },
  { title: 'Kvalitet frem for kvantitet', text: 'Øvelserne bygger på principper for neuromuskulær træning: lær at styre leddet godt. Hofte, knæ og fod skal være på en lodret linje, så knæet peger over 2. tå og ikke falder indad. Hold bækkenet lige, og bevæg dig langsomt og kontrolleret. Gå kun så dybt eller tungt, at du kan holde god kvalitet.' },
  { title: 'Smerte under træning er i orden', text: 'Det er normalt og ikke farligt, at det gør lidt ondt, når du træner med artrose. Ondt betyder ikke, at leddet tager skade. Brug smerteskalaen nedenfor. Muskelømhed 1–2 dage efter træning er også normalt.' },
  { title: 'Smerteskalaen 0–10', text: '0–2: fint. 3–5: acceptabelt, hvis smerten er faldet til ro igen næste dag. Over 5, eller mere smerte eller hævelse næste dag: skru ned næste gang – færre gentagelser, mindre bevægeudslag eller et lettere niveau. Mål evt. smerten hver morgen i en periode, så du kender dit normale niveau.', warn: true },
  { title: 'Hvornår skal du rykke et niveau op?', text: 'Når du kan lave 3 sæt × 10–15 gentagelser med god kvalitet, og smerten holder sig inden for reglen, kan du prøve næste niveau – eller gøre øvelsen lidt sværere. Bliv gerne på et niveau, så længe det passer dig.' },
  { title: 'Vægttab ved overvægt', text: 'Hvis du har overvægt, aflaster et vægttab leddene. Ved knæartrose anbefaler Sundhedsstyrelsens retningslinje et vægttab på mere end 5 % af kropsvægten for at mindske smerter og forbedre funktionen – og at vægttabet holdes.' },
  { title: 'Hold dig aktiv i hverdagen', text: 'Gåture, cykling (også motionscykel), svømning og vandtræning er skånsomme for knæ og hofter og godt for konditionen. Del gerne aktiviteten op i flere korte ture i løbet af dagen. Lidt er bedre end ingenting.' },
  { title: 'Gode sko', text: 'Brug fodtøj med god pasform, flad hæl og en blød, stødabsorberende sål. Gå evt. med stok i den modsatte hånd af det dårlige ben på dårlige dage.' },
  { title: 'Gode og dårlige dage', text: 'Artrose svinger. På dårlige dage: skru ned i stedet for at holde helt pause – færre gentagelser eller et lettere niveau. Fordel dagens aktiviteter, og hold små pauser. Varme kan lindre stivhed; kulde kan dæmpe en hævelse.' },
  { title: 'Kontakt fysioterapeut eller læge', text: 'Kontakt din læge (uden for åbningstid: 1813), hvis leddet bliver varmt, rødt og hævet, især hvis du også har feber. Kontakt også fysioterapeut eller læge, hvis leddet låser sig, hvis du pludselig får meget mere ondt eller ikke kan støtte på benet, hvis du har natlige smerter, der ikke bliver bedre, eller hvis du ikke mærker fremgang efter 6–8 ugers træning.', warn: true },
  { title: 'Om appen', text: 'Øvelserne er inspireret af evidensbaserede principper for træning ved artrose, som de bruges i danske og internationale retningslinjer og i programmer som GLA:D. Appen er ikke en del af GLA:D og er ikke tilknyttet GLA:D. Den er et supplement og erstatter ikke individuel vejledning fra din fysioterapeut eller læge.' }
];

/* Stabile id'er til de gode råd (bruges til "læst og forstået"). */
GENERAL_ADVICE.forEach(a => { a.id = a.id || a.title.toLowerCase().replace(/æ/g, 'ae').replace(/ø/g, 'oe').replace(/å/g, 'aa').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); });

/* Dagens tanke – roterer dagligt. Evidensbaseret og uden overdrivelser. */
const DAILY_MESSAGES = [
  'Træning er en af de bedst dokumenterede behandlinger ved knæ- og hofteartrose.',
  'Effekten af træning kommer gradvist. Giv det mindst 6 uger med 2–3 træninger om ugen.',
  'Lidt ondt under træning er normalt ved artrose og betyder ikke, at leddet tager skade.',
  'Stærke muskler omkring knæ og hofte hjælper med at aflaste og stabilisere leddet.',
  'Kvalitet frem for mængde: knæet over 2. tå og bækkenet lige.',
  'Hviledage er også en del af træningen. Det vigtigste er, at du bliver ved over tid.',
  'En gåtur tæller også. Bevægelse i hverdagen er godt for knæ og hofter.',
  'Leddet har det bedst, når det bliver brugt. Bevægelse er med til at give brusken næring.',
  'Artrose svinger. En dårlig dag betyder ikke, at det går den forkerte vej.',
  'På en dårlig dag: skru ned i stedet for at stoppe helt. Lidt er bedre end ingenting.',
  'Ved overvægt kan et vægttab på over 5 % mindske smerterne i knæet og gøre hverdagen lettere.',
  'Hver gang du træner, øver du dig også i at styre leddet bedre.',
  'Det er normalt at være lidt øm i musklerne dagen efter træning.',
  'Sæt et fast tidspunkt for træningen. Vaner gør det lettere at holde fast.',
  'Brug smerteskalaen: 0–5 er i orden, hvis det er faldet til ro næste dag.',
  'Godt fodtøj med blød sål gør gåturen mere behagelig for leddene.'
];

/* Mærker / milepæle */
const BADGES = [
  { id: 'foerste', icon: '👟', name: 'Første træning', how: 'Kryds din første øvelse af.' },
  { id: 'raad1', icon: '📖', name: 'Første råd læst', how: 'Markér et godt råd som læst og forstået.' },
  { id: 'stime3', icon: '🔥', name: '3 dage i træk', how: 'Træn 3 dage i træk.' },
  { id: 'ugemaal', icon: '🎯', name: 'Ugemål nået', how: 'Nå dit ugemål for antal træningsdage.' },
  { id: 'stime7', icon: '🏆', name: '7 dage i træk', how: 'Træn 7 dage i træk (lette dage tæller også).' },
  { id: 'niveau2', icon: '📈', name: 'Niveau 2 nået', how: 'Ryk op på Niveau 2 i et program.' },
  { id: 'traening10', icon: '💪', name: '10 træninger', how: 'Træn på 10 forskellige dage.' },
  { id: 'raadalle', icon: '🎓', name: 'Alle råd læst', how: 'Læs og forstå alle de gode råd.' },
  { id: 'niveau3', icon: '⛰️', name: 'Niveau 3 nået', how: 'Ryk op på Niveau 3 i et program.' },
  { id: 'traening25', icon: '⭐', name: '25 træninger', how: 'Træn på 25 forskellige dage.' }
];
