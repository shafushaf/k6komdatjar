<script>
  import Flash from '$lib/Flash.svelte';
  import Badge from '$lib/Badge.svelte';
  import Act from '$lib/Act.svelte';
  import { rp, kg, tgl } from '$lib/utils.js';
  let { data, form } = $props();
</script>
<svelte:head><title>Pesanan Masuk | AgriSupply</title></svelte:head>
<h1>Pesanan masuk dari supplier</h1>
<Flash {form} />
{#each data.pos as p (p.id)}
  <div class="card" style="margin-bottom:12px">
    <div class="row"><div><b>{p.commodity}</b> · {p.code}<br /><span class="muted sm">Supplier: {data.who[p.supplier_id] ?? '-'} · {tgl(p.created_at)}</span></div><Badge s={p.status} /></div>
    <p style="margin:8px 0">Dipesan <b>{kg(p.qty_kg)}</b> @ {rp(p.price_per_kg)}/kg = <b>{rp(p.qty_kg * p.price_per_kg)}</b>
      {#if p.actual_kg}<br />Hasil pemeriksaan supplier: <b>{kg(p.actual_kg)}</b>, grade {p.actual_grade} → nilai akhir <b>{rp(p.actual_kg * p.price_per_kg)}</b>{/if}</p>
    <p class="sm muted" style="margin:0 0 8px">Pembayaran: {#if data.pay[p.id]}<Badge s={data.pay[p.id].status} /> {rp(data.pay[p.id].amount)}{:else}belum dicatat supplier{/if}</p>
    {#if p.status === 'pending'}<Act action="accept" id={p.id} label="Terima" /> <Act action="reject" id={p.id} label="Tolak" cls="btn s danger" ask="Tolak pesanan ini?" />{/if}
    {#if p.status === 'confirmed'}<Act action="ship" id={p.id} label="Tandai sudah dikirim" />{/if}
    {#if p.status === 'delivered'}<Act action="approve" id={p.id} label="Setujui hasil pemeriksaan" ask="Setujui berat dan grade dari supplier?" />{/if}
  </div>
{:else}<div class="empty">Belum ada pesanan dari supplier.</div>{/each}
