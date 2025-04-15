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
        <div class="text-subtitle1">
          x = {{ bestSolution.x?.toFixed(6) }},
          <span v-if="bestSolution.y !== null">y = {{ bestSolution.y?.toFixed(6) }},</span>
          f(x{{ bestSolution.y !== null ? ', y' : '' }}) = {{ bestSolution.fx?.toFixed(6) }}
        </div>
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
const lowerBound = ref(-2);
const upperBound = ref(2);
const sampleSize = ref(100);
const isMinimization = ref(false);
const results = ref([]);
const bestSolution = ref({ x: null, y: null, fx: null });

const columns = [
  { name: 'index', label: 'Iteración', field: 'index', align: 'center' },
  { name: 'x', label: 'x', field: 'x', align: 'center' },
  { name: 'y', label: 'y', field: 'y', align: 'center' },
  { name: 'fx', label: 'f(x, y)', field: 'fx', align: 'center' },
  { name: 'isBest', label: '¿Mejor?', field: 'isBest', align: 'center' }
];

const f = (x, y = 0) => {
  if (!expresionMatematica.value.trim()) return NaN;
  try {
    let variables = {};
    if (expresionMatematica.value.includes("x")) variables.x = x;
    if (expresionMatematica.value.includes("y")) variables.y = y;
    return evaluate(expresionMatematica.value, variables);
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

  const usesY = expresionMatematica.value.includes("y");
  results.value = [];
  let currentBest = { x: null, y: null, fx: isMinimization.value ? Infinity : -Infinity };

  for (let i = 0; i < sampleSize.value; i++) {
    const x = lowerBound.value + Math.random() * (upperBound.value - lowerBound.value);
    const y = usesY ? lowerBound.value + Math.random() * (upperBound.value - lowerBound.value) : 0;
    const fx = f(x, y);

    if (isNaN(fx)) continue;

    const isBetter = isMinimization.value ? fx < currentBest.fx : fx > currentBest.fx;

    if (isBetter) {
      currentBest = { x, y, fx };
    }

    results.value.push({
      index: i + 1,
      x,
      y: usesY ? y : null,
      fx,
      isBest: isBetter ? '⭐' : ''
    });
  }

  bestSolution.value = currentBest;
};

const graphData = computed(() => {
  if (!results.value.length) return [];

  const usesY = expresionMatematica.value.includes("y");

  if (!usesY) {
    const xValues = [];
    const yValues = [];
    const step = (upperBound.value - lowerBound.value) / 100;

    for (let x = lowerBound.value; x <= upperBound.value; x += step) {
      xValues.push(x);
      yValues.push(f(x));
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
        x: results.value.map(r => r.x),
        y: results.value.map(r => r.fx),
        mode: "markers",
        type: "scatter",
        name: "Puntos evaluados",
        marker: { color: "gray", size: 8 }
      },
      {
        x: [bestSolution.value.x],
        y: [bestSolution.value.fx],
        mode: "markers",
        type: "scatter",
        name: "Mejor solución",
        marker: { color: "green", size: 12 }
      }
    ];
  }

  return [
    {
      x: results.value.map(r => r.x),
      y: results.value.map(r => r.y),
      z: results.value.map(r => r.fx),
      mode: "markers",
      type: "scatter3d",
      name: "Puntos evaluados",
      marker: { size: 4, color: "gray" }
    },
    {
      x: [bestSolution.value.x],
      y: [bestSolution.value.y],
      z: [bestSolution.value.fx],
      mode: "markers",
      type: "scatter3d",
      name: "Mejor solución",
      marker: { size: 8, color: "green" }
    }
  ];
});


const exportResults = () => {
  const headers = ['Iteración', 'x', 'y', 'f(x,y)', '¿Mejor?'];
  const content = results.value.map(row =>
    [row.index, row.x, row.y ?? '', row.fx, row.isBest].join(";")
  ).join('\n');

  const csv = `${headers.join(";")}\n${content}`;
  exportFile("busqueda_aleatoria_resultados.csv", csv, "text/csv");
};
</script>
