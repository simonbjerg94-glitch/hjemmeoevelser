/* Stemme til tempo-filmene og kamera-træneren.
   1) Først forsøges forud-indtalte lydklip (audio/*.mp3, neural dansk stemme "Christel"), lavet med tools/make_voice.py.
      Klippene afspilles med Web Audio (eller <audio> på ældre browsere) og ligger i service workeren, så de virker offline.
      På iPhone låses lyden op ved første tryk (fx "Afspil filmen").
   2) Mangler et klip (fx en øvelse, du selv har rettet), bruges browserens talesyntese (speechSynthesis, da-DK).
   3) Findes ingen af delene, vises ordene som tekst i filmen.
   Til/fra gemmes lokalt (hjo_stemme_v1). Standard: TIL. */
'use strict';
const Voice = (() => {
  const KEY = 'hjo_stemme_v1', BASE = 'audio/';
  const W = typeof window !== 'undefined' ? window : {};
  const CLIPS = () => (typeof VOICE_CLIPS !== 'undefined' ? VOICE_CLIPS : (W.VOICE_CLIPS || {}));
  const synth = () => W.speechSynthesis || null;
  const log = [];                                 // til test: { text, via: 'clip' | 'tts' | 'text' }
  let daVoice = null;
  function findVoice() {
    const s = synth(); if (!s || typeof s.getVoices !== 'function') return null;
    daVoice = (s.getVoices() || []).find(v => /^da([-_]|$)/i.test(v.lang || '')) || null;
    return daVoice;
  }
  if (synth() && 'onvoiceschanged' in synth()) { try { synth().addEventListener('voiceschanged', findVoice); } catch (e) { /* ældre browsere */ } }

  /* Samme normalisering som i tools/make_voice.py */
  const norm = t => String(t || '').toLowerCase().replace(/[“”"«»]/g, '').replace(/\s+/g, ' ').trim().replace(/[\s.!?…,:;]+$/, '');
  const clipOf = t => CLIPS()[norm(t)] || null;  // → [fil, varighed]
  /* Tekst → liste af klip. "Hold... 10" → ["Hold", "10"]. null, hvis et stykke mangler. */
  function clipsFor(text) {
    const c = clipOf(text); if (c) return [c];
    const parts = String(text).split(/\.\.\.\s*/).filter(p => p.trim());
    if (parts.length < 2) return null;
    const cs = parts.map(clipOf);
    return cs.every(Boolean) ? cs : null;
  }

  /* ---------- Lydmotor ---------- */
  let ctx = null, gen = 0;
  const bufs = new Map(), playing = new Set();
  const AC = () => W.AudioContext || W.webkitAudioContext || null;
  const canClip = () => !!AC() || typeof W.Audio === 'function';
  function actx() { if (!ctx && AC()) { try { ctx = new (AC())(); } catch (e) { ctx = null; } } return ctx; }
  function unlock() {                              // iOS: lyd skal startes i et tryk
    const c = actx(); if (!c) return;
    try { if (c.state === 'suspended') c.resume(); const b = c.createBuffer(1, 1, 22050), s = c.createBufferSource(); s.buffer = b; s.connect(c.destination); s.start(0); } catch (e) { /* ignore */ }
  }
  if (typeof document !== 'undefined') ['pointerdown', 'touchend', 'keydown'].forEach(ev => document.addEventListener(ev, unlock, { passive: true }));
  function load(file) {
    if (bufs.has(file)) return bufs.get(file);
    const c = actx();
    const p = !c ? Promise.resolve(null) : fetch(BASE + file).then(r => { if (!r.ok) throw new Error(r.status); return r.arrayBuffer(); })
      .then(ab => new Promise((res, rej) => { const q = c.decodeAudioData(ab, res, rej); if (q && q.then) q.then(res, rej); }))
      .catch(() => { bufs.delete(file); return null; });
    bufs.set(file, p); return p;
  }
  function preload(texts) { if (!canClip() || !enabled()) return; texts.forEach(t => (clipsFor(t) || []).forEach(c => load(c[0]))); }
  function stopAll() { gen++; playing.forEach(s => { try { s.stop ? s.stop() : s.pause(); } catch (e) { /* ignore */ } }); playing.clear(); }
  /* Afspil klip efter hinanden. onend kaldes altid (også ved fejl eller afbrydelse), dog højst én gang. */
  function playClips(list, onend) {
    const my = gen; let i = 0, done = false;
    const total = list.reduce((s, c) => s + (c[1] || 1), 0);
    const fin = () => { if (!done) { done = true; if (onend) onend(); } };
    const guard = setTimeout(fin, (total + 2.5) * 1000); // sikkerhedsnet, hvis lyden er låst
    const next = () => {
      if (my !== gen) { clearTimeout(guard); fin(); return; }
      if (i >= list.length) { clearTimeout(guard); fin(); return; }
      const [file] = list[i++], c = actx();
      if (c) {
        load(file).then(buf => {
          if (my !== gen) { clearTimeout(guard); fin(); return; }
          if (!buf) { next(); return; }
          if (c.state === 'suspended') { try { c.resume(); } catch (e) { /* ignore */ } }
          const s = c.createBufferSource(); s.buffer = buf; s.connect(c.destination);
          s.onended = () => { playing.delete(s); next(); };
          playing.add(s); s.start(0);
        });
      } else {
        const a = new W.Audio(BASE + file); playing.add(a);
        a.onended = a.onerror = () => { playing.delete(a); next(); };
        const pr = a.play(); if (pr && pr.catch) pr.catch(() => { playing.delete(a); next(); });
      }
    };
    next();
  }

  const enabled = () => localStorage.getItem(KEY) !== '0';
  function set(on) { localStorage.setItem(KEY, on ? '1' : '0'); if (!on) cancel(); if (typeof document !== 'undefined') document.querySelectorAll('.voice-btn').forEach(paintBtn); }
  const ttsAvailable = () => !!synth() && !!(daVoice || findVoice());
  const available = () => (canClip() && Object.keys(CLIPS()).length > 0) || ttsAvailable();
  const rate = () => (typeof document !== 'undefined' && document.documentElement.classList.contains('mode-enkel')) ? 0.8 : 0.88;
  function cancel() { stopAll(); const s = synth(); if (s) try { s.cancel(); } catch (e) { /* ignore */ } }

  /* Sig en tekst. Returnerer true, hvis den blev sagt højt. el: filmens kort (til tekst-ekko). */
  function say(text, el, o) {
    o = o || {};
    if (el) { const c = el.querySelector('.ff-say'); if (c) { c.textContent = text ? '🔈 ' + text : ''; c.hidden = !text; } }
    if (o.intro && el) { el._voiceBusy = true; const prev = o.onend; o.onend = () => { el._voiceBusy = false; if (prev) prev(); }; }
    const end = () => { if (o.onend) setTimeout(o.onend, 0); };
    if (!text || !enabled()) { end(); return false; }
    const list = canClip() ? clipsFor(text) : null;
    if (list) {
      if (o.flush) cancel();
      log.push({ text, via: 'clip' }); playClips(list, o.onend); return true;
    }
    if (!ttsAvailable()) { log.push({ text, via: 'text' }); if (o.onend) setTimeout(o.onend, 0); return false; }
    const s = synth(), u = new SpeechSynthesisUtterance(text);
    u.lang = 'da-DK'; if (daVoice) u.voice = daVoice; u.rate = o.rate || rate(); u.pitch = 1;
    if (o.onend) { let done = false; const fin = () => { if (!done) { done = true; o.onend(); } }; u.onend = fin; u.onerror = fin; setTimeout(fin, Math.min(15000, 1500 + text.split(/\s+/).length * 520)); }
    if (o.flush) cancel();
    log.push({ text, via: 'tts' });
    try { s.speak(u); } catch (e) { return false; }
    return true;
  }
  /* Faseord: "Op · 2" → "Op", "Ned · 3" → "Og ned", nedtælling i hold: "3", "2", "1". */
  const SAY = { 'Ned': 'Og ned', 'Op ↑': 'Op', 'Ned ↓': 'Og ned', 'Op igen': 'Op igen', 'Hvil': 'Hvil', 'Pause': 'Pause' };
  function parse(label) {
    const s = String(label || '').replace(/[↑↓↺↻]/g, '').trim();
    const m = s.match(/^(.*?)(?:\s*·\s*|\s+)(\d+)$/);
    return m ? { base: m[1].trim(), n: +m[2] } : { base: s, n: null };
  }
  /* Hvad der siges ved et fase-skift (bruges også af tools/voice_phrases.js til at finde alle sætninger) */
  function cueText(st, label, key) {
    const p = parse(label), holdish = key === 'hold' || /^hold/i.test(p.base);
    if (p.base !== st.base) {
      st.base = p.base; st.n = p.n;
      const word = SAY[p.base] || p.base;
      return { text: holdish && p.n ? word + '... ' + p.n : word, flush: true };
    } else if (p.n != null && p.n !== st.n) {
      st.n = p.n;
      if (holdish && (p.n <= 3 || p.n % 5 === 0)) return { text: String(p.n) };
    }
    return null;
  }
  /* Kaldes, hver gang fase-teksten skifter. Styrer selv, hvad der siges. */
  function cue(el, label, key) {
    if (!el) return;
    const st = el._voice || (el._voice = { base: '', n: null });
    if (el._voiceBusy) { const p = parse(label); st.base = p.base; st.n = p.n; return; }
    const c = cueText(st, label, key);
    if (c) say(c.text, el, { flush: c.flush });
  }
  /* Forvarm klippene til en film: intro + alle fase-ord og tal. */
  function preloadFilm(intro, labels) { const out = [intro]; labels.forEach(l => { const p = parse(l); out.push(SAY[p.base] || p.base); if (p.n != null) out.push(String(p.n)); }); preload(out); }
  function reset(el) { if (el) el._voice = null; cancel(); }
  function paintBtn(b) { const on = enabled(); b.setAttribute('aria-pressed', on); b.textContent = on ? '🔊 Stemme til' : '🔇 Stemme fra'; }
  function btnHtml() { return '<button type="button" class="btn small secondary voice-btn" aria-pressed="' + enabled() + '">' + (enabled() ? '🔊 Stemme til' : '🔇 Stemme fra') + '</button>'; }
  function bind(root) { (root || document).querySelectorAll('.voice-btn').forEach(b => { paintBtn(b); b.onclick = () => { set(!enabled()); if (enabled()) { unlock(); say('Stemmen er slået til.', b.closest('.ht-film, .routine, .coach')); } }; }); }
  function note() { return available() ? '' : 'Der er ingen dansk stemme på denne enhed. Ordene vises i stedet som tekst under filmen.'; }
  return { say, cue, cueText, reset, cancel, enabled, set, available, btnHtml, bind, note, parse, norm, clipsFor, preload, preloadFilm, unlock, log, KEY };
})();
if (typeof module !== 'undefined') module.exports = Voice;
