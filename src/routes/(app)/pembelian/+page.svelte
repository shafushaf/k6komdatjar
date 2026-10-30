<script>
  import { enhance } from '$app/forms';
  import Flash from '$lib/Flash.svelte';
  import Badge from '$lib/Badge.svelte';
  import { rp, kg, tgl } from '$lib/utils.js';
  let { data, form } = $props();
</script>
<svelte:head><title>Pembelian | AgriSupply</title></svelte:head>
<h1>Pesanan pembelian ke petani</h1>
<Flash {form} />
{#each data.pos as p (p.id)}
  {@const final = (p.actual_kg ?? p.qty_kg) * p.price_per_kg}
  <div class="card" style="margin-bottom:12px">
    <div class="row"><div><b>{p.commodity}</b> · {p.code}<br /><span class="muted sm">Petani: {data.who[p.farmer_id] ?? '-'} · {tgl(p.created_at)}</span></div><Badge s={p.status} /></div>
    <p style="margin:8px 0">{kg(p.qty_kg)} @ {rp(p.price_per_kg)}/kg {#if p.actual_kg}→ aktual <b>{kg(p.actual_kg)}</b> grade {p.actual_grade}{/if} · <b>{rp(final)}</b></p>
    <p class="sm muted" style="margin:0 0 8px">Pembayaran: {#if data.pay[p.id]}<Badge s={data.pay[p.id].status} />{:else}belum dicatat{/if}</p>
    {#if p.status === 'shipped'}
      <form method="POST" action="?/receive" use:enhance class="inline"><input type="hidden" name="id" value={p.id} />
        <input name="actual" type="number" step="0.01" min="0.01" placeholder="Berat aktual (kg)" required /><select name="grade"><option>A</option><option>B</option><option>C</option></select>
        <input name="storage" placeholder="Lokasi simpan (mis. Rak A1)" /><button class="btn s">Terima & catat pemeriksaan</button></form>
    {/if}
    {#if ['confirmed', 'shipped', 'delivered', 'completed'].includes(p.status) && !data.pay[p.id]}
      <details style="margin-top:8px"><summary class="sm"><b>Catat pembayaran ke petani</b></summary>
        <form method="POST" action="?/pay" enctype="multipart/form-data" use:enhance class="inline" style="margin-top:8px"><input type="hidden" name="id" value={p.id} />
          <input name="amount" type="number" step="1" value={final} required /><select name="method"><option value="transfer_bank">Transfer bank</option><option value="manual">Manual/tunai</option></select>
          <input name="proof" type="file" accept="image/*,application/pdf" /><button class="btn s">Kirim</button></form></details>
    {/if}
  </div>
{:else}<div class="empty">Belum ada pembelian. Buka <a href="/pasar">Pasar Panen</a>.</div>{/each}
