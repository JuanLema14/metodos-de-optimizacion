<template>
  <div ref="chartContainer" class="plotly-chart"></div>
</template>

<script setup>
import { watch, ref, onMounted } from "vue";
import Plotly from "plotly.js-dist";

const props = defineProps({ data: Array });
const chartContainer = ref(null);

const renderChart = () => {
  if (!chartContainer.value || !props.data?.length) return;

  Plotly.newPlot(chartContainer.value, props.data, {
    title: "Convergencia del Método de Bisección",
    xaxis: { title: "Iteraciones" },
    yaxis: { title: "Error absoluto" },
    showlegend: true,
    margin: { t: 40, l: 60, r: 10, b: 50 },
  });
};

onMounted(renderChart);
watch(() => props.data, renderChart, { deep: true });
</script>


<style scoped>
.plotly-chart {
  width: 100%;
  height: 400px;
}
</style>
