// Admin UI — edits site content stored in Neon via the /api routes.
// Services / Work / Pricing are batch-saved with "Save changes".
// Reviews are moderated row-by-row (approve / unpublish / delete) and save instantly.

const SCHEMAS = {
  services: {
    label: 'Services',
    itemLabel: 'Service',
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
    label: 'Work',
    itemLabel: 'Project',
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
    label: 'Pricing',
    itemLabel: 'Tier',
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
    label: 'Logo strip',
    itemLabel: 'Logo',
    blank: { label: '' },
    fields: [
      { key: 'label', label: 'Label', type: 'text', hint: 'emoji + name, e.g. ☕ Brewhouse' }
    ]
  },
  workStats: {
    label: 'Work page · stats',
    itemLabel: 'Stat',
    blank: { value: '', label: '', color: 'blue' },
    fields: [
      { key: 'value', label: 'Figure', type: 'text', hint: 'e.g. 120+ or 4.9★' },
      { key: 'label', label: 'Label', type: 'text' },
      { key: 'color', label: 'Color', type: 'select', options: ['blue', 'coral', 'lime', 'violet'] }
    ]
  },
  cases: {
    label: 'Work page · case studies',
    itemLabel: 'Case study',
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
    label: 'Pricing page · tiers',
    itemLabel: 'Tier',
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
    label: 'Pricing page · add-ons',
    itemLabel: 'Add-on',
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
    label: 'Pricing page · FAQ',
    itemLabel: 'Question',
    blank: { question: '', answer: '' },
    fields: [
      { key: 'question', label: 'Question', type: 'text' },
      { key: 'answer', label: 'Answer', type: 'textarea' }
    ]
  }
};

const EDITABLE = Object.keys(SCHEMAS);          // services, work, pricing
const SECTIONS = [...EDITABLE, 'reviews'];       // tabs (reviews last)
let data = { services: [], work: [], pricing: [], reviews: [] };
let activeTab = SECTIONS[0];

const out = document.getElementById('out');
const tabsEl = document.getElementById('tabs');
const panelsEl = document.getElementById('panels');
const secretEl = document.getElementById('adminSecret');

function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'
  }[c]));
}
function secret() { return secretEl.value.trim(); }
function authHeaders(extra) {
  return Object.assign({ 'Authorization': 'Bearer ' + secret() }, extra || {});
}
function setStatus(msg, color) { out.style.color = color || ''; out.textContent = msg; }

// ---------- generic field editor (services / work / pricing) ----------
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
  const items = data[section] || [];
  const cards = items.map((item, idx) => {
    const fields = schema.fields.map((f) => fieldControl(section, idx, f, item[f.key])).join('');
    return `<div class="item">
      <div class="item-head">
        <strong>${esc(schema.itemLabel)} ${idx + 1}</strong>
        <button class="btn-danger" data-remove="${section}" data-idx="${idx}">Remove</button>
      </div>${fields}
    </div>`;
  }).join('');
  return `<div class="panel${section === activeTab ? ' active' : ''}" data-panel="${section}">
    ${cards || '<p class="small">No items yet.</p>'}
    <button class="btn btn-add" data-add="${section}">+ Add ${esc(schema.itemLabel)}</button>
  </div>`;
}

// ---------- reviews panel (moderation) ----------
function renderReviewsPanel() {
  const reviews = data.reviews || [];
  const cards = reviews.map((r) => {
    const live = r.approved;
    const stars = '★'.repeat(Math.max(1, Math.min(5, r.rating || 5)));
    return `<div class="item${live ? '' : ' pending'}">
      <div class="item-head">
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
  return `<div class="panel${activeTab === 'reviews' ? ' active' : ''}" data-panel="reviews">
    ${cards || '<p class="small">No reviews yet.</p>'}
    <div class="add-review">
      <strong>Add a review yourself</strong>
      <label>Name</label><input id="ar-name" />
      <label>Business / role</label><input id="ar-business" />
      <label>Review</label><textarea id="ar-text"></textarea>
      <div class="row2">
        <div><label>Rating (1–5)</label><input id="ar-rating" type="number" value="5" min="1" max="5" /></div>
        <div><label>Avatar color</label><select id="ar-color"><option>blue</option><option>coral</option><option>violet</option><option>lime</option><option>yellow</option></select></div>
      </div>
      <div style="margin-top:12px;"><button class="btn btn-primary" id="ar-add">Add review (published)</button></div>
    </div>
  </div>`;
}

function render() {
  tabsEl.innerHTML = SECTIONS.map((s) => {
    const count = (data[s] || []).length;
    const pending = s === 'reviews' ? (data.reviews || []).filter((r) => !r.approved).length : 0;
    const label = s === 'reviews' ? 'Reviews' : SCHEMAS[s].label;
    const badge = pending ? ` · ${pending} pending` : '';
    return `<button class="tab${s === activeTab ? ' active' : ''}" data-tab="${s}">${esc(label)} (${count}${badge})</button>`;
  }).join('');
  panelsEl.innerHTML = SECTIONS.map((s) =>
    s === 'reviews' ? renderReviewsPanel() : renderEditablePanel(s)
  ).join('');
}

// ---------- events ----------
tabsEl.addEventListener('click', (e) => {
  const t = e.target.closest('[data-tab]');
  if (!t) return;
  activeTab = t.dataset.tab;
  render();
});

panelsEl.addEventListener('click', (e) => {
  const add = e.target.closest('[data-add]');
  if (add) {
    const s = add.dataset.add;
    data[s].push(JSON.parse(JSON.stringify(SCHEMAS[s].blank)));
    render();
    return;
  }
  const rm = e.target.closest('[data-remove]');
  if (rm) {
    data[rm.dataset.remove].splice(Number(rm.dataset.idx), 1);
    render();
    return;
  }
  const appr = e.target.closest('[data-review-approve]');
  if (appr) {
    setReviewApproval(Number(appr.dataset.reviewApprove), appr.dataset.approved === 'true');
    return;
  }
  const del = e.target.closest('[data-review-delete]');
  if (del) {
    deleteReview(Number(del.dataset.reviewDelete));
    return;
  }
  if (e.target.id === 'ar-add') addReview();
});

panelsEl.addEventListener('input', (e) => {
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
    setStatus('Could not load content: ' + err, '#b91c1c');
    return;
  }
  // Reviews (incl. pending) require the secret.
  if (secret()) {
    try {
      const r = await fetch('/api/reviews?all=1', { headers: authHeaders() });
      if (r.status === 401) { setStatus('Content loaded. Enter the correct secret to manage reviews.', '#92590b'); data.reviews = []; }
      else { const j = await r.json(); data.reviews = j.reviews || []; setStatus('Loaded.'); }
    } catch (err) { setStatus('Reviews load failed: ' + err, '#b91c1c'); }
  } else {
    data.reviews = [];
    setStatus('Content loaded. Paste the secret and Reload to manage reviews.', '#92590b');
  }
  render();
}

async function saveChanges() {
  if (!secret()) return setStatus('Paste the admin secret first.', '#b91c1c');
  setStatus('Saving…');
  try {
    for (const section of EDITABLE) {
      const r = await fetch('/api/content', {
        method: 'POST',
        headers: authHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ section, items: data[section] })
      });
      if (r.status === 401) return setStatus('Unauthorized — check the admin secret.', '#b91c1c');
      const j = await r.json();
      if (j.error) return setStatus('⚠ ' + j.error, '#b91c1c');
    }
    setStatus('✓ Saved — live now.', '#15803d');
  } catch (err) {
    setStatus('Error: ' + err, '#b91c1c');
  }
}

async function setReviewApproval(id, approved) {
  if (!secret()) return setStatus('Paste the admin secret first.', '#b91c1c');
  try {
    const r = await fetch('/api/reviews', {
      method: 'PATCH',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ id, approved })
    });
    if (!r.ok) return setStatus('Action failed (HTTP ' + r.status + ')', '#b91c1c');
    const rev = data.reviews.find((x) => x.id === id);
    if (rev) rev.approved = approved;
    setStatus(approved ? '✓ Published.' : 'Unpublished.', '#15803d');
    render();
  } catch (err) { setStatus('Error: ' + err, '#b91c1c'); }
}

async function deleteReview(id) {
  if (!secret()) return setStatus('Paste the admin secret first.', '#b91c1c');
  try {
    const r = await fetch('/api/reviews?id=' + encodeURIComponent(id), {
      method: 'DELETE', headers: authHeaders()
    });
    if (!r.ok) return setStatus('Delete failed (HTTP ' + r.status + ')', '#b91c1c');
    data.reviews = data.reviews.filter((x) => x.id !== id);
    setStatus('Deleted.', '#15803d');
    render();
  } catch (err) { setStatus('Error: ' + err, '#b91c1c'); }
}

async function addReview() {
  if (!secret()) return setStatus('Paste the admin secret first.', '#b91c1c');
  const body = {
    name: document.getElementById('ar-name').value.trim(),
    business: document.getElementById('ar-business').value.trim(),
    text: document.getElementById('ar-text').value.trim(),
    rating: Number(document.getElementById('ar-rating').value) || 5,
    color: document.getElementById('ar-color').value
  };
  if (!body.name || !body.text) return setStatus('Name and review text are required.', '#b91c1c');
  try {
    const r = await fetch('/api/reviews', {
      method: 'POST',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(body)
    });
    const j = await r.json();
    if (j.error) return setStatus('⚠ ' + j.error, '#b91c1c');
    data.reviews.unshift({ id: j.id, approved: true, ...body });
    setStatus('✓ Review added.', '#15803d');
    render();
  } catch (err) { setStatus('Error: ' + err, '#b91c1c'); }
}

document.getElementById('refreshBtn').addEventListener('click', loadContent);
document.getElementById('saveBtn').addEventListener('click', saveChanges);

loadContent();
