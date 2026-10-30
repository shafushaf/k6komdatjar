<script>
  let { form } = $props();
</script>
{#if form?.error}<div class="alert err" role="alert">{form.error}</div>{/if}
{#if form?.ok}<div class="alert ok" role="status">{form.ok}</div>{/if}
