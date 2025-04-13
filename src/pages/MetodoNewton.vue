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
        <q-btn label="Exportar Resultados" color="secondary" @click="exportResults" class="full-width q-mt-md" />
      </q-card-section>
    </q-card>

    <q-card v-if="iterations.length" class="shadowBox q-ma-sm q-mt-md" style="border-radius: 10px">
      <q-card-section>
        <q-table :rows="iterations" :columns="columns" row-key="index" bordered dense />
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
import { exportFile } from "quasar";

const MathEditor = defineAsyncComponent(() => import("../components/gestion-calculadora/MathEditor.vue"));
const PlotlyChart = defineAsyncComponent(() => import("../components/PlotlyChart.vue"));

const expresionMatematica = ref("2*sin(x)-(x^2/10)");
const initialX = ref(0);
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
    let fx, dfx, ddfx;
    try {
      fx = evaluate(expresionMatematica.value, { x });
      dfx = evaluate(derivative(expresionMatematica.value, "x").toString(), { x });
      ddfx = isOptimization.value
        ? evaluate(derivative(derivative(expresionMatematica.value, "x"), "x").toString(), { x })
        : null;
    } catch (error) {
      alert(`Error en iteración ${i + 1}: ${error.message}`);
      break;
    }

    iterations.value.push({
      index: i + 1,
      x,
      fx,
      dfx,
      ddfx: isOptimization.value ? ddfx : null
    });

    if (!isOptimization.value && Math.abs(dfx) < 1e-10) {
      alert(`Derivada muy cercana a cero en la iteración ${i + 1}. El método puede divergir.`);
      break;
    }

    if (isOptimization.value && Math.abs(ddfx) < 1e-10) {
      alert(`Segunda derivada muy cercana a cero en la iteración ${i + 1}. El método puede divergir.`);
      break;
    }

    let nextX;
    if (isOptimization.value) {
      nextX = x - dfx / ddfx;
    } else {
      nextX = x - fx / dfx;
    }

    if (Math.abs(nextX - x) < tolerance) break;
    x = nextX;
  }
};

const graphData = computed(() => {
  if (!iterations.value.length) return [];

  const xValues = [];
  const yValues = [];
  const xRange = getFunctionRange();

  for (let x = xRange.min; x <= xRange.max; x += (xRange.max - xRange.min) / 100) {
    xValues.push(x);
    try {
      yValues.push(evaluate(expresionMatematica.value, { x }));
    } catch {
      yValues.push(null);
    }
  }

  const tangentLines = iterations.value.slice(0, 3).map((iter, idx) => {
    const x0 = iter.x;
    const y0 = iter.fx;
    const m = iter.dfx;
    const x1 = x0 + 0.5;
    const x2 = x0 - 0.5;
    return {
      x: [x2, x1],
      y: [y0 - m * (x0 - x2), y0 + m * (x1 - x0)],
      mode: "lines",
      type: "scatter",
      name: `Tangente ${idx + 1}`,
      line: { color: ["red", "green", "purple"][idx], width: 1, dash: "dash" },
      hoverinfo: "none"
    };
  });

  return [
    {
      x: xValues,
      y: yValues,
      mode: "lines",
      type: "scatter",
      name: "Función",
      line: { color: "blue", width: 2 },
    },
    ...tangentLines,
    {
      x: iterations.value.map((row) => row.x),
      y: iterations.value.map((row) => row.fx),
      mode: "markers+lines",
      type: "scatter",
      name: "Iteraciones",
      line: { color: "orange", width: 1 },
      marker: { color: "red", size: 8 },
    },
    {
      x: [iterations.value[iterations.value.length - 1]?.x],
      y: [iterations.value[iterations.value.length - 1]?.fx],
      mode: "markers",
      type: "scatter",
      name: "Solución",
      marker: { color: "green", size: 12 },
    }
  ];
});

const getFunctionRange = () => {
  if (!iterations.value.length) return { min: -5, max: 5 };

  const xs = iterations.value.map(row => row.x);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);

  return {
    min: minX - 2,
    max: maxX + 2
  };
};

const exportResults = () => {
  const headers = ['Iteración', 'X', 'f(X)', "f'(X)", isOptimization.value ? "f''(X)" : null].filter(Boolean);
  const content = iterations.value.map(row =>
    [row.index, row.x, row.fx, row.dfx, isOptimization.value ? row.ddfx : null]
      .filter(value => value !== null)
      .join(";")
  ).join('\n');

  const csv = `${headers.join(";")}\n${content}`;
  exportFile("metodo_newton_resultados.csv", csv, "text/csv");
};

</script>
