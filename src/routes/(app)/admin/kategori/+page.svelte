<script>
  import { enhance } from '$app/forms';
  import Flash from '$lib/Flash.svelte';
  import Act from '$lib/Act.svelte';
  let { data, form } = $props();
</script>
<h1>Kategori produk</h1><Flash {form} />
<form method="POST" action="?/add" use:enhance class="inline" style="margin-bottom:16px"><input name="name" placeholder="Nama kategori baru" required style="width:260px;max-width:none" /><button class="btn">Tambah</button></form>
<div class="card tbl"><table><thead><tr><th>#</th><th>Nama</th><th></th></tr></thead><tbody>
  {#each data.cats as c (c.id)}<tr><td>{c.id}</td><td>{c.name}</td><td><Act action="remove" id={c.id} label="Hapus" cls="btn s danger" ask="Hapus kategori ini?" /></td></tr>{/each}</tbody></table></div>
