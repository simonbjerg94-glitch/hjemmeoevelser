/* v33: flere PT-øvelser (kropsvægt), nye evidensbaserede genoptræningsøvelser og to nye programmer
   (Senesmerter og Efter operation). Kilde pr. øvelse i feltet "evidence". Ingen klientdata her.
   Indlæses efter data.js, data-ryg.js, data-led.js og data-pt.js – og før ryg.js. */
'use strict';

/* ================= PT: nye øvelser (kropsvægt). area = område i øvelsesbiblioteket ================= */
const V33_PT = [
  {
    id: 'pt-squat', category: 'styrke', level: 1, area: 'underkrop', name: 'Squat',
    images: [{"src": "images/pt-squat/1.webp", "caption": "1. Stå med fødderne lidt bredere end hofterne og tæerne let udad.", "w": 480, "h": 660}, {"src": "images/pt-squat/2.webp", "caption": "2. Sæt dig ned og bagud, som mod en lav stol. Armene går frem som modvægt.", "w": 480, "h": 660}, {"src": "images/pt-squat/3.webp", "caption": "3. Gå så dybt, du kan med ret ryg og hælene i gulvet.", "w": 480, "h": 660}], /* auto: tools/sync_images.py */
    dose: '3 sæt × 10–20 gentagelser. 2–3 sek. ned, 1–2 sek. op.',
    steps: ['Stå med fødderne lidt bredere end hofterne og tæerne let udad.', 'Sæt dig ned og bagud, som mod en lav stol. Armene går frem som modvægt.', 'Gå så dybt, du kan med ret ryg og hælene i gulvet.', 'Pres op gennem hele foden, til du står helt oprejst.'],
    tips: ['Knæene peger samme vej som tæerne.', 'Brystet op, blikket frem.', 'Pust ud på vej op.'],
    progression: 'Lettere: squat ned til en stol (rejs dig fra stol). Sværere: 3 sek. pause i bunden, langsommere ned (4 sek.), eller squat-hop.',
    evidence: 'Flerledsøvelse. ACSM 2009: begyndere 8–12 gentagelser og 2–3 dage om ugen, med gradvis progression. Progressiv kropsvægtstræning (armstrækninger) gav lige så stor styrkefremgang som bænkpres (Kotarsky 2018).' },
  {
    id: 'pt-split-squat', category: 'styrke', level: 2, area: 'underkrop', name: 'Bulgarsk split squat (bagfod på stol)',
    images: [{"src": "images/pt-split-squat/1.webp", "caption": "1. Stil dig et stort skridt foran en stol, og læg vristen af den bagerste fod på sædet.", "w": 480, "h": 528}, {"src": "images/pt-split-squat/2.webp", "caption": "2. Sænk dig lodret ned, til det bagerste knæ næsten rører gulvet.", "w": 480, "h": 528}, {"src": "images/pt-split-squat/3.webp", "caption": "3. Pres op gennem forreste hæl. Skift ben efter sættet.", "w": 480, "h": 528}], /* auto: tools/sync_images.py */
    dose: '3 sæt × 6–12 pr. ben. 2–3 sek. ned.',
    steps: ['Stil dig et stort skridt foran en stol, og læg vristen af den bagerste fod på sædet.', 'Sænk dig lodret ned, til det bagerste knæ næsten rører gulvet.', 'Pres op gennem forreste hæl. Skift ben efter sættet.'],
    tips: ['Det forreste knæ peger frem over tæerne.', 'Hold let i en væg, hvis balancen driller.', 'Overkroppen må hælde lidt frem.'],
    progression: 'Lettere: udfald bagud uden stol. Sværere: langsom 3-1-1 (3 sek. ned, 1 sek. pause), eller en rygsæk med bøger.',
    evidence: 'Unilateral styrkeøvelse for forreste ben (ACSM 2009). Tung, langsom belastning (HSR) virkede godt og varigt ved patellasene-smerter (Kongsgaard 2009, med squat og benpres) – split squat uden vægt er en lettere variant af samme princip.' },
  {
    id: 'pt-vaegsid', category: 'styrke', level: 1, area: 'underkrop', name: 'Vægsiddende',
    images: [{"src": "images/pt-vaegsid/1.webp", "caption": "1. Stil dig med ryggen mod en væg og fødderne et godt stykke frem.", "w": 480, "h": 570}, {"src": "images/pt-vaegsid/2.webp", "caption": "2. Glid ned ad væggen, til knæene er bøjet ca. 90° – eller så langt, det er rart.", "w": 480, "h": 570}, {"src": "images/pt-vaegsid/3.webp", "caption": "3. Hold stille, og træk vejret roligt. Glid op igen.", "w": 480, "h": 570}], /* auto: tools/sync_images.py */
    dose: '3–5 × 30–45 sekunder. 1 minuts pause.',
    steps: ['Stil dig med ryggen mod en væg og fødderne et godt stykke frem.', 'Glid ned ad væggen, til knæene er bøjet ca. 90° – eller så langt, det er rart.', 'Hold stille, og træk vejret roligt. Glid op igen.'],
    tips: ['Knæene skal være over anklerne – ikke foran tæerne.', 'Hele ryggen mod væggen.'],
    progression: 'Lettere: højere position (mindre bøjning) eller kortere tid. Sværere: længere tid, eller løft den ene fod lidt.',
    evidence: 'Isometrisk quadriceps-træning. Rio 2015 (BJSM): 5 × 45 sek. isometrisk belastning gav straks smertelindring ved patellasene-smerter – et lille studie med 6 volleyspillere.' },
  {
    id: 'pt-etben-doedloeft', category: 'styrke', level: 2, area: 'underkrop', name: 'Dødløft på ét ben (uden vægt)',
    images: [{"src": "images/pt-etben-doedloeft/1.webp", "caption": "1. Stå på ét ben med let bøjet knæ.", "w": 480, "h": 528}, {"src": "images/pt-etben-doedloeft/2.webp", "caption": "2. Bøj frem i hoften med ret ryg, mens det andet ben går lige bagud.", "w": 480, "h": 528}, {"src": "images/pt-etben-doedloeft/3.webp", "caption": "3. Stop, når kroppen er næsten vandret – eller før, hvis ryggen bliver rund.", "w": 480, "h": 528}], /* auto: tools/sync_images.py */
    dose: '3 sæt × 8–12 pr. ben. 2–3 sek. ned.',
    steps: ['Stå på ét ben med let bøjet knæ.', 'Bøj frem i hoften med ret ryg, mens det andet ben går lige bagud.', 'Stop, når kroppen er næsten vandret – eller før, hvis ryggen bliver rund.', 'Rejs dig igen ved at spænde ballen på standbenet.'],
    tips: ['Hoften skal pege mod gulvet – drej den ikke op.', 'Hold let i en stol i starten.'],
    progression: 'Lettere: hoftehængsel på to ben, eller hold i en stol. Sværere: langsommere, eller en rygsæk i hånden.',
    evidence: 'Ekspertanbefaling: hoftehængsel på ét ben træner balde, baglår og balance. Baglårsstyrke er vigtig for at forebygge skader – programmer med Nordic-øvelsen halverer baglårsskader (van Dyk 2019).' },
  {
    id: 'pt-squat-hop', category: 'styrke', level: 3, area: 'kondition', name: 'Squat-hop med blød landing',
    images: [{"src": "images/pt-squat-hop/1.webp", "caption": "1. Lav en halv squat med armene bagud.", "w": 480, "h": 660}, {"src": "images/pt-squat-hop/2.webp", "caption": "2. Hop lige op, og sving armene frem.", "w": 480, "h": 660}, {"src": "images/pt-squat-hop/3.webp", "caption": "3. Land blødt på forfoden med bøjede knæ, der peger frem over tæerne.", "w": 480, "h": 660}], /* auto: tools/sync_images.py */
    dose: '3 sæt × 6–10 hop. Fuld pause mellem sættene.',
    steps: ['Lav en halv squat med armene bagud.', 'Hop lige op, og sving armene frem.', 'Land blødt på forfoden med bøjede knæ, der peger frem over tæerne.', 'Stå stille et øjeblik, før du hopper igen.'],
    tips: ['Landingen skal være stille – "som en kat".', 'Knæene må ikke falde ind mod hinanden.'],
    progression: 'Lettere: squat med hælløft i toppen (uden hop). Sværere: hop højere, eller hop frem og land stille.',
    evidence: 'Plyometri og landingsteknik indgår i skadesforebyggende programmer (FIFA 11+: Soligard 2008; PEP: Mandelbaum 2005).' },
  {
    id: 'pt-knaeloeft', category: 'styrke', level: 1, area: 'kondition', name: 'Høje knæløft på stedet',
    images: [{"src": "images/pt-knaeloeft/1.webp", "caption": "1. Stå rank.", "w": 480, "h": 660}, {"src": "images/pt-knaeloeft/2.webp", "caption": "2. Løft knæene skiftevis op mod hoftehøjde, og sving armene med.", "w": 480, "h": 660}, {"src": "images/pt-knaeloeft/3.webp", "caption": "3. Start i gå-tempo, og sæt farten op, når du er varm.", "w": 480, "h": 660}], /* auto: tools/sync_images.py */
    dose: 'Intervaller: 20–40 sek. arbejde, 20–40 sek. pause, 4–8 gange.',
    steps: ['Stå rank.', 'Løft knæene skiftevis op mod hoftehøjde, og sving armene med.', 'Start i gå-tempo, og sæt farten op, når du er varm.'],
    tips: ['Land på forfoden.', 'Pust roligt – du skal kunne sige et par ord.'],
    progression: 'Lettere: march på stedet. Sværere: løb på stedet med høje knæ, eller længere arbejdstid.',
    evidence: 'WHO 2020: 150–300 min moderat eller 75–150 min hård aktivitet pr. uge. Intervaltræning forbedrer konditionen (Gist 2014, meta-analyse). Et kort kropsvægtsprogram med bl.a. høje knæløft og burpees øgede konditionen hos inaktive voksne (Archila 2021, lille RCT).' },
  {
    id: 'pt-spraellemand', category: 'styrke', level: 2, area: 'kondition', name: 'Sprællemand',
    images: [{"src": "images/pt-spraellemand/1.webp", "caption": "1. Stå med samlede fødder og armene ned langs siden.", "w": 480, "h": 660}, {"src": "images/pt-spraellemand/2.webp", "caption": "2. Hop fødderne ud til siden, mens armene går op over hovedet.", "w": 480, "h": 660}], /* auto: tools/sync_images.py */
    dose: 'Intervaller: 20–40 sek. arbejde, 20–40 sek. pause, 4–8 gange.',
    steps: ['Stå med samlede fødder og armene ned langs siden.', 'Hop fødderne ud til siden, mens armene går op over hovedet.', 'Hop samlet igen.'],
    tips: ['Land blødt på forfoden.', 'Lettere variant: tag et skridt ud til siden i stedet for at hoppe.'],
    progression: 'Lettere: step-sprællemand uden hop. Sværere: hurtigere tempo eller længere arbejdstid.',
    evidence: 'Kondition med kropsvægt tæller med i WHO 2020-anbefalingerne. Intervaller forbedrer konditionen (Gist 2014; kropsvægtsintervaller: Archila 2021).' },
  {
    id: 'pt-bjergbestiger', category: 'styrke', level: 2, area: 'core', name: 'Bjergbestiger',
    images: [{"src": "images/pt-bjergbestiger/1.webp", "caption": "1. Start i planke på hænderne med skuldrene over hænderne.", "w": 720, "h": 335}, {"src": "images/pt-bjergbestiger/2.webp", "caption": "2. Træk skiftevis det ene knæ frem mod brystet og tilbage igen.", "w": 720, "h": 335}, {"src": "images/pt-bjergbestiger/3.webp", "caption": "3. Hoften er lav og rolig.", "w": 720, "h": 335}], /* auto: tools/sync_images.py */
    dose: '3 × 20–40 sekunder.',
    steps: ['Start i planke på hænderne med skuldrene over hænderne.', 'Træk skiftevis det ene knæ frem mod brystet og tilbage igen.', 'Hoften er lav og rolig.'],
    tips: ['Start langsomt med god kontrol.', 'Hænderne kan stå på en stol for at gøre det lettere.'],
    progression: 'Lettere: hænderne på en stol, og langsomt. Sværere: hurtigt tempo (kondition).',
    evidence: 'Ekspertanbefaling: planke med knæløft kombinerer core-stabilitet og puls. Core-træning med fokus på en stabil krop (McGill 2010); konditionstræning tæller med i WHO 2020.' },
  {
    id: 'pt-armstraek-hoej', category: 'styrke', level: 1, area: 'skub', name: 'Armstrækninger med hænderne på en stol',
    images: [{"src": "images/pt-armstraek-hoej/1.webp", "caption": "1. Sæt hænderne på kanten af en stabil stol eller et bord, der står mod væggen.", "w": 720, "h": 576}, {"src": "images/pt-armstraek-hoej/2.webp", "caption": "2. Gå tilbage med fødderne, til kroppen er lige fra hæle til hoved.", "w": 720, "h": 576}, {"src": "images/pt-armstraek-hoej/3.webp", "caption": "3. Sænk brystet mod kanten, og pres op igen.", "w": 720, "h": 576}], /* auto: tools/sync_images.py */
    dose: '3 sæt × 8–15. 2 sek. ned, 1 sek. op.',
    steps: ['Sæt hænderne på kanten af en stabil stol eller et bord, der står mod væggen.', 'Gå tilbage med fødderne, til kroppen er lige fra hæle til hoved.', 'Sænk brystet mod kanten, og pres op igen.'],
    tips: ['Stolen må ikke kunne skride – sæt den mod væggen.', 'Albuerne peger skråt bagud.'],
    progression: 'Lettere: mod væggen. Sværere: lavere støtte, armstrækninger på knæ og til sidst på tæerne.',
    evidence: 'Armstrækninger med hænderne oppe eller på knæene giver mindre belastning end på gulvet, mens fødderne oppe giver mest (Ebben 2011). Det giver en trinvis progression uden udstyr (ACSM 2009).' },
  {
    id: 'pt-dips', category: 'styrke', level: 2, area: 'skub', name: 'Dips på en stol',
    images: [{"src": "images/pt-dips/1.webp", "caption": "1. Sæt dig på kanten af en stabil stol, og tag fat i kanten ved siden af hofterne.", "w": 480, "h": 660}, {"src": "images/pt-dips/2.webp", "caption": "2. Flyt numsen frem fra stolen, fødderne i gulvet foran dig.", "w": 480, "h": 660}, {"src": "images/pt-dips/3.webp", "caption": "3. Bøj albuerne bagud, og sænk hoften, til overarmene er næsten vandrette.", "w": 480, "h": 660}], /* auto: tools/sync_images.py */
    dose: '3 sæt × 6–12. 2 sek. ned, 1 sek. op.',
    steps: ['Sæt dig på kanten af en stabil stol, og tag fat i kanten ved siden af hofterne.', 'Flyt numsen frem fra stolen, fødderne i gulvet foran dig.', 'Bøj albuerne bagud, og sænk hoften, til overarmene er næsten vandrette.', 'Pres op igen.'],
    tips: ['Hold skuldrene nede – væk fra ørerne.', 'Gør det ondt foran i skulderen, så gå ikke så dybt.'],
    progression: 'Lettere: fødderne tæt på stolen, kun lille bevægelse. Sværere: strakte ben, eller langsommere ned.',
    evidence: 'Ekspertanbefaling: triceps-styrke uden udstyr. Undgå øvelsen ved smerter foran i skulderen.' },
  {
    id: 'pt-rygloeft', category: 'styrke', level: 1, area: 'ryg', name: 'Rygløft liggende (superman)',
    images: [{"src": "images/pt-rygloeft/1.webp", "caption": "1. Lig på maven med armene strakt frem.", "w": 720, "h": 262}, {"src": "images/pt-rygloeft/2.webp", "caption": "2. Løft arme, bryst og ben et par centimeter fra gulvet.", "w": 720, "h": 262}, {"src": "images/pt-rygloeft/3.webp", "caption": "3. Hold 2 sek. med blikket ned mod gulvet, og sænk roligt.", "w": 720, "h": 262}], /* auto: tools/sync_images.py */
    dose: '3 sæt × 8–12. Hold 2 sek. i toppen.',
    steps: ['Lig på maven med armene strakt frem.', 'Løft arme, bryst og ben et par centimeter fra gulvet.', 'Hold 2 sek. med blikket ned mod gulvet, og sænk roligt.'],
    tips: ['Små løft er nok – det skal ikke gøre ondt i lænden.', 'Spænd ballerne.'],
    progression: 'Lettere: løft kun armene, eller kun benene. Sværere: hold 5 sek., eller "svøm" med armene.',
    evidence: 'Ekspertanbefaling: rygløft styrker rygstrækkerne. Træning af rygstrækkerne (i studierne i maskine) mindskede smerter og funktionsnedsættelse ved kroniske lændesmerter (Steele 2015, oversigt).' },
  {
    id: 'pt-ytl', category: 'styrke', level: 1, area: 'ryg', name: 'Y-løft liggende på maven',
    images: [{"src": "images/pt-ytl/1.webp", "caption": "1. Lig på maven med panden på et håndklæde og armene skråt frem i et Y, tommelfingrene op.", "w": 720, "h": 262}, {"src": "images/pt-ytl/2.webp", "caption": "2. Træk skulderbladene ned og sammen.", "w": 720, "h": 262}, {"src": "images/pt-ytl/3.webp", "caption": "3. Løft armene lidt fra gulvet, hold 3 sek., og sænk.", "w": 720, "h": 262}], /* auto: tools/sync_images.py */
    dose: '2–3 sæt × 8–10. Hold 3 sek.',
    steps: ['Lig på maven med panden på et håndklæde og armene skråt frem i et Y, tommelfingrene op.', 'Træk skulderbladene ned og sammen.', 'Løft armene lidt fra gulvet, hold 3 sek., og sænk.'],
    tips: ['Skuldrene væk fra ørerne.', 'Små løft – kvalitet før højde.'],
    progression: 'Lettere: armene ud til siden (T). Sværere: hold 5 sek., eller lav Y, T og W efter hinanden.',
    evidence: 'Liggende armløft giver høj aktivitet i nedre og midterste trapezius: overhead-løft (Y) mest i nedre trapezius (Ekstrom 2003), vandret løft med udadrotation (T) god balance mod øvre trapezius (Cools 2007). Træning er førstevalg ved skuldersmerter (Pieters 2020).' },
  {
    id: 'pt-hoftebojer', category: 'styrke', level: 1, area: 'mobilitet', name: 'Hoftebøjerstræk på knæ',
    images: [{"src": "images/pt-hoftebojer/1.webp", "caption": "1. Sæt det ene knæ i gulvet på en pude, den anden fod fremme.", "w": 720, "h": 576}, {"src": "images/pt-hoftebojer/2.webp", "caption": "2. Spænd ballen på det bagerste ben, og vip bækkenet lidt bagud.", "w": 720, "h": 576}, {"src": "images/pt-hoftebojer/3.webp", "caption": "3. Skub hoften lidt frem, til du mærker strækket foran på låret og i hoften.", "w": 720, "h": 576}], /* auto: tools/sync_images.py */
    dose: '2 × 30–45 sek. pr. side.',
    steps: ['Sæt det ene knæ i gulvet på en pude, den anden fod fremme.', 'Spænd ballen på det bagerste ben, og vip bækkenet lidt bagud.', 'Skub hoften lidt frem, til du mærker strækket foran på låret og i hoften.'],
    tips: ['Lænden må ikke svaje.', 'Hold i en stol, hvis balancen driller.'],
    progression: 'Lettere: kortere tid. Sværere: løft armen over hovedet på samme side.',
    evidence: 'Udspænding øger bevægeligheden på sigt (Konrad 2024, meta-analyse af 77 studier). ACSM anbefaler at holde hvert stræk 10–30 sek., i alt ca. 60 sek. pr. øvelse (Garber 2011).' },
  {
    id: 'pt-nordic', category: 'styrke', level: 3, area: 'underkrop', name: 'Nordic hamstring (baglår)',
    images: [{"src": "images/pt-nordic/1.webp", "caption": "1. Sæt dig på knæ på en pude, og få hælene holdt fast – fx under en tung sofa.", "w": 720, "h": 402}, {"src": "images/pt-nordic/2.webp", "caption": "2. Lige linje fra knæ til hoved, armene klar foran brystet.", "w": 720, "h": 402}, {"src": "images/pt-nordic/3.webp", "caption": "3. Fald langsomt frem, og brems med baglårene så længe, du kan.", "w": 720, "h": 402}], /* auto: tools/sync_images.py */
    dose: '2–3 sæt × 3–6. 2 gange om ugen. Start med 1 sæt × 3.',
    steps: ['Sæt dig på knæ på en pude, og få hælene holdt fast – fx under en tung sofa.', 'Lige linje fra knæ til hoved, armene klar foran brystet.', 'Fald langsomt frem, og brems med baglårene så længe, du kan.', 'Tag fra med hænderne, og skub dig op igen.'],
    tips: ['Det er bremsen ned, der virker – ikke at komme op.', 'Ømme baglår de første 2–3 dage er normalt. Start forsigtigt.'],
    progression: 'Lettere: fald kun et lille stykke frem, og tag tidligt fra med hænderne. Sværere: langsommere og længere ned.',
    evidence: 'van Dyk 2019 (BJSM, meta-analyse): programmer med Nordic hamstring halverer baglårsskader. Petersen 2011 (AJSM, RCT i dansk fodbold). van der Horst 2015.' },
  {
    id: 'pt-copenhagen', category: 'styrke', level: 3, area: 'core', name: 'Copenhagen adduktion (kort vægtstang)',
    images: [{"src": "images/pt-copenhagen/1.webp", "caption": "1. Lig på siden på underarmen med det øverste knæ på sædet af en stol.", "w": 720, "h": 360}, {"src": "images/pt-copenhagen/2.webp", "caption": "2. Løft hoften, så du er lige fra knæ til skulder.", "w": 720, "h": 360}, {"src": "images/pt-copenhagen/3.webp", "caption": "3. Løft samtidig det nederste ben op mod stolen. Hold 3–5 sek., og sænk roligt.", "w": 720, "h": 360}], /* auto: tools/sync_images.py */
    dose: '2–3 sæt × 3–8 pr. side (eller 10–20 sek. hold). 2 gange om ugen.',
    steps: ['Lig på siden på underarmen med det øverste knæ på sædet af en stol.', 'Løft hoften, så du er lige fra knæ til skulder.', 'Løft samtidig det nederste ben op mod stolen. Hold 3–5 sek., og sænk roligt.'],
    tips: ['Du skal mærke det på indersiden af det øverste lår.', 'Albuen lige under skulderen.'],
    progression: 'Lettere: kun hold (ingen gentagelser), eller kortere tid. Sværere: lang vægtstang – foden på stolen i stedet for knæet (kun når den korte er let).',
    evidence: 'Harøy 2019 (BJSM, RCT): Copenhagen-programmet gav 41 % færre lyskeproblemer i fodbold. Ishøi 2016: øger adduktorstyrken.' }
];

/* ================= Genoptræning: nye øvelser med evidens ================= */
const V33_REHAB = [
  {
    id: 'knae-2-vaegsid', category: 'knae', level: 2, name: 'Vægsiddende (spænd lårmusklerne)',
    images: [{"src": "images/knae-2-vaegsid/1.webp", "caption": "1. Stil dig med ryggen mod en væg og fødderne et godt stykke frem.", "w": 480, "h": 570}, {"src": "images/knae-2-vaegsid/2.webp", "caption": "2. Glid lidt ned ad væggen – kun så langt, det er rart for knæene.", "w": 480, "h": 570}, {"src": "images/knae-2-vaegsid/3.webp", "caption": "3. Hold stille, og træk vejret roligt. Glid op igen.", "w": 480, "h": 570}], /* auto: tools/sync_images.py */
    dose: '3–5 × 20–45 sekunder. 1 minuts pause.',
    steps: ['Stil dig med ryggen mod en væg og fødderne et godt stykke frem.', 'Glid lidt ned ad væggen – kun så langt, det er rart for knæene.', 'Hold stille, og træk vejret roligt. Glid op igen.'],
    tips: ['Knæene over anklerne – ikke foran tæerne.', 'Start højt oppe med kun lidt bøjning.'],
    progression: 'Lettere: kun lidt bøjning, kortere tid. Sværere: dybere eller længere tid.',
    stop: typeof PAIN_RULE !== 'undefined' ? PAIN_RULE : '',
    evidence: 'Anwer & Alghadir 2014: isometrisk quadriceps-træning mindsker smerte og øger styrke ved knæartrose. Rio 2015 (BJSM): isometrisk belastning giver smertelindring ved patellasene. Træning er førstevalg ved knæartrose (OARSI 2019, NICE 2022).' },
  {
    id: 'laend-h-armpres', category: 'laend', track: 'hold', level: 1, phases: [1], name: 'Armpres på maven (McKenzie)',
    images: [{"src": "images/laend-h-armpres/1.webp", "caption": "1. Lig på maven med hænderne under skuldrene.", "w": 720, "h": 311}, {"src": "images/laend-h-armpres/2.webp", "caption": "2. Pres overkroppen op med armene. Hoften og lænden bliver helt afslappede i gulvet.", "w": 720, "h": 311}, {"src": "images/laend-h-armpres/3.webp", "caption": "3. Hold 1–2 sek. i toppen, og sænk roligt.", "w": 720, "h": 311}], /* auto: tools/sync_images.py */
    dose: '10 gentagelser, 3–6 gange om dagen – kun hvis det letter.',
    steps: ['Lig på maven med hænderne under skuldrene.', 'Pres overkroppen op med armene. Hoften og lænden bliver helt afslappede i gulvet.', 'Hold 1–2 sek. i toppen, og sænk roligt.'],
    tips: ['Gå kun så højt, det føles rart.', 'Godt tegn: smerten i benet trækker sig op mod lænden ("centralisering").', 'Stop, hvis smerten breder sig længere ned i benet.'],
    progression: 'Lettere: lig på albuerne i 1–2 minutter. Sværere: pust ud og slap ekstra af i toppen.',
    stop: 'Stop øvelsen, hvis smerten flytter sig længere ned i benet, eller hvis du får snurren eller følelsesløshed. Se "Hvornår skal du til læge?".',
    evidence: 'JOSPT CPG lændesmerter 2021 (George m.fl.): retningsspecifikke øvelser til personer med retningspræference. Long 2004 (Spine, RCT): bedre effekt, når øvelsen matcher retningspræferencen.' },
  {
    id: 'ankel-3-alfredson', category: 'ankel', track: 'forebyg', level: 3, phases: [3], name: 'Excentrisk hælsænk på trappe (Alfredson)',
    images: [{"src": "images/ankel-3-alfredson/1.webp", "caption": "1. Stå med forfoden på kanten af et trin og en hånd på væggen.", "w": 480, "h": 660}, {"src": "images/ankel-3-alfredson/2.webp", "caption": "2. Gå op på tæerne på begge ben.", "w": 480, "h": 660}, {"src": "images/ankel-3-alfredson/3.webp", "caption": "3. Løft det raske ben, og sænk langsomt hælen under trinnet på det onde ben (3 sek.).", "w": 480, "h": 660}], /* auto: tools/sync_images.py */
    dose: '3 sæt × 15 med strakt knæ (+ evt. 3 × 15 med bøjet knæ). Hver dag i 12 uger.',
    steps: ['Stå med forfoden på kanten af et trin og en hånd på væggen.', 'Gå op på tæerne på begge ben.', 'Løft det raske ben, og sænk langsomt hælen under trinnet på det onde ben (3 sek.).', 'Sæt den raske fod ned igen, og gå op på begge ben.'],
    tips: ['Det må gerne gøre lidt ondt (op til 3–5), hvis det er faldet til ro næste morgen.', 'Når det bliver let: en rygsæk med lidt vægt.'],
    progression: 'Lettere: sænk på begge ben, eller kun ned til vandret. Sværere: rygsæk med vægt.',
    stop: typeof LED_PAIN_RULE !== 'undefined' ? LED_PAIN_RULE.ankel : '',
    evidence: 'Alfredson 1998 (AJSM): excentrisk træning ved akillessene-smerter (midtportion). JOSPT CPG Achilles 2018 (Martin m.fl.): grad A for belastningsøvelser (excentrisk eller tung, langsom). Beyer 2015: tung, langsom træning lige så god.' },
  {
    id: 'skulder-2-ytl', category: 'skulder', track: 'forebyg', level: 2, phases: [2, 3], name: 'Y-løft liggende på maven',
    images: [{"src": "images/skulder-2-ytl/1.webp", "caption": "1. Lig på maven med panden på et håndklæde og armene skråt frem i et Y, tommelfingrene op.", "w": 720, "h": 262}, {"src": "images/skulder-2-ytl/2.webp", "caption": "2. Træk skulderbladene ned og sammen.", "w": 720, "h": 262}, {"src": "images/skulder-2-ytl/3.webp", "caption": "3. Løft armene lidt fra gulvet, hold 3 sek., og sænk.", "w": 720, "h": 262}], /* auto: tools/sync_images.py */
    dose: '2–3 sæt × 8–10. Hold 3 sek.',
    steps: ['Lig på maven med panden på et håndklæde og armene skråt frem i et Y, tommelfingrene op.', 'Træk skulderbladene ned og sammen.', 'Løft armene lidt fra gulvet, hold 3 sek., og sænk.'],
    tips: ['Små løft er nok.', 'Skuldrene væk fra ørerne.'],
    progression: 'Lettere: armene ud til siden (T), eller kun den ene arm. Sværere: hold 5 sek.',
    stop: typeof LED_PAIN_RULE !== 'undefined' ? LED_PAIN_RULE.skulder : '',
    evidence: 'Liggende armløft: overhead-løft (Y) giver højest aktivitet i nedre trapezius (Ekstrom 2003, JOSPT); vandret løft med udadrotation (T) har lav øvre/nedre trapezius-ratio (Cools 2007, AJSM). Træning er førstevalg ved skuldersmerter under skulderhøjden (Pieters 2020, JOSPT).' },
  // Senesmerter
  {
    id: 'sene-h-iso-hofte', category: 'sene', track: 'hold', level: 1, phases: [1], name: 'Pres benet ud mod væggen (isometrisk)',
    images: [{"src": "images/sene-h-iso-hofte/1.webp", "caption": "1. Stå med siden mod en væg og det onde ben inderst.", "w": 480, "h": 660}, {"src": "images/sene-h-iso-hofte/2.webp", "caption": "2. Bøj det inderste knæ lidt.", "w": 480, "h": 660}, {"src": "images/sene-h-iso-hofte/3.webp", "caption": "3. Pres ydersiden af knæet ud mod væggen med ca. halv kraft, og hold.", "w": 480, "h": 660}], /* auto: tools/sync_images.py */
    dose: '5 × 30–45 sek. med ca. halv kraft. 1 minuts pause. Gerne 1–2 gange om dagen.',
    steps: ['Stå med siden mod en væg og det onde ben inderst.', 'Bøj det inderste knæ lidt.', 'Pres ydersiden af knæet ud mod væggen med ca. halv kraft, og hold.', 'Slip roligt, og hvil.'],
    tips: ['Overkroppen skal være rank – læn dig ikke mod væggen.', 'Det må ikke gøre mere ondt end 3. Pres mindre, hvis det gør.'],
    progression: 'Lettere: mindre kraft eller kortere tid. Sværere: mere kraft, og videre til bro og sideløft.',
    stop: 'Smerten må gerne være op til 3 under øvelsen, og den skal være faldet til ro næste morgen. Undgå at sidde med benene over kors og at ligge på den onde side.',
    evidence: 'LEAP-forsøget (Mellor 2018, BMJ): uddannelse + progressiv øvelsesbelastning (begyndende med isometrisk abduktion) var bedre end blokade og "vent og se" ved glutealtendinopati.' },
  // Efter operation
  {
    id: 'op-h-haelglid', category: 'operation', track: 'hold', level: 1, phases: [1], name: 'Hælglid liggende (bøj knæet)',
    images: [{"src": "images/op-h-haelglid/1.webp", "caption": "1. Lig på ryggen med benene strakt.", "w": 720, "h": 311}, {"src": "images/op-h-haelglid/2.webp", "caption": "2. Lad hælen glide langsomt op mod numsen, så knæet bøjer – så langt, det er rart.", "w": 720, "h": 311}, {"src": "images/op-h-haelglid/3.webp", "caption": "3. Hold 2 sek., og lad hælen glide ud igen.", "w": 720, "h": 311}], /* auto: tools/sync_images.py */
    dose: '10–20 gentagelser, 3–4 gange om dagen.',
    steps: ['Lig på ryggen med benene strakt.', 'Lad hælen glide langsomt op mod numsen, så knæet bøjer – så langt, det er rart.', 'Hold 2 sek., og lad hælen glide ud igen.'],
    tips: ['Et håndklæde under hælen gør det lettere at glide.', 'Følg den bøjning, dit hospital har givet lov til.'],
    progression: 'Lettere: kun et lille stykke, og brug et håndklæde under hælen. Sværere: hold længere i bunden, eller bøj knæet siddende på en stol.',
    stop: 'Det må gerne stramme og gøre lidt ondt. Stop og kontakt hospitalet, hvis knæet bliver meget hævet, rødt eller varmt, eller hvis noget i "Hvornår skal du til læge?" passer på dig.',
    evidence: 'Tidlig mobilisering og træning efter knæprotese (APTA-retningslinje, Jette 2020, Physical Therapy) og kriteriebaseret genoptræning efter korsbåndsoperation med fokus på bevægelighed i første fase (KNGF 2016, van Melick m.fl., BJSM).' },
  {
    id: 'op-h-strakt-benloeft', category: 'operation', track: 'hold', level: 1, phases: [1, 2], name: 'Strakt benløft liggende',
    images: [{"src": "images/op-h-strakt-benloeft/1.webp", "caption": "1. Lig på ryggen med det raske ben bøjet.", "w": 720, "h": 376}, {"src": "images/op-h-strakt-benloeft/2.webp", "caption": "2. Spænd lårmusklen på det strakte ben, så knæet er helt strakt.", "w": 720, "h": 376}, {"src": "images/op-h-strakt-benloeft/3.webp", "caption": "3. Løft benet til samme højde som det bøjede knæ, hold 2 sek., og sænk langsomt.", "w": 720, "h": 376}], /* auto: tools/sync_images.py */
    dose: '2–3 sæt × 10. 1–2 gange om dagen.',
    steps: ['Lig på ryggen med det raske ben bøjet.', 'Spænd lårmusklen på det strakte ben, så knæet er helt strakt.', 'Løft benet til samme højde som det bøjede knæ, hold 2 sek., og sænk langsomt.'],
    tips: ['Knæet skal være helt strakt hele vejen – ellers: spænd lårmusklen først.', 'Lænden bliver i gulvet.'],
    progression: 'Lettere: spænd lårmusklen uden at løfte. Sværere: hold 5 sek. i toppen.',
    stop: 'Stop og kontakt hospitalet, hvis du ikke kan strække knæet helt, eller hvis noget i "Hvornår skal du til læge?" passer på dig.',
    evidence: 'Efter knæprotese er lårmuskelstyrken det, der hænger tættest sammen med funktion (Mizner 2005), og progressiv quadriceps-træning gav bedre funktion end almindelig genoptræning (Petterson 2009). Løft uden at knæet bøjer sig er et almindeligt tidligt mål efter korsbåndsoperation (ekspertanbefaling).' }
];
V33_REHAB.forEach(e => { if (!e.stop && typeof PT_RULE !== 'undefined') e.stop = PT_RULE; });
V33_PT.forEach(e => { e.stop = typeof PT_RULE !== 'undefined' ? PT_RULE : ''; });

/* ================= To nye genoptræningsprogrammer ================= */
const SENE_RULE = 'Senesmerter må gerne gøre lidt ondt under træningen: 0–3 er fint (op til 5 er i orden, hvis det er faldet til ro igen næste morgen). ' +
  'Er senen mere øm eller stiv næste morgen, så skru ned: færre gentagelser, mindre vægt eller et lettere niveau i et par dage. Sener skal belastes – hvile alene gør dem ikke stærkere. ' +
  'Stop og kontakt læge, hvis noget i "Hvornår skal du til læge?" passer på dig.';
const OP_RULE = 'Følg altid dit hospitals og din kirurgs plan – også hvis den er forskellig fra appen. Det må gerne stramme og gøre lidt ondt (0–3, op til 5, hvis det er faldet til ro næste morgen). ' +
  'Er knæet eller hoften mere hævet, varmt eller ømt næste dag, så skru ned. Stop og kontakt hospitalet, hvis noget i "Hvornår skal du til læge?" passer på dig.';
const V33_PROGRAMS = [
  {
    id: 'sene', area: 'saerlig', name: 'Senesmerter', long: 'Senesmerter – akillessene, knæskalssene og hofte', icon: 'ankel', word: 'Niveau', holdLabel: 'Ondt nu', fbLabel: 'Styrke', aboutTitle: 'Gode råd om sener',
    intro: 'Senesmerter i akillessenen, under knæskallen eller på ydersiden af hoften kommer oftest af, at senen er blevet belastet mere, end den var vant til. Den bedste behandling er gradvis styrketræning – i 12 uger eller mere.',
    tabs: { hold: ['🆘 Ondt nu', 'Når senen gør ondt: hold-øvelser og ro på belastningen'], forebyg: ['💪 Styrke', 'Gradvis tungere – og tilbage til løb og hop'] },
    hold: {
      title: 'Ondt i senen – de første uger',
      calm: 'Senesmerter er sjældent farlige. Senen er ikke "slidt op" – den er blevet overbelastet og har brug for den rigtige mængde belastning for at blive stærk igen.',
      course: 'Med træning bliver de fleste tydeligt bedre efter 6–12 uger, men det kan tage 3–6 måneder. Det går ofte op og ned undervejs – det er normalt.',
      advice: [
        'Skru ned for det, der provokerer mest (fx løb, hop, lange gåture op ad bakke), men stop ikke med at bevæge dig.',
        'Hold-øvelser (isometriske) kan lindre smerten. Lav dem 1–2 gange om dagen.',
        'Akillessene: undgå at gå barfodet og at strække læggen hårdt. Sko med lidt hæl kan aflaste.',
        'Hofte: sid ikke med benene over kors, lig ikke på den onde side, og stå ikke med vægten "hængende" på ét ben.',
        'Knæskalssene: undgå dybe hop og mange trapper, til det er bedre.'
      ],
      positions: ['Om natten (hofte): lig på den raske side med en pude mellem knæene.', 'Siddende (hofte): sid højt, så knæene er lavere end hofterne.'],
      exercises: ['hael-2-isometrisk-haeloeft', 'knae-2-vaegsid', 'sene-h-iso-hofte', 'hofte-1-broen']
    },
    phases: [
      { n: 1, name: 'Niveau 1: Belastning', weeks: 'Ca. uge 1–4', color: '#5b8def', goal: 'Vænne senen til mere belastning – roligt og på begge ben.',
        exercises: ['hael-2-haeloeft-begge', 'knae-2-vaegsid', 'hofte-1-broen', 'hofte-1-sideloeft-liggende', 'sene-h-iso-hofte'],
        criteria: ['Jeg kan lave 3 × 15 hæløft på begge ben uden smerte over 3.', 'Jeg kan holde vægsiddende i 45 sek. uden smerte over 3.', 'Senen er ikke mere øm næste morgen efter træning.'] },
      { n: 2, name: 'Niveau 2: Styrke', weeks: 'Ca. uge 4–8', color: '#3aa17e', goal: 'Tungere og langsommere – på ét ben.',
        exercises: ['ankel-2-haeloeft-et-ben', 'ankel-3-alfredson', 'pt-squat', 'knae-2-trin-op', 'hofte-2-sideloeft-staaende'],
        criteria: ['Jeg kan lave 3 × 15 hæløft på ét ben.', 'Jeg kan lave 3 × 10 langsomme squat uden smerte over 3.', 'Jeg kan gå 30 minutter uden at få mere ondt næste dag.'] },
      { n: 3, name: 'Niveau 3: Tung belastning og hop', weeks: 'Fra ca. uge 8 – og så videre', color: '#e0913a', goal: 'Gør senen klar til løb, hop og sport – og hold den stærk.',
        exercises: ['hael-3-tungt-haeloeft-et-ben', 'pt-split-squat', 'hofte-3-broen-et-ben', 'hael-4-smaa-hop', 'ankel-3-alfredson'],
        criteria: ['Jeg kan lave 20 små hop på ét ben uden smerte over 3.', 'Jeg kan løbe 10 minutter uden at få mere ondt næste morgen.', 'Jeg træner senen 2–3 gange om ugen.'] }
    ],
    everyday: [
      'Øg løb, hop og træning gradvist – højst ca. 10–20 % mere om ugen.',
      'Bliv ved med at træne 2–3 gange om ugen, også når det er gået over. Senen bliver stærkere i løbet af måneder.',
      'Kommer smerten igen? Gå et niveau ned i 1–2 uger, og byg op igen.'
    ],
    about: [
      ['Akillessenen', 'Smerter i senen bag på hælen, ofte værst om morgenen og i starten af en løbetur. Gradvis styrketræning af læggen (Alfredson eller tung, langsom træning) virker for de fleste (JOSPT 2018).'],
      ['Knæskalssenen (springerknæ)', 'Smerter lige under knæskallen ved hop, squat og trapper. Hold-øvelser kan lindre, og tung, langsom træning (fx langsomme squat) gør senen stærkere (Kongsgaard 2009).'],
      ['Ydersiden af hoften (glutealtendinopati)', 'Smerter på ydersiden af hoften, når du ligger på siden, går på trapper eller står på ét ben. Viden om, hvad der irriterer senen, og gradvis træning af hofte-musklerne virker bedre end blokade (LEAP, Mellor 2018).'],
      ['Må det gøre ondt?', 'Ja, lidt. Sener tåler godt lidt smerte under træningen (0–2 er sikkert, op til 5 er acceptabelt). Det vigtige er, at det er faldet til ro igen næste morgen (Silbernagel 2007).']
    ],
    redFlags: {
      now: ['Du hørte et smæld eller fik en følelse af et "spark" bag på hælen, og du kan ikke gå på tæer (mulig overrevet akillessene) – tag på skadestuen.', 'Du kan pludselig ikke strække knæet eller løfte det strakte ben efter et fald eller hop.'],
      today: ['Senen er rød, varm og hævet, og du har feber.', 'Smerterne kom, efter at du fik antibiotika af typen ciprofloxacin (fluorquinolon) – kontakt lægen.', 'Du kan ikke støtte på benet.'],
      weeks: ['Det er ikke blevet bedre efter 12 ugers træning.', 'Du har smerter i flere sener eller led på én gang, eller hævede led (kan være gigt).', 'Smerten er værst om natten og i hvile.']
    }
  },
  {
    id: 'operation', area: 'saerlig', name: 'Efter operation', long: 'Efter operation – knæprotese, hofteprotese, korsbånd og menisk', icon: 'knae', word: 'Fase', holdLabel: 'De første uger', fbLabel: 'Genoptræning', aboutTitle: 'Om de forskellige operationer',
    intro: 'Øvelser efter en ny knæ- eller hofteprotese, en korsbåndsoperation (ACL) eller en menisk-operation. Appen er et supplement til din genoptræning på hospitalet – ikke en erstatning.',
    note: 'Følg altid dit hospitals eller din kirurgs plan. Har du fået andre øvelser, restriktioner eller tidsrammer, gælder de – ikke appen. Spørg din fysioterapeut, før du går videre til næste fase.',
    tabs: { hold: ['🏥 De første uger', 'Lige efter operationen – blide øvelser flere gange om dagen'], forebyg: ['💪 Genoptræning', 'Styrke, balance og hverdag – i faser'] },
    hold: {
      title: 'De første uger efter operationen',
      calm: 'Det er normalt, at benet er hævet, stift og ømt de første uger. Små, hyppige øvelser hjælper hævelsen, bevægeligheden og blodcirkulationen.',
      course: 'Efter en ny knæ- eller hofteprotese går de fleste uden krykker efter 2–6 uger og er godt i gang efter 3 måneder. Efter en korsbåndsoperation tager genoptræningen typisk 9–12 måneder. Følg dit hospitals plan.',
      advice: [
        'Følg dit hospitals plan for, hvor meget du må støtte på benet, og hvor meget du må bøje.',
        'Lav de blide øvelser 3–4 gange om dagen, kort ad gangen.',
        'Gå små ture flere gange om dagen – med krykker, hvis hospitalet har sagt det.',
        'Læg benet højt og brug evt. kulde 15–20 minutter mod hævelse. Læg ikke en pude under knæet – knæet skal kunne strække helt ud.',
        'Tag smertestillende som aftalt med hospitalet, så du kan lave øvelserne.'
      ],
      positions: ['Liggende: benet strakt og lidt højt – ikke en pude under knæet.', 'Hofteprotese: følg de stillinger, hospitalet har vist dig (fx hvis du må ikke sidde meget lavt eller krydse benene).'],
      exercises: ['ankel-h-pump', 'knae-1-laarmuskel', 'op-h-haelglid', 'op-h-strakt-benloeft', 'knae-1-rejse-hoej']
    },
    phases: [
      { n: 1, name: 'Fase 1: Bevægelighed og kontrol', weeks: 'Ca. uge 2–6 (efter hospitalets plan)', color: '#5b8def', goal: 'Få knæet/hoften til at bevæge sig og vække lår- og hoftemusklerne.',
        exercises: ['knae-1-knaestraek-siddende', 'op-h-strakt-benloeft', 'hofte-1-broen', 'hofte-2-sideloeft-staaende', 'ankel-h-vaegtskift'],
        criteria: ['Jeg kan strække knæet helt og løfte det strakte ben uden at knæet bøjer.', 'Jeg kan gå indendørs uden krykker, eller hospitalet har sagt, at jeg må.', 'Hævelsen bliver mindre fra uge til uge.'] },
      { n: 2, name: 'Fase 2: Styrke og balance', weeks: 'Ca. uge 6–12', color: '#3aa17e', goal: 'Byg styrke og balance til trapper, at rejse sig og gå længere.',
        exercises: ['knae-2-minisquat', 'knae-2-trin-op', 'knae-2-rejse-uden-arme', 'balance-3-et-ben', 'hofte-1-broen'],
        criteria: ['Jeg kan rejse mig fra en stol 10 gange uden at bruge armene.', 'Jeg kan stå på det opererede ben i 20 sekunder.', 'Jeg kan gå op ad en trappe med skiftevis ben.'] },
      { n: 3, name: 'Fase 3: Hverdag og aktivitet', weeks: 'Fra ca. 3 måneder', color: '#e0913a', goal: 'Tilbage til hverdag, motion – og (efter korsbånd) gradvist sport efter test.',
        exercises: ['hofte-3-udfald-bagud', 'knae-3-trin-ned', 'hofte-3-broen-et-ben', 'knae-3-udfald-frem', 'pt-squat'],
        criteria: ['Jeg kan gå ned ad en trappe med skiftevis ben uden smerte over 3.', 'Jeg kan gå 30 minutter.', 'Jeg træner 2–3 gange om ugen.'] }
    ],
    everyday: [
      'Følg dit hospitals plan – den gælder altid først.',
      'Gang, cykling (motionscykel) og svømning er god motion, når hospitalet har sagt god for det.',
      'Korsbånd: løb, hop, vrid og kontaktsport først efter en test hos din fysioterapeut – typisk tidligst efter 9 måneder.',
      'Bliv ved med styrketræningen i mindst et år efter operationen.'
    ],
    about: [
      ['Ny knæ (knæprotese)', 'Målet de første uger er at kunne strække knæet helt og bøje det mindst 90°. Hævelse er normalt i flere måneder. Progressiv styrketræning af lårmusklen giver bedre funktion end almindelig genoptræning (Petterson 2009; APTA-retningslinje, Jette 2020).'],
      ['Ny hofte (hofteprotese)', 'De fleste må belaste med det samme. Nogle hospitaler giver bevægerestriktioner de første uger (fx ikke sidde meget lavt eller krydse benene) – følg dem, hvis du har fået dem. Styrke af hofte- og baldemuskler hjælper gangen.'],
      ['Korsbånd (ACL-rekonstruktion)', 'Genoptræningen går i faser og styres af kriterier – ikke kun tid. Tilbage til sport først efter tests af styrke og hop, typisk efter mindst 9 måneder; det mindsker risikoen for en ny skade (Grindem 2016, Delaware-Oslo).'],
      ['Menisk', 'Er menisken fjernet (delvist), må du ofte belaste med det samme. Er den syet, har du ofte begrænset bøjning og belastning i 4–6 uger. Følg kirurgens plan. Ved slidte menisker er træning lige så godt som operation for mange (Kise 2016, BMJ).']
    ],
    redFlags: {
      now: ['Pludselig åndenød, smerter i brystet eller du hoster blod (mulig blodprop i lungen) – ring 112.', 'Hofteprotese: pludselig voldsom smerte, og benet står forkert eller er blevet kortere (mulig luksation) – ring 112 eller tag på skadestuen.', 'Benet bliver koldt, blegt eller følelsesløst.'],
      today: ['Læggen bliver hævet, varm, rød og øm (mulig blodprop).', 'Feber over 38, eller såret bliver rødt, varmt, hævet, eller der kommer pus eller væske.', 'Knæet låser fast eller giver pludselig efter, eller smerten bliver meget værre.'],
      weeks: ['Du kan ikke strække knæet helt efter 2–3 uger, eller bøjningen bliver ikke bedre.', 'Hævelsen bliver ikke mindre over flere uger.', 'Du er i tvivl om, hvad du må – spørg dit hospital eller din fysioterapeut.']
    }
  }
];
const V33_PAIN = { sene: SENE_RULE, operation: OP_RULE };
if (typeof LED_PROGRAMS !== 'undefined') {
  V33_PROGRAMS.forEach(p => { p.ready = typeof LED_READY_TEXT !== 'undefined' ? LED_READY_TEXT : null; p.painRule = V33_PAIN[p.id]; LED_PROGRAMS.push(p); });
  if (typeof LED_AREAS !== 'undefined') LED_AREAS.push({ id: 'saerlig', name: 'Sener og efter operation', icon: '🩹', intro: 'Senesmerter (akillessene, knæskalssene, hofte) og genoptræning efter knæ- og hofteprotese, korsbånd og menisk.' });
  if (typeof RYG_PAIN_CHECK !== 'undefined') Object.assign(RYG_PAIN_CHECK, { sene: { beforeQuestion: 'Hvor ondt har du i senen lige nu?', afterQuestion: 'Hvor ondt har du i senen nu, efter øvelserne?' }, operation: { beforeQuestion: 'Hvor ondt har du lige nu?', afterQuestion: 'Hvor ondt har du nu, efter øvelserne?' } });
}
/* De nye genoptræningsøvelser lægges i de eksisterende lister, så de bruges som de andre */
V33_REHAB.forEach(e => {
  if (e.category === 'knae') DEFAULT_EXERCISES.push(e);
  else if (e.category === 'laend' && typeof RYG_EXERCISES !== 'undefined') RYG_EXERCISES.push(e);
  else if (typeof LED_EXERCISES !== 'undefined') LED_EXERCISES.push(e);
});
if (typeof PT_EXERCISES !== 'undefined') V33_PT.forEach(e => PT_EXERCISES.push(e));
/* Eksisterende programmer får de nye øvelser */
(() => {
  const find = id => (typeof RYG_PROGRAMS !== 'undefined' ? RYG_PROGRAMS : []).concat(typeof LED_PROGRAMS !== 'undefined' ? LED_PROGRAMS : []).find(p => p.id === id);
  const laend = find('laend'); if (laend && !laend.hold.exercises.includes('laend-h-armpres')) laend.hold.exercises.push('laend-h-armpres');
  const ankel = find('ankel'); if (ankel && !ankel.phases[2].exercises.includes('ankel-3-alfredson')) ankel.phases[2].exercises.push('ankel-3-alfredson');
  const sk = find('skulder'); if (sk && !sk.phases[1].exercises.includes('skulder-2-ytl')) sk.phases[1].exercises.push('skulder-2-ytl');
})();
if (typeof AREA_ICON_REGIONS !== 'undefined') Object.assign(AREA_ICON_REGIONS, { saerlig: ['hofte_v', 'knae_v', 'hael_h'], sene: ['knae_v', 'hael_h', 'hofte_h'], operation: ['knae_v', 'hofte_v'] });

/* ================= PT: programmer (v33) ================= */
if (typeof PT_EXERCISES !== 'undefined') { // områder til de tre øvelser fra v32
  const A = { 'pt-armstraek-knae': 'skub', 'pt-armstraek': 'skub', 'pt-planke': 'core' };
  PT_EXERCISES.forEach(e => { if (!e.area && A[e.id]) e.area = A[e.id]; });
}
if (typeof PT_PROGRAMS !== 'undefined') {
  const hk = PT_PROGRAMS.find(p => p.id === 'helkrop');
  if (hk && !hk.v33) {
    hk.v33 = true; hk.minutes = '30–40 min';
    hk.about = 'Styrketræning for hele kroppen med din egen kropsvægt – plus lidt puls og bevægelighed til sidst. Intet udstyr – kun en måtte og en stol. 2–3 gange om ugen med mindst én hviledag imellem.';
    hk.levels[0].items.push({ id: 'pt-knaeloeft', sets: 3, hold: [20, 40], name: 'Høje knæløft (puls)' }, { id: 'pt-hoftebojer', sets: 2, hold: [30, 45], side: true, name: 'Hoftebøjerstræk' });
    hk.levels[1].items[0] = { id: 'pt-squat', sets: 3, reps: [10, 15], name: 'Squat' };
    hk.levels[1].items.push({ id: 'pt-spraellemand', sets: 3, hold: [20, 40], name: 'Sprællemand (puls)' }, { id: 'pt-hoftebojer', sets: 2, hold: [30, 45], side: true, name: 'Hoftebøjerstræk' });
    hk.levels[2].items.push({ id: 'pt-bjergbestiger', sets: 3, hold: [20, 40], name: 'Bjergbestiger (puls)' }, { id: 'pt-hoftebojer', sets: 2, hold: [30, 45], side: true, name: 'Hoftebøjerstræk' });
  }
  const add = p => { if (!PT_PROGRAMS.some(x => x.id === p.id)) PT_PROGRAMS.push(p); };
  add({ id: 'mellem', name: 'Helkrop – øvet', short: 'Øvet',
    about: 'Til dig, der kan lave armstrækninger og squat med god teknik. Ét-bens-øvelser og tungere varianter – stadig uden udstyr. 2–3 gange om ugen.',
    equipment: 'Måtte, en stabil stol og en tung sofa (til Nordic)', minutes: '35–45 min',
    levels: [
      { n: 1, name: 'Trin 1', sub: 'Ét ben ad gangen', items: [
        { id: 'pt-split-squat', sets: 3, reps: [6, 10], side: true }, { id: 'pt-armstraek', sets: 3, reps: [5, 12] }, { id: 'pt-etben-doedloeft', sets: 3, reps: [8, 12], side: true },
        { id: 'pt-dips', sets: 3, reps: [6, 12] }, { id: 'pt-rygloeft', sets: 3, reps: [8, 12] }, { id: 'pt-planke', sets: 3, hold: [30, 60] }, { id: 'pt-hoftebojer', sets: 2, hold: [30, 45], side: true } ] },
      { n: 2, name: 'Trin 2', sub: 'Tungere', items: [
        { id: 'pt-split-squat', sets: 3, reps: [10, 15], side: true }, { id: 'pt-armstraek', sets: 3, reps: [10, 20] }, { id: 'pt-nordic', sets: 2, reps: [3, 6] },
        { id: 'pt-dips', sets: 3, reps: [10, 15] }, { id: 'pt-ytl', sets: 3, reps: [8, 12] }, { id: 'pt-bjergbestiger', sets: 3, hold: [30, 45] }, { id: 'pt-copenhagen', sets: 2, hold: [10, 20], side: true } ] },
      { n: 3, name: 'Trin 3', sub: 'Stærk og eksplosiv', items: [
        { id: 'knae-3-rejse-et-ben', sets: 3, reps: [8, 12], side: true, name: 'Squat til stol på ét ben' }, { id: 'pt-armstraek', sets: 4, reps: [12, 25] }, { id: 'pt-nordic', sets: 3, reps: [4, 8] },
        { id: 'pt-squat-hop', sets: 3, reps: [6, 10] }, { id: 'pt-dips', sets: 4, reps: [12, 20] }, { id: 'pt-rygloeft', sets: 3, reps: [12, 15] }, { id: 'pt-copenhagen', sets: 3, hold: [15, 30], side: true } ] }
    ] });
  add({ id: 'kondition', name: 'Kondition – intervaller', short: 'Kondition',
    about: 'Korte intervaller med kropsvægt: arbejd i den angivne tid, og hold lige så lang pause. Du skal pumpe, men stadig kunne sige et par ord. 2–3 gange om ugen – gerne på dage uden styrketræning.',
    equipment: 'Intet – kun lidt gulvplads', minutes: '15–25 min',
    levels: [
      { n: 1, name: 'Trin 1', sub: 'Kom i gang', items: [
        { id: 'pt-knaeloeft', sets: 4, hold: [20, 30] }, { id: 'pt-squat', sets: 3, reps: [10, 15] }, { id: 'pt-spraellemand', sets: 4, hold: [20, 30] },
        { id: 'pt-armstraek-hoej', sets: 3, reps: [8, 12] }, { id: 'pt-bjergbestiger', sets: 3, hold: [15, 25] } ] },
      { n: 2, name: 'Trin 2', sub: 'Længere intervaller', items: [
        { id: 'pt-knaeloeft', sets: 5, hold: [30, 40] }, { id: 'pt-squat-hop', sets: 3, reps: [6, 10] }, { id: 'pt-spraellemand', sets: 5, hold: [30, 40] },
        { id: 'pt-armstraek-knae', sets: 3, reps: [8, 12] }, { id: 'pt-bjergbestiger', sets: 4, hold: [25, 35] } ] },
      { n: 3, name: 'Trin 3', sub: 'Høj puls', items: [
        { id: 'pt-knaeloeft', sets: 6, hold: [40, 45] }, { id: 'pt-squat-hop', sets: 4, reps: [8, 12] }, { id: 'pt-spraellemand', sets: 6, hold: [40, 45] },
        { id: 'pt-armstraek', sets: 3, reps: [8, 15] }, { id: 'pt-bjergbestiger', sets: 5, hold: [30, 45] } ] }
    ] });
  add({ id: 'forebyg', name: 'Skadesforebyggelse – løb og boldsport', short: 'Forebyg',
    about: 'Øvelser med dokumenteret effekt mod baglårs-, lyske-, knæ- og ankelskader (Nordic hamstring, Copenhagen, balance og landing – som i FIFA 11+). 2 gange om ugen hele sæsonen – fx som opvarmning.',
    equipment: 'Måtte, en stol og en tung sofa (til Nordic)', minutes: '15–20 min',
    levels: [
      { n: 1, name: 'Trin 1', sub: 'Grundlag', items: [
        { id: 'pt-nordic', sets: 2, reps: [3, 5] }, { id: 'pt-copenhagen', sets: 2, hold: [10, 20], side: true }, { id: 'balance-3-et-ben', sets: 2, hold: [20, 30], side: true, name: 'Stå på ét ben' },
        { id: 'pt-split-squat', sets: 2, reps: [6, 10], side: true }, { id: 'laend-2-sideplanke-knae', sets: 2, hold: [15, 30], side: true, name: 'Sideplanke på knæ' }, { id: 'ankel-2-haeloeft-et-ben', sets: 2, reps: [10, 15], side: true, name: 'Hæløft på ét ben' } ] },
      { n: 2, name: 'Trin 2', sub: 'Mere belastning', items: [
        { id: 'pt-nordic', sets: 2, reps: [4, 6] }, { id: 'pt-copenhagen', sets: 2, reps: [3, 6], side: true }, { id: 'pt-squat-hop', sets: 3, reps: [5, 8] },
        { id: 'ankel-2-et-ben-raek', sets: 2, reps: [6, 10], side: true, name: 'Ræk med foden på ét ben' }, { id: 'pt-split-squat', sets: 3, reps: [8, 12], side: true }, { id: 'ankel-2-haeloeft-et-ben', sets: 3, reps: [12, 20], side: true, name: 'Hæløft på ét ben' } ] },
      { n: 3, name: 'Trin 3', sub: 'Sæsonen', items: [
        { id: 'pt-nordic', sets: 3, reps: [6, 8] }, { id: 'pt-copenhagen', sets: 3, reps: [6, 10], side: true }, { id: 'pt-squat-hop', sets: 3, reps: [8, 10] },
        { id: 'ankel-3-sidehop', sets: 3, reps: [10, 20], name: 'Sidehop' }, { id: 'pt-etben-doedloeft', sets: 3, reps: [8, 12], side: true }, { id: 'ankel-2-et-ben-raek', sets: 3, reps: [8, 12], side: true, name: 'Ræk med foden på ét ben' } ] }
    ] });
}

/* Øvelsesbibliotek til PT: alle kropsvægtsøvelser sorteret efter område (eksisterende øvelser bruges også) */
const PT_LIBRARY = [
  { id: 'underkrop', name: 'Underkrop', icon: '🦵', ids: ['knae-2-rejse-uden-arme', 'pt-squat', 'pt-vaegsid', 'hofte-3-udfald-bagud', 'knae-3-udfald-frem', 'pt-split-squat', 'knae-3-rejse-et-ben', 'hofte-1-broen', 'hofte-3-broen-et-ben', 'pt-etben-doedloeft', 'pt-nordic', 'hael-2-haeloeft-begge', 'ankel-2-haeloeft-et-ben'] },
  { id: 'skub', name: 'Overkrop – skub', icon: '💪', ids: ['skulder-3-vaegpres', 'pt-armstraek-hoej', 'pt-armstraek-knae', 'pt-armstraek', 'pt-dips'] },
  { id: 'ryg', name: 'Ryg og træk (uden udstyr)', icon: '🧍', ids: ['pt-rygloeft', 'pt-ytl', 'nakke-3-y-loeft', 'laend-2-fuglehund'] },
  { id: 'core', name: 'Core', icon: '🎯', ids: ['pt-planke', 'laend-1-dead-bug', 'laend-2-sideplanke-knae', 'pt-bjergbestiger', 'pt-copenhagen'] },
  { id: 'kondition', name: 'Kondition og hop', icon: '❤️', ids: ['pt-knaeloeft', 'pt-spraellemand', 'pt-squat-hop', 'ankel-3-sidehop'] },
  { id: 'mobilitet', name: 'Mobilitet og balance', icon: '🧘', ids: ['pt-hoftebojer', 'hael-1-laeg-straek-strakt', 'bryst-h-aaben-bog', 'laend-h-kat-ko', 'balance-3-et-ben', 'ankel-2-et-ben-raek'] }
];
