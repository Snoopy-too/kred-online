(function() {
  const table = document.getElementById('events-table');
  if (!table) return;

  const rows = Array.from(table.querySelectorAll('tbody tr'));
  const pSel = document.getElementById('filter-player');
  const phSel = document.getElementById('filter-phase');
  const cSel = document.getElementById('filter-category');
  const sIn = document.getElementById('filter-search');
  const countEl = document.getElementById('filter-count');

  const uniq = (attr) => [...new Set(rows.map(r => r.dataset[attr]).filter(Boolean))].sort();
  for (const v of uniq('player')) pSel.add(new Option(v, v));
  for (const v of uniq('phase')) phSel.add(new Option(v, v));
  for (const v of uniq('category')) cSel.add(new Option(v, v));

  function applyFilters() {
    const p = pSel.value, ph = phSel.value, c = cSel.value;
    const s = sIn.value.trim().toLowerCase();
    let shown = 0;
    for (const r of rows) {
      const ok =
        (!p || r.dataset.player === p) &&
        (!ph || r.dataset.phase === ph) &&
        (!c || r.dataset.category === c) &&
        (!s || r.dataset.search.indexOf(s) !== -1);
      r.style.display = ok ? '' : 'none';
      if (ok) shown++;
    }
    countEl.textContent = `Showing ${shown} / ${rows.length}`;
  }
  [pSel, phSel, cSel].forEach(el => el.addEventListener('change', applyFilters));
  sIn.addEventListener('input', applyFilters);
  applyFilters();

  table.querySelectorAll('.diag-payload').forEach(td => {
    td.title = 'Click to toggle wrap';
    td.style.cursor = 'pointer';
    td.addEventListener('click', () => td.classList.toggle('expanded'));
  });
})();
