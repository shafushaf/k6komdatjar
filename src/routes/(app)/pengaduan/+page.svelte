<script>
  import { enhance } from '$app/forms';
  import Flash from '$lib/Flash.svelte';
  import Badge from '$lib/Badge.svelte';
  import { tgl } from '$lib/utils.js';
  let { data, form } = $props();
  const admin = $derived(data.profile.role === 'admin');
</script>
<h1>Pengaduan {admin ? '(semua pengguna)' : ''}</h1>
<Flash {form} />
{#if !admin}
<form class="card" method="POST" action="?/create" use:enhance style="max-width:640px;margin-bottom:20px">
  <h3>Kirim pengaduan</h3>
  <div class="grid2"><div class="field"><label for="s">Subjek</label><input id="s" name="subject" required /></div><div class="field"><label for="r">Kode pesanan (opsional)</label><input id="r" name="ref_code" placeholder="SO-… / PO-…" /></div></div>
  <div class="field"><label for="b">Isi pengaduan</label><textarea id="b" name="body" rows="4" required></textarea></div>
  <button class="btn">Kirim</button>
</form>{/if}
{#each data.items as c (c.id)}
  <div class="card" style="margin-bottom:10px">
    <div class="row"><b>{c.subject}</b><Badge s={c.status} /></div>
    <p class="muted sm" style="margin:2px 0">{tgl(c.created_at)}{c.ref_code ? ' · ' + c.ref_code : ''}{admin ? ' · ' + (data.who[c.user_id] ?? 'pengguna') : ''}</p>
    <p style="white-space:pre-wrap">{c.body}</p>
    {#if c.response}<div class="alert ok">Tanggapan admin: {c.response}</div>{/if}
    {#if admin && c.status === 'open'}<form method="POST" action="?/resolve" use:enhance class="inline"><input type="hidden" name="id" value={c.id} /><input name="response" placeholder="Tanggapan…" style="max-width:320px" /><button class="btn s">Tandai selesai</button></form>{/if}
  </div>
{:else}<div class="empty">Belum ada pengaduan.</div>{/each}
