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
        <q-toggle v-model="isMinimization" label="Buscar mínimo" class="q-mb-md" />
        <q-btn label="Calcular" color="primary" @click="calculateQuadraticInterpolation" class="full-width" />
        <q-btn label="Exportar Resultados" color="secondary" @click="exportResults" class="full-width q-mt-md" />
      </q-card-section>
    </q-card>

    <q-card class="shadowBox q-ma-sm q-mt-md" style="border-radius: 10px" v-if="iterations.length">
      <q-card-section>
        <q-table flat bordered :rows="iterations" :columns="columns" row-key="iteration" />
      </q-card-section>
    </q-card>

    <q-card v-if="iterations.length" class="shadowBox q-ma-sm q-mt-md" style="border-radius: 10px">
      <q-card-section>
        <p class="text-h6">{{ isMinimization ? 'Mínimo' : 'Máximo' }} estimado en x₃: {{ x3 ? x3.toFixed(4) : 'No encontrado' }}</p>
        <PlotlyChart :data="graphData" />
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { defineAsyncComponent, ref, computed } from "vue";
import { evaluate } from "mathjs";
import { exportFile } from "quasar";

const MathEditor = defineAsyncComponent(() => import("../components/gestion-calculadora/MathEditor.vue"));
const PlotlyChart = defineAsyncComponent(() => import("../components/PlotlyChart.vue"));

const expresionMatematica = ref("x^2 - 4*cos(x)");
const x0 = ref(1);
const x1 = ref(2);
const x2 = ref(3);
const x3 = ref(null);
const tolerance = ref(0.0001);
const isMinimization = ref(true);
const iterations = ref([]);

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
  { name: "error", label: "Error", field: "error", align: "center" },
  { name: "type", label: "Tipo", field: "type", align: "center" }
];

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


      const denom = (x0.value - x1.value) * (x0.value - x2.value) * (x1.value - x2.value);
      if (Math.abs(denom) < 1e-10) {
        alert("Puntos demasiado cercanos. El denominador es casi cero.");
        return;
      }

      const a = (x2.value*(f1 - f0) + x1.value*(f0 - f2) + x0.value*(f2 - f1)) / denom;
      const b = (x2.value*x2.value*(f0 - f1) + x1.value*x1.value*(f2 - f0) + x0.value*x0.value*(f1 - f2)) / denom;
      const c = (x1.value*x2.value*(x1.value - x2.value)*f0 + x2.value*x0.value*(x2.value - x0.value)*f1 + x0.value*x1.value*(x0.value - x1.value)*f2) / denom;

      if (Math.abs(a) < 1e-10) {
        alert("El polinomio resultante no es cuadrático (a ≈ 0).");
        return;
      }


      x3.value = -b / (2 * a);
      const f3 = f(x3.value);

      error = prevX3 ? Math.abs((x3.value - prevX3) / x3.value) : 1;
      prevX3 = x3.value;


      const extremumType = a > 0 ? "Mínimo" : "Máximo";

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
        error: error.toExponential(4),
        type: extremumType
      });


      if (isMinimization.value) {

        const points = [
          {x: x0.value, fx: f0},
          {x: x1.value, fx: f1},
          {x: x2.value, fx: f2},
          {x: x3.value, fx: f3}
        ];


        points.sort((a, b) => a.fx - b.fx);
        x0.value = points[0].x;
        x1.value = points[1].x;
        x2.value = points[2].x;
      } else {

        const points = [
          {x: x0.value, fx: f0},
          {x: x1.value, fx: f1},
          {x: x2.value, fx: f2},
          {x: x3.value, fx: f3}
        ];


        points.sort((a, b) => b.fx - a.fx);
        x0.value = points[0].x;
        x1.value = points[1].x;
        x2.value = points[2].x;
      }

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

const graphData = computed(() => {
  if (!x3.value || iterations.value.length === 0) return [];

  const f = (x) => evaluate(expresionMatematica.value.replace(/X/g, "x"), { x });

  const xValues = [];
  const yValues = [];
  const xMin = Math.min(...iterations.value.map((it) => parseFloat(it.x0))) - 1;
  const xMax = Math.max(...iterations.value.map((it) => parseFloat(it.x3))) + 1;

  for (let x = xMin; x <= xMax; x += 0.1) {
    xValues.push(x);
    yValues.push(f(x));
  }

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
      name: isMinimization.value ? "Mínimo Estimado" : "Máximo Estimado",
      marker: {
        color: isMinimization.value ? "red" : "purple",
        size: 10,
        symbol: "diamond"
      }
    }
  ];
});

const exportResults = () => {
  if (!iterations.value.length) {
    alert("No hay resultados para exportar.");
    return;
  }

  const headers = [
    "Iteración",
    "X0",
    "f(X0)",
    "X1",
    "f(X1)",
    "X2",
    "f(X2)",
    "X3",
    "f(X3)",
    "Error",
    "Tipo de extremo"
  ];

  const content = iterations.value
    .map((row) =>
      [
        row.iteration,
        row.x0,
        row.f_x0.toFixed(6),
        row.x1,
        row.f_x1.toFixed(6),
        row.x2,
        row.f_x2.toFixed(6),
        row.x3,
        row.f_x3.toFixed(6),
        row.error,
        row.type
      ].join(";")
    )
    .join("\n");

  const csv = `${headers.join(";")}\n${content}`;
  exportFile("interpolacion_cuadratica_resultados.csv", csv, "text/csv");
};
</script>
