<script>
  import { enhance } from '$app/forms';
  import Flash from '$lib/Flash.svelte';
  import { tgl } from '$lib/utils.js';
  let { data, form } = $props();
</script>
<div class="row"><h1>Notifikasi</h1><form method="POST" action="?/readAll" use:enhance><button class="btn s alt">Tandai semua dibaca</button></form></div>
<Flash {form} />
{#each data.items as n (n.id)}
  <div class="card" style="margin-bottom:10px;{n.is_read ? 'opacity:.7' : 'border-color:var(--g3)'}">
    <div class="row"><b>{n.title}</b><span class="sm muted">{tgl(n.created_at)}</span></div>
    {#if n.body}<div class="muted">{n.body}</div>{/if}{#if n.link}<a class="sm" href={n.link}>Buka →</a>{/if}
  </div>
{:else}<div class="empty">Belum ada notifikasi.</div>{/each}
