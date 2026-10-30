<script>
  import { enhance } from '$app/forms';
  import Flash from '$lib/Flash.svelte';
  import Badge from '$lib/Badge.svelte';
  import Act from '$lib/Act.svelte';
  import { rp, kg, tgl } from '$lib/utils.js';
  let { data, form } = $props();
</script>
<svelte:head><title>Pesanan Saya | AgriSupply</title></svelte:head>
<h1>Pesanan saya</h1>
<Flash {form} />
{#each data.orders as o (o.id)}{@const s = data.ship[o.id]}{@const py = data.pay[o.id]}
  <div class="card" style="margin-bottom:12px">
    <div class="row"><div><b>{o.code}</b> · {data.who[o.supplier_id] ?? 'Supplier'}<br /><span class="muted sm">{tgl(o.created_at)}</span></div><Badge s={o.status} /></div>
    <ul style="margin:8px 0;padding-left:18px">{#each data.items[o.id] ?? [] as i}<li>{i.commodity} (grade {i.grade}): {kg(i.qty_kg)} × {rp(i.price_per_kg)}</li>{/each}</ul>
    <p class="sm" style="margin:0">Subtotal {rp(o.subtotal)} · Layanan {rp(o.platform_fee)} · Ongkir {rp(o.shipping_fee)} · <b>Total {rp(o.total)}</b></p>
    <p class="sm muted" style="margin:4px 0">Pembayaran: {#if py}<Badge s={py.status} />{:else}belum dibayar{/if} · Pengiriman: {#if s}<Badge s={s.status} /> {s.courier ?? ''} {s.tracking_no ? '· resi ' + s.tracking_no : ''}{/if}</p>
    {#if o.status === 'awaiting_payment' && (!py || py.status === 'rejected')}
      {#if py?.status === 'rejected'}<div class="alert err">Pembayaran sebelumnya ditolak admin. Kirim ulang bukti yang benar.</div>{/if}
      <details open><summary class="sm"><b>Bayar pesanan</b> (transfer bank / manual)</summary>
        <form method="POST" action="?/pay" enctype="multipart/form-data" use:enhance class="inline" style="margin-top:8px"><input type="hidden" name="id" value={o.id} />
          <input name="amount" type="number" value={o.total} readonly /><select name="method"><option value="transfer_bank">Transfer bank</option><option value="manual">Manual/tunai</option></select>
          <input name="proof" type="file" accept="image/*,application/pdf" /><button class="btn s">Kirim bukti</button></form>
        <p class="sm muted" style="margin:6px 0 0">Status baru menjadi “Paid” setelah admin memverifikasi pembayaran.</p></details>
    {/if}
    {#if py?.status === 'awaiting_verification'}<div class="alert warn">Bukti pembayaran menunggu verifikasi admin.</div>{/if}
    {#if ['pending', 'awaiting_payment'].includes(o.status) && !(py && py.status !== 'rejected')}<Act action="cancel" id={o.id} label="Batalkan" cls="btn s danger" ask="Batalkan pesanan ini?" />{/if}
    {#if o.status === 'shipped'}<Act action="receive" id={o.id} label="Konfirmasi barang diterima" ask="Barang sudah diterima dengan baik?" />{/if}
    {#if o.status === 'completed' && !data.rated[o.id]}
      <form method="POST" action="?/review" use:enhance class="inline"><input type="hidden" name="id" value={o.id} /><select name="rating"><option value="5">★★★★★</option><option value="4">★★★★</option><option value="3">★★★</option><option value="2">★★</option><option value="1">★</option></select><input name="comment" placeholder="Ulasan untuk supplier" style="max-width:260px" /><button class="btn s">Kirim ulasan</button></form>
    {:else if data.rated[o.id]}<span class="sm muted">Ulasan Anda: {'★'.repeat(data.rated[o.id])}</span>{/if}
  </div>
{:else}<div class="empty">Belum ada pesanan. <a href="/katalog">Belanja di katalog</a></div>{/each}
