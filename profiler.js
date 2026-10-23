/* Træningsplaner (profiler) – v36, kompakt planbjælke v37.
   Hver plan har sine egne svar og sit eget program. Fremgang, logs, smertemålinger og mærker er FÆLLES og slettes aldrig her.
   Alt gemmes kun i localStorage på telefonen – intet sendes. Den aktive plans værdier ligger i de normale nøgler;
   de andre planers værdier ligger som en kopi i hjo_profiler_v1. */
const Profiles = (() => {
  const KEY = 'hjo_profiler_v1';
  // Nøgler, der hører til en plan (svar, valgt program, trin/niveau, hvor man var). Ikke logs.
  const SCOPED = ['hjo_maalgruppe_v1', 'hjo_pt_svar_v1', 'hjo_pt_svar_v1_kladde', 'hjo_pt_svar_skip_v1', 'hjo_pt_prog_v1', 'hjo_pt_trin_v1',
    'hjo_pt_kladde_v1', 'hjo_svar_v1', 'hjo_svar_v1_skip', 'hjo_sidst_kat_v1', 'hjo_niveau_v1'];
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const read = () => { try { const v = JSON.parse(localStorage.getItem(KEY)); return v && Array.isArray(v.list) && v.list.length ? v : null; } catch (e) { return null; } };
  const write = s => localStorage.setItem(KEY, JSON.stringify(s));
  const snapshot = () => { const d = {}; SCOPED.forEach(k => { const v = localStorage.getItem(k); if (v != null) d[k] = v; }); return d; };
  const restore = d => SCOPED.forEach(k => { if (d && d[k] != null) localStorage.setItem(k, d[k]); else localStorage.removeItem(k); });
  const newId = () => 'p' + Date.now().toString(36) + Math.floor(Math.random() * 1e4).toString(36);
  const kindName = k => k === 'patient' ? 'Genoptræning' : 'Min træning';
  // Migrering: eksisterende data bliver til første plan – intet går tabt.
  function state() {
    let s = read();
    if (!s) { const kind = localStorage.getItem('hjo_maalgruppe_v1') === 'patient' ? 'patient' : 'pt'; const id = newId(); s = { active: id, list: [{ id, name: kindName(kind), data: null }] }; write(s); }
    if (!s.list.some(p => p.id === s.active)) { s.active = s.list[0].id; write(s); }
    return s;
  }
  const list = () => state().list.map(p => ({ id: p.id, name: p.name, active: p.id === state().active }));
  const active = () => { const s = state(); return s.list.find(p => p.id === s.active); };
  function switchTo(id, noReload) {
    const s = state(); if (id === s.active || !s.list.some(p => p.id === id)) return false;
    s.list.find(p => p.id === s.active).data = snapshot();
    const t = s.list.find(p => p.id === id); restore(t.data || {}); t.data = null; s.active = id; write(s);
    if (!noReload) { location.hash = '#/'; location.reload(); }
    return true;
  }
  // Ny plan = "start forfra": tomme svar, velkomstspørgsmålene igen. Gamle planer og al fremgang bevares.
  function create(name, kind, noNav) {
    const s = state(); s.list.find(p => p.id === s.active).data = snapshot();
    const id = newId(); s.list.push({ id, name: (String(name || '').trim().slice(0, 30)) || kindName(kind), data: null }); s.active = id;
    restore({ hjo_maalgruppe_v1: kind === 'patient' ? 'patient' : 'pt' }); write(s);
    if (!noNav) { location.hash = kind === 'patient' ? '#/spoergsmaal/valg' : '#/pt/velkommen/0'; location.reload(); }
    return id;
  }
  function remove(id, noReload) {
    const s = state(); if (s.list.length < 2 || !s.list.some(p => p.id === id)) return false;
    if (id === s.active) { const other = s.list.find(p => p.id !== id); switchTo(other.id, true); }
    const s2 = state(); s2.list = s2.list.filter(p => p.id !== id); write(s2);
    if (!noReload) { location.hash = '#/'; location.reload(); }
    return true;
  }
  function rename(id, name) { const s = state(), p = s.list.find(x => x.id === id); name = String(name || '').trim().slice(0, 30); if (!p || !name) return false; p.name = name; write(s); return true; }
  // Planvælgeren på forsiden
  function barHtml() {
    const ps = list();
    return '<div class="card prof-bar" aria-label="Mine træningsplaner"><div class="prof-top"><p class="prof-h">Mine planer</p><a class="prof-manage" href="#/planer" id="profManage" aria-label="Ret eller slet planer">Ret ›</a></div><div class="prof-chips" role="tablist">' +
      ps.map(p => '<button type="button" role="tab" class="prof-chip' + (p.active ? ' sel' : '') + '" aria-selected="' + p.active + '" data-prof="' + p.id + '">' + esc(p.name) + '</button>').join('') +
      '<a class="prof-chip prof-add" href="#/planer/ny" id="profAdd">＋ Ny plan</a></div></div>';
  }
  function mount() {
    const app = document.getElementById('app'); if (!app || app.querySelector('.prof-bar')) return;
    // v37: vises altid (også med én plan og i Stor og enkel) – lige under hilsenen, over Dagens træning
    const hello = app.querySelector('section.hello'), tmp = document.createElement('div'); tmp.innerHTML = barHtml();
    const el = tmp.firstChild; if (hello) hello.after(el); else app.prepend(el);
    el.querySelectorAll('[data-prof]').forEach(b => b.onclick = () => switchTo(b.dataset.prof));
  }
  // Sider: #/planer (oversigt) og #/planer/ny
  function view(sub) {
    const app = document.getElementById('app');
    if (typeof setTab === 'function') setTab('');
    if (sub === 'ny') {
      if (typeof setHeader === 'function') setHeader('Ny plan');
      app.innerHTML = '<p class="lead">En ny plan starter forfra med velkomstspørgsmålene. Dine andre planer og al din fremgang bliver gemt.</p>' +
        '<label class="prof-label" for="profName"><b>Navn på planen</b></label><input id="profName" class="prof-input" maxlength="30" placeholder="Fx Skulder, Knæ eller Hele kroppen">' +
        '<h2>Hvad skal planen bruges til?</h2><div class="seg" role="radiogroup" aria-label="Planens type">' +
        [['pt', 'Træning'], ['patient', 'Genoptræning']].map(([k, n], i) => '<button type="button" role="radio" class="seg-b' + (i ? '' : ' sel') + '" aria-checked="' + !i + '" data-kind="' + k + '"><b>' + n + '</b></button>').join('') + '</div>' +
        '<button type="button" class="btn primary prof-go" id="profCreate">Opret plan og start spørgsmålene</button>' +
        '<a class="btn secondary prof-go" href="#/planer">Fortryd</a>';
      let kind = 'pt';
      app.querySelectorAll('[data-kind]').forEach(b => b.onclick = () => { kind = b.dataset.kind; app.querySelectorAll('[data-kind]').forEach(x => { x.classList.toggle('sel', x === b); x.setAttribute('aria-checked', x === b); }); });
      document.getElementById('profCreate').onclick = () => create(document.getElementById('profName').value, kind);
      return;
    }
    if (typeof setHeader === 'function') setHeader('Mine planer');
    const ps = list();
    app.innerHTML = '<p class="lead">Hver plan har sine egne svar og sit eget program. Fremgang og træningslog er fælles og bliver aldrig slettet her.</p>' +
      ps.map(p => '<div class="card prof-row' + (p.active ? ' sel' : '') + '"><div class="prof-row-top"><b>' + esc(p.name) + '</b>' + (p.active ? '<span class="prof-tag">I brug</span>' : '') + '</div><div class="prof-acts">' +
        (p.active ? '' : '<button type="button" class="btn small" data-use="' + p.id + '">Brug</button>') +
        '<button type="button" class="btn small secondary" data-ren="' + p.id + '">Omdøb</button>' +
        (ps.length > 1 ? '<button type="button" class="btn small danger" data-del="' + p.id + '">Slet</button>' : '') + '</div></div>').join('') +
      '<a class="card more-row" href="#/planer/ny" id="profNew"><span class="mi" aria-hidden="true">＋</span><span><b>Ny plan</b><small>Start forfra med nye spørgsmål</small></span><span class="chev">›</span></a>' +
      '<div class="modal-back prof-confirm" id="profConfirm" hidden><div class="card prof-dialog" role="dialog" aria-modal="true" aria-labelledby="profCTitle"><h2 id="profCTitle"></h2><p>Svarene og programmet i planen slettes. Din fremgang og træningslog bliver gemt.</p>' +
      '<button type="button" class="btn danger prof-go" id="profYes">Ja, slet planen</button><button type="button" class="btn secondary prof-go" id="profNo">Fortryd</button></div></div>';
    app.querySelectorAll('[data-use]').forEach(b => b.onclick = () => switchTo(b.dataset.use));
    app.querySelectorAll('[data-ren]').forEach(b => b.onclick = () => { const p = ps.find(x => x.id === b.dataset.ren); const n = prompt('Nyt navn på planen', p.name); if (n && rename(p.id, n)) view(); });
    const dlg = document.getElementById('profConfirm');
    app.querySelectorAll('[data-del]').forEach(b => b.onclick = () => { const p = ps.find(x => x.id === b.dataset.del); document.getElementById('profCTitle').textContent = 'Slet planen "' + p.name + '"?'; dlg.hidden = false; dlg.dataset.id = p.id; document.getElementById('profNo').focus(); });
    document.getElementById('profNo').onclick = () => { dlg.hidden = true; };
    document.getElementById('profYes').onclick = () => { remove(dlg.dataset.id); };
  }
  state();
  return { SCOPED, list, active, switchTo, create, remove, rename, barHtml, mount, view };
})();
