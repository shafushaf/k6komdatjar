<script>
  import { onMount } from 'svelte';
  let { type = 'bar', labels = [], datasets = [] } = $props();
  let canvas;
  onMount(() => {
    let chart;
    (async () => {
      const { Chart, registerables } = await import('chart.js');
      Chart.register(...registerables);
      chart = new Chart(canvas, { type, data: { labels, datasets }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: datasets.length > 1 } } } });
    })();
    return () => chart?.destroy();
  });
</script>
<div class="chartbox"><canvas bind:this={canvas}></canvas></div>
