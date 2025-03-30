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
          <q-icon name="fas fa-dice" color="secondary" />
        </q-avatar>
        <q-toolbar-title>
          <span class="text-weight-bolder text-secondary">Método de Búsqueda Aleatoria</span>
        </q-toolbar-title>
      </q-toolbar>

      <q-card-section>
        <q-input v-model.number="lowerBound" label="Límite inferior" type="number" outlined class="q-mb-md" />
        <q-input v-model.number="upperBound" label="Límite superior" type="number" outlined class="q-mb-md" />
        <q-input v-model.number="sampleSize" label="Número de puntos" type="number" outlined class="q-mb-md"
          hint="Cantidad de puntos aleatorios a evaluar" />
        <q-toggle v-model="isMinimization" label="Buscar mínimo" class="q-mb-md" />
        <q-btn label="Calcular" color="primary" @click="executeRandomSearch" class="full-width" />
        <q-btn label="Exportar Resultados" color="secondary" @click="exportResults" class="full-width q-mt-md" />
      </q-card-section>
    </q-card>

    <q-card v-if="results.length" class="shadowBox q-ma-sm q-mt-md" style="border-radius: 10px">
      <q-card-section>
        <div class="text-h6">Mejor solución encontrada:</div>
        <div class="text-subtitle1">x = {{ bestSolution.x.toFixed(6) }}, f(x) = {{ bestSolution.fx.toFixed(6) }}</div>
      </q-card-section>
    </q-card>

    <q-card v-if="results.length" class="shadowBox q-ma-sm q-mt-md" style="border-radius: 10px">
      <q-card-section>
        <q-table :rows="results" :columns="columns" row-key="index" bordered dense />
      </q-card-section>
    </q-card>

    <q-card v-if="results.length" class="shadowBox q-ma-sm q-mt-md" style="border-radius: 10px">
      <q-card-section>
        <PlotlyChart :data="graphData" />
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { defineAsyncComponent, ref, computed } from "vue";
import { evaluate } from "mathjs";
import { exportFile } from "quasar";

const MathEditor = defineAsyncComponent(() => import('../components/gestion-calculadora/MathEditor.vue'));
const PlotlyChart = defineAsyncComponent(() => import('../components/PlotlyChart.vue'));

const expresionMatematica = ref('x^2 - 4*cos(x)');
const lowerBound = ref(-5);
const upperBound = ref(5);
const sampleSize = ref(50);
const isMinimization = ref(true);
const results = ref([]);
const bestSolution = ref({ x: null, fx: null });

const columns = [
  { name: 'index', label: 'Iteración', field: 'index', align: 'center' },
  { name: 'x', label: 'x', field: 'x', align: 'center' },
  { name: 'fx', label: 'f(x)', field: 'fx', align: 'center' },
  { name: 'isBest', label: '¿Mejor?', field: 'isBest', align: 'center' }
];

const f = (x) => {
  if (!expresionMatematica.value.trim()) return NaN;
  try {
    return evaluate(expresionMatematica.value, { x });
  } catch (error) {
    console.error("Error al evaluar la función:", error);
    return NaN;
  }
};

const executeRandomSearch = () => {
  if (!expresionMatematica.value.trim() || lowerBound.value === null || upperBound.value === null) {
    alert("Ingrese una función válida y los límites del intervalo.");
    return;
  }

  if (lowerBound.value >= upperBound.value) {
    alert("El límite inferior debe ser menor que el límite superior.");
    return;
  }

  results.value = [];
  let currentBest = { x: null, fx: isMinimization.value ? Infinity : -Infinity };

  for (let i = 0; i < sampleSize.value; i++) {
    const x = lowerBound.value + Math.random() * (upperBound.value - lowerBound.value);
    const fx = f(x);

    if (isNaN(fx)) continue;

    const isBetter = isMinimization.value
      ? fx < currentBest.fx
      : fx > currentBest.fx;

    if (isBetter) {
      currentBest = { x, fx };
    }

    results.value.push({
      index: i + 1,
      x,
      fx,
      isBest: isBetter ? '⭐' : ''
    });
  }

  bestSolution.value = currentBest;
};

const graphData = computed(() => {
  if (!results.value.length) return [];

  const xValues = [];
  const yValues = [];
  const step = (upperBound.value - lowerBound.value) / 100;

  for (let x = lowerBound.value; x <= upperBound.value; x += step) {
    xValues.push(x);
    try {
      yValues.push(f(x));
    } catch {
      yValues.push(null);
    }
  }

  return [
    {
      x: xValues,
      y: yValues,
      mode: "lines",
      type: "scatter",
      name: "Función",
      line: { color: "blue", width: 2 },
    },
    {
      x: results.value.map(row => row.x),
      y: results.value.map(row => row.fx),
      mode: "markers",
      type: "scatter",
      name: "Puntos evaluados",
      marker: {
        color: results.value.map(row => row.isBest ? 'red' : 'gray'),
        size: 8
      },
    },
    {
      x: [bestSolution.value.x],
      y: [bestSolution.value.fx],
      mode: "markers",
      type: "scatter",
      name: "Mejor solución",
      marker: { color: "green", size: 12 },
    }
  ];
});

const exportResults = () => {
  const headers = ['Iteración', 'x', 'f(x)', '¿Mejor?'];
  const content = results.value.map(row =>
    [row.index, row.x, row.fx, row.isBest].join(";")
  ).join('\n');

  const csv = `${headers.join(";")}\n${content}`;
  exportFile("busqueda_aleatoria_resultados.csv", csv, "text/csv");
};
</script>
