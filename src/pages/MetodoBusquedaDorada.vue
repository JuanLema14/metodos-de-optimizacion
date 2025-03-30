<template>
  <q-page padding>
    <q-card class="shadowBox q-ma-sm" style="border-radius: 10px">
      <q-card-section>
        <MathEditor v-model="expresionMatematica" @update:modelValue="autoDetectLimits" />
      </q-card-section>
    </q-card>

    <q-card class="shadowBox q-ma-sm q-mt-md" style="border-radius: 10px">
      <q-toolbar>
        <q-avatar square>
          <q-icon name="fas fa-calculator" color="secondary" />
        </q-avatar>
        <q-toolbar-title>
          <span class="text-weight-bolder text-secondary"> Búsqueda Dorada </span>
        </q-toolbar-title>
      </q-toolbar>

      <q-card-section>
        <q-input v-model.number="xl" label="Límite inferior (xl)" type="number" outlined class="q-mb-md" />
        <q-input v-model.number="xu" label="Límite superior (xu)" type="number" outlined class="q-mb-md" />
        <q-input v-model.number="tolerance" label="Tolerancia" type="number" outlined class="q-mb-md" />
        <q-toggle v-model="isMinimization" label="Buscar mínimo" class="q-mb-md" />
        <q-btn label="Calcular" color="primary" @click="executeGoldenSearch" class="full-width" />
        <q-btn label="Exportar Resultados" color="secondary" @click="exportResults" class="full-width q-mt-md" />
      </q-card-section>
    </q-card>

    <q-card v-if="results.length" class="shadowBox q-ma-sm q-mt-md" style="border-radius: 10px">
      <q-card-section>
        <q-table :rows="results" :columns="columns" row-key="iteration" bordered dense />
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
import { evaluate, derivative } from "mathjs";
import { exportFile } from "quasar";

const MathEditor = defineAsyncComponent(() => import("../components/gestion-calculadora/MathEditor.vue"));
const PlotlyChart = defineAsyncComponent(() => import("../components/PlotlyChart.vue"));

const expresionMatematica = ref("2*sin(x)-(x^2/10)");
const xl = ref(0.0);
const xu = ref(4.0);
const tolerance = ref(0.0001);
const results = ref([]);
const isMinimization = ref(true);
const goldenRatio = 0.618;
const maxIterations = 100;

const columns = [
  { name: "iteration", label: "Iteración", field: "iteration", align: "center" },
  { name: "xl", label: "xl", field: "xl", align: "center" },
  { name: "xu", label: "xu", field: "xu", align: "center" },
  { name: "x1", label: "x1", field: "x1", align: "center" },
  { name: "x2", label: "x2", field: "x2", align: "center" },
  { name: "fx1", label: "f(x1)", field: "fx1", align: "center" },
  { name: "fx2", label: "f(x2)", field: "fx2", align: "center" },
  { name: "error", label: "Error", field: "error", align: "center" },
  { name: "evaluation", label: "Evaluación", field: "evaluation", align: "center" },
];

const f = (x) => {
  if (!expresionMatematica.value.trim()) return NaN;
  try {
    return evaluate(expresionMatematica.value.replace(/X/g, "x"), { x });
  } catch (error) {
    console.error("Error al evaluar la función:", error);
    return NaN;
  }
};

const autoDetectLimits = () => {
  if (!expresionMatematica.value.trim()) return;

  try {
    const derivativeExpr = derivative(expresionMatematica.value, "x").toString();
    const criticalPoints = [];

    for (let x = -10; x <= 10; x += 0.5) {
      const df = evaluate(derivativeExpr, { x });
      const dfNext = evaluate(derivativeExpr, { x: x + 0.5 });

      if (df * dfNext < 0) {
        criticalPoints.push(x);
      }
    }

    if (criticalPoints.length > 1) {
      xl.value = Math.min(...criticalPoints) - 1;
      xu.value = Math.max(...criticalPoints) + 1;
    } else {
      xl.value = -10;
      xu.value = 10;
    }
  } catch (error) {
    console.error("Error al calcular los límites:", error);
    xl.value = -10;
    xu.value = 10;
  }
};

const graphData = computed(() => {
  return [
    {
      x: Array.from({ length: results.value.length }, (_, i) => i),
      y: results.value.map((row) => Math.abs(row.xu - row.xl)),
      mode: "lines+markers",
      type: "scatter",
      name: "Reducción del intervalo",
      line: { shape: "spline", smoothing: 1.3 },
      marker: { color: "gold", size: 6 },
    },
  ];
});

const executeGoldenSearch = () => {
  if (!expresionMatematica.value.trim() || xl.value === null || xu.value === null) {
    alert("Ingrese una función válida y los valores del intervalo.");
    return;
  }

  if (xl.value >= xu.value) {
    alert("El límite inferior debe ser menor que el límite superior.");
    return;
  }

  let xl_k = parseFloat(xl.value);
  let xu_k = parseFloat(xu.value);
  let d = goldenRatio * (xu_k - xl_k);
  let x1_k = xl_k + d;
  let x2_k = xu_k - d;
  let f_x1 = f(x1_k);
  let f_x2 = f(x2_k);
  let iteration = 0;
  let error = Math.abs(xu_k - xl_k);

  if (isNaN(f_x1) || isNaN(f_x2)) {
    alert("Error al evaluar la función en los puntos iniciales. Revise la función.");
    return;
  }

  results.value = [];

  while (error > tolerance.value && iteration < maxIterations) {
    const evaluation = (isMinimization.value && f_x1 < f_x2) || (!isMinimization.value && f_x1 > f_x2)
      ? "F(X1) mejor"
      : "F(X2) mejor";

    results.value.push({
      iteration: iteration + 1,
      xl: xl_k,
      xu: xu_k,
      x1: x1_k,
      x2: x2_k,
      fx1: f_x1,
      fx2: f_x2,
      error: error,
      evaluation: evaluation
    });

    if ((isMinimization.value && f_x1 < f_x2) || (!isMinimization.value && f_x1 > f_x2)) {
      xu_k = x2_k;
      x2_k = x1_k;
      f_x2 = f_x1;
      d = goldenRatio * (xu_k - xl_k);
      x1_k = xl_k + d;
      f_x1 = f(x1_k);
    } else {
      xl_k = x1_k;
      x1_k = x2_k;
      f_x1 = f_x2;
      d = goldenRatio * (xu_k - xl_k);
      x2_k = xu_k - d;
      f_x2 = f(x2_k);
    }

    error = Math.abs(xu_k - xl_k);
    iteration++;
  }

  results.value.push({
    iteration: iteration + 1,
    xl: xl_k,
    xu: xu_k,
    x1: x1_k,
    x2: x2_k,
    fx1: f_x1,
    fx2: f_x2,
    error: error,
    evaluation: "Final"
  });
};

const exportResults = () => {
  const headers = columns.map(col => col.label).join(";");
  const content = results.value.map(row =>
    columns.map(col => row[col.name]).join(";")
  ).join("\n");
  const csv = `${headers}\n${content}`;
  exportFile("busqueda_dorada_resultados.csv", csv, "text/csv");
};
</script>
