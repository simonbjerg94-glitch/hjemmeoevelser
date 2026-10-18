/* v34: 28 nye kropsvægtsøvelser til PT (område, dosering, lettere/sværere og kilde i "evidence"),
   to nye PT-programmer (Helkrop – avanceret, Core og mobilitet) og udvidet øvelsesbibliotek.
   Indlæses efter data-v33.js og før ryg.js. Ingen klientdata her. */
'use strict';
const V34_PT = [
  // ---------- Underkrop ----------
  {
    id: 'pt-udfald-gaaende', category: 'styrke', level: 2, area: 'underkrop', name: 'Gående udfald',
    images: [{"src": "images/pt-udfald-gaaende/1.webp", "caption": "1. Stå rank med samlede fødder.", "w": 480, "h": 528}, {"src": "images/pt-udfald-gaaende/2.webp", "caption": "2. Tag et langt skridt frem, og sænk dig lodret ned, til begge knæ er bøjet ca. 90°.", "w": 480, "h": 528}, {"src": "images/pt-udfald-gaaende/3.webp", "caption": "3. Pres op gennem forreste hæl, og saml benene – eller gå videre med næste skridt.", "w": 480, "h": 528}], /* auto: tools/sync_images.py */
    dose: '3 sæt × 8–12 pr. ben. 2 sek. ned, 1–2 sek. op.',
    steps: ['Stå rank med samlede fødder.', 'Tag et langt skridt frem, og sænk dig lodret ned, til begge knæ er bøjet ca. 90°.', 'Pres op gennem forreste hæl, og saml benene – eller gå videre med næste skridt.', 'Skift ben hver gang.'],
    tips: ['Forreste knæ peger frem over tæerne.', 'Overkroppen er rank.', 'Bagerste knæ går næsten ned til gulvet.'],
    progression: 'Lettere: udfald bagud på stedet, og hold i en stol. Sværere: gå langsommere (3 sek. ned) eller med en rygsæk.',
    evidence: 'Unilateral flerledsøvelse for lår og balder (ACSM 2009: progressiv modstandstræning). Udfaldsøvelser indgår i skadesforebyggende programmer som FIFA 11+ (Soligard 2008).' },
  {
    id: 'pt-sideudfald', category: 'styrke', level: 2, area: 'underkrop', name: 'Sideudfald',
    images: [{"src": "images/pt-sideudfald/1.webp", "caption": "1. Stå bredt med tæerne fremad.", "w": 480, "h": 660}, {"src": "images/pt-sideudfald/2.webp", "caption": "2. Sæt dig ned og bagud i det ene ben, mens det andet ben er strakt.", "w": 480, "h": 660}, {"src": "images/pt-sideudfald/3.webp", "caption": "3. Pres tilbage til midten.", "w": 480, "h": 660}], /* auto: tools/sync_images.py */
    dose: '3 sæt × 8–12 pr. side.',
    steps: ['Stå bredt med tæerne fremad.', 'Sæt dig ned og bagud i det ene ben, mens det andet ben er strakt.', 'Pres tilbage til midten.', 'Skift side.'],
    tips: ['Hælen bliver i gulvet.', 'Knæet peger samme vej som tæerne.', 'Du mærker det på indersiden af det strakte ben.'],
    progression: 'Lettere: kun en lille bøjning, og hold i en stol. Sværere: dybere, eller pause 2 sek. i bunden.',
    evidence: 'Ekspertanbefaling: styrke i sideplanet for lår, balder og indersiden af låret. Stærke adduktorer forebygger lyskeproblemer (Harøy 2019 – med Copenhagen-øvelsen).' },
  {
    id: 'pt-bro-march', category: 'styrke', level: 2, area: 'underkrop', name: 'Bro med marchering',
    images: [{"src": "images/pt-bro-march/1.webp", "caption": "1. Lig på ryggen med bøjede knæ og fødderne i gulvet.", "w": 720, "h": 396}, {"src": "images/pt-bro-march/2.webp", "caption": "2. Løft hoften op i en bro.", "w": 720, "h": 396}, {"src": "images/pt-bro-march/3.webp", "caption": "3. Løft skiftevis det ene knæ op mod brystet uden at hoften falder eller drejer.", "w": 720, "h": 396}], /* auto: tools/sync_images.py */
    dose: '2–3 sæt × 6–10 pr. ben.',
    steps: ['Lig på ryggen med bøjede knæ og fødderne i gulvet.', 'Løft hoften op i en bro.', 'Løft skiftevis det ene knæ op mod brystet uden at hoften falder eller drejer.', 'Sænk hoften til sidst.'],
    tips: ['Hoften skal være helt rolig.', 'Spænd ballen på standbenet.'],
    progression: 'Lettere: almindelig bro på to ben. Sværere: hold knæet oppe 3 sek., eller bro på ét ben.',
    evidence: 'Bro-varianter aktiverer gluteus maximus og medius (Reiman 2012, oversigt over EMG-studier); bro på ét ben giver høj aktivitet i balderne (Lehecka 2017).' },
  {
    id: 'pt-hoftestod', category: 'styrke', level: 2, area: 'underkrop', name: 'Hoftestød med skuldrene på sofaen',
    images: [{"src": "images/pt-hoftestod/1.webp", "caption": "1. Læn den øverste del af ryggen mod kanten af en sofa, fødderne i gulvet.", "w": 720, "h": 652}, {"src": "images/pt-hoftestod/2.webp", "caption": "2. Pres hoften op, til kroppen er vandret fra skuldre til knæ.", "w": 720, "h": 652}, {"src": "images/pt-hoftestod/3.webp", "caption": "3. Klem ballerne i 2 sek., og sænk roligt.", "w": 720, "h": 652}], /* auto: tools/sync_images.py */
    dose: '3 sæt × 10–15. 2 sek. op, hold 2 sek.',
    steps: ['Læn den øverste del af ryggen mod kanten af en sofa, fødderne i gulvet.', 'Pres hoften op, til kroppen er vandret fra skuldre til knæ.', 'Klem ballerne i 2 sek., og sænk roligt.'],
    tips: ['Hagen let ned mod brystet.', 'Underbenene er lodrette i toppen.', 'Pres gennem hælene.'],
    progression: 'Lettere: bro på gulvet. Sværere: på ét ben, eller en rygsæk på hoften.',
    evidence: 'Hoftestød med vægtstang gav højere aktivitet i gluteus maximus end squat (Contreras 2015) og er blandt øvelserne med meget høj ballemuskel-aktivitet (Neto 2020). Uden vægt er det en lettere variant; progression efter ACSM 2009.' },
  {
    id: 'pt-baglaarsbro-stol', category: 'styrke', level: 2, area: 'underkrop', name: 'Bro med hælene på en stol (baglår)',
    images: [{"src": "images/pt-baglaarsbro-stol/1.webp", "caption": "1. Lig på ryggen med hælene på sædet af en stol og let bøjede knæ.", "w": 720, "h": 327}, {"src": "images/pt-baglaarsbro-stol/2.webp", "caption": "2. Pres hælene ned i stolen, og løft hoften.", "w": 720, "h": 327}, {"src": "images/pt-baglaarsbro-stol/3.webp", "caption": "3. Hold 2 sek., og sænk roligt.", "w": 720, "h": 327}], /* auto: tools/sync_images.py */
    dose: '3 sæt × 8–12. Hold 2 sek. i toppen.',
    steps: ['Lig på ryggen med hælene på sædet af en stol og let bøjede knæ.', 'Pres hælene ned i stolen, og løft hoften.', 'Hold 2 sek., og sænk roligt.'],
    tips: ['Du mærker det bag på lårene.', 'Får du krampe i baglåret, så bøj knæene mere.'],
    progression: 'Lettere: bøj knæene mere. Sværere: strakte ben, eller på ét ben.',
    evidence: 'Ekspertanbefaling: bro med hælene på en stol belaster baglårene mere end almindelig bro. Baglårsstyrke er vigtig – programmer med Nordic-øvelsen halverer baglårsskader (van Dyk 2019).' },
  {
    id: 'pt-firfod-benspark', category: 'styrke', level: 1, area: 'underkrop', name: 'Benspark bagud på alle fire',
    images: [{"src": "images/pt-firfod-benspark/1.webp", "caption": "1. Stå på alle fire med hænderne under skuldrene og knæene under hofterne.", "w": 720, "h": 376}, {"src": "images/pt-firfod-benspark/2.webp", "caption": "2. Løft det ene ben bagud med bøjet knæ, så foden peger mod loftet.", "w": 720, "h": 376}, {"src": "images/pt-firfod-benspark/3.webp", "caption": "3. Sænk igen. Skift ben efter sættet.", "w": 720, "h": 376}], /* auto: tools/sync_images.py */
    dose: '2–3 sæt × 10–15 pr. ben.',
    steps: ['Stå på alle fire med hænderne under skuldrene og knæene under hofterne.', 'Løft det ene ben bagud med bøjet knæ, så foden peger mod loftet.', 'Sænk igen. Skift ben efter sættet.'],
    tips: ['Ryggen er lige og rolig – svaj ikke.', 'Løft kun så højt, hoften kan blive stille.'],
    progression: 'Lettere: mindre løft. Sværere: hold 3 sek. i toppen, eller stræk benet helt (fuglehund).',
    evidence: 'Hofteekstension på alle fire er blandt de øvelser, der aktiverer balderne (Reiman 2012, oversigt over EMG-studier).' },
  // ---------- Overkrop – skub ----------
  {
    id: 'pt-armstraek-negativ', category: 'styrke', level: 2, area: 'skub', name: 'Langsomme armstrækninger (kun ned)',
    images: [{"src": "images/pt-armstraek-negativ/1.webp", "caption": "1. Stå på tæerne med hænderne under skuldrene og kroppen lige.", "w": 720, "h": 335}, {"src": "images/pt-armstraek-negativ/2.webp", "caption": "2. Sænk dig så langsomt du kan, 4–5 sek., helt ned.", "w": 720, "h": 335}, {"src": "images/pt-armstraek-negativ/3.webp", "caption": "3. Kom op igen på den måde, du kan – fx via knæene.", "w": 720, "h": 335}], /* auto: tools/sync_images.py */
    dose: '3 sæt × 4–8. 4–5 sek. ned.',
    steps: ['Stå på tæerne med hænderne under skuldrene og kroppen lige.', 'Sænk dig så langsomt du kan, 4–5 sek., helt ned.', 'Kom op igen på den måde, du kan – fx via knæene.'],
    tips: ['Kroppen er lige hele vejen.', 'Albuerne peger skråt bagud.'],
    progression: 'Lettere: på knæene, eller hænderne på en stol. Sværere: langsommere (6–8 sek.), og pres selv op.',
    evidence: 'Excentrisk træning med høj belastning øgede styrken mere end koncentrisk træning (Roig 2009, BJSM, meta-analyse). Langsomme sænkninger er en vej mod fulde armstrækninger uden udstyr.' },
  {
    id: 'pt-pike', category: 'styrke', level: 3, area: 'skub', name: 'Pike-armstrækninger (hoften højt)',
    images: [{"src": "images/pt-pike/1.webp", "caption": "1. Stå i en omvendt V med hænderne i gulvet og hoften højt.", "w": 720, "h": 435}, {"src": "images/pt-pike/2.webp", "caption": "2. Bøj albuerne, og sænk toppen af hovedet mod gulvet foran hænderne.", "w": 720, "h": 435}, {"src": "images/pt-pike/3.webp", "caption": "3. Pres op igen.", "w": 720, "h": 435}], /* auto: tools/sync_images.py */
    dose: '3 sæt × 5–12.',
    steps: ['Stå i en omvendt V med hænderne i gulvet og hoften højt.', 'Bøj albuerne, og sænk toppen af hovedet mod gulvet foran hænderne.', 'Pres op igen.'],
    tips: ['Benene så strakte som muligt.', 'Hovedet går frem foran hænderne – ikke ned mellem dem.', 'Stop ved smerter i skulderen.'],
    progression: 'Lettere: knæene bøjet, kort bevægelse. Sværere: fødderne på en stol.',
    evidence: 'Ekspertanbefaling: lodret skub (som skulderpres) med kropsvægt. Generel progression efter ACSM 2009.' },
  {
    id: 'pt-armstraek-fodder-hoej', category: 'styrke', level: 3, area: 'skub', name: 'Armstrækninger med fødderne på en stol',
    images: [{"src": "images/pt-armstraek-fodder-hoej/1.webp", "caption": "1. Sæt fødderne på sædet af en stol og hænderne i gulvet under skuldrene.", "w": 720, "h": 327}, {"src": "images/pt-armstraek-fodder-hoej/2.webp", "caption": "2. Kroppen er lige fra hæle til hoved.", "w": 720, "h": 327}, {"src": "images/pt-armstraek-fodder-hoej/3.webp", "caption": "3. Sænk brystet mod gulvet, og pres op igen.", "w": 720, "h": 327}], /* auto: tools/sync_images.py */
    dose: '3 sæt × 6–15.',
    steps: ['Sæt fødderne på sædet af en stol og hænderne i gulvet under skuldrene.', 'Kroppen er lige fra hæle til hoved.', 'Sænk brystet mod gulvet, og pres op igen.'],
    tips: ['Ingen svaj i lænden – spænd maven.', 'Stolen skal stå fast mod en væg.'],
    progression: 'Lettere: almindelige armstrækninger. Sværere: langsommere, eller pause 2 sek. i bunden.',
    evidence: 'Højere fødder øger belastningen af armstrækninger (Ebben 2011). Progression efter ACSM 2009.' },
  {
    id: 'pt-planke-op-ned', category: 'styrke', level: 2, area: 'skub', name: 'Planke op og ned',
    images: [{"src": "images/pt-planke-op-ned/1.webp", "caption": "1. Start i planke på underarmene.", "w": 720, "h": 335}, {"src": "images/pt-planke-op-ned/2.webp", "caption": "2. Sæt den ene hånd og så den anden i gulvet, så du kommer op på hænderne.", "w": 720, "h": 335}, {"src": "images/pt-planke-op-ned/3.webp", "caption": "3. Gå ned på underarmene igen én arm ad gangen.", "w": 720, "h": 335}], /* auto: tools/sync_images.py */
    dose: '2–3 sæt × 6–10.',
    steps: ['Start i planke på underarmene.', 'Sæt den ene hånd og så den anden i gulvet, så du kommer op på hænderne.', 'Gå ned på underarmene igen én arm ad gangen.'],
    tips: ['Hoften må ikke vippe fra side til side.', 'Skift, hvilken arm der starter.'],
    progression: 'Lettere: på knæene. Sværere: fødderne tættere sammen, eller hurtigere.',
    evidence: 'Ekspertanbefaling: kombinerer en stabil krop (core-træning, McGill 2010) med skubbestyrke.' },
  // ---------- Ryg og træk ----------
  {
    id: 'pt-bordroning', category: 'styrke', level: 2, area: 'ryg', name: 'Roning under et bord',
    images: [{"src": "images/pt-bordroning/1.webp", "caption": "1. Lig på ryggen under et solidt bord, og tag fat i bordkanten.", "w": 720, "h": 327}, {"src": "images/pt-bordroning/2.webp", "caption": "2. Hælene i gulvet og kroppen lige.", "w": 720, "h": 327}, {"src": "images/pt-bordroning/3.webp", "caption": "3. Træk brystet op mod bordkanten, og sænk roligt, til armene er strakte.", "w": 720, "h": 327}], /* auto: tools/sync_images.py */
    dose: '3 sæt × 6–15.',
    steps: ['Lig på ryggen under et solidt bord, og tag fat i bordkanten.', 'Hælene i gulvet og kroppen lige.', 'Træk brystet op mod bordkanten, og sænk roligt, til armene er strakte.'],
    tips: ['Tjek at bordet ikke kan vippe – det skal være tungt og stabilt.', 'Klem skulderbladene sammen i toppen.'],
    progression: 'Lettere: bøj knæene. Sværere: strakte ben, langsommere ned, eller fødderne på en stol.',
    evidence: 'Omvendt roning gav den højeste aktivitet i den brede rygmuskel og øvre ryg og den laveste belastning af lænden blandt tre roøvelser (Fenwick 2009). Træk-øvelser balancerer skub (ACSM 2009).' },
  {
    id: 'pt-haandklaede-roning', category: 'styrke', level: 1, area: 'ryg', name: 'Roning med håndklæde om dørhåndtaget',
    images: [{"src": "images/pt-haandklaede-roning/1.webp", "caption": "1. Læg et håndklæde om håndtaget på en lukket dør, der åbner væk fra dig, og hold i begge ender.", "w": 480, "h": 660}, {"src": "images/pt-haandklaede-roning/2.webp", "caption": "2. Gå tæt på døren, og læn dig tilbage med strakte arme.", "w": 480, "h": 660}, {"src": "images/pt-haandklaede-roning/3.webp", "caption": "3. Træk dig ind mod døren, og læn dig roligt tilbage.", "w": 480, "h": 660}], /* auto: tools/sync_images.py */
    dose: '3 sæt × 10–15.',
    steps: ['Læg et håndklæde om håndtaget på en lukket dør, der åbner væk fra dig, og hold i begge ender.', 'Gå tæt på døren, og læn dig tilbage med strakte arme.', 'Træk dig ind mod døren, og læn dig roligt tilbage.'],
    tips: ['Døren skal være lukket og åbne væk fra dig.', 'Jo mere du læner dig tilbage, jo tungere.'],
    progression: 'Lettere: stå mere oprejst. Sværere: fødderne tættere på døren (mere hældning), eller roning under et bord.',
    evidence: 'Ekspertanbefaling: vandret træk med kropsvægt, en variant af omvendt roning (jf. Fenwick 2009).' },
  {
    id: 'pt-w-loeft', category: 'styrke', level: 1, area: 'ryg', name: 'W-løft liggende på maven',
    images: [{"src": "images/pt-w-loeft/1.webp", "caption": "1. Lig på maven med panden på et håndklæde.", "w": 720, "h": 262}, {"src": "images/pt-w-loeft/2.webp", "caption": "2. Bøj albuerne, så armene danner et W.", "w": 720, "h": 262}, {"src": "images/pt-w-loeft/3.webp", "caption": "3. Træk skulderbladene ned og sammen, og løft armene lidt fra gulvet. Hold 3 sek., og sænk.", "w": 720, "h": 262}], /* auto: tools/sync_images.py */
    dose: '2–3 sæt × 8–12. Hold 3 sek.',
    steps: ['Lig på maven med panden på et håndklæde.', 'Bøj albuerne, så armene danner et W.', 'Træk skulderbladene ned og sammen, og løft armene lidt fra gulvet. Hold 3 sek., og sænk.'],
    tips: ['Skuldrene væk fra ørerne.', 'Små løft er nok.'],
    progression: 'Lettere: kun den ene arm. Sværere: hold 5 sek., eller skift mellem Y, T og W.',
    evidence: 'Ekspertanbefaling. Beslægtede liggende armløft aktiverer midterste og nedre trapezius med lav øvre trapezius (Cools 2007; Ekstrom 2003).' },
  {
    id: 'pt-svoemmer', category: 'styrke', level: 2, area: 'ryg', name: 'Svømmer liggende på maven',
    images: [{"src": "images/pt-svoemmer/1.webp", "caption": "1. Lig på maven med armene strakt frem, og løft dem lidt fra gulvet.", "w": 720, "h": 262}, {"src": "images/pt-svoemmer/2.webp", "caption": "2. Før armene i en stor bue ud til siden og ned mod hofterne.", "w": 720, "h": 262}, {"src": "images/pt-svoemmer/3.webp", "caption": "3. Før dem tilbage frem igen.", "w": 720, "h": 262}], /* auto: tools/sync_images.py */
    dose: '2–3 sæt × 6–12.',
    steps: ['Lig på maven med armene strakt frem, og løft dem lidt fra gulvet.', 'Før armene i en stor bue ud til siden og ned mod hofterne.', 'Før dem tilbage frem igen.'],
    tips: ['Brystet er let løftet, blikket ned.', 'Gå langsomt.'],
    progression: 'Lettere: armene bliver i gulvet. Sværere: langsommere, eller løft også benene lidt.',
    evidence: 'Ekspertanbefaling. Liggende armløft over hovedet aktiverer nedre trapezius (Ekstrom 2003).' },
  // ---------- Core ----------
  {
    id: 'pt-hul-krop', category: 'styrke', level: 2, area: 'core', name: 'Hul krop (hold)',
    images: [{"src": "images/pt-hul-krop/1.webp", "caption": "1. Lig på ryggen, og pres lænden ned i gulvet.", "w": 720, "h": 327}, {"src": "images/pt-hul-krop/2.webp", "caption": "2. Løft hoved og skuldre lidt, og stræk benene skråt op med armene frem mod fødderne.", "w": 720, "h": 327}, {"src": "images/pt-hul-krop/3.webp", "caption": "3. Hold, og træk vejret roligt.", "w": 720, "h": 327}], /* auto: tools/sync_images.py */
    dose: '3 × 15–40 sekunder.',
    steps: ['Lig på ryggen, og pres lænden ned i gulvet.', 'Løft hoved og skuldre lidt, og stræk benene skråt op med armene frem mod fødderne.', 'Hold, og træk vejret roligt.'],
    tips: ['Lænden skal blive i gulvet – løft benene højere, hvis den slipper.'],
    progression: 'Lettere: bøjede knæ. Sværere: benene lavere, eller armene over hovedet.',
    evidence: 'Ekspertanbefaling: øvelse for den forreste del af kroppen, hvor lænden holdes stille (core-træning, McGill 2010).' },
  {
    id: 'pt-omvendt-crunch', category: 'styrke', level: 1, area: 'core', name: 'Omvendt crunch',
    images: [{"src": "images/pt-omvendt-crunch/1.webp", "caption": "1. Lig på ryggen med knæene bøjet i vejret og armene langs siden.", "w": 720, "h": 396}, {"src": "images/pt-omvendt-crunch/2.webp", "caption": "2. Rul knæene op mod brystet, så hoften løfter sig lidt fra gulvet.", "w": 720, "h": 396}, {"src": "images/pt-omvendt-crunch/3.webp", "caption": "3. Sænk langsomt tilbage uden at fødderne rører gulvet.", "w": 720, "h": 396}], /* auto: tools/sync_images.py */
    dose: '3 sæt × 8–15.',
    steps: ['Lig på ryggen med knæene bøjet i vejret og armene langs siden.', 'Rul knæene op mod brystet, så hoften løfter sig lidt fra gulvet.', 'Sænk langsomt tilbage uden at fødderne rører gulvet.'],
    tips: ['Brug maven – ikke fart.', 'Sænk langsommere end du løfter.'],
    progression: 'Lettere: kun lille bevægelse. Sværere: benene mere strakte.',
    evidence: 'Omvendt crunch (på skråbænk) gav blandt de højeste aktiviteter i både øvre og nedre del af den lige mavemuskel (Escamilla 2006, Physical Therapy).' },
  {
    id: 'pt-skulderklap', category: 'styrke', level: 2, area: 'core', name: 'Planke med skulderklap',
    images: [{"src": "images/pt-skulderklap/1.webp", "caption": "1. Stå i planke på hænderne med fødderne lidt fra hinanden.", "w": 720, "h": 335}, {"src": "images/pt-skulderklap/2.webp", "caption": "2. Løft den ene hånd, og klap den modsatte skulder.", "w": 720, "h": 335}, {"src": "images/pt-skulderklap/3.webp", "caption": "3. Sæt hånden ned, og skift.", "w": 720, "h": 335}], /* auto: tools/sync_images.py */
    dose: '3 sæt × 10–24 klap i alt.',
    steps: ['Stå i planke på hænderne med fødderne lidt fra hinanden.', 'Løft den ene hånd, og klap den modsatte skulder.', 'Sæt hånden ned, og skift.'],
    tips: ['Hoften må ikke vippe.', 'Bredere fødder gør det lettere.'],
    progression: 'Lettere: på knæene. Sværere: fødderne samlet, eller langsommere.',
    evidence: 'Ekspertanbefaling: planke, hvor kroppen skal modstå at dreje (core-træning, McGill 2010).' },
  {
    id: 'pt-sideplanke', category: 'styrke', level: 2, area: 'core', name: 'Sideplanke på fødderne',
    images: [{"src": "images/pt-sideplanke/1.webp", "caption": "1. Lig på siden på underarmen med albuen lige under skulderen og benene strakte.", "w": 720, "h": 360}, {"src": "images/pt-sideplanke/2.webp", "caption": "2. Løft hoften, så du er lige fra fødder til skulder.", "w": 720, "h": 360}, {"src": "images/pt-sideplanke/3.webp", "caption": "3. Hold, og træk vejret roligt. Sænk, og skift side.", "w": 720, "h": 360}], /* auto: tools/sync_images.py */
    dose: '2–3 × 15–40 sek. pr. side.',
    steps: ['Lig på siden på underarmen med albuen lige under skulderen og benene strakte.', 'Løft hoften, så du er lige fra fødder til skulder.', 'Hold, og træk vejret roligt. Sænk, og skift side.'],
    tips: ['Hoften skal frem – ikke bagud.', 'Den øverste hånd på hoften.'],
    progression: 'Lettere: sideplanke på knæ. Sværere: løft det øverste ben, eller længere tid.',
    evidence: 'Sidestøtte gav højere aktivitet i quadratus lumborum end andre øvelser (McGill 1996) og var den bedste øvelse for mavevæggen med lav aktivitet i psoas (Juker 1998). Sideplanken er også med i FIFA 11+.' },
  {
    id: 'pt-planke-benloeft', category: 'styrke', level: 2, area: 'core', name: 'Planke med benløft',
    images: [{"src": "images/pt-planke-benloeft/1.webp", "caption": "1. Stå i planke på underarmene med kroppen lige.", "w": 720, "h": 335}, {"src": "images/pt-planke-benloeft/2.webp", "caption": "2. Løft det ene strakte ben lidt, hold 2 sek., og sæt det ned.", "w": 720, "h": 335}, {"src": "images/pt-planke-benloeft/3.webp", "caption": "3. Skift ben.", "w": 720, "h": 335}], /* auto: tools/sync_images.py */
    dose: '3 sæt × 6–10 pr. ben.',
    steps: ['Stå i planke på underarmene med kroppen lige.', 'Løft det ene strakte ben lidt, hold 2 sek., og sæt det ned.', 'Skift ben.'],
    tips: ['Hoften må ikke dreje eller falde.', 'Løft kun lidt.'],
    progression: 'Lettere: almindelig planke. Sværere: hold benet oppe 5 sek.',
    evidence: 'Planke-varianter med mindre støtte (fx på ét ben) øger musklernes aktivitet og kan bruges som progression (Calatayud 2017). Planke med benløft er med i FIFA 11+.' },
  // ---------- Kondition og hop ----------
  {
    id: 'pt-burpee', category: 'styrke', level: 3, area: 'kondition', name: 'Burpee (uden armstrækning)',
    images: [{"src": "images/pt-burpee/1.webp", "caption": "1. Sæt dig ned i squat, og sæt hænderne i gulvet.", "w": 480, "h": 480}, {"src": "images/pt-burpee/2.webp", "caption": "2. Hop eller træd fødderne bagud til planke.", "w": 480, "h": 480}, {"src": "images/pt-burpee/3.webp", "caption": "3. Hop eller træd frem igen.", "w": 480, "h": 480}], /* auto: tools/sync_images.py */
    dose: 'Intervaller: 20–40 sek. arbejde, 20–40 sek. pause – eller 3 sæt × 6–12.',
    steps: ['Sæt dig ned i squat, og sæt hænderne i gulvet.', 'Hop eller træd fødderne bagud til planke.', 'Hop eller træd frem igen.', 'Rejs dig, og hop op med armene over hovedet. Land blødt.'],
    tips: ['Kroppen lige i planken – ingen svaj.', 'Land blødt med bøjede knæ.'],
    progression: 'Lettere: træd i stedet for at hoppe, og spring hoppet over. Sværere: tilføj en armstrækning, eller hurtigere tempo.',
    evidence: 'Et kort kropsvægtsprogram med bl.a. burpees øgede konditionen hos inaktive voksne (Archila 2021, lille RCT). Intervaltræning forbedrer konditionen (Gist 2014). Tæller med i WHO 2020-anbefalingerne.' },
  {
    id: 'pt-skoejtehop', category: 'styrke', level: 2, area: 'kondition', name: 'Skøjtehop',
    images: [{"src": "images/pt-skoejtehop/1.webp", "caption": "1. Stå på ét ben med let bøjet knæ.", "w": 480, "h": 660}, {"src": "images/pt-skoejtehop/2.webp", "caption": "2. Hop til siden, og land blødt på det andet ben, mens det første ben krydser bagud.", "w": 480, "h": 660}, {"src": "images/pt-skoejtehop/3.webp", "caption": "3. Hop tilbage til den anden side.", "w": 480, "h": 660}], /* auto: tools/sync_images.py */
    dose: 'Intervaller: 20–40 sek. arbejde, 20–40 sek. pause, 4–6 gange.',
    steps: ['Stå på ét ben med let bøjet knæ.', 'Hop til siden, og land blødt på det andet ben, mens det første ben krydser bagud.', 'Hop tilbage til den anden side.'],
    tips: ['Land stille med knæet over tæerne.', 'Stå et øjeblik på hvert ben.'],
    progression: 'Lettere: træd til siden i stedet for at hoppe. Sværere: længere hop, eller hold landingen 2 sek.',
    evidence: 'Sidelæns hop og landingskontrol indgår i knæ- og ankelskadeforebyggelse (FIFA 11+: Soligard 2008; Hübscher 2010).' },
  {
    id: 'pt-haelspark', category: 'styrke', level: 1, area: 'kondition', name: 'Hælspark på stedet',
    images: [{"src": "images/pt-haelspark/1.webp", "caption": "1. Løb let på stedet.", "w": 480, "h": 660}, {"src": "images/pt-haelspark/2.webp", "caption": "2. Spark skiftevis hælene op mod numsen.", "w": 480, "h": 660}, {"src": "images/pt-haelspark/3.webp", "caption": "3. Sving armene med, og land på forfoden.", "w": 480, "h": 660}], /* auto: tools/sync_images.py */
    dose: 'Intervaller: 20–40 sek. arbejde, 20–40 sek. pause, 4–8 gange.',
    steps: ['Løb let på stedet.', 'Spark skiftevis hælene op mod numsen.', 'Sving armene med, og land på forfoden.'],
    tips: ['Start roligt, og sæt farten op, når du er varm.', 'Du skal kunne sige et par ord.'],
    progression: 'Lettere: gå på stedet, og løft hælene skiftevis. Sværere: hurtigere tempo, eller længere arbejdstid.',
    evidence: 'Ekspertanbefaling: let konditionstræning på stedet, der tæller med i WHO 2020-anbefalingerne.' },
  {
    id: 'pt-udfaldshop', category: 'styrke', level: 3, area: 'kondition', name: 'Udfaldshop',
    images: [{"src": "images/pt-udfaldshop/1.webp", "caption": "1. Start i et udfald.", "w": 480, "h": 528}, {"src": "images/pt-udfaldshop/2.webp", "caption": "2. Hop op, og skift ben i luften.", "w": 480, "h": 528}, {"src": "images/pt-udfaldshop/3.webp", "caption": "3. Land blødt i et udfald med det andet ben foran.", "w": 480, "h": 528}], /* auto: tools/sync_images.py */
    dose: '3 sæt × 6–10 i alt. Fuld pause mellem sættene.',
    steps: ['Start i et udfald.', 'Hop op, og skift ben i luften.', 'Land blødt i et udfald med det andet ben foran.'],
    tips: ['Forreste knæ peger frem over tæerne.', 'Land stille, og stå et øjeblik, før næste hop.'],
    progression: 'Lettere: træd benene skiftevis bagud uden hop. Sværere: hop højere, eller flere i træk.',
    evidence: 'Neuromuskulær træning med hop og landing mindskede knæskader (Hewett 1999, AJSM) og korsbåndsskader (Sugimoto 2015, meta-analyse). Udfaldshop indgik i kropsvægtsprogrammet i Archila 2021.' },
  // ---------- Mobilitet ----------
  {
    id: 'pt-hund', category: 'styrke', level: 1, area: 'mobilitet', name: 'Nedadgående hund',
    images: [{"src": "images/pt-hund/1.webp", "caption": "1. Start i planke på hænderne.", "w": 720, "h": 435}, {"src": "images/pt-hund/2.webp", "caption": "2. Skub hoften op og bagud til en omvendt V, og pres hælene mod gulvet.", "w": 720, "h": 435}, {"src": "images/pt-hund/3.webp", "caption": "3. Hold, og træk vejret roligt. Kom tilbage til planke.", "w": 720, "h": 435}], /* auto: tools/sync_images.py */
    dose: '2–3 × 20–45 sek.',
    steps: ['Start i planke på hænderne.', 'Skub hoften op og bagud til en omvendt V, og pres hælene mod gulvet.', 'Hold, og træk vejret roligt. Kom tilbage til planke.'],
    tips: ['Bøj gerne knæene lidt, så ryggen kan være lang.', 'Skuldrene væk fra ørerne.'],
    progression: 'Lettere: bøjede knæ og hænderne på en stol. Sværere: pres skiftevis hælene ned ("gå" på stedet).',
    evidence: 'Ekspertanbefaling for selve øvelsen. Udspænding øger bevægeligheden på sigt (Konrad 2024, meta-analyse).' },
  {
    id: 'pt-verdens-bedste', category: 'styrke', level: 2, area: 'mobilitet', name: 'Verdens bedste stræk',
    images: [{"src": "images/pt-verdens-bedste/1.webp", "caption": "1. Tag et langt udfald frem, og sæt begge hænder i gulvet på indersiden af forreste fod.", "w": 480, "h": 528}, {"src": "images/pt-verdens-bedste/2.webp", "caption": "2. Drej overkroppen, og løft den ene arm op mod loftet med blikket efter hånden.", "w": 480, "h": 528}, {"src": "images/pt-verdens-bedste/3.webp", "caption": "3. Hold 2 sek., og sæt hånden ned igen. Skift side efter sættet.", "w": 480, "h": 528}], /* auto: tools/sync_images.py */
    dose: '2–3 × 4–8 pr. side.',
    steps: ['Tag et langt udfald frem, og sæt begge hænder i gulvet på indersiden af forreste fod.', 'Drej overkroppen, og løft den ene arm op mod loftet med blikket efter hånden.', 'Hold 2 sek., og sæt hånden ned igen. Skift side efter sættet.'],
    tips: ['Bagerste knæ kan sættes i gulvet.', 'Pust ud, når du drejer.'],
    progression: 'Lettere: bagerste knæ i gulvet. Sværere: længere hold, og stræk forreste ben bagefter.',
    evidence: 'Ekspertanbefaling for selve øvelsen. Dynamisk udspænding lige før træning gav små forbedringer, mens lang statisk udspænding (≥60 sek.) kan give et lille præstationstab (Behm 2016).' },
  {
    id: 'pt-baglaar-straek-stol', category: 'styrke', level: 1, area: 'mobilitet', name: 'Baglårsstræk med hælen på en stol',
    images: [{"src": "images/pt-baglaar-straek-stol/1.webp", "caption": "1. Stil hælen op på en lav stol med strakt knæ.", "w": 480, "h": 556}, {"src": "images/pt-baglaar-straek-stol/2.webp", "caption": "2. Hold ryggen ret, og bøj frem i hoften.", "w": 480, "h": 556}, {"src": "images/pt-baglaar-straek-stol/3.webp", "caption": "3. Stop, når du mærker et stræk bag på låret. Hold, og skift ben.", "w": 480, "h": 556}], /* auto: tools/sync_images.py */
    dose: '2 × 30–45 sek. pr. ben.',
    steps: ['Stil hælen op på en lav stol med strakt knæ.', 'Hold ryggen ret, og bøj frem i hoften.', 'Stop, når du mærker et stræk bag på låret. Hold, og skift ben.'],
    tips: ['Ret ryg – bøj i hoften, ikke i ryggen.', 'Tæerne peger op.'],
    progression: 'Lettere: lavere stol eller trappetrin. Sværere: bøj lidt længere frem.',
    evidence: '30 sek. udspænding øgede baglårenes bevægelighed – 60 sek. gav ikke mere (Bandy 1997). Udspænding øger bevægeligheden på sigt (Konrad 2024).' },
  {
    id: 'pt-dyb-squat', category: 'styrke', level: 2, area: 'mobilitet', name: 'Dyb squat (hold)',
    images: [{"src": "images/pt-dyb-squat/1.webp", "caption": "1. Stå med fødderne lidt bredere end hofterne.", "w": 480, "h": 660}, {"src": "images/pt-dyb-squat/2.webp", "caption": "2. Sæt dig helt ned i en dyb squat med hælene i gulvet.", "w": 480, "h": 660}, {"src": "images/pt-dyb-squat/3.webp", "caption": "3. Hold hænderne samlet foran brystet, mens albuerne skubber knæene let ud. Hold, og rejs dig roligt.", "w": 480, "h": 660}], /* auto: tools/sync_images.py */
    dose: '2–3 × 20–60 sek.',
    steps: ['Stå med fødderne lidt bredere end hofterne.', 'Sæt dig helt ned i en dyb squat med hælene i gulvet.', 'Hold hænderne samlet foran brystet, mens albuerne skubber knæene let ud. Hold, og rejs dig roligt.'],
    tips: ['Hold i en dørkarm, hvis balancen driller.', 'Løft hælene på en bog, hvis anklerne er stive.'],
    progression: 'Lettere: hold i en dørkarm, eller sæt dig på en lav skammel. Sværere: længere tid, og skift vægten fra side til side.',
    evidence: 'Ekspertanbefaling: bevægelighed i ankel, hofte og knæ. Udspænding øger bevægeligheden på sigt (Konrad 2024).' },
  {
    id: 'pt-bryst-doer', category: 'styrke', level: 1, area: 'mobilitet', name: 'Brystsræk i døråbningen',
    images: [{"src": "images/pt-bryst-doer/1.webp", "caption": "1. Stå i en døråbning, og læg underarmen mod dørkarmen med albuen i skulderhøjde.", "w": 480, "h": 660}, {"src": "images/pt-bryst-doer/2.webp", "caption": "2. Tag et lille skridt frem, til du mærker et stræk foran i brystet og skulderen.", "w": 480, "h": 660}, {"src": "images/pt-bryst-doer/3.webp", "caption": "3. Hold, og skift side.", "w": 480, "h": 660}], /* auto: tools/sync_images.py */
    dose: '2 × 30–45 sek. pr. side.',
    steps: ['Stå i en døråbning, og læg underarmen mod dørkarmen med albuen i skulderhøjde.', 'Tag et lille skridt frem, til du mærker et stræk foran i brystet og skulderen.', 'Hold, og skift side.'],
    tips: ['Stræk – ikke smerte.', 'Hold skulderen nede.'],
    progression: 'Lettere: albuen lavere. Sværere: albuen lidt højere, eller et lidt større skridt.',
    evidence: 'Strækket i døråbningen forlængede den lille brystmuskel mere end to andre stræk (Borstad & Ludewig 2006).' }
];
V34_PT.forEach(e => { e.stop = typeof PT_RULE !== 'undefined' ? PT_RULE : ''; });
if (typeof PT_EXERCISES !== 'undefined') V34_PT.forEach(e => { if (!PT_EXERCISES.some(x => x.id === e.id)) PT_EXERCISES.push(e); });

/* Øvelsesbiblioteket får de nye øvelser */
if (typeof PT_LIBRARY !== 'undefined') {
  const add = { underkrop: ['pt-udfald-gaaende', 'pt-sideudfald', 'pt-bro-march', 'pt-hoftestod', 'pt-baglaarsbro-stol', 'pt-firfod-benspark'],
    skub: ['pt-armstraek-negativ', 'pt-pike', 'pt-armstraek-fodder-hoej', 'pt-planke-op-ned'],
    ryg: ['pt-haandklaede-roning', 'pt-bordroning', 'pt-w-loeft', 'pt-svoemmer'],
    core: ['pt-hul-krop', 'pt-omvendt-crunch', 'pt-skulderklap', 'pt-sideplanke', 'pt-planke-benloeft'],
    kondition: ['pt-haelspark', 'pt-skoejtehop', 'pt-udfaldshop', 'pt-burpee'],
    mobilitet: ['pt-hund', 'pt-verdens-bedste', 'pt-baglaar-straek-stol', 'pt-dyb-squat', 'pt-bryst-doer'] };
  PT_LIBRARY.forEach(g => (add[g.id] || []).forEach(id => { if (!g.ids.includes(id)) g.ids.push(id); }));
}

/* Programmer */
if (typeof PT_PROGRAMS !== 'undefined') {
  const P = id => PT_PROGRAMS.find(p => p.id === id);
  const push = (pid, lvl, items) => { const p = P(pid); if (p && !p.v34) items.forEach(it => p.levels[lvl].items.push(it)); };
  // Øvet: træk-øvelser (ryggen) i alle trin
  push('mellem', 0, [{ id: 'pt-haandklaede-roning', sets: 3, reps: [10, 15] }]);
  push('mellem', 1, [{ id: 'pt-bordroning', sets: 3, reps: [6, 12] }]);
  push('mellem', 2, [{ id: 'pt-bordroning', sets: 4, reps: [10, 15] }]);
  // Kondition: flere intervaller i trin 2 og 3
  push('kondition', 1, [{ id: 'pt-skoejtehop', sets: 4, hold: [30, 40] }, { id: 'pt-haelspark', sets: 4, hold: [30, 40] }]);
  push('kondition', 2, [{ id: 'pt-burpee', sets: 3, reps: [8, 12] }, { id: 'pt-skoejtehop', sets: 5, hold: [40, 45] }]);
  ['mellem', 'kondition'].forEach(id => { const p = P(id); if (p) p.v34 = true; });
  const order = ['helkrop', 'mellem', 'avanceret', 'kondition', 'core', 'forebyg'];
  const addP = p => { if (!P(p.id)) PT_PROGRAMS.push(p); };
  addP({ id: 'avanceret', name: 'Helkrop – avanceret', short: 'Avanceret',
    about: 'Til dig, der klarer Helkrop – øvet. Tunge kropsvægtsvarianter: armstrækninger med fødderne oppe, pike, roning under bordet, Nordic og hop. 2–3 gange om ugen.',
    equipment: 'Måtte, en stabil stol, et solidt bord og en tung sofa', minutes: '40–50 min',
    levels: [
      { n: 1, name: 'Trin 1', sub: 'Tungere varianter', items: [
        { id: 'pt-udfald-gaaende', sets: 3, reps: [8, 12], side: true }, { id: 'pt-armstraek-fodder-hoej', sets: 3, reps: [6, 12] }, { id: 'pt-bordroning', sets: 3, reps: [6, 12] },
        { id: 'pt-hoftestod', sets: 3, reps: [10, 15] }, { id: 'pt-pike', sets: 3, reps: [5, 10] }, { id: 'pt-sideplanke', sets: 2, hold: [20, 40], side: true }, { id: 'pt-planke-op-ned', sets: 2, reps: [6, 10] } ] },
      { n: 2, name: 'Trin 2', sub: 'Langsomt og eksplosivt', items: [
        { id: 'pt-sideudfald', sets: 3, reps: [8, 12], side: true }, { id: 'pt-armstraek-negativ', sets: 3, reps: [4, 8] }, { id: 'pt-bordroning', sets: 4, reps: [8, 15] },
        { id: 'pt-baglaarsbro-stol', sets: 3, reps: [8, 12] }, { id: 'pt-pike', sets: 3, reps: [8, 12] }, { id: 'pt-skulderklap', sets: 3, reps: [10, 20] }, { id: 'pt-udfaldshop', sets: 3, reps: [6, 10] } ] },
      { n: 3, name: 'Trin 3', sub: 'Stærk hele vejen', items: [
        { id: 'pt-split-squat', sets: 4, reps: [10, 15], side: true }, { id: 'pt-armstraek-fodder-hoej', sets: 4, reps: [10, 20] }, { id: 'pt-bordroning', sets: 4, reps: [12, 20] },
        { id: 'pt-nordic', sets: 3, reps: [5, 8] }, { id: 'pt-pike', sets: 4, reps: [10, 15] }, { id: 'pt-burpee', sets: 3, reps: [8, 12] }, { id: 'pt-hul-krop', sets: 3, hold: [20, 40] } ] }
    ] });
  addP({ id: 'core', name: 'Core og mobilitet', short: 'Core',
    about: 'Mave, ryg og bevægelighed i ét program. Godt som et let træningspas, på hviledage eller som opvarmning. 2–4 gange om ugen.',
    equipment: 'Måtte, en lav stol og en døråbning', minutes: '20–30 min',
    levels: [
      { n: 1, name: 'Trin 1', sub: 'Grundlag', items: [
        { id: 'pt-hund', sets: 3, hold: [20, 30] }, { id: 'pt-bro-march', sets: 2, reps: [6, 10], side: true }, { id: 'laend-1-dead-bug', sets: 2, reps: [6, 10], side: true, name: 'Dead bug' },
        { id: 'pt-firfod-benspark', sets: 2, reps: [10, 15], side: true }, { id: 'pt-w-loeft', sets: 2, reps: [8, 12] }, { id: 'pt-baglaar-straek-stol', sets: 2, hold: [30, 45], side: true }, { id: 'pt-bryst-doer', sets: 2, hold: [30, 45], side: true } ] },
      { n: 2, name: 'Trin 2', sub: 'Mere kontrol', items: [
        { id: 'pt-verdens-bedste', sets: 2, reps: [4, 6], side: true }, { id: 'pt-omvendt-crunch', sets: 3, reps: [8, 12] }, { id: 'pt-planke-benloeft', sets: 3, reps: [6, 10], side: true },
        { id: 'pt-svoemmer', sets: 3, reps: [6, 10] }, { id: 'pt-dyb-squat', sets: 3, hold: [20, 40] }, { id: 'pt-hoftebojer', sets: 2, hold: [30, 45], side: true }, { id: 'pt-sideplanke', sets: 2, hold: [15, 30], side: true } ] },
      { n: 3, name: 'Trin 3', sub: 'Stærk midte', items: [
        { id: 'pt-verdens-bedste', sets: 3, reps: [5, 8], side: true }, { id: 'pt-hul-krop', sets: 3, hold: [20, 40] }, { id: 'pt-skulderklap', sets: 3, reps: [16, 24] },
        { id: 'pt-svoemmer', sets: 3, reps: [10, 12] }, { id: 'pt-copenhagen', sets: 2, hold: [15, 30], side: true }, { id: 'pt-dyb-squat', sets: 3, hold: [40, 60] }, { id: 'pt-hund', sets: 3, hold: [30, 45] } ] }
    ] });
  PT_PROGRAMS.sort((a, b) => (order.indexOf(a.id) + 1 || 99) - (order.indexOf(b.id) + 1 || 99));
}
