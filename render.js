// ===== AlexMedia — render editable sections from data/content.json =====
// Each grid keeps its hardcoded cards as a fallback. If content.json loads,
// we replace the grid's contents with the JSON-driven cards. If the fetch
// fails or the file is missing, the original markup stays untouched.

(function () {
  const esc = (s) =>
    String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'
    }[c]));

  // Color presets that reproduce the original inline styles exactly.
  const WORK_COLORS = {
    blue: {
      ph: 'background-color:var(--blue-soft);',
      label: '',
      result: 'color:var(--blue);'
    },
    coral: {
      ph: 'background-color:var(--coral-soft);background-image:repeating-linear-gradient(135deg, oklch(0.72 0.16 25 / 0.1) 0 10px, transparent 10px 20px);',
      label: 'color:var(--coral);border-color:oklch(0.72 0.16 25 / 0.4);',
      result: 'color:var(--coral);'
    },
    lime: {
      ph: 'background-color:var(--lime-soft);background-image:repeating-linear-gradient(135deg, oklch(0.8 0.16 150 / 0.12) 0 10px, transparent 10px 20px);',
      label: 'color:oklch(0.5 0.14 150);border-color:oklch(0.8 0.16 150 / 0.5);',
      result: 'color:oklch(0.5 0.14 150);'
    },
    violet: {
      ph: 'background-color:var(--violet-soft);background-image:repeating-linear-gradient(135deg, oklch(0.64 0.18 300 / 0.1) 0 10px, transparent 10px 20px);',
      label: 'color:var(--violet);border-color:oklch(0.64 0.18 300 / 0.4);',
      result: 'color:var(--violet);'
    }
  };

  const REVIEW_AVATAR = {
    blue: 'var(--blue)', coral: 'var(--coral)', violet: 'var(--violet)',
    lime: 'oklch(0.55 0.14 150)', yellow: 'oklch(0.6 0.13 80)'
  };

  // case-study media on work.html: blue uses the default placeholder (no style).
  const CASE_COLORS = {
    blue: { ph: '', label: '', result: 'color:var(--blue);' },
    coral: {
      ph: 'background-color:var(--coral-soft);background-image:repeating-linear-gradient(135deg, oklch(0.72 0.16 25 / 0.1) 0 10px, transparent 10px 20px);',
      label: 'color:var(--coral);border-color:oklch(0.72 0.16 25 / 0.4);',
      result: 'color:var(--coral);'
    },
    lime: {
      ph: 'background-color:var(--lime-soft);background-image:repeating-linear-gradient(135deg, oklch(0.8 0.16 150 / 0.12) 0 10px, transparent 10px 20px);',
      label: 'color:oklch(0.5 0.14 150);border-color:oklch(0.8 0.16 150 / 0.5);',
      result: 'color:oklch(0.5 0.14 150);'
    },
    violet: {
      ph: 'background-color:var(--violet-soft);background-image:repeating-linear-gradient(135deg, oklch(0.64 0.18 300 / 0.1) 0 10px, transparent 10px 20px);',
      label: 'color:var(--violet);border-color:oklch(0.64 0.18 300 / 0.4);',
      result: 'color:var(--violet);'
    }
  };

  const STAT_COLORS = {
    blue: 'var(--blue)', coral: 'var(--coral)',
    lime: 'oklch(0.5 0.14 150)', violet: 'var(--violet)'
  };

  const initials = (name) =>
    String(name || '')
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((w) => w[0] || '')
      .join('')
      .toUpperCase();

  function renderServices(items) {
    return items.map((s) => {
      const href = esc(s.linkHref || '#contact');
      const link = `<a href="${href}" class="svc-link"${s.color === 'feature' ? ' style="color:#fff;"' : ''}>${esc(s.linkText || 'Learn more')} <span class="arrow">→</span></a>`;
      if (s.color === 'feature') {
        return `<div class="card svc-card feature">
          <div>
            <div class="svc-icon">${esc(s.icon)}</div>
            <h3>${esc(s.title)}</h3>
            <p>${esc(s.description)}</p>
            ${link}
          </div>
          <div class="ph"><span class="ph-label">site mockup</span></div>
        </div>`;
      }
      return `<div class="card svc-card">
        <div class="svc-icon i-${esc(s.color)}">${esc(s.icon)}</div>
        <h3>${esc(s.title)}</h3>
        <p>${esc(s.description)}</p>
        ${link}
      </div>`;
    }).join('');
  }

  function renderWork(items) {
    return items.map((w) => {
      const c = WORK_COLORS[w.color] || WORK_COLORS.blue;
      const tags = (w.tags || []).map((t) => `<span class="tag">${esc(t)}</span>`).join('');
      const labelStyle = c.label ? ` style="${c.label}"` : '';
      return `<a href="work.html" class="card work-card">
        <div class="ph" style="${c.ph}"><span class="ph-label"${labelStyle}>${esc(w.phLabel)}</span></div>
        <div class="wc-body">
          <div class="work-tags">${tags}</div>
          <h3>${esc(w.title)}</h3>
          <p>${esc(w.description)}</p>
          <div class="wc-result"><b style="${c.result}">${esc(w.result)}</b><small>${esc(w.resultLabel)}</small></div>
        </div>
      </a>`;
    }).join('');
  }

  function renderPricing(items) {
    return items.map((p) => {
      const features = (p.features || []).map((f) => `<li><span class="ck">✓</span> ${esc(f)}</li>`).join('');
      const per = p.per ? `<span class="per">${esc(p.per)}</span>` : '';
      const badge = p.popular ? '<span class="price-badge">Most popular</span>' : '';
      const btnClass = p.popular ? 'btn-primary' : 'btn-ghost';
      return `<div class="card price-card${p.popular ? ' pop' : ''}">
        ${badge}
        <h3>${esc(p.name)}</h3>
        <p class="ptag">${esc(p.tagline)}</p>
        <div class="price-amt"><span class="cur">$</span><span class="num">${esc(p.price)}</span>${per}</div>
        <p class="price-from">${esc(p.terms)}</p>
        <ul class="feat-list">${features}</ul>
        <a href="#contact" class="btn ${btnClass}">${esc(p.cta)}</a>
      </div>`;
    }).join('');
  }

  function renderReviews(items) {
    return items.map((r) => {
      const rating = Math.max(0, Math.min(5, Number(r.rating) || 5));
      const av = REVIEW_AVATAR[r.color] || REVIEW_AVATAR.blue;
      return `<div class="card testi-card">
        <div class="stars">${'★'.repeat(rating)}</div>
        <blockquote>"${esc(r.text)}"</blockquote>
        <div class="testi-author">
          <div class="av" style="background:${av};">${esc(initials(r.name))}</div>
          <div><b>${esc(r.name)}</b><small>${esc(r.business)}</small></div>
        </div>
      </div>`;
    }).join('');
  }

  function renderLogos(items) {
    const run = items.map((l) => `<span>${esc(l.label)}</span>`).join('');
    return run + run; // duplicated for the seamless scroll animation
  }

  function renderWorkStats(items) {
    return items.map((s) => {
      const color = STAT_COLORS[s.color] || STAT_COLORS.blue;
      return `<div class="hs"><b style="color:${color};">${esc(s.value)}</b><small>${esc(s.label)}</small></div>`;
    }).join('');
  }

  function renderCases(items) {
    return items.map((c) => {
      const col = CASE_COLORS[c.color] || CASE_COLORS.blue;
      const tags = (c.tags || []).map((t) => `<span class="tag">${esc(t)}</span>`).join('');
      const phStyle = col.ph ? ` style="${col.ph}"` : '';
      const labelStyle = col.label ? ` style="${col.label}"` : '';
      const results = (c.results || []).map((r) =>
        `<div class="cr"><b style="${col.result}">${esc(r.value)}</b><small>${esc(r.label)}</small></div>`
      ).join('');
      return `<article class="case">
        <div class="case-media"><div class="ph"${phStyle}><span class="ph-label"${labelStyle}>${esc(c.phLabel)}</span></div></div>
        <div>
          <div class="case-tags">${tags}</div>
          <h2>${esc(c.title)}</h2>
          <p>${esc(c.description)}</p>
          <div class="case-results">${results}</div>
          <a href="index.html#contact" class="btn btn-ghost">Start a project like this <span class="arrow">↗</span></a>
        </div>
      </article>`;
    }).join('');
  }

  function renderAddons(items) {
    return items.map((a) =>
      `<div class="card addon">
        <div class="ai i-${esc(a.color)}">${esc(a.icon)}</div>
        <h4>${esc(a.title)}</h4>
        <p>${esc(a.description)}</p>
        <div class="price">${esc(a.price)}</div>
      </div>`
    ).join('');
  }

  function renderFaqs(items) {
    return items.map((f) =>
      `<div class="faq-item">
        <button class="faq-q">${esc(f.question)}<span class="ic">+</span></button>
        <div class="faq-a"><p>${esc(f.answer)}</p></div>
      </div>`
    ).join('');
  }

  function fill(id, html) {
    const el = document.getElementById(id);
    if (el && html) el.innerHTML = html;
  }

  if (typeof document !== 'undefined') {
    fetch('/api/content', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data) return; // keep hardcoded fallback
        if (Array.isArray(data.services)) fill('svcGrid', renderServices(data.services));
        if (Array.isArray(data.work)) fill('workGrid', renderWork(data.work));
        if (Array.isArray(data.pricing)) fill('priceGrid', renderPricing(data.pricing));
        if (Array.isArray(data.reviews)) fill('testiGrid', renderReviews(data.reviews));
        if (Array.isArray(data.logos)) fill('marquee', renderLogos(data.logos));
        if (Array.isArray(data.workStats)) fill('workStats', renderWorkStats(data.workStats));
        if (Array.isArray(data.cases)) fill('casesWrap', renderCases(data.cases));
        if (Array.isArray(data.pricingPage)) fill('pricingPageGrid', renderPricing(data.pricingPage));
        if (Array.isArray(data.addons)) fill('addonGrid', renderAddons(data.addons));
        if (Array.isArray(data.faqs)) fill('faqList', renderFaqs(data.faqs));
      })
      .catch(() => { /* network/parse error — leave hardcoded markup */ });
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
      renderServices, renderWork, renderPricing, renderReviews,
      renderLogos, renderWorkStats, renderCases, renderAddons, renderFaqs
    };
  }
})();
