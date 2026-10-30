export function monthly(rows, key, fn) {
  const now = new Date();
  const b = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    b.push({ k: `${d.getFullYear()}-${d.getMonth()}`, label: d.toLocaleDateString('id-ID', { month: 'short' }), v: 0 });
  }
  for (const r of rows) {
    const d = new Date(r[key]);
    const x = b.find((y) => y.k === `${d.getFullYear()}-${d.getMonth()}`);
    if (x) x.v += fn(r);
  }
  return { labels: b.map((x) => x.label), values: b.map((x) => x.v) };
}
export const sum = (rows, fn) => rows.reduce((a, r) => a + Number(fn(r) || 0), 0);
