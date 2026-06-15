// Admin UI — edits site content stored in Neon via the /api routes.
// Services / Work / Pricing / etc. are batch-saved with "Save changes".
// Reviews are moderated row-by-row (approve / unpublish / delete) and save instantly.

const SCHEMAS = {
  services: {
    blank: { icon: '✦', color: 'blue', title: '', description: '', linkText: 'Learn more', linkHref: '#contact' },
    fields: [
      { key: 'title', label: 'Title', type: 'text' },
      { key: 'description', label: 'Description', type: 'textarea' },
      { key: 'icon', label: 'Icon (a symbol/emoji)', type: 'text' },
      { key: 'color', label: 'Style', type: 'select', options: ['feature', 'blue', 'lime', 'coral', 'violet', 'yellow'], hint: '"feature" is the large highlighted card' },
      { key: 'linkText', label: 'Link text', type: 'text' },
      { key: 'linkHref', label: 'Link target', type: 'text', hint: 'e.g. #contact or work.html' }
    ]
  },
  work: {
    blank: { title: '', description: '', tags: [], result: '', resultLabel: '', phLabel: '', color: 'blue', stripe: true },
    fields: [
      { key: 'title', label: 'Project name', type: 'text' },
      { key: 'description', label: 'Description', type: 'textarea' },
      { key: 'tags', label: 'Tags', type: 'tags', hint: 'comma-separated, e.g. Website, Local SEO' },
      { key: 'result', label: 'Result figure', type: 'text', hint: 'e.g. +142% or 3.5×' },
      { key: 'resultLabel', label: 'Result label', type: 'text', hint: 'e.g. online orders in 90 days' },
      { key: 'phLabel', label: 'Image placeholder label', type: 'text' },
      { key: 'color', label: 'Color', type: 'select', options: ['blue', 'coral', 'lime', 'violet'] }
    ]
  },
  pricing: {
    blank: { name: '', tagline: '', price: '', per: '', terms: '', features: [], cta: 'Choose', popular: false },
    fields: [
      { key: 'name', label: 'Tier name', type: 'text' },
      { key: 'tagline', label: 'Tagline', type: 'textarea' },
      { key: 'price', label: 'Price', type: 'text', hint: 'number only, no $ — e.g. 1,200' },
      { key: 'per', label: 'Per (optional)', type: 'text', hint: 'e.g. /mo — leave blank for one-time' },
      { key: 'terms', label: 'Terms line', type: 'text', hint: 'e.g. one-time · ~2 week delivery' },
      { key: 'features', label: 'Features', type: 'list', hint: 'one per line' },
      { key: 'cta', label: 'Button text', type: 'text' },
      { key: 'popular', label: 'Mark as "Most popular"', type: 'checkbox' }
    ]
  },
  logos: {
    blank: { label: '' },
    fields: [
      { key: 'label', label: 'Label', type: 'text', hint: 'emoji + name, e.g. ☕ Brewhouse' }
    ]
  },
  workStats: {
    blank: { value: '', label: '', color: 'blue' },
    fields: [
      { key: 'value', label: 'Figure', type: 'text', hint: 'e.g. 120+ or 4.9★' },
      { key: 'label', label: 'Label', type: 'text' },
      { key: 'color', label: 'Color', type: 'select', options: ['blue', 'coral', 'lime', 'violet'] }
    ]
  },
  cases: {
    blank: { title: '', description: '', tags: [], phLabel: '', color: 'blue', results: [] },
    fields: [
      { key: 'title', label: 'Project name', type: 'text' },
      { key: 'description', label: 'Description', type: 'textarea' },
      { key: 'tags', label: 'Tags', type: 'tags', hint: 'comma-separated' },
      { key: 'phLabel', label: 'Image placeholder label', type: 'text' },
      { key: 'color', label: 'Color', type: 'select', options: ['blue', 'coral', 'lime', 'violet'] },
      { key: 'results', label: 'Results', type: 'pairs', hint: 'one per line as: figure | label  (e.g. +142% | online orders)' }
    ]
  },
  pricingPage: {
    blank: { name: '', tagline: '', price: '', per: '', terms: '', features: [], cta: 'Choose', popular: false },
    fields: [
      { key: 'name', label: 'Tier name', type: 'text' },
      { key: 'tagline', label: 'Tagline', type: 'textarea' },
      { key: 'price', label: 'Price', type: 'text', hint: 'number only, no $' },
      { key: 'per', label: 'Per (optional)', type: 'text', hint: 'e.g. /mo' },
      { key: 'terms', label: 'Terms line', type: 'text' },
      { key: 'features', label: 'Features', type: 'list', hint: 'one per line' },
      { key: 'cta', label: 'Button text', type: 'text' },
      { key: 'popular', label: 'Mark as "Most popular"', type: 'checkbox' }
    ]
  },
  addons: {
    blank: { icon: '◎', color: 'blue', title: '', description: '', price: '' },
    fields: [
      { key: 'title', label: 'Title', type: 'text' },
      { key: 'description', label: 'Description', type: 'textarea' },
      { key: 'icon', label: 'Icon (a symbol)', type: 'text' },
      { key: 'color', label: 'Icon color', type: 'select', options: ['blue', 'coral', 'lime', 'violet', 'yellow'] },
      { key: 'price', label: 'Price', type: 'text', hint: 'e.g. from $450' }
    ]
  },
  faqs: {
    blank: { question: '', answer: '' },
    fields: [
      { key: 'question', label: 'Question', type: 'text' },
      { key: 'answer', label: 'Answer', type: 'textarea' }
    ]
  }
};

// Sidebar grouping + per-section labels and helper text.
const GROUPS = [
  { label: 'Home page', sections: ['services', 'work', 'pricing', 'logos'] },
  { label: 'Work page', sections: ['workStats', 'cases'] },
  { label: 'Pricing page', sections: ['pricingPage', 'addons', 'faqs'] },
  { label: 'Reviews', sections: ['reviews'] }
];

const META = {
  services:    { nav: 'Services',     itemLabel: 'Service',    title: 'Services',                 desc: 'The "What we do" cards on the home page.' },
  work:        { nav: 'Work',         itemLabel: 'Project',    title: 'Recent work',              desc: 'The project cards in the "Recent work" grid on the home page.' },
  pricing:     { nav: 'Pricing',      itemLabel: 'Tier',       title: 'Pricing',                  desc: 'The pricing packages shown on the home page.' },
  logos:       { nav: 'Logo strip',   itemLabel: 'Logo',       title: 'Logo strip',               desc: 'The scrolling "Trusted by" brand names under the hero.' },
  workStats:   { nav: 'Stats',        itemLabel: 'Stat',       title: 'Work page · stats',        desc: 'The headline numbers in the work page hero.' },
  cases:       { nav: 'Case studies', itemLabel: 'Case study', title: 'Work page · case studies', desc: 'The detailed case studies on the work page.' },
  pricingPage: { nav: 'Tiers',        itemLabel: 'Tier',       title: 'Pricing page · tiers',     desc: 'The pricing packages on the dedicated pricing page.' },
  addons:      { nav: 'Add-ons',      itemLabel: 'Add-on',     title: 'Pricing page · add-ons',   desc: 'The optional add-on cards on the pricing page.' },
  faqs:        { nav: 'FAQ',          itemLabel: 'Question',   title: 'Pricing page · FAQ',       desc: 'The questions and answers on the pricing page.' },
  reviews:     { nav: 'Reviews',      itemLabel: 'Review',     title: 'Reviews',                  desc: 'Approve, hide, or remove customer reviews. New visitor submissions show up here as "Pending".' }
};

const DOT = {
  blue: 'var(--blue)', coral: 'var(--coral)', lime: 'var(--lime)',
  violet: 'var(--violet)', yellow: 'var(--yellow)', feature: 'var(--blue)'
};

const EDITABLE = Object.keys(SCHEMAS);
const SECTIONS = [...EDITABLE, 'reviews'];
let data = {};
let activeTab = 'services';
const openItem = {};        // section -> index of expanded item (accordion)

const out = document.getElementById('out');
const navEl = document.getElementById('nav');
const contentEl = document.getElementById('content');
const secretEl = document.getElementById('adminSecret');

function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'
  }[c]));
}
function secret() { return secretEl.value.trim(); }
function authHeaders(extra) { return Object.assign({ 'Authorization': 'Bearer ' + secret() }, extra || {}); }
function setStatus(msg, color) { out.style.color = color || ''; out.textContent = msg; }

// short title shown on a collapsed item card
function itemSummary(section, item) {
  if (section === 'logos') return item.label;
  if (section === 'workStats') return [item.value, item.label].filter(Boolean).join(' — ');
  if (section === 'faqs') return item.question;
  if (section === 'pricing' || section === 'pricingPage') return item.name;
  return item.title || item.name || item.label || '';
}

// ---------- generic field editor ----------
function fieldControl(section, idx, field, value) {
  const id = `${section}-${idx}-${field.key}`;
  const hint = field.hint ? `<span class="field-hint"> — ${esc(field.hint)}</span>` : '';
  const attrs = `id="${id}" data-section="${section}" data-idx="${idx}" data-key="${field.key}" data-type="${field.type}"`;
  if (field.type === 'textarea') {
    return `<label for="${id}">${esc(field.label)}${hint}</label><textarea ${attrs}>${esc(value)}</textarea>`;
  }
  if (field.type === 'list') {
    const text = Array.isArray(value) ? value.join('\n') : '';
    return `<label for="${id}">${esc(field.label)}${hint}</label><textarea ${attrs}>${esc(text)}</textarea>`;
  }
  if (field.type === 'pairs') {
    const text = Array.isArray(value) ? value.map((p) => `${p.value} | ${p.label}`).join('\n') : '';
    return `<label for="${id}">${esc(field.label)}${hint}</label><textarea ${attrs}>${esc(text)}</textarea>`;
  }
  if (field.type === 'tags') {
    const text = Array.isArray(value) ? value.join(', ') : '';
    return `<label for="${id}">${esc(field.label)}${hint}</label><input ${attrs} value="${esc(text)}" />`;
  }
  if (field.type === 'select') {
    const opts = field.options.map((o) => `<option${o === value ? ' selected' : ''}>${esc(o)}</option>`).join('');
    return `<label for="${id}">${esc(field.label)}${hint}</label><select ${attrs}>${opts}</select>`;
  }
  if (field.type === 'checkbox') {
    return `<div class="checkbox-field"><input type="checkbox" ${attrs}${value ? ' checked' : ''} /><label for="${id}" style="margin:0;">${esc(field.label)}</label></div>`;
  }
  const t = field.type === 'number' ? 'number' : 'text';
  return `<label for="${id}">${esc(field.label)}${hint}</label><input type="${t}" ${attrs} value="${esc(value)}" />`;
}

function renderEditablePanel(section) {
  const schema = SCHEMAS[section];
  const meta = META[section];
  const items = data[section] || [];
  const cards = items.map((item, idx) => {
    const open = openItem[section] === idx;
    const fields = schema.fields.map((f) => fieldControl(section, idx, f, item[f.key])).join('');
    const title = itemSummary(section, item);
    const dot = item.color ? `<span class="dot" style="background:${DOT[item.color] || 'var(--muted)'}"></span>` : '';
    return `<div class="item${open ? ' open' : ''}">
      <div class="item-summary" data-toggle="${section}:${idx}">
        <span class="item-num">${idx + 1}</span>
        ${dot}
        <span class="item-title">${title ? esc(title) : '<span class="empty">Untitled</span>'}</span>
        <span class="item-controls">
          <button class="iconbtn" title="Move up" data-move="up" data-section="${section}" data-idx="${idx}"${idx === 0 ? ' disabled' : ''}>↑</button>
          <button class="iconbtn" title="Move down" data-move="down" data-section="${section}" data-idx="${idx}"${idx === items.length - 1 ? ' disabled' : ''}>↓</button>
          <button class="iconbtn danger" title="Remove" data-remove="${section}" data-idx="${idx}">✕</button>
          <span class="chev">⌄</span>
        </span>
      </div>
      <div class="item-body">${fields}</div>
    </div>`;
  }).join('');
  return `<div class="section-head">
      <div><h2>${esc(meta.title)}</h2><p>${esc(meta.desc)}</p></div>
      <button class="btn btn-primary btn-sm" data-add="${section}">+ Add ${esc(meta.itemLabel)}</button>
    </div>
    ${cards || `<div class="empty-state">No items yet. Click "Add ${esc(meta.itemLabel)}" to create one.</div>`}
    ${cards ? `<button class="btn btn-add" data-add="${section}">+ Add ${esc(meta.itemLabel)}</button>` : ''}`;
}

// ---------- reviews panel (moderation) ----------
function renderReviewsPanel() {
  const meta = META.reviews;
  const reviews = data.reviews || [];
  const cards = reviews.map((r) => {
    const live = r.approved;
    const stars = '★'.repeat(Math.max(1, Math.min(5, r.rating || 5)));
    return `<div class="item review-card${live ? '' : ' pending'}">
      <div class="review-top">
        <span class="badge ${live ? 'live' : 'pending'}">${live ? 'Live' : 'Pending'}</span>
        <span class="stars-sm">${stars}</span>
      </div>
      <p class="review-text">"${esc(r.text)}"</p>
      <div class="small"><b>${esc(r.name)}</b>${r.business ? ' — ' + esc(r.business) : ''}</div>
      <div class="review-actions">
        ${live
          ? `<button class="btn btn-sm" data-review-approve="${r.id}" data-approved="false">Unpublish</button>`
          : `<button class="btn-approve" data-review-approve="${r.id}" data-approved="true">Approve</button>`}
        <button class="btn-danger" data-review-delete="${r.id}">Delete</button>
      </div>
    </div>`;
  }).join('');
  return `<div class="section-head"><div><h2>${esc(meta.title)}</h2><p>${esc(meta.desc)}</p></div></div>
    ${cards || '<div class="empty-state">No reviews yet.</div>'}
    <div class="add-review">
      <strong>Add a review yourself</strong>
      <label>Name</label><input id="ar-name" />
      <label>Business / role</label><input id="ar-business" />
      <label>Review</label><textarea id="ar-text"></textarea>
      <div class="row2">
        <div><label>Rating (1–5)</label><input id="ar-rating" type="number" value="5" min="1" max="5" /></div>
        <div><label>Avatar color</label><select id="ar-color"><option>blue</option><option>coral</option><option>violet</option><option>lime</option><option>yellow</option></select></div>
      </div>
      <div style="margin-top:14px;"><button class="btn btn-primary" id="ar-add">Add review (published)</button></div>
    </div>`;
}

function render() {
  // sidebar
  navEl.innerHTML = GROUPS.map((g) => {
    const items = g.sections.map((s) => {
      const meta = META[s];
      let count = `<span class="count">${(data[s] || []).length}</span>`;
      if (s === 'reviews') {
        const pending = (data.reviews || []).filter((r) => !r.approved).length;
        if (pending) count = `<span class="count pending">${pending} pending</span>`;
      }
      return `<button class="nav-item${s === activeTab ? ' active' : ''}" data-tab="${s}">
        <span class="nav-name">${esc(meta.nav)}</span>${count}
      </button>`;
    }).join('');
    return `<div class="nav-group"><div class="nav-group-label">${esc(g.label)}</div>${items}</div>`;
  }).join('');
  // content
  contentEl.innerHTML = activeTab === 'reviews' ? renderReviewsPanel() : renderEditablePanel(activeTab);
  contentEl.scrollTop = 0;
}

// ---------- events ----------
navEl.addEventListener('click', (e) => {
  const t = e.target.closest('[data-tab]');
  if (!t) return;
  activeTab = t.dataset.tab;
  render();
});

contentEl.addEventListener('click', (e) => {
  const add = e.target.closest('[data-add]');
  if (add) {
    const s = add.dataset.add;
    data[s] = data[s] || [];
    data[s].push(JSON.parse(JSON.stringify(SCHEMAS[s].blank)));
    openItem[s] = data[s].length - 1; // open the new one
    render();
    return;
  }
  const move = e.target.closest('[data-move]');
  if (move) {
    const s = move.dataset.section;
    const i = Number(move.dataset.idx);
    const j = move.dataset.move === 'up' ? i - 1 : i + 1;
    if (j < 0 || j >= data[s].length) return;
    [data[s][i], data[s][j]] = [data[s][j], data[s][i]];
    if (openItem[s] === i) openItem[s] = j;
    else if (openItem[s] === j) openItem[s] = i;
    render();
    return;
  }
  const rm = e.target.closest('[data-remove]');
  if (rm) {
    const s = rm.dataset.remove;
    data[s].splice(Number(rm.dataset.idx), 1);
    if (openItem[s] != null) openItem[s] = -1;
    render();
    return;
  }
  const appr = e.target.closest('[data-review-approve]');
  if (appr) { setReviewApproval(Number(appr.dataset.reviewApprove), appr.dataset.approved === 'true'); return; }
  const del = e.target.closest('[data-review-delete]');
  if (del) { deleteReview(Number(del.dataset.reviewDelete)); return; }
  if (e.target.id === 'ar-add') { addReview(); return; }
  // accordion toggle (after control buttons are ruled out)
  const summary = e.target.closest('[data-toggle]');
  if (summary) {
    const [s, idx] = summary.dataset.toggle.split(':');
    const i = Number(idx);
    openItem[s] = openItem[s] === i ? -1 : i;
    render();
  }
});

contentEl.addEventListener('input', (e) => {
  const el = e.target;
  const section = el.dataset.section;
  if (!section) return;
  const idx = Number(el.dataset.idx);
  const key = el.dataset.key;
  const type = el.dataset.type;
  let val;
  if (type === 'checkbox') val = el.checked;
  else if (type === 'number') val = Number(el.value);
  else if (type === 'tags') val = el.value.split(',').map((s) => s.trim()).filter(Boolean);
  else if (type === 'list') val = el.value.split('\n').map((s) => s.trim()).filter(Boolean);
  else if (type === 'pairs') {
    val = el.value.split('\n').map((line) => {
      const [v, ...rest] = line.split('|');
      return { value: (v || '').trim(), label: rest.join('|').trim() };
    }).filter((p) => p.value || p.label);
  }
  else val = el.value;
  data[section][idx][key] = val;
});

// ---------- API ----------
async function loadContent() {
  setStatus('Loading…');
  try {
    const r = await fetch('/api/content', { cache: 'no-store' });
    const j = await r.json();
    EDITABLE.forEach((s) => { data[s] = Array.isArray(j[s]) ? j[s] : []; });
  } catch (err) {
    setStatus('Could not load content: ' + err, 'var(--coral)');
    return;
  }
  if (secret()) {
    try {
      const r = await fetch('/api/reviews?all=1', { headers: authHeaders() });
      if (r.status === 401) { setStatus('Content loaded. Enter the correct secret to manage reviews.', 'var(--amber-ink)'); data.reviews = []; }
      else { const j = await r.json(); data.reviews = j.reviews || []; setStatus('Loaded.'); }
    } catch (err) { setStatus('Reviews load failed: ' + err, 'var(--coral)'); }
  } else {
    data.reviews = [];
    setStatus('Content loaded. Paste the secret and Reload to manage reviews.', 'var(--amber-ink)');
  }
  render();
}

async function saveChanges() {
  if (!secret()) return setStatus('Paste the admin secret first.', 'var(--coral)');
  setStatus('Saving…');
  try {
    for (const section of EDITABLE) {
      const r = await fetch('/api/content', {
        method: 'POST',
        headers: authHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ section, items: data[section] })
      });
      if (r.status === 401) return setStatus('Unauthorized — check the admin secret.', 'var(--coral)');
      const j = await r.json();
      if (j.error) return setStatus('⚠ ' + j.error, 'var(--coral)');
    }
    setStatus('✓ Saved — live now.', 'var(--lime)');
  } catch (err) {
    setStatus('Error: ' + err, 'var(--coral)');
  }
}

async function setReviewApproval(id, approved) {
  if (!secret()) return setStatus('Paste the admin secret first.', 'var(--coral)');
  try {
    const r = await fetch('/api/reviews', {
      method: 'PATCH',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ id, approved })
    });
    if (!r.ok) return setStatus('Action failed (HTTP ' + r.status + ')', 'var(--coral)');
    const rev = data.reviews.find((x) => x.id === id);
    if (rev) rev.approved = approved;
    setStatus(approved ? '✓ Published.' : 'Unpublished.', 'var(--lime)');
    render();
  } catch (err) { setStatus('Error: ' + err, 'var(--coral)'); }
}

async function deleteReview(id) {
  if (!secret()) return setStatus('Paste the admin secret first.', 'var(--coral)');
  try {
    const r = await fetch('/api/reviews?id=' + encodeURIComponent(id), { method: 'DELETE', headers: authHeaders() });
    if (!r.ok) return setStatus('Delete failed (HTTP ' + r.status + ')', 'var(--coral)');
    data.reviews = data.reviews.filter((x) => x.id !== id);
    setStatus('Deleted.', 'var(--lime)');
    render();
  } catch (err) { setStatus('Error: ' + err, 'var(--coral)'); }
}

async function addReview() {
  if (!secret()) return setStatus('Paste the admin secret first.', 'var(--coral)');
  const body = {
    name: document.getElementById('ar-name').value.trim(),
    business: document.getElementById('ar-business').value.trim(),
    text: document.getElementById('ar-text').value.trim(),
    rating: Number(document.getElementById('ar-rating').value) || 5,
    color: document.getElementById('ar-color').value
  };
  if (!body.name || !body.text) return setStatus('Name and review text are required.', 'var(--coral)');
  try {
    const r = await fetch('/api/reviews', {
      method: 'POST',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(body)
    });
    const j = await r.json();
    if (j.error) return setStatus('⚠ ' + j.error, 'var(--coral)');
    data.reviews.unshift({ id: j.id, approved: true, ...body });
    setStatus('✓ Review added.', 'var(--lime)');
    render();
  } catch (err) { setStatus('Error: ' + err, 'var(--coral)'); }
}

document.getElementById('refreshBtn').addEventListener('click', loadContent);
document.getElementById('saveBtn').addEventListener('click', saveChanges);

loadContent();
