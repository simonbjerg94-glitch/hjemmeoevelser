/* PT: træningsprogrammer til personlig træning (kropsvægt, uden udstyr) + velkomstspørgsmål.
   Ingen klientdata her – kun generelle øvelser og programmer. Svar og træningslog gemmes kun på telefonen. */
'use strict';

const PT_RULE = 'Det må gerne være hårdt, men ikke gøre ondt. Let ømhed i musklerne dagen efter er normalt. ' +
  'Smerte op til 3 af 10 under øvelsen er i orden, hvis den er væk igen næste dag. Skarp eller stigende smerte: stop øvelsen, ' +
  'vælg en lettere variant, og fortæl det til din træner.';

/* Nye øvelser, der kun bruges i PT-programmerne. De genbrugte øvelser (squat, bro, udfald, planke på siden …) ligger i de andre datafiler. */
const PT_EXERCISES = [
  {
    id: 'pt-armstraek-knae', category: 'styrke', level: 2,
    images: [{"src": "images/pt-armstraek-knae/1.webp", "caption": "1. Sæt knæene i gulvet på en måtte, og placér hænderne lidt bredere end skuldrene.", "w": 720, "h": 343}, {"src": "images/pt-armstraek-knae/2.webp", "caption": "2. Gå frem på hænderne, til kroppen er lige fra knæ til hoved.", "w": 720, "h": 343}, {"src": "images/pt-armstraek-knae/3.webp", "caption": "3. Bøj albuerne, og sænk brystet roligt mod gulvet. Albuerne peger skråt bagud.", "w": 720, "h": 343}], /* auto: tools/sync_images.py */
    name: 'Armstrækninger på knæene',
    dose: '3 sæt × 6–12 gentagelser. 2 sek. ned, 1 sek. op.',
    steps: [
      'Sæt knæene i gulvet på en måtte, og placér hænderne lidt bredere end skuldrene.',
      'Gå frem på hænderne, til kroppen er lige fra knæ til hoved.',
      'Bøj albuerne, og sænk brystet roligt mod gulvet. Albuerne peger skråt bagud.',
      'Pres dig op igen, til armene er strakte.'
    ],
    tips: ['Spænd i maven og ballerne, så hoften ikke hænger.', 'Kig ned i gulvet lidt foran hænderne.', 'Pust ud, når du presser op.'],
    progression: 'Lettere: armstrækninger mod væggen eller mod et bord. Sværere: armstrækninger på tæerne.',
    stop: PT_RULE
  },
  {
    id: 'pt-armstraek', category: 'styrke', level: 3,
    images: [{"src": "images/pt-armstraek/1.webp", "caption": "1. Placér hænderne under skuldrene, og stil dig på tæerne, så kroppen er lige som en planke.", "w": 720, "h": 335}, {"src": "images/pt-armstraek/2.webp", "caption": "2. Bøj albuerne, og sænk brystet, til det næsten rører gulvet.", "w": 720, "h": 335}, {"src": "images/pt-armstraek/3.webp", "caption": "3. Pres dig op igen, til armene er strakte. Kroppen bevæger sig som én blok.", "w": 720, "h": 335}], /* auto: tools/sync_images.py */
    name: 'Armstrækninger',
    dose: '3 sæt × 5–12 gentagelser. 2 sek. ned, 1 sek. op.',
    steps: [
      'Placér hænderne under skuldrene, og stil dig på tæerne, så kroppen er lige som en planke.',
      'Bøj albuerne, og sænk brystet, til det næsten rører gulvet.',
      'Pres dig op igen, til armene er strakte. Kroppen bevæger sig som én blok.'
    ],
    tips: ['Hoften må hverken hænge eller stikke op.', 'Albuerne peger skråt bagud – ikke lige ud til siden.', 'Hellere færre gode end mange dårlige.'],
    progression: 'Lettere: armstrækninger på knæene. Sværere: langsommere ned (4 sek.), eller hold 2 sek. i bunden.',
    stop: PT_RULE
  },
  {
    id: 'pt-planke', category: 'styrke', level: 2,
    images: [{"src": "images/pt-planke/1.webp", "caption": "1. Læg dig på maven med albuerne lige under skuldrene og underarmene i gulvet.", "w": 720, "h": 301}, {"src": "images/pt-planke/2.webp", "caption": "2. Løft hoften, så kroppen er lige fra hæle til hoved. Stå på tæerne.", "w": 720, "h": 301}, {"src": "images/pt-planke/3.webp", "caption": "3. Spænd i maven og ballerne, og træk vejret roligt. Hold tiden.", "w": 720, "h": 301}], /* auto: tools/sync_images.py */
    name: 'Planke på underarmene',
    dose: '3 × 20–45 sekunder. 30–60 sek. pause.',
    steps: [
      'Læg dig på maven med albuerne lige under skuldrene og underarmene i gulvet.',
      'Løft hoften, så kroppen er lige fra hæle til hoved. Stå på tæerne.',
      'Spænd i maven og ballerne, og træk vejret roligt. Hold tiden.',
      'Sænk knæene til gulvet, og hvil.'
    ],
    tips: ['Lænden må ikke svaje – tænk "navlen ind".', 'Kig ned i gulvet mellem hænderne.', 'Hold ikke vejret.'],
    progression: 'Lettere: planke med knæene i gulvet. Sværere: længere tid, eller løft skiftevis et ben et par centimeter.',
    stop: PT_RULE
  }
];

/* Programmer. Hvert trin er én træning. reps = [min, max] gentagelser pr. sæt; hold = [min, max] sekunder.
   side: true = antal pr. side. Progression: dobbelt progression – når alle sæt når den øverste grænse med en
   anstrengelse på højst 8 af 10, foreslås flere gentagelser næste gang og til sidst næste trin. */
const PT_PROGRAMS = [
  {
    id: 'helkrop', name: 'Helkrop – begynder', short: 'Helkrop',
    about: 'Styrketræning for hele kroppen med din egen kropsvægt. Ingen udstyr – kun en måtte og en stol. 2–3 gange om ugen med mindst én hviledag imellem.',
    equipment: 'Måtte og en stabil stol',
    minutes: '25–35 min',
    levels: [
      { n: 1, name: 'Trin 1', sub: 'Grundlag', items: [
        { id: 'knae-2-rejse-uden-arme', sets: 3, reps: [8, 15], name: 'Rejs dig fra stol (squat til stol)' },
        { id: 'skulder-3-vaegpres', sets: 3, reps: [8, 15], name: 'Armstrækninger mod væggen' },
        { id: 'hofte-1-broen', sets: 3, reps: [10, 15], name: 'Bro' },
        { id: 'laend-2-fuglehund', sets: 2, reps: [6, 10], side: true, name: 'Fuglehund' },
        { id: 'hael-2-haeloeft-begge', sets: 2, reps: [10, 20], name: 'Hæløft' },
        { id: 'laend-1-dead-bug', sets: 2, reps: [6, 10], side: true, name: 'Dead bug' }
      ] },
      { n: 2, name: 'Trin 2', sub: 'Mere kraft', items: [
        { id: 'knae-2-minisquat', sets: 3, reps: [10, 15], name: 'Squat (knæbøj)' },
        { id: 'pt-armstraek-knae', sets: 3, reps: [6, 12] },
        { id: 'hofte-3-udfald-bagud', sets: 3, reps: [6, 10], side: true, name: 'Udfald bagud' },
        { id: 'hofte-3-broen-et-ben', sets: 3, reps: [6, 12], side: true, name: 'Bro på ét ben' },
        { id: 'pt-planke', sets: 3, hold: [20, 45] },
        { id: 'laend-2-sideplanke-knae', sets: 2, hold: [10, 30], side: true, name: 'Sideplanke på knæ' }
      ] },
      { n: 3, name: 'Trin 3', sub: 'Udfordring', items: [
        { id: 'knae-3-rejse-et-ben', sets: 3, reps: [5, 10], side: true, name: 'Squat til stol på ét ben' },
        { id: 'pt-armstraek', sets: 3, reps: [5, 12] },
        { id: 'knae-3-udfald-frem', sets: 3, reps: [8, 12], side: true, name: 'Udfald frem' },
        { id: 'ankel-2-haeloeft-et-ben', sets: 3, reps: [10, 20], side: true, name: 'Hæløft på ét ben' },
        { id: 'pt-planke', sets: 3, hold: [40, 60] },
        { id: 'nakke-3-y-loeft', sets: 3, reps: [8, 12], name: 'Y-løft (ryg og skuldre)' }
      ] }
    ]
  }
];

/* Velkomstspørgsmål til PT-klienter. Ingen navn og ingen alder. Svarene bliver på telefonen. */
const PT_QUESTIONS = [
  { id: 'maal', type: 'multi', t: 'Hvad vil du gerne opnå?', h: 'Vælg gerne flere.', opts: [
    ['styrke', 'Blive stærkere'], ['kondition', 'Bedre kondition'], ['vaegt', 'Tabe fedt / ændre kropsform'], ['energi', 'Mere energi i hverdagen'],
    ['sport', 'Træne op til en sport eller aktivitet'], ['tilbage', 'Komme i gang igen efter en pause'] ] },
  { id: 'erfaring', type: 'one', t: 'Hvor meget har du trænet styrke før?', opts: [
    ['ny', 'Næsten aldrig'], ['pause', 'Jeg har trænet før, men ikke det sidste halve år'], ['fast', 'Jeg træner jævnligt nu'] ] },
  { id: 'dage', type: 'one', t: 'Hvor mange dage om ugen kan du træne?', opts: [['2', '2 dage'], ['3', '3 dage'], ['4', '4 dage eller flere']] },
  { id: 'tid', type: 'one', t: 'Hvor lang tid har du hver gang?', opts: [['20', 'Ca. 20 min'], ['30', 'Ca. 30 min'], ['45', '45 min eller mere']] },
  { id: 'helbred', type: 'multi', t: 'Sikkerhedstjek: Gælder noget af dette for dig?', h: 'Vælg det, der passer. Vælg "Nej, intet af det", hvis intet passer.', none: 'Nej, intet af det', flag: true, opts: [
    ['hjerte', 'En læge har sagt, at jeg har en hjertesygdom eller kun må træne under opsyn'], ['bryst', 'Jeg får smerter i brystet, når jeg er fysisk aktiv'],
    ['svimmel', 'Jeg er blevet svimmel, så jeg mistede balancen, eller jeg er besvimet inden for det sidste år'], ['blodtryk', 'Jeg tager medicin for blodtryk eller hjerte'],
    ['gravid', 'Jeg er gravid eller har født inden for det sidste halve år'], ['led', 'Jeg har et led- eller knogleproblem, der bliver værre af aktivitet'] ] },
  { id: 'smerte', type: 'multi', t: 'Har du ondt et sted lige nu?', h: 'Så kan vi foreslå genoptræningsøvelser, der passer til.', none: 'Nej', opts: [
    ['knae', 'Knæ'], ['hofte', 'Hofte'], ['laend', 'Lænd'], ['nakke', 'Nakke'], ['skulder', 'Skulder'], ['ankel', 'Ankel'], ['fod', 'Fod eller hæl'] ] },
  { id: 'tryghed', type: 'scale', t: 'Hvor tryg er du ved at træne på egen hånd?', min: 0, max: 10, lo: 'Slet ikke tryg', hi: 'Helt tryg' },
  { id: 'frygt', type: 'one', t: 'Er du bekymret for at få ondt eller skade dig, når du træner?', opts: [['0', 'Slet ikke'], ['1', 'Lidt'], ['2', 'En del'], ['3', 'Meget']] },
  { id: 'tiltro', type: 'scale', t: 'Hvor sikker er du på, at du kan holde fast i træningen de næste 4 uger?', min: 0, max: 10, lo: 'Slet ikke sikker', hi: 'Helt sikker' }
];
/* Prehab-forslag ud fra smerteområde (eksisterende programmer) */
const PT_PREHAB = { knae: 'knae', hofte: 'hofte', laend: 'laend', nakke: 'nakke', skulder: 'skulder', ankel: 'ankel', fod: 'fod' };
