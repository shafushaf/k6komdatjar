<script>
  import Chart from '$lib/Chart.svelte';
  import Badge from '$lib/Badge.svelte';
  let { data } = $props();
</script>
<svelte:head><title>Dashboard | AgriSupply</title></svelte:head>
<h1>Dashboard</h1>
{#if data.extra?.pending}<div class="alert warn">Ada {data.extra.pending} pembayaran menunggu verifikasi. <a href="/admin/transaksi">Periksa sekarang</a></div>{/if}
<div class="cards">{#each data.cards as c}<div class="stat"><div class="i">{c.i}</div><div><b>{c.v}</b><span>{c.t}</span></div></div>{/each}</div>
<div class="charts">{#each data.charts as c}<div class="card"><h3>{c.title}</h3><Chart type={c.type} labels={c.labels} datasets={c.datasets} /></div>{/each}</div>
{#if data.table}
  <div class="card"><h3>{data.table.title}</h3>
    {#if data.table.rows.length === 0}<div class="empty">Belum ada data.</div>{:else}
    <div class="tbl"><table><thead><tr>{#each data.table.head as h}<th>{h}</th>{/each}</tr></thead>
      <tbody>{#each data.table.rows as r}<tr>{#each r as c}<td>{#if c && typeof c === 'object'}<Badge s={c.s} />{:else}{c}{/if}</td>{/each}</tr>{/each}</tbody></table></div>{/if}
  </div>
{/if}
