<script>
  import { enhance } from '$app/forms';
  import Flash from '$lib/Flash.svelte';
  import Badge from '$lib/Badge.svelte';
  import Act from '$lib/Act.svelte';
  import { rp, kg, tgl } from '$lib/utils.js';
  let { data, form } = $props();
</script>
<svelte:head><title>Pesanan Toko | AgriSupply</title></svelte:head>
<h1>Pesanan dari toko</h1>
<Flash {form} />
{#each data.orders as o (o.id)}{@const s = data.ship[o.id]}
  <div class="card" style="margin-bottom:12px">
    <div class="row"><div><b>{o.code}</b> · {data.who[o.store_id] ?? 'Toko'}<br /><span class="muted sm">{tgl(o.created_at)}</span></div><Badge s={o.status} /></div>
    <ul style="margin:8px 0;padding-left:18px">{#each data.items[o.id] ?? [] as i}<li>{i.commodity} (grade {i.grade}): {kg(i.qty_kg)} × {rp(i.price_per_kg)}</li>{/each}</ul>
    <p class="sm" style="margin:0">Subtotal {rp(o.subtotal)} · Biaya layanan {rp(o.platform_fee)} · Ongkir {rp(o.shipping_fee)} · <b>Total {rp(o.total)}</b></p>
    {#if s}<p class="sm muted" style="margin:4px 0 8px">Kirim ke: {s.recipient_name} ({s.phone}), {s.address}{#if s.courier} · {s.courier} {s.tracking_no ?? ''}{/if}</p>{/if}
    <p class="sm muted" style="margin:0 0 8px">Pembayaran: {#if data.pay[o.id]}<Badge s={data.pay[o.id].status} />{:else}belum ada{/if}</p>
    {#if o.status === 'pending'}
      <Act action="accept" id={o.id} label="Konfirmasi">{#snippet children()}<input name="fee" type="number" min="0" step="1" placeholder="Ongkir (Rp)" style="width:120px" />{/snippet}</Act>
      <Act action="reject" id={o.id} label="Tolak" cls="btn s danger" ask="Tolak pesanan ini? Stok akan dilepas." />
    {/if}
    {#if o.status === 'paid'}<Act action="process" id={o.id} label="Proses pesanan" />{/if}
    {#if o.status === 'processing'}
      <form method="POST" action="?/ship" use:enhance class="inline"><input type="hidden" name="id" value={o.id} /><input name="courier" placeholder="Kurir (JNE, dll)" required /><input name="tracking" placeholder="No. resi (opsional)" /><button class="btn s">Kirim barang</button></form>
    {/if}
  </div>
{:else}<div class="empty">Belum ada pesanan dari toko. Pastikan produk sudah dijual di <a href="/gudang">Gudang & Katalog</a>.</div>{/each}
