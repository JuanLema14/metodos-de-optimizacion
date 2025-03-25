<template>
  <q-page padding>
    <q-card class="shadowBox q-ma-sm" style="border-radius: 10px">
      <q-card-section>
        <MathEditor v-model="expresionMatematica" />
      </q-card-section>
    </q-card>

    <q-card class="shadowBox q-ma-sm q-mt-md" style="border-radius: 10px">
      <q-toolbar>
        <q-avatar square>
          <q-icon name="fas fa-calculator" color="secondary" />
        </q-avatar>
        <q-toolbar-title>
          <span class="text-weight-bolder text-secondary"> Método de Newton </span>
        </q-toolbar-title>
      </q-toolbar>

      <q-card-section>
        <q-input v-model="initialX" label="Valor inicial de X" type="number" outlined class="q-mb-md" />
        <q-toggle v-model="isOptimization" label="Optimización (mínimos/máximos)" class="q-mb-md" />
        <q-btn label="Calcular" color="primary" @click="executeNewtonMethod" class="full-width" />
      </q-card-section>
    </q-card>

    <q-card v-if="iterations.length" class="shadowBox q-ma-sm q-mt-md" style="border-radius: 10px">
      <q-card-section>
        <q-table :rows="iterations" :columns="columns" row-key="index" bordered hide-pagination dense />
      </q-card-section>
    </q-card>

    <q-card v-if="iterations.length" class="shadowBox q-ma-sm q-mt-md" style="border-radius: 10px">
      <q-card-section>
        <PlotlyChart :data="graphData" />
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { defineAsyncComponent, ref, computed } from "vue";
import { evaluate, derivative } from "mathjs";

const MathEditor = defineAsyncComponent(() => import("../components/gestion-calculadora/MathEditor.vue"));
const PlotlyChart = defineAsyncComponent(() => import("../components/PlotlyChart.vue"));

const expresionMatematica = ref("");
const initialX = ref(null);
const isOptimization = ref(false);
const iterations = ref([]);
const maxIterations = 50;
const tolerance = 1e-6;

const columns = [
  { name: "index", label: "Iteración", field: "index", align: "center" },
  { name: "x", label: "X", field: "x", align: "center" },
  { name: "fx", label: "f(X)", field: "fx", align: "center" },
  { name: "dfx", label: "f'(X)", field: "dfx", align: "center" },
  { name: "ddfx", label: "f''(X)", field: "ddfx", align: "center" },
];

const executeNewtonMethod = () => {
  if (!expresionMatematica.value.trim() || initialX.value === null) {
    alert("Debe ingresar una función y un valor inicial de X.");
    return;
  }

  let x = parseFloat(initialX.value);
  iterations.value = [];

  for (let i = 0; i < maxIterations; i++) {
    let fx = evaluate(expresionMatematica.value, { x });
    let dfx = evaluate(derivative(expresionMatematica.value, "x").toString(), { x });
    let ddfx = evaluate(derivative(derivative(expresionMatematica.value, "x"), "x").toString(), { x });

    iterations.value.push({ index: i + 1, x, fx, dfx, ddfx });

    let nextX = isOptimization.value ? x - dfx / ddfx : x - fx / dfx;

    if (Math.abs(nextX - x) < tolerance) break;
    x = nextX;
  }
};

const graphData = computed(() => {
  return [
    {
      x: iterations.value.map((row) => row.x),
      y: iterations.value.map((row) => row.fx),
      mode: "markers+lines",
      type: "scatter",
      name: "Newton",
      line: { shape: "spline", smoothing: 1.3 },
      marker: { color: "blue", size: 6 },
    },
  ];
});
</script>
