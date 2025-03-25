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
          <q-icon name="fas fa-chart-line" color="secondary" />
        </q-avatar>
        <q-toolbar-title>
          <span class="text-weight-bolder text-secondary">
            Método de Interpolación Cuadrática
          </span>
        </q-toolbar-title>
      </q-toolbar>

      <q-card-section>
        <q-input v-model.number="x0" label="X0" type="number" outlined class="q-mb-md" />
        <q-input v-model.number="x1" label="X1" type="number" outlined class="q-mb-md" />
        <q-input v-model.number="x2" label="X2" type="number" outlined class="q-mb-md" />
        <q-input v-model.number="tolerance" label="Tolerancia" type="number" outlined class="q-mb-md" />
        <q-btn label="Calcular" color="primary" @click="calculateQuadraticInterpolation" class="full-width" />
      </q-card-section>
    </q-card>

    <q-card class="shadowBox q-ma-sm q-mt-md" style="border-radius: 10px" v-if="iterations.length">
      <q-card-section>
        <q-table flat bordered :rows="iterations" :columns="columns" row-key="iteration" />
      </q-card-section>
    </q-card>

    <q-card v-if="iterations.length" class="shadowBox q-ma-sm q-mt-md" style="border-radius: 10px">
      <q-card-section>
        <p class="text-h6">Máximo estimado en x₃: {{ x3 ? x3.toFixed(4) : 'No encontrado' }}</p>
        <PlotlyChart :data="graphData" />
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { defineAsyncComponent, ref, computed } from "vue";
import { evaluate } from "mathjs";

const MathEditor = defineAsyncComponent(() => import("../components/gestion-calculadora/MathEditor.vue"));
const PlotlyChart = defineAsyncComponent(() => import("../components/PlotlyChart.vue"));

const expresionMatematica = ref("");
const x0 = ref(null);
const x1 = ref(null);
const x2 = ref(null);
const x3 = ref(null);
const tolerance = ref(0.0001);
const iterations = ref([]);

const calculateQuadraticInterpolation = () => {
  if (x0.value === null || x1.value === null || x2.value === null || !expresionMatematica.value.trim()) {
    alert("Ingresa los valores de X y la función");
    return;
  }

  iterations.value = [];
  x3.value = null;

  try {
    const f = (x) => evaluate(expresionMatematica.value.replace(/X/g, "x"), { x });

    let iterCount = 1;
    let error = 1;
    let prevX3 = null;

    while (error > tolerance.value) {
      const f0 = f(x0.value);
      const f1 = f(x1.value);
      const f2 = f(x2.value);

      const numerator =
        f0 * (x1.value ** 2 - x2.value ** 2) +
        f1 * (x2.value ** 2 - x0.value ** 2) +
        f2 * (x0.value ** 2 - x1.value ** 2);

      const denominator =
        2 * (f0 * (x1.value - x2.value) + f1 * (x2.value - x0.value) + f2 * (x0.value - x1.value));

      if (denominator === 0) {
        alert("División por cero. Verifica los valores ingresados.");
        return;
      }

      x3.value = numerator / denominator;
      error = prevX3 ? Math.abs((x3.value - prevX3) / x3.value) : 1;
      prevX3 = x3.value;

      const f3 = f(x3.value);

      iterations.value.push({
        iteration: iterCount,
        x0: x0.value.toFixed(4),
        f_x0: f0,
        x1: x1.value.toFixed(4),
        f_x1: f1,
        x2: x2.value.toFixed(4),
        f_x2: f2,
        x3: x3.value.toFixed(4),
        f_x3: f3,
        error: error.toExponential(4)
      });

      x0.value = x1.value;
      x1.value = x2.value;
      x2.value = x3.value;

      iterCount++;
      if (iterCount > 50) {
        alert("El método no converge después de 50 iteraciones.");
        break;
      }
    }
  } catch (error) {
    alert("Error al evaluar la función: " + error.message);
  }
};

const columns = [
  { name: "iteration", label: "Iteración", field: "iteration", align: "center" },
  { name: "x0", label: "X0", field: "x0", align: "center" },
  { name: "f_x0", label: "f(x0)", field: "f_x0", align: "center" },
  { name: "x1", label: "X1", field: "x1", align: "center" },
  { name: "f_x1", label: "f(x1)", field: "f_x1", align: "center" },
  { name: "x2", label: "X2", field: "x2", align: "center" },
  { name: "f_x2", label: "f(x2)", field: "f_x2", align: "center" },
  { name: "x3", label: "X3", field: "x3", align: "center" },
  { name: "f_x3", label: "f(x3)", field: "f_x3", align: "center" },
  { name: "error", label: "Error", field: "error", align: "center" }
];

const graphData = computed(() => {
  if (!x3.value || iterations.value.length === 0) return [];

  const f = (x) => evaluate(expresionMatematica.value.replace(/X/g, "x"), { x });

  // Definir un rango de valores para graficar la función
  const xValues = [];
  const yValues = [];
  const xMin = Math.min(...iterations.value.map((it) => parseFloat(it.x0))) - 1;
  const xMax = Math.max(...iterations.value.map((it) => parseFloat(it.x3))) + 1;

  for (let x = xMin; x <= xMax; x += 0.1) {
    xValues.push(x);
    yValues.push(f(x));
  }

  // Capturar la trayectoria de X3 en cada iteración
  const xTrajectory = iterations.value.map((it) => parseFloat(it.x3));
  const yTrajectory = xTrajectory.map((x) => f(x));

  return [
    {
      x: xValues,
      y: yValues,
      mode: "lines",
      type: "scatter",
      name: "Función f(x)",
      line: { color: "gray", width: 2 }
    },
    {
      x: xTrajectory,
      y: yTrajectory,
      mode: "lines+markers",
      type: "scatter",
      name: "Trayectoria de X3",
      line: { color: "green", dash: "dashdot", width: 2 },
      marker: { color: "green", size: 8 }
    },
    {
      x: [x0.value, x1.value, x2.value],
      y: [f(x0.value), f(x1.value), f(x2.value)],
      mode: "markers",
      type: "scatter",
      name: "Puntos Iniciales",
      marker: { color: "blue", size: 8 }
    },
    {
      x: [x3.value],
      y: [f(x3.value)],
      mode: "markers",
      type: "scatter",
      name: "Máximo Estimado",
      marker: { color: "red", size: 10, symbol: "diamond" }
    }
  ];
});
</script>
