/* Kamera-træner: valgfri hjælp på hver øvelse. Telefonens frontkamera + MediaPipe Pose Landmarker (vendor/mediapipe,
   lokal kopi – ingen CDN). Billedet behandles kun i browseren på telefonen; intet optages, gemmes eller sendes.
   Logikken (hvad der tælles, råd, hold-ur) ligger i coach-rules.js. Stemmen er den samme som i filmene (voice.js).
   Test: window.__COACH_MOCK = t => landmarks (eller null) erstatter kamera og MediaPipe med en syntetisk strøm. */
'use strict';
const Coach = (() => {
  const MP = 'vendor/mediapipe/';
  let lmk = null, lmkP = null;
  const abs = p => new URL(p, location.href).href;
  function loadScript(src) {
    return new Promise((res, rej) => { const s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = () => rej(new Error('script')); document.head.appendChild(s); });
  }
  function getLandmarker() {
    if (lmk) return Promise.resolve(lmk);
    if (!lmkP) lmkP = (async () => {
      if (typeof Vision === 'undefined') await loadScript(MP + 'vision_bundle.js');
      const fs = await Vision.FilesetResolver.forVisionTasks(abs(MP + 'wasm'));
      const opts = d => ({ baseOptions: { modelAssetPath: abs(MP + 'pose_landmarker_lite.task'), delegate: d }, runningMode: 'VIDEO', numPoses: 1,
        minPoseDetectionConfidence: 0.5, minPosePresenceConfidence: 0.5, minTrackingConfidence: 0.5 });
      try { lmk = await Vision.PoseLandmarker.createFromOptions(fs, opts('GPU')); }
      catch (e) { lmk = await Vision.PoseLandmarker.createFromOptions(fs, opts('CPU')); }
      return lmk;
    })().catch(e => { lmkP = null; throw e; });
    return lmkP;
  }
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const mmss = s => Math.floor(s / 60) + ':' + String(Math.floor(s % 60)).padStart(2, '0');
  const KIND = { reps: 'Tæller gentagelser', hold: 'Tæller sekunder i stillingen', presence: 'Tid og tilstedeværelse' };

  function btnHtml(e) {
    if (typeof CoachRules === 'undefined') return '';
    const r = CoachRules.ruleFor(e);
    return '<div class="coach-entry"><button type="button" class="btn secondary coach-btn" id="coachBtn">📷 Kamera-træner</button>' +
      '<p class="muted small">Valgfrit. ' + KIND[r.type] + (r.type === 'presence' ? ' (kameraet kan ikke bedømme selve bevægelsen her)' : '') + '. Billedet bliver på telefonen.</p></div>';
  }
  function bind(root, e) { const b = root.querySelector('#coachBtn'); if (b) b.onclick = () => open(e); }

  /* Lille tegning: telefon på gulvet, ca. 2 m væk, og en person set fra siden/forfra/liggende */
  function setupSvg(view) {
    const ph = '<rect x="14" y="58" width="16" height="26" rx="3" fill="#2f6f6a"/><circle cx="22" cy="63" r="2" fill="#fff"/>';
    const cone = (y1, y2) => '<path d="M30,66 L150,' + y1 + ' M30,66 L150,' + y2 + '" stroke="#2f6f6a" stroke-dasharray="4 4" stroke-width="2" fill="none" opacity=".6"/>';
    const floor = '<line x1="4" y1="86" x2="236" y2="86" stroke="#b5c4bf" stroke-width="3"/>';
    const m = '<text x="88" y="80" font-size="12" fill="#2f6f6a" text-anchor="middle">ca. 2 m</text>';
    let person;
    if (view === 'lying') person = '<circle cx="152" cy="74" r="7" fill="#e2b592"/><path d="M160,78 L214,78 M188,78 L198,62 L212,78" stroke="#2f8a86" stroke-width="8" stroke-linecap="round" fill="none"/>';
    else if (view === 'front') person = '<circle cx="180" cy="14" r="8" fill="#e2b592"/><path d="M180,24 L180,54 M168,30 L192,30 M168,30 L164,52 M192,30 L196,52 M174,54 L172,85 M186,54 L188,85" stroke="#2f8a86" stroke-width="7" stroke-linecap="round" fill="none"/>';
    else person = '<circle cx="182" cy="14" r="8" fill="#e2b592"/><path d="M180,24 L180,54 L178,85 M180,30 L186,52" stroke="#2f8a86" stroke-width="7" stroke-linecap="round" fill="none"/><path d="M186,14 l6,1" stroke="#c79570" stroke-width="3"/>';
    const y = view === 'lying' ? [60, 86] : [4, 86];
    return '<svg class="coach-setup-svg" viewBox="0 0 240 92" role="img" aria-label="Telefonen står på gulvet ca. 2 meter væk og ser dig ' + esc(CoachRules.VIEW_NAME[view]) + '">' + floor + cone(y[0], y[1]) + ph + person + m + '</svg>';
  }

  function open(e) {
    const rule = CoachRules.ruleFor(e), mock = typeof window.__COACH_MOCK === 'function' ? window.__COACH_MOCK : null;
    const box = document.createElement('div');
    box.className = 'coach'; box.setAttribute('role', 'dialog'); box.setAttribute('aria-modal', 'true'); box.setAttribute('aria-label', 'Kamera-træner');
    const what = rule.what ? esc(rule.what) : 'bevægelsen';
    const kindTxt = rule.type === 'reps' ? 'Kameraet tæller dine gentagelser og giver korte råd, fx "Bøj lidt mere" eller "Langsommere".'
      : rule.type === 'hold' ? 'Kameraet tæller sekunderne, mens du holder stillingen (' + rule.seconds + ' sek. ad gangen), og siger til, hvis du kommer ud af den.'
      : 'Kameraet tæller tiden (mål: ' + mmss(rule.seconds) + ') og ser, at du er i billedet.';
    box.innerHTML = '<div class="coach-top"><h2>📷 Kamera-træner</h2><button type="button" class="btn small secondary coach-x">Luk</button></div>' +
      '<section class="coach-intro"><p class="coach-ex">' + esc(e.name) + '</p>' +
      '<div class="card coach-setup">' + setupSvg(rule.view) + '<p><b>Sådan stiller du telefonen</b><br>' + esc(CoachRules.SETUP[rule.view]) + '</p></div>' +
      '<p class="coach-kind">' + kindTxt + '</p>' +
      (rule.type === 'presence' ? '<p class="coach-honest">ℹ️ <b>Ærligt svar:</b> Ved denne øvelse kan kameraet ikke se ' + what + ' sikkert nok til at bedømme den. Det tjekker kun, at du er i billedet, tæller tiden og opmuntrer dig. Følg filmen og din egen fornemmelse.</p>' : '') +
      '<div class="card coach-privacy"><b>🔒 Dit billede bliver på telefonen</b><ul>' +
      '<li>Billedet behandles kun på din telefon. Intet bliver optaget, gemt eller sendt.</li>' +
      '<li>Kameraet er kun tændt, mens denne side er åben. Tryk "Stop" for at slukke det.</li>' +
      '<li>Telefonen spørger om lov til at bruge kameraet. Tryk "Tillad".</li></ul></div>' +
      '<button type="button" class="btn coach-start">▶ Start kameraet</button>' +
      '<p class="muted small">Første gang hentes kamera-træneren (ca. 31 MB – brug gerne wifi). Derefter virker den også uden internet.</p></section>' +
      '<section class="coach-live" hidden><div class="coach-stage"><video playsinline muted autoplay></video><canvas></canvas><div class="coach-load">Starter kameraet …</div></div>' +
      '<div class="coach-hud"><div class="coach-count"><span class="cc-num">0</span><span class="cc-lbl"></span></div>' +
      '<div class="coach-bar" aria-hidden="true"><i></i></div><p class="coach-msg" aria-live="polite"></p>' +
      (rule.type === 'presence' ? '<p class="coach-honest small">Kameraet kan ikke bedømme selve bevægelsen her – kun tid og om du er i billedet.</p>' : '') +
      '<p class="ff-say" hidden></p></div>' +
      '<div class="coach-btns">' + (typeof Voice !== 'undefined' ? Voice.btnHtml() : '') + '<button type="button" class="btn coach-stop">■ Stop</button></div></section>' +
      '<section class="coach-done" hidden><h3>Godt gået!</h3><p class="coach-sum"></p><button type="button" class="btn coach-mark">✓ Markér som lavet i dag</button><button type="button" class="btn secondary coach-close">Luk</button></section>';
    document.body.appendChild(box); document.body.classList.add('noscroll');
    if (typeof Voice !== 'undefined') { Voice.bind(box); Voice.preload(CoachRules.PHRASES.concat(Array.from({ length: 30 }, (_, i) => String(i + 1)))); }
    const $ = s => box.querySelector(s);
    let stream = null, raf = 0, alive = false, tracker = null, last = null, t0 = 0, lastVT = -1, frames = 0;
    const video = $('video'), canvas = $('canvas'), g = canvas.getContext('2d');
    function stopCam() {
      alive = false; cancelAnimationFrame(raf);
      if (stream) { stream.getTracks().forEach(t => t.stop()); stream = null; }
      try { video.srcObject = null; } catch (err) { /* ignore */ }
      if (typeof Voice !== 'undefined') Voice.cancel();
    }
    function close() { stopCam(); box.remove(); document.body.classList.remove('noscroll'); window.removeEventListener('hashchange', close); document.removeEventListener('visibilitychange', onVis); }
    const onVis = () => { if (document.hidden && alive) finish(); };
    window.addEventListener('hashchange', close); document.addEventListener('visibilitychange', onVis);
    $('.coach-x').onclick = close; $('.coach-close').onclick = close;
    $('.coach-mark').onclick = () => { close(); const d = document.getElementById('doneBtn'); if (d && !d.classList.contains('done')) d.click(); };
    $('.coach-stop').onclick = finish;
    function say(txt) { if (txt && typeof Voice !== 'undefined') Voice.say(txt, box, { flush: true }); else { const c = $('.ff-say'); if (c && txt) { c.textContent = '🔈 ' + txt; c.hidden = false; } } }
    function fail(msg) { stopCam(); $('.coach-load').hidden = false; $('.coach-load').innerHTML = '<b>Det lykkedes ikke</b><br>' + msg; }
    function finish() {
      const s = last || { reps: 0, timeSec: 0 };
      stopCam(); say('Kameraet er slukket');
      $('.coach-live').hidden = true; $('.coach-done').hidden = false;
      $('.coach-sum').textContent = rule.type === 'reps' ? 'Kameraet talte ' + s.reps + ' ' + (s.reps === 1 ? 'gentagelse' : 'gentagelser') + '.'
        : rule.type === 'hold' ? 'Du holdt stillingen ' + s.reps + ' ' + (s.reps === 1 ? 'gang' : 'gange') + ' (' + rule.seconds + ' sek. hver).'
        : 'Du trænede i ' + mmss(s.timeSec || 0) + ' med kameraet.';
      const d = document.getElementById('doneBtn'); if (d && d.classList.contains('done')) $('.coach-mark').hidden = true;
    }
    function draw(lm, s) {
      const W = canvas.width, H = canvas.height;
      g.clearRect(0, 0, W, H);
      if (mock) { const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#3a4652'); gr.addColorStop(1, '#1f262d'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
        g.fillStyle = 'rgba(255,255,255,.35)'; g.font = '22px sans-serif'; g.fillText('Testbillede (ingen kamera)', 18, 34); }
      if (!lm) return;
      const ok = p => (p.visibility == null ? 1 : p.visibility) > 0.4;
      g.lineCap = 'round'; g.lineWidth = Math.max(4, W / 110); g.strokeStyle = s.present ? '#7fe0c8' : '#f2b544';
      for (const [a, b] of CoachRules.BONES) { const A = lm[a], B = lm[b]; if (A && B && ok(A) && ok(B)) { g.beginPath(); g.moveTo(A.x * W, A.y * H); g.lineTo(B.x * W, B.y * H); g.stroke(); } }
      g.fillStyle = '#ffffff';
      for (const i of [0, 11, 12, 13, 14, 15, 16, 23, 24, 25, 26, 27, 28]) { const p = lm[i]; if (p && ok(p)) { g.beginPath(); g.arc(p.x * W, p.y * H, Math.max(4, W / 120), 0, 7); g.fill(); } }
    }
    function hud(s) {
      const num = $('.cc-num'), lbl = $('.cc-lbl'), bar = $('.coach-bar i'), msg = $('.coach-msg');
      if (rule.type === 'reps') { num.textContent = s.reps; lbl.textContent = s.reps === 1 ? 'gentagelse' : 'gentagelser'; bar.style.width = Math.round(Math.min(1, s.progress || 0) * 100) + '%'; bar.parentNode.hidden = false; }
      else if (rule.type === 'hold') {
        if (s.phase === 'rest') { num.textContent = Math.ceil(s.restLeft); lbl.textContent = 'sek. hvil · holdt ' + s.reps + ' ' + (s.reps === 1 ? 'gang' : 'gange'); }
        else { num.textContent = Math.floor(s.holdSec || 0); lbl.textContent = 'af ' + s.target + ' sek. i stillingen' + (s.reps ? ' · holdt ' + s.reps + ' ' + (s.reps === 1 ? 'gang' : 'gange') : ''); }
        bar.style.width = Math.round(Math.min(1, (s.holdSec || 0) / s.target) * 100) + '%';
      } else { num.textContent = mmss(s.timeSec || 0); lbl.textContent = 'af ' + mmss(s.target) + (s.present ? (s.moving ? ' · du bevæger dig' : ' · du er stille') : ''); bar.style.width = Math.round(Math.min(1, (s.timeSec || 0) / s.target) * 100) + '%'; }
      const m = !s.present ? 'Jeg kan ikke se dig. ' + CoachRules.SETUP[rule.view] : ((s.say && !/^\d+$/.test(s.say) ? s.say : '') || msg.dataset.keep || (rule.type === 'hold' && s.phase === 'wait' ? 'Gå i stillingen – så starter uret.' : ''));
      if (s.say && !/^\d+$/.test(s.say)) msg.dataset.keep = s.say;
      msg.textContent = m; box.classList.toggle('coach-lost', !s.present);
    }
    function tick(now) {
      if (!alive) return;
      const t = (now - t0) / 1000;
      let lm = null, fresh = false;
      if (mock) { lm = mock(t); fresh = true; }
      else if (video.readyState >= 2 && video.currentTime !== lastVT) {
        lastVT = video.currentTime; fresh = true;
        try { const r = lmk.detectForVideo(video, now); lm = r && r.landmarks && r.landmarks[0] ? r.landmarks[0] : null; } catch (err) { lm = null; }
      }
      if (fresh) {
        frames++; box.dataset.frames = frames;
        const s = tracker.update(lm, t); last = s;
        draw(lm, s); hud(s);
        if (s.say) say(s.say);
      }
      raf = requestAnimationFrame(tick);
    }
    $('.coach-start').onclick = async () => {
      $('.coach-intro').hidden = true; $('.coach-live').hidden = false;
      if (typeof Voice !== 'undefined') Voice.unlock();
      tracker = CoachRules.makeTracker(rule);
      try {
        if (mock) { canvas.width = 640; canvas.height = 480; video.hidden = true; box.classList.add('coach-mock'); }
        else {
          if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) { fail('Kameraet kan kun bruges, når appen er åbnet via en sikker forbindelse (https), fx fra GitHub Pages.'); return; }
          $('.coach-load').textContent = 'Starter kameraet …';
          stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } }, audio: false });
          if (!box.isConnected) { stopCam(); return; }
          video.srcObject = stream; await video.play().catch(() => {});
          $('.coach-load').textContent = 'Henter bevægelses-genkendelsen …';
          await getLandmarker();
          if (!box.isConnected || !stream) { stopCam(); return; }
          canvas.width = video.videoWidth || 640; canvas.height = video.videoHeight || 480;
        }
      } catch (err) {
        const n = err && err.name;
        if (n === 'NotAllowedError' || n === 'SecurityError') fail('Kameraet fik ikke lov. På iPhone: Indstillinger › Safari › Kamera › Tillad. På Android: tryk på hængelåsen ved adressen › Tilladelser › Kamera.');
        else if (n === 'NotFoundError' || n === 'OverconstrainedError') fail('Der blev ikke fundet et kamera på denne enhed.');
        else if (n === 'NotReadableError') fail('Kameraet bruges af en anden app. Luk den, og prøv igen.');
        else fail('Kamera-træneren kunne ikke hentes. Første gang skal telefonen have internet (ca. 31 MB). Prøv igen, gerne på wifi.');
        return;
      }
      $('.coach-load').hidden = true; box.classList.add('coach-running');
      alive = true; t0 = performance.now(); raf = requestAnimationFrame(tick);
    };
  }
  return { btnHtml, bind, open, getLandmarker };
})();
