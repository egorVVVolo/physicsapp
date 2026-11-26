// Finds labels that lie partly on a drawn body. Run it in the web version on /gallery/figs (paste into the console,
// after every figure has drawn). A label is sampled at a grid of points; a point is "on a body" when it falls inside
// a filled shape, or inside a stroke at least 6 units wide (limbs, tyres). Paper and page colours are not bodies.
// A label that lies almost wholly inside one shape is there on purpose (a mass written on a block).
// Because of that it cannot see a label lying wholly on a body: look at changed figures by eye too.
// Known and fine: the "0" at the origin of the left-strain graph (material-graphs) sits by the origin's dot.
// Also kept: "F = 82.6 N" on the longer slide touches the chute rail (12%); moving it off covers the friction arrow.
(() => {
  const probe = (css) => { const d = document.createElement('div'); d.style.color = css; document.body.appendChild(d); const c = getComputedStyle(d).color; d.remove(); return c; };
  const paper = new Set(['rgb(255, 255, 255)']);
  // the sheet's own background and the page's
  const sheet = document.querySelector('[data-testid="fig-0"] svg');
  for (let e = sheet; e; e = e.parentElement) { const c = getComputedStyle(e).backgroundColor; if (c !== 'rgba(0, 0, 0, 0)') paper.add(c); }
  const out = [];
  for (const item of document.querySelectorAll('[data-testid^="fig-"]')) {
    const where = item.firstElementChild.textContent;
    for (const svg of item.querySelectorAll('svg')) {
      const texts = [...svg.querySelectorAll('text')];
      if (!texts.length) continue;
      const shapes = [...svg.querySelectorAll('path,rect,circle,ellipse,polygon,line')].map((el) => {
        const cs = getComputedStyle(el);
        const fill = el.tagName !== 'line' && cs.fill !== 'none' && !paper.has(probe(cs.fill)) && Number(cs.fillOpacity) > 0.4 && Number(cs.opacity) > 0.4;
        const wide = cs.stroke !== 'none' && parseFloat(cs.strokeWidth) >= 6 && !paper.has(probe(cs.stroke)) && Number(cs.strokeOpacity) > 0.4;
        return fill || wide ? { el, fill, wide, m: el.getScreenCTM() } : null;
      }).filter(Boolean);
      for (const t of texts) {
        const r = t.getBoundingClientRect();
        if (!r.width || !t.textContent.trim()) continue;
        const pts = [];
        for (let i = 0; i <= 10; i++) for (let j = 1; j <= 3; j++) pts.push([r.left + (r.width * i) / 10, r.top + (r.height * j) / 4]);
        let worst = null;
        for (const s of shapes) {
          const inv = s.m && s.m.inverse();
          if (!inv) continue;
          let n = 0;
          for (const [x, y] of pts) {
            const q = new DOMPoint(x, y).matrixTransform(inv);
            if ((s.fill && s.el.isPointInFill(q)) || (s.wide && s.el.isPointInStroke(q))) n++;
          }
          const share = n / pts.length;
          if (share > 0.9) { worst = null; break; } // inside one body on purpose
          if (share > 0.08 && (!worst || share > worst.share)) worst = { share, tag: s.el.tagName, color: s.fill ? getComputedStyle(s.el).fill : getComputedStyle(s.el).stroke };
        }
        if (worst) out.push(`${where} | "${t.textContent}" ${Math.round(worst.share * 100)}% on ${worst.tag} ${worst.color}`);
      }
    }
  }
  return { found: out.length, list: out };
})()
