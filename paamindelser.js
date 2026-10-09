/* Påmindelser: vælg dage + tidspunkt, kalenderfil (.ics, laves lokalt), banner i appen og valgfri notifikation, mens appen er åben.
   Alt gemmes kun lokalt. Ingen server. Indlæses før app.js. */
'use strict';

const KEY_REMIND = 'hjo_paamindelser_v1';
const KEY_REMIND_HIDE = 'hjo_paamind_skjul_v1';
const KEY_REMIND_NOTIFIED = 'hjo_paamind_vist_v1';
const REMIND_DAYS = [['MO', 'Man'], ['TU', 'Tir'], ['WE', 'Ons'], ['TH', 'Tor'], ['FR', 'Fre'], ['SA', 'Lør'], ['SU', 'Søn']];

function remindSettings() {
  const d = { on: false, days: ['MO', 'WE', 'FR'], time: '17:00', notify: false, morning: false, morningTime: '07:00' };
  const s = readJson(KEY_REMIND, null);
  if (!s || typeof s !== 'object') return d;
  return {
    on: !!s.on, notify: !!s.notify, morning: !!s.morning,
    days: Array.isArray(s.days) ? s.days.filter(x => REMIND_DAYS.some(r => r[0] === x)) : d.days,
    time: /^\d{2}:\d{2}$/.test(s.time) ? s.time : d.time,
    morningTime: /^\d{2}:\d{2}$/.test(s.morningTime) ? s.morningTime : d.morningTime
  };
}
function saveRemind(s) { writeJson(KEY_REMIND, s); remindSchedule(); }
function todayCode(d) { return REMIND_DAYS[((d || new Date()).getDay() + 6) % 7][0]; }
function isTrainingDay(s, d) { return s.on && s.days.includes(todayCode(d)); }

/* Banner på forsiden: træningsdag, men ingen øvelser krydset af endnu. */
function remindBannerHtml() {
  const s = remindSettings();
  if (!isTrainingDay(s) || countDone(dateKey()) > 0 || localStorage.getItem(KEY_REMIND_HIDE) === dateKey()) return '';
  const [hh, mm] = s.time.split(':').map(Number); const now = new Date(); const late = now.getHours() * 60 + now.getMinutes() >= hh * 60 + mm;
  return '<div class="remind-banner" role="status"><span class="rb-ico" aria-hidden="true">🔔</span><div class="rb-txt"><b>' +
    (late ? 'Tid til dagens træning' : 'I dag er en træningsdag') + '</b><span>' + (late ? 'Du har ikke trænet endnu i dag. Bare én øvelse tæller.' : 'Din påmindelse er kl. ' + s.time + '. Du kan også træne nu.') + '</span></div>' +
    '<div class="rb-btns"><a class="btn small" href="#/kategori/' + lastCategory() + '" id="rbStart">Start</a><button type="button" class="btn small secondary" id="rbHide">Ikke i dag</button></div></div>';
}
function bindRemindBanner() {
  const h = document.getElementById('rbHide'); if (h) h.onclick = () => { localStorage.setItem(KEY_REMIND_HIDE, dateKey()); const b = document.querySelector('.remind-banner'); if (b) b.remove(); };
}

/* Notifikation, mens appen er åben (eller som hjemmeskærms-app, hvor telefonen tillader det). */
let _remindTimer = null;
function remindSchedule() {
  clearInterval(_remindTimer);
  const s = remindSettings();
  if (!s.on || !s.notify || !('Notification' in window)) return;
  _remindTimer = setInterval(remindCheck, 30000); remindCheck();
}
function remindCheck() {
  const s = remindSettings(); if (!s.on || !s.notify || !('Notification' in window) || Notification.permission !== 'granted') return;
  if (!isTrainingDay(s) || countDone(dateKey()) > 0 || localStorage.getItem(KEY_REMIND_NOTIFIED) === dateKey()) return;
  const [hh, mm] = s.time.split(':').map(Number); const now = new Date();
  if (now.getHours() * 60 + now.getMinutes() < hh * 60 + mm) return;
  localStorage.setItem(KEY_REMIND_NOTIFIED, dateKey());
  remindNotify('Tid til dagens træning', 'Du har ikke trænet i dag endnu. Bare én øvelse tæller.');
}
function remindNotify(title, body) {
  const opts = { body, icon: 'icons/icon-192.png', badge: 'icons/icon-192.png', tag: 'hjemmeoevelser-paamindelse', lang: 'da' };
  if (navigator.serviceWorker && navigator.serviceWorker.ready) {
    return navigator.serviceWorker.getRegistration().then(r => r ? r.showNotification(title, opts) : new Notification(title, opts)).catch(() => { try { new Notification(title, opts); } catch (e) { /* */ } });
  }
  try { new Notification(title, opts); } catch (e) { /* ikke understøttet */ }
  return Promise.resolve();
}

/* ---------- Kalenderfil (.ics) – laves på telefonen, ingen server ---------- */
function icsEsc(s) { return String(s).replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n'); }
function icsFold(line) { const out = []; let s = line; while (s.length > 74) { out.push(s.slice(0, 74)); s = ' ' + s.slice(74); } out.push(s); return out.join('\r\n'); }
function icsDate(d, hh, mm) { return d.getFullYear() + String(d.getMonth() + 1).padStart(2, '0') + String(d.getDate()).padStart(2, '0') + 'T' + String(hh).padStart(2, '0') + String(mm).padStart(2, '0') + '00'; }
function icsStamp() { return new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+Z$/, 'Z'); }
function nextOccurrence(days, hh, mm) {
  for (let i = 0; i < 8; i++) { const d = addDays(new Date(), i); if (days.includes(todayCode(d))) { if (i > 0 || new Date().getHours() * 60 + new Date().getMinutes() < hh * 60 + mm) return d; } }
  return addDays(new Date(), 7);
}
function icsEvent(uid, days, time, summary, desc, minutes) {
  const [hh, mm] = time.split(':').map(Number); const start = nextOccurrence(days, hh, mm);
  const order = REMIND_DAYS.map(r => r[0]).filter(x => days.includes(x));
  return ['BEGIN:VEVENT', 'UID:' + uid, 'DTSTAMP:' + icsStamp(),
    'DTSTART;TZID=Europe/Copenhagen:' + icsDate(start, hh, mm), 'DURATION:PT' + minutes + 'M',
    'RRULE:FREQ=WEEKLY;BYDAY=' + order.join(','),
    'SUMMARY:' + icsEsc(summary), 'DESCRIPTION:' + icsEsc(desc), 'TRANSP:TRANSPARENT',
    'BEGIN:VALARM', 'ACTION:DISPLAY', 'DESCRIPTION:' + icsEsc(summary), 'TRIGGER:PT0M', 'END:VALARM', 'END:VEVENT'];
}
function buildIcs(s) {
  const rnd = () => Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10);
  const tz = ['BEGIN:VTIMEZONE', 'TZID:Europe/Copenhagen',
    'BEGIN:DAYLIGHT', 'TZOFFSETFROM:+0100', 'TZOFFSETTO:+0200', 'TZNAME:CEST', 'DTSTART:19700329T020000', 'RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU', 'END:DAYLIGHT',
    'BEGIN:STANDARD', 'TZOFFSETFROM:+0200', 'TZOFFSETTO:+0100', 'TZNAME:CET', 'DTSTART:19701025T030000', 'RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU', 'END:STANDARD', 'END:VTIMEZONE'];
  let lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Hjemmeoevelser//Paamindelse//DA', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH'].concat(tz);
  lines = lines.concat(icsEvent(rnd() + '@hjemmeoevelser.local', s.days, s.time, 'Hjemmeøvelser – tid til træning',
    'Åbn Hjemmeøvelser-appen og lav dagens øvelser. Bare én øvelse tæller.', 20));
  if (s.morning) lines = lines.concat(icsEvent(rnd() + '@hjemmeoevelser.local', REMIND_DAYS.map(r => r[0]), s.morningTime, 'Hælspore: morgenrutine før første skridt',
    'Stræk fodsålen på sengekanten, før du står op (2 minutter). Se Morgenrutine i appen.', 5));
  lines.push('END:VCALENDAR');
  return lines.map(icsFold).join('\r\n') + '\r\n';
}
function downloadIcs(s) {
  if (!s.days.length) { toast('Vælg mindst én dag.'); return; }
  const url = URL.createObjectURL(new Blob([buildIcs(s)], { type: 'text/calendar;charset=utf-8' }));
  const a = document.createElement('a'); a.href = url; a.download = 'hjemmeoevelser-paamindelse.ics';
  document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 4000);
  toast('Kalenderfilen er hentet. Åbn den for at tilføje påmindelsen.');
}

/* ---------- Indstillinger ---------- */
function viewReminders() {
  setHeader('Påmindelser', '#/mere'); setTab('mere');
  const s = remindSettings(); const notifOk = 'Notification' in window; const perm = notifOk ? Notification.permission : 'unsupported';
  let h = '<div class="card"><div class="row-between switch-row"><label for="rOn" class="sw-lbl">🔔 Påmindelser</label>' +
    '<button type="button" role="switch" id="rOn" class="switch' + (s.on ? ' on' : '') + '" aria-checked="' + s.on + '"><span></span></button></div>' +
    '<p class="muted small" style="margin:6px 0 0">' + (s.on ? 'Slået til.' : 'Slået fra. Slå til for at vælge dage og tidspunkt.') + '</p></div>';
  h += '<fieldset class="card remind-set"' + (s.on ? '' : ' disabled') + '><legend class="sr">Indstillinger for påmindelser</legend>' +
    '<p class="lbl">Hvilke dage vil du træne?</p><div class="day-chips">' + REMIND_DAYS.map(([c, n]) =>
      '<button type="button" class="chip' + (s.days.includes(c) ? ' on' : '') + '" data-day="' + c + '" aria-pressed="' + s.days.includes(c) + '">' + n + '</button>').join('') + '</div>' +
    '<label for="rTime">Tidspunkt</label><input type="time" id="rTime" value="' + s.time + '">' +
    (HAEL_ON ? '<label class="check-row"><input type="checkbox" id="rMorning"' + (s.morning ? ' checked' : '') + '><span>Hælspore: også morgenrutinen hver morgen kl. <input type="time" id="rMTime" value="' + s.morningTime + '" class="inline-time"></span></label>' : '') +
    '</fieldset>';
  h += '<div class="card"><h3>📅 Påmindelse i din kalender</h3><p class="small">Den sikreste påmindelse. Appen laver en kalenderfil med en gentagen aftale og en alarm på de valgte dage. Filen laves her på telefonen og sendes ingen steder hen.</p>' +
    '<button type="button" class="btn" id="rIcs"' + (s.on ? '' : ' disabled') + '>📅 Tilføj til kalender</button>' +
    '<p class="hint">Åbn den hentede fil, og vælg "Tilføj" i kalenderen. Ændrer du dage eller tidspunkt, så slet den gamle aftale i kalenderen og tilføj en ny.</p></div>';
  h += '<div class="card"><h3>📱 Påmindelse i appen</h3><p class="small">Når du åbner appen på en træningsdag, hvor du ikke har trænet endnu, viser forsiden en påmindelse.</p>' +
    '<label class="check-row"><input type="checkbox" id="rNotify"' + (s.notify ? ' checked' : '') + (s.on && notifOk ? '' : ' disabled') + '><span>Vis også en notifikation på tidspunktet, mens appen er åben</span></label>' +
    '<p class="hint">' + (notifOk ? (perm === 'denied' ? 'Notifikationer er blokeret i browserens indstillinger.' : perm === 'granted' ? 'Notifikationer er tilladt.' : 'Telefonen spørger om lov første gang.') : 'Din browser understøtter ikke notifikationer.') + '</p>' +
    '<div class="honest"><b>Ærligt talt:</b> Telefoner sender ikke pålideligt besked fra en web-app, der er lukket. Notifikationen virker kun, mens appen er åben (på iPhone kun, når appen er lagt på hjemmeskærmen). Brug kalenderpåmindelsen, hvis du vil være sikker på at blive mindet om det.</div>' +
    (s.on && s.notify && perm === 'granted' ? '<button type="button" class="btn secondary" id="rTest">Send en prøve-notifikation</button>' : '') + '</div>';
  $app.innerHTML = h;
  const cur = () => remindSettings();
  document.getElementById('rOn').onclick = () => { const x = cur(); x.on = !x.on; saveRemind(x); toast(x.on ? 'Påmindelser er slået til.' : 'Påmindelser er slået fra.'); viewReminders(); };
  $app.querySelectorAll('[data-day]').forEach(b => b.onclick = () => { const x = cur(); const i = x.days.indexOf(b.dataset.day); if (i >= 0) x.days.splice(i, 1); else x.days.push(b.dataset.day); saveRemind(x); viewReminders(); });
  document.getElementById('rTime').onchange = ev => { const x = cur(); if (/^\d{2}:\d{2}$/.test(ev.target.value)) { x.time = ev.target.value; saveRemind(x); toast('Tidspunkt gemt: ' + x.time); } };
  const rm = document.getElementById('rMorning'); if (rm) rm.onchange = () => { const x = cur(); x.morning = rm.checked; saveRemind(x); };
  const rmt = document.getElementById('rMTime'); if (rmt) rmt.onchange = () => { const x = cur(); if (/^\d{2}:\d{2}$/.test(rmt.value)) { x.morningTime = rmt.value; saveRemind(x); } };
  document.getElementById('rIcs').onclick = () => downloadIcs(cur());
  document.getElementById('rNotify').onchange = ev => {
    const x = cur(); x.notify = ev.target.checked;
    if (x.notify && notifOk && Notification.permission === 'default') {
      Notification.requestPermission().then(p => { if (p !== 'granted') { x.notify = false; toast('Notifikationer blev ikke tilladt.'); } saveRemind(x); viewReminders(); });
      return;
    }
    saveRemind(x); viewReminders();
  };
  const t = document.getElementById('rTest'); if (t) t.onclick = () => remindNotify('Prøve: Hjemmeøvelser', 'Sådan ser din påmindelse ud.');
}
