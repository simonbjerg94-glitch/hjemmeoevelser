/* Stemme til tempo-filmene: browserens indbyggede talesyntese (speechSynthesis) med en dansk stemme (da-DK).
   Virker offline på de fleste telefoner. Findes der ingen dansk stemme, vises de samme ord som tekst i filmen.
   Til/fra gemmes lokalt (hjo_stemme_v1). Standard: TIL. Tempoet er sat ned, så det er let at følge. */
'use strict';
const Voice = (() => {
  const KEY = 'hjo_stemme_v1';
  const synth = () => (typeof window !== 'undefined' && window.speechSynthesis) || null;
  let daVoice = null, looked = false;
  function findVoice() {
    const s = synth(); if (!s || typeof s.getVoices !== 'function') return null;
    const vs = s.getVoices() || [];
    daVoice = vs.find(v => /^da([-_]|$)/i.test(v.lang || '')) || null; looked = vs.length > 0;
    return daVoice;
  }
  if (synth() && 'onvoiceschanged' in synth()) { try { synth().addEventListener('voiceschanged', findVoice); } catch (e) { /* ældre browsere */ } }
  const enabled = () => localStorage.getItem(KEY) !== '0';
  function set(on) { localStorage.setItem(KEY, on ? '1' : '0'); if (!on) cancel(); document.querySelectorAll('.voice-btn').forEach(paintBtn); }
  const available = () => !!synth() && !!(daVoice || findVoice());
  const rate = () => document.documentElement.classList.contains('mode-enkel') ? 0.8 : 0.88;
  function cancel() { const s = synth(); if (s) try { s.cancel(); } catch (e) { /* ignore */ } }
  /* Sig en tekst. Returnerer true, hvis den blev sagt højt. el: filmens kort (til tekst-ekko). */
  function say(text, el, o) {
    o = o || {};
    if (el) { const c = el.querySelector('.ff-say'); if (c) { c.textContent = text ? '🔈 ' + text : ''; c.hidden = !text; } }
    if (!text || !enabled() || !available()) { if (o.onend) setTimeout(o.onend, 0); return false; }
    const s = synth(), u = new SpeechSynthesisUtterance(text);
    u.lang = 'da-DK'; if (daVoice) u.voice = daVoice; u.rate = o.rate || rate(); u.pitch = 1;
    if (o.intro && el) { el._voiceBusy = true; const prev = o.onend; o.onend = () => { el._voiceBusy = false; if (prev) prev(); }; }
    if (o.onend) { let done = false; const fin = () => { if (!done) { done = true; o.onend(); } }; u.onend = fin; u.onerror = fin; setTimeout(fin, Math.min(15000, 1500 + text.split(/\s+/).length * 520)); }
    if (o.flush) cancel();
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
  /* Kaldes, hver gang fase-teksten skifter. Styrer selv, hvad der siges. */
  function cue(el, label, key) {
    if (!el) return;
    const st = el._voice || (el._voice = { base: '', n: null });
    const p = parse(label), holdish = key === 'hold' || /^hold/i.test(p.base);
    if (el._voiceBusy) { st.base = p.base; st.n = p.n; return; }
    if (p.base !== st.base) {
      st.base = p.base; st.n = p.n;
      const word = SAY[p.base] || p.base;
      say(holdish && p.n ? word + '... ' + p.n : word, el, { flush: true });
    } else if (p.n != null && p.n !== st.n) {
      st.n = p.n;
      if (holdish && p.n <= 3) say(String(p.n), el);
      else if (holdish && p.n % 5 === 0) say(String(p.n), el);
    }
  }
  function reset(el) { if (el) el._voice = null; cancel(); }
  function paintBtn(b) { const on = enabled(); b.setAttribute('aria-pressed', on); b.textContent = on ? '🔊 Stemme til' : '🔇 Stemme fra'; }
  function btnHtml() { return '<button type="button" class="btn small secondary voice-btn" aria-pressed="' + enabled() + '">' + (enabled() ? '🔊 Stemme til' : '🔇 Stemme fra') + '</button>'; }
  function bind(root) { (root || document).querySelectorAll('.voice-btn').forEach(b => { paintBtn(b); b.onclick = () => { set(!enabled()); if (enabled()) say('Stemmen er slået til.', b.closest('.ht-film, .routine')); }; }); }
  function note() { return available() ? '' : 'Der er ingen dansk stemme på denne enhed. Ordene vises i stedet som tekst under filmen.'; }
  return { say, cue, reset, cancel, enabled, set, available, btnHtml, bind, note, parse, KEY };
})();
if (typeof module !== 'undefined') module.exports = Voice;
