/* Led-programmer (skulder; senere albue, hånd, ankel og fod) – Hjemmeøvelser-appen.
   Samme opbygning som Ryg og nakke (ryg.js viser dem): to spor ("Ondt nu" og "Forebyg" med 3 niveauer + "Klar til næste niveau?"),
   "Hvornår skal du til læge?", gode råd og smerteregel. Indlæses efter data-ryg.js. Alle navne er præfikset LED_.
   Kilder (kort), skulder: Sundhedsstyrelsen NKR for udvalgte skulderlidelser (2013) og NKR for skulderartrose (2022);
   JOSPT CPG frossen skulder (Kelley m.fl. 2013) og CPG subakromiale smerter/rotator cuff (Desmeules m.fl. 2025 / Diercks 2014);
   Holmgren m.fl. BMJ 2012 (specifik træning mindsker behov for operation); Littlewood m.fl. 2016 (selvstyret træning med belastning);
   Pieters m.fl. 2020 (systematisk review: træning er førstevalg ved skuldersmerter); NICE CKS Shoulder pain (2023).
   Albue: JOSPT CPG Lateral elbow pain (Lucado m.fl. 2022); Karanasios m.fl. BJSM 2021 (træning med belastning af håndledsstrækkerne virker bedst);
   Coombes m.fl. JAMA 2013 og Bisset m.fl. BMJ 2006 (blokade hjælper kort, men dårligere efter 6–12 mdr.; fysioterapi med øvelser bedre end vent og se);
   Peterson m.fl. 2014 (excentrisk/koncentrisk træning); Vicenzino/Coombes 2015 (isometrisk smertelindring, belastningsstyring); NICE CKS Tennis elbow (2024).
   Hånd: EULAR-anbefalinger for håndartrose (Kloppenburg m.fl. 2019); Østerås m.fl. Cochrane 2017 (træning ved håndartrose);
   Kjeken m.fl. 2021 og Wouters m.fl. 2019 (træning, skinne og hjælpemidler ved tommelfingerrodsartrose); NICE NG226 Osteoarthritis (2022);
   AAOS CPG Carpal tunnel syndrome (2016: natskinne; sene- og nerveglid kun svag evidens); Page m.fl. Cochrane 2012 (nerveglid). */
'use strict';

const LED_AREAS = [
  { id: 'skulder', name: 'Skulder', icon: '💪', intro: 'Slidgigt i skulderen, frossen skulder og "klemt sene" (smerter, når du løfter armen).' },
  { id: 'albue', name: 'Albue', icon: '🎾', intro: 'Tennisalbue (ondt på ydersiden) og golfalbue (ondt på indersiden) – ondt, når du griber, løfter eller vrider.' },
  { id: 'haand', name: 'Hånd og håndled', icon: '✋', intro: 'Slidgigt i tommelfinger og fingre, ondt i håndleddet og karpaltunnelsyndrom (sovende fingre).' }
];

const LED_PAIN_RULE = {
  skulder: 'Det må gerne gøre lidt ondt eller føles stramt, mens du træner: 0–2 er fint, og 3–5 er i orden, hvis det er faldet til ro igen næste morgen. ' +
    'Gør skulderen mere ondt næste dag, eller sover du dårligere, så skru ned: færre gentagelser, lavere løft eller lettere elastik. ' +
    'Stop og kontakt læge, hvis du får snurren, føleforstyrrelser eller kraftnedsættelse i armen, eller hvis noget i "Hvornår skal du til læge?" passer på dig.',
  albue: 'Det må gerne gøre lidt ondt i albuen, mens du træner: 0–2 er fint, og 3–5 er i orden, hvis det er faldet til ro igen næste morgen. ' +
    'Gør albuen mere ondt næste dag, eller får du svært ved at gribe om en kop, så skru ned: lettere vægt, færre gentagelser eller kortere tid. ' +
    'Stop og kontakt læge, hvis du får snurren eller føleforstyrrelser i fingrene, hvis hånden bliver svag, eller hvis noget i "Hvornår skal du til læge?" passer på dig.',
  haand: 'Det må gerne gøre lidt ondt eller føles stift, mens du træner: 0–2 er fint, og 3–5 er i orden, hvis det er faldet til ro igen næste morgen. ' +
    'Er fingrene mere hævede eller ømme næste dag, så skru ned: færre gentagelser, blødere bold eller lettere elastik. ' +
    'Nerveglid må give en let snurren, men den skal forsvinde igen inden for et par minutter. ' +
    'Stop og kontakt læge, hvis følelsesløsheden bliver ved, hvis hånden bliver svag, eller hvis noget i "Hvornår skal du til læge?" passer på dig.'
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
  },
  {
    id: 'albue', area: 'albue', name: 'Albue', long: 'Tennis- og golfalbue', icon: 'albue', word: 'Niveau', holdLabel: 'Ondt nu', fbLabel: 'Styrke', aboutTitle: 'Gode råd om albuen',
    intro: 'Tennisalbue og golfalbue er irriterede sener ved albuen – oftest fra hånd og underarm, der har arbejdet meget. Det går næsten altid over, og rolig styrketræning af underarmen er den bedste behandling.',
    tabs: { hold: ['🆘 Ondt nu', 'Når albuen gør ondt, især når du griber'], forebyg: ['💪 Styrke', 'Når det er blevet lidt bedre'] },
    hold: {
      title: 'Ondt i albuen – de første uger',
      calm: 'Tennis- og golfalbue er ikke farligt, og senen går ikke i stykker af, at du bruger armen. Senen er overbelastet og skal have lidt mindre af det, der irriterer den – og lidt mere rolig træning.',
      course: 'De fleste bliver meget bedre i løbet af 3–6 måneder, og 9 ud af 10 er raske inden for et år. Øvelser og lidt mindre belastning i hverdagen gør vejen kortere. Blokader (binyrebarkhormon) giver kun kort lindring og kan gøre det værre på længere sigt.',
      advice: [
        'Skær ned på det, der gør ondt – fx tunge løft med strakt arm, hårde greb og mange vrid – men brug gerne armen til lette ting.',
        'Løft med håndfladen opad og albuen tæt ind til kroppen. Det skåner senen ved tennisalbue.',
        'Lav pres-øvelserne (hånden står stille) hver dag. De dæmper ofte smerten i en time eller to.',
        'En albuerem (rem om underarmen lige under albuen) kan lindre, når du skal bruge armen. Den er ikke nødvendig.',
        'Smertestillende gel eller håndkøbsmedicin kan hjælpe i en periode. Følg pakningen, og spørg apoteket eller lægen.'
      ],
      positions: [
        'Når du sidder: lad underarmen hvile på et bord eller en pude, så hånden ikke hænger.',
        'Ved computeren: musen tæt på kroppen og underarmen støttet på bordet.',
        'Om natten: hold albuen lidt bøjet. Undgå at sove med armen strakt over hovedet eller under puden.'
      ],
      exercises: ['albue-h-iso-strak', 'albue-h-iso-boej', 'albue-h-straek-strak', 'albue-h-straek-boej']
    },
    phases: [
      { n: 1, name: 'Niveau 1: Let vægt', weeks: 'Ca. uge 1–4', color: '#5b8def', goal: 'Vænne senen til at blive brugt igen – med en let vandflaske og roligt tempo.',
        exercises: ['albue-1-loeft-op', 'albue-1-loeft-boej', 'albue-1-drej', 'albue-h-iso-strak', 'albue-h-straek-strak'],
        criteria: ['Jeg kan lave 3 sæt med 15 løft med en ½-liters flaske uden smerte over 3.', 'Albuen gør ikke mere ondt næste morgen efter træning.', 'Jeg kan løfte en fyldt kaffekop uden at det gør meget ondt.'] },
      { n: 2, name: 'Niveau 2: Tungere og langsomt', weeks: 'Ca. uge 4–8', color: '#3aa17e', goal: 'Gør senen stærkere med tungere vægt og langsomme bevægelser ned.',
        exercises: ['albue-2-kun-ned', 'albue-2-haandklaede-vrid', 'albue-1-loeft-op', 'albue-1-loeft-boej', 'albue-1-drej'],
        criteria: ['Jeg kan sænke en 1-liters flaske (eller 1–2 kg) langsomt 15 gange.', 'Jeg kan vride et håndklæde uden smerte over 3.', 'Jeg kan bære en fyldt indkøbspose et stykke vej.'] },
      { n: 3, name: 'Niveau 3: Greb og hverdag', weeks: 'Fra ca. uge 8 – og så 1–2 gange om ugen', color: '#e0913a', goal: 'Gør hånd, underarm og skulder klar til tunge greb, havearbejde, værktøj og sport.',
        exercises: ['albue-3-baere', 'albue-2-kun-ned', 'albue-2-haandklaede-vrid', 'albue-1-drej', 'bryst-2-roning-elastik'],
        criteria: ['Jeg kan bære en tung pose i hver hånd i et minut uden smerte over 3.', 'Jeg kan bruge værktøj eller spille igen i kort tid uden at få mere ondt næste dag.', 'Jeg træner underarmen 1–2 gange om ugen.'] }
    ],
    everyday: [
      'Bliv ved med øvelserne 1–2 gange om ugen, også når albuen er god igen.',
      'Løft med begge hænder, håndfladerne opad og tingene tæt ind til kroppen.',
      'Brug et tykkere greb på værktøj, havesaks og ketsjer – så skal du ikke klemme så hårdt.',
      'Hold små pauser, når du arbejder med mus, skruetrækker, strikketøj eller i haven.',
      'Kommer smerten igen? Gå tilbage til "Ondt nu" og Niveau 1 i et par uger, og byg op igen.'
    ],
    about: [
      ['Tennisalbue', 'Ondt på ydersiden af albuen, især når du griber, løfter med håndfladen nedad eller vrider (fx åbner et syltetøjsglas). Det er de sener, der løfter hånden op, som er overbelastede. Du behøver ikke at spille tennis for at få det.'],
      ['Golfalbue', 'Ondt på indersiden af albuen, når du griber, bøjer hånden eller løfter med håndfladen opad. Det er de sener, der bøjer hånd og fingre. Træningen er den samme – bare med håndfladen opad.'],
      ['Hvilke øvelser skal jeg lave?', 'Tennisalbue: lav især øvelserne med håndfladen nedad. Golfalbue: lav især dem med håndfladen opad. De andre øvelser er gode for begge.'],
      ['Må det gøre ondt?', 'Ja, lidt. Senen bliver stærkere af at blive belastet, og det må gerne gøre lidt ondt undervejs. Det vigtige er, at smerten er faldet til ro igen næste morgen. Se smertereglen nederst.'],
      ['Blokade eller operation?', 'Blokader dæmper smerten i nogle uger, men de fleste har det dårligere efter et halvt år end dem, der kun har trænet. Operation er sjældent nødvendig – tal med lægen, hvis det ikke er bedre efter et halvt til et helt år.']
    ],
    redFlags: {
      now: ['Du får pludselig smerter eller trykken i brystet, der stråler ud i armen, især med åndenød, sved eller kvalme (kan være hjertet).', 'Albuen ser forkert ud, er gået af led eller er meget hævet efter et fald.', 'Du får pludselig lammelse eller føleforstyrrelser i armen sammen med skæv mund eller besvær med at tale (kan være en blodprop i hjernen).'],
      today: ['Albuen er rød, varm og hævet, og du har feber eller føler dig syg – især hvis der er en hævelse eller et sår på albuespidsen.', 'Du kan ikke strække eller bøje albuen helt efter et fald.', 'Det gav et smæld foran i albuen ved et tungt løft, og nu er der blå mærker og armen er svag (kan være en sene, der er revet over).'],
      weeks: ['Det er slet ikke blevet bedre efter 1–2 uger med mindre belastning og øvelser.', 'Du får snurren eller prikken i ring- og lillefinger, eller hånden bliver svag og klodset.', 'Albuen bliver mere og mere stiv, så du ikke kan strække eller bøje den.', 'Smerten er der hele tiden, også om natten og i hvile, eller du har haft kræft eller taber dig uden at ville det.']
    }
  },
  {
    id: 'haand', area: 'haand', name: 'Hånd og håndled', long: 'Hånd og håndled', icon: 'haand', word: 'Niveau', holdLabel: 'Ondt nu', fbLabel: 'Styrke', aboutTitle: 'Gode råd om hånden',
    intro: 'Slidgigt i tommelfingeren og fingrene, ondt i håndleddet og "sovende fingre" (karpaltunnelsyndrom) er meget almindeligt. Bevægelse og let styrketræning holder hånden smidig og stærk, så du bedre kan klare hverdagen.',
    tabs: { hold: ['🆘 Ondt nu', 'Når hånden er øm, stiv eller sover'], forebyg: ['💪 Styrke', 'Når det er blevet lidt bedre'] },
    hold: {
      title: 'Øm, stiv eller sovende hånd – de første uger',
      calm: 'Slidgigt i hånden er ikke farligt, og du slider ikke leddene op ved at bruge dem. Stivheden om morgenen går ofte over efter lidt bevægelse. Sovende fingre om natten skyldes som regel tryk på en nerve i håndleddet, og det kan ofte lindres.',
      course: 'Slidgigt i hånden kommer og går i perioder. Smerten er ofte værst i de første år og bliver mindre med tiden – men leddene kan blive lidt tykkere. Øvelser hjælper på smerte, stivhed og greb efter 6–12 uger. Karpaltunnelsyndrom bliver bedre hos mange med en natskinne og færre bøjede stillinger, ofte i løbet af nogle uger.',
      advice: [
        'Bevæg hånden blidt flere gange om dagen – især om morgenen. Varmt vand (fx opvask eller et håndbad) gør det lettere.',
        'Brug hjælpemidler, der skåner tommelfingeren: tykke greb, glasåbner, elektrisk dåseåbner og en nøglevender.',
        'En skinne til tommelfingeren kan lindre ved slidgigt i tommelfingerroden – spørg din fysio- eller ergoterapeut.',
        'Sover fingrene om natten? Brug en håndledsskinne om natten, der holder håndleddet lige. Det er den bedst dokumenterede hjælp.',
        'Smertestillende gel eller håndkøbsmedicin kan hjælpe i perioder. Følg pakningen, og spørg apoteket eller lægen.'
      ],
      positions: [
        'Om natten: hold håndleddet lige – ikke bøjet ind under puden eller hagen.',
        'Ved telefon og tablet: støt albuen, og skift hånd, så håndleddet ikke er bøjet længe ad gangen.',
        'Sover fingrene? Ryst hånden let, og lad armen hænge afslappet ned et øjeblik.'
      ],
      exercises: ['haand-h-knyt', 'haand-h-senegled', 'haand-h-nerveglid', 'haand-h-haandled']
    },
    phases: [
      { n: 1, name: 'Niveau 1: Bevægelighed', weeks: 'Ca. uge 1–4', color: '#5b8def', goal: 'Gør fingre, tommel og håndled smidige, og træn tommelens runde "O".',
        exercises: ['haand-1-tommel-fingre', 'haand-1-spred', 'haand-h-senegled', 'haand-h-haandled', 'haand-h-knyt'],
        criteria: ['Jeg kan røre alle fingerspidser med tommelen i et rundt O.', 'Jeg kan knytte hånden og strække fingrene helt ud uden smerte over 3.', 'Hånden er ikke mere hævet eller øm næste morgen efter træning.'] },
      { n: 2, name: 'Niveau 2: Greb og styrke', weeks: 'Ca. uge 4–10', color: '#3aa17e', goal: 'Gør grebet og tommelens muskler stærkere med bold og elastik.',
        exercises: ['haand-2-klem-bold', 'haand-2-elastik-spred', 'haand-2-tommel-elastik', 'albue-1-loeft-op', 'haand-1-tommel-fingre'],
        criteria: ['Jeg kan klemme bolden 3 × 10 gange uden smerte over 3.', 'Jeg kan føre tommelen ud mod elastikken 3 × 10 gange.', 'Jeg kan skrue låg af og på en flaske uden at det gør meget ondt.'] },
      { n: 3, name: 'Niveau 3: Fint og stærkt greb', weeks: 'Fra ca. uge 10 – og så 2 gange om ugen', color: '#e0913a', goal: 'Gør hånden klar til knappe tøj, åbne glas, strikke, arbejde i haven og bære.',
        exercises: ['haand-3-knib', 'haand-2-tommel-elastik', 'haand-2-klem-bold', 'albue-1-loeft-boej', 'albue-1-drej'],
        criteria: ['Jeg kan knibe bolden med et rundt O 3 × 10 gange.', 'Jeg kan bære en indkøbspose og åbne et syltetøjsglas med hjælpemiddel.', 'Jeg træner hånden 2 gange om ugen.'] }
    ],
    everyday: [
      'Bliv ved med øvelserne 2 gange om ugen – også i de gode perioder.',
      'Brug begge hænder og store led: bær posen på underarmen, og løft gryden med to hænder.',
      'Tykke greb på bestik, kuglepen og haveredskaber skåner leddene.',
      'Hold små pauser ved strik, havearbejde, mobil og computer – ryst hænderne, og stræk fingrene.',
      'Kommer smerten eller hævelsen igen? Gå tilbage til "Ondt nu" i en uge eller to, og byg op igen.'
    ],
    about: [
      ['Slidgigt i tommelfingerroden', 'Ondt nederst ved tommelfingeren, når du knibber, vrider eller åbner glas. Leddet kan blive tykkere og stivere. Øvelser, der styrker musklerne omkring tommelen, en skinne og smarte hjælpemidler lindrer for de fleste.'],
      ['Slidgigt i fingrene', 'Små knuder ved fingrenes yderste og midterste led er almindelige, især hos kvinder efter 50 år. Leddene kan være ømme og hævede i perioder. Bevægelse og varme hjælper på stivheden.'],
      ['Karpaltunnelsyndrom (sovende fingre)', 'Nerven til tommel-, pege- og langfinger kommer i klemme i håndleddet. Fingrene snurrer og sover – ofte om natten. Natskinne og færre bøjede stillinger hjælper mange. Nerveglid er blide bevægelser, der kan lindre – men stop, hvis snurren bliver værre. Bliver følelsesløsheden ved, eller bliver hånden svag, skal du til lægen.'],
      ['Ondt i håndleddet', 'Ofte er det overbelastning efter meget arbejde med hænderne, eller lidt slidgigt. Blid bevægelse og gradvis styrketræning hjælper. Har du faldet på hånden og har ondt ved tommelfingersiden af håndleddet, skal det undersøges – også selvom du kan bevæge det.'],
      ['Må det gøre ondt?', 'Ja, lidt. Det er normalt, at leddene gør lidt ondt under træningen. Det vigtige er, at smerten og hævelsen er faldet til ro igen næste morgen. Se smertereglen nederst.']
    ],
    redFlags: {
      now: ['Du får pludselig smerter eller trykken i brystet, der stråler ud i armen, især med åndenød, sved eller kvalme (kan være hjertet).', 'Du får pludselig lammelse eller følelsesløshed i armen eller hånden sammen med skæv mund eller besvær med at tale (kan være en blodprop i hjernen).', 'Håndleddet eller en finger ser skævt ud efter et fald, eller hånden bliver kold, hvid eller blå.'],
      today: ['Et led i hånden eller en finger er rødt, varmt og hævet, og du har feber – især efter et sår, en rift eller et bid.', 'Du er faldet på hånden og har ondt på tommelfingersiden af håndleddet (kan være et brud, der ikke ses udefra).', 'Du kan pludselig ikke strække eller bøje en finger efter et uheld (kan være en sene).'],
      weeks: ['Fingrene er følelsesløse hele tiden – ikke kun om natten – eller følelsen bliver dårligere.', 'Hånden bliver svag og klodset: du taber ting, eller musklen ved tommelfingerroden bliver tyndere.', 'Du har snurren i begge hænder, eller også i fødderne.', 'Mange led i begge hænder er hævede og stive i mere end en time om morgenen (kan være leddegigt).', 'Det er slet ikke blevet bedre efter 1–2 uger, eller smerten er der hele tiden, også om natten.']
    }
  }
];

const LED_PAIN_CHECK = {
  skulder: { beforeQuestion: 'Hvor ondt har du i skulderen lige nu?', afterQuestion: 'Hvor ondt har du i skulderen nu, efter øvelserne?' },
  albue: { beforeQuestion: 'Hvor ondt har du i albuen lige nu?', afterQuestion: 'Hvor ondt har du i albuen nu, efter øvelserne?' },
  haand: { beforeQuestion: 'Hvor ondt har du i hånden lige nu?', afterQuestion: 'Hvor ondt har du i hånden nu, efter øvelserne?' }
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
  },
  /* ================= ALBUE ================= */
  {
    id: 'albue-h-iso-strak', category: 'albue', track: 'hold', level: 1, phases: [1],
    images: [{"src": "images/albue-h-iso-strak/1.webp", "caption": "1. Læg underarmen på bordet med håndfladen nedad og hånden ud over kanten. Læg den anden hånd oven på.", "w": 720, "h": 393}, {"src": "images/albue-h-iso-strak/2.webp", "caption": "2. Pres hånden op mod den anden hånd med cirka halv kraft. Hånden står stille.", "w": 720, "h": 393}, {"src": "images/albue-h-iso-strak/3.webp", "caption": "3. Hold 30–45 sekunder, slap af, og hvil et minut.", "w": 720, "h": 393}], /* auto: tools/sync_images.py */
    name: 'Pres hånden op – den står stille',
    equipment: 'Et bord og evt. et foldet håndklæde under underarmen.',
    dose: '5 gange. Hold 30–45 sekunder. 1–2 gange om dagen, gerne flere.',
    steps: ['Læg underarmen på bordet med håndfladen nedad og hånden ud over kanten. Læg den anden hånd oven på.', 'Pres hånden op mod den anden hånd med cirka halv kraft. Hånden står stille.', 'Hold 30–45 sekunder, slap af, og hvil et minut.'],
    tips: ['Især til tennisalbue (ondt på ydersiden).', 'Det må gerne trække lidt, men ikke gøre mere ondt end 3. Smerten dæmpes ofte bagefter.'],
    progression: 'Lettere: pres svagere, eller hold kortere. Sværere: pres lidt hårdere, eller hold albuen strakt.',
    stop: LED_PAIN_RULE.albue
  },
  {
    id: 'albue-h-iso-boej', category: 'albue', track: 'hold', level: 1, phases: [1],
    images: [{"src": "images/albue-h-iso-boej/1.webp", "caption": "1. Læg underarmen på bordet med håndfladen opad og hånden ud over kanten. Læg den anden hånd i håndfladen.", "w": 720, "h": 393}, {"src": "images/albue-h-iso-boej/2.webp", "caption": "2. Pres håndfladen op mod den anden hånd med cirka halv kraft. Hånden står stille.", "w": 720, "h": 393}, {"src": "images/albue-h-iso-boej/3.webp", "caption": "3. Hold 30–45 sekunder, slap af, og hvil et minut.", "w": 720, "h": 393}], /* auto: tools/sync_images.py */
    name: 'Pres håndfladen op – den står stille',
    equipment: 'Et bord og evt. et foldet håndklæde under underarmen.',
    dose: '5 gange. Hold 30–45 sekunder. 1–2 gange om dagen, gerne flere.',
    steps: ['Læg underarmen på bordet med håndfladen opad og hånden ud over kanten. Læg den anden hånd i håndfladen.', 'Pres håndfladen op mod den anden hånd med cirka halv kraft. Hånden står stille.', 'Hold 30–45 sekunder, slap af, og hvil et minut.'],
    tips: ['Især til golfalbue (ondt på indersiden).', 'Træk vejret roligt – hold ikke vejret.'],
    progression: 'Lettere: pres svagere, eller hold kortere. Sværere: pres lidt hårdere.',
    stop: LED_PAIN_RULE.albue
  },
  {
    id: 'albue-h-straek-strak', category: 'albue', track: 'hold', level: 1, phases: [1],
    images: [{"src": "images/albue-h-straek-strak/1.webp", "caption": "1. Stræk armen frem med håndfladen nedad.", "w": 720, "h": 393}, {"src": "images/albue-h-straek-strak/2.webp", "caption": "2. Bøj roligt hånden ned med den anden hånd, til du mærker et stræk på oversiden af underarmen.", "w": 720, "h": 393}, {"src": "images/albue-h-straek-strak/3.webp", "caption": "3. Hold 30 sekunder, og slip langsomt.", "w": 720, "h": 393}], /* auto: tools/sync_images.py */
    name: 'Stræk oversiden af underarmen',
    equipment: 'Ingen.',
    dose: '3 gange. Hold 30 sekunder. 2–3 gange om dagen.',
    steps: ['Stræk armen frem med håndfladen nedad.', 'Bøj roligt hånden ned med den anden hånd, til du mærker et stræk på oversiden af underarmen.', 'Hold 30 sekunder, og slip langsomt.'],
    tips: ['Især til tennisalbue.', 'Stræk skal være behageligt – ikke gøre ondt.'],
    progression: 'Lettere: bøj albuen lidt. Sværere: knyt hånden let, mens du bøjer den ned.',
    stop: LED_PAIN_RULE.albue
  },
  {
    id: 'albue-h-straek-boej', category: 'albue', track: 'hold', level: 1, phases: [1],
    images: [{"src": "images/albue-h-straek-boej/1.webp", "caption": "1. Stræk armen frem med håndfladen opad.", "w": 720, "h": 393}, {"src": "images/albue-h-straek-boej/2.webp", "caption": "2. Bøj roligt hånd og fingre ned og bagud med den anden hånd, til du mærker et stræk på undersiden af underarmen.", "w": 720, "h": 393}, {"src": "images/albue-h-straek-boej/3.webp", "caption": "3. Hold 30 sekunder, og slip langsomt.", "w": 720, "h": 393}], /* auto: tools/sync_images.py */
    name: 'Stræk undersiden af underarmen',
    equipment: 'Ingen.',
    dose: '3 gange. Hold 30 sekunder. 2–3 gange om dagen.',
    steps: ['Stræk armen frem med håndfladen opad.', 'Bøj roligt hånd og fingre ned og bagud med den anden hånd, til du mærker et stræk på undersiden af underarmen.', 'Hold 30 sekunder, og slip langsomt.'],
    tips: ['Især til golfalbue.', 'Stræk skal være behageligt – ikke gøre ondt.'],
    progression: 'Lettere: bøj albuen lidt. Sværere: stræk albuen helt.',
    stop: LED_PAIN_RULE.albue
  },
  {
    id: 'albue-1-loeft-op', category: 'albue', track: 'forebyg', level: 1, phases: [1, 2],
    images: [{"src": "images/albue-1-loeft-op/1.webp", "caption": "1. Læg underarmen på bordet med håndfladen nedad og hånden ud over kanten. Hold flasken.", "w": 720, "h": 393}, {"src": "images/albue-1-loeft-op/2.webp", "caption": "2. Løft hånden roligt op, så langt du kan (3 sekunder).", "w": 720, "h": 393}, {"src": "images/albue-1-loeft-op/3.webp", "caption": "3. Sænk den langsomt ned igen (3 sekunder).", "w": 720, "h": 393}], /* auto: tools/sync_images.py */
    name: 'Løft hånden op med en flaske',
    equipment: 'En ½-liters vandflaske eller en lille håndvægt (½–1 kg). Et bord og et håndklæde.',
    dose: '3 sæt med 15 gentagelser. Hver anden dag.',
    steps: ['Læg underarmen på bordet med håndfladen nedad og hånden ud over kanten. Hold flasken.', 'Løft hånden roligt op, så langt du kan (3 sekunder).', 'Sænk den langsomt ned igen (3 sekunder).'],
    tips: ['Især til tennisalbue.', 'Underarmen bliver liggende – kun hånden bevæger sig.'],
    progression: 'Lettere: uden flaske. Sværere: en større flaske eller 1–2 kg.',
    stop: LED_PAIN_RULE.albue
  },
  {
    id: 'albue-1-loeft-boej', category: 'albue', track: 'forebyg', level: 1, phases: [1, 2],
    images: [{"src": "images/albue-1-loeft-boej/1.webp", "caption": "1. Læg underarmen på bordet med håndfladen opad og hånden ud over kanten. Hold flasken.", "w": 720, "h": 393}, {"src": "images/albue-1-loeft-boej/2.webp", "caption": "2. Bøj hånden roligt op (3 sekunder).", "w": 720, "h": 393}, {"src": "images/albue-1-loeft-boej/3.webp", "caption": "3. Sænk den langsomt ned igen (3 sekunder).", "w": 720, "h": 393}], /* auto: tools/sync_images.py */
    name: 'Bøj hånden op med en flaske',
    equipment: 'En ½-liters vandflaske eller en lille håndvægt (½–1 kg). Et bord og et håndklæde.',
    dose: '3 sæt med 15 gentagelser. Hver anden dag.',
    steps: ['Læg underarmen på bordet med håndfladen opad og hånden ud over kanten. Hold flasken.', 'Bøj hånden roligt op (3 sekunder).', 'Sænk den langsomt ned igen (3 sekunder).'],
    tips: ['Især til golfalbue.', 'Underarmen bliver liggende – kun hånden bevæger sig.'],
    progression: 'Lettere: uden flaske. Sværere: en større flaske eller 1–2 kg.',
    stop: LED_PAIN_RULE.albue
  },
  {
    id: 'albue-1-drej', category: 'albue', track: 'forebyg', level: 1, phases: [1, 2, 3],
    images: [{"src": "images/albue-1-drej/1.webp", "caption": "1. Læg underarmen på bordet, og hold albuen ind til kroppen. Hold flasken i den ene ende, så den peger op.", "w": 720, "h": 393}, {"src": "images/albue-1-drej/2.webp", "caption": "2. Drej roligt hånden, så håndfladen vender op (3 sekunder).", "w": 720, "h": 393}, {"src": "images/albue-1-drej/3.webp", "caption": "3. Drej den langsomt tilbage, så håndfladen vender ned (3 sekunder).", "w": 720, "h": 393}], /* auto: tools/sync_images.py */
    name: 'Drej underarmen med en flaske',
    equipment: 'En vandflaske, en hammer eller et kosteskaft. Et bord.',
    dose: '3 sæt med 10–15 gentagelser. Hver anden dag.',
    steps: ['Læg underarmen på bordet, og hold albuen ind til kroppen. Hold flasken i den ene ende, så den peger op.', 'Drej roligt hånden, så håndfladen vender op (3 sekunder).', 'Drej den langsomt tilbage, så håndfladen vender ned (3 sekunder).'],
    tips: ['Godt til både tennis- og golfalbue.', 'Jo længere ude du holder, jo tungere er det.'],
    progression: 'Lettere: hold tættere på enden med vægten. Sværere: en hammer, og hold længere nede på skaftet.',
    stop: LED_PAIN_RULE.albue
  },
  {
    id: 'albue-2-kun-ned', category: 'albue', track: 'forebyg', level: 2, phases: [2, 3],
    images: [{"src": "images/albue-2-kun-ned/1.webp", "caption": "1. Læg underarmen på bordet med håndfladen nedad og hånden ud over kanten. Hold vægten.", "w": 720, "h": 393}, {"src": "images/albue-2-kun-ned/2.webp", "caption": "2. Løft hånden op med hjælp fra den anden hånd.", "w": 720, "h": 393}, {"src": "images/albue-2-kun-ned/3.webp", "caption": "3. Slip hjælpen, og sænk hånden langsomt alene (4 sekunder).", "w": 720, "h": 393}], /* auto: tools/sync_images.py */
    name: 'Hjælp op – sænk langsomt',
    equipment: 'En 1-liters flaske eller en håndvægt (1–3 kg). Et bord og et håndklæde.',
    dose: '3 sæt med 15 gentagelser. Hver anden dag.',
    steps: ['Læg underarmen på bordet med håndfladen nedad og hånden ud over kanten. Hold vægten.', 'Løft hånden op med hjælp fra den anden hånd.', 'Slip hjælpen, og sænk hånden langsomt alene (4 sekunder).'],
    tips: ['Den langsomme bevægelse ned gør senen stærkere.', 'Golfalbue: lav den med håndfladen opad.'],
    progression: 'Lettere: let vægt. Sværere: tungere vægt, eller sænk endnu langsommere.',
    stop: LED_PAIN_RULE.albue
  },
  {
    id: 'albue-2-haandklaede-vrid', category: 'albue', track: 'forebyg', level: 2, phases: [2, 3],
    images: [{"src": "images/albue-2-haandklaede-vrid/1.webp", "caption": "1. Rul et håndklæde sammen, og hold det med begge hænder foran dig.", "w": 720, "h": 393}, {"src": "images/albue-2-haandklaede-vrid/2.webp", "caption": "2. Vrid roligt, som når du vrider en karklud (3 sekunder).", "w": 720, "h": 393}, {"src": "images/albue-2-haandklaede-vrid/3.webp", "caption": "3. Vrid derefter den anden vej (3 sekunder).", "w": 720, "h": 393}], /* auto: tools/sync_images.py */
    name: 'Vrid et håndklæde',
    equipment: 'Et håndklæde, rullet sammen.',
    dose: '3 sæt med 10 vrid hver vej. Hver anden dag.',
    steps: ['Rul et håndklæde sammen, og hold det med begge hænder foran dig.', 'Vrid roligt, som når du vrider en karklud (3 sekunder).', 'Vrid derefter den anden vej (3 sekunder).'],
    tips: ['Træner greb og drej på én gang – som i hverdagen.', 'Vrid kun så hårdt, at smerten holder sig under 3–4.'],
    progression: 'Lettere: et tyndt håndklæde og løst greb. Sværere: et tykt håndklæde, eller vrid hårdere.',
    stop: LED_PAIN_RULE.albue
  },
  {
    id: 'albue-3-baere', category: 'albue', track: 'forebyg', level: 3, phases: [3],
    images: [{"src": "images/albue-3-baere/1.webp", "caption": "1. Tag en tung pose i hånden med strakt arm.", "w": 480, "h": 588}, {"src": "images/albue-3-baere/2.webp", "caption": "2. Stå rank, og gå roligt rundt i 30–60 sekunder.", "w": 480, "h": 588}, {"src": "images/albue-3-baere/3.webp", "caption": "3. Sæt posen ned, og skift hånd.", "w": 480, "h": 588}], /* auto: tools/sync_images.py */
    name: 'Bær en tung pose',
    equipment: 'En indkøbspose eller taske med noget tungt i (2–8 kg).',
    dose: '3 gange med hver hånd. 30–60 sekunder ad gangen. 2 gange om ugen.',
    steps: ['Tag en tung pose i hånden med strakt arm.', 'Stå rank, og gå roligt rundt i 30–60 sekunder.', 'Sæt posen ned, og skift hånd.'],
    tips: ['Hold et fast greb, og lad skulderen være nede.', 'Godt til både tennis- og golfalbue – og til hverdagen.'],
    progression: 'Lettere: en let pose og kortere tid. Sværere: tungere pose, eller gå længere.',
    stop: LED_PAIN_RULE.albue
  },
  /* ================= HÅND OG HÅNDLED ================= */
  {
    id: 'haand-h-knyt', category: 'haand', track: 'hold', level: 1, phases: [1],
    images: [{"src": "images/haand-h-knyt/1.webp", "caption": "1. Hold hånden op med fingrene strakt.", "w": 480, "h": 510}, {"src": "images/haand-h-knyt/2.webp", "caption": "2. Knyt hånden blødt – uden at klemme.", "w": 480, "h": 510}, {"src": "images/haand-h-knyt/3.webp", "caption": "3. Stræk fingrene helt ud igen, og spred dem.", "w": 480, "h": 510}], /* auto: tools/sync_images.py */
    name: 'Knyt og stræk hånden',
    equipment: 'Ingen. Gerne i varmt vand.',
    dose: '10 gange. Flere gange om dagen, især om morgenen.',
    steps: ['Hold hånden op med fingrene strakt.', 'Knyt hånden blødt – uden at klemme.', 'Stræk fingrene helt ud igen, og spred dem.'],
    tips: ['Gør det i varmt vand om morgenen, når fingrene er stive.', 'Roligt og blødt – det skal ikke gøre ondt.'],
    progression: 'Lettere: knyt kun halvt. Sværere: hold 3 sekunder i hver stilling.',
    stop: LED_PAIN_RULE.haand
  },
  {
    id: 'haand-h-senegled', category: 'haand', track: 'hold', level: 1, phases: [1],
    images: [{"src": "images/haand-h-senegled/1.webp", "caption": "1. Hold hånden lige op med strakte fingre. Bøj fingrene til en krog, og hold 3 sekunder.", "w": 480, "h": 510}, {"src": "images/haand-h-senegled/2.webp", "caption": "2. Ret ud, knyt hånden blødt, og hold 3 sekunder.", "w": 480, "h": 510}, {"src": "images/haand-h-senegled/3.webp", "caption": "3. Ret ud, bøj kun i knoerne, så fingrene er lige som en bordplade, og hold 3 sekunder.", "w": 480, "h": 510}], /* auto: tools/sync_images.py */
    name: 'Senegled – krog, knytnæve og bordplade',
    equipment: 'Ingen.',
    dose: '5 gange hele rækken. 2–3 gange om dagen.',
    steps: ['Hold hånden lige op med strakte fingre. Bøj fingrene til en krog, og hold 3 sekunder.', 'Ret ud, knyt hånden blødt, og hold 3 sekunder.', 'Ret ud, bøj kun i knoerne, så fingrene er lige som en bordplade, og hold 3 sekunder.'],
    tips: ['Får senerne til at glide frit – godt ved stive fingre og sovende fingre.', 'Ret helt ud mellem hver stilling.'],
    progression: 'Lettere: færre gentagelser. Sværere: hold 5 sekunder i hver stilling.',
    stop: LED_PAIN_RULE.haand
  },
  {
    id: 'haand-h-nerveglid', category: 'haand', track: 'hold', level: 1, phases: [1],
    images: [{"src": "images/haand-h-nerveglid/1.webp", "caption": "1. Løft armen ud til siden med håndfladen opad og albuen næsten strakt.", "w": 480, "h": 495}, {"src": "images/haand-h-nerveglid/2.webp", "caption": "2. Bøj hånden bagud, og vip samtidig hovedet mod armen.", "w": 480, "h": 495}, {"src": "images/haand-h-nerveglid/3.webp", "caption": "3. Ret hånden, og vip hovedet væk fra armen. Bliv ved roligt frem og tilbage.", "w": 480, "h": 495}], /* auto: tools/sync_images.py */
    name: 'Nerveglid for sovende fingre',
    equipment: 'Ingen. Stå eller sid.',
    dose: '10 gange, roligt. 2 gange om dagen.',
    steps: ['Løft armen ud til siden med håndfladen opad og albuen næsten strakt.', 'Bøj hånden bagud, og vip samtidig hovedet mod armen.', 'Ret hånden, og vip hovedet væk fra armen. Bliv ved roligt frem og tilbage.'],
    tips: ['En let snurren er i orden, men den skal forsvinde igen inden for et par minutter.', 'Gå ikke helt ud i yderstillingen – det skal være blidt.'],
    progression: 'Lettere: hold armen lavere og albuen bøjet. Sværere: stræk albuen helt.',
    stop: LED_PAIN_RULE.haand
  },
  {
    id: 'haand-h-haandled', category: 'haand', track: 'hold', level: 1, phases: [1, 2],
    images: [{"src": "images/haand-h-haandled/1.webp", "caption": "1. Læg underarmen på bordet med hånden ud over kanten.", "w": 720, "h": 393}, {"src": "images/haand-h-haandled/2.webp", "caption": "2. Bøj roligt hånden op, så langt det er rart.", "w": 720, "h": 393}, {"src": "images/haand-h-haandled/3.webp", "caption": "3. Bøj den roligt ned. Bevæg den også lidt fra side til side.", "w": 720, "h": 393}], /* auto: tools/sync_images.py */
    name: 'Bevæg håndleddet op og ned',
    equipment: 'Et bord og evt. et foldet håndklæde.',
    dose: '10 gange. Flere gange om dagen.',
    steps: ['Læg underarmen på bordet med hånden ud over kanten.', 'Bøj roligt hånden op, så langt det er rart.', 'Bøj den roligt ned. Bevæg den også lidt fra side til side.'],
    tips: ['Godt, når håndleddet er stift efter hvile eller en skinne.', 'Lad bevægelsen være blød – ingen ryk.'],
    progression: 'Lettere: små bevægelser. Sværere: hold en lille flaske (se "Løft hånden op med en flaske").',
    stop: LED_PAIN_RULE.haand
  },
  {
    id: 'haand-1-tommel-fingre', category: 'haand', track: 'forebyg', level: 1, phases: [1, 2],
    images: [{"src": "images/haand-1-tommel-fingre/1.webp", "caption": "1. Hold hånden op med håndfladen mod dig.", "w": 480, "h": 510}, {"src": "images/haand-1-tommel-fingre/2.webp", "caption": "2. Rør spidsen af pegefingeren med spidsen af tommelen, så de danner et rundt O.", "w": 480, "h": 510}, {"src": "images/haand-1-tommel-fingre/3.webp", "caption": "3. Gør det samme med langfinger, ringfinger og lillefinger, og åbn hånden helt.", "w": 480, "h": 510}], /* auto: tools/sync_images.py */
    name: 'Tommel mod hver fingerspids',
    equipment: 'Ingen.',
    dose: '5–10 gange hele rækken. Hver dag.',
    steps: ['Hold hånden op med håndfladen mod dig.', 'Rør spidsen af pegefingeren med spidsen af tommelen, så de danner et rundt O.', 'Gør det samme med langfinger, ringfinger og lillefinger, og åbn hånden helt.'],
    tips: ['Tommelen skal være rund – ikke knække bagud i leddet.', 'Godt ved slidgigt i tommelfingerroden.'],
    progression: 'Lettere: kun pegefinger og langfinger. Sværere: pres let mod hver finger i 2 sekunder.',
    stop: LED_PAIN_RULE.haand
  },
  {
    id: 'haand-1-spred', category: 'haand', track: 'forebyg', level: 1, phases: [1],
    images: [{"src": "images/haand-1-spred/1.webp", "caption": "1. Hold hånden op med håndfladen mod dig.", "w": 480, "h": 510}, {"src": "images/haand-1-spred/2.webp", "caption": "2. Spred fingrene så meget du kan, og hold 3 sekunder.", "w": 480, "h": 510}, {"src": "images/haand-1-spred/3.webp", "caption": "3. Saml dem igen.", "w": 480, "h": 510}], /* auto: tools/sync_images.py */
    name: 'Spred fingrene',
    equipment: 'Ingen.',
    dose: '10 gange. Hver dag.',
    steps: ['Hold hånden op med håndfladen mod dig.', 'Spred fingrene så meget du kan, og hold 3 sekunder.', 'Saml dem igen.'],
    tips: ['Kan også laves med hånden fladt på bordet.', 'Godt mod stivhed i fingrene.'],
    progression: 'Sværere: brug en elastik om fingrene (Niveau 2).',
    stop: LED_PAIN_RULE.haand
  },
  {
    id: 'haand-2-klem-bold', category: 'haand', track: 'forebyg', level: 2, phases: [2, 3],
    images: [{"src": "images/haand-2-klem-bold/1.webp", "caption": "1. Hold bolden i hånden.", "w": 480, "h": 510}, {"src": "images/haand-2-klem-bold/2.webp", "caption": "2. Klem roligt med hele hånden, og hold 3 sekunder.", "w": 480, "h": 510}, {"src": "images/haand-2-klem-bold/3.webp", "caption": "3. Slip langsomt.", "w": 480, "h": 510}], /* auto: tools/sync_images.py */
    name: 'Klem en blød bold',
    equipment: 'En blød bold, en sammenrullet sok eller træningsler.',
    dose: '3 sæt med 10 gentagelser. Hver anden dag.',
    steps: ['Hold bolden i hånden.', 'Klem roligt med hele hånden, og hold 3 sekunder.', 'Slip langsomt.'],
    tips: ['Klem med cirka halv kraft – ikke alt, hvad du kan.', 'Har du ondt i tommelfingerroden, så lad tommelen ligge på siden af bolden.'],
    progression: 'Lettere: en sok. Sværere: en hårdere bold eller træningsler.',
    stop: LED_PAIN_RULE.haand
  },
  {
    id: 'haand-2-elastik-spred', category: 'haand', track: 'forebyg', level: 2, phases: [2, 3],
    images: [{"src": "images/haand-2-elastik-spred/1.webp", "caption": "1. Sæt elastikken om fingrene og tommelen.", "w": 480, "h": 510}, {"src": "images/haand-2-elastik-spred/2.webp", "caption": "2. Spred fingrene ud mod elastikken, og hold 3 sekunder.", "w": 480, "h": 510}, {"src": "images/haand-2-elastik-spred/3.webp", "caption": "3. Saml dem langsomt igen.", "w": 480, "h": 510}], /* auto: tools/sync_images.py */
    name: 'Spred fingrene mod en elastik',
    equipment: 'En almindelig elastik eller en fingerelastik.',
    dose: '3 sæt med 10 gentagelser. Hver anden dag.',
    steps: ['Sæt elastikken om fingrene og tommelen.', 'Spred fingrene ud mod elastikken, og hold 3 sekunder.', 'Saml dem langsomt igen.'],
    tips: ['Træner de muskler, der åbner hånden – godt modvægt til alle greb.', 'Brug en let elastik i starten.'],
    progression: 'Sværere: en strammere elastik, eller to elastikker.',
    stop: LED_PAIN_RULE.haand
  },
  {
    id: 'haand-2-tommel-elastik', category: 'haand', track: 'forebyg', level: 2, phases: [2, 3],
    images: [{"src": "images/haand-2-tommel-elastik/1.webp", "caption": "1. Sæt elastikken om tommelen og pegefingeren.", "w": 480, "h": 510}, {"src": "images/haand-2-tommel-elastik/2.webp", "caption": "2. Før tommelen ud til siden mod elastikken, og hold 3 sekunder.", "w": 480, "h": 510}, {"src": "images/haand-2-tommel-elastik/3.webp", "caption": "3. Før den langsomt tilbage.", "w": 480, "h": 510}], /* auto: tools/sync_images.py */
    name: 'Tommelen ud mod en elastik',
    equipment: 'En almindelig elastik.',
    dose: '3 sæt med 10 gentagelser. Hver anden dag.',
    steps: ['Sæt elastikken om tommelen og pegefingeren.', 'Før tommelen ud til siden mod elastikken, og hold 3 sekunder.', 'Før den langsomt tilbage.'],
    tips: ['Styrker musklerne, der holder tommelfingerroden stabil – godt ved slidgigt i tommelen.', 'Hold tommelens yderste led let bøjet.'],
    progression: 'Sværere: en strammere elastik, eller hold 5 sekunder.',
    stop: LED_PAIN_RULE.haand
  },
  {
    id: 'haand-3-knib', category: 'haand', track: 'forebyg', level: 3, phases: [3],
    images: [{"src": "images/haand-3-knib/1.webp", "caption": "1. Hold bolden mellem tommelen og pegefingeren.", "w": 480, "h": 510}, {"src": "images/haand-3-knib/2.webp", "caption": "2. Knib roligt, så tommel og pegefinger danner et rundt O, og hold 3 sekunder.", "w": 480, "h": 510}, {"src": "images/haand-3-knib/3.webp", "caption": "3. Slip.", "w": 480, "h": 510}], /* auto: tools/sync_images.py */
    name: 'Knib en lille bold',
    equipment: 'En lille blød bold, en vinkork eller træningsler.',
    dose: '3 sæt med 10 gentagelser. 2–3 gange om ugen.',
    steps: ['Hold bolden mellem tommelen og pegefingeren.', 'Knib roligt, så tommel og pegefinger danner et rundt O, og hold 3 sekunder.', 'Slip.'],
    tips: ['Tommelen må ikke knække bagud i leddet – så er det for hårdt.', 'Skift til langfinger, ringfinger og lillefinger.'],
    progression: 'Lettere: en blødere bold. Sværere: træningsler eller tøjklemmer.',
    stop: LED_PAIN_RULE.haand
  }
];
if (typeof RYG_PAIN_CHECK !== 'undefined') Object.assign(RYG_PAIN_CHECK, LED_PAIN_CHECK);
LED_PROGRAMS.forEach(p => { p.ready = LED_READY_TEXT; p.painRule = LED_PAIN_RULE[p.id]; });
